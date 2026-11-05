import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FakeAudioContext } from './fake-audio.js';
import { ambienceMix, sampleLand, daylight, AmbienceEngine } from '../../src/audio/ambience.js';

test('daylight: full by day, none at night, a ramp at dawn and dusk', () => {
  assert.equal(daylight(12), 1);
  assert.equal(daylight(23), 0);
  assert.equal(daylight(2), 0);
  assert.ok(daylight(19.2) > 0 && daylight(19.2) < 1);
  assert.equal(daylight(36), 1, 'wraps past midnight');
});

test('the mix follows the hour, the land, the zoom and the fighting', () => {
  const noon = ambienceMix({ hour: 12, forest: 0.6 });
  const night = ambienceMix({ hour: 23, forest: 0.6 });
  assert.ok(noon.birds > 0.8 && noon.insects === 0, 'birds by day');
  assert.ok(night.insects > 0.8 && night.birds === 0, 'crickets at night');
  assert.ok(ambienceMix({ hour: 12, forest: 0 }).birds < noon.birds, 'fewer birds over open ground');
  assert.equal(ambienceMix({ water: 0 }).shore, 0);
  assert.ok(ambienceMix({ water: 0.4 }).shore > 0.9, 'waves by the water');
  const far = ambienceMix({ hour: 12, forest: 0.6, water: 0.4, zoom: 4.5 });
  assert.ok(far.wind > noon.wind && far.birds < noon.birds * 0.4 && far.shore < 0.4, 'pulled back: wind over the land');
  assert.ok(ambienceMix({ hour: 12, forest: 0.6, battle: 1 }).birds < noon.birds * 0.2, 'birds go quiet in a fight');
  assert.deepEqual(ambienceMix({ hidden: true }), { wind: 0, shore: 0, birds: 0, insects: 0 }, 'a hidden tab is silent');
});

test('sampleLand counts water and forest around a point, clipped to the map', () => {
  const w = 20;
  const h = 20;
  const t = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) t[y * w + x] = x < 10 ? 2 : 3; // west half water, east forest
  const mid = sampleLand(t, w, h, 10, 10, 6);
  assert.ok(Math.abs(mid.water - 0.5) < 0.15 && Math.abs(mid.forest - 0.5) < 0.15);
  assert.ok(sampleLand(t, w, h, 2, 10, 4).water > 0.9);
  assert.deepEqual(sampleLand(t, w, h, -50, -50, 3), { water: 0, forest: 0 });
});

test('the engine plays through the shared chain, schedules birds, crickets and waves, and stops cleanly', () => {
  const ctx = new FakeAudioContext();
  const master = ctx.createGain();
  const noise = ctx.createBuffer(1, 8000, 8000);
  const eng = new AmbienceEngine();
  eng.start({ ctx, master, noise });
  assert.ok(eng.running);
  const before = ctx.sources ? ctx.sources.length : 0;
  for (let i = 0; i < 40; i++) {
    ctx.currentTime += 0.25;
    eng.update({ wind: 0.6, shore: 1, birds: 1, insects: 1 });
  }
  const made = ctx.sources ? ctx.sources.slice(before) : [];
  assert.ok(made.length > 10, `${made.length} birds and crickets scheduled in 10 s`);
  for (const s of made) assert.ok(s.stopped !== null && s.stopped > s.started, 'every one-shot stops');
  eng.start({ ctx, master, noise }); // idempotent
  eng.stop();
  assert.equal(eng.running, false);
  eng.update({ wind: 1, shore: 1, birds: 1, insects: 1 }); // a no-op once stopped
  new AmbienceEngine().update({ wind: 1 }); // and before it starts
});
