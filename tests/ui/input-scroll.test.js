// Camera speed (setting `scrollSpeed`, src/ui/speed-options.js SCROLL_SCALE): the arrow keys, the screen edge and a
// controller's stick move the camera that many times PAN_SPEED. Real World + ViewState, a stub renderer, the fake DOM.
import { test, before, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { ViewState } from '../../src/game/view-state.js';
import { Selection } from '../../src/ui/hud-selection.js';
import { InputController } from '../../src/ui/input.js';
import { SCROLL_SCALE, SCROLL_SPEED_OPTIONS } from '../../src/ui/speed-options.js';
import { saveSettings, _resetSettingsForTests } from '../../src/settings.js';
import { makeWorld } from '../sim/helpers.js';
import { installFakeDom } from './fake-dom.js';

before(installFakeDom);
afterEach(() => _resetSettingsForTests());

function setup() {
  const world = makeWorld();
  const vs = new ViewState({ setup: world.setup, mapData: world.mapData, myIndex: 0 });
  vs.pushSnapshot(world.getSnapshot(), 50);
  const scrolled = [];
  const game = {
    viewState: vs,
    selection: new Selection(vs),
    renderer: {
      pickEntity: () => null,
      screenToWorld: (x, y) => ({ x, y }),
      showCommandMarker() {},
      hidePlacement() {},
      setSelection() {},
      camera: { scroll: (x, y) => scrolled.push([x, y]), centerOn() {}, zoomBy() {} },
    },
    command() {},
    setShowAllBars() {},
  };
  const input = new InputController({ game, canvas: document.createElement('canvas'), overlayRoot: document.createElement('div') });
  game.input = input;
  game.hud = { message() {}, refreshCard() {}, flashSlot() {}, openChat() {}, overlays: { open: false, escape() {}, openMenu() {} }, chatOpen: false, currentCard: () => [] };
  input.onKeyDown({ key: 'ArrowRight', code: 'ArrowRight', preventDefault() {}, target: document.body });
  return { input, scrolled };
}

test('the Camera speed setting scales how far the arrow keys move the camera', () => {
  assert.deepEqual(SCROLL_SPEED_OPTIONS.map((o) => o[0]), Object.keys(SCROLL_SCALE));
  const step = (speed) => {
    if (speed) saveSettings({ scrollSpeed: speed });
    const { input, scrolled } = setup();
    input.update(0.1);
    input.dispose();
    assert.equal(scrolled.length, 1, speed);
    return scrolled[0][0];
  };
  const normal = step(null);
  assert.ok(normal > 0, 'right');
  for (const [id, f] of Object.entries(SCROLL_SCALE)) assert.ok(Math.abs(step(id) - normal * f) < 1e-9, id);
});
