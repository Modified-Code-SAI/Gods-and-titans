// The chapter map on the campaign screen (DESIGN 9.6): the chosen chapter's five missions as stops on a route
// across a drawn landscape, under the briefing. Land, contour rings, waves and the route's bends are seeded from
// the chapter id, so a chapter always looks the same; the colours are the chapter's own (style.css, .mw-cmap.is-<id>).
// The road is drawn solid as far as the player has opened it, and dotted beyond. Locked stops are dim, won ones
// carry a check, and the chosen one glows with its title beside it. A click on an open stop chooses that mission.
// The map is a picture for the pointer: the mission list beside it is what the keyboard and screen readers use.
import { RNG } from '../sim/rng.js';

const NS = 'http://www.w3.org/2000/svg';
export const MAP_W = 600;
export const MAP_H = 200;

function svg(tag, attrs, ...children) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, String(attrs[k]));
  for (const c of children) if (c) n.appendChild(c);
  return n;
}

const r1 = (v) => Math.round(v * 10) / 10;

/** A smooth closed path through points (Catmull-Rom as cubic Béziers). */
function closedPath(pts) {
  const n = pts.length;
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += `C${r1(p1[0] + (p2[0] - p0[0]) / 6)} ${r1(p1[1] + (p2[1] - p0[1]) / 6)} ${r1(p2[0] - (p3[0] - p1[0]) / 6)} ${r1(p2[1] - (p3[1] - p1[1]) / 6)} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return `${d}Z`;
}

/** One leg of the route from stop a to stop b, bowed to one side. */
function legPath(a, b, bow) {
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx - (dy / len) * bow, cy = my + (dx / len) * bow;
  return `M${r1(a.x)} ${r1(a.y)}Q${r1(cx)} ${r1(cy)} ${r1(b.x)} ${r1(b.y)}`;
}

/**
 * The map's drawing, from the chapter alone (no DOM): { stops: [{ x, y }], legs: [d], land: [{ d, rings: [d] }], waves: [{ x, y }], compass: { x, y } }.
 * Stops run left to right, a pace apart, rising and falling; each stands on a patch of land.
 */
export function chapterMapLayout(chapter) {
  const rng = new RNG(`chapter-map:${chapter.id}`);
  const n = chapter.missions.length;
  const left = 62, right = MAP_W - 62;
  let up = rng.next() < 0.5;
  const stops = [];
  for (let i = 0; i < n; i++) {
    const x = n > 1 ? left + ((right - left) * i) / (n - 1) + rng.range(-14, 14) : MAP_W / 2;
    const y = MAP_H / 2 + (up ? -1 : 1) * rng.range(22, 46);
    stops.push({ x: r1(x), y: r1(y) });
    up = !up;
  }
  const legs = [];
  for (let i = 0; i + 1 < n; i++) legs.push(legPath(stops[i], stops[i + 1], rng.range(10, 24) * (rng.next() < 0.5 ? -1 : 1)));
  const land = stops.map((s) => {
    const cx = s.x + rng.range(-12, 12), cy = s.y + rng.range(-8, 8);
    const rx = rng.range(54, 78), ry = rng.range(34, 52);
    const k = 11;
    const noise = Array.from({ length: k }, () => rng.range(0.72, 1.12));
    const shape = (f) => closedPath(noise.map((m, j) => {
      const a = (j / k) * Math.PI * 2;
      return [cx + Math.cos(a) * rx * m * f, cy + Math.sin(a) * ry * m * f];
    }));
    return { d: shape(1), rings: [shape(0.66), shape(0.36)] };
  });
  const waves = [];
  for (let tries = 0; waves.length < 14 && tries < 200; tries++) {
    const x = rng.range(20, MAP_W - 40), y = rng.range(14, MAP_H - 14);
    if (stops.some((s) => Math.abs(s.x - x) < 70 && Math.abs(s.y - y) < 50)) continue;
    waves.push({ x: r1(x), y: r1(y) });
  }
  // The compass goes in the corner farthest from every stop.
  const corners = [[30, 30], [MAP_W - 30, 30], [30, MAP_H - 30], [MAP_W - 30, MAP_H - 30]];
  const room = (c) => Math.min(...stops.map((s) => Math.hypot(s.x - c[0], s.y - c[1])));
  const [cx, cy] = corners.reduce((best, c) => (room(c) > room(best) ? c : best));
  return { stops, legs, land, waves, compass: { x: cx, y: cy } };
}

function compass(x, y) {
  const s = 14;
  return svg('g', { class: 'mw-cmap-compass', transform: `translate(${x} ${y})` },
    svg('circle', { r: s + 3 }),
    svg('path', { d: `M0 ${-s}L3.5 0L0 ${s}L-3.5 0Z` }),
    svg('path', { class: 'is-n', d: `M0 ${-s}L3.5 0L-3.5 0Z` }),
    svg('path', { d: `M${-s} 0L0 2.6L${s} 0L0 -2.6Z` }),
    Object.assign(svg('text', { y: -s - 6 }), { textContent: 'N' }));
}

/**
 * Builds the chapter's map. `isOpen(m)` and `isWon(m)` read the player's progress; `onPick(m)` chooses a mission.
 * Returns { el, select(m) }; select marks the chosen stop and writes its title beside it.
 */
export function buildChapterMap(chapter, { isOpen, isWon, onPick }) {
  const lay = chapterMapLayout(chapter);
  const ms = chapter.missions;
  const root = svg('svg', {
    class: `mw-cmap is-${chapter.id}`,
    viewBox: `0 0 ${MAP_W} ${MAP_H}`,
    preserveAspectRatio: 'xMidYMid meet',
    'aria-hidden': 'true',
    focusable: 'false',
  });
  root.appendChild(svg('rect', { class: 'mw-cmap-sea', x: 0, y: 0, width: MAP_W, height: MAP_H, rx: 10 }));
  const waves = svg('g', { class: 'mw-cmap-waves' });
  for (const w of lay.waves) waves.appendChild(svg('path', { d: `M${w.x} ${w.y}q5 -4 10 0t10 0` }));
  root.appendChild(waves);
  // Coasts first, as wide strokes, then every fill over them: where two patches meet only the outer shore shows.
  const coast = svg('g', { class: 'mw-cmap-coast' });
  const fills = svg('g', { class: 'mw-cmap-land' });
  const rings = svg('g', { class: 'mw-cmap-rings' });
  for (const l of lay.land) {
    coast.appendChild(svg('path', { d: l.d }));
    fills.appendChild(svg('path', { d: l.d }));
    for (const r of l.rings) rings.appendChild(svg('path', { d: r }));
  }
  root.append(coast, fills, rings);
  const road = svg('g', { class: 'mw-cmap-road' });
  const legs = lay.legs.map((d, i) => {
    const p = svg('path', { d, class: isOpen(ms[i + 1]) ? 'is-walked' : '' });
    road.appendChild(p);
    return p;
  });
  root.appendChild(road);
  root.appendChild(compass(lay.compass.x, lay.compass.y));
  const stops = ms.map((m, i) => {
    const s = lay.stops[i];
    const open = isOpen(m);
    const won = !!isWon(m);
    const g = svg('g', {
      class: ['mw-cmap-stop', open ? 'is-open' : 'is-locked', won ? 'is-won' : ''].filter(Boolean).join(' '),
      transform: `translate(${s.x} ${s.y})`,
      'data-mission': m.id,
    },
    svg('circle', { class: 'mw-cmap-halo', r: 19 }),
    svg('circle', { class: 'mw-cmap-ring', r: 12 }),
    Object.assign(svg('text', { class: 'mw-cmap-n', y: 0.5 }), { textContent: won ? '✓' : String(m.n) }));
    if (open) {
      g.addEventListener('click', (ev) => {
        if (ev && ev.stopPropagation) ev.stopPropagation();
        onPick(m);
      });
    }
    root.appendChild(g);
    return g;
  });
  // The chosen stop's title, on a plate above or below it (whichever side has room).
  const plate = svg('g', { class: 'mw-cmap-label' });
  const plateBg = svg('rect', { rx: 4, height: 30 });
  const plateTitle = svg('text', { class: 'mw-cmap-title' });
  const platePlace = svg('text', { class: 'mw-cmap-place' });
  plate.append(plateBg, plateTitle, platePlace);
  root.appendChild(plate);

  function select(m) {
    const i = ms.indexOf(m);
    stops.forEach((g, j) => g.classList.toggle('is-selected', j === i));
    plate.style.display = i < 0 ? 'none' : '';
    if (i < 0) return;
    const s = lay.stops[i];
    const title = m.title;
    const place = isOpen(m) ? m.place : 'Locked';
    // A width guess from the letter count: the plate is a backdrop, it need not be exact.
    const w = Math.max(title.length * 7.4, place.length * 5.6) + 18;
    const x = Math.max(6, Math.min(MAP_W - w - 6, s.x - w / 2));
    const y = s.y < MAP_H / 2 ? s.y + 24 : s.y - 24 - 30;
    plateBg.setAttribute('x', r1(x));
    plateBg.setAttribute('y', r1(y));
    plateBg.setAttribute('width', r1(w));
    plateTitle.setAttribute('x', r1(x + w / 2));
    plateTitle.setAttribute('y', r1(y + 13));
    plateTitle.textContent = title;
    platePlace.setAttribute('x', r1(x + w / 2));
    platePlace.setAttribute('y', r1(y + 25));
    platePlace.textContent = place;
  }

  return { el: root, select, legs, stops };
}
