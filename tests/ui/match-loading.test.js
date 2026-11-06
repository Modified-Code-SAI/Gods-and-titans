import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { installFakeDom } from './fake-dom.js';
import { matchSides, matchTerms, buildMatchup } from '../../src/ui/match-loading.js';

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
