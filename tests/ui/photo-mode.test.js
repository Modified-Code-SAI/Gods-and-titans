// Photo mode (src/ui/photo-mode.js): Alt+H in and out, Esc out, P asks for a picture; the HUD root gets is-photo and
// the renderer drops its overlays; F10 brings the interface back first. Pure keys, then through InputController.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { photoKey, photoFileName, PhotoMode } from '../../src/ui/photo-mode.js';
import { ViewState } from '../../src/game/view-state.js';
import { Selection } from '../../src/ui/hud-selection.js';
import { InputController } from '../../src/ui/input.js';
import { makeWorld } from '../sim/helpers.js';
import { installFakeDom } from './fake-dom.js';

before(installFakeDom);

test('the keys: Alt+H toggles (by code too, for a Mac\'s Alt+H), Esc leaves and P shoots only in photo mode', () => {
  assert.equal(photoKey({ key: 'h', code: 'KeyH', altKey: true }, false), 'toggle');
  assert.equal(photoKey({ key: '˙', code: 'KeyH', altKey: true }, true), 'toggle');
  assert.equal(photoKey({ key: 'h', code: 'KeyH' }, false), null, 'H alone is Hold position');
  assert.equal(photoKey({ key: 'Escape' }, false), null);
  assert.equal(photoKey({ key: 'Escape' }, true), 'exit');
  assert.equal(photoKey({ key: 'p', code: 'KeyP' }, true), 'shot');
  assert.equal(photoKey({ key: 'p', code: 'KeyP' }, false), null, 'P stays Patrol outside it');
  assert.equal(photoKey({ key: 'h', code: 'KeyH', altKey: true, ctrlKey: true }, false), null);
  assert.equal(photoFileName(new Date(2026, 10, 6, 22, 5, 9)), 'mythic-war-2026-11-06-220509.png');
});

test('the mode marks the HUD root, shows a tip, tells its owner, and lets go cleanly', () => {
  const root = document.createElement('div');
  const seen = [];
  const pm = new PhotoMode({ root, onChange: (on) => seen.push(on) });
  assert.equal(pm.set(true), true);
  assert.equal(root.classList.contains('is-photo'), true);
  assert.match(root.find('hud-photo-tip').textContent, /P saves a picture/);
  assert.equal(pm.set(true), false, 'already on');
  pm.toggle();
  assert.equal(root.classList.contains('is-photo'), false);
  assert.equal(root.find('hud-photo-tip'), null);
  assert.deepEqual(seen, [true, false]);
  pm.set(true);
  pm.dispose();
  assert.equal(root.classList.contains('is-photo'), false);
});

test('through the input: Alt+H in, P asks the game for a picture, F10 leaves photo mode and opens the menu', () => {
  const world = makeWorld();
  const vs = new ViewState({ setup: world.setup, mapData: world.mapData, myIndex: 0 });
  vs.pushSnapshot(world.getSnapshot(), 50);
  const root = document.createElement('div');
  let menus = 0;
  let shots = 0;
  const game = {
    viewState: vs,
    selection: new Selection(vs),
    renderer: { pickEntity: () => null, screenToWorld: (x, y) => ({ x, y }), showCommandMarker() {}, hidePlacement() {}, setSelection() {}, camera: { centerOn() {}, zoomBy() {}, scroll() {} } },
    command() {},
    setShowAllBars() {},
    takePhoto: () => shots++,
  };
  game.photo = new PhotoMode({ root });
  const input = new InputController({ game, canvas: document.createElement('canvas'), overlayRoot: document.createElement('div') });
  game.hud = { message() {}, refreshCard() {}, flashSlot() {}, openChat() {}, overlays: { open: false, escape() {}, openMenu: () => menus++ }, chatOpen: false, currentCard: () => [] };
  const press = (key, code, mods = {}) => input.onKeyDown({ key, code, preventDefault() {}, target: document.body, ...mods });
  press('h', 'KeyH', { altKey: true });
  assert.equal(game.photo.on, true);
  press('p', 'KeyP');
  assert.equal(shots, 1);
  press('F10', 'F10');
  assert.equal(game.photo.on, false, 'the interface comes back');
  assert.equal(menus, 1, 'and the menu opens');
  input.dispose();
});
