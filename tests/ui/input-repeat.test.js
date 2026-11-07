// Repeat training from the command card (src/ui/input.js toggleRepeat): a right-click on a train
// button sends repeatTrain to every selected finished building of that kind, with the unit to turn
// it on and without one to turn it off, and says so in the feed. Real World + ViewState, stubs, fake DOM.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { ViewState } from '../../src/game/view-state.js';
import { Selection } from '../../src/ui/hud-selection.js';
import { InputController } from '../../src/ui/input.js';
import { getCommandCard } from '../../src/ui/command-card.js';
import { makeWorld, place } from '../sim/helpers.js';
import { installFakeDom } from './fake-dom.js';

before(installFakeDom);

test('right-click on a train button turns repeat on for the selected buildings, and off again', () => {
  const world = makeWorld();
  const a = place(world, 0, 'barracks', 20, 20);
  const b = place(world, 0, 'barracks', 26, 20);
  const vs = new ViewState({ setup: world.setup, mapData: world.mapData, myIndex: 0 });
  let clock = 0;
  const push = () => vs.pushSnapshot(world.getSnapshot(), (clock += 50));
  push();
  const sel = new Selection(vs);
  const sent = [];
  const messages = [];
  const game = {
    viewState: vs, selection: sel,
    renderer: { pickEntity: () => null, screenToWorld: (x, y) => ({ x, y }), showCommandMarker() {}, hidePlacement() {}, setSelection() {}, camera: { centerOn() {}, zoomBy() {} } },
    command: (c) => sent.push(c),
    setShowAllBars() {},
  };
  const input = new InputController({ game, canvas: document.createElement('canvas'), overlayRoot: document.createElement('div') });
  game.input = input;
  game.hud = { message: (text, kind) => messages.push([text, kind]), refreshCard() {}, flashSlot() {}, openChat() {}, overlays: { open: false }, chatOpen: false, currentCard: () => [] };
  sel.set([a.id, b.id]);
  const btn = () => getCommandCard({ ids: sel.ids, activeType: 'barracks' }, vs).find((x) => x && x.id === 'train:warrior');
  input.toggleAutocast(btn());
  assert.deepEqual(sent, [
    { type: 'repeatTrain', building: a.id, unit: 'warrior' },
    { type: 'repeatTrain', building: b.id, unit: 'warrior' },
  ]);
  assert.match(messages.at(-1)[0], /^Repeating Warrior/);
  for (const c of sent) world.issueCommand(0, c);
  world.tick();
  push();
  sent.length = 0;
  input.toggleAutocast(btn());
  assert.deepEqual(sent, [{ type: 'repeatTrain', building: a.id }, { type: 'repeatTrain', building: b.id }]);
  assert.match(messages.at(-1)[0], /^No longer repeating Warrior/);
  input.dispose && input.dispose();
});
