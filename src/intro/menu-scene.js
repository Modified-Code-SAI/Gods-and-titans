// The title screen's live backdrop (DESIGN 9, "Live title backdrop"): the intro film's Greek village (stage.js,
// peaceful: no armies, no cues) at work in the golden hour, drawn by the real GameRenderer while the camera circles
// it slowly. The painted night sky (ui/menu-fx.js) stays underneath as the fallback and shows until this is ready.
//
//   const scene = new MenuScene({ canvas, Renderer: GameRenderer, quality });
//   scene.advance(dt); scene.draw(now);   // once a frame
//   scene.dispose();                      // frees the renderer's GL context (before a match or the film)
import { IntroStage } from './stage.js';
import { FilmSky } from './sky.js';

/** Seconds for one full circle of the camera round the village. */
export const ORBIT_SECONDS = 240;
/** The hour the backdrop holds: late golden light, long shadows. */
export const MENU_HOUR = 17.4;
const MAX_DT = 0.1;
// the circle: the camera looks at a point a little south of the town centre (between it, the temple and the houses)
const AIM = { dx: 3, dy: 3 };
const POSE = { dist: 34, pitch: 22, lift: 0.5, fov: 38 };
const START_YAW = 35; // degrees: the opening framing, the temple and the houses toward the camera

/** The camera pose at backdrop second t, round the point `at`. */
export function menuPose(at, t, out = {}) {
  out.x = at.x + AIM.dx;
  out.y = at.y + AIM.dy;
  out.dist = POSE.dist + Math.sin((t / ORBIT_SECONDS) * Math.PI * 4) * 2.5; // breathes in and out a little twice a circle
  out.pitch = POSE.pitch + Math.sin((t / ORBIT_SECONDS) * Math.PI * 2) * 2;
  out.yaw = START_YAW + (t / ORBIT_SECONDS) * 360;
  out.lift = POSE.lift;
  out.fov = POSE.fov;
  return out;
}

export class MenuScene {
  /**
   * @param {object} o
   * @param {HTMLCanvasElement} o.canvas
   * @param {Function} o.Renderer the GameRenderer class
   * @param {'low'|'medium'|'high'|'ultra'} [o.quality]
   * @param {object} [o.webgl] an existing WebGL renderer (tests)
   */
  constructor({ canvas, Renderer, quality = 'medium', webgl = null }) {
    this.stage = new IntroStage({ density: quality === 'low' ? 0.6 : 1, peaceful: true });
    this.t = 0;
    this.pose = menuPose(this.stage.anchors.village, 0);
    this.renderer = new Renderer(canvas, { viewState: this.stage.vs, setup: this.stage.setup, quality, webgl, timeOfDay: MENU_HOUR });
    this.renderer.camera.setFree(this.pose);
    // no health bars, rank pips or status icons: a picture, not a match
    const quiet = () => {};
    if (this.renderer.bars) this.renderer.bars.add = quiet;
    if (this.renderer.status) {
      this.renderer.status.addRank = quiet;
      this.renderer.status.addIcons = quiet;
    }
    this.sky = new FilmSky();
    this.renderer.scene.add(this.sky.mesh);
    if (this.renderer.terrain && this.renderer.terrain.border) this.renderer.terrain.border.visible = false;
    // a few seconds of the village at work before the first frame, so the workers are already busy
    for (let i = 0; i < 40; i++) this.stage.advance(0.1);
    this.paintSky();
  }

  /** Move the backdrop on by dt seconds: the village, the camera, the sky. */
  advance(dt) {
    dt = Math.max(0, Math.min(MAX_DT, dt || 0));
    this.t += dt;
    this.stage.advance(dt);
    menuPose(this.stage.anchors.village, this.t, this.pose);
    this.renderer.atmo.setMode(MENU_HOUR);
    this.renderer.update(dt);
    this.paintSky();
  }

  paintSky() {
    this.sky.update(this.renderer.atmo.state, this.renderer.threeCamera.position, this.t);
  }

  draw(now) {
    this.renderer.render(now);
  }

  resize(w, h) {
    this.renderer.resize(w, h);
  }

  dispose() {
    this.renderer.scene.remove(this.sky.mesh);
    this.sky.dispose();
    this.renderer.dispose();
  }
}
