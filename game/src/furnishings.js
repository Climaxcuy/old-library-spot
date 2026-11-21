// furnishings.js — everything in the hall that is not the book wall:
// the room's shell and windows, the reading table and all its small
// working clutter, the globe, the fireplace with its portrait, the
// longcase clock, the armchair corner and the pendant lamp.
//
// Like the wall, it is built from the hall state: lamps lit or unlit,
// ribbons lying left or right, caps on or off — the changes in
// changes.js are all, in the end, instructions to this file and
// shelves.js about which way round to build a detail.

const THREE = window.THREE;

import { mulberry32 } from './seeded-random.js';
import { BRASS, IRON, ball, box, cyl, flame, glowSprite, mat } from './joinery.js';
import {
  clockFaceTexture,
  globeTexture,
  mapTexture,
  openPagesTexture,
  portraitTexture,
  rugTexture,
  woodTexture,
} from './paperwork.js';

const TABLE_TOP = 1.04;
const TABLE_Z = -3.1;

// --- The room's shell ---------------------------------------------------------

function buildShell(state, light) {
  const shell = new THREE.Group();
  const floorTex = woodTexture('#8a6844', '#66482a', '#a37c50', 3);
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(3, 4);
  const floor = box(25.5, 0.1, 30.5, new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.75 }), 0, -0.05, 1, false);
  shell.add(floor);

  const rug = new THREE.Mesh(
    new THREE.PlaneGeometry(9.2, 6.1),
    new THREE.MeshStandardMaterial({ map: rugTexture(), roughness: 0.96 }),
  );
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, 0.012, -2.4);
  rug.receiveShadow = true;
  shell.add(rug);

  const plaster = mat('#4c3a28', { roughness: 0.97 });
  // Right wall (the fireplace is built into it below) and the ceiling.
  shell.add(box(0.3, 11.6, 30.5, plaster, 12.05, 5.8, 1, false));
  shell.add(box(25.5, 0.24, 30.5, mat('#33261a', { roughness: 1 }), 0, 11.35, 1, false));
  for (const bx of [-8, -4, 0, 4, 8]) {
    shell.add(box(0.38, 0.55, 29, mat('#3a2a1a', { roughness: 0.95 }), bx, 10.95, 1, false));
  }

  // Left wall, built around two tall windows. The sky beyond them is a
  // single lit plane whose colour is the round's daylight.
  shell.add(box(0.3, 2.3, 30.5, plaster, -12.05, 1.15, 1, false));
  shell.add(box(0.3, 3.9, 30.5, plaster, -12.05, 9.45, 1, false));
  for (const [zc, len] of [[-12.2, 3.6], [-7.75, 1.5], [2.5, 15]]) {
    shell.add(box(0.3, 5.2, len, plaster, -12.05, 4.9, zc, false));
  }
  const sky = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 6.4),
    new THREE.MeshBasicMaterial({ color: light.skyThroughWindow }),
  );
  sky.rotation.y = Math.PI / 2;
  sky.position.set(-12.75, 4.9, -7.75);
  shell.add(sky);

  const frameWood = mat('#3a2a1a', { roughness: 0.8 });
  for (const wz of [-9.5, -6.0]) {
    const frame = new THREE.Group();
    frame.add(box(0.14, 5.3, 0.16, frameWood, -11.88, 4.9, wz - 1.12, false));
    frame.add(box(0.14, 5.3, 0.16, frameWood, -11.88, 4.9, wz + 1.12, false));
    frame.add(box(0.14, 0.16, 2.4, frameWood, -11.88, 7.48, wz, false));
    frame.add(box(0.14, 0.16, 2.4, frameWood, -11.88, 2.32, wz, false));
    frame.add(box(0.09, 5.2, 0.07, frameWood, -11.88, 4.9, wz, false));
    frame.add(box(0.09, 0.07, 2.24, frameWood, -11.88, 4.9, wz, false));
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(2.24, 5.2),
      new THREE.MeshStandardMaterial({ color: light.skyThroughWindow, transparent: true, opacity: 0.22, roughness: 0.1, metalness: 0.3 }),
    );
    glass.rotation.y = Math.PI / 2;
    glass.rotation.z = Math.PI / 2;
    glass.position.set(-11.9, 4.9, wz);
    frame.add(glass);
    shell.add(frame);
  }
  return shell;
}

// One slanted slab of lit air under each window, and the dust in it.
function buildShafts(light, glowTex) {
  const shafts = new THREE.Group();
  const shaftMat = new THREE.MeshBasicMaterial({
    color: '#ffedb8',
    transparent: true,
    opacity: light.shaftOpacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  for (const wz of [-9.5, -6.0]) {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.04, 1.6), shaftMat);
    slab.position.set(-8.9, 2.9, wz);
    slab.rotation.z = -0.72;
    shafts.add(slab);
  }
  return shafts;
}

function buildDust(light) {
  const rng = mulberry32(1234);
  const count = 260;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = -11.4 + rng() * 6.4;
    positions[i * 3 + 1] = 0.3 + rng() * 5.4;
    positions[i * 3 + 2] = -10.8 + rng() * 6.6;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const dust = new THREE.Points(geometry, new THREE.PointsMaterial({
    color: '#ffe9b8',
    size: 0.05,
    transparent: true,
    opacity: light.dustAlpha,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }));
  dust.userData.basePositions = positions.slice();
  return dust;
}

// --- The reading table and its clutter -----------------------------------------

function buildBankersLamp(x, lit, shadeTilt, light, glowTex) {
  const lamp = new THREE.Group();
  lamp.add(cyl(0.17, 0.2, 0.05, BRASS(), x, TABLE_TOP + 0.03, -3.75, 18));
  const stem = cyl(0.024, 0.024, 0.52, BRASS(), x, TABLE_TOP + 0.3, -3.75, 10);
  stem.rotation.z = 0.1;
  lamp.add(stem);
  const shadeGroup = new THREE.Group();
  shadeGroup.position.set(x, TABLE_TOP + 0.68, -3.75);
  shadeGroup.rotation.z = shadeTilt;
  const shade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.17, 0.31, 0.26, 16, 1, true, 0, Math.PI),
    new THREE.MeshStandardMaterial({
      color: '#1e6e4a',
      emissive: '#2fae72',
      emissiveIntensity: lit ? 0.85 : 0.02,
      roughness: 0.4,
      side: THREE.DoubleSide,
    }),
  );
  shade.rotation.y = Math.PI / 2;
  shade.castShadow = true;
  shadeGroup.add(shade);
  if (lit) {
    lamp.add(ball(0.05, new THREE.MeshBasicMaterial({ color: '#ffe6b0' }), x, TABLE_TOP + 0.6, -3.75, 10, 8));
    const glow = glowSprite(glowTex, '#ffc978', 1.15, light.lampGlow * 0.55);
    glow.position.set(x, TABLE_TOP + 0.62, -3.6);
    lamp.add(glow);
    const point = new THREE.PointLight('#ffd9a0', light.lampLight, 7.5, 1.6);
    point.position.set(x, TABLE_TOP + 0.75, -3.45);
    lamp.add(point);
  }
  lamp.add(shadeGroup);
  return lamp;
}

// The open reading book: two page planes wearing the printed texture,
// a ribbon that lies left, right or tucked, and — in the last round —
// a folded corner. Returns the group; the page number is the state's.
function buildOpenBook(state) {
  const book = new THREE.Group();
  book.position.set(-0.55, TABLE_TOP + 0.02, -2.85);
  book.rotation.y = 0.15;
  const cover = box(1.32, 0.03, 0.92, mat('#6e2430', { roughness: 0.8 }), 0, 0, 0);
  book.add(cover);
  const pages = openPagesTexture(state.pageNumber);
  for (const side of [-1, 1]) {
    const tex = pages.clone();
    tex.needsUpdate = true;
    tex.repeat.set(0.5, 1);
    tex.offset.set(side < 0 ? 0 : 0.5, 0);
    const page = new THREE.Mesh(
      new THREE.PlaneGeometry(0.62, 0.86),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.92 }),
    );
    page.rotation.x = -Math.PI / 2;
    page.rotation.z = side * 0.045;
    page.position.set(side * 0.315, 0.028, 0);
    page.receiveShadow = true;
    book.add(page);
  }
  const ribbonMat = mat('#a02334', { roughness: 0.55 });
  const ribbon = box(0.075, 0.012, 0.52, ribbonMat, 0, 0.04, 0.06, false);
  if (state.bookmarkSide === 'left') {
    ribbon.position.x = -0.3;
    ribbon.rotation.y = 0.18;
  } else if (state.bookmarkSide === 'right') {
    ribbon.position.x = 0.3;
    ribbon.rotation.y = -0.18;
  } else {
    ribbon.position.set(0.02, 0.04, -0.3);
    ribbon.scale.z = 0.22;
  }
  book.add(ribbon);
  if (state.pageFolded) {
    const ear = new THREE.Mesh(
      new THREE.PlaneGeometry(0.17, 0.17),
      new THREE.MeshStandardMaterial({ color: '#e9dcba', roughness: 0.92, side: THREE.DoubleSide }),
    );
    ear.position.set(0.53, 0.045, -0.33);
    ear.rotation.set(-0.8, 0.2, 0.65);
    book.add(ear);
  }
  return book;
}

function buildTableClutter(state, light, glowTex) {
  const clutter = new THREE.Group();
  clutter.add(buildBankersLamp(-1.75, state.leftLampLit, 0, light, glowTex));
  clutter.add(buildBankersLamp(1.75, true, state.rightShadeTilt, light, glowTex));
  clutter.add(buildOpenBook(state));

  // The book stack: four books, or five — round two counts them.
  const stackCloths = ['#33512e', '#7a2e2a', '#274d5e', '#5e4527', '#4a2e4f'];
  for (let i = 0; i < state.stackCount; i += 1) {
    const book = box(0.62 - i * 0.018, 0.13, 0.45, mat(stackCloths[i], { roughness: 0.88 }), 1.15, TABLE_TOP + 0.085 + i * 0.132, -2.7);
    book.rotation.y = (i % 2 === 0 ? 1 : -1) * 0.05 * i;
    clutter.add(book);
  }

  // The spectacles: two iron rings and their temples, resting on the
  // table or — round one's quiet move — on top of the stack.
  const specs = new THREE.Group();
  const onStack = state.glassesOnStack;
  specs.position.set(onStack ? 1.15 : 0.3, TABLE_TOP + (onStack ? 0.16 + state.stackCount * 0.132 : 0.03), onStack ? -2.7 : -3.85);
  specs.rotation.y = 0.5;
  for (const side of [-0.09, 0.09]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.011, 8, 22), IRON());
    ring.rotation.x = Math.PI / 2;
    ring.position.x = side;
    specs.add(ring);
  }
  specs.add(box(0.05, 0.012, 0.012, IRON(), 0, 0, 0, false));
  for (const side of [-1, 1]) {
    const temple = box(0.012, 0.012, 0.34, IRON(), side * 0.17, 0, 0.16, false);
    temple.rotation.y = side * 0.25;
    specs.add(temple);
  }
  clutter.add(specs);

  // The inkwell, its cap, its quill and the ink itself.
  const well = new THREE.Group();
  well.position.set(-1.2, TABLE_TOP, -2.55);
  well.add(cyl(0.075, 0.095, 0.12, mat('#17171d', { roughness: 0.25, metalness: 0.2 }), 0, 0.06, 0, 14));
  const ink = new THREE.Mesh(new THREE.CircleGeometry(0.055, 18), mat(state.inkColor, { roughness: 0.12 }));
  ink.rotation.x = -Math.PI / 2;
  ink.position.y = 0.115;
  well.add(ink);
  const cap = cyl(0.05, 0.05, 0.045, BRASS(), 0, 0.14, 0, 12);
  if (state.inkCapOff) cap.position.set(0.18, -0.06, 0.15);
  well.add(cap);
  const quill = new THREE.Group();
  quill.position.set(-0.02, 0.1, -0.02);
  quill.rotation.z = 0.42;
  const shaft = cyl(0.007, 0.01, 0.36, mat('#e8e2d2', { roughness: 0.5 }), 0, 0.18, 0, 6);
  quill.add(shaft);
  const feather = new THREE.Mesh(
    new THREE.ConeGeometry(0.055, 0.44, 8),
    mat(state.quillBlack ? '#23232a' : '#f0ead8', { roughness: 0.9 }),
  );
  feather.scale.z = 0.28;
  feather.position.y = 0.42;
  quill.add(feather);
  well.add(quill);
  clutter.add(well);

  // The table candle in its brass stick: tall, or burned short.
  const candleH = state.candleShort ? 0.26 : 0.6;
  clutter.add(cyl(0.1, 0.13, 0.045, BRASS(), -2.3, TABLE_TOP + 0.02, -2.8, 14));
  clutter.add(cyl(0.02, 0.035, 0.12, BRASS(), -2.3, TABLE_TOP + 0.1, -2.8, 10));
  clutter.add(cyl(0.036, 0.04, candleH, mat('#e8dcc0', { roughness: 0.55 }), -2.3, TABLE_TOP + 0.16 + candleH / 2, -2.8, 12));
  const candleFlame = flame(1.05, 2.2);
  candleFlame.position.set(-2.3, TABLE_TOP + 0.24 + candleH, -2.8);
  clutter.add(candleFlame);
  const candleGlow = glowSprite(glowTex, '#ffb45e', 0.85, 0.4 * light.candleLight / 4);
  candleGlow.position.set(-2.3, TABLE_TOP + 0.3 + candleH, -2.8);
  clutter.add(candleGlow);

  // The second book: shut, or lying open where someone left it.
  if (state.secondBookOpen) {
    const open = new THREE.Group();
    open.position.set(-2.05, TABLE_TOP + 0.02, -1.95);
    open.rotation.y = -0.4;
    open.add(box(1.06, 0.025, 0.68, mat('#274d5e', { roughness: 0.85 }), 0, 0, 0));
    const mini = openPagesTexture('64');
    for (const side of [-1, 1]) {
      const tex = mini.clone();
      tex.needsUpdate = true;
      tex.repeat.set(0.5, 1);
      tex.offset.set(side < 0 ? 0 : 0.5, 0);
      const page = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.64), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.92 }));
      page.rotation.x = -Math.PI / 2;
      page.position.set(side * 0.255, 0.02, 0);
      open.add(page);
    }
    clutter.add(open);
  } else {
    clutter.add(box(0.55, 0.09, 0.4, mat('#274d5e', { roughness: 0.85 }), -2.05, TABLE_TOP + 0.045, -1.95));
    clutter.add(box(0.5, 0.02, 0.36, mat('#e9dcba', { roughness: 0.92 }), -2.05, TABLE_TOP + 0.1, -1.95, false));
  }

  // The map sheet and the magnifying glass that wanders across it.
  const map = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.95), new THREE.MeshStandardMaterial({ map: mapTexture(), roughness: 0.95 }));
  map.rotation.x = -Math.PI / 2;
  map.rotation.z = 0.12;
  map.position.set(1.9, TABLE_TOP + 0.012, -3.0);
  map.receiveShadow = true;
  clutter.add(map);
  const mag = new THREE.Group();
  const magPos = state.magnifierMoved ? [1.45, -2.35] : [2.0, -3.3];
  mag.position.set(magPos[0], TABLE_TOP + 0.03, magPos[1]);
  mag.rotation.y = state.magnifierMoved ? 0.9 : 0.2;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.015, 8, 24), BRASS());
  ring.rotation.x = Math.PI / 2;
  mag.add(ring);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.105, 24), new THREE.MeshStandardMaterial({ color: '#cfe0e8', transparent: true, opacity: 0.28, roughness: 0.05 }));
  lens.rotation.x = -Math.PI / 2;
  mag.add(lens);
  const handle = cyl(0.016, 0.02, 0.3, mat('#4a3018', { roughness: 0.6 }), 0.2, 0, 0.14, 8);
  handle.rotation.z = Math.PI / 2;
  handle.rotation.y = -0.6;
  mag.add(handle);
  clutter.add(mag);

  return clutter;
}

// --- The table itself, the globe, the fire, the clock, the corner ---------------

function buildTable(state, light, glowTex) {
  const table = new THREE.Group();
  const topTex = woodTexture('#7d5a34', '#5d3f22', '#96703f', 17);
  table.add(box(5.6, 0.12, 2.3, new THREE.MeshStandardMaterial({ map: topTex, roughness: 0.62 }), 0, 0.98, TABLE_Z));
  table.add(box(5.2, 0.2, 1.9, mat('#5d3f22', { roughness: 0.8 }), 0, 0.84, TABLE_Z));
  for (const sx of [-2.6, 2.6]) {
    for (const sz of [-0.95, 0.95]) {
      table.add(box(0.17, 0.94, 0.17, mat('#54381f', { roughness: 0.78 }), sx, 0.47, TABLE_Z + sz));
    }
  }
  table.add(box(5.2, 0.06, 1.8, mat('#4a3018', { roughness: 0.85 }), 0, 0.24, TABLE_Z));
  const under = mulberry32(77);
  for (let i = 0; i < 4; i += 1) {
    const b = box(0.55, 0.11, 0.4, mat(['#33512e', '#7a2e2a', '#274d5e', '#5e4527'][i], { roughness: 0.9 }), -1.6 + i * 0.95, 0.33, TABLE_Z + (under() - 0.5) * 0.4);
    b.rotation.y = (under() - 0.5) * 0.3;
    table.add(b);
  }
  table.add(buildTableClutter(state, light, glowTex));
  return table;
}

// The globe on its stand: a tilted sphere in a brass meridian, wearing
// the old-chart map. The lit continent is a small glowing patch riding
// the sphere's skin; the spin group carries map and patches together.
function buildGlobe(state, glowTex) {
  const globe = new THREE.Group();
  globe.position.set(3.3, 0, 1.6);
  const standWood = mat('#4a3018', { roughness: 0.6 });
  globe.add(cyl(0.52, 0.66, 0.12, standWood, 0, 0.06, 0, 20));
  globe.add(cyl(0.07, 0.1, 0.85, standWood, 0, 0.55, 0, 12));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.035, 10, 40), standWood);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 1.98;
  ring.castShadow = true;
  globe.add(ring);
  for (const a of [0.5, 2.6, 4.7]) {
    const foot = box(0.12, 0.5, 0.12, standWood, Math.cos(a) * 0.82, 1.78, Math.sin(a) * 0.82);
    foot.rotation.z = Math.cos(a) * 0.5;
    foot.rotation.x = -Math.sin(a) * 0.5;
    globe.add(foot);
  }

  const tilt = new THREE.Group();
  tilt.position.y = 2.05;
  tilt.rotation.z = 0.41; // the earth's own tilt, near enough
  const spin = new THREE.Group();
  spin.rotation.y = state.globeSpin;
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.92, 36, 26),
    new THREE.MeshStandardMaterial({ map: globeTexture(), roughness: 0.55 }),
  );
  sphere.castShadow = true;
  spin.add(sphere);
  const meridian = new THREE.Mesh(new THREE.TorusGeometry(0.97, 0.02, 8, 44), BRASS());
  spin.add(meridian);

  // The two patches that can be lit, west and east. A patch is a small
  // amber disc held just off the skin, aimed outward along its normal.
  const patchAt = (lat, lon) => {
    const dir = new THREE.Vector3(
      Math.cos(lat) * Math.sin(lon),
      Math.sin(lat),
      Math.cos(lat) * Math.cos(lon),
    );
    const patch = new THREE.Mesh(
      new THREE.CircleGeometry(0.17, 20),
      new THREE.MeshBasicMaterial({ color: '#ffb347', transparent: true, opacity: 0.8 }),
    );
    patch.position.copy(dir.clone().multiplyScalar(0.935));
    patch.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir.clone().normalize());
    const glow = glowSprite(glowTex, '#ffb347', 0.55, 0.5);
    glow.position.copy(dir.clone().multiplyScalar(0.99));
    const holder = new THREE.Group();
    holder.add(patch);
    holder.add(glow);
    return holder;
  };
  if (state.globeHighlight === 'west') spin.add(patchAt(0.42, -0.62));
  if (state.globeHighlight === 'east') spin.add(patchAt(-0.15, 0.72));
  tilt.add(spin);
  globe.add(tilt);
  return globe;
}

// The fireplace in the back wall, right of the cases: a stone chimney
// breast, logs, flame cones, an ember bed, the mantel candelabrum and
// the founder's portrait above it.
function buildFireplace(state, light, glowTex, parts) {
  const fire = new THREE.Group();
  const stone = mat('#6f6a61', { roughness: 0.95 });
  const stoneDark = mat('#57524b', { roughness: 0.97 });
  fire.add(box(4.3, 9.8, 0.5, stoneDark, 9.6, 4.9, -13.02, false));
  fire.add(box(4.4, 0.07, 1.5, stoneDark, 9.6, 0.035, -12.35, false));
  fire.add(box(0.5, 2.3, 0.55, stone, 8.35, 1.15, -12.62));
  fire.add(box(0.5, 2.3, 0.55, stone, 10.85, 1.15, -12.62));
  fire.add(box(3.0, 0.55, 0.55, stone, 9.6, 2.55, -12.62));
  fire.add(box(3.9, 0.09, 0.85, mat('#4a3018', { roughness: 0.6 }), 9.6, 2.88, -12.55));
  fire.add(box(2.0, 1.95, 0.5, mat('#0d0a08', { roughness: 1 }), 9.6, 0.98, -12.8, false));

  const logMat = mat('#33241a', { roughness: 1 });
  for (const [lx, ly, lz, tiltY] of [[9.6, 0.3, -12.78, 0.15], [9.6, 0.3, -12.58, -0.1], [9.6, 0.48, -12.68, 0.4]]) {
    const log = cyl(0.09, 0.09, 1.15, logMat, lx, ly, lz, 10);
    log.rotation.z = Math.PI / 2;
    log.rotation.y = tiltY;
    fire.add(log);
  }
  // The ember bed: a scatter of coals that glow, or have gone dull.
  const emberMat = new THREE.MeshStandardMaterial({
    color: '#1f130c',
    emissive: '#ff5a1e',
    emissiveIntensity: state.embersLit ? 1.6 : 0.04,
    roughness: 1,
  });
  const emberRng = mulberry32(31);
  for (let i = 0; i < 7; i += 1) {
    const ember = ball(0.045 + emberRng() * 0.03, emberMat, 9.25 + emberRng() * 0.7, 0.36, -12.85 + emberRng() * 0.35, 8, 6);
    ember.castShadow = false;
    fire.add(ember);
  }
  // Flame cones over the logs: three, or two — round two loses one.
  const flameSpots = [[9.32, 0.78, -12.72], [9.6, 0.92, -12.66], [9.88, 0.74, -12.74]];
  flameSpots.slice(0, state.flames).forEach(([fx, fy, fz], i) => {
    const f = flame(3.1 - i * 0.35, i * 1.7);
    f.position.set(fx, fy, fz);
    fire.add(f);
    parts.flames.push(f);
  });
  const fireGlow = glowSprite(glowTex, '#ff8a3c', 2.7, light.fireGlow * 0.55);
  fireGlow.position.set(9.6, 0.95, -12.3);
  fire.add(fireGlow);
  const fireLight = new THREE.PointLight('#ff8a3c', light.fireLight, 13, 1.7);
  fireLight.position.set(9.6, 1.15, -11.9);
  fire.add(fireLight);
  parts.fireLight = fireLight;
  parts.fireBase = light.fireLight;

  // The candelabrum on the mantel: three candles in a row, the middle
  // one's flame a first-round change.
  const labrum = new THREE.Group();
  labrum.position.set(9.6, 2.93, -12.55);
  labrum.add(cyl(0.09, 0.13, 0.05, BRASS(), 0, 0.02, 0, 12));
  labrum.add(cyl(0.02, 0.02, 0.3, BRASS(), 0, 0.18, 0, 8));
  for (const off of [-0.34, 0, 0.34]) {
    labrum.add(box(Math.abs(off) + 0.03, 0.03, 0.03, BRASS(), off / 2, 0.3, 0, false));
    labrum.add(cyl(0.032, 0.038, 0.3, mat('#e8dcc0', { roughness: 0.55 }), off, 0.44, 0, 10));
    const lit = off !== 0 || state.mantelMiddleLit;
    if (lit) {
      const f = flame(0.95, off * 3);
      f.position.set(off, 0.68, 0);
      labrum.add(f);
      parts.flames.push(f);
      const g = glowSprite(glowTex, '#ffb45e', 0.55, 0.38 * light.candleLight / 4);
      g.position.set(off, 0.7, -0.05);
      labrum.add(g);
    }
  }
  fire.add(labrum);

  // The portrait, in its gilt frame, straight or slipped on its nail.
  const portrait = new THREE.Group();
  portrait.position.set(9.6, 4.35, -12.68);
  portrait.rotation.z = state.portraitTilt;
  portrait.add(box(1.54, 1.94, 0.07, mat('#8a6a2f', { roughness: 0.4, metalness: 0.6 }), 0, 0, 0));
  const canvas = new THREE.Mesh(
    new THREE.PlaneGeometry(1.34, 1.74),
    new THREE.MeshStandardMaterial({ map: portraitTexture(), roughness: 0.9 }),
  );
  canvas.position.z = 0.045;
  portrait.add(canvas);
  fire.add(portrait);
  return fire;
}

// The longcase clock, standing before the left bay: a painted face,
// two hands the changes can move, and a glass trunk with a swinging
// pendulum and two weights, one of which can sink.
function buildClock(state, parts) {
  const clock = new THREE.Group();
  clock.position.set(-4.75, 0, -12.1);
  const caseMat = new THREE.MeshStandardMaterial({ map: woodTexture('#5d3f22', '#3f2812', '#77552e', 29), roughness: 0.65 });
  clock.add(box(1.18, 0.16, 0.66, caseMat, 0, 0.08, 0));
  clock.add(box(1.05, 1.85, 0.56, caseMat, 0, 1.05, 0));
  clock.add(box(1.28, 1.06, 0.64, caseMat, 0, 2.5, 0));
  clock.add(box(1.36, 0.1, 0.7, caseMat, 0, 3.08, 0));
  const face = new THREE.Mesh(
    new THREE.CircleGeometry(0.44, 28),
    new THREE.MeshStandardMaterial({ map: clockFaceTexture(), roughness: 0.6 }),
  );
  face.position.set(0, 2.52, 0.33);
  clock.add(face);

  const handMat = mat('#2c1e10', { roughness: 0.4, metalness: 0.4 });
  const handGroup = new THREE.Group();
  handGroup.position.set(0, 2.52, 0.35);
  const hourAngle = -(((state.clockHour % 12) + state.clockMinute / 60) / 12) * Math.PI * 2;
  const minuteAngle = -(state.clockMinute / 60) * Math.PI * 2;
  const hourHand = box(0.05, 0.27, 0.015, handMat, 0, 0.09, 0, false);
  const hourPivot = new THREE.Group();
  hourPivot.rotation.z = hourAngle;
  hourPivot.add(hourHand);
  const minuteHand = box(0.036, 0.4, 0.015, handMat, 0, 0.14, 0.008, false);
  const minutePivot = new THREE.Group();
  minutePivot.rotation.z = minuteAngle;
  minutePivot.add(minuteHand);
  handGroup.add(hourPivot);
  handGroup.add(minutePivot);
  handGroup.add(cyl(0.035, 0.035, 0.03, BRASS(), 0, 0, 0.012, 12));
  clock.add(handGroup);

  // The trunk's glass and what swings and hangs behind it.
  const glass = box(0.72, 1.5, 0.02, new THREE.MeshStandardMaterial({ color: '#b8ccd4', transparent: true, opacity: 0.16, roughness: 0.08 }), 0, 1.08, 0.29, false);
  clock.add(glass);
  const pendulum = new THREE.Group();
  pendulum.position.set(0, 1.82, 0);
  const rod = cyl(0.014, 0.014, 0.95, BRASS(), 0, -0.48, 0, 8);
  pendulum.add(rod);
  const bob = cyl(0.115, 0.115, 0.03, BRASS(), 0, -0.98, 0, 20);
  bob.rotation.x = Math.PI / 2;
  pendulum.add(bob);
  clock.add(pendulum);
  parts.pendulum = pendulum;
  for (const side of [-0.19, 0.19]) {
    const sunk = side < 0 && state.clockWeightLow;
    clock.add(cyl(0.012, 0.012, 0.5, IRON(), side, 1.6, -0.05, 6));
    clock.add(cyl(0.052, 0.052, 0.42, mat('#6e5a30', { roughness: 0.4, metalness: 0.7 }), side, sunk ? 0.92 : 1.24, -0.05, 12));
  }
  return clock;
}

// The armchair corner: a leather wing chair, its side table with a
// book and a teacup, and a footstool with one more book.
function buildArmchairCorner(state) {
  const corner = new THREE.Group();
  const leather = mat('#71422c', { roughness: 0.72 });
  const leatherDark = mat('#57302a', { roughness: 0.78 });
  const chair = new THREE.Group();
  chair.position.set(-4.5, 0, 0.6);
  chair.rotation.y = 0.55;
  chair.add(box(1.06, 0.3, 0.96, leatherDark, 0, 0.42, 0));
  chair.add(box(0.92, 0.16, 0.82, leather, 0, 0.63, 0.02));
  const back = box(1.06, 1.25, 0.24, leather, 0, 1.18, -0.42);
  back.rotation.x = -0.1;
  chair.add(back);
  for (const side of [-0.56, 0.56]) {
    const wing = box(0.2, 0.85, 0.55, leather, side, 1.22, -0.24);
    wing.rotation.y = -side * 0.35;
    chair.add(wing);
    chair.add(box(0.22, 0.16, 0.88, leather, side, 0.82, 0.02));
    chair.add(box(0.16, 0.42, 0.16, leatherDark, side, 0.55, 0.3));
    chair.add(cyl(0.045, 0.06, 0.28, mat('#3a2415', { roughness: 0.7 }), side * 0.92, 0.14, 0.38, 10));
    chair.add(cyl(0.045, 0.06, 0.28, mat('#3a2415', { roughness: 0.7 }), side * 0.92, 0.14, -0.38, 10));
  }
  corner.add(chair);

  const stool = box(0.72, 0.24, 0.5, leatherDark, -4.15, 0.12, 1.95);
  stool.rotation.y = 0.4;
  corner.add(stool);
  const stoolBook = box(0.44, 0.08, 0.32, mat('#33512e', { roughness: 0.88 }), -4.15, 0.28, 1.95);
  stoolBook.rotation.y = 0.75;
  corner.add(stoolBook);

  // The side table: a book whose ribbon changes colour, and the cup.
  const side = new THREE.Group();
  side.position.set(-5.9, 0, -0.7);
  side.add(cyl(0.44, 0.44, 0.05, mat('#4a3018', { roughness: 0.55 }), 0, 0.76, 0, 20));
  side.add(cyl(0.05, 0.05, 0.72, mat('#3a2415', { roughness: 0.6 }), 0, 0.38, 0, 10));
  side.add(cyl(0.3, 0.36, 0.05, mat('#3a2415', { roughness: 0.6 }), 0, 0.03, 0, 16));
  const tableBook = box(0.5, 0.085, 0.36, mat('#54383e', { roughness: 0.88 }), 0, 0.83, 0.08);
  tableBook.rotation.y = 0.3;
  side.add(tableBook);
  const ribbon = box(0.06, 0.014, 0.46, mat(state.chairRibbon === 'blue' ? '#274d8a' : '#a02334', { roughness: 0.55 }), 0.05, 0.88, 0.1, false);
  ribbon.rotation.y = 0.3;
  side.add(ribbon);
  const cup = new THREE.Group();
  cup.position.set(0.25, 0.785, -0.35);
  cup.add(cyl(0.09, 0.065, 0.018, mat('#e6e0d2', { roughness: 0.35 }), 0, 0.01, 0, 16));
  cup.add(cyl(0.058, 0.04, 0.075, mat('#ece5d5', { roughness: 0.3 }), 0, 0.055, 0, 16));
  const tea = new THREE.Mesh(
    new THREE.CircleGeometry(0.05, 16),
    mat(state.teaEmpty ? '#ddd3c0' : '#5a3a1a', { roughness: 0.25 }),
  );
  tea.rotation.x = -Math.PI / 2;
  tea.position.y = 0.088;
  cup.add(tea);
  side.add(cup);
  corner.add(side);
  return corner;
}

// The pendant lamp over the table: a chain, a brass hub and three
// glass globes, one of which can go dim in the last round.
function buildPendant(state, light, glowTex) {
  const pendant = new THREE.Group();
  pendant.add(cyl(0.016, 0.016, 2.2, IRON(), 0, 9.95, -3, 8));
  pendant.add(ball(0.09, BRASS(), 0, 8.82, -3, 14, 10));
  for (let i = 0; i < 3; i += 1) {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    const gx = Math.cos(a) * 0.58;
    const gz = -3 + Math.sin(a) * 0.58;
    const arm = cyl(0.018, 0.018, 0.62, BRASS(), gx / 2, 8.78, -3 + Math.sin(a) * 0.29, 8);
    arm.rotation.z = Math.PI / 2 - 0.18;
    arm.rotation.y = -a;
    pendant.add(arm);
    const dim = state.pendantDim && i === 0;
    const globeBall = ball(0.145, new THREE.MeshStandardMaterial({
      color: '#f5e3bc',
      emissive: '#ffca7a',
      emissiveIntensity: dim ? 0.06 : 1.1,
      roughness: 0.3,
      transparent: true,
      opacity: 0.96,
    }), gx, 8.62, gz, 16, 12);
    pendant.add(globeBall);
    if (!dim) {
      const glow = glowSprite(glowTex, '#ffc978', 0.85, light.lampGlow * 0.5);
      glow.position.set(gx, 8.62, gz);
      pendant.add(glow);
    }
  }
  const point = new THREE.PointLight('#ffd9a0', light.lampLight * 0.85, 12, 1.6);
  point.position.set(0, 8.3, -3);
  pendant.add(point);
  return pendant;
}

// Two untidy stacks of books on the floor, for the foreground's sake.
function buildFloorStacks() {
  const stacks = new THREE.Group();
  const rng = mulberry32(53);
  for (const [sx, sz, n] of [[-3.3, -8.6, 5], [6.1, -9.2, 4]]) {
    let y = 0;
    for (let i = 0; i < n; i += 1) {
      const t = 0.11 + rng() * 0.05;
      const b = box(0.58 - i * 0.02, t, 0.42, mat(['#7a2e2a', '#33512e', '#274d5e', '#5e4527', '#4a2e4f'][Math.floor(rng() * 5)], { roughness: 0.9 }), sx + (rng() - 0.5) * 0.05, y + t / 2, sz + (rng() - 0.5) * 0.05);
      b.rotation.y = (rng() - 0.5) * 0.35;
      stacks.add(b);
      y += t;
    }
  }
  return stacks;
}

// Everything furnishings.js builds, in one call for hall.js.
export function buildFurnishings(state, light, glowTex, parts) {
  const all = new THREE.Group();
  all.add(buildShell(state, light));
  all.add(buildShafts(light, glowTex));
  const dust = buildDust(light);
  all.add(dust);
  parts.dust = dust;
  all.add(buildTable(state, light, glowTex));
  all.add(buildGlobe(state, glowTex));
  all.add(buildFireplace(state, light, glowTex, parts));
  all.add(buildClock(state, parts));
  all.add(buildArmchairCorner(state));
  all.add(buildPendant(state, light, glowTex));
  all.add(buildFloorStacks());
  return all;
}
