// Another side's settlement growing into a Town or a City (src/game/game.js onEvent 'tierUp'): a line
// for an ally's, a warning for a rival's, and my own growth keeps its banner.
import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../../src/game/game.js';
import { sfx } from '../../src/audio/sfx.js';

function run(ev) {
  const lines = [];
  const banners = [];
  const game = {
    disposed: false,
    viewState: { myIndex: 0, me: {}, time: 100, isEnemy: (o) => o === 1, isAlly: (o) => o === 0 || o === 2 },
    hud: { message: (text, kind) => lines.push([text, kind]), showAge: () => false, showBanner: (text) => banners.push(text) },
    playerName: (i) => ['Me', 'Foe', 'Friend'][i],
    worldSound() {},
  };
  const play = sfx.play;
  sfx.play = () => true;
  try {
    Game.prototype.onEvent.call(game, { type: 'tierUp', ...ev });
  } finally {
    sfx.play = play;
  }
  return { lines, banners };
}

test("a rival's growth is a warning, an ally's good news, with the age it reached", () => {
  assert.deepEqual(run({ player: 1, tier: 2 }).lines, [['Foe has grown into a Town.', 'alert']]);
  assert.deepEqual(run({ player: 1, tier: 3 }).lines, [['Foe has grown into a City.', 'alert']]);
  assert.deepEqual(run({ player: 2, tier: 2 }).lines, [['Your ally Friend has grown into a Town.', 'good']]);
});

test('my own growth keeps its banner and adds no line', () => {
  const mine = run({ player: 0, tier: 2 });
  assert.deepEqual(mine.lines, []);
  assert.deepEqual(mine.banners, ['Your Village has grown into a Town!']);
});
