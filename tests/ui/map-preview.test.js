// The lobby's map preview (src/ui/map-preview.js): what it draws for a lobby state, the picture of a real map, the
// caption, and that Random shows the veil. Fake DOM.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { installFakeDom } from './fake-dom.js';
import { PLAYER_COLORS } from '../../src/config.js';

let previewSpec, paintPreview, sampleMap, MapPreview;
before(async () => {
  installFakeDom();
  ({ previewSpec, paintPreview, sampleMap, MapPreview } = await import('../../src/ui/map-preview.js'));
});

const state = (o = {}) => ({
  landscape: 'islands', mapSize: 'small',
  slots: [{ kind: 'host', color: 0, team: 1 }, { kind: 'ai', color: 1, team: 2 }, { kind: 'closed', color: 2, team: 3 }, { kind: 'open', color: 3, team: 4 }],
  ...o,
});

test('the spec takes the filled seats in order, with their colours and teams', () => {
  const s = previewSpec(state());
  assert.equal(s.landscape, 'islands');
  assert.deepEqual(s.colors, [PLAYER_COLORS[0], PLAYER_COLORS[1]]);
  assert.deepEqual(s.teams, [1, 2]);
  assert.equal(previewSpec(state({ survival: true })).teams.join(), '1,1', 'the Trial is played together');
  assert.equal(previewSpec({}).mapSize, 'small');
  assert.notEqual(previewSpec(state()).key, previewSpec(state({ mapSize: 'medium' })).key);
});

test('the picture is the map: two pixels a tile, a base in each seat colour', () => {
  const spec = previewSpec(state());
  const map = sampleMap(spec);
  assert.equal(sampleMap(spec), map, 'kept, not made again');
  const img = paintPreview(map, spec.colors);
  assert.equal(img.width, map.width * 2);
  assert.equal(img.data.length, img.width * img.height * 4);
  map.starts.forEach((st, i) => {
    const x = Math.round((st.x + 2) * 2), y = Math.round((st.y + 2) * 2);
    const j = (y * img.width + x) * 4;
    const hex = `#${[0, 1, 2].map((k) => img.data[j + k].toString(16).padStart(2, '0')).join('')}`;
    assert.equal(hex, spec.colors[i], `start ${i} drawn in its seat colour`);
  });
  for (let j = 3; j < img.data.length; j += 4 * 997) assert.equal(img.data[j], 255, 'opaque');
});

test('the block: a sample caption, or the veil for Random', () => {
  const p = new MapPreview();
  p.update(state());
  assert.match(p.caption.textContent, /A sample Islands map/);
  assert.ok(!p.el.classList.contains('is-random'));
  p.update(state({ landscape: 'random' }));
  assert.ok(p.el.classList.contains('is-random'));
  assert.match(p.caption.textContent, /drawn at random/);
  p.cleanup();
});
