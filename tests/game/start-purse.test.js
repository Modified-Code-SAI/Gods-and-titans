// Starting resources (DESIGN 5.1): the lobby's Standard / Plenty / Rich, carried by the GameSetup as startPurse.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LobbyHost, LobbyClient, buildSetup, sanitizeLobbyState } from '../../src/net/lobby.js';
import { validateSetup } from '../../src/net/sanitize.js';
import { purseChoice, purseLabel, PURSES } from '../../src/ui/menu-model.js';
import { startOf, purseOf } from '../../src/data/twists.js';
import { createWorld } from '../../src/sim/world.js';
import { matchTerms } from '../../src/ui/match-loading.js';
import { START_RESOURCES, START_WORKERS, START_PURSES } from '../../src/config.js';

const state = (over = {}) => ({
  mapSize: 'small',
  slots: [
    { kind: 'host', name: 'A', pantheon: 'greek', team: 1, color: 0, difficulty: 'normal' },
    { kind: 'ai', name: '', pantheon: 'norse', team: 2, color: 1, difficulty: 'easy' },
  ],
  ...over,
});

test('lobby: the host picks the starting resources, clients see them, and the GameSetup carries them', async () => {
  const host = await LobbyHost.create({ transport: 'loopback', name: 'Austin' });
  assert.equal(host.state.purse, 'standard');
  const bob = await LobbyClient.join({ transport: 'loopback', roomCode: host.roomCode, name: 'Bob' });
  for (const bad of ['gold', 1, null, undefined]) assert.equal(host.setPurse(bad), false, String(bad));
  assert.equal(host.setPurse('standard'), false, 'already standard');
  assert.ok(host.setPurse('rich'));
  const until = Date.now() + 2000;
  while (bob.state.purse !== 'rich' && Date.now() < until) await new Promise((r) => setTimeout(r, 10));
  assert.equal(purseChoice(bob.state), 'rich');
  assert.match(purseLabel(bob.state), /^Rich: 5000 gold/);
  const res = host.start();
  assert.equal(res.setup.startPurse, 'rich');
  assert.equal(validateSetup(res.setup, 0).setup.startPurse, 'rich');
  assert.equal(host.setPurse('plenty'), false, 'too late once the game started');
  for (const c of res.conns.values()) c.close();
  bob.leave?.();
  host.close?.();
});

test('standard starting resources keep the GameSetup as it was; nonsense is dropped', () => {
  assert.equal('startPurse' in buildSetup(state(), 5).setup, false);
  assert.equal('startPurse' in buildSetup(state({ purse: 'standard' }), 5).setup, false);
  assert.equal(buildSetup(state({ purse: 'plenty' }), 5).setup.startPurse, 'plenty');
  assert.equal(sanitizeLobbyState(state({ purse: 'lots' })).purse, 'standard');
  const { setup } = buildSetup(state({ purse: 'plenty' }), 5);
  assert.equal('startPurse' in validateSetup({ ...setup, startPurse: 'lots' }, 0).setup, false);
  assert.deepEqual(PURSES.map((p) => p.id), ['standard', 'plenty', 'rich']);
});

test('every player starts with the chosen resources, and a daily twist still applies on top', () => {
  for (const id of ['plenty', 'rich']) {
    const { setup } = buildSetup(state({ purse: id }), 7);
    const w = createWorld(setup);
    for (const p of w.players) {
      assert.equal(p.gold, START_PURSES[id].gold, `${id} gold`);
      assert.equal(p.wood, START_PURSES[id].wood, `${id} wood`);
      assert.equal(p.faith, START_PURSES[id].faith, `${id} faith`);
    }
    assert.match(matchTerms(setup), id === 'rich' ? /Rich start/ : /Plenty start/);
  }
  assert.deepEqual(startOf({}, START_RESOURCES, START_WORKERS), { ...START_RESOURCES, workers: START_WORKERS });
  assert.equal(purseOf({ startPurse: 'toString' }), null);
  const golden = startOf({ startPurse: 'plenty', twist: 'golden' }, START_RESOURCES, START_WORKERS);
  assert.equal(golden.gold, START_PURSES.plenty.gold * 3);
});
