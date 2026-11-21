// changes.js — the twelve quiet changes of each round.
//
// Each change is a small mutation of the hall state (see hall-state.js),
// the 3D anchor a player must click, the on-screen radius that counts as
// a hit, and the words the found list shows once it is spotted. Nothing
// here removes a whole object or repaints anything at a glance: every
// change lives inside a working detail of the room — a title, a flame,
// a ribbon, a hand of the clock — so the hunt stays fair after ten
// finds and the two panels still read as the same library.
//
// How the rounds escalate:
// - Round 1, Afternoon Reading, hides in plain sight. The changes are
//   the biggest of the game (a lamp gone out, the clock's hands moved,
//   a portrait slipped on its nail) and daylight forgives a wandering
//   eye: finding one teaches you where its family of details lives.
// - Round 2, Candle Hour, hides in counts, print and small shifts: one
//   more book in a stack, a page number altered, a ladder rolled less
//   than a metre along its rail, a globe turned on its axis. The light
//   is amber and lower, and the clock is shorter.
// - Round 3, Closing Bell, hides in the dark itself: a highlight gone
//   off the globe, a ribbon tucked out of sight, an ember bed gone
//   dull, a band slipped down a spine, print swapped on the highest,
//   dimmest shelf. The changes are the smallest of the game and the
//   clock is shortest — by design, the round is won by readers who
//   learned the room in the first two.

import {
  ATLAS_BOOK,
  BAND_BOOK,
  BOOK_STACK,
  CHAIR_RIBBON,
  CLOCK_FACE,
  CLOCK_WEIGHTS,
  FIRE_EMBERS,
  FIRE_FLAMES,
  GARDENS_BOOK,
  GLOBE,
  INK_SURFACE,
  INKWELL_CAP,
  LADDER_ONE,
  LADDER_TWO_HUB,
  LEAN_BOOK,
  LEFT_LAMP,
  MAGNIFIER,
  MANTEL_CANDLES,
  PAGE_CORNER,
  PAGE_NUMBER,
  PENDANT,
  POEMS_BOOK,
  PORTRAIT,
  PULLED_BOOK,
  QUILL,
  RIBBON,
  RIGHT_LAMP,
  SCONCE_RIGHT,
  SECOND_BOOK,
  SPECTACLES,
  TABLE_CANDLE,
  TEACUP,
  cloneHallState,
} from './hall-state.js';

function change(id, label, anchor, r, apply) {
  return { id, label, anchor, r, apply };
}

export const CHANGES_BY_ROUND = [
  // Round 1 — Afternoon Reading: the fair dozen, in plain sight.
  [
    change('atlas-title', "the atlas's spine now reads ALTAS", ATLAS_BOOK, 17, (s) => { s.atlasTitle = 'ALTAS'; }),
    change('left-lamp', "the left banker's lamp has gone out", LEFT_LAMP, 20, (s) => { s.leftLampLit = false; }),
    change('globe-land', 'the lit continent on the globe has moved', GLOBE, 30, (s) => { s.globeHighlight = 'east'; }),
    change('ribbon-side', "the open book's ribbon lies on the other page", RIBBON, 14, (s) => { s.bookmarkSide = 'right'; }),
    change('mantel-candle', "the candelabrum's middle candle is out", MANTEL_CANDLES, 18, (s) => { s.mantelMiddleLit = false; }),
    change('clock-hands', 'the clock has gained an hour and a half', CLOCK_FACE, 20, (s) => { s.clockHour = 4; s.clockMinute = 35; }),
    change('portrait-slip', 'the portrait above the fire has slipped', PORTRAIT, 22, (s) => { s.portraitTilt = -0.055; }),
    change('lean-book', 'the leaning book leans the other way', LEAN_BOOK, 17, (s) => { s.leanSign = 1; }),
    change('inkwell-cap', "the inkwell's cap lies off beside it", INKWELL_CAP, 13, (s) => { s.inkCapOff = true; }),
    change('quill-feather', 'the quill is a black crow feather now', QUILL, 14, (s) => { s.quillBlack = true; }),
    change('spectacles-stack', 'the spectacles rest on the book stack', SPECTACLES, 22, (s) => { s.glassesOnStack = true; }),
    change('second-book', 'the second book on the table lies open', SECOND_BOOK, 18, (s) => { s.secondBookOpen = true; }),
  ],
  // Round 2 — Candle Hour: counts, print and small shifts.
  [
    change('poems-title', "the poems' spine now reads PEOMS", POEMS_BOOK, 17, (s) => { s.poemsTitle = 'PEOMS'; }),
    change('stack-count', 'a fifth book has joined the stack', BOOK_STACK, 18, (s) => { s.stackCount = 5; }),
    change('candle-burned', 'the table candle has burned short', TABLE_CANDLE, 15, (s) => { s.candleShort = true; }),
    change('globe-turned', 'the globe has turned on its axis', GLOBE, 30, (s) => { s.globeSpin = 1.05; }),
    change('ladder-rolled', 'the ladder has rolled along its rail', LADDER_ONE, 22, (s) => { s.ladderShift = 0.85; }),
    change('chair-ribbon', "the armchair book's ribbon is blue", CHAIR_RIBBON, 14, (s) => { s.chairRibbon = 'blue'; }),
    change('clock-weight', "the clock's left weight has sunk", CLOCK_WEIGHTS, 16, (s) => { s.clockWeightLow = true; }),
    change('magnifier-moved', 'the magnifying glass lies by the lamp', MAGNIFIER, 16, (s) => { s.magnifierMoved = true; }),
    change('page-number', 'the open page is numbered 182 now', PAGE_NUMBER, 15, (s) => { s.pageNumber = '182'; }),
    change('book-pulled', 'a book stands proud of its row', PULLED_BOOK, 16, (s) => { s.bookPulled = true; }),
    change('flame-out', 'one of the fire’s flames is gone', FIRE_FLAMES, 23, (s) => { s.flames = 2; }),
    change('tea-drained', 'the teacup by the armchair is empty', TEACUP, 13, (s) => { s.teaEmpty = true; }),
  ],
  // Round 3 — Closing Bell: what the dark hides.
  [
    change('gardens-title', "the gardens' spine now reads GARDNES", GARDENS_BOOK, 16, (s) => { s.gardensTitle = 'GARDNES'; }),
    change('sconce-out', "a candle in the right sconce has gone out", SCONCE_RIGHT, 16, (s) => { s.sconceRightOut = 1; }),
    change('globe-dark', 'no continent is lit on the globe', GLOBE, 30, (s) => { s.globeHighlight = 'off'; }),
    change('ribbon-tucked', "the open book's ribbon is tucked away", RIBBON, 14, (s) => { s.bookmarkSide = 'tucked'; }),
    change('embers-dull', 'the ember bed has gone dull', FIRE_EMBERS, 17, (s) => { s.embersLit = false; }),
    change('clock-minutes', 'the clock has crept to ten past nine', CLOCK_FACE, 20, (s) => { s.clockHour = 9; s.clockMinute = 10; }),
    change('shade-tipped', "the right lamp's shade has tipped", RIGHT_LAMP, 18, (s) => { s.rightShadeTilt = 0.16; }),
    change('band-slipped', "a spine's gold band has slipped low", BAND_BOOK, 15, (s) => { s.bandLow = true; }),
    change('hub-iron', "the ladder's wheel hub is iron, not brass", LADDER_TWO_HUB, 14, (s) => { s.ladderHubDark = true; }),
    change('page-folded', "the open page's corner is folded down", PAGE_CORNER, 13, (s) => { s.pageFolded = true; }),
    change('ink-blue', 'the ink in the well is a deep blue', INK_SURFACE, 12, (s) => { s.inkColor = '#1b2f6e'; }),
    change('pendant-dim', 'one globe of the pendant lamp is dim', PENDANT, 23, (s) => { s.pendantDim = true; }),
  ],
];

// Builds the right panel's state for a round: the base state with every
// change of the round applied to a clone.
export function changedStateForRound(baseState, roundIndex) {
  const state = cloneHallState(baseState);
  for (const item of CHANGES_BY_ROUND[roundIndex]) item.apply(state);
  return state;
}
