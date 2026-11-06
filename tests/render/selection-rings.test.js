// Selection rings (DESIGN 8): units get a circle, buildings a rounded square that hugs the footprint.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { register } from 'node:module';

const VENDOR = new URL('../../vendor/three/', import.meta.url).href;
register(`data:text/javascript,${encodeURIComponent(`
export async function resolve(spec, ctx, next) {
  if (spec === 'three') return { url: ${JSON.stringify(`${VENDOR}three.module.js`)}, shortCircuit: true };
  return next(spec, ctx);
}`)}`);

const THREE = await import('three');
const { RingLayer } = await import('../../src/render/overlays.js');

test('a ring carries its shape: 0 for a circle, 1 for a building\'s rounded square', () => {
  const layer = new RingLayer(new THREE.Group(), 4);
  const c = new THREE.Color(0, 1, 0);
  layer.begin(0);
  layer.add(0, 0, 0, null, 1, c, 0.9, 0.1);
  layer.add(5, 0, 5, null, 2.4, c, 0.9, 0.1, 0, 1);
  layer.end();
  assert.equal(layer.aRing.itemSize, 4);
  assert.deepEqual([...layer.aRing.array.slice(0, 8)].map((v) => +v.toFixed(2)), [0.9, 0.1, 0, 0, 0.9, 0.1, 0, 1]);
  assert.match(layer.material.fragmentShader, /vRing\.w > 0\.5 \? pow\( pow\( q\.x, 8\.0 \)/);
  layer.dispose();
});
