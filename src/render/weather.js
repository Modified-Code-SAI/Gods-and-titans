// Weather over a match (render only): passing spells of rain, snow or mist, drawn from the map's seed and the
// match clock, so every client sees the same sky without any protocol change (like the time of day).
//   weatherAt(simSeconds, seed, landscape)   pure: { rain, snow, mist } 0..1 at that moment
//   applyWeather(state, w)                   dims, greys and hazes a resolved atmosphere state (atmosphere.js)
//   new WeatherLayer(scene, { quality })     the falling rain or snow: one instanced draw, moved on the GPU
//
// The first spell never comes before WEATHER.calm seconds, so a match opens on a clear golden morning. Each
// landscape has its own climate (CLIMATES): the Highlands get snow, the Great Forest mist, the Islands showers.
import * as THREE from 'three';
import { hashSeed } from '../sim/rng.js';

export const WEATHER = Object.freeze({
  calm: 240, // seconds of clear sky at the start of every match
  spell: 200, // the clock is cut into windows this long; each may hold one spell
  ramp: 30, // seconds a spell takes to come in and to clear
});

/** Per landscape: the chance that a window holds rain, snow or mist (what is left is clear sky). */
export const CLIMATES = Object.freeze({
  classic: { rain: 0.28, snow: 0, mist: 0.12 },
  highlands: { rain: 0.2, snow: 0.2, mist: 0.14 },
  rivers: { rain: 0.3, snow: 0, mist: 0.2 },
  islands: { rain: 0.36, snow: 0, mist: 0.12 },
  forest: { rain: 0.24, snow: 0, mist: 0.3 },
});

export const WEATHER_KINDS = ['rain', 'snow', 'mist'];

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (v) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};

/** The spell (if any) of window i: { kind, start, end, strength } in seconds, or null. Pure. */
export function spellOf(i, seed, landscape) {
  const c = CLIMATES[landscape] || CLIMATES.classic;
  const h = (k) => hashSeed(`${seed}:weather:${i}:${k}`) / 4294967296;
  const w0 = i * WEATHER.spell;
  if (w0 < WEATHER.calm) return null;
  const roll = h('kind');
  let kind = null;
  if (roll < c.rain) kind = 'rain';
  else if (roll < c.rain + c.snow) kind = 'snow';
  else if (roll < c.rain + c.snow + c.mist) kind = 'mist';
  if (!kind) return null;
  // a spell fills 55 to 95 % of its window, placed anywhere in it
  const len = WEATHER.spell * (0.55 + 0.4 * h('len'));
  const start = w0 + (WEATHER.spell - len) * h('at');
  return { kind, start, end: start + len, strength: 0.6 + 0.4 * h('str') };
}

/**
 * The weather at a sim clock reading.
 * @param {number} t sim seconds
 * @param {number|string} seed the match seed
 * @param {string} landscape a LANDSCAPES id
 * @returns {{ rain: number, snow: number, mist: number }}
 */
export function weatherAt(t, seed, landscape) {
  const out = { rain: 0, snow: 0, mist: 0 };
  if (!Number.isFinite(t) || t < WEATHER.calm) return out;
  const i = Math.floor(t / WEATHER.spell);
  const s = spellOf(i, seed, landscape);
  if (!s || t < s.start || t > s.end) return out;
  const k = smooth((t - s.start) / WEATHER.ramp) * smooth((s.end - t) / WEATHER.ramp) * s.strength;
  out[s.kind] = k;
  if (s.kind === 'rain') out.mist = 0.35 * k; // rain hangs a veil in the air too
  if (s.kind === 'snow') out.mist = 0.3 * k;
  return out;
}

/** A forced look for tools and the harness: 'rain' | 'snow' | 'mist' at full strength. */
export function forcedWeather(kind) {
  const out = { rain: 0, snow: 0, mist: 0 };
  if (kind === 'rain' || kind === 'snow') {
    out[kind] = 1;
    out.mist = kind === 'rain' ? 0.35 : 0.3;
  } else if (kind === 'mist') out.mist = 1;
  return out;
}

const _grey = new THREE.Color();
const RAIN_GREY = new THREE.Color(0.55, 0.6, 0.66);
const SNOW_GREY = new THREE.Color(0.8, 0.83, 0.88);
const MIST_GREY = new THREE.Color(0.72, 0.75, 0.76);

/**
 * Overcast the resolved look (in place): less key light, a flatter and greyer grade, a thicker and nearer haze.
 * @param {object} s an atmosphere state (createState / resolveHour)
 * @param {{ rain: number, snow: number, mist: number }} w
 * @returns {object} s
 */
export function applyWeather(s, w) {
  if (!w) return s;
  const wet = Math.max(w.rain || 0, w.snow || 0);
  const mist = w.mist || 0;
  const over = Math.max(wet, mist * 0.6);
  if (over <= 0.001 && mist <= 0.001) return s;
  const snowy = (w.snow || 0) > (w.rain || 0) ? 1 : 0;
  s.keyIntensity *= 1 - 0.62 * over;
  s.keyColor.copy(s.keyHue).multiplyScalar(s.keyIntensity);
  if (s.keyIsMoon) s.moonColor.copy(s.keyColor);
  // the sky goes grey (at its own brightness: a rainy night is still dark)
  const tint = (c, base, k) => {
    const l = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
    const bl = 0.2126 * base.r + 0.7152 * base.g + 0.0722 * base.b;
    _grey.copy(base).multiplyScalar(l / bl);
    c.lerp(_grey, k);
  };
  const greyOf = snowy ? SNOW_GREY : wet > mist ? RAIN_GREY : MIST_GREY;
  tint(s.haze, greyOf, 0.7 * Math.max(over, mist));
  tint(s.skyZenith, greyOf, 0.6 * over);
  tint(s.skyHorizon, greyOf, 0.6 * over);
  tint(s.hemiSky, greyOf, 0.45 * over);
  // the light comes from all the sky at once
  s.hemiIntensity *= 1 + 0.2 * over;
  s.ambientSky.copy(s.hemiSky).multiplyScalar(s.hemiIntensity);
  s.ambientGround.copy(s.hemiGround).multiplyScalar(s.hemiIntensity);
  // the haze closes in: mist most of all
  const close = clamp01(0.75 * mist + 0.3 * wet);
  s.hazeNear += (-22 - s.hazeNear) * close;
  s.hazeFar += (30 - s.hazeFar) * close;
  s.background.copy(s.haze).multiplyScalar(0.06);
  s.saturation *= 1 - 0.3 * over;
  s.contrast *= 1 - 0.1 * over;
  s.bloom *= 1 - 0.45 * over;
  s.glow *= 1 - 0.6 * over;
  s.shaft *= 1 - over;
  s.exposure *= 1 + 0.08 * over; // a grey day is lit evenly, not darkly
  return s;
}

// ---------------------------------------------------------------------------
// falling rain and snow
// ---------------------------------------------------------------------------

const COUNT = { low: 1400, medium: 2600, high: 4200, ultra: 6000 };

const VS = `
attribute vec4 aSeed;
uniform vec3 uCenter;
uniform float uBox;
uniform float uHeight;
uniform float uTime;
uniform float uAmount;
uniform float uSnow;
uniform vec2 uWind;
varying vec2 vUv;
varying float vFade;
void main() {
  vUv = position.xy;
  if ( aSeed.w > uAmount ) { gl_Position = vec4( 2.0, 2.0, 2.0, 1.0 ); return; }
  float speed = mix( 16.0, 1.6, uSnow ) * ( 0.85 + 0.3 * aSeed.z );
  vec2 drift = uWind * mix( 1.0, 0.6, uSnow );
  float fall = uTime * speed / uHeight + aSeed.z * 7.13;
  float y = fract( 1.0 - fract( fall ) ) * uHeight;
  // world-stable columns that wrap around the box as the camera moves
  vec2 home = aSeed.xy * uBox + drift * uTime;
  vec2 xz = uCenter.xz + ( fract( ( home - uCenter.xz ) / uBox + 0.5 ) - 0.5 ) * uBox;
  // snow sways
  xz += uSnow * 0.6 * vec2( sin( uTime * 0.9 + aSeed.z * 17.0 ), cos( uTime * 0.7 + aSeed.x * 23.0 ) );
  vec3 p = vec3( xz.x, uCenter.y - 4.0 + y, xz.y );
  vec3 vel = vec3( drift.x, -speed, drift.y );
  vec4 a = modelViewMatrix * vec4( p, 1.0 );
  vec4 b = modelViewMatrix * vec4( p - vel * mix( 0.04, 0.0, uSnow ), 1.0 );
  vec2 d = b.xy - a.xy;
  float len = length( d );
  vec2 dir = len > 1e-4 ? d / len : vec2( 0.0, -1.0 );
  vec2 perp = vec2( -dir.y, dir.x );
  float w = mix( 0.024, 0.04 + 0.035 * aSeed.z, uSnow );
  vec4 c = a;
  // rain: a thin streak from a to b; snow: a little square around a
  c.xy += mix( d * position.y + perp * w * ( position.x - 0.5 ) * 2.0, ( position.xy - 0.5 ) * 2.0 * w, uSnow );
  // thin out toward the box's edges and right in front of the lens
  vec2 off = ( xz - uCenter.xz ) / ( uBox * 0.5 );
  vFade = ( 1.0 - smoothstep( 0.6, 1.0, length( off ) ) ) * smoothstep( 2.0, 6.0, -a.z );
  gl_Position = projectionMatrix * c;
}`;

const FS = `
uniform float uSnow;
uniform vec3 uColor;
uniform float uAlpha;
varying vec2 vUv;
varying float vFade;
void main() {
  float a;
  if ( uSnow > 0.5 ) {
    float r = length( vUv - 0.5 ) * 2.0;
    a = 1.0 - smoothstep( 0.35, 1.0, r );
  } else {
    a = ( 1.0 - abs( vUv.x - 0.5 ) * 2.0 ) * smoothstep( 0.0, 0.35, vUv.y );
  }
  a *= vFade * uAlpha;
  if ( a < 0.004 ) discard;
  gl_FragColor = vec4( uColor, a );
}`;

/** Rain streaks or snowflakes in a box that follows the camera's target. One draw call, no per-frame CPU work. */
export class WeatherLayer {
  constructor(parent, { quality = 'medium' } = {}) {
    this.max = COUNT.ultra;
    this.quality = quality;
    const quad = new THREE.InstancedBufferGeometry();
    quad.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0], 3));
    quad.setIndex([0, 1, 2, 0, 2, 3]);
    const seeds = new Float32Array(this.max * 4);
    let s = 12345;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < this.max; i++) {
      seeds[i * 4] = rnd();
      seeds[i * 4 + 1] = rnd();
      seeds[i * 4 + 2] = rnd();
      seeds[i * 4 + 3] = (i + 0.5) / this.max; // the thinning order: the first share shows at a light shower
    }
    quad.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 4));
    quad.instanceCount = COUNT[quality] ?? COUNT.medium;
    this.uniforms = {
      uCenter: { value: new THREE.Vector3() },
      uBox: { value: 50 },
      uHeight: { value: 26 },
      uTime: { value: 0 },
      uAmount: { value: 0 },
      uSnow: { value: 0 },
      uWind: { value: new THREE.Vector2(2.2, 0.8) },
      uColor: { value: new THREE.Color(0.6, 0.65, 0.72) },
      uAlpha: { value: 0.3 },
    };
    this.material = new THREE.ShaderMaterial({
      vertexShader: VS,
      fragmentShader: FS,
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide, // a streak's quad winds either way, as its direction on screen turns
    });
    this.material.name = 'weather';
    this.mesh = new THREE.Mesh(quad, this.material);
    this.mesh.name = 'weather';
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 5;
    this.mesh.visible = false;
    parent.add(this.mesh);
    this.disposed = false;
  }

  setQuality(q) {
    this.quality = q;
    this.mesh.geometry.instanceCount = COUNT[q] ?? COUNT.medium;
  }

  /**
   * @param {{ rain: number, snow: number }} w
   * @param {{ x: number, y: number, z: number }} center the camera's target in world space (y: the ground there)
   * @param {number} distance the camera's zoom distance
   * @param {number} time seconds (any running clock)
   * @param {number} light 0..1, how bright the sky is (rain at night is dark)
   */
  update(w, center, distance, time, light = 1) {
    if (this.disposed) return;
    const snow = (w.snow || 0) > (w.rain || 0);
    const amt = snow ? w.snow : w.rain;
    // a wide view: the drops would be specks; let them go and leave the grey sky
    const far = 1 - smooth((distance - 55) / 50);
    const a = clamp01(amt * far);
    this.mesh.visible = a > 0.01;
    if (!this.mesh.visible) return;
    const U = this.uniforms;
    U.uAmount.value = a * (this.mesh.geometry.instanceCount / this.max); // (aSeed.w runs over all max drops)
    U.uSnow.value = snow ? 1 : 0;
    U.uTime.value = time;
    U.uCenter.value.set(center.x, center.y, center.z);
    U.uBox.value = Math.min(90, Math.max(34, distance * 1.5));
    U.uHeight.value = Math.min(40, Math.max(20, distance * 0.7));
    const l = 0.25 + 0.75 * clamp01(light);
    // rain catches the light: added over the scene (bright streaks); snow lies over it
    const blending = snow ? THREE.NormalBlending : THREE.AdditiveBlending;
    if (this.material.blending !== blending) this.material.blending = blending;
    if (snow) U.uColor.value.setRGB(0.95 * l, 0.96 * l, 1.0 * l);
    else U.uColor.value.setRGB(0.8 * l, 0.85 * l, 0.95 * l);
    U.uAlpha.value = snow ? 0.9 : 0.3;
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.mesh.removeFromParent();
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
