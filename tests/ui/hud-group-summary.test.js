// The group selection panel's summary column (src/ui/hud-info.js buildSummary): the count, the health of the
// whole selection and one chip per type that selects only that type. Real World + ViewState, the fake DOM.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { ViewState } from '../../src/game/view-state.js';
import { Selection } from '../../src/ui/hud-selection.js';
import { InfoView } from '../../src/ui/hud-info.js';
import { makeWorld, spawn } from '../sim/helpers.js';
import { installFakeDom } from './fake-dom.js';

before(installFakeDom);

test('the summary counts the selection, adds up its health and offers a chip per type', () => {
  const world = makeWorld({ pantheons: ['norse', 'greek'] });
  const tc = world.buildingsOf(0).find((b) => b.type === 'town_center');
  const a = spawn(world, 0, 'warrior', tc.x + 4, tc.y + 5);
  const b = spawn(world, 0, 'warrior', tc.x + 5, tc.y + 5);
  const c = spawn(world, 0, 'archer', tc.x + 6, tc.y + 5);
  a.hp -= 100;
  const vs = new ViewState({ setup: world.setup, mapData: world.mapData, myIndex: 0 });
  vs.pushSnapshot(world.getSnapshot(), 50);
  const sel = new Selection(vs);
  sel.set([a.id, b.id, c.id]);
  const picked = [];
  const root = document.createElement('div');
  const info = new InfoView(root, { selection: sel, viewState: vs, onSelectOnly() {}, onRemove() {}, onSelectType: (t) => picked.push(t), onCancelQueue() {}, onPortrait() {} });
  info.update();
  assert.equal(root.find('hi-sum-head').children[0].textContent, '3');
  const max = a.maxHp + b.maxHp + c.maxHp;
  const hp = a.hp + b.hp + c.hp;
  assert.equal(root.find('hi-sum-hp').textContent, `${hp.toLocaleString('en-US')} / ${max.toLocaleString('en-US')}`);
  const chips = root.findAll('hi-sum-type');
  assert.deepEqual(chips.map((n) => n.find('hi-sum-n').textContent), ['2', '1']);
  chips[1].listeners.get('click')[0]({});
  assert.deepEqual(picked, ['archer']);
});
