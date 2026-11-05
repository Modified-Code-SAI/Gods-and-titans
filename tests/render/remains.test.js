import test from 'node:test';
import assert from 'node:assert/strict';
import { register } from 'node:module';

// Map the browser import map ('three') onto the vendored copy.
const VENDOR = new URL('../../vendor/three/', import.meta.url).href;
register(`data:text/javascript,${encodeURIComponent(`
export async function resolve(spec, ctx, next) {
  if (spec === 'three') return { url: ${JSON.stringify(`${VENDOR}three.module.js`)}, shortCircuit: true };
  return next(spec, ctx);
}`)}`);

const THREE = await import('three');
const { CORPSE, corpseCap, corpseHold, corpseSink, hurryCorpses, rubblePieces, RubbleLayer, RUBBLE } = await import('../../src/render/remains.js');

test('the fallen lie a while, ghosts fade at once', () => {
  assert.equal(corpseHold({}, { kind: 'humanoid' }), CORPSE.hold);
  assert.equal(corpseHold({}, { kind: 'spirit' }), CORPSE.spiritHold);
  assert.ok(CORPSE.hold > 10);
  assert.equal(corpseSink(1, CORPSE.hold), 0);
  assert.equal(corpseSink(CORPSE.hold + CORPSE.sink, CORPSE.hold), 1);
  assert.ok(corpseCap('low') < corpseCap('ultra'));
});

test('past the cap the oldest bodies sink early, never before they settle', () => {
  const list = [
    { dyingT: 8, deathHold: 14 },
    { dyingT: 0.4, deathHold: 14 },
    { dyingT: 5, deathHold: 14 },
    { dyingT: 15, deathHold: 14 }, // already sinking: not counted
  ];
  assert.equal(hurryCorpses(list, 1), 2);
  assert.equal(list[0].deathHold, 8);
  assert.equal(list[1].deathHold, CORPSE.settle); // still falling: sinks once it has settled
  assert.equal(list[2].deathHold, 14);
  assert.equal(hurryCorpses(list, 5), 0);
});

test('rubble piles are seeded, sized by the footprint, and less for an unfinished building', () => {
  const a = rubblePieces(3, 42);
  assert.deepEqual(a, rubblePieces(3, 42));
  assert.notDeepEqual(a, rubblePieces(3, 43));
  assert.ok(rubblePieces(5, 1).length > a.length);
  assert.ok(rubblePieces(3, 42, { amount: 0.3 }).length < a.length);
  for (const p of a) {
    assert.ok(Math.hypot(p.x, p.z) <= 3 * 0.5 * 1.05 + 1e-9);
    assert.ok(p.sx > 0 && p.sy > 0 && p.sz > 0);
  }
  const wood = rubblePieces(2, 7, { wood: true });
  assert.ok(wood.filter((p) => p.kind === 'block').every((p) => p.sx > p.sz)); // beams
});

test('rubble lies, sinks and is cleared by a new building', () => {
  const parent = new THREE.Group();
  const layer = new RubbleLayer(parent, () => 1, { quality: 'medium' });
  layer.add(10, 10, 3, { seed: 5 });
  layer.add(30, 30, 2, { seed: 6 });
  layer.update(0.1);
  const s = layer.stats();
  assert.equal(s.piles, 2);
  assert.ok(s.chunks > 0 && s.blocks > 0);
  const marks = [];
  layer.scorches((...a) => marks.push(a));
  assert.equal(marks.length, 2);
  layer.clearRect(9, 9, 12, 12);
  layer.update(0.1);
  assert.equal(layer.stats().piles, 1);
  layer.update(RUBBLE.seconds);
  assert.equal(layer.stats().piles, 0);
  assert.equal(layer.stats().chunks, 0);
  layer.dispose();
  assert.equal(parent.children.length, 0);
});
