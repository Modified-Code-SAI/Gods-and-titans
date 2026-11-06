// Five and six players: the six-base ring layout (src/sim/mapgen.js startPlan 'ring').
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateMap, mapHash, validateMap, startPlan, mapOptions, RING_SLOTS } from '../../src/sim/mapgen.js';
import { MAX_PLAYERS, CROWDED_MAP_SIZES, MAP_SIZES, mapTiles, TERRAIN } from '../../src/config.js';
import { LANDSCAPE_IDS } from '../../src/data/landscapes.js';

const SIZES = ['small', 'medium'];
const center = (s) => [s.x + 2, s.y + 2];
const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

test('six seats: the map holds as many players as the lobby', () => {
  assert.equal(MAX_PLAYERS, 6);
  assert.equal(RING_SLOTS, MAX_PLAYERS);
});

test('five or six players get a bigger map of the same name; up to four keep theirs', () => {
  for (const size of SIZES) {
    assert.equal(mapTiles(size, 4), MAP_SIZES[size]);
    assert.equal(mapTiles(size, 5), CROWDED_MAP_SIZES[size]);
    assert.equal(generateMap({ seed: 3, mapSize: size, playerCount: 6 }).width, CROWDED_MAP_SIZES[size]);
    assert.equal(generateMap({ seed: 3, mapSize: size, playerCount: 4 }).width, MAP_SIZES[size]);
  }
  assert.ok(generateMap({ seed: 3, mapSize: 80, playerCount: 6 }).width >= 112, 'a numeric size is raised to what the ring needs');
});

test('ring plan: teams sit side by side, the first team of a 3v3 on the west', () => {
  assert.deepEqual(startPlan(6, [1, 1, 1, 2, 2, 2]), { mode: 'ring', slots: [4, 5, 0, 1, 2, 3] });
  assert.deepEqual(startPlan(6, [1, 2, 1, 2, 1, 2]).slots, [4, 1, 5, 2, 0, 3], 'teammates take neighbouring bases whatever the seat order');
  assert.deepEqual(startPlan(6, [1, 1, 2, 2, 3, 3]).slots, [4, 5, 0, 1, 2, 3]);
  assert.deepEqual(startPlan(6, null).slots, [4, 5, 0, 1, 2, 3]);
  assert.deepEqual(startPlan(5, [2, 1, 1, 1, 2]).slots, [1, 4, 5, 0, 2], 'the bigger team first');
  assert.equal(startPlan(4, [1, 1, 2, 2]).mode, 'teams', 'four players keep their layouts');
  assert.equal(startPlan(9).slots.length, 6, 'never more than six');
});

test('every five- and six-player map is valid on every landscape and size', () => {
  const teamsOf = [null, [1, 1, 1, 2, 2, 2], [1, 1, 2, 2, 3, 3]];
  for (const landscape of LANDSCAPE_IDS) {
    for (const size of SIZES) {
      for (const pc of [5, 6]) {
        for (let seed = 1; seed <= 3; seed++) {
          const teams = teamsOf[seed - 1] && teamsOf[seed - 1].slice(0, pc);
          const m = generateMap({ seed, mapSize: size, playerCount: pc, teams, landscape });
          assert.deepEqual(validateMap(m), [], `${landscape} ${size} ${pc}p seed ${seed}`);
          assert.equal(m.starts.length, pc);
          assert.equal(m.meta.layout, 'ring');
          assert.ok(m.sacred.length > 0, `${landscape} ${size} ${pc}p seed ${seed} has a sacred site`);
        }
      }
    }
  }
});

test('3v3 is fair: 180° symmetric terrain, each east base the image of a west base', () => {
  for (const size of SIZES) {
    const m = generateMap({ seed: 21, mapSize: size, playerCount: 6, teams: [1, 1, 1, 2, 2, 2] });
    const n = m.width;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) assert.equal(m.terrain[(n - 1 - y) * n + (n - 1 - x)], m.terrain[y * n + x]);
    const img = (s) => [n - 4 - s.x, n - 4 - s.y].join(',');
    const west = m.starts.slice(0, 3).map(img).sort();
    const east = m.starts.slice(3).map((s) => [s.x, s.y].join(',')).sort();
    assert.deepEqual(west, east);
    for (const s of m.starts.slice(0, 3)) assert.ok(s.x + 2 < n / 2, 'team 1 on the west half');
  }
});

test('six bases on a ring: every base about as far from its two neighbours, the center and its nearest expansions', () => {
  for (const size of SIZES) {
    for (const seed of [1, 2, 3, 4]) {
      const m = generateMap({ seed, mapSize: size, playerCount: 6 });
      const n = m.width;
      const cs = m.starts.map(center);
      const near2 = cs.map((c, i) => cs.filter((_, j) => j !== i).map((o) => d(c, o)).sort((a, b) => a - b).slice(0, 2));
      const flat = near2.flat();
      assert.ok(Math.max(...flat) / Math.min(...flat) < 1.12, `${size} seed ${seed}: neighbour distances ${flat.map(Math.round)}`);
      const mid = cs.map((c) => d(c, [n / 2, n / 2]));
      assert.ok(Math.max(...mid) / Math.min(...mid) < 1.08, `${size} seed ${seed}: distances to the center ${mid.map(Math.round)}`);
      // The two nearest expansion mines of each base (the ones it shares with its neighbours).
      const exp = m.mines.slice(6).map((mm) => [mm.tx + 1.5, mm.ty + 1.5]);
      const ex2 = cs.map((c) => exp.map((e) => d(c, e)).sort((a, b) => a - b).slice(0, 2)).flat();
      assert.ok(Math.max(...ex2) / Math.min(...ex2) < 1.12, `${size} seed ${seed}: nearest expansions ${ex2.map(Math.round)}`);
      // Open ground and wood near every base: the same pocket for all six.
      for (const c of cs) assert.ok(m.terrain[Math.floor(c[1]) * n + Math.floor(c[0])] !== TERRAIN.FOREST);
    }
  }
});

test('five players: the free sixth base is a rich guarded expansion', () => {
  const m = generateMap({ seed: 8, mapSize: 'small', playerCount: 5 });
  assert.equal(m.starts.length, 5);
  assert.ok(m.camps.some((c) => c.level === 3), 'a strong camp guards the spare base');
  assert.deepEqual(validateMap(m), []);
});

test('a six-player setup builds the same map everywhere and the hash covers the teams', () => {
  const players = [1, 1, 1, 2, 2, 2].map((team) => ({ team }));
  const a = generateMap(mapOptions({ seed: 5, mapSize: 'medium', players }));
  const b = generateMap(mapOptions({ seed: 5, mapSize: 'medium', players }));
  assert.equal(mapHash(a), mapHash(b));
  assert.deepEqual(a.decor, b.decor);
  const mixed = generateMap(mapOptions({ seed: 5, mapSize: 'medium', players: [1, 2, 1, 2, 1, 2].map((team) => ({ team })) }));
  assert.notEqual(mapHash(a), mapHash(mixed), 'the seats decide who starts where');
});

test('a World for six players puts each town center on its start, teammates side by side', async () => {
  const { createWorld } = await import('../../src/sim/world.js');
  const teams = [1, 2, 1, 2, 1, 2];
  const players = teams.map((team, i) => ({ index: i, name: `P${i}`, team, pantheon: 'greek', color: '#d63a3a', kind: 'ai', difficulty: 'normal' }));
  const setup = { version: '0.1.0', seed: 12, mapSize: 'small', players };
  const w = createWorld(setup);
  const m = generateMap(mapOptions(setup));
  assert.equal(w.map.width, CROWDED_MAP_SIZES.small);
  const tcs = w.buildingList.filter((b) => b.type === 'town_center');
  assert.equal(tcs.length, 6);
  for (let i = 0; i < 6; i++) {
    const tc = tcs.find((b) => b.owner === i);
    assert.deepEqual([tc.tx, tc.ty], [m.starts[i].x, m.starts[i].y]);
  }
  // Team 1 (seats 1, 3 and 5) holds the west half, team 2 the east.
  for (const tc of tcs) assert.equal(tc.x < w.map.width / 2, teams[tc.owner] === 1, `player ${tc.owner} on its team's side`);
});
