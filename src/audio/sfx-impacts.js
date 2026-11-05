// Combat impact, death and collapse sounds, written for the synth kit in sfx.js (same recipe shape,
// `(k, t, out, rv, v) → end time`; sfx.js merges these tables into its own). The old single `hit` thud
// and `death` groan stay for flesh hits and ordinary deaths; these give the other materials and sizes
// their own voice, so a sword on a hoplite, an arrow, a ram on a gate and a falling temple all sound different.
//   hit_armor    a blade on bronze or iron: a short metallic clank with a ring
//   hit_pierce   an arrow, spear or sling stone striking home: a quick thwip and a dull thunk
//   hit_wood     a blow on timber (a wooden wall): a hollow knock
//   hit_stone    a blow on masonry: a hard knock with a gritty crumble
//   hit_heavy    a blow on a titan: a deep body thump
//   death_big    a god or large creature falls: a lower groan and a heavy thud on the ground
//   death_titan  a titan falls: a long falling groan, an earth-shaking boom and a rumble
//   collapse     a building comes down: a crack, a boom, a long rumble and falling debris
//
// `impactSound(dst, src)` and `deathSound(ev, def)` pick a name and a volume from what was hit and by what;
// they are pure, so the game's event handler and the tests share them.

/** Per-name rate limits (see LIMITS in sfx.js). World sounds: they count against the voice cap. */
export const IMPACT_LIMITS = {
  hit_armor: { gap: 0.045, voices: 5 },
  hit_pierce: { gap: 0.04, voices: 5 },
  hit_wood: { gap: 0.06, voices: 4 },
  hit_stone: { gap: 0.06, voices: 4 },
  hit_heavy: { gap: 0.09, voices: 3 },
  death_big: { gap: 0.25, voices: 2 },
  death_titan: { gap: 1.5, voices: 1 },
  collapse: { gap: 0.35, voices: 2 },
};

/** Overall loudness per sound (see LEVEL in sfx.js), set by rendered loudness (the loudest 100 ms):
// the hits sit level with `hit`, death_big about 3 dB over `death`, collapse and death_titan 5 to 7 dB over it. */
export const IMPACT_LEVEL = {
  hit_armor: 1.4, hit_pierce: 1.2, hit_wood: 2.2, hit_stone: 0.9, hit_heavy: 0.5,
  death_big: 0.5, death_titan: 0.6, collapse: 0.5,
};

export const IMPACT_RECIPES = {
  hit_armor(k, t, out, rv, v) {
    // The body of the blow, then bronze partials that ring briefly: brighter and shorter than the swing's clash.
    k.osc(out, t, { f: 140 * v, f2: 70, glide: 0.06, a: 0.002, r: 0.08, peak: 0.35 });
    k.noise(out, t, { type: 'bandpass', f: 3200 * v, q: 2.5, a: 0.001, r: 0.03, peak: 0.4 });
    const base = 1450 * v;
    let end = t + 0.1;
    for (const [ratio, peak, r] of [[1, 0.14, 0.18], [1.63, 0.1, 0.14], [2.41, 0.07, 0.1], [3.37, 0.05, 0.07]]) {
      end = Math.max(end, k.osc(out, t + 0.002, { type: 'triangle', f: base * ratio, a: 0.001, r, peak }));
    }
    if (rv) k.osc(rv, t, { f: base * 1.63, a: 0.001, r: 0.25, peak: 0.03 });
    return end;
  },
  hit_pierce(k, t, out, rv, v) {
    k.noise(out, t, { type: 'highpass', f: 2600 * v, a: 0.002, r: 0.03, peak: 0.25 });
    k.osc(out, t + 0.012, { type: 'triangle', f: 210 * v, f2: 95, glide: 0.05, a: 0.001, r: 0.07, peak: 0.55 });
    return k.noise(out, t + 0.012, { type: 'lowpass', f: 700 * v, a: 0.001, r: 0.06, peak: 0.35 });
  },
  hit_wood(k, t, out, rv, v) {
    const lp = k.filter('bandpass', 520 * v, 2.2, out);
    k.osc(lp, t, { type: 'triangle', f: 260 * v, f2: 190 * v, glide: 0.07, a: 0.001, r: 0.11, peak: 0.7 });
    k.noise(out, t, { type: 'bandpass', f: 950 * v, q: 3, a: 0.001, r: 0.07, peak: 0.4 });
    if (rv) k.noise(rv, t, { type: 'bandpass', f: 700, q: 2, a: 0.001, r: 0.18, peak: 0.08 });
    // a splinter
    return k.noise(out, t + 0.03, { type: 'highpass', f: 3800, a: 0.001, r: 0.04, peak: 0.12 });
  },
  hit_stone(k, t, out, rv, v) {
    k.osc(out, t, { f: 120 * v, f2: 58, glide: 0.08, a: 0.002, r: 0.12, peak: 0.55 });
    k.noise(out, t, { type: 'bandpass', f: 2400 * v, q: 1.8, a: 0.001, r: 0.03, peak: 0.35 });
    // grit trickling off the struck face
    const end = k.noise(out, t + 0.02, { type: 'bandpass', f: 1500 * v, f2: 900, q: 1.2, a: 0.01, r: 0.22, peak: 0.16 });
    if (rv) k.noise(rv, t, { type: 'lowpass', f: 800, a: 0.002, r: 0.3, peak: 0.08 });
    return end;
  },
  hit_heavy(k, t, out, rv, v) {
    k.boom(out, t, 62 * v, { peak: 0.55, r: 0.4 });
    k.noise(out, t, { type: 'bandpass', f: 1400 * v, q: 1.4, a: 0.001, r: 0.05, peak: 0.22 });
    if (rv) k.osc(rv, t, { f: 55 * v, a: 0.003, r: 0.5, peak: 0.12 });
    return t + 0.45;
  },
  death_big(k, t, out, rv, v) {
    const lp = k.filter('lowpass', 520, 1, out);
    lp.frequency.setValueAtTime(600, t);
    lp.frequency.exponentialRampToValueAtTime(160, t + 0.8);
    k.osc(lp, t, { type: 'sawtooth', f: 130 * v, f2: 44 * v, glide: 0.75, a: 0.05, h: 0.15, r: 0.55, peak: 0.36, vib: 30, vibRate: 5 });
    k.osc(lp, t, { type: 'sawtooth', f: 97 * v, f2: 33 * v, glide: 0.8, a: 0.06, h: 0.12, r: 0.6, peak: 0.2, detune: 9 });
    const th = t + 0.55;
    k.boom(out, th, 58, { peak: 0.6, r: 0.5 });
    const end = k.noise(out, th, { type: 'lowpass', f: 380, a: 0.003, r: 0.5, peak: 0.35 });
    if (rv) k.noise(rv, th, { type: 'lowpass', f: 500, a: 0.004, r: 0.9, peak: 0.12 });
    return end;
  },
  death_titan(k, t, out, rv, v) {
    // the long fall
    const lp = k.filter('lowpass', 480, 1.2, out);
    lp.frequency.setValueAtTime(700, t);
    lp.frequency.exponentialRampToValueAtTime(120, t + 1.6);
    k.osc(lp, t, { type: 'sawtooth', f: 88 * v, f2: 30 * v, glide: 1.5, a: 0.12, h: 0.5, r: 0.9, peak: 0.34, vib: 22, vibRate: 3.5 });
    k.osc(lp, t, { type: 'sawtooth', f: 66 * v, f2: 22 * v, glide: 1.6, a: 0.15, h: 0.45, r: 1.0, peak: 0.24, detune: -12 });
    // the body meets the earth
    const th = t + 1.25;
    k.boom(out, th, 42, { peak: 0.75, r: 1.1 });
    k.noise(out, th, { type: 'bandpass', f: 900, q: 1, a: 0.002, r: 0.12, peak: 0.3 });
    const end = k.noise(out, th + 0.05, { type: 'lowpass', f: 200, a: 0.08, h: 0.5, r: 1.6, peak: 0.4 });
    if (rv) {
      k.noise(rv, th, { type: 'lowpass', f: 420, a: 0.01, h: 0.3, r: 2.0, peak: 0.2 });
      k.osc(rv, th, { f: 38, a: 0.01, r: 1.8, peak: 0.2 });
    }
    return end;
  },
  collapse(k, t, out, rv, v) {
    // the structure gives: a sharp crack, then the first mass hits the ground
    k.noise(out, t, { type: 'bandpass', f: 1800 * v, q: 2, a: 0.001, r: 0.06, peak: 0.45 });
    k.noise(out, t + 0.07, { type: 'bandpass', f: 1300 * v, q: 2, a: 0.001, r: 0.05, peak: 0.3 });
    const th = t + 0.16;
    k.boom(out, th, 55 * v, { peak: 0.7, r: 0.7 });
    // the long rumble of the rest coming down
    const end = k.noise(out, th, { type: 'lowpass', f: 260 * v, f2: 140, a: 0.08, h: 0.45, r: 1.3, peak: 0.5 });
    k.noise(out, th + 0.05, { type: 'bandpass', f: 700 * v, f2: 420, q: 0.9, a: 0.1, h: 0.3, r: 0.9, peak: 0.18 });
    // debris: a scatter of stones and beams landing over the first second (seeded by v, so each fall differs)
    let s = v * 1000;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 7; i++) {
      const dt = 0.25 + rnd() * 0.95;
      const f = 900 + rnd() * 2600;
      k.noise(out, th + dt, { type: 'bandpass', f, q: 3, a: 0.001, r: 0.03 + rnd() * 0.05, peak: 0.08 + rnd() * 0.12 });
    }
    if (rv) k.noise(rv, th, { type: 'lowpass', f: 600, a: 0.05, h: 0.4, r: 1.6, peak: 0.22 });
    return end;
  },
};

/** Armor at or above this counts as plate or bronze: a melee blow on it clanks. */
const ARMORED = 2;

/**
 * The sound of a blow landing.
 * @param {{ kind: 'u'|'b', id?: string, def?: object }} dst what was hit (def is its UNITS or BUILDINGS entry)
 * @param {{ def?: object }|null} src the attacker's UNITS or BUILDINGS entry, when known
 * @returns {[string, number]} a sound name and a volume
 */
export function impactSound(dst, src) {
  const atk = src && src.def && src.def.attack;
  const ranged = !!(atk && atk.projectile);
  const physical = !atk || !atk.element || atk.element === 'physical';
  const siege = !!(src && src.def && src.def.class === 'siege');
  if (dst.kind === 'b') {
    const wood = dst.id === 'wooden_wall';
    return [wood ? 'hit_wood' : 'hit_stone', siege ? 1.25 : ranged ? 0.55 : 0.8];
  }
  const d = dst.def || {};
  if (d.class === 'titan') return ['hit_heavy', siege ? 1 : 0.8];
  // A spell's own sound (the projectile's, the effect's) carries a magic hit; under it, only a soft thud.
  if (!physical) return ['hit', 0.45];
  if (ranged) return ['hit_pierce', 0.8];
  if ((d.armor || 0) >= ARMORED || d.class === 'god') return ['hit_armor', 0.8];
  return ['hit', 0.8];
}

/**
 * The sound of something dying.
 * @param {{ k: 'u'|'b' }} ev the death event
 * @param {object|undefined} def its UNITS or BUILDINGS entry
 * @returns {[string, number]}
 */
export function deathSound(ev, def) {
  if (ev.k === 'b') return ['collapse', def && def.wall ? 0.45 : def && def.id === 'house' ? 0.75 : 1];
  const cls = def && def.class;
  if (cls === 'titan') return ['death_titan', 1];
  if (cls === 'god') return ['death_big', 1];
  if (cls === 'creature' && (def.pop || 0) >= 3) return ['death_big', 0.75];
  return ['death', 0.8];
}
