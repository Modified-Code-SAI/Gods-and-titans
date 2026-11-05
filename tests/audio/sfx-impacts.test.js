import { test } from 'node:test';
import assert from 'node:assert/strict';
import { impactSound, deathSound, IMPACT_RECIPES, IMPACT_LIMITS, IMPACT_LEVEL } from '../../src/audio/sfx-impacts.js';
import { UNITS, BUILDINGS } from '../../src/data/index.js';

const unitsOf = (pred) => Object.values(UNITS).filter(pred);
const sword = { def: UNITS[Object.keys(UNITS).find((id) => UNITS[id].class === 'infantry' && !UNITS[id].attack.projectile)] };
const archer = { def: UNITS[Object.keys(UNITS).find((id) => UNITS[id].attack && UNITS[id].attack.projectile === 'arrow')] };
const ram = { def: UNITS[Object.keys(UNITS).find((id) => UNITS[id].class === 'siege')] };
const caster = { def: UNITS[Object.keys(UNITS).find((id) => UNITS[id].attack && UNITS[id].attack.element && UNITS[id].attack.element !== 'physical')] };

test('every impact sound has a limit and a level', () => {
  for (const name of Object.keys(IMPACT_RECIPES)) {
    assert.ok(IMPACT_LIMITS[name], name);
    assert.ok(IMPACT_LEVEL[name] > 0, name);
  }
});

test('a blow sounds like what it lands on and what struck it', () => {
  const worker = unitsOf((u) => u.class === 'worker')[0];
  const armored = unitsOf((u) => u.class === 'infantry' && u.armor >= 2)[0];
  const titan = unitsOf((u) => u.class === 'titan')[0];
  const god = unitsOf((u) => u.class === 'god')[0];
  assert.equal(impactSound({ kind: 'u', def: worker }, sword)[0], 'hit');
  assert.equal(impactSound({ kind: 'u', def: armored }, sword)[0], 'hit_armor');
  assert.equal(impactSound({ kind: 'u', def: god }, sword)[0], 'hit_armor');
  assert.equal(impactSound({ kind: 'u', def: armored }, archer)[0], 'hit_pierce');
  assert.equal(impactSound({ kind: 'u', def: titan }, sword)[0], 'hit_heavy');
  assert.equal(impactSound({ kind: 'u', def: armored }, caster)[0], 'hit', 'a spell keeps the soft thud under its own sound');
  assert.equal(impactSound({ kind: 'b', id: 'wooden_wall', def: BUILDINGS.wooden_wall }, sword)[0], 'hit_wood');
  assert.equal(impactSound({ kind: 'b', id: 'stone_wall', def: BUILDINGS.stone_wall }, sword)[0], 'hit_stone');
  const [, ramVol] = impactSound({ kind: 'b', id: 'barracks', def: BUILDINGS.barracks }, ram);
  const [, swordVol] = impactSound({ kind: 'b', id: 'barracks', def: BUILDINGS.barracks }, sword);
  assert.ok(ramVol > swordVol, 'a ram lands harder than a sword');
  assert.equal(impactSound({ kind: 'u', def: worker }, null)[0], 'hit', 'an unknown attacker');
});

test('deaths scale with what fell: buildings collapse, gods and titans fall heavily', () => {
  const by = (cls) => unitsOf((u) => u.class === cls)[0];
  assert.deepEqual(deathSound({ k: 'u' }, by('worker')), ['death', 0.8]);
  assert.equal(deathSound({ k: 'u' }, by('god'))[0], 'death_big');
  assert.equal(deathSound({ k: 'u' }, by('titan'))[0], 'death_titan');
  assert.equal(deathSound({ k: 'b' }, BUILDINGS.temple)[0], 'collapse');
  assert.ok(deathSound({ k: 'b' }, BUILDINGS.stone_wall)[1] < deathSound({ k: 'b' }, BUILDINGS.temple)[1], 'a wall segment falls quieter');
  assert.equal(deathSound({ k: 'u' }, undefined)[0], 'death');
});
