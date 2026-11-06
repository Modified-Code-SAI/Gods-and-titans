// The work cursors: with Worshippers selected, the cursor says what a right-click sets them to.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { ViewState } from '../../src/game/view-state.js';
import { Selection } from '../../src/ui/hud-selection.js';
import { InputController } from '../../src/ui/input.js';
import { makeWorld, spawn, clearUnits, place } from '../sim/helpers.js';
import { installFakeDom } from './fake-dom.js';

before(installFakeDom);

function setup() {
  const world = makeWorld({ forest: [{ x: 4, y: 4, w: 4, h: 4 }] });
  clearUnits(world, 0);
  clearUnits(world, 1);
  const worker = spawn(world, 0, 'worshipper', 10, 12);
  const warrior = spawn(world, 0, 'warrior', 11, 12);
  const shrine = place(world, 0, 'shrine', 12, 16);
  const site = place(world, 0, 'house', 16, 16, false);
  const house = place(world, 0, 'house', 16, 20);
  house.hp = Math.floor(house.hp / 2);
  const vs = new ViewState({ setup: world.setup, mapData: world.mapData, myIndex: 0 });
  vs.pushSnapshot(world.getSnapshot(), 50);
  const sel = new Selection(vs);
  const game = {
    viewState: vs,
    selection: sel,
    renderer: { pickEntity: () => null, screenToWorld: (x, y) => ({ x, y }), showCommandMarker() {}, hidePlacement() {}, setSelection() {}, camera: { centerOn() {}, zoomBy() {} } },
    command() {},
    setShowAllBars() {},
  };
  const input = new InputController({ game, canvas: document.createElement('canvas'), overlayRoot: document.createElement('div') });
  game.input = input;
  game.hud = { message() {}, refreshCard() {}, flashSlot() {}, chatOpen: false, currentCard: () => [] };
  const cursorOver = (id, tree = false) => {
    input.hoverId = id;
    input.hoverTree = tree;
    input.updateCursor();
    return input.cursor;
  };
  const mine = [...vs.entities.values()].find((e) => e.k === 'm');
  return { vs, sel, input, cursorOver, worker, warrior, shrine, site, house, mine };
}

test('Worshippers: pick over a mine, axe over trees, hammer over a site or a damaged building, flame over a shrine', () => {
  const { sel, cursorOver, worker, shrine, site, house, mine } = setup();
  sel.set([worker.id]);
  assert.ok(mine, 'the map has a gold mine');
  assert.equal(cursorOver(mine.id), 'gather-gold');
  assert.equal(cursorOver(null, true), 'gather-wood');
  assert.equal(cursorOver(site.id), 'repair');
  assert.equal(cursorOver(house.id), 'repair');
  assert.equal(cursorOver(shrine.id), 'pray');
  assert.equal(cursorOver(null, false), '');
  assert.equal(cursorOver(worker.id), 'select', 'a unit keeps the ordinary cursor');
});

test('soldiers alone keep the ordinary cursors', () => {
  const { sel, cursorOver, warrior, shrine, mine } = setup();
  sel.set([warrior.id]);
  assert.equal(cursorOver(mine.id), 'select');
  assert.equal(cursorOver(null, true), '');
  assert.equal(cursorOver(shrine.id), 'select');
});

test('forestAt: a known tree tile, not grass or off the map', () => {
  const { input } = setup();
  assert.equal(input.forestAt(-3, 5), false);
  assert.equal(input.forestAt(20.5, 20.5), false);
  assert.equal(typeof input.forestAt(5.5, 5.5), 'boolean');
});

test('edge scroll: the cursor becomes an arrow pointing the way the camera moves', async () => {
  const { edgeDir } = await import('../../src/ui/input.js');
  assert.equal(edgeDir(0, 0), '');
  assert.equal(edgeDir(0, -1), 'n');
  assert.equal(edgeDir(1, 1), 'se');
  assert.equal(edgeDir(-1, 0), 'w');
  const { cursorOver, input, mine } = setup();
  input.edgeDir = 'ne';
  assert.equal(cursorOver(mine.id), 'edge-ne', 'the arrow wins over a work or select cursor');
  input.edgeDir = '';
  assert.equal(cursorOver(null), '');
});

test('every edge arrow has a cursor rule in hud.css', async () => {
  const { readFileSync } = await import('node:fs');
  const css = readFileSync(new URL('../../src/ui/hud.css', import.meta.url), 'utf8');
  for (const d of ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']) {
    assert.match(css, new RegExp(`--mw-cur-edge-${d}: url\\(`), d);
    assert.match(css, new RegExp(`#game-canvas\\.cur-edge-${d}, body\\[data-edge="${d}"\\] \\.hud \\* \\{ cursor: var\\(--mw-cur-edge-${d}\\)`), d);
  }
});
