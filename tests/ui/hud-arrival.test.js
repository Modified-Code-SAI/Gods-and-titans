import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { installFakeDom } from './fake-dom.js';
import { arrivalSpec, ArrivalCard } from '../../src/ui/hud-arrival.js';
import { UNITS } from '../../src/data/index.js';

before(() => installFakeDom());

const gods = Object.values(UNITS).filter((u) => u.class === 'god');
const titans = Object.values(UNITS).filter((u) => u.class === 'titan');

test('every god and every Titan has an arrival card with a name, a title, an icon and its powers', () => {
  assert.ok(gods.length && titans.length);
  for (const u of [...gods, ...titans]) {
    const s = arrivalSpec(u);
    assert.ok(s, u.id);
    assert.equal(s.kind, u.class === 'titan' ? 'titan' : 'god');
    assert.ok(s.name && s.title && s.icon && s.pantheon, u.id);
    assert.ok(s.powers.length >= 1 && s.powers.length <= 4, u.id);
    assert.ok(s.powers.every((p) => p.name && p.icon), u.id);
  }
});

test('no card for soldiers, workers or nothing', () => {
  const soldier = Object.values(UNITS).find((u) => u.class !== 'god' && u.class !== 'titan');
  assert.equal(arrivalSpec(soldier), null);
  assert.equal(arrivalSpec(null), null);
});

test('the card shows the god and hides again', () => {
  const card = new ArrivalCard();
  assert.equal(card.show(gods[0]), true);
  assert.equal(card.el.hidden, false);
  assert.ok(card.el.className.includes('is-god'));
  assert.equal(card.el.find('hud-arrival-name').textContent, gods[0].name);
  assert.equal(card.show(titans[0]), true);
  assert.ok(card.el.className.includes('is-titan'));
  assert.equal(card.el.findAll('hud-arrival-name').length, 1, 'a second arrival replaces the first');
  card.cleanup();
});
