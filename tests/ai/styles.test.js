// Computer players' play styles (DESIGN 10, src/data/ai-styles.js): drawn by the lobby from the seed, carried by
// the setup, laid over the difficulty profile by the AI, and named on the loading screen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STYLES, STYLE_IDS, drawStyle, styleInfo, BALANCED } from '../../src/data/ai-styles.js';
import { PROFILES, profileFor, withStyle } from '../../src/ai/profiles.js';
import { createAI } from '../../src/ai/ai.js';
import { createWorld } from '../../src/sim/world.js';
import { buildSetup } from '../../src/net/lobby.js';
import { validateSetup } from '../../src/net/sanitize.js';
import { matchSides } from '../../src/ui/match-loading.js';

const state = () => ({
  mapSize: 'small',
  slots: [
    { kind: 'host', name: 'A', pantheon: 'greek', team: 1, color: 0, difficulty: 'normal' },
    { kind: 'ai', name: '', pantheon: 'norse', team: 2, color: 1, difficulty: 'hard' },
    { kind: 'ai', name: '', pantheon: 'celtic', team: 2, color: 2, difficulty: 'easy' },
  ],
});

test('a style changes only when and how hard a computer player fights, the same at every difficulty', () => {
  for (const d of Object.keys(PROFILES)) {
    const base = PROFILES[d];
    assert.equal(profileFor(d), base, 'no style: the profile itself');
    assert.equal(profileFor(d, 'nope'), base);
    for (const id of STYLE_IDS) {
      const p = profileFor(d, id);
      assert.equal(p.think, base.think, `${d}/${id}: thinks as fast as its difficulty`);
      assert.equal(p.raids, base.raids, `${d}/${id}`);
      assert.equal(p.micro, base.micro, `${d}/${id}`);
      for (const k of Object.keys(base)) assert.equal(typeof p[k], typeof base[k], `${d}/${id}/${k}`);
      for (const k of ['attackPop', 'workers', 'towersMax']) assert.ok(Number.isInteger(p[k]) && p[k] >= 0, `${d}/${id}/${k}`);
    }
  }
  assert.ok(profileFor('normal', 'raider').firstAttack < PROFILES.normal.firstAttack);
  assert.ok(profileFor('normal', 'builder').workers > PROFILES.normal.workers);
  assert.ok(profileFor('normal', 'guardian').towersMax > PROFILES.normal.towersMax);
  assert.equal(withStyle(PROFILES.easy, 'raider').expandAt2, Infinity, 'Easy still never takes a third mine');
  for (const id of STYLE_IDS) assert.ok(STYLES[id].name && STYLES[id].icon && STYLES[id].blurb);
  assert.equal(styleInfo(null), BALANCED);
});

test('the lobby draws a style for each computer player from the seed; the setup carries it to the AI', () => {
  const seen = new Set();
  for (let seed = 1; seed <= 40; seed++) {
    const { setup } = buildSetup(state(), seed);
    assert.equal('style' in setup.players[0], false, 'a person has no style');
    assert.deepEqual(buildSetup(state(), seed).setup, setup, 'the same seed, the same styles');
    for (const p of setup.players.slice(1)) {
      seen.add(p.style || null);
      assert.equal(p.style ?? null, drawStyle(seed, p.index));
      assert.equal(validateSetup(setup, 0).setup.players[p.index].style, p.style);
    }
  }
  assert.deepEqual([...seen].sort(), [...STYLE_IDS, null].sort(), 'every style comes up, and balanced');
  const { setup } = buildSetup(state(), 3);
  const bad = validateSetup({ ...setup, players: setup.players.map((p) => ({ ...p, style: 'cheater' })) }, 0).setup;
  assert.ok(bad.players.every((p) => !('style' in p)), 'an unknown style is dropped');

  setup.players[1].style = 'raider';
  const w = createWorld(setup);
  const ai = createAI(w, 1, 'hard').ai;
  assert.equal(ai.style, 'raider');
  assert.equal(ai.prof.firstAttack, profileFor('hard', 'raider').firstAttack);
  assert.equal(createAI(w, 1, 'hard', { standIn: true }).ai.style, null, 'a stand-in plays balanced');
  const sides = matchSides(setup, 0);
  assert.equal(sides[1].players[0].who, 'Computer · Hard · Raider');
});
