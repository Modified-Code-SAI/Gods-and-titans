// Camera spots (src/ui/camera-spots.js): Ctrl+F6..F9 (or Shift) keeps where the camera is going and how far out;
// F6..F9 brings it back; an empty spot says how to fill it. The pure module, then through InputController.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { CameraSpots, cameraSpotKey, cameraSpotLine, CAMERA_SPOT_KEYS } from '../../src/ui/camera-spots.js';
import { ViewState } from '../../src/game/view-state.js';
import { Selection } from '../../src/ui/hud-selection.js';
import { InputController } from '../../src/ui/input.js';
import { makeWorld } from '../sim/helpers.js';
import { installFakeDom } from './fake-dom.js';

before(installFakeDom);

function fakeCamera() {
  return {
    goal: { x: 10, y: 20 },
    goalDistance: 40,
    centerOn(x, y) {
      this.goal = { x, y };
    },
    setDistance(d) {
      this.goalDistance = d;
    },
  };
}

test('the keys: F6..F9 recall, with Ctrl, Cmd or Shift they save; Alt and other keys are not theirs', () => {
  assert.deepEqual(CAMERA_SPOT_KEYS, ['F6', 'F7', 'F8', 'F9']);
  assert.deepEqual(cameraSpotKey({ key: 'F6' }), { slot: 0, save: false });
  assert.deepEqual(cameraSpotKey({ key: 'F9', ctrlKey: true }), { slot: 3, save: true });
  assert.deepEqual(cameraSpotKey({ key: 'F7', shiftKey: true }), { slot: 1, save: true });
  assert.deepEqual(cameraSpotKey({ key: 'F8', metaKey: true }), { slot: 2, save: true });
  assert.equal(cameraSpotKey({ key: 'F6', altKey: true }), null);
  assert.equal(cameraSpotKey({ key: 'F5' }), null, 'F5 stays the browser reload');
  assert.equal(cameraSpotKey({ key: 'F10' }), null);
});

test('a spot keeps the place and the distance, and brings both back', () => {
  const spots = new CameraSpots();
  const cam = fakeCamera();
  assert.equal(spots.recall(0, cam), false, 'nothing kept yet');
  assert.equal(spots.save(0, cam), true);
  cam.centerOn(90, 90);
  cam.setDistance(12);
  assert.equal(spots.recall(0, cam), true);
  assert.deepEqual(cam.goal, { x: 10, y: 20 });
  assert.equal(cam.goalDistance, 40);
  assert.equal(spots.has(0), true);
  assert.equal(spots.has(1), false);
  assert.equal(spots.save(7, cam), false, 'no such spot');
  assert.match(cameraSpotLine(0, true, true), /F6 saved/);
  assert.match(cameraSpotLine(2, false, false), /Ctrl\+F8/);
  assert.equal(cameraSpotLine(1, false, true), '', 'a jump says nothing');
});

test('through the input: Ctrl+F7 saves, F7 returns, an empty F8 says how to fill it', () => {
  const world = makeWorld();
  const vs = new ViewState({ setup: world.setup, mapData: world.mapData, myIndex: 0 });
  vs.pushSnapshot(world.getSnapshot(), 50);
  const cam = fakeCamera();
  const game = {
    viewState: vs,
    selection: new Selection(vs),
    renderer: { pickEntity: () => null, screenToWorld: (x, y) => ({ x, y }), showCommandMarker() {}, hidePlacement() {}, setSelection() {}, camera: cam },
    command() {},
    setShowAllBars() {},
  };
  const input = new InputController({ game, canvas: document.createElement('canvas'), overlayRoot: document.createElement('div') });
  const lines = [];
  game.hud = { message: (t) => lines.push(t), refreshCard() {}, flashSlot() {}, openChat() {}, overlays: { open: false, escape() {}, openMenu() {} }, chatOpen: false, currentCard: () => [] };
  let prevented = 0;
  const press = (key, mods = {}) => input.onKeyDown({ key, code: key, preventDefault: () => prevented++, target: document.body, ...mods });
  press('F7', { ctrlKey: true });
  cam.centerOn(50, 60);
  press('F7');
  assert.deepEqual(cam.goal, { x: 10, y: 20 });
  press('F8');
  assert.equal(lines.length, 2);
  assert.match(lines[0], /F7 saved/);
  assert.match(lines[1], /No camera spot on F8/);
  assert.equal(prevented, 3, 'the browser does not act on them');
  input.dispose();
});
