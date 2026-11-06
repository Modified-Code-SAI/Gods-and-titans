// What's New (src/data/whats-new.js): the newest update is unread until opened, then the badge goes; an update
// added on top brings it back; the screen lists every update and marks the unread ones. Fake DOM and storage.
import { test, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { NEWS, hasUnreadNews, unreadNews, markNewsSeen, newsSeen } from '../../src/data/whats-new.js';
import { installFakeDom, FakeElement } from './fake-dom.js';

const mem = new Map();
let menuRoot;
let showMenu;
before(async () => {
  installFakeDom();
  globalThis.localStorage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) };
  globalThis.Node = class {
    static [Symbol.hasInstance](x) {
      return !!x && (x.nodeType === 1 || x.nodeType === 3);
    }
  };
  const anything = () => new Proxy(function () {}, { get: (_, k) => (k === Symbol.toPrimitive ? () => 0 : anything()), apply: () => anything() });
  FakeElement.prototype.getContext = function getContext() {
    this.ctxAny = this.ctxAny || anything();
    return this.ctxAny;
  };
  FakeElement.prototype.querySelectorAll = () => [];
  globalThis.requestAnimationFrame = () => 0;
  globalThis.cancelAnimationFrame = () => {};
  const menu = await import('../../src/ui/menu.js');
  menuRoot = document.createElement('div');
  menu.createMenu({ root: menuRoot, onStart() {} });
  showMenu = menu.showMenu;
});
beforeEach(() => mem.clear());

test('every update has an id of its own, a date, a title and plain items', () => {
  assert.ok(NEWS.length > 0);
  assert.equal(new Set(NEWS.map((n) => n.id)).size, NEWS.length);
  for (const n of NEWS) {
    assert.ok(n.date && n.title && n.items.length, n.id);
    for (const t of n.items) assert.ok(t.length > 10 && t.length < 160 && /[.!]$/.test(t), t);
  }
});

test('unread until opened; an update added later is unread again', () => {
  assert.equal(newsSeen(), null);
  assert.equal(hasUnreadNews(), true);
  assert.equal(unreadNews().length, NEWS.length, 'a first visit: all of them');
  markNewsSeen();
  assert.equal(hasUnreadNews(), false);
  assert.deepEqual(unreadNews(), []);
  if (NEWS.length > 1) assert.deepEqual(unreadNews(NEWS[1].id).map((n) => n.id), [NEWS[0].id], 'one behind: the newest only');
});

test('the title screen badges What\'s New until the screen is opened', () => {
  showMenu('title');
  const btn = () => menuRoot.findAll('mw-news-btn')[0];
  assert.ok(btn().find('mw-news-dot'), 'a dot for the unread update');
  btn().click();
  const panel = menuRoot.find('mw-news-panel');
  assert.equal(panel.findAll('mw-news').length, NEWS.length);
  assert.equal(panel.findAll('is-unread').length, NEWS.length);
  assert.equal(newsSeen(), NEWS[0].id);
  showMenu('title');
  assert.equal(btn().find('mw-news-dot'), null, 'read: no dot');
});
