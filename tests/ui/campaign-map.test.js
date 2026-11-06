// The chapter map on the campaign screen (src/ui/campaign-map.js): a seeded layout that stays the same per chapter,
// stops left to right on the map, the road drawn as far as it is open, and clicks only on open stops. Fake DOM.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { installFakeDom } from './fake-dom.js';
import { CHAPTERS } from '../../src/data/campaign.js';

let chapterMapLayout, buildChapterMap, MAP_W, MAP_H;
before(async () => {
  installFakeDom();
  ({ chapterMapLayout, buildChapterMap, MAP_W, MAP_H } = await import('../../src/ui/campaign-map.js'));
});

test('each chapter has its own layout, the same every time, with every stop on the map', () => {
  const seen = new Set();
  for (const c of CHAPTERS) {
    const a = chapterMapLayout(c);
    assert.deepEqual(a, chapterMapLayout(c), 'seeded from the chapter id');
    assert.equal(a.stops.length, c.missions.length);
    assert.equal(a.legs.length, c.missions.length - 1);
    assert.equal(a.land.length, c.missions.length, 'a patch of land under every stop');
    for (let i = 0; i < a.stops.length; i++) {
      const s = a.stops[i];
      assert.ok(s.x > 20 && s.x < MAP_W - 20 && s.y > 20 && s.y < MAP_H - 20, `stop ${i} inside the map`);
      if (i) assert.ok(s.x > a.stops[i - 1].x + 60, 'stops run left to right, a pace apart');
    }
    for (const s of a.stops) assert.ok(Math.hypot(s.x - a.compass.x, s.y - a.compass.y) > 40, 'the compass keeps off the stops');
    seen.add(JSON.stringify(a.stops));
  }
  assert.equal(seen.size, CHAPTERS.length);
});

test('open, won and locked stops; the road; picking and selecting', () => {
  const c = CHAPTERS[0];
  const [m1, m2, m3] = c.missions;
  const picked = [];
  const map = buildChapterMap(c, {
    isOpen: (m) => m === m1 || m === m2,
    isWon: (m) => m === m1,
    onPick: (m) => picked.push(m.id),
  });
  assert.equal(map.el.getAttribute('aria-hidden'), 'true', 'the mission list is the accessible control');
  assert.match(map.el.getAttribute('class'), new RegExp(`is-${c.id}`));
  const cls = (g) => g.getAttribute('class');
  assert.match(cls(map.stops[0]), /is-open/);
  assert.match(cls(map.stops[0]), /is-won/);
  assert.match(cls(map.stops[1]), /is-open/);
  assert.match(cls(map.stops[2]), /is-locked/);
  assert.deepEqual(map.legs.map((l) => l.getAttribute('class')), ['is-walked', '', '', '']);
  map.stops[1].click();
  map.stops[2].click();
  assert.deepEqual(picked, [m2.id], 'a locked stop does nothing');
  map.select(m2);
  assert.ok(map.stops[1].classList.contains('is-selected'));
  assert.ok(!map.stops[0].classList.contains('is-selected'));
  map.select(m3);
  assert.ok(map.stops[2].classList.contains('is-selected'));
  assert.ok(!map.stops[1].classList.contains('is-selected'));
});
