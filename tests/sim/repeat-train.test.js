// Repeat training (right-click a train button): a building queues its unit again whenever its
// queue runs empty, while the purse and the population allow, and says nothing while it waits.
import test from 'node:test';
import assert from 'node:assert/strict';
import { MORTALS, godsFor } from '../../src/data/index.js';
import { makeWorld, run, place, eventsOf, errorsOf, runCollect } from './helpers.js';
import { sanitizeCommand } from '../../src/net/sanitize.js';

const tcOf = (w, p = 0) => w.buildingsOf(p).find((b) => b.type === 'town_center');

function cmd(w, c, p = 0) {
  w.events.length = 0;
  w.issueCommand(p, c);
  w.tick();
  return errorsOf(w.events, p);
}

test('repeat: an empty queue gets the unit again, and turning it off stops that', () => {
  const w = makeWorld();
  const tc = tcOf(w);
  w.players[0].gold = 5000;
  assert.deepEqual(cmd(w, { type: 'repeatTrain', building: tc.id, unit: 'worshipper' }), []);
  assert.equal(tc.repeat, 'worshipper');
  run(w, 0.5);
  assert.equal(tc.queue.length, 1, 'queued one without being asked');
  assert.equal(w.getSnapshot().entities.find((e) => e.id === tc.id).rt, 'worshipper');
  const ev = runCollect(w, MORTALS.worshipper.buildTime * 2 + 1);
  assert.ok(eventsOf(ev, 'spawn').length >= 2, 'one after another');
  assert.equal(tc.queue.length, 1, 'never more than one at a time');
  cmd(w, { type: 'repeatTrain', building: tc.id });
  assert.equal(tc.repeat, null);
  assert.equal(w.getSnapshot().entities.find((e) => e.id === tc.id).rt, undefined);
  run(w, MORTALS.worshipper.buildTime + 1);
  run(w, 1);
  assert.equal(tc.queue.length, 0, 'the last one finished and nothing followed');
});

test('repeat: waits quietly when it cannot pay, then queues once it can', () => {
  const w = makeWorld();
  const tc = tcOf(w);
  const p = w.players[0];
  p.gold = 0;
  cmd(w, { type: 'repeatTrain', building: tc.id, unit: 'worshipper' });
  const ev = runCollect(w, 2);
  assert.deepEqual(errorsOf(ev, 0), [], 'no error lines while it waits');
  assert.equal(tc.queue.length, 0);
  p.gold = 500;
  run(w, 0.5);
  assert.equal(tc.queue.length, 1);
});

test('repeat: only units this building trains, never gods or Titans, and only your own building', () => {
  const w = makeWorld();
  const tc = tcOf(w);
  cmd(w, { type: 'repeatTrain', building: tc.id, unit: 'warrior' });
  assert.equal(tc.repeat, null, 'a Town Center does not train Warriors');
  const temple = place(w, 0, 'temple', 26, 20);
  const god = godsFor(w.players[0].pantheon)[0];
  cmd(w, { type: 'repeatTrain', building: temple.id, unit: god.id || god });
  assert.equal(temple.repeat, null, 'gods are one of a kind');
  cmd(w, { type: 'repeatTrain', building: tc.id, unit: 'worshipper' }, 1);
  assert.equal(tc.repeat, null, 'another player cannot set it');
});

test('repeat: the command survives the network whitelist, with or without a unit', () => {
  const b = { width: 64, height: 64 };
  assert.deepEqual(sanitizeCommand({ type: 'repeatTrain', building: 5, unit: 'worshipper' }, b), { type: 'repeatTrain', building: 5, unit: 'worshipper' });
  const off = sanitizeCommand({ type: 'repeatTrain', building: 5 }, b);
  assert.equal(off.type, 'repeatTrain');
  assert.equal(off.building, 5);
  assert.ok(!off.unit);
  assert.ok(!sanitizeCommand({ type: 'repeatTrain', building: 5, unit: 'not_a_unit' }, b).unit, 'an unknown unit is dropped: the command only turns repeat off');
  assert.equal(sanitizeCommand({ type: 'repeatTrain', unit: 'worshipper' }, b), null, 'no building, no command');
});
