// Frame pacing (src/game/frame-pace.js): the Frame rate limit keeps a beat (a 144 Hz screen held to 60 draws 60 a
// second, not 48), starts over after a stall, and None draws every frame; the meter counts over half a second.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FrameCap, FpsMeter, FRAME_CAP_MS } from '../../src/game/frame-pace.js';
import { FRAME_CAP_OPTIONS } from '../../src/ui/speed-options.js';
import { defaultSettings } from '../../src/settings.js';

function drawn(hz, limit, seconds = 10) {
  const cap = new FrameCap();
  let n = 0;
  for (let t = 0; t < seconds * 1000; t += 1000 / hz) if (cap.due(t, FRAME_CAP_MS[limit])) n++;
  return n / seconds;
}

test('every option has a period, and the default is none', () => {
  assert.deepEqual(FRAME_CAP_OPTIONS.map((o) => o[0]).sort(), Object.keys(FRAME_CAP_MS).sort());
  assert.equal(defaultSettings().frameCap, 'off');
  assert.equal(defaultSettings().showFps, false);
});

test('the limit holds the frame rate to it on any screen, and None draws them all', () => {
  assert.ok(Math.abs(drawn(144, '60') - 60) <= 1, `144 Hz to 60: ${drawn(144, '60')}`);
  assert.ok(Math.abs(drawn(120, '60') - 60) <= 1);
  assert.ok(Math.abs(drawn(60, '30') - 30) <= 1, `60 Hz to 30: ${drawn(60, '30')}`);
  assert.ok(Math.abs(drawn(144, '30') - 30) <= 1);
  assert.ok(Math.abs(drawn(60, '60') - 60) <= 1, 'a 60 Hz screen at 60 loses nothing');
  assert.ok(Math.abs(drawn(144, 'off') - 144) <= 1);
});

test('after a stall the beat starts again from the next frame', () => {
  const cap = new FrameCap();
  const p = FRAME_CAP_MS['30'];
  assert.equal(cap.due(0, p), true);
  assert.equal(cap.due(16, p), false);
  assert.equal(cap.due(5000, p), true, 'a hidden tab comes back');
  assert.equal(cap.due(5016, p), false, 'and is held to the limit at once, not let run to catch up');
  assert.equal(cap.due(5034, p), true);
});

test('the meter says frames a second and milliseconds a frame, twice a second, and forgets a stall', () => {
  const m = new FpsMeter();
  let text = null;
  for (let t = 0; t <= 520; t += 1000 / 60) text = m.frame(t) || text;
  assert.match(text, /^(59|60|61) fps · 16\.\d ms$/);
  assert.equal(m.frame(20000), null, 'a long gap is no number');
  m.frame(21000);
  assert.match(m.frame(22100) || '', /^0\.9 fps · 1100\.0 ms$/, 'a slow machine still gets its number');
});
