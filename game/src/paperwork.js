// paperwork.js — the painted surfaces of the old library.
//
// Every texture is a small canvas painted once per hall build with fixed
// seeds, so the two panels wear pixel-identical wood, cloth, parchment
// and print: the only differences between them are the designed ones.
// (three.min.js is vendored under game/vendor/ and loaded before this
// module; it provides the global THREE.)

const THREE = window.THREE;

import { mulberry32 } from './seeded-random.js';

function paintedTexture(width, height, paint) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  paint(canvas.getContext('2d'), width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

// A soft radial glow, drawn around lamps, candles and the fire.
export function glowTexture() {
  return paintedTexture(128, 128, (ctx, w, h) => {
    const gradient = ctx.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.35, 'rgba(255, 255, 255, 0.45)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  });
}

// Planked wood: seams, grain and the odd knot, in a base tone the caller
// picks — pale oak for the floor, dark walnut for the cases.
export function woodTexture(base, dark, light, seed = 5) {
  return paintedTexture(256, 256, (ctx, w, h) => {
    const rng = mulberry32(seed);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    const planks = 4;
    for (let p = 0; p < planks; p += 1) {
      const y = (p * h) / planks;
      ctx.fillStyle = p % 2 === 0 ? light : base;
      ctx.globalAlpha = 0.28;
      ctx.fillRect(0, y, w, h / planks);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(30, 18, 6, 0.28)';
      ctx.lineWidth = 1;
      for (let g = 0; g < 8; g += 1) {
        const gy = y + 3 + rng() * (h / planks - 6);
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.bezierCurveTo(w * 0.35, gy + 2.5, w * 0.65, gy - 2.5, w, gy + 1);
        ctx.stroke();
      }
      if (rng() > 0.45) {
        const kx = rng() * w;
        const ky = y + h / planks / 2;
        ctx.strokeStyle = 'rgba(30, 18, 6, 0.4)';
        ctx.beginPath();
        ctx.ellipse(kx, ky, 4.5, 2.6, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = dark;
      ctx.fillRect(0, y, w, 2.5);
    }
  });
}

// The rug under the reading table: a deep red field, a border of diamonds
// and a worn middle, drawn flat so it reads from the camera's height.
export function rugTexture() {
  return paintedTexture(512, 340, (ctx, w, h) => {
    const rng = mulberry32(23);
    ctx.fillStyle = '#6e2430';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#571c28';
    ctx.fillRect(18, 18, w - 36, h - 36);
    ctx.strokeStyle = '#c9a24d';
    ctx.lineWidth = 3;
    ctx.strokeRect(26, 26, w - 52, h - 52);
    ctx.strokeStyle = '#8a5a34';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(40, 40, w - 80, h - 80);
    ctx.fillStyle = '#c9a24d';
    for (let x = 52; x < w - 40; x += 34) {
      for (let y = 52; y < h - 40; y += 34) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-4.5, -4.5, 9, 9);
        ctx.restore();
      }
    }
    ctx.fillStyle = 'rgba(240, 220, 180, 0.05)';
    for (let i = 0; i < 380; i += 1) ctx.fillRect(rng() * w, rng() * h, 2.4, 2.4);
  });
}

// A book's spine, painted to order: cloth colour, two gilt rules and the
// title set vertically in serif capitals — the titles are the game's
// smallest print, and three of them are misprinted in the right panel.
export function spineTexture(title, cloth, band = '#c9a24d') {
  return paintedTexture(96, 384, (ctx, w, h) => {
    ctx.fillStyle = cloth;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.fillRect(0, 0, 10, h);
    ctx.fillRect(w - 10, 0, 10, h);
    ctx.fillStyle = band;
    ctx.fillRect(8, 26, w - 16, 5);
    ctx.fillRect(8, h - 34, w - 16, 5);
    ctx.save();
    ctx.translate(w / 2 + 13, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = 'bold 40px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#e8cf8f';
    ctx.fillText(title, 0, 0);
    ctx.restore();
  });
}

// The two open pages of the reading book: ruled lines of grey "print", a
// chapter head, and the page number at the outer foot — the number is a
// difference in round two, so it is painted from the state.
export function openPagesTexture(pageNumber) {
  return paintedTexture(512, 300, (ctx, w, h) => {
    const rng = mulberry32(41);
    ctx.fillStyle = '#efe3c2';
    ctx.fillRect(0, 0, w, h);
    const gutter = ctx.createLinearGradient(w / 2 - 26, 0, w / 2 + 26, 0);
    gutter.addColorStop(0, 'rgba(120, 90, 40, 0)');
    gutter.addColorStop(0.5, 'rgba(120, 90, 40, 0.35)');
    gutter.addColorStop(1, 'rgba(120, 90, 40, 0)');
    ctx.fillStyle = gutter;
    ctx.fillRect(w / 2 - 26, 0, 52, h);
    ctx.fillStyle = '#4a3a22';
    ctx.font = 'bold 21px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('CHAPTER IX', w / 4, 44);
    ctx.fillText('THE READING ROOM', (3 * w) / 4, 44);
    ctx.fillStyle = 'rgba(74, 58, 34, 0.75)';
    for (const x0 of [36, w / 2 + 36]) {
      for (let row = 0; row < 11; row += 1) {
        const y = 78 + row * 17;
        const len = (w / 2 - 76) * (0.82 + rng() * 0.18);
        ctx.fillRect(x0, y, len, 3.2);
      }
    }
    ctx.fillStyle = '#4a3a22';
    ctx.font = '17px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText(pageNumber, 40, h - 18);
    ctx.textAlign = 'right';
    ctx.fillText(String(Number(pageNumber) + 1), w - 40, h - 18);
  });
}

// The globe's skin: an old-chart ocean, six continent smudges and a
// graticule. The lit continent is a separate glowing patch (see
// furnishings.js), so the map itself never changes between panels.
export function globeTexture() {
  return paintedTexture(512, 256, (ctx, w, h) => {
    const rng = mulberry32(97);
    ctx.fillStyle = '#31556e';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(230, 220, 190, 0.25)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 8; i += 1) {
      ctx.beginPath();
      ctx.moveTo((i * w) / 8, 0);
      ctx.lineTo((i * w) / 8, h);
      ctx.stroke();
    }
    for (let i = 1; i < 4; i += 1) {
      ctx.beginPath();
      ctx.moveTo(0, (i * h) / 4);
      ctx.lineTo(w, (i * h) / 4);
      ctx.stroke();
    }
    ctx.fillStyle = '#b39b5e';
    const continents = [
      [70, 60, 52, 30], [105, 118, 30, 44], [185, 52, 66, 26], [215, 96, 40, 34],
      [300, 66, 58, 30], [330, 128, 34, 40], [425, 88, 62, 36], [452, 150, 30, 26],
    ];
    for (const [cx, cy, rx, ry] of continents) {
      for (let b = 0; b < 7; b += 1) {
        ctx.beginPath();
        ctx.ellipse(cx + (rng() - 0.5) * rx, cy + (rng() - 0.5) * ry, rx * (0.3 + rng() * 0.3), ry * (0.3 + rng() * 0.3), rng() * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.fillStyle = 'rgba(240, 230, 200, 0.5)';
    ctx.fillRect(0, 0, w, 12);
    ctx.fillRect(0, h - 12, w, 12);
  });
}

// The longcase clock's face: cream, ringed, with roman hours. The hands
// are meshes (see furnishings.js) so the changes can move them.
export function clockFaceTexture() {
  return paintedTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#2c1e10';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#efe3c2';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 108, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8a6a2f';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 104, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#3a2a16';
    ctx.font = 'bold 25px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const numerals = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    numerals.forEach((text, i) => {
      const a = (i / 12) * Math.PI * 2;
      ctx.fillText(text, w / 2 + Math.sin(a) * 78, h / 2 - Math.cos(a) * 78);
    });
    ctx.font = 'italic 15px Georgia, serif';
    ctx.fillText('Tempus Fugit', w / 2, h / 2 + 46);
  });
}

// The portrait above the fire: a gilt-framed silhouette of the library's
// founder, painted in umbers — nobody alive remembers her name.
export function portraitTexture() {
  return paintedTexture(256, 320, (ctx, w, h) => {
    ctx.fillStyle = '#4d3a26';
    ctx.fillRect(0, 0, w, h);
    const glow = ctx.createRadialGradient(w / 2, h * 0.42, 10, w / 2, h * 0.42, 170);
    glow.addColorStop(0, '#8a6c42');
    glow.addColorStop(1, '#3a2a18');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#241a10';
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.38, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(w / 2, h * 0.86, 74, 58, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c9a24d';
    ctx.fillRect(w / 2 - 3, h * 0.52, 6, 26);
    ctx.strokeStyle = '#c9a24d';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, w - 20, h - 20);
  });
}

// The everyday spine: pale cloth with two raised bands, painted once
// and tinted per book by the material colour, so a whole shelf of
// ordinary books still shows its binding when the light rakes across.
export function genericSpineTexture() {
  return paintedTexture(64, 256, (ctx, w, h) => {
    ctx.fillStyle = '#cfc4b0';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(70, 50, 25, 0.35)';
    ctx.fillRect(0, 30, w, 9);
    ctx.fillRect(0, 52, w, 5);
    ctx.fillRect(0, h - 58, w, 5);
    ctx.fillRect(0, h - 40, w, 9);
    ctx.fillStyle = 'rgba(70, 50, 25, 0.18)';
    ctx.fillRect(0, 0, 7, h);
    ctx.fillRect(w - 7, 0, 7, h);
  });
}

// The map sheet under the magnifying glass: parchment, a coastline, a
// dashed voyage and a compass rose.
export function mapTexture() {
  return paintedTexture(256, 192, (ctx, w, h) => {
    const rng = mulberry32(61);
    ctx.fillStyle = '#e2d0a4';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#7a6242';
    ctx.lineWidth = 2;
    ctx.strokeRect(6, 6, w - 12, h - 12);
    ctx.fillStyle = '#a8b98a';
    ctx.beginPath();
    ctx.moveTo(20, 150);
    for (let x = 20; x <= 130; x += 14) ctx.lineTo(x, 140 - rng() * 60);
    ctx.lineTo(130, 170);
    ctx.lineTo(20, 170);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#8a4a3a';
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(40, 150);
    ctx.bezierCurveTo(110, 90, 160, 120, 215, 55);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = '#5a4632';
    ctx.beginPath();
    ctx.arc(205, 140, 17, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(205, 123);
    ctx.lineTo(205, 157);
    ctx.moveTo(188, 140);
    ctx.lineTo(222, 140);
    ctx.stroke();
  });
}
