// The game's own drop-down list for the menus' selects (src/ui/select-menu.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { menuItems, nextEnabled } from '../../src/ui/select-menu.js';

const fakeSelect = (value, opts) => ({ value, options: opts.map(([v, label, disabled]) => ({ value: v, textContent: label, disabled: !!disabled })) });

test('a select\'s options become rows, the current one marked', () => {
  const s = fakeSelect('ai-hard', [['open', 'Open'], ['ai-easy', 'AI — Easy'], ['ai-hard', 'AI — Hard'], ['closed', 'Closed', true]]);
  const rows = menuItems(s);
  assert.deepEqual(rows.map((r) => r.label), ['Open', 'AI — Easy', 'AI — Hard', 'Closed']);
  assert.deepEqual(rows.map((r) => r.selected), [false, false, true, false]);
  assert.equal(rows[3].disabled, true);
  assert.deepEqual(menuItems(null), []);
});

test('arrow keys skip rows that cannot be picked and stop at the ends', () => {
  const rows = [{ disabled: false }, { disabled: true }, { disabled: false }, { disabled: true }];
  assert.equal(nextEnabled(rows, 0, 1), 2);
  assert.equal(nextEnabled(rows, 2, 1), 2, 'nothing below: stays');
  assert.equal(nextEnabled(rows, 2, -1), 0);
  assert.equal(nextEnabled(rows, -1, 1), 0, 'Home');
  assert.equal(nextEnabled(rows, rows.length, -1), 2, 'End');
});
