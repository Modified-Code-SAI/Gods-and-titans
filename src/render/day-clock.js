// The day/night clock (DESIGN 8) without three.js: the match clock to an hour, sunrise and sunset, and the
// "hh:mm" face. atmosphere.js builds the look on it and re-exports it; the HUD's sky dial reads it directly, so the
// HUD (and its Node tests) need no three.js.

/** Sim seconds one full day lasts. */
export const DAY_SECONDS = 900;

export const SUNRISE = 5.5;
export const SUNSET = 19.5;

/**
 * Pacing: [fraction of the day, hour] knots, piecewise linear. The golden morning
 * runs into a long day, dusk and the blue hour take their time, the dark of the
 * night passes quickly, and the dawn is slow again.
 */
const PACE = [
  [0, 8],
  [0.18, 12.5],
  [0.42, 17],
  [0.52, 19],
  [0.58, 20],
  [0.78, 28],
  [0.88, 29.75],
  [1, 32],
];

/** The hour (0..24) a sim clock reading falls on. */
export function hourAt(simSeconds, daySeconds = DAY_SECONDS) {
  const s = Number.isFinite(simSeconds) ? simSeconds : 0;
  const p = (((s / daySeconds) % 1) + 1) % 1;
  let i = 1;
  while (i < PACE.length - 1 && p > PACE[i][0]) i++;
  const [p0, h0] = PACE[i - 1];
  const [p1, h1] = PACE[i];
  return (h0 + ((h1 - h0) * (p - p0)) / (p1 - p0)) % 24;
}

/** The "hh:mm" clock face of an hour. */
export function formatHour(hour) {
  const h = ((hour % 24) + 24) % 24;
  const hh = Math.floor(h);
  const mm = Math.floor((h - hh) * 60);
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}
