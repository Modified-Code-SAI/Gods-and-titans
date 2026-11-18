// Computer players' play styles (DESIGN 10): data only, read by the AI (src/ai/profiles.js withStyle), the
// lobby (which draws one for each computer player) and the loading screen (which names it).
import { RNG, hashSeed } from '../sim/rng.js';

/**
 * Play styles (DESIGN 10): how a computer player of any difficulty likes to play, layered on its profile.
 * Each changes only when and how hard it fights, never what it may do or how fast it thinks, so a style
 * is as fair as the difficulty under it. A lobby draws one for each computer player from the game's seed
 * (setup.players[i].style); a player with none plays the balanced profile as it always did.
 *   scale: multiply these profile numbers; add: add to these (rounded where a count).
 */
export const STYLES = {
  raider: {
    name: 'Raider', icon: '🗡️', blurb: 'Attacks early and keeps the pressure on.',
    scale: { firstAttack: 0.8, attackPop: 0.8, waveInterval: 0.8, expandAt: 1.15 },
    add: { towersMax: -1 },
  },
  builder: {
    name: 'Builder', icon: '🔨', blurb: 'Grows a large economy first and strikes late with a big army.',
    scale: { firstAttack: 1.25, attackPop: 1.3, expandAt: 0.85, expandAt2: 0.85, tier2At: 0.9, tier3At: 0.9 },
    add: { workers: 4 },
  },
  guardian: {
    name: 'Guardian', icon: '🛡️', blurb: 'Walls itself in with towers and only marches when it is sure.',
    scale: { firstAttack: 1.1, attackRatio: 1.05 },
    add: { towersMax: 2 },
  },
};
export const STYLE_IDS = Object.keys(STYLES);

/** The balanced style: what a computer player without one plays (no key in the setup). */
export const BALANCED = { name: 'Balanced', icon: '⚖️', blurb: 'Plays a bit of everything.' };

/** A style's name, icon and line for a setup player (the balanced one when it has none). */
export function styleInfo(id) {
  return typeof id === 'string' && Object.hasOwn(STYLES, id) ? STYLES[id] : BALANCED;
}

/**
 * The style a lobby gives a computer player, drawn from the game's seed and the player's index:
 * one of the styles or null (balanced), each about as likely.
 */
export function drawStyle(seed, index) {
  const rng = new RNG(hashSeed(`${seed}:style:${index}`));
  const pick = Math.floor(rng.next() * (STYLE_IDS.length + 1));
  return pick < STYLE_IDS.length ? STYLE_IDS[pick] : null;
}
