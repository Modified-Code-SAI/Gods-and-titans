// The world's ambience under a match: a wind bed, birds by day, crickets at night and waves where there is
// shore, rain when the weather turns (render/weather.js), synthesized live with WebAudio (no audio files) through the sound effects' chain (`sfx.shared`), so
// the effects volume and mute cover it. DESIGN 9.
//   ambienceMix(o)              pure: how loud each layer should be for the hour, the land around the camera,
//                               the zoom and the fighting nearby (0..1 each)
//   sampleLand(terrain, w, h, x, y, r)   pure: the share of water and of forest within r tiles of (x, y)
//   ambience.start(shared)      build the layers on a running context (idempotent)
//   ambience.update(mix, dt)    glide the layers toward a mix and schedule the next birds, crickets and waves
//   ambience.stop(fade)         fade out and release every node
// Everything is a no-op without a context (Node, a browser that has not allowed sound yet).

const TERRAIN_WATER = 2;
const TERRAIN_FOREST = 3;

/** Overall level of each layer at mix 1 (linear gain into the effects' master). Background: well under the effects. */
export const AMBIENCE_LEVEL = { wind: 0.1, shore: 0.12, birds: 0.07, insects: 0.025, rain: 0.085 };
const GLIDE = 1.2; // seconds: the time constant the layers glide with (a camera move fades the land in, never cuts)

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a, b, v) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Daylight 0..1 for an hour 0..24: full from 6:30 to 18:30, gone from 20:00 to 5:00. */
export function daylight(hour) {
  const h = ((hour % 24) + 24) % 24;
  return smooth(5, 6.5, h) * (1 - smooth(18.5, 20, h));
}

/**
 * How loud each layer should be.
 * @param {{ hour?: number, water?: number, forest?: number, zoom?: number, battle?: number, rain?: number, snow?: number, hidden?: boolean }} o
 *   water, forest: shares 0..1 of the land around the camera; zoom: hearingScale (0.8 close, 1 default, 4.5 far);
 *   battle: 0..1, how much fighting is in earshot (birds go quiet, crickets stop);
 *   rain, snow: 0..1, the weather (weather.js weatherAt): rain hisses and patters, both quiet the birds and crickets
 * @returns {{ wind: number, shore: number, birds: number, insects: number, rain: number }}
 */
export function ambienceMix({ hour = 12, water = 0, forest = 0, zoom = 1, battle = 0, rain = 0, snow = 0, hidden = false } = {}) {
  if (hidden) return { wind: 0, shore: 0, birds: 0, insects: 0, rain: 0 };
  const day = daylight(hour);
  const night = 1 - day;
  const far = smooth(1.2, 3.5, zoom); // pulled back: the land's small sounds give way to the wind
  const near = 1 - far * 0.75;
  const calm = 1 - clamp01(battle) * 0.85;
  const wet = clamp01(rain);
  const hush = 1 - Math.max(wet, clamp01(snow) * 0.8); // the birds shelter from rain and snow
  return {
    wind: clamp01(0.45 + 0.4 * far + 0.15 * night + 0.25 * clamp01(snow) + 0.1 * wet),
    shore: clamp01(smooth(0.02, 0.3, water) * near),
    birds: clamp01(day * (0.3 + 0.7 * smooth(0.05, 0.5, forest)) * near * calm * hush),
    insects: clamp01(night * (1 - smooth(0.3, 0.8, water)) * near * calm * hush),
    rain: wet * (0.8 + 0.2 * far),
  };
}

/**
 * The share of water tiles and of forest tiles in a disc of radius r around (x, y), sampled on a 2-tile grid.
 * @param {ArrayLike<number>} terrain TERRAIN codes, row-major
 */
export function sampleLand(terrain, w, h, x, y, r) {
  let n = 0;
  let water = 0;
  let forest = 0;
  const step = Math.max(1, Math.round(r / 7));
  for (let dy = -r; dy <= r; dy += step) {
    for (let dx = -r; dx <= r; dx += step) {
      if (dx * dx + dy * dy > r * r) continue;
      const tx = Math.floor(x + dx);
      const ty = Math.floor(y + dy);
      if (tx < 0 || ty < 0 || tx >= w || ty >= h) continue;
      const t = terrain[ty * w + tx];
      n++;
      if (t === TERRAIN_WATER) water++;
      else if (t === TERRAIN_FOREST) forest++;
    }
  }
  return n ? { water: water / n, forest: forest / n } : { water: 0, forest: 0 };
}

class AmbienceEngine {
  constructor() {
    this.ctx = null;
    this.out = null;
    this.layers = null;
    this.mix = { wind: 0, shore: 0, birds: 0, insects: 0, rain: 0 };
    this.nextBird = 0;
    this.nextCricket = 0;
    this.nextWave = 0;
    this.nextGust = 0;
    this.nextDrop = 0;
    this.random = Math.random;
  }

  get running() {
    return !!this.layers;
  }

  /** Build the continuous layers on the shared chain. shared = sfx.shared ({ ctx, master, noise }). */
  start(shared) {
    if (this.layers || !shared || !shared.ctx || !shared.master || !shared.noise) return this;
    const ctx = shared.ctx;
    this.ctx = ctx;
    this.noise = shared.noise;
    const out = ctx.createGain();
    out.gain.value = 1;
    out.connect(shared.master);
    this.out = out;
    const loop = (type, f, q) => {
      const src = ctx.createBufferSource();
      src.buffer = shared.noise;
      src.loop = true;
      const fl = ctx.createBiquadFilter();
      fl.type = type;
      fl.frequency.value = f;
      fl.Q.value = q;
      const g = ctx.createGain();
      g.gain.value = 0;
      src.connect(fl);
      fl.connect(g);
      g.connect(out);
      src.start(ctx.currentTime, this.random() * 1.5);
      return { src, fl, g };
    };
    // wind: a low band of noise whose pitch and level drift in gusts; a thin whistle above it
    const wind = loop('bandpass', 380, 0.7);
    const whistle = loop('bandpass', 1500, 6);
    // the shore: dull noise that the waves swell and draw back
    const shore = loop('lowpass', 520, 0.6);
    const wash = ctx.createGain(); // the waves' envelope, under the layer's level
    wash.gain.value = 0.25;
    shore.g.disconnect();
    shore.g.connect(wash);
    wash.connect(out);
    // birds and crickets are one-shots scheduled in update(); their buses carry the layer level
    const bus = () => {
      const g = ctx.createGain();
      g.gain.value = 0;
      g.connect(out);
      return g;
    };
    // rain: a broad hiss and a soft roar under it; drops patter on the rain bus (update)
    const hiss = loop('bandpass', 2800, 0.45);
    const roar = loop('lowpass', 650, 0.5);
    this.layers = { wind, whistle, shore, wash, hiss, roar, birds: bus(), insects: bus(), rain: bus() };
    const t = ctx.currentTime;
    this.nextBird = t + 1.5;
    this.nextCricket = t + 0.5;
    this.nextWave = t;
    this.nextGust = t;
    this.nextDrop = t;
    return this;
  }

  /**
   * Glide toward `mix` (see ambienceMix) and schedule what comes in the next moments.
   * Call it every frame or so; it only schedules ahead, so a slow frame never stutters the sound.
   */
  update(mix) {
    const L = this.layers;
    if (!L || !mix) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    this.mix = mix;
    const set = (param, v) => param.setTargetAtTime(Math.max(0, v), t, GLIDE);
    set(L.wind.g.gain, mix.wind * AMBIENCE_LEVEL.wind);
    set(L.whistle.g.gain, mix.wind * AMBIENCE_LEVEL.wind * 0.12);
    set(L.shore.g.gain, mix.shore * AMBIENCE_LEVEL.shore);
    set(L.birds.gain, mix.birds * AMBIENCE_LEVEL.birds);
    set(L.insects.gain, mix.insects * AMBIENCE_LEVEL.insects);
    const rain = mix.rain || 0;
    set(L.hiss.g.gain, rain * AMBIENCE_LEVEL.rain);
    set(L.roar.g.gain, rain * AMBIENCE_LEVEL.rain * 0.7);
    set(L.rain.gain, rain * AMBIENCE_LEVEL.rain * 1.6);
    const AHEAD = 0.6;
    // gusts: every few seconds the wind's band rises and swells a little, then falls back
    while (this.nextGust < t + AHEAD) {
      const s = Math.max(t, this.nextGust);
      const len = 3 + this.random() * 4;
      L.wind.fl.frequency.setTargetAtTime(300 + this.random() * 320, s, len * 0.35);
      L.whistle.fl.frequency.setTargetAtTime(1100 + this.random() * 900, s, len * 0.4);
      this.nextGust = s + len;
    }
    // waves: a swell in and a draw back, 4 to 7 seconds apart
    if (mix.shore > 0.01) {
      while (this.nextWave < t + AHEAD) {
        const s = Math.max(t, this.nextWave);
        const len = 4 + this.random() * 3;
        const peak = 0.6 + this.random() * 0.4;
        L.wash.gain.setTargetAtTime(peak, s, len * 0.18);
        L.wash.gain.setTargetAtTime(0.18, s + len * 0.45, len * 0.2);
        L.shore.fl.frequency.setTargetAtTime(900, s, len * 0.2);
        L.shore.fl.frequency.setTargetAtTime(420, s + len * 0.45, len * 0.25);
        this.nextWave = s + len;
      }
    } else this.nextWave = t;
    // birds: a short phrase now and then, more of them the louder the layer
    if (mix.birds > 0.02) {
      while (this.nextBird < t + AHEAD) {
        const s = Math.max(t, this.nextBird);
        this.bird(s);
        this.nextBird = s + (1.2 + this.random() * 4) / (0.4 + mix.birds);
      }
    } else this.nextBird = t + 1;
    // crickets: trains of quick chirps from a few places in the dark
    if (mix.insects > 0.02) {
      while (this.nextCricket < t + AHEAD) {
        const s = Math.max(t, this.nextCricket);
        this.cricket(s);
        this.nextCricket = s + 0.35 + this.random() * 0.5;
      }
    } else this.nextCricket = t + 0.5;
    // drops: quick ticks on leaves, roofs and shields, thicker the heavier the rain
    if (rain > 0.03) {
      while (this.nextDrop < t + AHEAD) {
        const s = Math.max(t, this.nextDrop);
        this.drop(s);
        this.nextDrop = s + (0.02 + this.random() * 0.09) / (0.3 + rain);
      }
    } else this.nextDrop = t + 0.3;
  }

  /** One raindrop: a 10 to 25 ms tick of filtered noise, placed left or right. */
  drop(t) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const fl = ctx.createBiquadFilter();
    fl.type = 'bandpass';
    fl.frequency.value = 1800 + this.random() * 3800;
    fl.Q.value = 2 + this.random() * 4;
    const g = ctx.createGain();
    const len = 0.01 + this.random() * 0.015;
    const peak = 0.3 + this.random() * 0.7;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.001, t + len);
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    src.connect(fl);
    fl.connect(g);
    if (pan) {
      pan.pan.value = (this.random() * 2 - 1) * 0.9;
      g.connect(pan);
      pan.connect(this.layers.rain);
    } else g.connect(this.layers.rain);
    src.start(t, this.random() * 1.2);
    src.stop(t + len + 0.02);
    if (pan) this.release(pan, t + len + 0.1);
  }

  /** One bird phrase: two to five quick whistled notes with glides, placed left or right. */
  bird(t) {
    const ctx = this.ctx;
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    const dest = pan || this.layers.birds;
    if (pan) {
      pan.pan.value = (this.random() * 2 - 1) * 0.8;
      pan.connect(this.layers.birds);
    }
    const base = 2200 + this.random() * 2200;
    const notes = 2 + Math.floor(this.random() * 4);
    let s = t;
    for (let i = 0; i < notes; i++) {
      const len = 0.05 + this.random() * 0.09;
      const f = base * (0.8 + this.random() * 0.5);
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(f, s);
      o.frequency.exponentialRampToValueAtTime(f * (this.random() < 0.5 ? 1.35 : 0.72), s + len);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, s);
      g.gain.linearRampToValueAtTime(1, s + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, s + len);
      o.connect(g);
      g.connect(dest);
      o.start(s);
      o.stop(s + len + 0.02);
      s += len + 0.03 + this.random() * 0.08;
    }
    if (pan) this.release(pan, s + 0.2);
  }

  /** One cricket: three or four 25 ms chirps of a high tone. */
  cricket(t) {
    const ctx = this.ctx;
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    const dest = pan || this.layers.insects;
    if (pan) {
      pan.pan.value = (this.random() * 2 - 1) * 0.9;
      pan.connect(this.layers.insects);
    }
    const f = 4300 + this.random() * 900;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = f;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    const n = 3 + Math.floor(this.random() * 2);
    for (let i = 0; i < n; i++) {
      const s = t + i * 0.045;
      g.gain.setValueAtTime(0, s);
      g.gain.linearRampToValueAtTime(1, s + 0.006);
      g.gain.linearRampToValueAtTime(0, s + 0.025);
    }
    o.connect(g);
    g.connect(dest);
    const end = t + n * 0.045 + 0.02;
    o.start(t);
    o.stop(end);
    if (pan) this.release(pan, end + 0.1);
  }

  release(node, at) {
    const ms = Math.max(50, (at - this.ctx.currentTime) * 1000);
    const timer = setTimeout(() => {
      try {
        node.disconnect();
      } catch {
        // already gone
      }
    }, ms);
    if (timer && typeof timer.unref === 'function') timer.unref();
  }

  /** Fade out over `fade` seconds and release everything. */
  stop(fade = 0.8) {
    const L = this.layers;
    if (!L) return;
    const ctx = this.ctx;
    const out = this.out;
    const t = ctx.currentTime;
    out.gain.setTargetAtTime(0, t, Math.max(0.01, fade / 4));
    const end = t + Math.max(0.05, fade);
    for (const l of [L.wind, L.whistle, L.shore, L.hiss, L.roar]) l.src.stop(end);
    this.release(out, end + 0.05);
    this.layers = null;
    this.ctx = null;
    this.out = null;
  }
}

/** The shared ambience engine. */
export const ambience = new AmbienceEngine();
export { AmbienceEngine };
