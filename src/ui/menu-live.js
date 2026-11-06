// The live 3D title backdrop on the page (DESIGN 9, "Live title backdrop"; the scene is src/intro/menu-scene.js).
// A canvas over the painted night sky (menu-fx.js) that fades in once the village is drawn, and steps aside again
// for good when the machine cannot keep it smooth. It loads only while the menu shows and frees its GL context
// whenever the menu hides (a match, the intro film), so a match never shares the GPU with it.
//
//   const live = createLiveBackdrop(container, { quality: () => settings.quality, enabled: () => settings.liveMenu });
//   live.start(); live.setMode('full' | 'calm'); live.stop();
import { h } from './menu-dom.js';

/** Seconds of frames before the speed check starts (the first frames compile shaders). */
export const WARMUP = 3;
/** Frames averaged by the speed check. */
export const WINDOW = 30;
/** Seconds per frame: a backdrop slower than this (about 9 fps) on average is dropped for the painted sky. */
export const SLOW_FRAME = 0.11;
/** Frame caps (ms) for the title screen and the busier screens behind it. */
export const CAPS = { full: 1000 / 60, calm: 1000 / 30 };
/** Frames drawn before the canvas fades in over the painted sky. */
const SHOW_AFTER = 6;

async function loadScene() {
  const [{ MenuScene }, { GameRenderer }] = await Promise.all([import('../intro/menu-scene.js'), import('../render/game-renderer.js')]);
  return { MenuScene, Renderer: GameRenderer };
}

/**
 * Whether the address and the browser let it run: `?livemenu=0` never, `?livemenu=1` always, and an automated
 * browser (the e2e tests, on software GL) keeps the painted sky so the menus answer at once.
 */
export function liveWanted({ search = '', webdriver = false } = {}) {
  let q;
  try {
    q = new URLSearchParams(search);
  } catch {
    q = new URLSearchParams('');
  }
  const forced = q.get('livemenu');
  if (forced === '0') return false;
  if (forced === '1') return true;
  return !webdriver;
}

/** Whether this browser can draw it at all (a WebGL2 context). */
export function canRunLive(doc = globalThis.document) {
  try {
    const c = doc.createElement('canvas');
    return !!(c.getContext && c.getContext('webgl2'));
  } catch {
    return false;
  }
}

/**
 * Pure speed check: given the last frame times (seconds), whether the backdrop is too slow to keep.
 * @param {number[]} frames
 */
export function tooSlow(frames) {
  if (frames.length < WINDOW) return false;
  let sum = 0;
  for (let i = frames.length - WINDOW; i < frames.length; i++) sum += frames[i];
  return sum / WINDOW > SLOW_FRAME;
}

/**
 * @param {HTMLElement} container the menu's sky layer (the canvas goes over the painted layers)
 * @param {object} o
 * @param {() => string} [o.quality] the graphics quality to draw at
 * @param {() => boolean} [o.enabled] whether the player wants it (Settings)
 * @param {(on: boolean) => void} [o.onLive] told when the live picture covers the painted sky (true) and when it is gone
 *   again (false): the painted layers need not animate behind it
 * @param {() => Promise<{ MenuScene: Function, Renderer: Function }>} [o.load] (tests)
 */
export function createLiveBackdrop(container, { quality = () => 'medium', enabled = () => true, onLive = () => {}, load = loadScene } = {}) {
  let scene = null;
  let canvas = null;
  let wrap = null; // the canvas and the shade over it that keeps the menu's text readable
  let raf = 0;
  let token = 0; // bumped by stop(): a load still under way when the menu hides is thrown away
  let shown = false; // the live picture covers the painted sky
  let gaveUp = false; // too slow once: the painted sky for the rest of the visit
  let mode = 'full';
  let last = 0;
  let lastDraw = 0;
  let drawn = 0;
  let clock = 0;
  const frames = [];

  const onResize = () => {
    if (scene && canvas) scene.resize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
  };

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!scene) return;
    if (document.hidden) {
      last = now; // a hidden tab delivers no frames: no catch-up, and not counted as slowness
      return;
    }
    if (now - lastDraw < CAPS[mode] - 1) return;
    const dt = last ? Math.min(0.25, (now - last) / 1000) : 1 / 60;
    last = now;
    lastDraw = now;
    clock += dt;
    try {
      scene.advance(dt);
      scene.draw(now);
    } catch (err) {
      console.warn('[menu] the live backdrop failed', err);
      gaveUp = true;
      teardown();
      return;
    }
    drawn++;
    if (drawn === SHOW_AFTER && wrap) {
      wrap.classList.add('is-on');
      shown = true;
      onLive(true);
    }
    if (clock > WARMUP) {
      frames.push(dt);
      if (frames.length > WINDOW) frames.shift();
      if (tooSlow(frames)) {
        console.info('[menu] the live backdrop is too slow here; the painted sky stays');
        gaveUp = true;
        teardown();
      }
    }
  }

  function teardown() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    window.removeEventListener('resize', onResize);
    if (scene) {
      try {
        scene.dispose();
      } catch (err) {
        console.warn('[menu] disposing the live backdrop failed', err);
      }
    }
    scene = null;
    if (wrap) wrap.remove();
    wrap = null;
    canvas = null;
    if (shown) {
      shown = false;
      onLive(false);
    }
  }

  async function start() {
    if (scene || canvas || gaveUp || !enabled() || !canRunLive()) return;
    const my = ++token;
    canvas = h('canvas.mw-live-canvas');
    wrap = h('div.mw-live', { 'aria-hidden': 'true' }, canvas, h('div.mw-live-shade'));
    container.appendChild(wrap);
    try {
      const { MenuScene, Renderer } = await load();
      if (my !== token || !canvas) return;
      scene = new MenuScene({ canvas, Renderer, quality: quality() || 'medium' });
      onResize();
      window.addEventListener('resize', onResize);
      last = 0;
      lastDraw = 0;
      drawn = 0;
      clock = 0;
      frames.length = 0;
      raf = requestAnimationFrame(frame);
    } catch (err) {
      console.warn('[menu] the live backdrop could not start', err);
      gaveUp = true;
      if (my === token) teardown();
    }
  }

  return {
    start,
    stop() {
      token++;
      teardown();
    },
    setMode(m) {
      if (CAPS[m]) mode = m;
    },
    /** Settings changed: start or stop to match. */
    refresh() {
      if (!enabled()) {
        token++;
        teardown();
      } else if (!scene && !canvas) start();
    },
    get shown() {
      return shown;
    },
    get running() {
      return !!scene;
    },
    get failed() {
      return gaveUp;
    },
  };
}
