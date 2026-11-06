// The sky dial (DESIGN 9, top bar): a small round window in the banner at the centre of the top bar, showing the
// hour of the day/night cycle (src/render/atmosphere.js) the way an old clock shows its moon: the sun climbs from
// the left horizon, crosses the top at noon and sets on the right, then the moon takes its turn through the night,
// over a sky that warms at dawn and dusk and darkens at night. Its tooltip names the hour and the part of the day.
// The hour is the renderer's own (so a held time of day in Settings shows here too); before a renderer exists it is
// the match clock's hour. The look is cosmetic, like the cycle itself: nothing in the battle depends on the hour.
import { SUNRISE, SUNSET, formatHour } from '../render/day-clock.js';

// The sky's two tones (zenith, horizon) through the day, as [hour, top, bottom], blended between stops.
const SKY = [
  [0, '#0b1230', '#1c2350'],
  [4.5, '#141a3c', '#3a2c55'],
  [5.75, '#3d4a86', '#f0a07a'],
  [7.5, '#4f86c8', '#f2d29a'],
  [12, '#3f86d6', '#a8d4f2'],
  [16.5, '#4a84c4', '#f0d6a0'],
  [19, '#5a4a8a', '#ff9c78'],
  [20.25, '#262a5e', '#7a4a78'],
  [21.5, '#0f1636', '#22284e'],
  [24, '#0b1230', '#1c2350'],
];

const PARTS = [
  [4.7, 'Night'],
  [6.5, 'Dawn'],
  [11, 'Morning'],
  [14, 'Midday'],
  [17.5, 'Afternoon'],
  [20, 'Dusk'],
  [24, 'Night'],
];

function hex(c) {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a, b, t) {
  const x = hex(a);
  const y = hex(b);
  return `#${[0, 1, 2].map((i) => Math.round(x[i] + (y[i] - x[i]) * t).toString(16).padStart(2, '0')).join('')}`;
}

/** The part of the day an hour falls in: "Dawn", "Morning", "Midday", "Afternoon", "Dusk" or "Night". */
export function partOfDay(hour) {
  const h = ((hour % 24) + 24) % 24;
  return PARTS.find(([end]) => h < end)[1];
}

/**
 * What the dial shows at an hour: { body: 'sun'|'moon', angle (degrees from straight up, -90 at the left horizon,
 * +90 at the right), top, bottom (sky colours), label ("14:20 · Afternoon") }.
 */
export function skyFace(hour) {
  const h = ((hour % 24) + 24) % 24;
  const day = h >= SUNRISE && h < SUNSET;
  let p;
  if (day) p = (h - SUNRISE) / (SUNSET - SUNRISE);
  else p = (((h - SUNSET) + 24) % 24) / (24 - (SUNSET - SUNRISE));
  let i = 1;
  while (i < SKY.length - 1 && h > SKY[i][0]) i++;
  const [h0, t0, b0] = SKY[i - 1];
  const [h1, t1, b1] = SKY[i];
  const t = h1 > h0 ? (h - h0) / (h1 - h0) : 0;
  return {
    body: day ? 'sun' : 'moon',
    angle: Math.round((p * 180 - 90) * 10) / 10,
    top: mix(t0, t1, t),
    bottom: mix(b0, b1, t),
    label: `${formatHour(h)} · ${partOfDay(h)}`,
  };
}

/** The dial's element; update(hour) moves it (only when the shown minute changes). */
export class SkyDial {
  constructor(doc = document) {
    this.el = doc.createElement('div');
    this.el.className = 'hud-sky';
    this.el.setAttribute('role', 'img');
    this.arm = doc.createElement('div');
    this.arm.className = 'hud-sky-arm';
    this.body = doc.createElement('i');
    this.body.className = 'hud-sky-body';
    this.arm.appendChild(this.body);
    const hills = doc.createElement('b');
    hills.className = 'hud-sky-hills';
    this.el.append(this.arm, hills);
    this.shown = '';
  }

  update(hour) {
    if (!Number.isFinite(hour)) return;
    const f = skyFace(hour);
    if (f.label === this.shown) return;
    this.shown = f.label;
    this.el.style.setProperty('--sky-top', f.top);
    this.el.style.setProperty('--sky-bottom', f.bottom);
    // At sunrise and sunset the arm jumps from one horizon to the other with no swing back across the sky.
    const turned = this.bodyShown !== undefined && this.bodyShown !== f.body;
    this.bodyShown = f.body;
    this.arm.style.transition = turned ? 'none' : '';
    this.arm.style.setProperty('--a', `${f.angle}deg`);
    this.el.classList.toggle('is-night', f.body === 'moon');
    this.el.title = `${f.label}. The day turns every 15 minutes of battle; the time of day can be held in Settings.`;
    this.el.setAttribute('aria-label', `Time of day: ${f.label}`);
  }
}
