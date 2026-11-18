// A Guardian computer player walls the front of its base (DESIGN 10, src/ai/walls.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wallPlan, planWalls, cutsOff } from '../../src/ai/walls.js';
import { wallLine } from '../../src/data/walls.js';

const map = { width: 96, height: 96 };
/** An open map with blocked tiles: isPassable and nearestPassable as MapState has them. */
function openMap(blocked = new Set()) {
  return {
    width: 96, height: 96,
    isPassable: (x, y) => x >= 0 && y >= 0 && x < 96 && y < 96 && !blocked.has(`${x},${y}`),
    nearestPassable: (x, y) => ({ tx: Math.floor(x), ty: Math.floor(y) }),
  };
}

test('the line runs across the front, 16 tiles out, with a five-tile gate in the middle', () => {
  const plan = wallPlan({ x: 20, y: 48 }, { x: 1, y: 0 }, map); // facing east: a north-south line at x = 36
  assert.equal(plan.length, 2);
  const tiles = plan.flatMap(([a, b, c, d]) => wallLine(a, b, c, d));
  assert.ok(tiles.every(([x]) => x === 36), JSON.stringify(tiles));
  const ys = tiles.map(([, y]) => y).sort((p, q) => p - q);
  assert.deepEqual([ys[0], ys.at(-1)], [40, 56]);
  for (const y of [46, 47, 48, 49, 50]) assert.ok(!ys.includes(y), `the gate at y ${y} stays open`);
  // diagonal front: a diagonal line, still with the middle open
  const diag = wallPlan({ x: 20, y: 20 }, { x: Math.SQRT1_2, y: Math.SQRT1_2 }, map);
  const dt = diag.flatMap(([a, b, c, d]) => wallLine(a, b, c, d));
  const mid = [Math.floor(20 + 16 * Math.SQRT1_2), Math.floor(20 + 16 * Math.SQRT1_2)];
  assert.ok(!dt.some(([x, y]) => x === mid[0] && y === mid[1]));
  assert.ok(dt.length >= 16);
  assert.equal(wallPlan({ x: 85, y: 48 }, { x: 1, y: 0 }, map), null, 'off the map: no wall');
});

test('only a Guardian plans a wall, once it is a Town with wood to spare, and stone in the City', () => {
  const issued = [];
  const worker = (id) => ({ id, x: 30, y: 48 });
  const mk = (over = {}) => ({
    walls: true, threat: null, standIn: false, wall: null, me: 0,
    world: { map: openMap(), mineList: [], buildingList: [], tickCount: 0 },
    home: () => ({ x: 20, y: 48 }),
    frontDir: () => ({ x: 1, y: 0 }),
    militia: null, hauls: new Map(),
    issue: (c) => issued.push(c),
    ...over,
  });
  const scan = (p, t = 600) => ({ p, t, tcs: [{}], workers: Array.from({ length: 14 }, (_, i) => worker(i + 1)), job: new Map(), jobs: {} });
  let wants = [];
  planWalls(mk({ walls: false }), scan({ tier: 2, wood: 900, gold: 900 }), wants);
  assert.equal(wants.length, 0, 'a balanced AI builds none');
  planWalls(mk(), scan({ tier: 1, wood: 900, gold: 900 }), wants);
  assert.equal(wants.length, 0, 'not in the Village');
  planWalls(mk(), scan({ tier: 2, wood: 900, gold: 900 }, 400), wants);
  assert.equal(wants.length, 0, 'not in the opening');
  const ai = mk();
  planWalls(ai, scan({ tier: 2, wood: 900, gold: 900 }), wants);
  assert.equal(wants.length, 1);
  assert.ok(wants[0].run());
  assert.equal(issued.length, 2);
  assert.ok(issued.every((c) => c.type === 'build' && c.building === 'wooden_wall' && c.units.length === 2));
  assert.equal(new Set(issued.flatMap((c) => c.units)).size, 4, 'each wing has its own builders');
  wants = [];
  planWalls(ai, scan({ tier: 2, wood: 900, gold: 900 }), wants);
  assert.equal(wants.length, 0, 'once only');
  ai.world.buildingList = [1, 2, 3].map((id) => ({ id, dead: false, owner: 0, type: 'wooden_wall', constructed: true, queue: [] }));
  planWalls(ai, scan({ tier: 3, wood: 900, gold: 1300 }), wants);
  assert.equal(wants.length, 1);
  assert.deepEqual(wants[0].cost, { gold: 60, wood: 30, faith: 0 });
  wants[0].run();
  assert.deepEqual(issued.at(-1), { type: 'upgradeWall', walls: [1, 2, 3] });
});

test('a line that would shut the base away from a mine or the map\'s middle is not built', () => {
  const home = { x: 20, y: 48 };
  const plan = wallPlan(home, { x: 1, y: 0 }, map);
  assert.equal(cutsOff(openMap(), home, [], plan), false, 'open ground: the ends and the gate leave ways out');
  // A river (blocked column at x = 36 but for the wall's own tiles and the gate) makes the gate the only way out;
  // walls on the gate's sides are fine, but a plan over the gate itself would close it.
  const river = new Set();
  for (let y = 0; y < 96; y++) if (y < 40 || y > 56) river.add(`36,${y}`);
  assert.equal(cutsOff(openMap(river), home, [], plan), false, 'the gate stays open');
  const closed = [...plan, [36, 46, 36, 50]];
  assert.equal(cutsOff(openMap(river), home, [], closed), true, 'closing the gate shuts the middle away');
  const mine = { tx: 50, ty: 47, size: 3, x: 51.5, y: 48.5, amount: 5000 };
  assert.equal(cutsOff(openMap(river), home, [mine], closed), true);
});
