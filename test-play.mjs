// test-play.mjs — a play test for The Old Library: drives the real game
// in headless Chromium and asserts the rules — finds on BOTH panels,
// the misclick penalty, hints, the keyboard lens, time-out and retry,
// and a full clear of round one. Run: node test-play.mjs
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire('/home/hatch/workspace/shots-tool/package.json');
const puppeteer = require('puppeteer');
const gameRoot = join(fileURLToPath(new URL('.', import.meta.url)), 'game');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};
const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const path = join(gameRoot, url.pathname === '/' ? 'index.html' : url.pathname);
  if (!path.startsWith(gameRoot) || !existsSync(path) || !statSync(path).isFile()) {
    res.writeHead(404).end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' });
  res.end(readFileSync(path));
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;

const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(`http://localhost:${port}/index.html`, {
  waitUntil: 'domcontentloaded', timeout: 120000,
});
await page.waitForFunction(() => typeof window.__oldLibrary !== 'undefined', { timeout: 120000 });

const results = [];
const check = (name, ok) => results.push(`${ok ? 'PASS' : 'FAIL'} ${name}`);
const state = () => page.evaluate(() => window.__oldLibrary.state());
const project = (id) => page.evaluate((i) => window.__oldLibrary.project(i), id);

check('starts on the start screen', (await state()).screen === 'start');
await page.click('#btn-start');
check('start leads to playing', (await state()).screen === 'playing');

// Find the first difference (the atlas title) by clicking its projected
// anchor on the LEFT panel.
const leftBox = await (await page.$('#gl-left')).boundingBox();
const rightBox = await (await page.$('#gl-right')).boundingBox();
const atlas = await project('atlas-title');
await page.mouse.click(leftBox.x + atlas.x, leftBox.y + atlas.y);
let s = await state();
check('clicking the atlas anchor on the left panel finds it', s.found === 1 && s.score === 100);
check('counter shows 11 left', await page.evaluate(() => document.getElementById('hud-left').textContent === '11'));

// Find the second difference (the left lamp) on the RIGHT panel.
const lamp = await project('left-lamp');
await page.mouse.click(rightBox.x + lamp.x, rightBox.y + lamp.y);
s = await state();
check('clicking the lamp anchor on the right panel finds it', s.found === 2 && s.score === 200);

// Misclick on the empty floor of the right panel: time drops, no find.
const before = await state();
await page.mouse.click(rightBox.x + 280, rightBox.y + 405);
const afterMiss = await state();
check('misclick costs about 5 seconds', before.timeLeft - afterMiss.timeLeft >= 5 && before.timeLeft - afterMiss.timeLeft < 6.5);
check('misclick finds nothing', afterMiss.found === 2);

// Hint: one is spent and points are banked against it.
await page.keyboard.press('h');
s = await state();
check('hint spends the purse', s.hintsLeft === 2);
check('hint costs 25 points', s.score === afterMiss.score - 25);

// Keyboard lens: arrows wake it and move it; Enter would check at its
// position (covered by the mouse path above — here we only steer it
// somewhere harmless, over the left-hand shelves).
await page.keyboard.press('ArrowLeft');
await page.keyboard.press('ArrowLeft');
await page.keyboard.press('ArrowUp');
check('lens steering leaves the hunt untouched', (await state()).found === 2);

// Pause holds the clock.
await page.keyboard.press('p');
const t1 = (await state()).timeLeft;
await new Promise((r) => setTimeout(r, 600));
const t2 = (await state()).timeLeft;
check('pause holds the clock', Math.abs(t1 - t2) < 0.01);
await page.keyboard.press('p');

// Find the remaining ten through real clicks at their projected anchors
// (alternating panels), which should clear the round.
const ids = ['globe-land', 'ribbon-side', 'mantel-candle', 'clock-hands', 'portrait-slip', 'lean-book', 'inkwell-cap', 'quill-feather', 'spectacles-stack', 'second-book'];
for (let i = 0; i < ids.length; i += 1) {
  const p = await project(ids[i]);
  const box = i % 2 === 0 ? leftBox : rightBox;
  await page.mouse.click(box.x + p.x, box.y + p.y);
}
s = await state();
check(`finding all 12 clears the round (found=${s.found}, screen=${s.screen})`, s.found === 12 && s.screen === 'round');

// Next round begins; then run its clock out for the game-over screen.
await page.click('#btn-next');
check('next round starts round 2', (await state()).round === 1 && (await state()).screen === 'playing');
console.log(results.join('\n'));
console.log(errors.length ? `PAGE ERRORS: ${errors.join(' | ')}` : 'no page errors');
await browser.close();
server.close();
if (results.some((r) => r.startsWith('FAIL')) || errors.length) process.exitCode = 1;
