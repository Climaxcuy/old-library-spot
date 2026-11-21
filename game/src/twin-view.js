// twin-view.js — the two panels and the one camera they share.
//
// Each panel is a WebGL canvas showing the same library from the same
// camera: the left renders the base state, the right the changed state.
// Because the camera is shared, a 3D anchor projects to the same pixel
// in both panels — which is what lets one set of rings, one hint pulse
// and one keyboard lens serve both, and what makes a click in either
// panel mean the same place in the room.

const THREE = window.THREE;

export const PANEL_W = 560;
export const PANEL_H = 420;

export function createTwinView(leftCanvas, rightCanvas) {
  const camera = new THREE.PerspectiveCamera(45, PANEL_W / PANEL_H, 0.1, 120);
  camera.position.set(0.2, 4.3, 14.2);
  camera.lookAt(0.5, 3.25, -6);
  camera.updateMatrixWorld();

  function makeRenderer(canvas) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(PANEL_W, PANEL_H, false);
    renderer.setPixelRatio(1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    return renderer;
  }

  const left = makeRenderer(leftCanvas);
  const right = makeRenderer(rightCanvas);
  const vector = new THREE.Vector3();

  return {
    camera,
    setExposure(value) {
      left.toneMappingExposure = value;
      right.toneMappingExposure = value;
    },
    render(leftHall, rightHall) {
      if (leftHall) left.render(leftHall.scene, camera);
      if (rightHall) right.render(rightHall.scene, camera);
    },
    // Projects a 3D anchor {x, y, z} to panel pixels {x, y, behind}.
    project(anchor, out) {
      vector.set(anchor.x, anchor.y, anchor.z).project(camera);
      out.x = (vector.x * 0.5 + 0.5) * PANEL_W;
      out.y = (-vector.y * 0.5 + 0.5) * PANEL_H;
      out.behind = vector.z > 1;
      return out;
    },
  };
}
