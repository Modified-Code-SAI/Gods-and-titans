import test from 'node:test';
import assert from 'node:assert/strict';
import { register } from 'node:module';

// Map the browser import map ('three') onto the vendored copy.
const VENDOR = new URL('../../vendor/three/', import.meta.url).href;
register(`data:text/javascript,${encodeURIComponent(`
export async function resolve(spec, ctx, next) {
  if (spec === 'three') return { url: ${JSON.stringify(`${VENDOR}three.module.js`)}, shortCircuit: true };
  return next(spec, ctx);
}`)}`);

const THREE = await import('three');
const { WEATHER, CLIMATES, weatherAt, spellOf, forcedWeather, applyWeather, WeatherLayer } = await import('../../src/render/weather.js');
const { Atmosphere } = await import('../../src/render/atmosphere.js');
const { LANDSCAPE_IDS } = await import('../../src/data/landscapes.js');

const sample = (seed, land, until = 7200, step = 5) => {
  const out = { rain: 0, snow: 0, mist: 0, n: 0 };
  for (let t = 0; t < until; t += step) {
    const w = weatherAt(t, seed, land);
    out.n++;
    if (w.rain > 0.05) out.rain++;
    if (w.snow > 0.05) out.snow++;
    if (w.mist > 0.05 && !w.rain && !w.snow) out.mist++;
  }
  return out;
};

test('every landscape has a climate; a match opens on a clear sky', () => {
  for (const id of LANDSCAPE_IDS) assert.ok(CLIMATES[id], id);
  for (let seed = 1; seed < 40; seed++) {
    for (let t = 0; t < WEATHER.calm; t += 7) assert.deepEqual(weatherAt(t, seed, 'islands'), { rain: 0, snow: 0, mist: 0 });
  }
});

test('the weather is a pure function of the seed, the landscape and the clock', () => {
  for (const t of [300, 777, 1500, 3600]) assert.deepEqual(weatherAt(t, 99, 'classic'), weatherAt(t, 99, 'classic'));
  let differ = 0;
  for (let t = 300; t < 4000; t += 50) if (JSON.stringify(weatherAt(t, 1, 'rivers')) !== JSON.stringify(weatherAt(t, 2, 'rivers'))) differ++;
  assert.ok(differ > 5, 'another seed, another sky');
});

test('spells come in and clear gradually, and each landscape keeps to its climate', () => {
  // a spell ramps: no jump of more than a few percent between frames a second apart
  for (let seed = 1; seed < 10; seed++) {
    let prev = weatherAt(0, seed, 'forest');
    for (let t = 1; t < 3000; t += 1) {
      const w = weatherAt(t, seed, 'forest');
      for (const k of ['rain', 'snow', 'mist']) assert.ok(Math.abs(w[k] - prev[k]) < 0.06, `${k} jumps at ${t}`);
      prev = w;
    }
  }
  let snowy = 0;
  let wet = 0;
  for (let seed = 1; seed <= 30; seed++) {
    for (const land of ['classic', 'rivers', 'islands', 'forest']) assert.equal(sample(seed, land, 3000, 10).snow, 0, `no snow on ${land}`);
    snowy += sample(seed, 'highlands', 3000, 10).snow;
    wet += sample(seed, 'islands', 3000, 10).rain;
  }
  assert.ok(snowy > 0, 'snow falls on the Highlands');
  assert.ok(wet > 0, 'rain falls on the Islands');
  // the sky is clear most of the time
  const all = sample(7, 'islands', 20000, 10);
  assert.ok(all.rain / all.n < 0.5, `${Math.round((100 * all.rain) / all.n)} % rain`);
  assert.equal(spellOf(0, 7, 'islands'), null);
});

test('overcast: less sun, a greyer grade, a nearer haze; a clear sky is untouched', () => {
  const clear = new Atmosphere({ mode: 12.5 }).refresh();
  const keep = { key: clear.keyIntensity, far: clear.hazeFar, sat: clear.saturation };
  applyWeather(clear, { rain: 0, snow: 0, mist: 0 });
  assert.equal(clear.keyIntensity, keep.key);
  const s = new Atmosphere({ mode: 12.5 }).refresh();
  applyWeather(s, forcedWeather('rain'));
  assert.ok(s.keyIntensity < keep.key * 0.5);
  assert.ok(s.hazeFar < keep.far);
  assert.ok(s.saturation < keep.sat);
  const m = new Atmosphere({ mode: 12.5 }).refresh();
  applyWeather(m, forcedWeather('mist'));
  assert.ok(m.hazeFar < s.hazeFar, 'mist closes in more than rain');
  assert.deepEqual(forcedWeather('snow'), { rain: 0, snow: 1, mist: 0.3 });
});

test('the rain layer shows only while it rains and the view is not wide', () => {
  const scene = new THREE.Scene();
  const L = new WeatherLayer(scene, { quality: 'medium' });
  const c = { x: 10, y: 0, z: 10 };
  L.update({ rain: 0, snow: 0 }, c, 30, 1);
  assert.equal(L.mesh.visible, false);
  L.update({ rain: 0.8, snow: 0 }, c, 30, 1);
  assert.equal(L.mesh.visible, true);
  assert.equal(L.uniforms.uSnow.value, 0);
  assert.equal(L.material.blending, THREE.AdditiveBlending);
  L.update({ rain: 0, snow: 1 }, c, 30, 1);
  assert.equal(L.uniforms.uSnow.value, 1);
  assert.equal(L.material.blending, THREE.NormalBlending);
  L.update({ rain: 1, snow: 0 }, c, 150, 1);
  assert.equal(L.mesh.visible, false, 'zoomed far out: the drops would be specks');
  L.setQuality('ultra');
  assert.ok(L.mesh.geometry.instanceCount > 4000);
  L.dispose();
  assert.equal(scene.children.length, 0);
});
