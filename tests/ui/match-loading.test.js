import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { installFakeDom } from './fake-dom.js';
import { matchSides, matchTerms, buildMatchup, missionCardSpec, buildMissionCard } from '../../src/ui/match-loading.js';
import { CHAPTERS } from '../../src/data/campaign.js';

before(() => installFakeDom());

const pl = (index, team, pantheon, extra = {}) => ({ index, team, pantheon, name: `P${index}`, color: '#3070d0', kind: 'human', ...extra });

test('the sides group the players by team, with who plays each one', () => {
  const sides = matchSides({ players: [pl(0, 1, 'greek'), pl(1, 2, 'norse', { kind: 'ai', difficulty: 'brutal' }), pl(2, 1, 'hindu', { kind: 'ai' }), pl(3, 2, 'celtic')] }, 0);
  assert.equal(sides.length, 2);
  assert.deepEqual(sides[0].players.map((p) => [p.name, p.pantheon, p.who, p.me]), [['P0', 'Greek', 'You', true], ['P2', 'Hindu', 'Computer · Normal', false]]);
  assert.deepEqual(sides[1].players.map((p) => p.who), ['Computer · Brutal', 'Player']);
  assert.ok(sides[0].players[0].emblem);
});

test('no sides for a campaign mission, the tutorial or a missing setup', () => {
  assert.deepEqual(matchSides({ campaign: 'greek-1', players: [pl(0, 1, 'greek')] }), []);
  assert.deepEqual(matchSides({ tutorial: true, players: [pl(0, 1, 'greek')] }), []);
  assert.deepEqual(matchSides(null), []);
  assert.equal(buildMatchup({ players: [] }), null);
});

test('the terms name the landscape, the map size and the rules that change the game', () => {
  assert.equal(matchTerms({ mapSize: 'small' }), 'Wildlands · Small map');
  assert.equal(matchTerms({ landscape: 'islands', mapSize: 'medium', peaceMinutes: 10, sacredVictory: true }), 'Islands · Medium map · Decade of Peace · 10 min · Sacred Victory');
  assert.equal(matchTerms({ landscape: 'forest', survival: true }), 'Great Forest · Trial of the Titans');
});

test('the matchup draws one card per player, a vs between each pair of sides and the terms', () => {
  const node = buildMatchup({ mapSize: 'small', players: [pl(0, 1, 'greek'), pl(1, 2, 'norse'), pl(2, 3, 'egyptian')] }, 0);
  assert.equal(node.findAll('mw-ld-card').length, 3);
  assert.equal(node.findAll('mw-ld-vs').length, 2);
  assert.ok(node.find('mw-ld-sides').className.includes('is-many'));
  assert.equal(node.find('mw-ld-terms').textContent, 'Wildlands · Small map');
  const me = node.find('mw-ld-card');
  assert.ok(me.className.includes('is-me'));
  assert.equal(me.style.getPropertyValue('--pc'), '#3070d0');
});

test('a campaign mission gets its own card: chapter, number, title, place and the objectives known at the start', () => {
  const c = CHAPTERS[0];
  const m = c.missions[0];
  const spec = missionCardSpec({ campaign: m.id, players: [pl(0, 1, 'greek')] });
  assert.equal(spec.kicker, `Chapter I · ${c.title} · Mission 1 of ${c.missions.length}`);
  assert.equal(spec.title, m.title);
  assert.equal(spec.place, m.place);
  const visible = m.objectives.filter((o) => !o.hidden);
  assert.equal(spec.objectives.length, visible.length);
  assert.ok(spec.objectives.every((o) => o.text && o.icon));
  assert.ok(!spec.objectives.some((o) => m.objectives.find((x) => x.text === o.text).hidden), 'no hidden objective is given away');
  const optionalAt = spec.objectives.findIndex((o) => o.optional);
  if (optionalAt >= 0) assert.ok(spec.objectives.slice(optionalAt).every((o) => o.optional), 'bonus objectives come last');
});

test('every mission of every chapter has a card; a skirmish, the tutorial and an unknown mission have none', () => {
  for (const c of CHAPTERS) for (const m of c.missions) assert.ok(missionCardSpec({ campaign: m.id }), m.id);
  assert.equal(missionCardSpec({ players: [pl(0, 1, 'greek')] }), null);
  assert.equal(missionCardSpec({ tutorial: true }), null);
  assert.equal(missionCardSpec({ campaign: 'no-such-mission' }), null);
  assert.equal(buildMissionCard({ players: [pl(0, 1, 'greek')] }), null);
});

test('the mission card shows the title and one row per objective', () => {
  const m = CHAPTERS[1].missions[2];
  const card = buildMissionCard({ campaign: m.id });
  assert.ok(card.className.includes(`is-${CHAPTERS[1].id}`));
  assert.equal(card.find('mw-ld-title').textContent, m.title);
  assert.equal(card.findAll('mw-ld-goal').length, missionCardSpec({ campaign: m.id }).objectives.length);
});
