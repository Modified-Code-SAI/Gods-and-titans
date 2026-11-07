// ? in a match (src/ui/input.js): straight to the Controls list over the game menu; it cannot be bound.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { ViewState } from '../../src/game/view-state.js';
import { Selection } from '../../src/ui/hud-selection.js';
import { InputController } from '../../src/ui/input.js';
import { isBindableKey } from '../../src/ui/key-bindings.js';
import { makeWorld } from '../sim/helpers.js';
import { installFakeDom } from './fake-dom.js';

before(installFakeDom);

function setup({ menuOpens = true } = {}) {
  const world = makeWorld();
  const vs = new ViewState({ setup: world.setup, mapData: world.mapData, myIndex: 0 });
  vs.pushSnapshot(world.getSnapshot(), 50);
  const game = {
    viewState: vs,
    selection: new Selection(vs),
    renderer: { pickEntity: () => null, screenToWorld: (x, y) => ({ x, y }), showCommandMarker() {}, hidePlacement() {}, setSelection() {}, camera: { centerOn() {} } },
    command() {},
    setShowAllBars() {},
  };
  const input = new InputController({ game, canvas: document.createElement('canvas'), overlayRoot: document.createElement('div') });
  const calls = [];
  const overlays = {
    open: false,
    name: null,
    escape() {},
    openMenu() { calls.push('menu'); if (menuOpens) { this.open = true; this.name = 'menu'; } },
    openControls() { calls.push('controls'); this.name = 'controls'; },
  };
  game.hud = { message() {}, refreshCard() {}, flashSlot() {}, openChat() {}, overlays, chatOpen: false, currentCard: () => [] };
  let prevented = 0;
  const press = (key, mods = {}) => input.onKeyDown({ key, code: 'Slash', shiftKey: true, preventDefault: () => prevented++, target: document.body, ...mods });
  return { input, calls, press, prevented: () => prevented };
}

test('? opens the game menu and goes straight on to its Controls list', () => {
  const s = setup();
  s.press('?');
  assert.deepEqual(s.calls, ['menu', 'controls']);
  assert.equal(s.prevented(), 1);
  s.input.dispose();
});

test('when the menu cannot open (the match is over), ? opens nothing more; a held key does not repeat', () => {
  const s = setup({ menuOpens: false });
  s.press('?');
  assert.deepEqual(s.calls, ['menu']);
  s.press('?', { repeat: true });
  assert.deepEqual(s.calls, ['menu']);
  s.input.dispose();
});

test('? keeps its job: it cannot be bound to a camera key', () => {
  assert.equal(isBindableKey('?'), false);
});
