// Touch controls (src/ui/touch-input.js, DESIGN 9 "Touch"): fingers on the canvas become the InputController's
// mouse actions. A stand-in controller records what each gesture asks of it.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { installFakeDom } from './fake-dom.js';
import { TouchInput, tapButton, HOLD_MS, TAP_SLOP } from '../../src/ui/touch-input.js';

before(installFakeDom);

function setup({ selected = [], under = null, kind = 'normal' } = {}) {
  const log = [];
  const cam = { goalDistance: 30, setDistance(d) { this.goalDistance = d; }, panPixels(dx, dy) { log.push(['pan', dx, dy]); } };
  const input = {
    canvas: document.createElement('canvas'),
    mode: { kind },
    sel: { ownUnitIds: () => selected },
    vs: { myIndex: 0 },
    hud: { overlays: { open: null } },
    renderer: { camera: cam },
    box: { hidden: true },
    disposed: false,
    canvasPoint: (x, y) => ({ x, y }),
    pick: () => under,
    onMouseDown: (e) => log.push(['down', e.button, e.clientX, e.clientY]),
    onMouseMove: (e) => log.push(['move', e.button, e.clientX, e.clientY]),
    onMouseUp: (e) => log.push(['up', e.button, e.clientX, e.clientY]),
  };
  const touch = new TouchInput(input);
  const pt = (x, y, id = 0) => ({ identifier: id, clientX: x, clientY: y });
  const fire = (type, touches, changed, t) => input.canvas.fire(type, { cancelable: true, timeStamp: t, touches, changedTouches: changed });
  return { input, touch, log, cam, pt, fire };
}

test('tapButton: an order with own units selected, unless the tap lands on an own unit; a click otherwise', () => {
  const mk = (selected, under, kind = 'normal') => ({ mode: { kind }, sel: { ownUnitIds: () => selected }, vs: { myIndex: 0 }, canvasPoint: (x, y) => ({ x, y }), pick: () => under });
  assert.equal(tapButton(mk([], null), 5, 5), 0, 'nothing selected: select');
  assert.equal(tapButton(mk([7], null), 5, 5), 2, 'units selected, the ground: move');
  assert.equal(tapButton(mk([7], { k: 'u', o: 1 }), 5, 5), 2, 'an enemy: attack');
  assert.equal(tapButton(mk([7], { k: 'm', o: -1 }), 5, 5), 2, 'a mine: gather');
  assert.equal(tapButton(mk([7], { k: 'u', o: 0 }), 5, 5), 0, 'another own unit: select it');
  assert.equal(tapButton(mk([7], null, 'place'), 5, 5), 0, 'placing a building: the click places it');
  assert.equal(tapButton(mk([7], null, 'target'), 5, 5), 0, 'a targeted order: the click aims it');
});

test('a tap is a left click with nothing selected, and the order with units selected', () => {
  const a = setup();
  a.fire('touchstart', [a.pt(100, 80)], [a.pt(100, 80)], 1000);
  a.fire('touchend', [], [a.pt(102, 81)], 1100);
  assert.deepEqual(a.log, [['down', 0, 100, 80], ['up', 0, 100, 80]]);
  assert.equal(a.input.mouseInWindow, false, 'no edge scroll left behind');
  const b = setup({ selected: [3] });
  b.fire('touchstart', [b.pt(100, 80)], [b.pt(100, 80)], 1000);
  b.fire('touchend', [], [b.pt(100, 80)], 1100);
  assert.deepEqual(b.log, [['down', 2, 100, 80]], 'the right-button order, which needs no release');
});

test('one finger dragged at once pans; one that rested first draws a box', () => {
  const a = setup();
  a.fire('touchstart', [a.pt(100, 80)], [a.pt(100, 80)], 1000);
  a.fire('touchmove', [a.pt(100 + TAP_SLOP + 5, 80)], [a.pt(100 + TAP_SLOP + 5, 80)], 1050);
  a.fire('touchmove', [a.pt(160, 90)], [a.pt(160, 90)], 1080);
  a.fire('touchend', [], [a.pt(160, 90)], 1100);
  assert.deepEqual(a.log.map((l) => l.slice(0, 2)), [['down', 1], ['move', 1], ['move', 1], ['up', 1]], 'the middle-button drag');
  const b = setup();
  b.fire('touchstart', [b.pt(100, 80)], [b.pt(100, 80)], 1000);
  b.fire('touchmove', [b.pt(140, 120)], [b.pt(140, 120)], 1000 + HOLD_MS + 10);
  b.fire('touchend', [], [b.pt(140, 120)], 1000 + HOLD_MS + 50);
  assert.deepEqual(b.log, [['down', 0, 100, 80], ['move', 0, 140, 120], ['up', 0, 140, 120]], 'the left-button box from where it went down');
});

test('two fingers pinch the zoom and pan by their midpoint; a tap after them is still a tap', () => {
  const a = setup();
  a.fire('touchstart', [a.pt(100, 100, 0), a.pt(200, 100, 1)], [a.pt(200, 100, 1)], 1000);
  a.fire('touchmove', [a.pt(70, 110, 0), a.pt(270, 110, 1)], [a.pt(70, 110, 0), a.pt(270, 110, 1)], 1050);
  assert.equal(a.cam.goalDistance, 15, 'fingers twice as far apart: twice as close');
  assert.deepEqual(a.log, [['pan', 20, 10]]);
  a.fire('touchend', [a.pt(70, 110, 0)], [a.pt(270, 110, 1)], 1100);
  a.fire('touchend', [], [a.pt(70, 110, 0)], 1120);
  assert.equal(a.log.length, 1, 'lifting the fingers neither clicks nor orders');
  a.fire('touchstart', [a.pt(50, 50)], [a.pt(50, 50)], 2000);
  a.fire('touchend', [], [a.pt(50, 50)], 2050);
  assert.deepEqual(a.log.slice(1), [['down', 0, 50, 50], ['up', 0, 50, 50]]);
});

test('nothing happens under an open menu, and dispose takes the listeners off', () => {
  const a = setup();
  a.input.hud.overlays.open = 'menu';
  a.fire('touchstart', [a.pt(10, 10)], [a.pt(10, 10)], 1000);
  a.fire('touchend', [], [a.pt(10, 10)], 1050);
  assert.deepEqual(a.log, []);
  a.input.hud.overlays.open = null;
  a.touch.dispose();
  a.fire('touchstart', [a.pt(10, 10)], [a.pt(10, 10)], 2000);
  a.fire('touchend', [], [a.pt(10, 10)], 2050);
  assert.deepEqual(a.log, []);
  assert.equal(a.input.canvas.style.touchAction, 'none', 'the page never scrolls or zooms under the map');
});
