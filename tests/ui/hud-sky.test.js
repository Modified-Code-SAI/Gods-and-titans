import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installFakeDom } from './fake-dom.js';
import { skyFace, partOfDay, SkyDial } from '../../src/ui/hud-sky.js';
import { SUNRISE, SUNSET } from '../../src/render/day-clock.js';

test('the sun rises on the left, stands at the top at midday and sets on the right', () => {
  assert.equal(skyFace(SUNRISE).body, 'sun');
  assert.equal(skyFace(SUNRISE).angle, -90);
  assert.equal(skyFace((SUNRISE + SUNSET) / 2).angle, 0);
  assert.ok(skyFace(SUNSET - 0.01).angle > 89);
});

test('the moon takes the night, highest halfway between sunset and sunrise', () => {
  assert.equal(skyFace(SUNSET).body, 'moon');
  assert.equal(skyFace(SUNSET).angle, -90);
  const mid = (SUNSET + (24 - SUNSET + SUNRISE) / 2) % 24;
  assert.equal(skyFace(mid).angle, 0);
  assert.equal(skyFace(1).body, 'moon');
  assert.ok(skyFace(SUNRISE - 0.01).angle > 89);
});

test('the sky is blue at noon, dark at midnight and warm at dusk', () => {
  const lum = (c) => parseInt(c.slice(1, 3), 16) + parseInt(c.slice(3, 5), 16) + parseInt(c.slice(5, 7), 16);
  assert.ok(lum(skyFace(12).top) > lum(skyFace(0).top) * 2);
  const dusk = skyFace(19).bottom;
  assert.ok(parseInt(dusk.slice(1, 3), 16) > parseInt(dusk.slice(5, 7), 16), 'dusk horizon is warmer than blue');
  for (let h = 0; h < 24; h += 0.25) assert.match(skyFace(h).top, /^#[0-9a-f]{6}$/);
});

test('parts of the day and the label', () => {
  assert.equal(partOfDay(2), 'Night');
  assert.equal(partOfDay(6), 'Dawn');
  assert.equal(partOfDay(9), 'Morning');
  assert.equal(partOfDay(12.5), 'Midday');
  assert.equal(partOfDay(15), 'Afternoon');
  assert.equal(partOfDay(19), 'Dusk');
  assert.equal(partOfDay(23), 'Night');
  assert.equal(partOfDay(-1), 'Night');
  assert.match(skyFace(14.5).label, /^14:30 · Afternoon$/);
});

test('the dial element follows the hour and names it', () => {
  installFakeDom();
  const d = new SkyDial();
  d.update(12);
  assert.equal(d.el.classList.contains('is-night'), false);
  assert.match(d.el.getAttribute('aria-label'), /Midday/);
  d.update(23);
  assert.equal(d.el.classList.contains('is-night'), true);
  assert.equal(d.arm.style.transition, 'none', 'no swing back across the sky at sunset');
  d.update(NaN);
  assert.match(d.el.title, /Night/);
});
