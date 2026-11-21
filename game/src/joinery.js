// joinery.js — the carpenter's bench: tiny shared mesh makers.
//
// Every builder in the hall reaches for the same few shapes — a box in a
// material, a turned cylinder, a ball, a sheet of glow — so they live
// here, named for what they make, and the room's own builders stay about
// the room. (three.min.js is vendored under game/vendor/ and loaded
// before these modules; it provides the global THREE.)

const THREE = window.THREE;

// A standard material in a flat colour, with the hall's usual roughness.
export function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.05, ...opts });
}

// Polished brass, for lamp stems, ladder wheels and clock fittings.
export const BRASS = () => mat('#b08d3e', { roughness: 0.35, metalness: 0.85 });
// Dark iron, for the fittings that are not brass.
export const IRON = () => mat('#2e2a26', { roughness: 0.55, metalness: 0.7 });

export function box(w, h, d, material, x = 0, y = 0, z = 0, shadow = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = shadow;
  mesh.receiveShadow = true;
  return mesh;
}

export function cyl(rt, rb, h, material, x = 0, y = 0, z = 0, seg = 14) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function ball(r, material, x = 0, y = 0, z = 0, wSeg = 18, hSeg = 14) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, wSeg, hSeg), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// A billboard of soft light around anything that burns. Additive, depth-
// blind and unlit, so it reads as glow at any exposure.
export function glowSprite(texture, color, scale, opacity) {
  const material = new THREE.SpriteMaterial({
    map: texture,
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(scale, scale, 1);
  return sprite;
}

// A candle flame: a small stretched cone in emissive amber. It sways in
// hall.js's animation by name, so it carries its phase with it.
export function flame(scale = 1, phase = 0) {
  const mesh = new THREE.Mesh(
    new THREE.ConeGeometry(0.035 * scale, 0.16 * scale, 8),
    new THREE.MeshBasicMaterial({ color: '#ffc46b' }),
  );
  mesh.userData.flamePhase = phase;
  return mesh;
}
