// main.js — the boot: wires the HUD, the pointing and the rounds
// together and opens the library. Everything with a job of its own
// lives in its own file; this one only introduces them.

import { createReadingHud } from './reading-hud.js';
import { createRounds } from './rounds.js';
import { attachPointing } from './pointing.js';

const hud = createReadingHud(document);

let rounds = null;
const pointing = attachPointing(
  [document.getElementById('fx-left'), document.getElementById('fx-right')],
  {
    onCheck: (side, x, y) => { if (rounds) rounds.check(side, x, y); },
    onHover: () => {},
    onKey: (action) => { if (rounds) rounds.key(action); },
  },
);

rounds = createRounds(document, hud, pointing.lens);

// A handle for the maker's own play-tests in a browser console.
window.__oldLibrary = rounds.testHooks;

rounds.start();
