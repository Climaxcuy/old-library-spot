[![make.fun bounty](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Climaxcuy/old-library-spot/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Climaxcuy/old-library-spot/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

# The Old Library — a spot-the-difference game

A towering old library hall, rendered twice in real 3D: floor-to-ceiling
shelves, rolling ladders, a reading table under a pendant lamp, a globe,
a fire settling in its grate. The two pictures are two renders of the
same hall from one camera — and in the second, twelve working details
have quietly changed. A spine misprinted. A lamp gone out. The clock's
hands crept forward. Find them all before the light runs out.

## How to play

- **Three rounds, one library, failing light:** Afternoon Reading,
  Candle Hour and Closing Bell. Each round hides **12 differences**,
  and each round's clock is shorter than the last.
- **The differences hide harder as the rounds turn:** the first round
  hides in plain sight; the second hides in counts, small print and
  small shifts (a fifth book in a stack, a page renumbered, a ladder
  rolled along its rail); the third hides in the dark itself (a lit
  continent gone off the globe, a ribbon tucked away, an ember bed
  gone dull).
- **Mouse:** click a difference in either picture. A gold ring with a
  tick blooms on both panels when you find one.
- **Keyboard:** arrow keys move the brass lens, `Enter` or `Space`
  checks the spot under it, `H` asks for a hint, `P` pauses, `R`
  restarts the round.
- **Wrong clicks cost 5 seconds.** Hints are limited to 3 a round — a
  hint makes one unfound difference breathe, gently.
- The counter at the top always shows how many differences remain.

## Running it

The game is plain static files under `game/` — no build step, no
network. Serve the folder with any static server, for example the one
bundled here:

```
node serve.ts        # then open http://localhost:8080
```

## Layout

- `main.ts` — the hand-in program: copies `game/` and `screenshots/`
  to the output directory and writes `dossier.json` with the vendored
  library.
- `vendor/makefun-game.ts` — the make.fun dossier library, unchanged.
- `game/index.html` — the page: HUD, the two panels, the start and end
  screens.
- `game/vendor/three.min.js` — Three.js, vendored so the game plays
  offline.
- `game/src/lighting.js` — the three rounds' light: afternoon sun,
  candle amber and the closing dark.
- `game/src/hall-state.js` — the library as data: every detail a
  difference can touch, and the 3D anchor of each.
- `game/src/changes.js` — the twelve hidden changes of each round, and
  how the rounds escalate.
- `game/src/paperwork.js` — the procedural canvas textures: wood,
  cloth, the rug, spine titles, the open pages, the globe's map, the
  clock's face, the portrait.
- `game/src/joinery.js` — the carpenter's bench: shared mesh makers.
- `game/src/shelves.js` — the bookcase wall: three bays, their books,
  the hero volumes, the rolling ladders, the sconces.
- `game/src/furnishings.js` — the room's shell and windows, the
  reading table and its clutter, the globe, the fireplace and
  portrait, the longcase clock, the armchair corner, the pendant.
- `game/src/hall.js` — the hall assembled and animated: flames, the
  pendulum, dust in the light shafts.
- `game/src/twin-view.js` — one shared camera, two renderers: the two
  panels are two renders of the same library, and anchors project to
  panel pixels.
- `game/src/rings.js` — found rings, hint breaths, miss crosses and
  the keyboard lens, drawn on the overlay.
- `game/src/reading-hud.js` — the counter, timer bar, score and found
  list.
- `game/src/pointing.js` — mouse clicks and the keyboard lens.
- `game/src/rounds.js` — rounds, clock, scoring and the screens.
- `screenshots/` — real renders of the game, taken in a browser.
