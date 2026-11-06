// Gamepad play (src/ui/gamepad-input.js, DESIGN 9 "Gamepad"): a controller's sticks and buttons become the
// InputController's mouse actions at a cursor of its own. A stand-in controller records what each asks of it.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { installFakeDom } from './fake-dom.js';
import { GamepadInput, readPad, firstPad, DEAD_ZONE, PAD } from '../../src/ui/gamepad-input.js';

before(installFakeDom);

function pad() {
  return { connected: true, mapping: 'standard', axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) };
}

function setup({ kind = 'normal', overUi = null } = {}) {
  const log = [];
  const gp = pad();
  const nav = { getGamepads: () => [null, gp] };
  const cam = { goalDistance: 30, setDistance(d) { this.goalDistance = d; } };
  const canvas = document.createElement('canvas');
  const doc = { body: document.createElement('div'), createElement: (t) => document.createElement(t), elementFromPoint: () => overUi || canvas, addEventListener() {}, removeEventListener() {} };
  const input = {
    canvas,
    mode: { kind },
    mx: 200,
    my: 150,
    sel: { clear: () => log.push(['clear']) },
    hud: { overlays: { open: null, toggleMenu: () => log.push(['menu']) } },
    renderer: { camera: cam },
    disposed: false,
    cancelMode: () => log.push(['cancel']),
    cycleIdleWorker: () => log.push(['idleWorker']),
    cycleIdleArmy: () => log.push(['idleArmy']),
    onMouseDown: (e) => log.push(['down', e.button, Math.round(e.clientX), Math.round(e.clientY)]),
    onMouseMove: (e) => log.push(['move', e.button, Math.round(e.clientX), Math.round(e.clientY)]),
    onMouseUp: (e) => log.push(['up', e.button, Math.round(e.clientX), Math.round(e.clientY)]),
  };
  const msgs = [];
  input.hud.message = (t) => msgs.push(t);
  const ctl = new GamepadInput(input, { nav, doc });
  const press = (b, on = true) => {
    gp.buttons[b] = { pressed: on, value: on ? 1 : 0 };
  };
  return { gp, input, ctl, log, cam, press, doc, msgs };
}

test('readPad: sticks read 0 inside the dead zone and rescale past it; buttons and triggers', () => {
  const gp = pad();
  gp.axes = [DEAD_ZONE / 2, -1, 0.6, 0];
  gp.buttons[PAD.A] = { pressed: true, value: 1 };
  gp.buttons[PAD.RT] = { pressed: false, value: 0.5 };
  const p = readPad(gp);
  assert.equal(p.lx, 0);
  assert.equal(p.ly, -1);
  assert.ok(Math.abs(p.rx - (0.6 - DEAD_ZONE) / (1 - DEAD_ZONE)) < 1e-9);
  assert.equal(p.rt, 0.5);
  assert.ok(p.down.has(PAD.A) && !p.down.has(PAD.RT), 'a half-pulled trigger is not a press');
  assert.equal(firstPad({ getGamepads: () => [null, { ...gp, mapping: '' }, gp] }), gp, 'the standard-layout pad first');
  assert.equal(firstPad({}), null, 'no Gamepad API: no pad');
});

test('no pad, or a pad left alone: nothing happens and no cursor shows', () => {
  const a = setup();
  a.gp.connected = false;
  assert.deepEqual(a.ctl.update(0.016), { panX: 0, panY: 0 });
  a.gp.connected = true;
  a.ctl.update(0.016);
  assert.equal(a.ctl.active, false);
  assert.equal(a.ctl.cursor, null);
  assert.deepEqual(a.log, []);
});

test('the right stick moves the cursor from where the mouse was; A clicks there, held and moved it draws a box', () => {
  const a = setup();
  a.gp.axes[2] = 1;
  a.ctl.update(0.1);
  assert.equal(a.ctl.active, true);
  assert.equal(a.ctl.cursor.hidden, false);
  assert.ok(a.ctl.x > 200 && a.ctl.y === 150, 'moved right from the mouse');
  assert.equal(a.input.mx, a.ctl.x, 'the input follows the pad cursor (hover, ghosts, rings)');
  assert.equal(a.msgs.length, 1, 'one line says how the controller plays');
  a.ctl.update(0.1);
  assert.equal(a.msgs.length, 1, 'once');
  a.gp.axes[2] = 0;
  const x = Math.round(a.ctl.x);
  a.press(PAD.A);
  a.ctl.update(0.016);
  a.press(PAD.A, false);
  a.ctl.update(0.016);
  assert.deepEqual(a.log, [['down', 0, x, 150], ['up', 0, x, 150]], 'a click');
  a.log.length = 0;
  a.press(PAD.A);
  a.ctl.update(0.016);
  a.gp.axes[3] = 1;
  a.ctl.update(0.1);
  a.gp.axes[3] = 0;
  a.press(PAD.A, false);
  a.ctl.update(0.016);
  assert.deepEqual(a.log.map((l) => l.slice(0, 2)), [['down', 0], ['move', 0], ['up', 0]], 'a box');
});

test('X orders, B calls off a mode or clears the selection, LB/RB find idle units, Start opens the menu', () => {
  const a = setup();
  const tap = (b) => {
    a.press(b);
    a.ctl.update(0.016);
    a.press(b, false);
    a.ctl.update(0.016);
  };
  tap(PAD.X);
  assert.deepEqual(a.log[0], ['down', 2, 200, 150]);
  tap(PAD.B);
  a.input.mode = { kind: 'place' };
  tap(PAD.B);
  tap(PAD.LB);
  tap(PAD.RB);
  tap(PAD.START);
  assert.deepEqual(a.log.slice(1).map((l) => l[0]), ['clear', 'cancel', 'idleWorker', 'idleArmy', 'menu']);
});

test('the left stick pans and the triggers zoom; over the HUD or a menu, A presses the button under the cursor', () => {
  const a = setup();
  a.gp.axes[0] = -1;
  a.gp.buttons[PAD.RT] = { pressed: true, value: 1 };
  const out = a.ctl.update(0.5);
  assert.deepEqual(out, { panX: -1, panY: 0 });
  assert.ok(a.cam.goalDistance < 30, 'RT zooms in');
  const btn = document.createElement('button');
  let clicked = 0;
  btn.addEventListener('click', () => clicked++);
  const b = setup({ overUi: btn });
  b.input.hud.overlays.open = 'menu';
  b.press(PAD.A);
  const o = b.ctl.update(0.016);
  assert.equal(clicked, 1);
  assert.deepEqual(b.log, [], 'nothing reached the map');
  assert.deepEqual(o, { panX: 0, panY: 0 }, 'no panning under an open menu');
});
