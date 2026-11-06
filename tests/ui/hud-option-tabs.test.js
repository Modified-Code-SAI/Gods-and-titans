// The game menu's option tabs (src/ui/hud-overlays.js optionPages): one page shown at a time, every row still in
// the menu, and the tab looked at last coming back when the menu opens again. Fake DOM.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { installFakeDom, FakeElement } from './fake-dom.js';
import { Overlays, optionPages } from '../../src/ui/hud-overlays.js';

before(() => {
  installFakeDom();
  FakeElement.prototype.querySelectorAll = () => [];
  globalThis.requestAnimationFrame = () => 0;
});

const shown = (pages) => pages.filter((p) => !p.hidden).map((p) => p.dataset.id);

test('one page at a time, the empty rows left out, and the pick remembered', () => {
  const row = () => document.createElement('div');
  let o = optionPages([['a', 'A', [row(), null]], ['b', 'B', [row()]]]);
  assert.deepEqual(shown(o.pages), ['a']);
  assert.equal(o.pages[0].children.length, 1);
  o.tabs.children[1].click();
  assert.deepEqual(shown(o.pages), ['b']);
  assert.ok(o.tabs.children[1].classList.contains('is-active'));
  o = optionPages([['a', 'A', [row()]], ['b', 'B', [row()]]]);
  assert.deepEqual(shown(o.pages), ['b'], 'the last tab comes back');
  o = optionPages([['x', 'X', [row()]]]);
  assert.deepEqual(shown(o.pages), ['x'], 'an unknown last tab falls back to the first');
});

test('the F10 menu puts every option on one of four tabs beside the buttons', () => {
  const root = document.createElement('div');
  const game = { session: null, solo: true, viewState: { myIndex: 0, time: 5, me: { defeated: false } }, setPaused: () => true, quitToMenu() {}, surrender() {} };
  new Overlays(root, game).openMenu();
  const tabs = root.findAll('hud-otab').map((t) => t.textContent);
  assert.deepEqual(tabs, ['Gameplay', 'Graphics', 'Audio', 'Keys']);
  const pages = root.findAll('hud-opage');
  const text = (id) => pages.find((p) => p.dataset.id === id).textContent;
  assert.ok(text('play').includes('Game speed') && text('play').includes('Alerts'));
  assert.ok(text('look').includes('Graphics quality') && text('look').includes('Weather'));
  assert.ok(text('sound').includes('Sound effects') && text('sound').includes('Music volume'));
  assert.ok(text('keys').includes('Command keys'));
  assert.ok(root.find('hud-menu-body').find('hud-obtns'));
});
