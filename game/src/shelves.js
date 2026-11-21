// shelves.js — the bookcase wall: three towering bays, their five
// hundred books, the rolling ladders and the candle sconces.
//
// The wall is built from the hall state, so the changes have somewhere
// to live: three titled spines are painted from the state (and one is
// misprinted per round), a gold band sits high or low on the ledgers
// volume, one book leans left or right, one stands proud of its row,
// the first ladder stands where the state rolled it, and the second
// ladder's wheel hub is brass or iron as the state decides.

const THREE = window.THREE;

import { between, mulberry32, pickFrom } from './seeded-random.js';
import { BRASS, IRON, box, cyl, flame, glowSprite, mat } from './joinery.js';
import { genericSpineTexture, spineTexture, woodTexture } from './paperwork.js';

export const BAYS = [
  { cx: -8.51, w: 5.58 },
  { cx: -2.93, w: 5.58 },
  { cx: 2.65, w: 5.58 },
];
// The top surface of each shelf board; books stand on these.
export const ROW_BOARDS = [0.5, 1.95, 3.4, 4.85, 6.3, 7.75];
const BOOK_Z = -12.6;

const CLOTHS = ['#7a2e2a', '#274d5e', '#33512e', '#5e4527', '#4a2e4f', '#6e5636', '#2e5e4a', '#54383e', '#71563a', '#3d4a68', '#83452e', '#496b46'];

// The titled volumes: [bay, row, x, title (or state key), cloth].
const HEROES = [
  { bay: 1, row: 2, x: -3.88, title: (s) => s.atlasTitle, cloth: '#7a2e2a' },
  { bay: 2, row: 1, x: 1.95, title: (s) => s.poemsTitle, cloth: '#274d5e' },
  { bay: 0, row: 4, x: -9.51, title: (s) => s.gardensTitle, cloth: '#33512e' },
  { bay: 1, row: 1, x: -1.23, title: () => 'LEDGERS', cloth: '#4a2e4f', band: true },
  { bay: 0, row: 2, x: -7.11, title: () => 'ESSAYS', cloth: '#5e4527' },
  { bay: 2, row: 3, x: 0.45, title: () => 'VOYAGES', cloth: '#6e5636' },
  { bay: 1, row: 4, x: -0.73, title: () => 'HERBALS', cloth: '#2e5e4a' },
  { bay: 0, row: 1, x: -10.71, title: () => 'MYTHS', cloth: '#54383e' },
];
// Slots the ordinary rows must leave empty: the heroes, the leaning
// book (bay 0, row 2, right end) and the proud book (bay 2, row 3).
function reservedSlots(bay, row) {
  const slots = HEROES.filter((h) => h.bay === bay && h.row === row).map((h) => [h.x - 0.26, h.x + 0.26]);
  if (bay === 0 && row === 2) slots.push([-6.02, -5.45]);
  if (bay === 2 && row === 3) slots.push([3.58, 4.12]);
  return slots;
}

const unitBox = new THREE.BoxGeometry(1, 1, 1);

function bookMesh(w, h, d, material) {
  const mesh = new THREE.Mesh(unitBox, material);
  mesh.scale.set(w, h, d);
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  return mesh;
}

// One shelf row of ordinary books, seeded so both panels shelve alike.
function buildRow(group, bay, row, boardY, spineTex) {
  const rng = mulberry32(1000 + bay * 37 + row * 131);
  const left = BAYS[bay].cx - BAYS[bay].w / 2 + 0.28;
  const right = BAYS[bay].cx + BAYS[bay].w / 2 - 0.28;
  const reserved = reservedSlots(bay, row);
  let x = left;
  while (x < right - 0.14) {
    const blocked = reserved.find(([a, b]) => x + 0.3 > a && x < b);
    if (blocked) {
      x = blocked[1] + 0.02;
      continue;
    }
    const roll = rng();
    if (roll < 0.06) {
      x += between(rng, 0.12, 0.3); // a breathing gap
      continue;
    }
    if (roll < 0.13) {
      // A small horizontal stack lying in the row.
      const w = between(rng, 0.34, 0.44);
      let y = boardY;
      const n = 2 + Math.floor(rng() * 2);
      for (let i = 0; i < n; i += 1) {
        const t = between(rng, 0.09, 0.13);
        const book = bookMesh(w, t, 0.5, mat(pickFrom(rng, CLOTHS), { roughness: 0.9 }));
        book.position.set(x + w / 2, y + t / 2, BOOK_Z);
        group.add(book);
        y += t;
      }
      x += w + 0.03;
      continue;
    }
    const w = between(rng, 0.13, 0.27);
    const h = between(rng, 0.92, 1.26);
    const cloth = pickFrom(rng, CLOTHS);
    const material = rng() < 0.72
      ? new THREE.MeshStandardMaterial({ map: spineTex, color: cloth, roughness: 0.9 })
      : mat(cloth, { roughness: 0.92 });
    const book = bookMesh(w, h, between(rng, 0.44, 0.54), material);
    book.position.set(x + w / 2, boardY + h / 2, BOOK_Z);
    group.add(book);
    x += w + 0.012;
  }
}

function buildHero(group, hero, state) {
  const boardY = ROW_BOARDS[hero.row];
  const spine = new THREE.MeshStandardMaterial({
    map: spineTexture(hero.title(state), hero.cloth),
    roughness: 0.85,
  });
  const cloth = mat(hero.cloth, { roughness: 0.88 });
  const book = new THREE.Mesh(
    new THREE.BoxGeometry(0.36, 1.3, 0.55),
    [cloth, cloth, cloth, cloth, spine, cloth],
  );
  book.position.set(hero.x, boardY + 0.65, -12.58);
  book.castShadow = false;
  book.receiveShadow = true;
  group.add(book);
  if (hero.band) {
    const band = box(0.37, 0.055, 0.03, BRASS(), hero.x, boardY + (state.bandLow ? 0.42 : 1.06), -12.28, false);
    group.add(band);
  }
}

// The leaning book and the proud book, the wall's two posture changes.
function buildPostureBooks(group, state, spineTex) {
  const leanBoard = ROW_BOARDS[2];
  const leaner = new THREE.Group();
  leaner.position.set(-5.75, leanBoard, BOOK_Z);
  const leanBook = bookMesh(0.2, 1.14, 0.5, new THREE.MeshStandardMaterial({ map: spineTex, color: '#83452e', roughness: 0.9 }));
  leanBook.position.y = 0.57;
  leaner.add(leanBook);
  leaner.rotation.z = -state.leanSign * 0.17;
  group.add(leaner);

  const proudBoard = ROW_BOARDS[3];
  const proud = bookMesh(0.21, 1.12, 0.5, new THREE.MeshStandardMaterial({ map: spineTex, color: '#3d4a68', roughness: 0.9 }));
  proud.position.set(3.85, proudBoard + 0.56, BOOK_Z + (state.bookPulled ? 0.17 : 0));
  group.add(proud);
}

// A rolling ladder, leaning on the brass rail: two stiles, rungs, and
// the top wheels whose hubs are one of the third round's hiding places.
function buildLadder(x, hubDark) {
  const ladder = new THREE.Group();
  const tilt = new THREE.Group();
  tilt.position.set(x, 4.5, -11.62);
  tilt.rotation.x = -0.151;
  const stileWood = mat('#7a5a30', { roughness: 0.7 });
  for (const side of [-0.42, 0.42]) {
    tilt.add(box(0.09, 9.05, 0.055, stileWood, side, 0, 0));
    const wheel = cyl(0.15, 0.15, 0.07, IRON(), side, 4.42, 0.05, 18);
    wheel.rotation.z = Math.PI / 2;
    tilt.add(wheel);
    const hub = cyl(0.06, 0.06, 0.085, hubDark ? IRON() : BRASS(), side, 4.42, 0.05, 12);
    hub.rotation.z = Math.PI / 2;
    tilt.add(hub);
  }
  for (let y = -4.05; y <= 4.05; y += 0.74) {
    const rung = cyl(0.03, 0.03, 0.78, mat('#8f6a38', { roughness: 0.65 }), 0, y, 0, 10);
    rung.rotation.z = Math.PI / 2;
    tilt.add(rung);
  }
  ladder.add(tilt);
  return ladder;
}

// A twin-candle sconce on a pillar between the bays. outIndex is the
// candle that has gone out (-1: both burn; 0 or 1: that side is dark).
function buildSconce(x, outIndex, light, glowTex) {
  const sconce = new THREE.Group();
  sconce.add(box(0.18, 0.56, 0.05, BRASS(), x, 5.9, -12.16, false));
  [-0.15, 0.15].forEach((off, i) => {
    sconce.add(cyl(0.035, 0.05, 0.1, BRASS(), x + off, 6.12, -12.02, 10));
    sconce.add(cyl(0.028, 0.028, 0.24, mat('#e8dcc0', { roughness: 0.6 }), x + off, 6.28, -12.02, 10));
    if (i !== outIndex) {
      const f = flame(0.9, x + off);
      f.position.set(x + off, 6.48, -12.02);
      sconce.add(f);
      const glow = glowSprite(glowTex, '#ffb45e', 0.62, 0.5 * light.candleLight / 4);
      glow.position.set(x + off, 6.5, -11.95);
      sconce.add(glow);
    }
  });
  return sconce;
}

export function buildBookWall(state, light, glowTex) {
  const wall = new THREE.Group();
  const caseWood = new THREE.MeshStandardMaterial({
    map: woodTexture('#6b4a2c', '#463014', '#86603a', 9),
    roughness: 0.8,
  });
  const spineTex = genericSpineTexture();

  // The wall behind the cases, and the shared back panel.
  wall.add(box(24.6, 11.4, 0.18, mat('#3d2c1c', { roughness: 0.95 }), 0, 5.7, -13.18, false));
  wall.add(box(24.6, 1.7, 0.34, mat('#54402a', { roughness: 0.95 }), 0, 10.6, -13.05, false));

  BAYS.forEach((bay, bayIndex) => {
    const g = new THREE.Group();
    g.add(box(0.2, 9.2, 0.88, caseWood, bay.cx - bay.w / 2, 4.6, -12.66));
    g.add(box(0.2, 9.2, 0.88, caseWood, bay.cx + bay.w / 2, 4.6, -12.66));
    g.add(box(bay.w + 0.24, 0.24, 0.92, caseWood, bay.cx, 9.3, -12.66));
    g.add(box(bay.w + 0.56, 0.42, 1.06, caseWood, bay.cx, 9.62, -12.66));
    g.add(box(bay.w + 0.14, 0.5, 0.94, caseWood, bay.cx, 0.25, -12.66));
    for (const boardY of ROW_BOARDS) {
      g.add(box(bay.w - 0.12, 0.09, 0.82, caseWood, bay.cx, boardY - 0.045, -12.66));
    }
    ROW_BOARDS.forEach((boardY, row) => buildRow(g, bayIndex, row, boardY, spineTex));
    wall.add(g);
  });

  for (const hero of HEROES) buildHero(wall, hero, state);
  buildPostureBooks(wall, state, spineTex);

  // The brass rail the ladders hang from, and the ladders themselves.
  const rail = cyl(0.035, 0.035, 17.6, BRASS(), -2.93, 9.04, -12.16, 10);
  rail.rotation.z = Math.PI / 2;
  wall.add(rail);
  wall.add(buildLadder(-1.8 + state.ladderShift, false));
  wall.add(buildLadder(3.4, state.ladderHubDark));

  // Sconces on the pillars; the right one's candles are a change.
  wall.add(buildSconce(-5.72, -1, light, glowTex));
  wall.add(buildSconce(6.4, state.sconceRightOut, light, glowTex));

  return wall;
}
