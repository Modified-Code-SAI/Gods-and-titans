// The loading screen before a match (DESIGN 9, "Loading screen"): the sides drawn as player cards, each with its
// pantheon's emblem in a ring of the player's colour, their name and who plays them, a carved "vs" between the
// sides, the landscape and the rules under them, and a tip at the foot. Campaign missions and the tutorial keep
// the plain veil. A campaign mission gets its own card instead (buildMissionCard): the chapter and the mission's
// number, its title and place, the chapter map with the road walked so far and this stop lit, and the objectives
// known at the start. game.js setLoading puts either over the empty canvas.
import { getPantheon } from '../data/index.js';
import { MISSION_BY_ID, chapterOf } from '../data/campaign.js';
import { getProgress, isUnlocked } from '../game/campaign-progress.js';
import { buildChapterMap } from './campaign-map.js';
import { landscapeInfo } from '../data/landscapes.js';
import { PANTHEON_EMBLEMS } from './menu-model.js';
import { displayColor } from '../team-colors.js';

const LEVELS = { easy: 'Easy', normal: 'Normal', hard: 'Hard', brutal: 'Brutal' };
const SIZES = { small: 'Small map', medium: 'Medium map' };

/**
 * The sides of a setup, in team order: [{ team, players: [{ name, pantheon, emblem, color, who, me }] }].
 * Empty for a campaign mission, the tutorial or a setup without players.
 */
export function matchSides(setup, myIndex = -1) {
  if (!setup || !Array.isArray(setup.players) || !setup.players.length || typeof setup.campaign === 'string' || setup.tutorial) return [];
  const sides = new Map();
  for (const p of setup.players) {
    if (!p) continue;
    const key = p.team ?? `solo${p.index}`;
    if (!sides.has(key)) sides.set(key, { team: key, players: [] });
    const pan = p.pantheon ? getPantheon(p.pantheon) : null;
    const me = p.index === myIndex;
    const who = me ? 'You' : p.kind === 'ai' ? `Computer · ${LEVELS[p.difficulty] || 'Normal'}` : 'Player';
    sides.get(key).players.push({
      name: String(p.name || `Player ${(p.index ?? 0) + 1}`),
      pantheon: pan && pan.name ? pan.name : 'Unknown',
      emblem: PANTHEON_EMBLEMS[p.pantheon] || '✦',
      color: typeof p.color === 'string' ? p.color : '#c8a050',
      who,
      me,
    });
  }
  return [...sides.values()];
}

/** The line under the sides: the landscape, the map size and the rules that change the game. */
export function matchTerms(setup) {
  if (!setup) return '';
  const parts = [landscapeInfo(setup.landscape || 'classic').name];
  if (SIZES[setup.mapSize]) parts.push(SIZES[setup.mapSize]);
  if (setup.survival) parts.push('Trial of the Titans');
  if (Number.isFinite(setup.peaceMinutes) && setup.peaceMinutes > 0) parts.push(`Decade of Peace · ${setup.peaceMinutes} min`);
  if (setup.sacredVictory) parts.push('Sacred Victory');
  return parts.join(' · ');
}

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined && text !== null) n.textContent = text;
  return n;
}

function card(p, i) {
  const c = el('div', `mw-ld-card${p.me ? ' is-me' : ''}`);
  const color = displayColor(p.color);
  c.style.setProperty('--pc', color);
  c.style.setProperty('--i', String(i));
  const ring = el('div', 'mw-ld-ring');
  ring.append(el('span', 'mw-ld-emblem', p.emblem));
  const text = el('div', 'mw-ld-text');
  text.append(el('div', 'mw-ld-name', p.name), el('div', 'mw-ld-pan', p.pantheon), el('div', 'mw-ld-who', p.who));
  c.append(ring, text);
  return c;
}

/**
 * The versus block: one column of cards per side with a carved "vs" between them, then the terms.
 * Returns null when the setup has no sides to show (the caller keeps the plain veil).
 */
export function buildMatchup(setup, myIndex = -1) {
  const sides = matchSides(setup, myIndex);
  if (!sides.length) return null;
  const wrap = el('div', 'mw-ld-matchup');
  const row = el('div', `mw-ld-sides${sides.length > 2 ? ' is-many' : ''}`);
  let n = 0;
  sides.forEach((side, s) => {
    if (s > 0) row.append(el('div', 'mw-ld-vs', 'vs'));
    const col = el('div', `mw-ld-side${s === 0 ? ' is-first' : ''}`);
    for (const p of side.players) col.append(card(p, n++));
    row.append(col);
  });
  wrap.append(row);
  const terms = matchTerms(setup);
  if (terms) wrap.append(el('div', 'mw-ld-terms', terms));
  return wrap;
}

/**
 * What the mission card shows for a campaign setup: { chapter, kicker, title, place, objectives: [{ icon, text }] },
 * or null when the setup is not a campaign mission. The objectives are the ones the panel shows at the start (not
 * hidden ones), the required first and the optional ones marked.
 */
export function missionCardSpec(setup) {
  const m = setup && typeof setup.campaign === 'string' ? MISSION_BY_ID[setup.campaign] : null;
  const c = m ? chapterOf(m) : null;
  if (!m || !c) return null;
  const shown = (m.objectives || []).filter((o) => !o.hidden && o.kind !== 'protect');
  const guard = (m.objectives || []).filter((o) => !o.hidden && o.kind === 'protect');
  const objectives = [
    ...shown.filter((o) => !o.optional).map((o) => ({ icon: o.icon || '•', text: o.text, optional: false })),
    ...guard.map((o) => ({ icon: o.icon || '🛡️', text: o.text, optional: false })),
    ...shown.filter((o) => o.optional).map((o) => ({ icon: o.icon || '★', text: o.text, optional: true })),
  ];
  return {
    chapter: c,
    mission: m,
    kicker: `${c.chapter} · ${c.title} · Mission ${m.n} of ${c.missions.length}`,
    title: m.title,
    place: m.place,
    objectives,
  };
}

/** The mission card, or null when the setup is not a campaign mission (the caller keeps the plain veil). */
export function buildMissionCard(setup) {
  const spec = missionCardSpec(setup);
  if (!spec) return null;
  const wrap = el('div', `mw-ld-mission is-${spec.chapter.id}`);
  wrap.append(el('div', 'mw-ld-kicker', spec.kicker), el('div', 'mw-ld-title', spec.title), el('div', 'mw-ld-place', spec.place));
  let progress = null;
  try {
    progress = getProgress();
  } catch {
    progress = null;
  }
  try {
    const map = buildChapterMap(spec.chapter, {
      isOpen: (x) => x === spec.mission || (progress ? isUnlocked(x.id, progress) : x.n <= spec.mission.n),
      isWon: (x) => (progress ? !!progress.won[x.id] : x.n < spec.mission.n),
      onPick: () => {},
    });
    map.select(spec.mission);
    const frame = el('div', 'mw-ld-mapframe');
    frame.append(map.el);
    wrap.append(frame);
  } catch {
    // No SVG support (a test DOM): the card still has its words.
  }
  if (spec.objectives.length) {
    const list = el('ul', 'mw-ld-goals');
    spec.objectives.forEach((o, i) => {
      const li = el('li', `mw-ld-goal${o.optional ? ' is-optional' : ''}`);
      li.style.setProperty('--i', String(i));
      li.append(el('span', 'mw-ld-goal-icon', o.icon), el('span', 'mw-ld-goal-text', o.optional ? `${o.text} (bonus)` : o.text));
      list.append(li);
    });
    wrap.append(list);
  }
  return wrap;
}
