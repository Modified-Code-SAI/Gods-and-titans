import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { register } from 'node:module';

// Map the browser import map ('three', 'three/addons/…') onto the vendored copy.
const VENDOR = new URL('../../vendor/three/', import.meta.url).href;
register(`data:text/javascript,${encodeURIComponent(`
export async function resolve(spec, ctx, next) {
  if (spec === 'three') return { url: ${JSON.stringify(`${VENDOR}three.module.js`)}, shortCircuit: true };
  if (spec.startsWith('three/addons/')) return { url: ${JSON.stringify(VENDOR + 'addons/')} + spec.slice(13), shortCircuit: true };
  return next(spec, ctx);
}`)}`);
const { createTerrainTextures, fillGroundDetail, DETAIL_SIZE, DETAIL_LAYERS, DETAIL_URL } = await import('../../src/render/terrain-textures.js');
const { SKY_DETAIL_URL } = await import('../../src/render/shading.js');

const root = fileURLToPath(new URL('../../', import.meta.url));

/** Width, height and colour type of a PNG, from its header. */
function pngInfo(path) {
  const b = readFileSync(path);
  assert.equal(b.toString('latin1', 1, 4), 'PNG', `${path} is a PNG`);
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20), colorType: b[25], bytes: b.length };
}

test('the photo detail and the sky clouds are there, at the sizes the renderer reads', () => {
  const g = pngInfo(root + DETAIL_URL);
  assert.deepEqual([g.width, g.height], [DETAIL_SIZE, DETAIL_SIZE * DETAIL_LAYERS]);
  assert.ok(g.colorType === 2 || g.colorType === 6, 'RGB(A): a grey PNG would come back with the wrong channels');
  assert.ok(g.bytes < 700000, `ground detail is ${g.bytes} bytes`);
  const s = pngInfo(root + SKY_DETAIL_URL);
  assert.deepEqual([s.width, s.height], [512, 128]);
  assert.ok(s.bytes < 200000, `sky clouds are ${s.bytes} bytes`);
  assert.match(readFileSync(root + 'assets/textures/CREDITS.md', 'utf8'), /CC0/);
});

test('the ground detail starts flat and takes the picture\'s pixels when they arrive', () => {
  const t = createTerrainTextures();
  const d = t.detail;
  assert.equal(d.image.width, DETAIL_SIZE);
  assert.equal(d.image.depth, DETAIL_LAYERS);
  assert.ok(d.image.data.every((v) => v === 128), 'neutral (0.5) everywhere until the photo is here');
  const px = new Uint8ClampedArray(DETAIL_SIZE * DETAIL_SIZE * DETAIL_LAYERS * 4);
  px[0] = 7;
  px[px.length - 1] = 9;
  const v = d.version;
  assert.equal(fillGroundDetail(d, px, DETAIL_SIZE, DETAIL_SIZE * DETAIL_LAYERS), true);
  assert.equal(d.image.data[0], 7);
  assert.equal(d.image.data[px.length - 1], 9);
  assert.ok(d.version > v, 'uploaded again');
  assert.equal(fillGroundDetail(d, new Uint8ClampedArray(16), 2, 2), false, 'a picture of the wrong size is refused');
  t.dispose();
});
