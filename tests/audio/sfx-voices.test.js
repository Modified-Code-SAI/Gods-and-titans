import test from 'node:test';
import assert from 'node:assert/strict';
import { unitBark, voiceOf, BarkGate, BARK_GAP, VOICE_RECIPES, VOICE_LEVEL, VOICE_LIMITS } from '../../src/audio/sfx-voices.js';
import { UNITS } from '../../src/data/index.js';

const one = (cls) => Object.values(UNITS).find((d) => d.class === cls);

test('every unit class has a voice, except siege engines', () => {
  for (const d of Object.values(UNITS)) {
    const v = voiceOf(d);
    if (d.class === 'siege') assert.equal(v, null, d.id);
    else assert.ok(['worker', 'soldier', 'god', 'creature', 'titan'].includes(v), `${d.id}: ${v}`);
  }
  assert.equal(voiceOf(undefined), null);
});

test('the most important unit speaks for the group; a worker never gives a war cry', () => {
  const worker = one('worker');
  const soldier = one('infantry');
  const god = one('god');
  const titan = one('titan');
  const ram = one('siege');
  assert.equal(unitBark([worker], 'select'), 'vo_worker_select');
  assert.equal(unitBark([worker], 'attack'), 'vo_worker_ack');
  assert.equal(unitBark([worker, soldier], 'attack'), 'vo_soldier_attack');
  assert.equal(unitBark([soldier, god, worker], 'ack'), 'vo_god_ack');
  assert.equal(unitBark([god, titan], 'select'), 'vo_titan_select');
  assert.equal(unitBark([ram], 'ack'), null, 'a ram has nobody to answer');
  assert.equal(unitBark([ram, soldier], 'ack'), 'vo_soldier_ack');
  assert.equal(unitBark([], 'select'), null);
});

test('replies wait their turn', () => {
  const g = new BarkGate();
  assert.equal(g.allow(10, 'select'), true);
  assert.equal(g.allow(10.2, 'ack'), false, 'one at a time');
  assert.equal(g.allow(10 + BARK_GAP.select + 0.01, 'attack'), true);
  assert.equal(g.allow(10 + BARK_GAP.select + 0.5, 'ack'), false, 'a war cry holds the floor longer');
});

test('every reply has a level and a limit, and is player feedback (outside the world voice cap)', () => {
  const names = Object.keys(VOICE_RECIPES);
  assert.equal(names.length, 15);
  for (const n of names) {
    assert.ok(VOICE_LEVEL[n] > 0.05 && VOICE_LEVEL[n] < 1, n);
    assert.equal(VOICE_LIMITS[n].ui, true);
  }
});
