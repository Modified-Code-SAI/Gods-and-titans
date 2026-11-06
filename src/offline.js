// Offline play (DESIGN 11 "Offline"): register the service worker (sw.js at the site root), which keeps a copy
// of every file the game loads so the next start works without a network. Only on the deployed (https) site,
// or with ?sw on a local server, so the tools and tests that serve the repo over http stay as they were.

/**
 * @param {object} [o]
 * @param {Navigator} [o.nav]
 * @param {Location} [o.loc]
 * @returns {Promise<boolean>} whether a worker was registered
 */
export async function registerOffline({ nav = globalThis.navigator, loc = globalThis.location } = {}) {
  if (!nav || !nav.serviceWorker || !loc) return false;
  const wanted = loc.protocol === 'https:' || /[?&]sw\b/.test(loc.search || '');
  if (!wanted) return false;
  try {
    // next to index.html (the page's own folder: the Pages project folder), whose scope is the whole game
    await nav.serviceWorker.register(new URL('sw.js', loc.href).href);
    return true;
  } catch {
    return false; // a private window or a blocked origin: the game simply needs the network
  }
}
