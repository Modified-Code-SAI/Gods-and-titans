import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { installFakeDom } from './fake-dom.js';
import { realmSummary, nextLine, RealmPanel } from '../../src/ui/hud-realm.js';

before(() => installFakeDom());

const vsOf = (me, ents) => ({ me, myIndex: 0, entities: new Map(ents.map((e, i) => [i + 1, { id: i + 1, ...e }])) });
const tc = (extra = {}) => ({ k: 'b', t: 'town_center', o: 0, ...extra });

test('the realm counts soldiers, gods and creatures, and buildings of mine only', () => {
  const vs = vsOf({ pantheon: 'greek', tier: 1, gold: 0, wood: 0, faith: 0 }, [
    tc(), { k: 'u', t: 'worshipper', o: 0 }, { k: 'u', t: 'warrior', o: 0 }, { k: 'u', t: 'greek_zeus', o: 0 }, { k: 'u', t: 'warrior', o: 1 }, { k: 'b', t: 'house', o: 0, bp: 0.5 },
  ]);
  const r = realmSummary(vs);
  assert.equal(r.pantheon.name, 'Greek');
  assert.deepEqual(r.army, { soldiers: 1, divine: 1, buildings: 2 });
  assert.equal(r.tc, 1);
});

test('the next age names what it waits on: a building, then the offering, then nothing', () => {
  const me = { pantheon: 'greek', tier: 1, gold: 100, wood: 500, faith: 0 };
  let r = realmSummary(vsOf(me, [tc()]));
  assert.equal(r.next.to, 'Town');
  assert.deepEqual(r.next.requires, [{ name: 'Shrine', have: false }]);
  assert.equal(nextLine(r.next), 'Build a Shrine first.');
  r = realmSummary(vsOf(me, [tc(), { k: 'b', t: 'shrine', o: 0 }]));
  assert.equal(nextLine(r.next), 'Gather more gold.');
  r = realmSummary(vsOf({ ...me, gold: 900 }, [tc(), { k: 'b', t: 'shrine', o: 0 }]));
  assert.match(nextLine(r.next), /^Ready/);
  r = realmSummary(vsOf(me, [tc({ q: [{ u: 'tier_up', p: 0.4 }] })]));
  assert.equal(r.next.growing, true);
  assert.equal(r.next.progress, 0.4);
  assert.equal(nextLine(r.next), 'Growing into a Town…');
  r = realmSummary(vsOf({ ...me, tier: 3 }, [tc()]));
  assert.equal(r.next, null);
  assert.equal(nextLine(null), 'Your realm stands at its height.');
  assert.equal(realmSummary({ me: null }), null);
});

test('a click on the age card selects the Town Center', () => {
  const root = document.createElement('div');
  const picked = [];
  const panel = new RealmPanel(root, { onSelect: (id) => picked.push(id) });
  panel.update(vsOf({ pantheon: 'norse', tier: 2, gold: 0, wood: 0, faith: 0 }, [{ k: 'b', t: 'house', o: 0 }, tc()]));
  assert.equal(root.find('hr-name').textContent, 'Norse');
  assert.equal(root.find('hr-goal-head').textContent, 'Next: City');
  root.find('hr-goal').listeners.get('click')[0]({});
  assert.deepEqual(picked, [2]);
});
