// rounds.js — the game itself: rounds, clock, score and screens.
//
// A round builds the library twice (the base state on the left, the
// changed state on the right) and starts the clock. A check compares
// the clicked pixel with every unfound change's projected anchor: a hit
// blooms a ring on both panels and banks 100 points; a miss costs 5
// seconds and flashes a red cross on the panel that was clicked.
// Clearing a round banks twice the seconds left; clearing the Closing
// Bell round wins the game.
//
// The ?shot= modes freeze the game in staged moments for the maker's
// screenshots: cover (Candle Hour, five found, a hint mid-breath),
// late (Closing Bell, eight found, the clock nearly out), start and
// end. They are the real game with the clock stopped, never a composite.

import { lightForRound } from './lighting.js';
import { baseHallState } from './hall-state.js';
import { CHANGES_BY_ROUND, changedStateForRound } from './changes.js';
import { buildHall } from './hall.js';
import { PANEL_H, PANEL_W, createTwinView } from './twin-view.js';
import { drawFoundRings, drawHintBreath, drawLens, drawMissCrosses } from './rings.js';

const ROUND_TIME = [210, 180, 150];
const ROUND_COUNT = 3;
const HINTS_PER_ROUND = 3;
const MISS_PENALTY_SECONDS = 5;
const FIND_POINTS = 100;
const HINT_COST = 25;
const SHOT_NOW = 100000; // the frozen clock of the screenshot modes, ms
const SHOT_T = 2.4; // the frozen animation phase of the screenshot modes, s

export function createRounds(doc, hud, lens) {
  const view = createTwinView(doc.getElementById('gl-left'), doc.getElementById('gl-right'));
  const fxLeft = doc.getElementById('fx-left').getContext('2d');
  const fxRight = doc.getElementById('fx-right').getContext('2d');
  const screens = {
    start: doc.getElementById('screen-start'),
    round: doc.getElementById('screen-round'),
    over: doc.getElementById('screen-over'),
    end: doc.getElementById('screen-end'),
  };
  const overlay = doc.getElementById('overlay');
  const shotKind = new URLSearchParams(window.location.search).get('shot');

  const game = {
    screen: 'start',
    roundIndex: 0,
    score: 0,
    scoreAtRoundStart: 0,
    changes: [],
    foundAt: new Map(),
    misses: [[], []],
    hint: null,
    hintsLeft: HINTS_PER_ROUND,
    timeLeft: ROUND_TIME[0],
    paused: false,
    stats: [],
    roundStats: { found: 0, bonus: 0, hints: 0, misses: 0 },
    leftHall: null,
    rightHall: null,
    startedAt: performance.now(),
  };

  const now = () => (shotKind ? SHOT_NOW : performance.now());
  const animT = () => (shotKind ? SHOT_T : (performance.now() - game.startedAt) / 1000);
  const projected = { x: 0, y: 0, behind: false };

  function showScreen(name) {
    game.screen = name;
    overlay.classList.toggle('hidden', name === 'playing');
    for (const [key, el] of Object.entries(screens)) {
      el.classList.toggle('hidden', key !== name);
    }
  }

  function disposeHalls() {
    if (game.leftHall) game.leftHall.dispose();
    if (game.rightHall) game.rightHall.dispose();
    game.leftHall = null;
    game.rightHall = null;
  }

  function setupRound(index, preset = null) {
    disposeHalls();
    game.roundIndex = index;
    const light = lightForRound(index);
    const base = baseHallState(index);
    game.changes = CHANGES_BY_ROUND[index];
    game.leftHall = buildHall(base, light);
    game.rightHall = buildHall(changedStateForRound(base, index), light);
    view.setExposure(light.exposure);
    game.foundAt = new Map();
    game.misses = [[], []];
    game.hint = null;
    game.hintsLeft = HINTS_PER_ROUND;
    game.timeLeft = ROUND_TIME[index];
    game.paused = false;
    game.scoreAtRoundStart = game.score;
    game.roundStats = { found: 0, bonus: 0, hints: 0, misses: 0 };
    if (preset) applyPreset(preset);
    hud.setRound(light.name, index, ROUND_COUNT);
    hud.setCounts(game.foundAt.size, game.changes.length);
    hud.setTime(game.timeLeft, ROUND_TIME[index]);
    hud.setScore(game.score);
    hud.setHints(game.hintsLeft);
    hud.resetFoundList();
    for (const change of game.changes) {
      if (game.foundAt.has(change.id)) hud.addFound(change.label);
    }
    showScreen('playing');
  }

  // The staged states of the screenshot modes: some changes already
  // found (the freshest still mid-bloom), a set clock, a set score.
  function applyPreset(preset) {
    const at = now();
    preset.foundIds.forEach((id, i) => {
      const fresh = i === preset.foundIds.length - 1;
      game.foundAt.set(id, at - (fresh ? 180 : 4000 + i * 700));
      game.roundStats.found += 1;
    });
    if (preset.timeLeft !== undefined) game.timeLeft = preset.timeLeft;
    if (preset.score !== undefined) {
      game.score = preset.score;
      game.scoreAtRoundStart = preset.score - preset.foundIds.length * FIND_POINTS;
    }
    if (preset.hintsLeft !== undefined) game.hintsLeft = preset.hintsLeft;
    if (preset.hintIndex !== undefined) {
      game.hint = { change: game.changes[preset.hintIndex], startedAt: at - 450, until: at + 100000 };
    }
  }

  function unfound() {
    return game.changes.filter((c) => !game.foundAt.has(c.id));
  }

  function check(side, x, y) {
    if (game.screen !== 'playing' || game.paused || shotKind) return;
    let best = null;
    let bestDist = Infinity;
    for (const change of unfound()) {
      view.project(change.anchor, projected);
      const dist = Math.hypot(projected.x - x, projected.y - y);
      if (dist <= change.r && dist < bestDist) {
        best = change;
        bestDist = dist;
      }
    }
    if (best) {
      game.foundAt.set(best.id, now());
      game.roundStats.found += 1;
      game.score += FIND_POINTS;
      hud.setScore(game.score);
      hud.setCounts(game.foundAt.size, game.changes.length);
      hud.addFound(best.label);
      hud.toast(`Found — ${best.label}.`);
      if (game.hint && game.hint.change === best) game.hint = null;
      if (unfound().length === 0) roundCleared();
    } else {
      game.roundStats.misses += 1;
      game.timeLeft = Math.max(0, game.timeLeft - MISS_PENALTY_SECONDS);
      game.misses[side].push({ x, y, at: now() });
      hud.setTime(game.timeLeft, ROUND_TIME[game.roundIndex]);
      hud.toast(`Not a difference — ${MISS_PENALTY_SECONDS} seconds lost.`);
      const panelsEl = doc.getElementById('panels');
      panelsEl.classList.remove('shake');
      void panelsEl.offsetWidth;
      panelsEl.classList.add('shake');
      if (game.timeLeft <= 0) gameOver();
    }
  }

  function roundCleared() {
    const bonus = Math.ceil(game.timeLeft) * 2;
    game.roundStats.bonus = bonus;
    game.score += bonus;
    game.stats[game.roundIndex] = { ...game.roundStats };
    hud.setScore(game.score);
    if (game.roundIndex === ROUND_COUNT - 1) {
      fillEndScreen();
      showScreen('end');
    } else {
      doc.getElementById('round-stats').textContent =
        `${game.roundStats.found} differences found · time bonus +${bonus} · ${game.roundStats.misses} wrong clicks · ${game.roundStats.hints} hints used`;
      showScreen('round');
    }
  }

  function gameOver() {
    showScreen('over');
  }

  function fillEndScreen() {
    const rows = doc.getElementById('end-rows');
    rows.textContent = '';
    const names = ['Afternoon Reading', 'Candle Hour', 'Closing Bell'];
    game.stats.forEach((s, i) => {
      if (!s) return;
      const tr = doc.createElement('tr');
      const cells = [names[i], `${s.found} found`, `bonus +${s.bonus}`, `${s.misses} wrong`, `${s.hints} hints`];
      for (const text of cells) {
        const td = doc.createElement('td');
        td.textContent = text;
        tr.appendChild(td);
      }
      rows.appendChild(tr);
    });
    doc.getElementById('end-score').textContent = String(game.score);
  }

  function useHint() {
    if (game.screen !== 'playing' || game.paused || shotKind) return;
    const remaining = unfound();
    if (remaining.length === 0) return;
    if (game.hintsLeft <= 0) {
      hud.toast('No hints left this round.');
      return;
    }
    const change = remaining[Math.floor(Math.random() * remaining.length)];
    game.hint = { change, startedAt: now(), until: now() + 1800 };
    game.hintsLeft -= 1;
    game.roundStats.hints += 1;
    game.score = Math.max(0, game.score - HINT_COST);
    hud.setHints(game.hintsLeft);
    hud.setScore(game.score);
    hud.toast('Somewhere in the library, a detail breathes…');
  }

  function togglePause() {
    if (game.screen !== 'playing' || shotKind) return;
    game.paused = !game.paused;
    hud.toast(game.paused ? 'Paused — the library holds its breath.' : 'Back to the hunt.');
  }

  function restartRound() {
    if (shotKind) return;
    game.score = game.scoreAtRoundStart;
    setupRound(game.roundIndex);
    hud.toast('Round restarted — the details have moved back.');
  }

  function startGame() {
    game.score = 0;
    game.stats = [];
    setupRound(0);
  }

  // --- The frame loop ---------------------------------------------------------

  let lastFrame = performance.now();

  function frame() {
    requestAnimationFrame(frame);
    const tNow = performance.now();
    const dt = Math.min(0.1, (tNow - lastFrame) / 1000);
    lastFrame = tNow;
    if (game.screen === 'playing' && !game.paused && !shotKind) {
      game.timeLeft -= dt;
      if (game.timeLeft <= 0) {
        game.timeLeft = 0;
        hud.setTime(0, ROUND_TIME[game.roundIndex]);
        gameOver();
      } else {
        hud.setTime(game.timeLeft, ROUND_TIME[game.roundIndex]);
      }
    }
    const t = animT();
    if (game.leftHall) game.leftHall.update(t);
    if (game.rightHall) game.rightHall.update(t);
    view.render(game.leftHall, game.rightHall);
    drawOverlay(fxLeft, 0);
    drawOverlay(fxRight, 1);
  }

  function drawOverlay(ctx, side) {
    ctx.clearRect(0, 0, PANEL_W, PANEL_H);
    const tNow = now();
    const projectedChanges = game.changes.map((change) => {
      view.project(change.anchor, projected);
      return { ...change, x: projected.x, y: projected.y };
    });
    drawFoundRings(ctx, projectedChanges, game.foundAt, tNow);
    if (game.hint && tNow < game.hint.until) {
      view.project(game.hint.change.anchor, projected);
      drawHintBreath(ctx, { ...game.hint.change, x: projected.x, y: projected.y }, game.hint.startedAt, tNow);
    }
    game.misses[side] = game.misses[side].filter((m) => tNow - m.at < 600);
    drawMissCrosses(ctx, game.misses[side], tNow);
    if (lens.visible && game.screen === 'playing') {
      drawLens(ctx, lens.x, lens.y, tNow);
    }
  }

  // --- Wiring -------------------------------------------------------------------

  doc.getElementById('btn-start').addEventListener('click', startGame);
  doc.getElementById('btn-next').addEventListener('click', () => setupRound(game.roundIndex + 1));
  doc.getElementById('btn-retry').addEventListener('click', () => {
    game.score = game.scoreAtRoundStart;
    setupRound(game.roundIndex);
  });
  doc.getElementById('btn-again').addEventListener('click', startGame);
  doc.getElementById('btn-hint').addEventListener('click', useHint);
  doc.getElementById('btn-pause').addEventListener('click', togglePause);
  doc.getElementById('btn-restart').addEventListener('click', restartRound);
  doc.addEventListener('visibilitychange', () => {
    if (doc.hidden && game.screen === 'playing' && !game.paused && !shotKind) togglePause();
  });

  function start() {
    if (shotKind === 'cover') {
      const ids = CHANGES_BY_ROUND[1].slice(0, 5).map((c) => c.id);
      setupRound(1, { foundIds: ids, timeLeft: 74, score: 500, hintsLeft: 2, hintIndex: 7 });
    } else if (shotKind === 'late') {
      const ids = CHANGES_BY_ROUND[2].slice(0, 8).map((c) => c.id);
      setupRound(2, { foundIds: ids, timeLeft: 14, score: 1750, hintsLeft: 1 });
    } else if (shotKind === 'end') {
      setupRound(2, { foundIds: CHANGES_BY_ROUND[2].map((c) => c.id), timeLeft: 41, score: 2460, hintsLeft: 1 });
      game.stats = [
        { found: 12, bonus: 244, hints: 1, misses: 2 },
        { found: 12, bonus: 196, hints: 2, misses: 3 },
        { found: 12, bonus: 82, hints: 2, misses: 4 },
      ];
      fillEndScreen();
      showScreen('end');
    } else {
      setupRound(0);
      showScreen('start');
    }
    requestAnimationFrame(frame);
  }

  return {
    check,
    key(action) {
      if (action === 'hint') useHint();
      else if (action === 'pause') togglePause();
      else if (action === 'restart') restartRound();
    },
    start,
    // A handle for the maker's own play-tests: where a change projects
    // to, and a snapshot of the hunt so far.
    testHooks: {
      project(id) {
        const change = game.changes.find((c) => c.id === id);
        if (!change) return null;
        view.project(change.anchor, projected);
        return { x: projected.x, y: projected.y };
      },
      state() {
        return {
          screen: game.screen,
          round: game.roundIndex,
          found: game.foundAt.size,
          timeLeft: Math.round(game.timeLeft * 10) / 10,
          score: game.score,
          hintsLeft: game.hintsLeft,
        };
      },
    },
  };
}
