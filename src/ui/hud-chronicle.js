// The after-game chronicle (DESIGN 9): the body of the victory / defeat / "game ended" screen.
// Four tabs, as in the Age of Empires score screens: Summary (score and awards), Economy,
// Military, and Timeline (the score, army, resources or kills of every player as lines over
// the match, from src/game/chronicle.js). Built once when the screen opens.
import { PANTHEONS } from '../data/index.js';
import { scoreOf } from '../data/score.js';
import { sanitizeName } from '../net/protocol.js';
import { sfx } from '../audio/sfx.js';
import { METRICS, awardsFor } from '../game/chronicle.js';
import { el, fmt, safeColor } from './hud-dom.js';
import { formatClock } from './hud-data.js';
import { displayColor } from '../team-colors.js';

const SVG = 'http://www.w3.org/2000/svg';
const TABS = [
  ['summary', 'Summary'],
  ['economy', 'Economy'],
  ['military', 'Military'],
  ['timeline', 'Timeline'],
];
const TIER_NAMES = ['', 'Village', 'Town', 'City'];
const SVG_MIN_T = 60; // a minute of axis even for a match that ended at once

function svg(tag, attrs, ...children) {
  const n = document.createElementNS(SVG, tag);
  for (const k in attrs) n.setAttribute(k, String(attrs[k]));
  for (const c of children) if (c) n.appendChild(c);
  return n;
}

function seg(text, active, onClick) {
  const b = el('button', `mw-seg${active ? ' is-active' : ''}`, text);
  b.type = 'button';
  b.addEventListener('click', (e) => {
    e.stopPropagation();
    sfx.play('click');
    onClick(b);
  });
  return b;
}

const nameOf = (p) => sanitizeName(p.name, `Player ${(p.i ?? 0) + 1}`);

/** A table cell with the player's colour dot, name and the crown / "(you)" marks. */
function nameCell(p, vs, winningTeam) {
  const dot = el('i', 'hud-st-dot');
  dot.style.background = displayColor(safeColor(p.color));
  const cell = el('td', 'hud-st-name', dot, nameOf(p));
  if (winningTeam !== null && winningTeam !== undefined && p.team === winningTeam) cell.appendChild(el('span', 'hud-st-crown', ' 👑'));
  if (p.i === vs.myIndex) cell.appendChild(el('span', 'hud-st-you', ' (you)'));
  return cell;
}

/**
 * A table of players: cols are [heading, (p, i) => text, title?, measure?]; textCol: the second column is words, not
 * numbers. A column with a `measure` ({ of: (p, i) => number, best: true|false }) draws each cell's share of the
 * column's largest value as a thin bar under it, and when `best` marks the leader(s) in gold (nobody when all tie).
 */
function table(vs, winningTeam, cols, textCol = false) {
  const players = vs.players || [];
  const head = el('tr', null, el('th', null, 'Player'), ...cols.map(([h, , tip]) => {
    const th = el('th', null, h);
    if (tip) th.title = tip;
    return th;
  }));
  const tops = cols.map(([, , , m]) => (m ? Math.max(0, ...players.map((p, i) => Number(m.of(p, i)) || 0)) : 0));
  // A lead needs someone behind it: a column where everyone ties marks nobody.
  const tied = cols.map(([, , , m], c) => !!m && players.every((p, i) => (Number(m.of(p, i)) || 0) === tops[c]));
  const rows = players.map((p, i) => el('tr', p.defeated ? 'is-defeated' : null, nameCell(p, vs, winningTeam), ...cols.map(([, read, , m], c) => {
    const td = el('td', null, read(p, i));
    if (m && tops[c] > 0) {
      const v = Number(m.of(p, i)) || 0;
      td.className = m.best && v === tops[c] && !tied[c] ? 'has-bar is-best' : 'has-bar';
      td.style.setProperty('--share', String(Math.round((v / tops[c]) * 1000) / 1000));
    }
    return td;
  })));
  return el('table', `hud-stats${textCol ? '' : ' is-numbers'}`, el('thead', null, head), el('tbody', null, ...rows));
}

const stat = (k) => (p) => (p.stats && p.stats[k]) || 0;
const most = (of) => ({ of, best: true });
const bar = (of) => ({ of, best: false });

function summaryTab(vs, winningTeam, peak) {
  const players = vs.players || [];
  const score = (p) => {
    const s = scoreOf(p);
    const n = el('b', 'hud-ch-score', fmt(s.total));
    n.title = `Economy ${fmt(s.economy)} · Military ${fmt(s.military)} · Civilization ${fmt(s.civ)}`;
    return n;
  };
  const awards = awardsFor(players, peak);
  const byIndex = new Map(players.map((p) => [p.i, p]));
  return el('div', 'hud-ch-pane',
    table(vs, winningTeam, [
      ['Pantheon', (p) => (PANTHEONS[p.pantheon] ? PANTHEONS[p.pantheon].name : p.pantheon || '')],
      ['Score', score, 'Economy (gathered and faith) + military (worth destroyed) + civilization (tier and research)'],
      ['Kills', (p) => fmt(p.stats && p.stats.kills), null, most(stat('kills'))],
      ['Losses', (p) => fmt(p.stats && p.stats.losses), null, bar(stat('losses'))],
      ['Gathered', (p) => fmt(p.stats && p.stats.gathered), null, most(stat('gathered'))],
    ], true),
    awards.length ? el('div', 'hud-ch-awards', ...awards.map((a) => {
      const who = a.winners.map((i) => byIndex.get(i)).filter(Boolean);
      const names = el('span', 'hud-ch-award-who', ...who.map((p, k) => {
        const s = el('span', null, (k ? ', ' : '') + nameOf(p));
        s.style.color = displayColor(safeColor(p.color));
        return s;
      }));
      const card = el('div', `hud-ch-award${who.some((p) => p.i === vs.myIndex) ? ' is-mine' : ''}`,
        el('span', 'hud-ch-award-icon', a.icon),
        el('span', 'hud-ch-award-text', el('b', null, a.title), names, el('small', null, `${a.what}: ${fmt(a.value)}`)));
      card.dataset.award = a.id;
      return card;
    })) : null);
}

function economyTab(vs, winningTeam) {
  const st = (p, k) => fmt(p.stats && p.stats[k]);
  return el('div', 'hud-ch-pane', table(vs, winningTeam, [
    ['Gold', (p) => st(p, 'gold'), null, most(stat('gold'))],
    ['Wood', (p) => st(p, 'wood'), null, most(stat('wood'))],
    ['Faith', (p) => st(p, 'faith'), 'Faith earned: prayer, blessings and spells', most(stat('faith'))],
    ['Trained', (p) => st(p, 'unitsTrained'), null, most(stat('unitsTrained'))],
    ['Buildings', (p) => st(p, 'buildings'), null, most(stat('buildings'))],
    ['Research', (p) => fmt(Array.isArray(p.up) ? p.up.length : 0), null, most((p) => (Array.isArray(p.up) ? p.up.length : 0))],
    ['Tier', (p) => TIER_NAMES[p.tier] || ''],
  ]));
}

function militaryTab(vs, winningTeam, peak) {
  const st = (p, k) => fmt(p.stats && p.stats[k]);
  return el('div', 'hud-ch-pane', table(vs, winningTeam, [
    ['Kills', (p) => st(p, 'kills'), null, most(stat('kills'))],
    ['Losses', (p) => st(p, 'losses'), null, bar(stat('losses'))],
    ['Razed', (p) => st(p, 'razed'), 'Enemy buildings destroyed', most(stat('razed'))],
    ['Destroyed', (p) => st(p, 'killValue'), 'Gold, wood and faith worth of enemy units and buildings destroyed', most(stat('killValue'))],
    ['Lost', (p) => st(p, 'lostValue'), 'Gold, wood and faith worth of own units and buildings lost', bar(stat('lostValue'))],
    ['Largest army', (p, i) => fmt(peak[p.i ?? i]), 'Most population in fighting units at once', most((p, i) => peak[p.i ?? i] || 0)],
  ]));
}

/** Nice round step for an axis reaching max with about four lines; whole numbers, since every metric counts. */
export function niceStep(max) {
  const raw = Math.max(1, max) / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const f = raw / mag;
  return Math.max(1, Math.ceil((f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * mag));
}

/** The line chart for one metric: an SVG with a grid, time and value labels and a line per player. */
export function chartSvg(vs, chronicle, metric) {
  const W = 600;
  const H = 240;
  const L = 48;
  const R = 12;
  const T = 12;
  const B = 26;
  const players = vs.players || [];
  const lines = players.map((p, i) => ({ p, pts: chronicle ? chronicle.series(metric, i) : [] }));
  const tMax = Math.max(SVG_MIN_T, ...lines.flatMap((l) => l.pts.map((q) => q[0])));
  const vMax = Math.max(1, ...lines.flatMap((l) => l.pts.map((q) => q[1])));
  const step = niceStep(vMax);
  const top = Math.ceil(vMax / step) * step;
  const x = (t) => L + (t / tMax) * (W - L - R);
  const y = (v) => H - B - (v / top) * (H - T - B);
  const root = svg('svg', { class: 'hud-ch-chart', viewBox: `0 0 ${W} ${H}`, role: 'img' });
  root.setAttribute('aria-label', `${(METRICS.find((m) => m.key === metric) || {}).label || metric} over time`);
  for (let v = 0; v <= top + 1e-9; v += step) {
    root.appendChild(svg('line', { x1: L, x2: W - R, y1: y(v), y2: y(v), class: 'hud-ch-grid' }));
    const lab = svg('text', { x: L - 6, y: y(v) + 4, class: 'hud-ch-axis', 'text-anchor': 'end' });
    lab.textContent = fmt(v);
    root.appendChild(lab);
  }
  const tStep = Math.max(60, Math.ceil(tMax / 6 / 60) * 60);
  for (let t = 0; t <= tMax + 1e-9; t += tStep) {
    const edge = x(t) > W - R - 20; // the last label must not run off the chart
    const lab = svg('text', { x: edge ? W - R : x(t), y: H - 8, class: 'hud-ch-axis', 'text-anchor': edge ? 'end' : 'middle' });
    lab.textContent = formatClock(t);
    root.appendChild(lab);
  }
  for (const { p, pts } of lines) {
    if (!pts.length) continue;
    const d = pts.map(([t, v], k) => `${k ? 'L' : 'M'}${x(t).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    const path = svg('path', { d, class: `hud-ch-line${p.i === vs.myIndex ? ' is-mine' : ''}`, fill: 'none', stroke: displayColor(safeColor(p.color)) });
    path.dataset.player = String(p.i);
    root.appendChild(path);
  }
  return root;
}
function timelineTab(vs, winningTeam, chronicle) {
  let metric = METRICS[0].key;
  const holder = el('div', 'hud-ch-chartbox', chartSvg(vs, chronicle, metric));
  const buttons = METRICS.map((m) => seg(m.label, m.key === metric, (b) => {
    metric = m.key;
    buttons.forEach((x) => x.classList.toggle('is-active', x === b));
    holder.replaceChildren(chartSvg(vs, chronicle, metric));
  }));
  const legend = el('div', 'hud-ch-legend', ...(vs.players || []).map((p) => {
    const dot = el('i', 'hud-st-dot');
    dot.style.background = displayColor(safeColor(p.color));
    return el('span', null, dot, nameOf(p));
  }));
  const few = !chronicle || chronicle.samples.length < 2;
  return el('div', 'hud-ch-pane',
    el('div', 'mw-segmented hud-ch-metrics', ...buttons),
    holder,
    legend,
    few ? el('p', 'hud-ohint', 'The chronicle writes every 30 seconds of play: a longer match draws a fuller picture.') : null);
}

/**
 * The tabbed chronicle for a finished (or ended) match.
 * @param {object} vs the ViewState
 * @param {number|null} winningTeam
 * @param {object|null} chronicle the match's Chronicle (null: no timeline)
 */
export function chronicleView(vs, winningTeam, chronicle) {
  const peak = (chronicle && chronicle.peakArmy) || [];
  const panes = {
    summary: () => summaryTab(vs, winningTeam, peak),
    economy: () => economyTab(vs, winningTeam),
    military: () => militaryTab(vs, winningTeam, peak),
    timeline: () => timelineTab(vs, winningTeam, chronicle),
  };
  const body = el('div', 'hud-ch-body', panes.summary());
  const tabs = TABS.map(([id, label]) => {
    const b = seg(label, id === 'summary', () => {
      tabs.forEach((x) => x.classList.toggle('is-active', x === b));
      // The panel keeps the tallest height it has shown, so the buttons under it stay put from tab to tab.
      const h = body.offsetHeight;
      if (h > 0) body.style.minHeight = `${Math.max(h, parseFloat(body.style.minHeight) || 0)}px`;
      body.replaceChildren(panes[id]());
    });
    b.dataset.tab = id;
    return b;
  });
  return el('div', 'hud-chronicle', el('div', 'mw-segmented hud-ch-tabs', ...tabs), body);
}
