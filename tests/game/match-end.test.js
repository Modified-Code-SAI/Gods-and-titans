// The ending (src/game/match-end.js, src/ui/hud-ending.js, DESIGN 9 "The ending").
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { FallTracker, endingWords, ENDING_MS } from '../../src/game/match-end.js';
import { playEnding, SKIP_AFTER_MS } from '../../src/ui/hud-ending.js';
import { installFakeDom } from '../ui/fake-dom.js';

before(installFakeDom);

const teamOf = (o) => [1, 2, 2][o];
const fall = (o, x, y, k = 'b') => ({ type: 'death', id: 1, o, x, y, k });

test('the camera looks at the losers\' last fallen building, or mine when I lost', () => {
  const f = new FallTracker();
  assert.equal(f.focus('victory', 1), null, 'nothing fell: the camera stays');
  f.note(fall(1, 10, 10), teamOf, 5);
  f.note(fall(0, 50, 50), teamOf, 6); // my team (1) loses a building
  f.note(fall(2, 30, 30), teamOf, 9);
  f.note(fall(1, 99, 99, 'u'), teamOf, 10); // a unit: not counted
  f.note(fall(-1, 70, 70), teamOf, 11); // a neutral: not counted
  f.note({ type: 'hit', o: 1, x: 1, y: 1, k: 'b' }, teamOf, 12);
  assert.deepEqual(f.focus('victory', 1), { x: 30, y: 30 }, 'the enemy team\'s most recent fall');
  assert.deepEqual(f.focus('defeat', 1), { x: 50, y: 50 }, 'my team\'s last fall');
  assert.deepEqual(f.focus('draw', 1), { x: 30, y: 30 }, 'the most recent of all');
  f.note(fall(2, 40, 41), teamOf, 20);
  assert.deepEqual(f.focus('victory', 1), { x: 40, y: 41 }, 'later falls replace earlier ones');
});

test('the carved words fit the result', () => {
  assert.deepEqual(endingWords({ result: 'victory' }).title, 'Victory');
  assert.deepEqual(endingWords({ result: 'defeat' }).title, 'Defeat');
  assert.deepEqual(endingWords({ result: 'draw' }).title, 'Draw');
  assert.deepEqual(endingWords({ result: 'survival', wave: 7 }).title, 'Wave 7');
  assert.deepEqual(endingWords({ result: 'victory', mission: true }).title, 'Mission Complete');
  assert.deepEqual(endingWords({ result: 'defeat', mission: true }).title, 'Mission Failed');
  assert.deepEqual(endingWords({ result: 'victory', tutorial: true }).title, 'Lesson Complete');
  assert.match(endingWords({ result: 'victory', how: 'sacred' }).line, /sacred sites are yours/);
  for (const r of ['victory', 'defeat', 'draw', 'survival']) assert.ok(endingWords({ result: r }).line.length > 0);
});

test('the ending sits over the HUD, then hands over once, by its timer or a late press', () => {
  const realTimeout = globalThis.setTimeout;
  const realClear = globalThis.clearTimeout;
  const realNow = Date.now;
  const timers = [];
  globalThis.setTimeout = (fn, ms) => timers.push({ fn, ms }) - 1;
  globalThis.clearTimeout = (i) => { if (timers[i]) timers[i].fn = null; };
  let now = 1000;
  Date.now = () => now;
  try {
    const root = document.createElement('div');
    root.appendChild(document.createElement('div')); // a HUD panel
    let done = 0;
    const end = playEnding(root, { title: 'Victory', line: 'x' }, 'victory', ENDING_MS, () => done++);
    assert.ok(root.classList.contains('is-ending'));
    assert.match(end.el.className, /\bis-victory\b/);
    assert.equal(end.el.parentNode, root);
    assert.equal(timers[0].ms, ENDING_MS);
    end.el.dispatchEvent?.({ type: 'pointerdown' });
    assert.equal(done, 0, 'a press at once is not a skip');
    now += SKIP_AFTER_MS + 1;
    end.skip();
    assert.equal(done, 1);
    assert.equal(root.classList.contains('is-ending'), false);
    assert.equal(end.el.parentNode, null);
    if (timers[0].fn) timers[0].fn();
    end.skip();
    assert.equal(done, 1, 'only once');

    const second = playEnding(root, { title: 'Defeat', line: 'y' }, 'defeat', 50, () => done++);
    timers[timers.length - 1].fn();
    assert.equal(done, 2, 'the timer hands over');
    second.dispose();
  } finally {
    globalThis.setTimeout = realTimeout;
    globalThis.clearTimeout = realClear;
    Date.now = realNow;
  }
});
