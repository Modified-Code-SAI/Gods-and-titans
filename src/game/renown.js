// Renown (DESIGN 9.1): one number for a whole career, and the commander's title it earns, shown at the top of the
// Career screen. Worked out from the career kept on this device (src/game/career.js), never stored: every game
// played to the end counts, a win counts more, every achievement counts most, and the slain add a little.
import { ACHIEVEMENTS } from '../data/achievements.js';

export const RENOWN_PER = Object.freeze({ game: 5, win: 20, achievement: 25, slain: 50 }); // slain: one point per 50

/** The titles and the renown each starts at, lowest first. */
export const RENOWN_TITLES = Object.freeze([
  [0, 'Initiate'],
  [60, 'Warrior'],
  [200, 'Captain'],
  [450, 'Warlord'],
  [900, 'Hero'],
  [1600, 'Champion of the Gods'],
  [2800, 'Demigod'],
  [4500, 'Ascended'],
]);

/**
 * { points, title, level (1-based), next: { title, at, left } | null, progress (0..1 through this title) }.
 */
export function renown(c) {
  const got = c && c.unlocked ? ACHIEVEMENTS.filter((a) => Object.hasOwn(c.unlocked, a.id)).length : 0;
  const n = (v) => (Number.isFinite(v) && v > 0 ? Math.floor(v) : 0);
  const points = c ? n(c.games) * RENOWN_PER.game + n(c.wins) * RENOWN_PER.win + got * RENOWN_PER.achievement
    + Math.floor(n(c.kills) / RENOWN_PER.slain) : 0;
  let i = 0;
  while (i + 1 < RENOWN_TITLES.length && points >= RENOWN_TITLES[i + 1][0]) i++;
  const [from, title] = RENOWN_TITLES[i];
  const up = RENOWN_TITLES[i + 1];
  return {
    points,
    title,
    level: i + 1,
    next: up ? { title: up[1], at: up[0], left: up[0] - points } : null,
    progress: up ? (points - from) / (up[0] - from) : 1,
  };
}
