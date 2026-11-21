// probe-anchors.mjs — prints where every change anchor projects, per round.
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire('/home/hatch/workspace/shots-tool/package.json');
const puppeteer = require('puppeteer');
const gameRoot = join(fileURLToPath(new URL('.', import.meta.url)), 'game');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const path = join(gameRoot, url.pathname === '/' ? 'index.html' : url.pathname);
  if (!path.startsWith(gameRoot) || !existsSync(path) || !statSync(path).isFile()) { res.writeHead(404).end('nf'); return; }
  res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' });
  res.end(readFileSync(path));
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;
const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));

const IDS = {
  0: ['atlas-title', 'left-lamp', 'globe-land', 'ribbon-side', 'mantel-candle', 'clock-hands', 'portrait-slip', 'lean-book', 'inkwell-cap', 'quill-feather', 'spectacles-stack', 'second-book'],
  1: ['poems-title', 'stack-count', 'candle-burned', 'globe-turned', 'ladder-rolled', 'chair-ribbon', 'clock-weight', 'magnifier-moved', 'page-number', 'book-pulled', 'flame-out', 'tea-drained'],
  2: ['gardens-title', 'sconce-out', 'globe-dark', 'ribbon-tucked', 'embers-dull', 'clock-minutes', 'shade-tipped', 'band-slipped', 'hub-iron', 'page-folded', 'ink-blue', 'pendant-dim'],
};
for (const [round, mode] of [[0, 'start'], [1, 'cover'], [2, 'late']]) {
  await page.goto(`http://localhost:${port}/index.html?shot=${mode}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForFunction(() => typeof window.__oldLibrary !== 'undefined', { timeout: 120000 });
  await new Promise((r) => setTimeout(r, 400));
  const rows = await page.evaluate((ids) => ids.map((id) => {
    const p = window.__oldLibrary.project(id);
    return p ? `${id} ${Math.round(p.x)},${Math.round(p.y)}` : `${id} MISSING`;
  }), IDS[round]);
  console.log(`round ${round + 1}: ${rows.join(' | ')}`);
}
await browser.close();
server.close();
