// Unit replies: a short voiced answer when the player selects their units or gives them an order, written for
// the synth kit in sfx.js (same recipe shape, `(k, t, out, rv, v) → end time`; sfx.js merges these tables into its
// own). No words: a voice synthesized from a buzzing source through three vowel formants, so it reads as a person
// (or a beast) answering in any language. Five voices by who is speaking, three moments each:
//   select   the unit is picked out: a short "hm?" / "mm" of attention
//   ack      an order to move, gather, build or work: a clipped "hah!" / "ya"
//   attack   an order to attack: a war cry (soldiers answer as a squad of three voices)
// worker (Worshippers, a man's or a woman's voice), soldier (mortal infantry, archers, priests, elite soldiers),
// god (deep, doubled an octave below, in a large hall), creature (a growl), titan (a roar that shakes the ground).
//
// `unitBark(defs, event)` picks the voice of the most important unit in a selection; `BarkGate` keeps the replies
// from chattering (one at a time, and a pause after each). Both are pure, so input.js and the tests share them.

/** Formant frequencies (Hz) of five vowels, a man's voice; a woman's are about 17 % higher. */
const VOWELS = {
  a: [730, 1090, 2440],
  e: [530, 1840, 2480],
  i: [300, 2200, 2950],
  o: [570, 840, 2410],
  u: [320, 800, 2240],
  m: [280, 900, 2200], // a hum: the mouth closed
};
const FORMANT_GAIN = [1, 0.55, 0.22];
const FORMANT_Q = [6, 9, 12];

/**
 * One voiced sound: a sawtooth glottal buzz through three formant band-passes that move from vowel to vowel.
 * @param {object} o
 * @param {number} o.f0 starting pitch (Hz); o.f1 the pitch it glides to (o.fMid passes through on the way)
 * @param {[number, string][]} o.vowels [time 0..1, vowel] knots
 * @param {number} o.dur seconds in all
 */
function vocal(k, t, out, rv, o) {
  const ctx = k.ctx;
  const { f0, f1 = f0, fMid, dur, a = 0.015, r = 0.08, vowels = [[0, 'a']], peak = 0.5, breath = 0.12, rough = 0, vib = 0, wet = 0.15, scale = 1, type = 'sawtooth', jitter = 0 } = o;
  const end = t + dur;
  const src = ctx.createOscillator();
  src.type = type;
  src.frequency.setValueAtTime(f0, t);
  if (fMid) {
    src.frequency.exponentialRampToValueAtTime(fMid, t + dur * 0.35);
    src.frequency.exponentialRampToValueAtTime(f1, end);
  } else if (f1 !== f0) src.frequency.exponentialRampToValueAtTime(f1, end);
  if (jitter) src.detune.value = jitter;
  if (vib > 0) {
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 5.5;
    const d = ctx.createGain();
    d.gain.setValueAtTime(0, t);
    d.gain.linearRampToValueAtTime(vib, t + Math.min(0.2, dur * 0.5));
    lfo.connect(d);
    d.connect(src.detune);
    lfo.start(t);
    lfo.stop(end + 0.05);
  }
  // the throat: a rough voice (a growl) is the buzz amplitude-modulated at a low audio rate
  let head = src;
  if (rough > 0) {
    const am = ctx.createGain();
    am.gain.value = 1 - rough * 0.5;
    const lfo = ctx.createOscillator();
    lfo.type = 'square';
    lfo.frequency.value = 26 + 10 * Math.random();
    const d = ctx.createGain();
    d.gain.value = rough * 0.5;
    lfo.connect(d);
    d.connect(am.gain);
    lfo.start(t);
    lfo.stop(end + 0.05);
    src.connect(am);
    head = am;
  }
  const env = ctx.createGain();
  k.env(env.gain, t, { a, h: Math.max(0, dur - a - r), r, peak });
  env.connect(out);
  if (rv) {
    const send = ctx.createGain();
    send.gain.value = wet;
    env.connect(send);
    send.connect(rv);
  }
  // the mouth: three formants following the vowel knots
  for (let i = 0; i < 3; i++) {
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = FORMANT_Q[i];
    const f = (name) => VOWELS[name][i] * scale;
    bp.frequency.setValueAtTime(f(vowels[0][1]), t);
    for (const [at, name] of vowels.slice(1)) bp.frequency.linearRampToValueAtTime(f(name), t + at * dur);
    const g = ctx.createGain();
    g.gain.value = FORMANT_GAIN[i] * 3;
    head.connect(bp);
    bp.connect(g);
    g.connect(env);
  }
  // breath on the voice (and a whole breath for a roar)
  if (breath > 0) k.noise(env, t, { type: 'bandpass', f: 1600 * scale, q: 0.8, a, h: Math.max(0, dur - a - r), r, peak: breath });
  src.start(t);
  src.stop(end + 0.05);
  return end;
}

/** A breathy onset ("h") just before a vowel. */
function aspirate(k, t, out, len = 0.035, f = 1800, peak = 0.22) {
  k.noise(out, t, { type: 'bandpass', f, q: 0.7, a: 0.004, r: len, peak });
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length) % arr.length];

/** Who speaks: the voice of the most important unit (titan, god, creature, soldier, worker), null for siege engines. */
export const VOICE_RANK = ['titan', 'god', 'creature', 'soldier', 'worker'];

/** A UNITS entry's voice, or null when it does not answer (siege engines, buildings). */
export function voiceOf(def) {
  if (!def) return null;
  switch (def.class) {
    case 'titan':
      return 'titan';
    case 'god':
      return 'god';
    case 'creature':
    case 'minion':
      return 'creature';
    case 'worker':
      return 'worker';
    case 'siege':
      return null;
    default:
      return 'soldier';
  }
}

/**
 * The reply a selection gives.
 * @param {(object|undefined)[]} defs the selected units' UNITS entries
 * @param {'select'|'ack'|'attack'} event
 * @returns {string|null} a sound name (vo_<voice>_<event>), or null when nobody answers
 */
export function unitBark(defs, event) {
  let best = -1;
  for (const d of defs || []) {
    const v = voiceOf(d);
    if (!v) continue;
    const r = VOICE_RANK.length - VOICE_RANK.indexOf(v);
    if (r > best) best = r;
  }
  if (best < 0) return null;
  const voice = VOICE_RANK[VOICE_RANK.length - best];
  // a worker sent to fight just acknowledges (no war cry from a farmer)
  const ev = event === 'attack' && voice === 'worker' ? 'ack' : event;
  return `vo_${voice}_${ev}`;
}

/** Seconds a reply holds the floor before the next may start, by moment. */
export const BARK_GAP = { select: 0.9, ack: 0.45, attack: 1.4 };

/** Keeps replies from piling up: one at a time, and a pause after each (`allow(now, event)`, now in seconds). */
export class BarkGate {
  constructor() {
    this.until = -1e9;
  }

  allow(now, event) {
    if (now < this.until) return false;
    this.until = now + (BARK_GAP[event] ?? 0.6);
    return true;
  }
}

const shout = (k, t, out, rv, voices) => {
  let end = t;
  for (const o of voices) end = Math.max(end, vocal(k, t + (o.at || 0), out, rv, o));
  return end;
};

export const VOICE_RECIPES = {
  // ---- worshippers: an everyday voice, a man's or a woman's
  vo_worker_select(k, t, out, rv, v) {
    const fem = Math.random() < 0.45;
    const f = (fem ? 215 : 132) * v;
    return vocal(k, t, out, rv, { f0: f, f1: f * 1.12, dur: 0.2, vowels: [[0, 'm'], [1, 'u']], scale: fem ? 1.17 : 1, peak: 0.45, breath: 0.05, wet: 0.08 });
  },
  vo_worker_ack(k, t, out, rv, v) {
    const fem = Math.random() < 0.45;
    const f = (fem ? 235 : 145) * v;
    const [from, to] = pick([['i', 'a'], ['e', 'a'], ['u', 'o']]);
    return vocal(k, t, out, rv, { f0: f * 1.05, f1: f * 0.88, dur: 0.22, vowels: [[0, from], [0.4, to], [1, to]], scale: fem ? 1.17 : 1, peak: 0.5, breath: 0.06, wet: 0.08 });
  },
  vo_worker_attack(k, t, out, rv, v) {
    return VOICE_RECIPES.vo_worker_ack(k, t, out, rv, v);
  },
  // ---- soldiers: lower, clipped, a drilled answer
  vo_soldier_select(k, t, out, rv, v) {
    const f = 112 * v;
    return vocal(k, t, out, rv, { f0: f, f1: f * 1.08, dur: 0.17, vowels: [[0, 'o'], [1, 'm']], peak: 0.5, breath: 0.06, wet: 0.08 });
  },
  vo_soldier_ack(k, t, out, rv, v) {
    const f = 128 * v;
    aspirate(k, t, out, 0.03, 1500, 0.25);
    return vocal(k, t + 0.025, out, rv, { f0: f * 1.06, f1: f * 0.82, dur: 0.16, a: 0.006, r: 0.06, vowels: [[0, 'a'], [1, pick(['a', 'o', 'u'])]], peak: 0.6, breath: 0.08, wet: 0.08 });
  },
  vo_soldier_attack(k, t, out, rv, v) {
    // a squad's war cry: three voices a little apart in pitch and time
    const f = 118 * v;
    return shout(k, t, out, rv, [
      { f0: f, fMid: f * 1.35, f1: f * 1.1, dur: 0.55, a: 0.03, r: 0.14, vowels: [[0, 'a'], [0.7, 'a'], [1, 'o']], peak: 0.36, vib: 35, rough: 0.12, breath: 0.12, wet: 0.14 },
      { at: 0.025, f0: f * 1.19, fMid: f * 1.55, f1: f * 1.25, dur: 0.5, a: 0.03, r: 0.14, vowels: [[0, 'e'], [0.3, 'a'], [1, 'a']], peak: 0.3, vib: 45, rough: 0.1, breath: 0.12, wet: 0.14, jitter: 12 },
      { at: 0.055, f0: f * 0.84, fMid: f * 1.12, f1: f * 0.92, dur: 0.48, a: 0.03, r: 0.14, vowels: [[0, 'a'], [1, 'o']], peak: 0.3, vib: 30, rough: 0.15, breath: 0.1, wet: 0.14, jitter: -9 },
    ]);
  },
  // ---- gods: deep, doubled an octave below, in a hall
  vo_god_select(k, t, out, rv, v) {
    const f = 92 * v;
    return shout(k, t, out, rv, [
      { f0: f, f1: f * 0.94, dur: 0.6, a: 0.06, r: 0.25, vowels: [[0, 'm'], [0.5, 'o'], [1, 'o']], scale: 0.9, peak: 0.42, breath: 0.08, wet: 0.5 },
      { f0: f / 2, f1: (f / 2) * 0.94, dur: 0.6, a: 0.08, r: 0.25, vowels: [[0, 'm'], [1, 'o']], scale: 0.85, peak: 0.3, breath: 0, wet: 0.5 },
    ]);
  },
  vo_god_ack(k, t, out, rv, v) {
    const f = 98 * v;
    return shout(k, t, out, rv, [
      { f0: f * 1.05, f1: f * 0.86, dur: 0.5, a: 0.03, r: 0.22, vowels: [[0, 'a'], [0.6, 'o'], [1, 'o']], scale: 0.9, peak: 0.48, breath: 0.08, wet: 0.5, vib: 20 },
      { f0: (f * 1.05) / 2, f1: (f * 0.86) / 2, dur: 0.5, a: 0.04, r: 0.22, vowels: [[0, 'a'], [1, 'o']], scale: 0.85, peak: 0.32, breath: 0, wet: 0.5 },
    ]);
  },
  vo_god_attack(k, t, out, rv, v) {
    const f = 104 * v;
    return shout(k, t, out, rv, [
      { f0: f, fMid: f * 1.3, f1: f * 0.95, dur: 0.8, a: 0.04, r: 0.3, vowels: [[0, 'a'], [0.7, 'a'], [1, 'o']], scale: 0.9, peak: 0.45, vib: 30, rough: 0.12, breath: 0.12, wet: 0.55 },
      { f0: f / 2, fMid: (f * 1.3) / 2, f1: (f * 0.95) / 2, dur: 0.8, a: 0.05, r: 0.3, vowels: [[0, 'a'], [1, 'o']], scale: 0.85, peak: 0.32, rough: 0.2, breath: 0, wet: 0.55 },
    ]);
  },
  // ---- creatures: a growl
  vo_creature_select(k, t, out, rv, v) {
    const f = 74 * v;
    k.noise(out, t, { type: 'lowpass', f: 700, a: 0.03, h: 0.15, r: 0.15, peak: 0.12 });
    return vocal(k, t, out, rv, { f0: f, f1: f * 0.9, dur: 0.38, a: 0.03, r: 0.14, vowels: [[0, 'o'], [1, 'u']], scale: 0.8, peak: 0.5, rough: 0.7, breath: 0.2, wet: 0.2 });
  },
  vo_creature_ack(k, t, out, rv, v) {
    const f = 82 * v;
    k.noise(out, t, { type: 'lowpass', f: 800, a: 0.02, h: 0.1, r: 0.12, peak: 0.12 });
    return vocal(k, t, out, rv, { f0: f * 1.1, f1: f * 0.8, dur: 0.3, a: 0.02, r: 0.12, vowels: [[0, 'a'], [1, 'o']], scale: 0.8, peak: 0.55, rough: 0.75, breath: 0.2, wet: 0.2 });
  },
  vo_creature_attack(k, t, out, rv, v) {
    const f = 86 * v;
    k.noise(out, t, { type: 'bandpass', f: 900, q: 0.8, a: 0.02, h: 0.25, r: 0.2, peak: 0.2 });
    return vocal(k, t, out, rv, { f0: f, fMid: f * 1.5, f1: f * 0.85, dur: 0.55, a: 0.02, r: 0.18, vowels: [[0, 'a'], [0.6, 'a'], [1, 'o']], scale: 0.85, peak: 0.55, rough: 0.85, breath: 0.25, wet: 0.25 });
  },
  // ---- titans: a roar that shakes the ground
  vo_titan_select(k, t, out, rv, v) {
    const f = 48 * v;
    k.boom(out, t, 40, { peak: 0.25, r: 0.6 });
    return vocal(k, t, out, rv, { f0: f, f1: f * 0.9, dur: 0.8, a: 0.08, r: 0.3, vowels: [[0, 'o'], [1, 'u']], scale: 0.7, peak: 0.55, rough: 0.6, breath: 0.25, wet: 0.45 });
  },
  vo_titan_ack(k, t, out, rv, v) {
    return VOICE_RECIPES.vo_titan_select(k, t, out, rv, v * 1.08);
  },
  vo_titan_attack(k, t, out, rv, v) {
    const f = 54 * v;
    k.boom(out, t + 0.05, 36, { peak: 0.35, r: 0.9 });
    k.noise(out, t, { type: 'lowpass', f: 600, a: 0.1, h: 0.5, r: 0.5, peak: 0.25 });
    return vocal(k, t, out, rv, { f0: f, fMid: f * 1.45, f1: f * 0.8, dur: 1.15, a: 0.06, r: 0.4, vowels: [[0, 'a'], [0.6, 'a'], [1, 'o']], scale: 0.7, peak: 0.55, rough: 0.8, breath: 0.3, wet: 0.5, vib: 25 });
  },
};

/** Rate limits (see LIMITS in sfx.js): player feedback, outside the world's voice cap; BarkGate keeps them apart. */
export const VOICE_LIMITS = Object.fromEntries(Object.keys(VOICE_RECIPES).map((n) => [n, { gap: 0.3, voices: 1, ui: true }]));

/**
 * Overall loudness per reply (see LEVEL in sfx.js), set by rendered loudness (the loudest 100 ms, renderSfxOffline in
 * Chromium): a select reply about 2.5 dB under the `select` click, an order's about 1.5 dB under it, a war cry 2 dB over
 * a `hit`; gods 1.5 dB and titans 2.5 dB louder than that.
 */
export const VOICE_LEVEL = {
  vo_worker_select: 0.26,
  vo_worker_ack: 0.23,
  vo_worker_attack: 0.26,
  vo_soldier_select: 0.29,
  vo_soldier_ack: 0.24,
  vo_soldier_attack: 0.25,
  vo_god_select: 0.2,
  vo_god_ack: 0.27,
  vo_god_attack: 0.31,
  vo_creature_select: 0.25,
  vo_creature_ack: 0.37,
  vo_creature_attack: 0.32,
  vo_titan_select: 0.31,
  vo_titan_ack: 0.35,
  vo_titan_attack: 0.35,
};
