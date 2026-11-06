// Phones and tablets: the title and Join screens say how the touch controls work
// (src/ui/menu-model.js isTouchOnly, TOUCH_NOTICE; main.js passes it to menu.setNotice).
// Fake DOM, set up as in menu-tutorial.test.js.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { FakeElement, installFakeDom } from './fake-dom.js';
import { isTouchOnly, TOUCH_NOTICE } from '../../src/ui/menu-model.js';

let menu;
before(async () => {
  installFakeDom();
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
  menu = await import('../../src/ui/menu.js');
});

const media = (q) => (query) => ({ matches: !!q[query] });

test('isTouchOnly: a coarse pointer and no fine one anywhere; a mouse or trackpad attached is enough', () => {
  assert.equal(isTouchOnly(media({ '(pointer: coarse)': true })), true, 'a phone');
  assert.equal(isTouchOnly(media({ '(pointer: coarse)': true, '(any-pointer: fine)': true })), false, 'a tablet with a trackpad');
  assert.equal(isTouchOnly(media({ '(pointer: fine)': true, '(any-pointer: fine)': true })), false, 'a computer');
  assert.equal(isTouchOnly(media({ '(pointer: fine)': true, '(any-pointer: fine)': true, '(any-pointer: coarse)': true })), false, 'a touch-screen laptop');
  assert.equal(isTouchOnly(undefined), false, 'no matchMedia: assume a computer');
  assert.equal(isTouchOnly(() => { throw new Error('nope'); }), false);
  assert.match(TOUCH_NOTICE, /tap to select.*pinch to zoom.*hold then drag/);
});

test('the notice shows on the title screen and on the Join screen an invite link opens', () => {
  const root = document.createElement('div');
  const m = menu.createMenu({ root, onStart() {} });
  m.go('title');
  m.setNotice(TOUCH_NOTICE);
  assert.match(root.textContent, /Touch controls: tap to select/, 'title');
  m.go('join', { code: 'ABCDE' });
  assert.match(root.textContent, /Touch controls: tap to select/, 'join');
  m.setNotice(null);
  assert.doesNotMatch(root.textContent, /Touch controls: tap to select/, 'cleared, and the Join screen drawn again');
  assert.ok(root.all('input').some((i) => (i.value ?? i.getAttribute('value')) === 'ABCDE'), 'the Join screen drawn again keeps the invite code');
});

test('offline: the online buttons say they need a connection, Host does not try, and they change back online', async () => {
  const { OFFLINE_NOTE, OFFLINE_SUB, isOffline } = await import('../../src/ui/menu-model.js');
  assert.equal(isOffline({ onLine: false }), true);
  assert.equal(isOffline({ onLine: true }), false);
  assert.equal(isOffline({}), false, 'unknown counts as online');
  const nav = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const handlers = {};
  const prevAdd = globalThis.window && globalThis.window.addEventListener;
  if (globalThis.window) globalThis.window.addEventListener = (t, fn) => { (handlers[t] ||= []).push(fn); };
  Object.defineProperty(globalThis, 'navigator', { value: { ...(nav && nav.value), onLine: false }, configurable: true, writable: true });
  try {
    const root = document.createElement('div');
    const m = menu.createMenu({ root, onStart() {} });
    m.go('title');
    const subs = root.all('span').filter((s) => s.textContent === OFFLINE_SUB);
    assert.equal(subs.length, 2, 'Host and Join');
    const host = root.all('button').find((b) => /Host Online Game/.test(b.textContent));
    host.click();
    assert.match(root.textContent, new RegExp(OFFLINE_NOTE.slice(0, 30)), 'a toast says why, at once');
    globalThis.navigator.onLine = true;
    for (const fn of handlers.online || []) fn();
    if (handlers.online) assert.match(host.textContent, /Invite friends with a room code/, 'back online');
  } finally {
    if (nav) Object.defineProperty(globalThis, 'navigator', nav);
    else delete globalThis.navigator;
    if (globalThis.window && prevAdd) globalThis.window.addEventListener = prevAdd;
  }
});
