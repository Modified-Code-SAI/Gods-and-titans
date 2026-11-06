// Renown and the commander's titles (src/game/renown.js), worked out from a career.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renown, RENOWN_TITLES } from '../../src/game/renown.js';
import { emptyCareer } from '../../src/game/career.js';
import { ACHIEVEMENTS } from '../../src/data/achievements.js';

test('a new career is an Initiate on the way to Warrior', () => {
  const r = renown(emptyCareer());
  assert.equal(r.points, 0);
  assert.equal(r.title, 'Initiate');
  assert.equal(r.level, 1);
  assert.deepEqual(r.next, { title: 'Warrior', at: 60, left: 60 });
  assert.equal(r.progress, 0);
});

test('games, wins, achievements and the slain all count', () => {
  const c = emptyCareer();
  Object.assign(c, { games: 10, wins: 6, kills: 260 });
  c.unlocked[ACHIEVEMENTS[0].id] = 1;
  c.unlocked[ACHIEVEMENTS[1].id] = 1;
  c.unlocked.not_a_real_one = 1;
  const r = renown(c);
  assert.equal(r.points, 10 * 5 + 6 * 20 + 2 * 25 + 5);
  assert.equal(r.title, 'Captain');
  assert.equal(r.next.title, 'Warlord');
  assert.equal(r.next.left, 450 - r.points);
  assert.ok(r.progress > 0 && r.progress < 1);
});

test('the highest title has no next, and bad numbers count as nothing', () => {
  const c = emptyCareer();
  c.wins = 1000;
  const r = renown(c);
  assert.equal(r.title, RENOWN_TITLES.at(-1)[1]);
  assert.equal(r.next, null);
  assert.equal(r.progress, 1);
  assert.equal(renown({ games: -3, wins: NaN, kills: 'x', unlocked: {} }).points, 0);
  assert.equal(renown(null).title, 'Initiate');
});
