// Installable on a phone or tablet (DESIGN 2): the web app manifest, its icons, and the tags index.html links it with.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const root = new URL('../../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');

test('the manifest opens the game full screen in landscape, and every icon it names exists', () => {
  const m = JSON.parse(read('manifest.webmanifest'));
  assert.equal(m.short_name, 'Mythic War');
  assert.equal(m.display, 'fullscreen');
  assert.equal(m.orientation, 'landscape');
  assert.equal(m.start_url, './index.html');
  assert.ok(m.icons.some((i) => i.sizes === '192x192') && m.icons.some((i) => i.sizes === '512x512'), 'the two sizes an install needs');
  assert.ok(m.icons.some((i) => i.purpose === 'maskable'));
  for (const i of m.icons) assert.ok(existsSync(new URL(i.src, root)), i.src);
});

test('index.html links the manifest, the home-screen icon and the theme colour; the site build copies the manifest', () => {
  const html = read('index.html');
  assert.match(html, /<link rel="manifest" href="manifest\.webmanifest">/);
  assert.match(html, /<link rel="apple-touch-icon" href="assets\/icons\/apple-touch-icon\.png">/);
  assert.match(html, /<meta name="theme-color" content="#[0-9a-f]{6}">/);
  assert.ok(existsSync(new URL('assets/icons/apple-touch-icon.png', root)));
  assert.match(read('tools/build-site.mjs'), /'manifest\.webmanifest'/);
});
