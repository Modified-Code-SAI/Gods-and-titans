// The lobby's map preview (DESIGN 9, lobby): a small picture of a map of the chosen landscape and size, for the seats
// in the lobby, drawn by the real map generator (src/sim/mapgen.js) from a fixed sample seed. Every battle still
// draws a new map from its own seed when it starts, so the caption calls it a sample. Shown are the ground (shaded by
// height, as the minimap), the Town Center spots in the seat colours, the gold mines and the sacred sites. Random
// shows a veiled card. The map is made a moment after a change (setTimeout), so a click on a chip never waits on it,
// and kept per landscape, size and seating.
import { generateMap } from '../sim/mapgen.js';
import { MAP_SIZES, MAX_PLAYERS, TERRAIN, PLAYER_COLORS } from '../config.js';
import { landscapeInfo } from '../data/landscapes.js';

const SAMPLE_SEED = 'lobby-preview';
const SCALE = 2; // canvas pixels per tile

const BASE = {
  [TERRAIN.GRASS]: [86, 132, 62],
  [TERRAIN.DIRT]: [138, 110, 70],
  [TERRAIN.WATER]: [38, 86, 138],
  [TERRAIN.FOREST]: [30, 72, 38],
  [TERRAIN.ROCK]: [118, 112, 104],
  [TERRAIN.SAND]: [196, 176, 120],
};

const isSeat = (k) => k === 'host' || k === 'human' || k === 'ai';

/**
 * What the preview draws for a lobby state: { landscape, mapSize, colors, teams, key }, landscape 'random' when the
 * host left it to chance. The colours and teams are the filled seats', in seat order (as the game will place them).
 */
export function previewSpec(state) {
  const landscape = state && typeof state.landscape === 'string' ? state.landscape : 'classic';
  const mapSize = state && MAP_SIZES[state.mapSize] ? state.mapSize : 'small';
  const seats = ((state && state.slots) || []).filter((s) => s && isSeat(s.kind));
  const together = state && state.survival === true;
  const colors = seats.map((s) => PLAYER_COLORS[s.color] || PLAYER_COLORS[0]);
  const teams = seats.map((s, i) => (together ? 1 : s.team ?? i + 1));
  const count = Math.max(1, Math.min(MAX_PLAYERS, seats.length || 2));
  return { landscape, mapSize, colors: colors.slice(0, count), teams: teams.slice(0, count), key: `${landscape}|${mapSize}|${teams.slice(0, count).join(',') || count}` };
}

function rgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex));
  const n = m ? parseInt(m[1], 16) : 0xc8a050;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * The picture of `map` as RGBA pixels, SCALE pixels a tile: { width, height, data }. Pure (tests read it).
 * `colors` are the starts' colours in order.
 */
export function paintPreview(map, colors = []) {
  const n = map.width;
  const W = n * SCALE;
  const data = new Uint8ClampedArray(W * W * 4);
  const T = map.terrain;
  const Hs = map.heights;
  const V = n + 1;
  const put = (px, py, c, a = 1) => {
    if (px < 0 || py < 0 || px >= W || py >= W) return;
    const i = (py * W + px) * 4;
    data[i] = data[i] * (1 - a) + c[0] * a;
    data[i + 1] = data[i + 1] * (1 - a) + c[1] * a;
    data[i + 2] = data[i + 2] * (1 - a) + c[2] * a;
    data[i + 3] = 255;
  };
  for (let ty = 0; ty < n; ty++) {
    for (let tx = 0; tx < n; tx++) {
      const t = T[ty * n + tx];
      const base = BASE[t] || BASE[TERRAIN.GRASS];
      let shade = 1;
      if (Hs && Hs.length === V * V) {
        const h0 = Hs[ty * V + tx];
        const h1 = Hs[(ty + 1) * V + tx + 1];
        shade = t === TERRAIN.WATER ? 0.85 + Math.max(-0.6, h0) * 0.35 : 0.9 + h0 * 0.25 + (h0 - h1) * 0.6;
      }
      const c = [base[0] * shade, base[1] * shade, base[2] * shade];
      for (let y = 0; y < SCALE; y++) for (let x = 0; x < SCALE; x++) put(tx * SCALE + x, ty * SCALE + y, c);
    }
  }
  const disc = (cx, cy, r, c, ring = null) => {
    for (let y = Math.floor(cy - r - 1); y <= Math.ceil(cy + r + 1); y++) {
      for (let x = Math.floor(cx - r - 1); x <= Math.ceil(cx + r + 1); x++) {
        const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
        if (ring && d <= r + 1 && d > r - 0.5) put(x, y, ring);
        else if (d <= r) put(x, y, c);
      }
    }
  };
  for (const s of map.sacred || []) disc((s.x + 0.5) * SCALE, (s.y + 0.5) * SCALE, 2.6, [230, 236, 255], [70, 60, 120]);
  for (const m of map.mines || []) disc((m.tx + 1.5) * SCALE, (m.ty + 1.5) * SCALE, 2.2, [255, 214, 90], [70, 50, 10]);
  (map.starts || []).forEach((s, i) => disc((s.x + 2) * SCALE, (s.y + 2) * SCALE, 5.5, rgb(colors[i] || PLAYER_COLORS[i % PLAYER_COLORS.length]), [250, 240, 210]));
  return { width: W, height: W, data };
}

const cache = new Map();

/** The sample map for a spec (made once per landscape, size and seating). */
export function sampleMap(spec) {
  if (!cache.has(spec.key)) {
    cache.set(spec.key, generateMap({ seed: SAMPLE_SEED, mapSize: spec.mapSize, playerCount: spec.teams.length || 2, teams: spec.teams.length ? spec.teams : null, landscape: spec.landscape }));
  }
  return cache.get(spec.key);
}

/** The preview block: a framed canvas and a caption. update(state) redraws it when the landscape, size or seats change. */
export class MapPreview {
  constructor(doc = document) {
    this.doc = doc;
    this.canvas = doc.createElement('canvas');
    this.canvas.className = 'mw-mappv-canvas';
    this.canvas.setAttribute('aria-hidden', 'true');
    this.veil = doc.createElement('div');
    this.veil.className = 'mw-mappv-veil';
    this.veil.textContent = '?';
    const frame = doc.createElement('div');
    frame.className = 'mw-mappv-frame';
    frame.append(this.canvas, this.veil);
    this.caption = doc.createElement('div');
    this.caption.className = 'mw-mappv-caption';
    this.el = doc.createElement('figure');
    this.el.className = 'mw-mappv';
    this.el.append(frame, this.caption);
    this.drawn = '';
    this.timer = 0;
  }

  update(state) {
    const spec = previewSpec(state);
    const paintKey = `${spec.key}|${spec.colors.join(',')}`;
    if (paintKey === this.drawn) return;
    this.drawn = paintKey;
    const random = spec.landscape === 'random';
    this.el.classList.toggle('is-random', random);
    if (random) {
      this.caption.textContent = 'A landscape drawn at random when the battle begins.';
      return;
    }
    const name = landscapeInfo(spec.landscape).name;
    this.caption.textContent = `A sample ${name} map: the bases in your seats' colours, gold mines in gold, sacred sites in white. Every battle draws its own.`;
    clearTimeout(this.timer);
    this.el.classList.add('is-busy');
    this.timer = setTimeout(() => {
      let img;
      try {
        img = paintPreview(sampleMap(spec), spec.colors);
      } catch {
        this.el.classList.remove('is-busy');
        return;
      }
      this.canvas.width = img.width;
      this.canvas.height = img.height;
      const ctx = this.canvas.getContext('2d');
      if (ctx && typeof ImageData === 'function') ctx.putImageData(new ImageData(img.data, img.width, img.height), 0, 0);
      this.el.classList.remove('is-busy');
    }, 30);
  }

  cleanup() {
    clearTimeout(this.timer);
  }
}
