import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchupLine } from '../../src/game/game.js';

const pl = (index, team, pantheon) => ({ index, team, pantheon });

test('the loading screen names the sides by team and the landscape', () => {
  assert.equal(matchupLine({ players: [pl(0, 1, 'greek'), pl(1, 2, 'norse')] }), 'Greek vs Norse · Wildlands');
  assert.equal(matchupLine({ landscape: 'islands', players: [pl(0, 1, 'greek'), pl(1, 1, 'hindu'), pl(2, 2, 'norse'), pl(3, 2, 'celtic')] }), 'Greek & Hindu vs Norse & Celtic · Islands');
  assert.equal(matchupLine({ players: [pl(0, 1, 'greek'), pl(1, 2, 'norse'), pl(2, 3, 'egyptian')] }), 'Greek vs Norse vs Egyptian · Wildlands');
});

test('no matchup line for a campaign mission, the guided first match or a missing setup', () => {
  assert.equal(matchupLine({ campaign: 'greek-1', players: [pl(0, 1, 'greek'), pl(1, 2, 'norse')] }), '');
  assert.equal(matchupLine({ tutorial: true, players: [pl(0, 1, 'greek'), pl(1, 2, 'norse')] }), '');
  assert.equal(matchupLine(null), '');
  assert.equal(matchupLine({ players: [] }), '');
});
