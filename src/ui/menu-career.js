// The Career screen (DESIGN 9.1): the commander's title and renown (src/game/renown.js), the profile kept on this
// device (games, wins, win rate, favourite pantheon, records, wins per pantheon, the last games), the replays kept
// here (src/ui/menu-replays.js) and the achievements gallery, grouped, with the locked ones dimmed and a progress bar where one counts.
import { h } from './menu-dom.js';
import { pantheonEmblem } from './menu-pantheons.js';
import { PANTHEON_LIST, PANTHEONS } from '../data/pantheon-list.js';
import { ACHIEVEMENTS, ACHIEVEMENT_GROUPS } from '../data/achievements.js';
import { careerSummary } from '../game/career.js';
import { medalLabel } from '../data/medals.js';
import { renown, RENOWN_PER } from '../game/renown.js';

const RESULT_TEXT = { victory: ['Won', '🏆'], defeat: ['Lost', '💀'], draw: ['Draw', '⚖️'], survival: ['Trial of the Titans', '🐉'] };

/** 3725 s -> "1 h 2 min"; 125 -> "2 min". */
export function formatPlayTime(seconds) {
  const min = Math.floor((seconds || 0) / 60);
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)} h ${min % 60} min`;
}

const fmt = (n) => Math.round(n || 0).toLocaleString('en-US');

function stat(label, value, note = null) {
  return h('div.mw-car-stat', h('span.mw-car-stat-value', value), h('span.mw-car-stat-label', label), note ? h('span.mw-car-stat-note', note) : null);
}

function profile(c) {
  const s = careerSummary(c);
  const fav = s.favourite ? PANTHEONS[s.favourite] : null;
  return h('div.mw-car-stats',
    stat('Games', fmt(c.games)),
    stat('Wins', fmt(c.wins), c.games ? `${c.losses} lost${c.draws ? ` · ${c.draws} drawn` : ''}` : null),
    stat('Win rate', c.games ? `${Math.round(s.winRate * 100)}%` : '–'),
    stat('Favourite', fav ? `${pantheonEmblem(fav.id)} ${fav.name}` : '–', fav ? `${c.pantheons[fav.id].games} games` : null),
    stat('Time at war', formatPlayTime(c.seconds)),
    stat('Enemies slain', fmt(c.kills), c.best.kills ? `best ${fmt(c.best.kills)} in a game` : null),
    stat('Resources gathered', fmt(c.gathered), c.best.gathered ? `best ${fmt(c.best.gathered)}` : null),
    c.best.wave ? stat('Best survival wave', fmt(c.best.wave)) : null,
    c.best.medal ? stat('Guided first match', medalLabel(c.best.medal)) : null,
    stat('Achievements', `${s.unlocked} / ${s.total}`),
  );
}

/** The banner over the numbers: the commander's title, the renown that earned it and how far to the next one. */
export function renownBanner(c) {
  const r = renown(c);
  const s = careerSummary(c);
  const emblem = s.favourite ? pantheonEmblem(s.favourite) : '✦';
  const how = `Renown: ${RENOWN_PER.game} for every game played to the end, ${RENOWN_PER.win} for every win, ${RENOWN_PER.achievement} for every achievement, 1 for every ${RENOWN_PER.slain} enemies slain.`;
  const pct = `${Math.round(r.progress * 100)}%`;
  return h('div.mw-renown', { class: `is-level-${r.level}`, title: how },
    h('div.mw-renown-crest', { 'aria-hidden': 'true' }, h('span.mw-renown-emblem', emblem), h('span.mw-renown-level', String(r.level))),
    h('div.mw-renown-text',
      h('span.mw-renown-kicker', 'Commander'),
      h('span.mw-renown-title', r.title),
      h('span.mw-renown-bar', { role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(Math.round(r.progress * 100)), 'aria-label': r.next ? `Progress to ${r.next.title}` : 'Highest title', style: { '--p': pct } }, h('i')),
      h('span.mw-renown-line',
        h('b', `${fmt(r.points)} renown`),
        r.next ? ` · ${fmt(r.next.left)} more to ${r.next.title}` : ' · the highest title of all')));
}

function pantheonGrid(c) {
  return h('div.mw-car-pantheons', PANTHEON_LIST.map((p) => {
    const r = c.pantheons[p.id] || { games: 0, wins: 0 };
    return h('div.mw-car-pan', { class: r.wins ? 'is-won' : r.games ? 'is-played' : '', title: `${p.name}: ${r.wins} won of ${r.games} played` },
      h('span.mw-car-pan-emblem', { 'aria-hidden': 'true' }, pantheonEmblem(p.id)),
      h('span.mw-car-pan-name', p.name),
      h('span.mw-car-pan-record', r.games ? `${r.wins} / ${r.games}` : '–'));
  }));
}

function history(c) {
  if (!c.history.length) return h('p.mw-hint', 'No games yet. Your last games show here.');
  return h('ol.mw-car-history', c.history.map((g) => {
    const [text, icon] = RESULT_TEXT[g.r];
    const p = g.p ? PANTHEONS[g.p] : null;
    return h('li.mw-car-game', { class: `is-${g.r}`, title: `${text}${p ? ` as ${p.name}` : ''}, ${formatPlayTime(g.t)}` },
      h('span.mw-car-game-icon', { 'aria-hidden': 'true' }, icon),
      h('span', p ? pantheonEmblem(p.id) : '✦'),
      h('span.mw-car-game-time', formatPlayTime(g.t)));
  }));
}

function achievementCard(a, c, isNew) {
  const got = Object.hasOwn(c.unlocked, a.id);
  const prog = !got && a.progress ? a.progress(c) : null;
  return h('li.mw-ach', { class: `${got ? 'is-unlocked' : 'is-locked'}${isNew ? ' is-new' : ''}`, title: got ? `Unlocked ${new Date(c.unlocked[a.id]).toLocaleDateString()}` : 'Locked' },
    h('span.mw-ach-icon', { 'aria-hidden': 'true' }, a.icon),
    h('span.mw-ach-text',
      h('span.mw-ach-name', a.name, isNew ? h('span.mw-ach-badge', 'New') : null),
      h('span.mw-ach-desc', a.desc),
      prog && prog[0] > 0 ? h('span.mw-ach-bar', { style: { '--p': `${Math.round((prog[0] / prog[1]) * 100)}%` }, 'aria-label': `${prog[0]} of ${prog[1]}` }, h('i'), h('small', `${prog[0]} / ${prog[1]}`)) : null,
    ));
}

function gallery(c, unseen) {
  return ACHIEVEMENT_GROUPS.map(([id, label]) => {
    const list = ACHIEVEMENTS.filter((a) => a.group === id);
    const have = list.filter((a) => Object.hasOwn(c.unlocked, a.id)).length;
    return h('section.mw-ach-group',
      h('h3.mw-label', `${label} `, h('span.mw-ach-count', `${have} / ${list.length}`)),
      h('ul.mw-ach-list', list.map((a) => achievementCard(a, c, unseen.has(a.id)))));
  });
}

/**
 * The screen's body for a career `c`; `unseen` (ids unlocked since the screen was last open)
 * get a "New" badge.
 */
export function renderCareerContent(c, unseen = new Set(), replays = null) {
  return [
    renownBanner(c),
    profile(c),
    h('h3.mw-label', 'Wins by pantheon'),
    pantheonGrid(c),
    h('h3.mw-label', 'Last games'),
    history(c),
    replays ? h('h3.mw-label', 'Replays') : null,
    replays,
    h('h2.mw-h2.mw-car-ach-title', 'Achievements'),
    ...gallery(c, unseen),
  ].filter(Boolean);
}
