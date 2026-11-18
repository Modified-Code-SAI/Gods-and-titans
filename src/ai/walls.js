// AI walls (DESIGN 10): a Guardian computer player closes the front of its base with a wooden wall once it
// is a Town, a gate left open in the middle for its own armies and workers, and turns it to stone in the City.
// Wall segments are never part of the scan (scan.js skips them), so the planner keeps its own note on the AI:
// `ai.wall` = { t, done, stone } once the line has been ordered.
import { BUILDINGS } from '../data/index.js';
import { pickBuilder } from './build.js';
import { wallLine } from '../data/walls.js';

const WALL = 'wooden_wall';
const WALL_REACH = 16; // tiles from the Town Center to the middle of the line, toward the map's middle
const GATE = 3; // the wings start this many steps either side of the middle: a gate of five tiles
const WING = 8; // ... and end this many steps out
const FROM_T = 480; // seconds: never in the opening
const STONE_GOLD = 1200; // the City's stone upgrade waits for this much gold in the bank
const STONE_WOOD = 300;

/** The eight wall directions; a wall line runs along one of them (data/walls.js wallLine). */
const DIRS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];

/**
 * The two wings of the line in front of the base as [[tx, ty, tx2, ty2], ...], or null when the middle of the
 * line is off the map. The line runs across the front direction, snapped to one of the eight wall directions.
 * @param {{ x: number, y: number }} home Town Center centre
 * @param {{ x: number, y: number }} front unit vector toward the enemy
 * @param {{ width: number, height: number }} map
 * @param {number} [reach] tiles from the Town Center to the middle of the line
 */
export function wallPlan(home, front, map, reach = WALL_REACH) {
  const cx = Math.floor(home.x + front.x * reach);
  const cy = Math.floor(home.y + front.y * reach);
  if (cx < 2 || cy < 2 || cx >= map.width - 2 || cy >= map.height - 2) return null;
  const sector = ((Math.round(Math.atan2(front.x, -front.y) / (Math.PI / 4)) % 8) + 8) % 8; // across the front
  const [sx, sy] = DIRS[sector];
  const clamp = (v, n) => Math.max(0, Math.min(n - 1, v));
  const wing = (k) => [
    clamp(cx + sx * GATE * k, map.width), clamp(cy + sy * GATE * k, map.height),
    clamp(cx + sx * WING * k, map.width), clamp(cy + sy * WING * k, map.height),
  ];
  return [wing(1), wing(-1)];
}

/**
 * Would this plan shut the base away from something it can reach now: the open ground at the map's middle, or a
 * gold mine within 40 tiles? A flood fill over the passable tiles from beside the Town Center, once as the map is
 * and once with every tile of the plan blocked (a wall never opens a way, and trees only ever fall).
 * @param {object} map MapState (isPassable, nearestPassable, width, height)
 * @param {{ x: number, y: number, size?: number }} home Town Center
 * @param {Array<{ tx: number, ty: number, size: number, x: number, y: number, dead?: boolean, amount?: number }>} mines
 * @param {Array<number[]>} plan wings as [tx, ty, tx2, ty2]
 */
export function cutsOff(map, home, mines, plan) {
  const start = map.nearestPassable(home.x, home.y, 12, false);
  if (!start) return true;
  const w = map.width;
  const blocked = new Set();
  for (const [a, b, c, d] of plan) for (const [x, y] of wallLine(a, b, c, d)) blocked.add(y * w + x);
  const fill = (wall) => {
    const seen = new Uint8Array(w * map.height);
    const queue = [start.ty * w + start.tx];
    seen[queue[0]] = 1;
    for (let q = 0; q < queue.length; q++) {
      const i = queue[q];
      const x = i % w;
      const y = (i - x) / w;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx;
        const ny = y + dy;
        const j = ny * w + nx;
        if (!map.isPassable(nx, ny) || seen[j] || (wall && blocked.has(j))) continue;
        seen[j] = 1;
        queue.push(j);
      }
    }
    return seen;
  };
  const reach = (seen, tx, ty, size) => {
    for (let y = ty - 1; y <= ty + size; y++) {
      for (let x = tx - 1; x <= tx + size; x++) if (x >= 0 && y >= 0 && x < w && y < map.height && seen[y * w + x]) return true;
    }
    return false;
  };
  const before = fill(false);
  const after = fill(true);
  const mid = map.nearestPassable(map.width / 2, map.height / 2, 20, false);
  if (mid && before[mid.ty * w + mid.tx] && !after[mid.ty * w + mid.tx]) return true;
  for (const m of mines) {
    if (m.dead || m.amount <= 0 || Math.hypot(m.x - home.x, m.y - home.y) > 40) continue;
    if (reach(before, m.tx, m.ty, m.size) && !reach(after, m.tx, m.ty, m.size)) return true;
  }
  return false;
}

/**
 * Add the wall wants for this think: the wooden line once (Town, quiet, wood to spare), then its stone upgrade
 * once (City, gold and wood to spare). Only for an AI that walls (the Guardian style).
 */
export function planWalls(ai, s, wants) {
  if (!ai.walls || ai.threat || ai.standIn) return;
  const p = s.p;
  const world = ai.world;
  const home = ai.home();
  if (!home || !s.tcs.length) return;
  const def = BUILDINGS[WALL];
  if (!ai.wall) {
    if (p.tier < 2 || s.t < FROM_T || p.wood < 500 || s.workers.length < 12) return;
    // The first line that shuts nothing away: 16 tiles out, else farther, else nearer.
    let plan = null;
    for (const reach of [WALL_REACH, WALL_REACH + 4, WALL_REACH - 3]) {
      const p2 = wallPlan(home, ai.frontDir(), world.map, reach);
      if (p2 && !cutsOff(world.map, home, world.mineList, p2)) {
        plan = p2;
        break;
      }
    }
    if (!plan) {
      ai.wall = { t: s.t, done: true, stone: true }; // nowhere to put it safely: never ask again
      return;
    }
    const segs = plan.reduce((n, [a, b, c, d]) => n + Math.max(Math.abs(c - a), Math.abs(d - b)) * 2 + 1, 0);
    wants.push({
      prio: 51,
      cost: { gold: 0, wood: def.cost.wood * segs, faith: 0 },
      reserve: false,
      label: 'wall',
      run: () => {
        const used = new Set();
        let any = false;
        for (const [tx, ty, tx2, ty2] of plan) {
          const mx = (tx + tx2) / 2 + 0.5;
          const my = (ty + ty2) / 2 + 0.5;
          const ids = [];
          for (let i = 0; i < 2; i++) {
            const u = pickBuilder(ai, s, mx, my, used);
            if (!u || s.job.get(u.id) === 'pray') break;
            used.add(u.id);
            ids.push(u.id);
          }
          if (!ids.length) continue;
          ai.issue({ type: 'build', units: ids, building: WALL, tx, ty, tx2, ty2 });
          for (const id of ids) s.job.set(id, 'build');
          any = true;
        }
        ai.wall = { t: s.t, done: any, stone: false };
        return any;
      },
    });
    return;
  }
  if (ai.wall.stone || p.tier < 3 || p.gold < STONE_GOLD || p.wood < STONE_WOOD) return;
  const ids = [];
  for (const b of world.buildingList) {
    if (!b.dead && b.owner === ai.me && b.type === WALL && b.constructed && !b.queue.length) ids.push(b.id);
  }
  if (!ids.length) return;
  const up = def.wallUpgrade && BUILDINGS[def.wallUpgrade.to] ? def.wallUpgrade.cost : null;
  wants.push({
    prio: 50,
    cost: up ? { gold: (up.gold || 0) * ids.length, wood: (up.wood || 0) * ids.length, faith: 0 } : { gold: 0, wood: 0, faith: 0 },
    reserve: false,
    label: 'stone walls',
    run: () => {
      ai.issue({ type: 'upgradeWall', walls: ids.slice(0, 160) });
      ai.wall.stone = true;
      return true;
    },
  });
}
