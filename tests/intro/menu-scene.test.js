// The title screen's live backdrop (src/intro/menu-scene.js, src/ui/menu-live.js, DESIGN 9 "Live title backdrop"):
// the peaceful village, the slow circle of the camera, the held golden hour, and the page side that loads it only
// while the menu shows, fades it in, and drops it for the painted sky when it is too slow.
import test from 'node:test';
import assert from 'node:assert/strict';
import { register } from 'node:module';

const VENDOR = new URL('../../vendor/three/', import.meta.url).href;
register(`data:text/javascript,${encodeURIComponent(`
export async function resolve(spec, ctx, next) {
  if (spec === 'three') return { url: ${JSON.stringify(`${VENDOR}three.module.js`)}, shortCircuit: true };
  if (spec.startsWith('three/addons/')) return { url: ${JSON.stringify(VENDOR + 'addons/')} + spec.slice(13), shortCircuit: true };
  return next(spec, ctx);
}`)}`);

const THREE = await import('three');
const { MenuScene, menuPose, ORBIT_SECONDS, MENU_HOUR } = await import('../../src/intro/menu-scene.js');
const { IntroStage } = await import('../../src/intro/stage.js');
const { createLiveBackdrop, liveWanted, tooSlow, WINDOW, SLOW_FRAME } = await import('../../src/ui/menu-live.js');
const { installFakeDom } = await import('../ui/fake-dom.js');

class FakeRenderer {
  constructor(canvas, opts) {
    this.opts = opts;
    this.camera = { setFree: (pose) => (this.free = pose) };
    this.bars = { add: () => 'bar' };
    this.status = { addRank: () => 'rank', addIcons: () => 'icons' };
    this.scene = new THREE.Scene();
    this.terrain = { border: { visible: true } };
    this.threeCamera = new THREE.PerspectiveCamera();
    const c = (h) => new THREE.Color(h);
    this.atmo = {
      hours: [],
      state: { skyZenith: c('#223366'), skyHorizon: c('#ffcc88'), haze: c('#ccaa88'), keyHue: c('#ffddaa'), sunDir: new THREE.Vector3(0, 1, 0), moonDir: new THREE.Vector3(0, -1, 0), sunElevation: 20, moonElevation: -20, night: 0 },
      setMode: (h) => this.atmo.hours.push(h),
    };
    this.frames = 0;
    this.disposed = false;
  }
  update() {}
  render() {
    this.frames++;
  }
  resize(w, h) {
    this.size = [w, h];
  }
  dispose() {
    this.disposed = true;
  }
}

test('the peaceful stage is the village at work, with no armies and no cues', () => {
  const s = new IntroStage({ peaceful: true });
  const units = s.world.unitList.filter((u) => !u.dead);
  assert.ok(units.length > 5);
  assert.ok(units.every((u) => u.def.class === 'worker'), 'only worshippers');
  assert.equal(s.cues.length, 0);
  const before = s.world.buildingList.length;
  for (let i = 0; i < 100; i++) s.advance(0.1);
  assert.equal(s.world.buildingList.length, before, 'nothing burns');
  assert.ok(s.world.unitList.some((u) => u.state && u.state !== 'idle'), 'the workers are busy');
});

test('the camera circles the village once in ORBIT_SECONDS, at the held golden hour', () => {
  const at = { x: 20, y: 30 };
  const a = menuPose(at, 0);
  const b = menuPose(at, ORBIT_SECONDS);
  assert.ok(Math.abs(b.yaw - a.yaw - 360) < 1e-9);
  assert.ok(Math.abs(a.x - b.x) < 1e-9 && Math.abs(a.dist - b.dist) < 1e-6, 'the circle closes');
  const scene = new MenuScene({ canvas: {}, Renderer: FakeRenderer });
  assert.equal(scene.renderer.opts.timeOfDay, MENU_HOUR);
  assert.equal(scene.renderer.bars.add(), undefined, 'no health bars over the village');
  assert.equal(scene.renderer.terrain.border.visible, false);
  const yaw0 = scene.pose.yaw;
  scene.advance(1);
  scene.draw(0);
  assert.ok(scene.pose.yaw > yaw0);
  assert.deepEqual(scene.renderer.atmo.hours.at(-1), MENU_HOUR);
  assert.equal(scene.renderer.frames, 1);
  scene.dispose();
  assert.ok(scene.renderer.disposed);
});

test('liveWanted: an automated browser keeps the painted sky unless the address asks', () => {
  assert.equal(liveWanted({}), true);
  assert.equal(liveWanted({ webdriver: true }), false);
  assert.equal(liveWanted({ webdriver: true, search: '?livemenu=1' }), true);
  assert.equal(liveWanted({ search: '?livemenu=0' }), false);
});

test('tooSlow averages the last WINDOW frames', () => {
  assert.equal(tooSlow(new Array(WINDOW - 1).fill(1)), false, 'not enough frames yet');
  assert.equal(tooSlow(new Array(WINDOW).fill(SLOW_FRAME * 0.9)), false);
  assert.equal(tooSlow(new Array(WINDOW).fill(SLOW_FRAME * 1.1)), true);
});

test('the backdrop loads while the menu shows, fades in, steps aside when too slow, and frees the scene on stop', async () => {
  installFakeDom();
  if (typeof globalThis.Node === 'undefined') globalThis.Node = Object.getPrototypeOf(document.createElement('div')).constructor; // menu-dom's h()
  const rafs = [];
  globalThis.requestAnimationFrame = (fn) => rafs.push(fn);
  globalThis.cancelAnimationFrame = () => {};
  const realCreate = document.createElement.bind(document);
  document.createElement = (tag) => {
    const n = realCreate(tag);
    if (tag === 'canvas') n.getContext = (k) => (k === 'webgl2' ? {} : null);
    return n;
  };
  const scenes = [];
  class Scene {
    constructor() {
      this.frames = 0;
      scenes.push(this);
    }
    advance() {}
    draw() {
      this.frames++;
    }
    resize() {}
    dispose() {
      this.disposed = true;
    }
  }
  const sky = realCreate('div');
  const live = [];
  const ctl = createLiveBackdrop(sky, { load: async () => ({ MenuScene: Scene, Renderer: null }), onLive: (on) => live.push(on) });
  await ctl.start();
  assert.ok(ctl.running);
  assert.equal(sky.childNodes.length, 1, 'one wrapper over the painted layers');
  // fast frames: it fades in and stays
  let t = 0;
  const step = (ms) => {
    t += ms;
    const fn = rafs.shift();
    if (fn) fn(t);
  };
  for (let i = 0; i < 20; i++) step(16.7);
  assert.deepEqual(live, [true]);
  assert.ok(ctl.shown);
  for (let i = 0; i < 300; i++) step(16.7);
  assert.ok(ctl.running, 'smooth: kept');
  // slow frames: dropped for the painted sky, for the rest of the visit
  for (let i = 0; i < WINDOW + 5; i++) step(200);
  assert.equal(ctl.running, false);
  assert.ok(ctl.failed);
  assert.ok(scenes[0].disposed);
  assert.deepEqual(live, [true, false]);
  assert.equal(sky.childNodes.length, 0);
  await ctl.start();
  assert.equal(scenes.length, 1, 'not tried again');

  // a fresh one stopped while loading throws the late scene away
  let resolveLoad;
  const slowLoad = () => new Promise((r) => (resolveLoad = r));
  const ctl2 = createLiveBackdrop(sky, { load: slowLoad });
  const p = ctl2.start();
  ctl2.stop();
  resolveLoad({ MenuScene: Scene, Renderer: null });
  await p;
  assert.equal(ctl2.running, false);
  assert.equal(scenes.length, 1, 'no scene built after the stop');
  // turned off in Settings: never starts
  const ctl3 = createLiveBackdrop(sky, { enabled: () => false, load: async () => ({ MenuScene: Scene }) });
  await ctl3.start();
  assert.equal(ctl3.running, false);
});
