// Service worker (DESIGN 11 "Offline"): the installed game, or a second visit, starts without a network.
//
// Network first, always: online, every file comes from the server exactly as before (a deploy is seen at
// once, and a tab never mixes old and new modules, because the bundle's file names carry their hash). Each
// good answer is also kept in the cache, and when the network fails the kept copy answers instead. So a game
// against the computer, the campaign or a replay plays offline; an online match still needs the network.
//
// On install the files the deployed page needs to start are fetched into the cache up front, from the list
// tools/build-site.mjs writes (precache.json); the unbundled source tree has no list and caches as it goes.
// Only this origin's GETs are touched: PeerJS signalling and anything else cross-origin go past untouched.
const CACHE = 'mythicwar-v1';
const PRECACHE = 'precache.json';

/** May this answer be kept? A whole (not a partial range), successful, same-origin answer. */
function keepable(res) {
  return !!res && res.status === 200 && (res.type === 'basic' || res.type === 'default');
}

async function precache() {
  const cache = await caches.open(CACHE);
  let list = [];
  try {
    const res = await fetch(PRECACHE, { cache: 'no-store' });
    if (res.ok) list = await res.json();
  } catch {
    return; // no list (the source tree) or no network: cache as the page loads
  }
  // One at a time and forgiving: a missing file must not stop the worker from installing.
  for (const url of ['./', ...list]) {
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (keepable(res)) await cache.put(url, res);
    } catch { /* keep going */ }
  }
}

async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req);
    if (keepable(res) && !req.headers.has('range')) cache.put(req, res.clone()).catch(() => {});
    return res;
  } catch (err) {
    const hit = (await cache.match(req)) || (await cache.match(req, { ignoreSearch: true }));
    if (hit) return hit;
    // The page itself, by whatever URL it was opened (./, index.html, ?daily=…): the kept start page.
    if (req.mode === 'navigate') {
      const page = (await cache.match('./')) || (await cache.match('index.html', { ignoreSearch: true }));
      if (page) return page;
    }
    throw err;
  }
}

self.addEventListener('install', (e) => {
  e.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(networkFirst(req));
});
