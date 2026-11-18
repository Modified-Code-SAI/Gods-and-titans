// Handicap (DESIGN 5.1): a human player's share of what their workers gather and pray, set in the lobby.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HANDICAPS } from '../../src/config.js';
import { createWorld } from '../../src/sim/world.js';
import { deposit } from '../../src/sim/economy.js';
import { buildSetup, LobbyHost, sanitizeLobbyState } from '../../src/net/lobby.js';
import { validateSetup } from '../../src/net/sanitize.js';
import { matchSides } from '../../src/ui/match-loading.js';

const setupWith = (handicap) => ({
  seed: 5,
  mapSize: 'small',
  players: [
    { index: 0, name: 'A', team: 1, pantheon: 'greek', kind: 'human', ...(handicap ? { handicap } : {}) },
    { index: 1, name: 'B', team: 2, pantheon: 'norse', kind: 'human' },
  ],
});

test('a handicapped player keeps only their share of each load and of their prayers', () => {
  const w = createWorld(setupWith(70));
  assert.equal(w.players[0].handicap, 0.7);
  assert.equal(w.players[1].handicap, 1);
  for (const owner of [0, 1]) {
    const u = w.unitList.find((e) => e.owner === owner && e.type === 'worshipper');
    const before = w.players[owner].gold;
    u.carry = 'g';
    u.carryAmount = 10;
    deposit(w, u);
    assert.equal(w.players[owner].gold - before, owner === 0 ? 7 : 10);
  }
  assert.equal(createWorld(setupWith(55)).players[0].handicap, 1, 'only the listed steps count');
});

test('the setup carries a human player\'s handicap; 100% and computer players carry none', () => {
  assert.deepEqual(HANDICAPS, [100, 90, 80, 70, 60, 50]);
  const state = {
    mapSize: 'small',
    slots: [
      { kind: 'host', name: 'A', pantheon: 'greek', team: 1, color: 0, handicap: 80 },
      { kind: 'ai', name: '', pantheon: 'norse', team: 2, color: 1, difficulty: 'easy', handicap: 50 },
      { kind: 'human', name: 'C', pantheon: 'celtic', team: 2, color: 2, handicap: 100 },
    ],
  };
  const { setup } = buildSetup(state, 9);
  assert.equal(setup.players[0].handicap, 80);
  assert.ok(!('handicap' in setup.players[1]));
  assert.ok(!('handicap' in setup.players[2]));
  const clean = validateSetup(setup, 0).setup;
  assert.equal(clean.players[0].handicap, 80);
  assert.ok(!('handicap' in validateSetup({ ...setup, players: setup.players.map((p) => ({ ...p, handicap: 33 })) }, 0).setup.players[0]));
  const sides = matchSides(setup, 2);
  assert.equal(sides[0].players[0].who, 'Player · Handicap 80%');
  assert.equal(matchSides(setup, 0)[0].players[0].who, 'You · Handicap 80%');
});

test('in the lobby the host sets anyone\'s handicap but a computer player\'s; bad values are dropped', async () => {
  const lobby = await LobbyHost.create({ transport: 'none', name: 'Host' });
  try {
    lobby.setSlot(0, { handicap: 60 });
    assert.equal(lobby.state.slots[0].handicap, 60);
    lobby.setSlot(0, { handicap: 65 });
    assert.equal(lobby.state.slots[0].handicap, 60);
    const ai = lobby.state.slots.findIndex((s) => s.kind === 'ai');
    lobby.setSlot(ai, { handicap: 50 });
    assert.equal(lobby.state.slots[ai].handicap, 100);
    const clean = sanitizeLobbyState({ ...lobby.state, slots: lobby.state.slots.map((s) => ({ ...s, handicap: 'x' })) });
    assert.equal(clean.slots[0].handicap, 100);
  } finally {
    lobby.close?.();
  }
});
