// Attack range rings (src/render/range-ring.js, DESIGN 8 "Range rings"): under a tower's placement ghost and
// around selected buildings that shoot; and the ghost's glide from tile to tile (src/render/placement.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { register } from 'node:module';

const VENDOR = new URL('../../vendor/three/', import.meta.url).href;
register(`data:text/javascript,${encodeURIComponent(`
export async function resolve(spec, ctx, next) {
  if (spec === 'three') return { url: ${JSON.stringify(`${VENDOR}three.module.js`)}, shortCircuit: true };
  if (spec.startsWith('three/addons/')) return { url: ${JSON.stringify(VENDOR + 'addons/')} + spec.slice(13), shortCircuit: true };
  return next(spec, ctx);
}`)}`);

const THREE = await import('three');
const { RangeRing, buildingReach, ringVertices, RING_SEGMENTS } = await import('../../src/render/range-ring.js');
const { PlacementLayer } = await import('../../src/render/placement.js');
const { heightAt } = await import('../../src/render/height.js');
const { BUILDINGS } = await import('../../src/data/buildings.js');
const { TERRAIN } = await import('../../src/config.js');

function hillyMap(W = 40, H = 40) {
  const heights = new Float32Array((W + 1) * (H + 1));
  for (let y = 0; y <= H; y++) for (let x = 0; x <= W; x++) heights[y * (W + 1) + x] = Math.sin(x * 0.7) * 0.5 + Math.cos(y * 0.45) * 0.4;
  return { width: W, height: H, heights, terrain: new Uint8Array(W * H).fill(TERRAIN.GRASS), seed: 3, decor: [], mines: [], starts: [] };
}

test('reach is the attack range plus upgrades plus half the footprint (the sim measures from the edge)', () => {
  const t = BUILDINGS.tower;
  assert.equal(buildingReach(t), t.attack.range + t.size / 2);
  assert.equal(buildingReach(t, 2), t.attack.range + 2 + t.size / 2);
  assert.equal(buildingReach(BUILDINGS.house), 0, 'no attack, no ring');
  assert.equal(buildingReach(null), 0);
});

test('the ring is draped on the terrain, its outer edge at the reach', () => {
  const map = hillyMap();
  const { pos, ring, wash } = ringVertices(map, 20, 18, 8);
  assert.equal(pos.length, (RING_SEGMENTS + 1) * 2 * 3);
  for (let i = 0; i <= RING_SEGMENTS; i += 17) {
    const o = (i * 2 + 1) * 3; // outer vertex
    const d = Math.hypot(pos[o] - 20, pos[o + 2] - 18);
    assert.ok(Math.abs(d - 8) < 1e-4, `outer radius ${d}`);
    assert.ok(Math.abs(pos[o + 1] - heightAt(map, pos[o], pos[o + 2]) - 0.07) < 1e-4, 'just off the ground');
    assert.equal(ring[(i * 2 + 1) * 2 + 1], 1);
    assert.equal(ring[i * 2 * 2 + 1], 0);
  }
  assert.ok(wash > 0 && wash < 1);
});

test('a ring re-drapes only when it moves, fades in, and hides', () => {
  const root = new THREE.Group();
  const r = new RangeRing(root, hillyMap());
  r.set(10, 10, 6, new THREE.Color('#ff0000'));
  assert.ok(r.visible);
  const key = r.key;
  r.posAttr.version = 0;
  r.set(10, 10, 6, null);
  assert.equal(r.key, key);
  assert.equal(r.posAttr.version, 0, 'same spot: no re-upload');
  r.set(11, 10, 6, null);
  assert.ok(r.posAttr.version > 0, 'moved: re-draped');
  r.update(0.016, 0);
  const a1 = r.uniforms.uAlpha.value;
  for (let i = 0; i < 30; i++) r.update(0.016, i * 0.016);
  assert.ok(a1 > 0 && a1 < r.uniforms.uAlpha.value && r.uniforms.uAlpha.value > 0.95, 'fades in');
  r.hide();
  assert.equal(r.visible, false);
  r.set(1, 1, 0, null);
  assert.equal(r.visible, false, 'no reach, no ring');
  r.dispose();
  assert.equal(root.children.length, 0);
});

test('a tower ghost shows its reach (dimmer when red), a house ghost none; the ghost glides between tiles', () => {
  const root = new THREE.Group();
  const layer = new PlacementLayer(root, hillyMap(), () => ({ pantheon: null, color: '#3366ff' }));
  layer.show('tower', 10, 10, true, null, 1);
  assert.ok(layer.range.visible);
  const s = BUILDINGS.tower.size;
  assert.equal(layer.range.key, `${(10 + s / 2).toFixed(2)},${(10 + s / 2).toFixed(2)},${buildingReach(BUILDINGS.tower, 1).toFixed(2)}`);
  assert.equal(layer.range.target, 1);
  const root0 = layer.ghost.model.root.position.clone();
  assert.equal(root0.x, 10 + s / 2, 'the first show snaps');
  layer.show('tower', 14, 10, false, null, 1);
  assert.equal(layer.range.target, 0.45, 'dimmer while the spot is refused');
  assert.equal(layer.ghost.model.root.position.x, root0.x, 'a later show moves the target, not the ghost');
  layer.update(0.016);
  const x1 = layer.ghost.model.root.position.x;
  assert.ok(x1 > root0.x && x1 < 14 + s / 2, 'on its way');
  for (let i = 0; i < 40; i++) layer.update(0.016);
  assert.ok(Math.abs(layer.ghost.model.root.position.x - (14 + s / 2)) < 1e-3, 'arrived');
  layer.show('house', 3, 3, true, null);
  assert.equal(layer.range.visible, false, 'a house does not shoot');
  layer.show('tower', 20, 20, true, null);
  layer.hide();
  assert.equal(layer.range.visible, false);
  layer.show('tower', 25, 20, true, null);
  assert.equal(layer.ghost.model.root.position.x, 25 + s / 2, 'shown again after hiding: snaps');
  layer.dispose();
  assert.equal(root.children.length, 0);
});
