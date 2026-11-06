// Offline play (sw.js, src/offline.js, DESIGN 11 "Offline"): the service worker answers from the network and
// keeps a copy, answers from the copy when the network fails, and fills the cache from precache.json on install.
// sw.js runs here in a vm context with a stand-in `self`, `caches` and `fetch`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { registerOffline } from '../../src/offline.js';

const SRC = readFileSync(new URL('../../sw.js', import.meta.url), 'utf8');
const ORIGIN = 'https://example.test';

function res(body, { status = 200, type = 'basic' } = {}) {
  return { body, status, ok: status >= 200 && status < 300, type, clone() { return res(body, { status, type }); }, json: async () => JSON.parse(body) };
}

function worker(files, { online = true } = {}) {
  const store = new Map(); // url → res
  const key = (r, ignoreSearch) => {
    const u = new URL(typeof r === 'string' ? r : r.url, `${ORIGIN}/game/`);
    return ignoreSearch ? u.origin + u.pathname : u.href;
  };
  const cache = {
    put: async (r, v) => { store.set(key(r), v); },
    match: async (r, o = {}) => {
      if (!o.ignoreSearch) return store.get(key(r));
      for (const [k, v] of store) if (k.split('?')[0] === key(r, true)) return v;
      return undefined;
    },
  };
  const net = { online, fetched: [] };
  const listeners = {};
  const self = {
    location: new URL(`${ORIGIN}/game/sw.js`),
    clients: { claim: async () => {} },
    skipWaiting: async () => {},
    addEventListener: (t, fn) => { listeners[t] = fn; },
  };
  const ctx = {
    self,
    URL,
    caches: { open: async () => cache, keys: async () => ['mythicwar-v0', 'mythicwar-v1'], delete: async (k) => net.deleted = k },
    fetch: async (r) => {
      const url = key(r, true).slice(`${ORIGIN}/game/`.length) || './';
      net.fetched.push(url);
      if (!net.online) throw new TypeError('Failed to fetch');
      return url in files ? res(files[url]) : res('', { status: 404 });
    },
  };
  vm.runInNewContext(SRC, ctx);
  const request = (path, extra = {}) => ({ url: new URL(path, `${ORIGIN}/game/`).href, method: 'GET', mode: 'cors', headers: { has: () => false }, ...extra });
  /** Run the fetch listener: its respondWith promise, or null when it let the request pass. */
  const fetchEvent = (r) => {
    let answer = null;
    listeners.fetch({ request: r, respondWith: (p) => { answer = p; } });
    return answer;
  };
  const lifecycle = async (t) => {
    let p;
    listeners[t]({ waitUntil: (x) => { p = x; } });
    await p;
  };
  return { store, net, request, fetchEvent, lifecycle };
}

test('network first: online answers come from the server and are kept; offline, the kept copy answers', async () => {
  const w = worker({ 'src/app/main-A.js': 'v1', 'index.html': '<html>' });
  const r = await w.fetchEvent(w.request('src/app/main-A.js'));
  assert.equal(r.body, 'v1');
  assert.equal(w.store.size, 1, 'kept');
  w.net.online = false;
  assert.equal((await w.fetchEvent(w.request('src/app/main-A.js'))).body, 'v1', 'from the cache');
  await assert.rejects(w.fetchEvent(w.request('src/app/never-loaded.js')), /Failed to fetch/, 'nothing kept: the error stands');
});

test('offline, the page opens by any URL from the kept start page; a 404 or a range answer is not kept', async () => {
  const w = worker({ './': '<html>', 'style.css': 'a{}' });
  await w.lifecycle('install');
  w.net.online = false;
  const page = await w.fetchEvent(w.request('?daily=2026-11-06', { mode: 'navigate' }));
  assert.equal(page.body, '<html>');
  w.net.online = true;
  await w.fetchEvent(w.request('missing.js'));
  await w.fetchEvent(w.request('style.css', { headers: { has: (h) => h === 'range' } }));
  assert.equal([...w.store.keys()].some((k) => k.includes('missing') || k.includes('style')), false);
});

test('install fills the cache from precache.json, past a missing file; activate drops old caches', async () => {
  const w = worker({ 'precache.json': JSON.stringify(['index.html', 'gone.js', 'src/app/main-A.js']), './': '<html>', 'index.html': '<html>', 'src/app/main-A.js': 'v1' });
  await w.lifecycle('install');
  assert.deepEqual([...w.store.keys()].map((k) => k.slice(`${ORIGIN}/game/`.length)).sort(), ['', 'index.html', 'src/app/main-A.js']);
  await w.lifecycle('activate');
  assert.equal(w.net.deleted, 'mythicwar-v0');
});

test('other origins and non-GETs go past the worker', () => {
  const w = worker({});
  assert.equal(w.fetchEvent({ url: 'https://0.peerjs.com/peerjs/id', method: 'GET', headers: { has: () => false } }), null);
  assert.equal(w.fetchEvent(w.request('x', { method: 'POST' })), null);
});

test('registerOffline: only on https or with ?sw, and quietly not where workers are blocked', async () => {
  const registered = [];
  const nav = { serviceWorker: { register: async (u) => registered.push(u) } };
  assert.equal(await registerOffline({ nav, loc: new URL('http://localhost:8090/index.html') }), false);
  assert.equal(await registerOffline({ nav, loc: new URL('https://x.github.io/Gods-and-titans/index.html?daily=1') }), true);
  assert.equal(await registerOffline({ nav, loc: new URL('http://localhost:8090/index.html?sw') }), true);
  assert.deepEqual(registered, ['https://x.github.io/Gods-and-titans/sw.js', 'http://localhost:8090/sw.js']);
  assert.equal(await registerOffline({ nav: {}, loc: new URL('https://x.test/') }), false, 'no service workers');
  const blocked = { serviceWorker: { register: async () => { throw new Error('SecurityError'); } } };
  assert.equal(await registerOffline({ nav: blocked, loc: new URL('https://x.test/') }), false);
});
