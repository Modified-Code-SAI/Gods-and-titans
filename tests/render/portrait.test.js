// The live selection portrait (src/render/portrait.js, DESIGN 8 "Selection portrait") and the panel's
// side of it (src/ui/hud-info.js portraitTarget / is-live).
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { register } from 'node:module';

// Map the browser import map ('three') onto the vendored copy.
const VENDOR = new URL('../../vendor/three/', import.meta.url).href;
register(`data:text/javascript,${encodeURIComponent(`
export async function resolve(spec, ctx, next) {
  if (spec === 'three') return { url: ${JSON.stringify(`${VENDOR}three.module.js`)}, shortCircuit: true };
  return next(spec, ctx);
}`)}`);

const { portraitCamera, FRAMING, TURN_SECONDS, Portrait, PORTRAIT_LAYER } = await import('../../src/render/portrait.js');
import { ViewState } from '../../src/game/view-state.js';
import { Selection } from '../../src/ui/hud-selection.js';
import { InfoView } from '../../src/ui/hud-info.js';
import { makeWorld } from '../sim/helpers.js';
import { installFakeDom } from '../ui/fake-dom.js';

before(installFakeDom);

const pos = { x: 10, y: 0.5, z: 20 };

test('a unit is seen three-quarter from the front, at chest height', () => {
  // facing +x at rotY 0: the camera sits on the +x side, a little to the unit's side
  const c = portraitCamera('unit', pos, 1, 0.4, 0, 0);
  assert.ok(c.eye.x > pos.x, 'in front of the unit');
  assert.ok(Math.abs(c.eye.z - pos.z) > 0.1, 'turned a little off the axis');
  assert.ok(c.eye.y > c.at.y, 'a touch above, looking down');
  assert.equal(c.at.y, pos.y + FRAMING.unit.aim);
  // the unit turns: the camera turns with it (rotY = -facing; facing +z is rotY -PI/2)
  const turned = portraitCamera('unit', pos, 1, 0.4, -Math.PI / 2, 0);
  assert.ok(turned.eye.z > pos.z + 0.3, 'still in front after the unit turned to +z');
  // the same view whatever the time: a unit does not orbit
  assert.deepEqual(portraitCamera('unit', pos, 1, 0.4, 0, 99), c);
});

test('a bigger model is framed from further away, and a building turns slowly', () => {
  const d = (c) => Math.hypot(c.eye.x - c.at.x, c.eye.y - c.at.y, c.eye.z - c.at.z);
  assert.ok(d(portraitCamera('unit', pos, 4, 1.5, 0, 0)) > d(portraitCamera('unit', pos, 1, 0.4, 0, 0)) * 2, 'a titan sits further out');
  const a = portraitCamera('building', pos, 3, 2, 0, 0);
  const b = portraitCamera('building', pos, 3, 2, 0, TURN_SECONDS / 4);
  const ang = (c) => Math.atan2(c.eye.x - c.at.x, c.eye.z - c.at.z);
  const turn = (((ang(b) - ang(a)) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  assert.ok(Math.abs(turn - Math.PI / 2) < 1e-6, 'a quarter turn in a quarter of TURN_SECONDS');
  assert.ok(Math.abs(d(a) - d(b)) < 1e-9, 'at the same distance');
  for (const c of [a, b]) for (const v of [...Object.values(c.eye), ...Object.values(c.at)]) assert.ok(Number.isFinite(v));
});

test('without a real renderer or canvas the portrait draws nothing and throws nothing', () => {
  const p = new Portrait(null, null);
  assert.equal(p.draw(0), false);
  p.setTarget({ kind: 'unit', id: 3, root: { parent: {}, position: pos, rotation: { y: 0 } }, height: 1, radius: 0.4, color: '#ff0000' });
  assert.equal(p.draw(0), false, 'no canvas yet');
  p.setTarget(null);
  assert.equal(p.target, null);
  assert.equal(p.camera.layers.mask, 1 << PORTRAIT_LAYER, 'the camera sees only the portrait layer');
  p.dispose();
});

test('the selection panel asks for a portrait of a lone unit or building, and shows it once one is drawn', () => {
  const world = makeWorld({ pantheons: ['greek', 'norse'] });
  const vs = new ViewState({ setup: world.setup, mapData: world.mapData, myIndex: 0 });
  vs.pushSnapshot(world.getSnapshot(), 50);
  const sel = new Selection(vs);
  const root = document.createElement('div');
  let live = false;
  const info = new InfoView(root, { selection: sel, viewState: vs, onSelectOnly() {}, onRemove() {}, onSelectType() {}, onCancelQueue() {}, onPortrait() {}, portraitLive: () => live });
  info.update();
  assert.equal(info.portraitTarget, null, 'nothing selected');
  const worker = world.unitsOf(0).find((u) => u.type === 'worshipper');
  sel.set([worker.id]);
  info.update();
  const want = info.portraitTarget;
  assert.ok(want && want.canvas && want.id === worker.id);
  const portrait = root.find('hi-portrait');
  assert.ok(!portrait.classList.contains('is-live'), 'the icon until the first portrait lands');
  live = true;
  info.update();
  assert.ok(portrait.classList.contains('is-live'));
  const tc = world.buildingsOf(0).find((b) => b.type === 'town_center');
  sel.set([tc.id]);
  info.update();
  assert.equal(info.portraitTarget.id, tc.id);
  const others = world.unitsOf(0).filter((u) => u.type === 'worshipper').slice(0, 2).map((u) => u.id);
  sel.set(others);
  info.update();
  assert.equal(info.portraitTarget, null, 'several selected: the grid, no portrait');
});
