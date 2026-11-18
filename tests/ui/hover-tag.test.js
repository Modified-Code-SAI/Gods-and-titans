// The name tag beside the cursor over things on the map (src/ui/hover-tag.js).
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { installFakeDom } from './fake-dom.js';
import { hoverTagInfo, relicTagInfo, siteTagInfo, HoverTag } from '../../src/ui/hover-tag.js';
import { ViewState } from '../../src/game/view-state.js';

before(installFakeDom);

const vs = {
  myIndex: 0,
  players: [{ name: 'Me', color: '#d04040' }, { name: 'Tlaloc', color: '#3070e0' }, { name: 'Friend', color: '#40c040' }],
  relation(o) { return o === undefined || o < 0 ? 'neutral' : o === 0 ? 'own' : o === 2 ? 'ally' : 'enemy'; },
  mineGold: (e) => e.g,
};

test('an enemy unit is named with its owner, in the owner\'s colour, and its health', () => {
  const t = hoverTagInfo({ k: 'u', t: 'archer', o: 1, hp: 30, mhp: 120 }, vs);
  assert.equal(t.name, 'Archer');
  assert.equal(t.who, 'Tlaloc · Enemy');
  assert.ok(t.color);
  assert.equal(t.rel, 'enemy');
  assert.equal(t.frac, 0.25);
});

test('my own things carry no owner line; an ally says so; a mine tells its gold', () => {
  assert.equal(hoverTagInfo({ k: 'u', t: 'archer', o: 0, hp: 120, mhp: 120 }, vs).who, '');
  assert.equal(hoverTagInfo({ k: 'b', t: 'house', o: 2, hp: 10, mhp: 600 }, vs).who, 'Friend · Ally');
  const mine = hoverTagInfo({ k: 'm', t: 'gold_mine', o: -1, g: 2400 }, vs);
  assert.equal(mine.who, '');
  assert.equal(mine.frac, null);
  assert.match(mine.note, /2,?400 gold left/);
  assert.equal(hoverTagInfo(null, vs), null);
});

test('the tag shows the info beside the point and hides', () => {
  const root = document.createElement('div');
  const tag = new HoverTag(root);
  tag.show(hoverTagInfo({ k: 'u', t: 'archer', o: 1, hp: 30, mhp: 120 }, vs), 100, 50);
  assert.equal(tag.node.hidden, false);
  assert.equal(tag.nameEl.textContent, 'Archer');
  assert.equal(tag.fill.className, 'is-low');
  assert.match(tag.node.className, /is-enemy/);
  tag.hide();
  assert.equal(tag.node.hidden, true);
});

test('a relic on the ground says what it is and what it gives in a Temple; a sacred site says who holds it', () => {
  const r = relicTagInfo({ t: 'golden_fleece', s: 'g', x: 3, y: 3 });
  assert.equal(r.name, 'Golden Fleece');
  assert.match(r.who, /Temple/);
  assert.match(r.note, /10% more health/);
  assert.equal(relicTagInfo({ t: 'nope' }), null);
  assert.match(siteTagInfo({ x: 1, y: 1, o: -1 }, vs).who, /Unclaimed/);
  assert.equal(siteTagInfo({ x: 1, y: 1, o: 0 }, vs).who, 'Held by you');
  const enemy = siteTagInfo({ x: 1, y: 1, o: 1 }, vs);
  assert.equal(enemy.who, 'Tlaloc · Enemy');
  assert.equal(enemy.rel, 'enemy');
  assert.match(enemy.note, /faith/);
});

test('siteNear finds the site whose ground holds a point, once explored', () => {
  const view = Object.create(ViewState.prototype);
  Object.assign(view, { sites: [{ x: 10, y: 10, o: -1 }, { x: 30, y: 30, o: 1 }], revealAll: false, isExplored: (x) => x < 20 });
  assert.equal(view.siteNear(11, 11), view.sites[0]);
  assert.equal(view.siteNear(20, 20), null, 'too far from either');
  assert.equal(view.siteNear(30, 31), null, 'not yet explored');
  view.revealAll = true;
  assert.equal(view.siteNear(30, 31), view.sites[1]);
});
