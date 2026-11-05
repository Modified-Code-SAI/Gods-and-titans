// Unit replies: selecting units and giving them orders plays their voice (sfx-voices.js), one reply at a time.
import { test, before, mock } from 'node:test';
import assert from 'node:assert/strict';
import { ViewState } from '../../src/game/view-state.js';
import { Selection } from '../../src/ui/hud-selection.js';
import { InputController } from '../../src/ui/input.js';
import { sfx } from '../../src/audio/sfx.js';
import { makeWorld, spawn, clearUnits } from '../sim/helpers.js';
import { installFakeDom } from './fake-dom.js';

before(installFakeDom);

function setup() {
  const world = makeWorld({});
  clearUnits(world, 0);
  clearUnits(world, 1);
  const worker = spawn(world, 0, 'worshipper', 10, 12);
  const warrior = spawn(world, 0, 'warrior', 11, 12);
  const enemy = spawn(world, 1, 'warrior', 13, 12);
  const vs = new ViewState({ setup: world.setup, mapData: world.mapData, myIndex: 0 });
  vs.pushSnapshot(world.getSnapshot(), 50);
  const sel = new Selection(vs);
  let picked = null;
  const game = {
    viewState: vs,
    selection: sel,
    renderer: { pickEntity: () => picked, screenToWorld: (x, y) => ({ x, y }), showCommandMarker() {}, hidePlacement() {}, setSelection() {}, camera: { centerOn() {}, zoomBy() {} } },
    command() {},
    setShowAllBars() {},
  };
  const input = new InputController({ game, canvas: document.createElement('canvas'), overlayRoot: document.createElement('div') });
  game.input = input;
  game.hud = { message() {}, refreshCard() {}, flashSlot() {}, chatOpen: false, currentCard: () => [] };
  const played = [];
  mock.method(sfx, 'play', (name) => (played.push(name), true));
  let clock = 1000;
  mock.method(performance, 'now', () => clock);
  const wait = (s) => (clock += s * 1000);
  return { vs, sel, input, played, wait, worker, warrior, enemy, pick: (e) => (picked = e) };
}

test('selecting answers in the voice of the most important unit; orders acknowledge; an attack order is a war cry', () => {
  const { vs, sel, input, played, wait, worker, warrior, enemy, pick } = setup();
  sel.set([worker.id]);
  input.afterSelect();
  assert.deepEqual(played.filter((n) => n.startsWith('vo_')), ['vo_worker_select']);
  wait(2);
  sel.set([worker.id, warrior.id]);
  input.afterSelect();
  assert.equal(played.at(-1), 'vo_soldier_select');
  wait(2);
  input.smartAt(30, 30, false, { x: 30, y: 30 });
  assert.equal(played.at(-1), 'vo_soldier_ack');
  wait(2);
  pick(enemy.id);
  assert.ok(vs.knownEntity(enemy.id), 'the enemy is in sight'); assert.ok(vs.canHarm(1), 'not at peace');
  input.smartAt(13, 12, false);
  assert.equal(played.at(-1), 'vo_soldier_attack');
  mock.restoreAll();
});

test('replies do not pile up when the player clicks fast', () => {
  const { sel, input, played, wait, warrior } = setup();
  sel.set([warrior.id]);
  for (let i = 0; i < 10; i++) {
    input.smartAt(30 + i, 30, false, { x: 30 + i, y: 30 });
    wait(0.1);
  }
  const replies = played.filter((n) => n.startsWith('vo_'));
  assert.ok(replies.length <= 3, `${replies.length} replies to 10 quick orders`);
  assert.ok(played.filter((n) => n === 'move').length === 10, 'every order still clicks');
  mock.restoreAll();
});
