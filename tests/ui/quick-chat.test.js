// Quick chat (DESIGN 7, "Quick chat"): a lone number 1 to 9 sends that set line, and the chat box's
// buttons send one with a click, to whoever the box's switch points at. Fake DOM.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { Hud } from '../../src/ui/hud.js';
import { Selection } from '../../src/ui/hud-selection.js';
import { ViewState } from '../../src/game/view-state.js';
import { saveSettings } from '../../src/settings.js';
import { QUICK_LINES, QUICK_LABELS, expandQuick } from '../../src/data/quick-chat.js';
import { makeWorld } from '../sim/helpers.js';
import { installFakeDom } from './fake-dom.js';

before(() => {
  installFakeDom();
  saveSettings({ tipsDismissed: true });
});

const huds = [];
after(() => {
  for (const h of huds) h.dispose();
});

function setup(teams) {
  const world = makeWorld({ players: teams.length, teams });
  const vs = new ViewState({ setup: world.setup, mapData: world.mapData, myIndex: 0 });
  vs.pushSnapshot(world.getSnapshot(), 50);
  const sent = [];
  const root = document.createElement('div');
  const game = { viewState: vs, selection: new Selection(vs), session: null, input: null, renderer: null, command() {}, sendChat: (...a) => sent.push(a) };
  const hud = new Hud({ root, game });
  huds.push(hud);
  return { hud, sent };
}

test('expandQuick: a lone 1 to 9 is that line, anything else stays as typed', () => {
  assert.equal(QUICK_LINES.length, 9);
  assert.equal(QUICK_LABELS.length, 9);
  assert.equal(expandQuick('1'), QUICK_LINES[0]);
  assert.equal(expandQuick(' 9 '), QUICK_LINES[8]);
  assert.equal(expandQuick('0'), '0');
  assert.equal(expandQuick('10'), '10');
  assert.equal(expandQuick('3 now'), '3 now');
  assert.equal(expandQuick('hello'), 'hello');
  assert.equal(expandQuick(''), '');
});

test('typing a number and Enter sends the line; "/t 4" sends line 4 to the allies', () => {
  const { hud, sent } = setup([1, 1, 2]);
  hud.openChat();
  hud.chatInput.value = '3';
  hud.chatInput.fire('keydown', { key: 'Enter' });
  assert.deepEqual(sent.pop(), [QUICK_LINES[2]]);
  hud.openChat();
  hud.chatInput.value = '/t 4';
  hud.chatInput.fire('keydown', { key: 'Enter' });
  assert.deepEqual(sent.pop(), [QUICK_LINES[3], { team: true }]);
});

test('a quick button sends its line to whoever the switch points at, and closes the box', () => {
  const { hud, sent } = setup([1, 1, 2]);
  const buttons = hud.chatQuick.children;
  assert.equal(buttons.length, 9);
  hud.openChat();
  buttons[4].fire('click', {});
  assert.deepEqual(sent.pop(), [QUICK_LINES[4]]);
  assert.equal(hud.chatOpen, false);
  hud.openChat({ allies: true });
  buttons[7].fire('click', {});
  assert.deepEqual(sent.pop(), [QUICK_LINES[7], { team: true }]);
});

test('Up in the chat box brings back the line sent last, as typed; Down clears the box again', () => {
  const { hud, sent } = setup([1, 1, 2]);
  hud.openChat();
  hud.chatInput.value = '/t hold the ford';
  hud.chatInput.fire('keydown', { key: 'Enter' });
  assert.deepEqual(sent.pop(), ['hold the ford', { team: true }]);
  hud.openChat();
  assert.equal(hud.chatInput.value, '');
  hud.chatInput.fire('keydown', { key: 'ArrowUp' });
  assert.equal(hud.chatInput.value, '/t hold the ford');
  hud.chatInput.fire('keydown', { key: 'ArrowDown' });
  assert.equal(hud.chatInput.value, '');
});
