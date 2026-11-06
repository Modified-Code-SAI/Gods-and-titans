// The moment a match ends (DESIGN 9, "The ending"): before the chronicle screen the camera glides to where the
// match was decided (the last building the losers lost, or the winners' last loss in a draw), the HUD steps
// aside behind letterbox bars, and the result is carved across the screen for a few seconds. A click or a key
// goes straight on to the screen.

/** How long the ending holds before the game-over screen (ms), unless skipped. */
export const ENDING_MS = 3600;
/** The camera's zoom distance at the ending (it only moves closer, never further out). */
export const ENDING_DISTANCE = 22;

/** The last building each team lost: where its fall happened, by game time. */
export class FallTracker {
  constructor() {
    this.falls = new Map(); // team -> { x, y, time }
  }

  /** A sim 'death' event: only buildings of real players count. */
  note(ev, teamOf, time = 0) {
    if (!ev || ev.type !== 'death' || ev.k !== 'b' || !(ev.o >= 0) || !Number.isFinite(ev.x) || !Number.isFinite(ev.y)) return;
    const team = typeof teamOf === 'function' ? teamOf(ev.o) : null;
    if (team === null || team === undefined) return;
    this.falls.set(team, { x: ev.x, y: ev.y, time });
  }

  /**
   * Where to look when the match ends: in a win the most recent fall of a team other than mine, in a loss my
   * team's last fall, in a draw (or a Trial of the Titans) the most recent fall of any team; null when no
   * building fell (a sacred victory far from any battle: the camera then stays where it is).
   */
  focus(result, myTeam) {
    let best = null;
    for (const [team, f] of this.falls) {
      const mine = team === myTeam;
      if (result === 'victory' && mine) continue;
      if (result === 'defeat' && !mine) continue;
      if (!best || f.time >= best.time) best = f;
    }
    return best ? { x: best.x, y: best.y } : null;
  }
}

/** The words carved across the screen: a title and one short line under it. */
export function endingWords({ result, how = null, wave = 0, mission = false, tutorial = false } = {}) {
  if (result === 'survival') return { title: `Wave ${wave}`, line: 'The Titans have overrun the land.' };
  if (result === 'draw') return { title: 'Draw', line: 'Neither side prevails.' };
  const won = result === 'victory';
  if (mission) return { title: won ? 'Mission Complete' : 'Mission Failed', line: won ? 'The tale goes on.' : 'The tale ends here, for now.' };
  if (tutorial && won) return { title: 'Lesson Complete', line: 'You know the ways of gods and mortals now.' };
  if (how === 'sacred') return { title: won ? 'Victory' : 'Defeat', line: won ? 'The sacred sites are yours.' : 'The sacred sites have fallen to your rivals.' };
  return won ? { title: 'Victory', line: 'Your pantheon reigns supreme.' } : { title: 'Defeat', line: 'Your people have fallen.' };
}
