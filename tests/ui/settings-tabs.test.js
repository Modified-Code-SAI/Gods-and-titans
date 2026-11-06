// The title Settings screen's tabs (src/ui/menu.js settingsPages): one page shown, the others kept hidden, and the
// last tab coming back when the screen opens again. Fake DOM.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { FakeElement, installFakeDom } from './fake-dom.js';

let settingsPages;
before(async () => {
  installFakeDom();
  globalThis.Node = FakeElement; // menu-dom's h tells children from attributes with instanceof Node
  ({ settingsPages } = await import('../../src/ui/menu.js'));
});

const shown = (o) => o.pages.filter((p) => !p.hidden).map((p) => p.dataset.id);

test('one page at a time, and the tab picked last opens next time', () => {
  const field = () => document.createElement('div');
  const list = () => [['general', 'General', [field(), null]], ['look', 'Graphics', [field()]], ['keys', 'Keys', [field()]]];
  let o = settingsPages(list());
  assert.deepEqual(shown(o), ['general']);
  assert.equal(o.pages[0].children.length, 1, 'an empty field is left out');
  assert.deepEqual(o.tabs.children.map((b) => b.textContent), ['General', 'Graphics', 'Keys']);
  o.tabs.children[1].click();
  assert.deepEqual(shown(o), ['look']);
  assert.equal(o.tabs.children[1].getAttribute('aria-selected'), 'true');
  o = settingsPages(list());
  assert.deepEqual(shown(o), ['look']);
});
