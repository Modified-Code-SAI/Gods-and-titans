// How fast gold and wood are coming in, shown beside each count in the top bar (DESIGN 9). Gatherers drop their
// loads in lumps, so the count alone jumps; the rate is the gold or wood gathered over the last minute of game
// time, read from the player's cumulative stats (stats.gold, stats.wood), never from what is in the bank, so
// spending does not pull it down. Faith has a steady rate from the sim (faithRate, per second) and is shown in the
// same unit, per minute.

/** Game seconds the rate looks back over. */
export const INCOME_WINDOW = 60;
/** Below this much history the rate is too young to read and stays hidden. */
export const INCOME_MIN_SPAN = 15;
/** One sample a game second is enough, and keeps the list at about sixty entries. */
const STEP = 1;
/** A clock jump this big (a replay seek, a loaded game) starts the history over. */
const JUMP = 20;

export class IncomeMeter {
  constructor() {
    this.samples = [];
  }

  reset() {
    this.samples.length = 0;
  }

  /** Record the cumulative amount gathered at a game time. */
  sample(time, gathered) {
    if (!Number.isFinite(time) || !Number.isFinite(gathered)) return;
    const s = this.samples;
    const last = s[s.length - 1];
    // The clock ran back (a rematch, a replay rewound) or leapt (a seek), or the count fell (a new game's stats).
    if (last && (time < last.t || time - last.t > JUMP || gathered < last.v)) s.length = 0;
    const end = s[s.length - 1];
    if (end && time - end.t < STEP) return;
    s.push({ t: time, v: gathered });
    while (s.length > 2 && time - s[1].t >= INCOME_WINDOW) s.shift();
  }

  /** Amount a minute over the window, or null while there is too little history. */
  perMinute() {
    const s = this.samples;
    if (s.length < 2) return null;
    const a = s[0];
    const b = s[s.length - 1];
    const span = b.t - a.t;
    if (span < INCOME_MIN_SPAN) return null;
    return Math.max(0, ((b.v - a.v) / span) * 60);
  }
}

/** The short label beside a count: '+120/min', or '' when there is nothing to say. */
export function rateLabel(perMin) {
  if (perMin === null || perMin === undefined || !Number.isFinite(perMin)) return '';
  const n = Math.round(perMin);
  return n > 0 ? `+${n}/min` : '';
}

/** Hover text for a resource chip: what it is, then the rate when there is one. */
export function rateTitle(name, how, perMin, who = 'Your Worshippers bring in', idle = 'Nobody is gathering it right now.') {
  const n = perMin === null || perMin === undefined || !Number.isFinite(perMin) ? null : Math.round(perMin);
  const rate = n === null ? '' : n > 0 ? `\n${who} about ${n} a minute.` : `\n${idle}`;
  return `${name}${how ? ` — ${how}` : ''}${rate}`;
}
