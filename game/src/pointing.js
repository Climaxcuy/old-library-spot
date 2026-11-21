// pointing.js — mouse and keyboard, the two ways to read closely.
//
// A click on either panel reports the spot in panel pixels (the game
// compares it with the projected change anchors). The keyboard moves a
// brass lens with the arrow keys — Shift strides — and checks the spot
// under it with Enter or Space; H asks for a hint, P pauses, R restarts
// the round. The lens lives here; rounds.js draws it from this state.

import { PANEL_H, PANEL_W } from './twin-view.js';

export function attachPointing(surfaces, handlers) {
  const lens = { x: PANEL_W / 2, y: PANEL_H / 2, visible: false };

  function toPanel(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * PANEL_W,
      y: ((event.clientY - rect.top) / rect.height) * PANEL_H,
    };
  }

  surfaces.forEach((canvas, side) => {
    canvas.addEventListener('pointermove', (event) => {
      const { x, y } = toPanel(canvas, event);
      handlers.onHover(side, x, y);
    });
    canvas.addEventListener('pointerdown', (event) => {
      const { x, y } = toPanel(canvas, event);
      lens.x = x;
      lens.y = y;
      handlers.onCheck(side, x, y);
    });
  });

  window.addEventListener('keydown', (event) => {
    const step = event.shiftKey ? 26 : 9;
    switch (event.key) {
      case 'ArrowLeft':
        lens.x = Math.max(6, lens.x - step);
        lens.visible = true;
        event.preventDefault();
        break;
      case 'ArrowRight':
        lens.x = Math.min(PANEL_W - 6, lens.x + step);
        lens.visible = true;
        event.preventDefault();
        break;
      case 'ArrowUp':
        lens.y = Math.max(6, lens.y - step);
        lens.visible = true;
        event.preventDefault();
        break;
      case 'ArrowDown':
        lens.y = Math.min(PANEL_H - 6, lens.y + step);
        lens.visible = true;
        event.preventDefault();
        break;
      case 'Enter':
      case ' ':
        if (lens.visible) {
          handlers.onCheck(0, lens.x, lens.y);
          event.preventDefault();
        }
        break;
      case 'h':
      case 'H':
        handlers.onKey('hint');
        break;
      case 'p':
      case 'P':
        handlers.onKey('pause');
        break;
      case 'r':
      case 'R':
        handlers.onKey('restart');
        break;
      default:
        break;
    }
  });

  return { lens };
}
