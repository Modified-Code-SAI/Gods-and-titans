// The Pause key against the computer (DESIGN 9, "Pause"): it stops the ticker and shows the pause bar; the
// key again goes on; the game menu takes the pause over, so closing the menu goes on. Not online
// (that is the pause for everyone), in a replay, at the end, or under an overlay.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../../src/game/game.js';
import { pauseText } from '../../src/ui/hud-data.js';

function fakeGame({ online = false, overlay = false, gameOver = null } = {}) {
  const ticker = { running: true, stop() { this.running = false; }, start() { this.running = true; } };
  const bars = [];
  const g = {
    online,
    replay: null,
    ended: false,
    disposed: false,
    paused: false,
    keyPaused: false,
    session: { isHost: true, ticker, clients: new Map(), stopped: false, sendPause() { this.sent = true; } },
    viewState: { gameOver, me: {}, resetClock() {} },
    hud: { overlays: { open: overlay ? {} : null }, setPause: (p) => bars.push(p) },
  };
  for (const k of ['togglePause', 'toggleKeyPause', 'endKeyPause', 'setPaused']) g[k] = Game.prototype[k];
  return { g, ticker, bars };
}

test('Pause pauses and goes on, with the bar', () => {
  const { g, ticker, bars } = fakeGame();
  assert.equal(g.togglePause(), true);
  assert.equal(g.paused, true);
  assert.equal(g.keyPaused, true);
  assert.equal(ticker.running, false);
  assert.deepEqual(bars.at(-1), { solo: true });
  assert.match(pauseText({ solo: true }, () => ''), /^Paused/);
  assert.equal(g.togglePause(), true);
  assert.equal(g.paused, false);
  assert.equal(g.keyPaused, false);
  assert.equal(ticker.running, true);
  assert.equal(bars.at(-1), null);
});

test('the game menu takes a key pause over: closing it goes on', () => {
  const { g, ticker, bars } = fakeGame();
  g.togglePause();
  assert.equal(g.setPaused(true), true, 'the menu opens');
  assert.equal(g.keyPaused, false);
  assert.equal(bars.at(-1), null, 'the bar gives way to the menu');
  g.setPaused(false); // the menu closes
  assert.equal(g.paused, false);
  assert.equal(ticker.running, true);
});

test('no key pause under an overlay, at the end, or while the menu already paused; online sends the pause for everyone', () => {
  assert.equal(fakeGame({ overlay: true }).g.togglePause(), false);
  assert.equal(fakeGame({ gameOver: { winningTeam: 1 } }).g.togglePause(), false);
  const menu = fakeGame();
  menu.g.setPaused(true);
  assert.equal(menu.g.togglePause(), false);
  assert.equal(menu.g.keyPaused, false);
  const on = fakeGame({ online: true });
  assert.equal(on.g.togglePause(), true);
  assert.equal(on.g.session.sent, true);
  assert.equal(on.g.keyPaused, false);
});
