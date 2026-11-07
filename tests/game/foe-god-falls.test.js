// Another player's god or Titan falling where my team can see it (src/game/game.js onEvent 'death'):
// good news for a foe's, a warning for an ally's, and nothing from under the fog.
import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../../src/game/game.js';
import { UNITS } from '../../src/data/index.js';
import { sfx } from '../../src/audio/sfx.js';

const god = Object.keys(UNITS).find((k) => UNITS[k].class === 'god');
const titan = Object.keys(UNITS).find((k) => UNITS[k].class === 'titan');
const soldier = Object.keys(UNITS).find((k) => UNITS[k].class !== 'god' && UNITS[k].class !== 'titan');

function run(ev, { visible = true } = {}) {
  const lines = [];
  const game = {
    disposed: false,
    viewState: {
      myIndex: 0, me: {}, time: 100,
      isVisibleAt: () => visible,
      isEnemy: (o) => o === 1,
      isAlly: (o) => o === 0 || o === 2,
    },
    hud: { message: (text, kind) => lines.push([text, kind]) },
    playerName: (i) => ['Me', 'Foe', 'Friend'][i],
    worldSound() {},
  };
  const play = sfx.play;
  sfx.play = () => true;
  try {
    Game.prototype.onEvent.call(game, { type: 'death', k: 'u', id: 9, x: 5, y: 5, ...ev });
  } finally {
    sfx.play = play;
  }
  return lines;
}

test("a foe's god or Titan falling in sight is good news, an ally's a warning", () => {
  assert.deepEqual(run({ t: god, o: 1 }), [[`Foe's ${UNITS[god].name} has fallen!`, 'good']]);
  assert.deepEqual(run({ t: titan, o: 1 }), [[`Foe's ${UNITS[titan].name} has fallen!`, 'good']]);
  assert.deepEqual(run({ t: god, o: 2 }), [[`Your ally Friend has lost ${UNITS[god].name}.`, 'alert']]);
});

test('nothing under the fog, for a common unit, or for creatures with no owner', () => {
  assert.deepEqual(run({ t: god, o: 1 }, { visible: false }), []);
  assert.deepEqual(run({ t: soldier, o: 1 }), []);
  assert.deepEqual(run({ t: god, o: -1 }), []);
});
