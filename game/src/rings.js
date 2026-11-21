// rings.js — everything drawn over a panel after the room itself.
//
// A found difference wears a ring on both panels: it blooms in with an
// overshoot, throws a few sparks, then settles with a tick inside. A
// hint is a slow double breath around one unfound difference — enough
// to guide the eye, never a hard flash. A wrong click is a short red
// cross that fades. The keyboard reader's lens is a brass ring with a
// fine cross. All of it is drawn from timestamps, so a frozen clock
// (the screenshot modes) freezes every gesture mid-bloom.

const GOLD = '#e9b949';
const INK = 'rgba(20, 14, 4, 0.92)';
const CREAM = '#fdf3d0';

function easeOutBack(x) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

export function ringRadius(change) {
  return Math.max(change.r, 15) + 6;
}

function tickPath(ctx, x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x - s * 0.62, y + s * 0.06);
  ctx.lineTo(x - s * 0.15, y + s * 0.52);
  ctx.lineTo(x + s * 0.68, y - s * 0.48);
}

// changes: the round's list (with x, y projected); foundAt: a Map of
// id -> the timestamp (ms) it was found; now: the current timestamp.
export function drawFoundRings(ctx, changes, foundAt, now) {
  for (const change of changes) {
    const foundTime = foundAt.get(change.id);
    if (foundTime === undefined) continue;
    const age = (now - foundTime) / 1000;
    const base = ringRadius(change);
    const pop = age < 0.35 ? easeOutBack(Math.max(age, 0) / 0.35) : 1;
    const r = base * (0.6 + 0.4 * pop);
    const { x, y } = change;
    ctx.lineCap = 'round';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5.6;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2.9;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    if (age > 0.16) {
      const s = Math.min(1, (age - 0.16) / 0.18) * base * 0.42;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4.8;
      tickPath(ctx, x, y, s);
      ctx.stroke();
      ctx.strokeStyle = CREAM;
      ctx.lineWidth = 2.5;
      tickPath(ctx, x, y, s);
      ctx.stroke();
    }
    if (age >= 0 && age < 0.55) {
      const spread = base + 4 + age * 26;
      ctx.fillStyle = GOLD;
      for (let i = 0; i < 8; i += 1) {
        const a = (i / 8) * Math.PI * 2 + 0.4;
        ctx.globalAlpha = 1 - age / 0.55;
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * spread, y + Math.sin(a) * spread, 2.1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }
}

// A hint behaves: two soft rings breathe outward and fade, over a
// dashed ring that holds the place — a nudge, not a giveaway.
export function drawHintBreath(ctx, change, startedAt, now) {
  const age = (now - startedAt) / 1000;
  const base = ringRadius(change);
  for (let k = 0; k < 2; k += 1) {
    const phase = (age * 0.7 + k * 0.5) % 1;
    ctx.strokeStyle = `rgba(233, 185, 73, ${0.55 * (1 - phase)})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(change.x, change.y, base + phase * 22, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(233, 185, 73, 0.85)';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.arc(change.x, change.y, base, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
}

// misses: [{x, y, at}] in the panel's own pixels.
export function drawMissCrosses(ctx, misses, now) {
  for (const miss of misses) {
    const age = (now - miss.at) / 1000;
    if (age < 0 || age > 0.55) continue;
    const s = 9 * (0.7 + 0.3 * (age / 0.55));
    ctx.globalAlpha = 1 - age / 0.55;
    ctx.strokeStyle = '#d8402e';
    ctx.lineWidth = 3.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(miss.x - s, miss.y - s);
    ctx.lineTo(miss.x + s, miss.y + s);
    ctx.moveTo(miss.x + s, miss.y - s);
    ctx.lineTo(miss.x - s, miss.y + s);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

// The keyboard reader's lens: a brass ring with a fine crosshair,
// breathing almost imperceptibly as it waits.
export function drawLens(ctx, x, y, now) {
  const breathe = 1 + Math.sin(now / 300) * 0.03;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4.4;
  ctx.beginPath();
  ctx.arc(x, y, 17 * breathe, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#c9a24d';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(x, y, 17 * breathe, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(253, 243, 208, 0.9)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x - 24, y);
  ctx.lineTo(x - 9, y);
  ctx.moveTo(x + 9, y);
  ctx.lineTo(x + 24, y);
  ctx.moveTo(x, y - 24);
  ctx.lineTo(x, y - 9);
  ctx.moveTo(x, y + 9);
  ctx.lineTo(x, y + 24);
  ctx.stroke();
}
