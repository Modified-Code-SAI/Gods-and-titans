// The gold and wood rate beside each count in the top bar (src/ui/hud-income.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { IncomeMeter, rateLabel, rateTitle, INCOME_MIN_SPAN } from '../../src/ui/hud-income.js';

test('the rate is what was gathered over the last minute, lumps and all', () => {
  const m = new IncomeMeter();
  // A 10-gold drop every 5 seconds: 120 a minute.
  for (let t = 0; t <= 120; t += 0.5) m.sample(t, Math.floor(t / 5) * 10);
  assert.ok(Math.abs(m.perMinute() - 120) < 12, String(m.perMinute()));
  assert.equal(rateLabel(m.perMinute()).replace(/\d+/, 'N'), '+N/min');
  assert.ok(m.samples.length <= 62, 'only the last minute is kept');
});

test('too little history says nothing, then the rate appears', () => {
  const m = new IncomeMeter();
  m.sample(0, 0);
  m.sample(INCOME_MIN_SPAN - 1, 50);
  assert.equal(m.perMinute(), null);
  assert.equal(rateLabel(m.perMinute()), '');
  m.sample(INCOME_MIN_SPAN + 1, 80);
  assert.ok(m.perMinute() > 0);
});

test('a stopped economy falls to nothing, and a clock that runs back starts over', () => {
  const m = new IncomeMeter();
  for (let t = 0; t <= 60; t++) m.sample(t, t * 2);
  for (let t = 61; t <= 140; t++) m.sample(t, 120);
  assert.equal(m.perMinute(), 0);
  assert.equal(rateLabel(0), '');
  m.sample(10, 5); // a rematch: the clock and the stats begin again
  assert.equal(m.samples.length, 1);
  assert.equal(m.perMinute(), null);
  m.sample(100, 500); // a replay seek
  assert.equal(m.samples.length, 1);
});

test('the hover text names the resource and gives the rate when there is one', () => {
  assert.equal(rateTitle('Gold', 'mined at mines', null), 'Gold — mined at mines');
  assert.match(rateTitle('Gold', 'mined at mines', 119.6), /about 120 a minute/);
  assert.match(rateTitle('Wood', 'cut in the forest', 0), /Nobody is gathering/);
  assert.equal(rateLabel(NaN), '');
});
