// A player muted from the player list (src/game/game.js onChat): their chat lines and their taunts
// stop reaching me; other players and the game's own lines still do.
import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../../src/game/game.js';
import { sfx } from '../../src/audio/sfx.js';

function run(line, muted = [1]) {
  const shown = [];
  const game = {
    myIndex: 0,
    viewState: { players: [], myIndex: 0 },
    setup: { players: [] },
    taunts: null,
    hud: {
      isMuted: (i) => muted.includes(i),
      showTaunt: (l) => { shown.push(['taunt', l.text]); return true; },
      chat: (l) => shown.push(['chat', l.text]),
    },
  };
  const play = sfx.play;
  sfx.play = () => true;
  try {
    Game.prototype.onChat.call(game, line);
  } finally {
    sfx.play = play;
  }
  return shown;
}

test('a muted player\'s chat and taunts are dropped; another player\'s and the system\'s come through', () => {
  assert.deepEqual(run({ from: 1, text: 'gg ez' }), []);
  assert.deepEqual(run({ from: 1, text: 'Your gods are weak!', voice: 'taunt' }), []);
  assert.deepEqual(run({ from: 2, text: 'hello' }), [['chat', 'hello']]);
  assert.deepEqual(run({ from: 1, system: true, text: 'P1 has left.' }), [['chat', 'P1 has left.']]);
});
