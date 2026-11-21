// hall-state.js — the old library as data, in three dimensions.
//
// The hall is built twice per round from two states: this base state
// (the left panel) and a changed state that changes.js makes by mutating
// a clone. Every detail a difference can touch — a lamp, a ribbon, a
// clock hand — is a field here, and every clickable anchor is a 3D point
// exported from this file, so the builders in shelves.js and
// furnishings.js and the targets in changes.js can never drift apart.
//
// The hall, in metres: the camera looks toward -z. The bookcase wall
// stands at z=-13 (its fronts at z=-12.25), three bays across x=-11.3
// ..5.44 under a cornice at y=9.2, and the fireplace takes the rest of
// the back wall at x=9.6. The reading table (top at y=1.04) sits at
// z=-3.1; the globe at (3.3, 1.6); two tall windows in the left wall
// (x=-11.9).

// --- Anchors: where a player must click -------------------------------------

export const ATLAS_BOOK = { x: -3.88, y: 4.05, z: -12.3 };
export const POEMS_BOOK = { x: 1.95, y: 2.6, z: -12.3 };
export const GARDENS_BOOK = { x: -9.51, y: 6.95, z: -12.3 };
export const BAND_BOOK = { x: -1.23, y: 2.6, z: -12.3 };
export const LEAN_BOOK = { x: -5.75, y: 4.0, z: -12.35 };
export const PULLED_BOOK = { x: 3.85, y: 5.45, z: -12.15 };

export const LADDER_ONE = { x: -1.35, y: 3.4, z: -11.8 };
export const LADDER_TWO_HUB = { x: 3.82, y: 8.85, z: -12.2 };
export const SCONCE_RIGHT = { x: 6.4, y: 6.15, z: -12.0 };
export const PENDANT = { x: 0, y: 7.7, z: -3 };

export const CLOCK_FACE = { x: -4.75, y: 2.5, z: -11.8 };
export const CLOCK_WEIGHTS = { x: -4.75, y: 1.1, z: -11.8 };

export const LEFT_LAMP = { x: -1.75, y: 1.74, z: -3.75 };
export const RIGHT_LAMP = { x: 1.75, y: 1.74, z: -3.75 };
export const OPEN_BOOK = { x: -0.55, y: 1.16, z: -2.85 };
export const RIBBON = { x: -0.78, y: 1.18, z: -2.68 };
export const PAGE_NUMBER = { x: -0.55, y: 1.17, z: -3.02 };
export const PAGE_CORNER = { x: -0.2, y: 1.18, z: -2.66 };
export const BOOK_STACK = { x: 1.15, y: 1.45, z: -2.7 };
export const SPECTACLES = { x: 0.72, y: 1.4, z: -3.3 };
export const INKWELL_CAP = { x: -1.02, y: 1.1, z: -2.4 };
export const QUILL = { x: -1.24, y: 1.52, z: -2.58 };
export const INK_SURFACE = { x: -1.2, y: 1.17, z: -2.55 };
export const TABLE_CANDLE = { x: -2.3, y: 1.55, z: -2.8 };
export const SECOND_BOOK = { x: -2.05, y: 1.12, z: -1.95 };
export const MAGNIFIER = { x: 1.72, y: 1.1, z: -2.85 };

export const GLOBE = { x: 3.3, y: 2.05, z: 1.6 };
export const FIRE_FLAMES = { x: 9.6, y: 0.95, z: -12.55 };
export const FIRE_EMBERS = { x: 9.6, y: 0.38, z: -12.5 };
export const MANTEL_CANDLES = { x: 9.6, y: 3.35, z: -12.45 };
export const PORTRAIT = { x: 9.6, y: 4.35, z: -12.5 };
export const CHAIR_RIBBON = { x: -5.9, y: 0.92, z: -0.62 };
export const TEACUP = { x: -5.65, y: 0.84, z: -1.05 };

// --- The state itself ---------------------------------------------------------

// The hour the longcase clock shows as each round begins; the changes
// move its hands in rounds one and three.
export const ROUND_CLOCK_TIMES = [
  { hour: 3, minute: 0 },
  { hour: 6, minute: 20 },
  { hour: 8, minute: 45 },
];

// Every buildable detail at its left-panel value for the given round.
// A few defaults follow the light: by Closing Bell the fire is embers
// and the pendant burns low, in both panels alike.
export function baseHallState(roundIndex) {
  const clock = ROUND_CLOCK_TIMES[Math.min(roundIndex, ROUND_CLOCK_TIMES.length - 1)];
  return {
    // The titled spines. One title per round is quietly misprinted in
    // the right panel — see changes.js.
    atlasTitle: 'ATLAS',
    poemsTitle: 'POEMS',
    gardensTitle: 'GARDENS',
    bandLow: false, // the gold band on the band book: top, or slipped low
    leanSign: -1, // the leaning book leans left (-1) or right (+1)
    bookPulled: false, // a book on the right bay stands proud of its row

    ladderShift: 0, // metres the first ladder has rolled along its rail
    ladderHubDark: false, // the second ladder's top wheel hub: brass or iron

    sconceRightOut: -1, // a candle of the right sconce is out: -1 none, else its side
    pendantDim: false, // one pendant globe gone dim

    clockHour: clock.hour,
    clockMinute: clock.minute,
    clockWeightLow: false, // the clock's left weight has sunk

    leftLampLit: true,
    rightShadeTilt: 0, // radians the right lamp's shade has tipped
    bookmarkSide: 'left', // the open book's ribbon: 'left' | 'right' | 'tucked'
    pageNumber: '128',
    pageFolded: false, // a dog-ear folded on the open book's right page
    stackCount: 4, // books in the table stack
    glassesOnStack: false, // the spectacles rest on the table, or on the stack
    inkCapOff: false, // the inkwell's cap: screwed on, or off beside it
    inkColor: '#0b0b0e', // the ink's surface: black, or a deep blue
    quillBlack: false, // the quill in the inkwell: white goose, or black crow
    candleShort: false, // the table candle: tall, or burned short
    secondBookOpen: false, // the second table book: closed, or lying open
    magnifierMoved: false, // the magnifying glass: on the map, or beside the lamp

    globeHighlight: 'west', // the lit continent: 'west' | 'east' | 'off'
    globeSpin: 0, // radians the globe has turned on its axis

    flames: 3, // flame cones over the logs: three, or two
    embersLit: true, // the ember bed glows, or has gone dull
    mantelMiddleLit: true, // the candelabrum's middle candle burns, or not
    portraitTilt: 0, // radians the portrait has slipped on its nail

    chairRibbon: 'red', // the ribbon in the armchair book: red or blue
    teaEmpty: false, // the teacup: full of tea, or drained
  };
}

export function cloneHallState(state) {
  return JSON.parse(JSON.stringify(state));
}
