// Styled hover tips (src/ui/hover-tip.js): how a title splits, and where the card goes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tipParts, tipPlace } from '../../src/ui/hover-tip.js';

test('a "Name — what it does" title heads with the name', () => {
  assert.deepEqual(tipParts('Gold — mined by Worshippers at gold mines\nYour Worshippers bring in about 120 a minute.'), {
    head: 'Gold',
    lines: ['Mined by Worshippers at gold mines', 'Your Worshippers bring in about 120 a minute.'],
  });
});

test('several lines head with the first; one plain line is all body; nothing is nothing', () => {
  assert.deepEqual(tipParts('Relics\nOwl of Athena: +10% faith'), { head: 'Relics', lines: ['Owl of Athena: +10% faith'] });
  assert.deepEqual(tipParts('Open the game menu'), { head: '', lines: ['Open the game menu'] });
  assert.deepEqual(tipParts(''), { head: '', lines: [] });
  assert.deepEqual(tipParts(null), { head: '', lines: [] });
  const long = 'A sentence that runs on for a long while — and has a dash far in';
  assert.equal(tipParts(long).head, '', 'a dash deep in a sentence is not a heading');
});

const view = { w: 1600, h: 900 };
const size = { w: 300, h: 80 };

test('top-bar elements get the card under them, bottom-bar ones over them', () => {
  const top = tipPlace({ left: 1220, right: 1290, top: 4, bottom: 28 }, size, view);
  assert.equal(top.below, true);
  assert.equal(top.y, 36);
  const low = tipPlace({ left: 230, right: 260, top: 760, bottom: 790 }, size, view);
  assert.equal(low.below, false);
  assert.equal(low.y, 760 - 8 - 80);
});

test('the card stays inside the window at the edges', () => {
  const right = tipPlace({ left: 1560, right: 1596, top: 4, bottom: 28 }, size, view);
  assert.equal(right.x, 1600 - 8 - 300);
  const left = tipPlace({ left: 0, right: 30, top: 4, bottom: 28 }, size, view);
  assert.equal(left.x, 8);
  const tall = tipPlace({ left: 700, right: 760, top: 300, bottom: 330 }, { w: 300, h: 600 }, view);
  assert.ok(tall.y >= 8 && tall.y + 600 <= 892, JSON.stringify(tall));
});
