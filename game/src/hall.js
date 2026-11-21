// hall.js — the old library, assembled: one scene per panel state.
//
// buildHall takes a hall state and the round's light, raises the room
// (book wall from shelves.js, everything else from furnishings.js),
// lights it, and returns the scene with its update and dispose. The
// animation is a function of t alone — flames breathe, the pendulum
// swings, dust drifts down the light shafts, the fire's light breathes
// with its flames — so a frozen t, as the screenshot modes use, freezes
// the whole room mid-gesture in both panels alike.

const THREE = window.THREE;

import { glowTexture } from './paperwork.js';
import { buildBookWall } from './shelves.js';
import { buildFurnishings } from './furnishings.js';

export function buildHall(state, light) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(light.room);
  scene.fog = new THREE.Fog(light.room, 26, 46);

  const glowTex = glowTexture();
  const parts = { flames: [], fireLight: null, fireBase: 0, pendulum: null, dust: null };

  scene.add(new THREE.HemisphereLight(light.hemiSky, light.hemiGround, light.hemiIntensity));
  const sun = new THREE.DirectionalLight(light.sunColor, light.sunIntensity);
  sun.position.set(...light.sunPosition);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -15;
  sun.shadow.camera.right = 15;
  sun.shadow.camera.top = 13;
  sun.shadow.camera.bottom = -3;
  sun.shadow.camera.far = 60;
  sun.shadow.bias = -0.0006;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(light.fillColor, light.fillIntensity);
  fill.position.set(6, 9, 14);
  scene.add(fill);

  scene.add(buildBookWall(state, light, glowTex));
  scene.add(buildFurnishings(state, light, glowTex, parts));

  // Candle and sconce flames were built by joinery's flame(); gather
  // them all so the animation can breathe them together.
  scene.traverse((obj) => {
    if (obj.userData && obj.userData.flamePhase !== undefined && !parts.flames.includes(obj)) {
      parts.flames.push(obj);
    }
  });

  const dustBase = parts.dust ? parts.dust.userData.basePositions : null;

  return {
    scene,
    update(t) {
      for (const f of parts.flames) {
        const phase = f.userData.flamePhase || 0;
        const flicker = 0.9 + 0.13 * Math.sin(t * 9 + phase * 3.1) + 0.05 * Math.sin(t * 23 + phase);
        f.scale.y = flicker;
        f.rotation.z = 0.05 * Math.sin(t * 7 + phase * 2.0);
      }
      if (parts.fireLight) {
        parts.fireLight.intensity = parts.fireBase * (0.92 + 0.1 * Math.sin(t * 8.3) + 0.04 * Math.sin(t * 19.7));
      }
      if (parts.pendulum) {
        parts.pendulum.rotation.z = 0.17 * Math.sin(t * 1.9);
      }
      if (parts.dust && dustBase) {
        const attr = parts.dust.geometry.getAttribute('position');
        for (let i = 0; i < attr.count; i += 1) {
          const fall = ((t * 0.05 + (i % 13) * 0.077) % 1) * 1.6;
          attr.array[i * 3 + 1] = dustBase[i * 3 + 1] - fall;
          attr.array[i * 3] = dustBase[i * 3] + Math.sin(t * 0.4 + i) * 0.08;
        }
        attr.needsUpdate = true;
      }
    },
    dispose() {
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
          for (const m of materials) {
            if (m.map) m.map.dispose();
            m.dispose();
          }
        }
      });
    },
  };
}
