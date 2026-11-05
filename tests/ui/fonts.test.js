import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const root = new URL('../../', import.meta.url);
const read = (p) => readFile(new URL(p, root), 'utf8');

test('the bundled typefaces: every face points at a woff2 file that ships, with an OFL licence beside it', async () => {
  const css = await read('vendor/fonts/fonts.css');
  const faces = css.match(/@font-face \{[^}]*\}/g);
  assert.ok(faces && faces.length >= 10);
  const families = new Set();
  for (const f of faces) {
    families.add(f.match(/font-family: '([^']+)'/)[1]);
    assert.match(f, /font-display: swap/);
    assert.match(f, /unicode-range:/);
    for (const [, file] of f.matchAll(/url\(\.\/([^)]+\.woff2)\)/g)) {
      const s = await stat(new URL(`vendor/fonts/${file}`, root));
      assert.ok(s.size > 5000, `${file} is a real font file`);
    }
  }
  assert.deepEqual([...families].sort(), ['Mythic Body', 'Mythic Display', 'Mythic UI']);
  for (const lic of ['Cinzel', 'EBGaramond', 'Inter']) assert.match(await read(`vendor/fonts/${lic}-OFL.txt`), /SIL Open Font License/);
});

test('the page loads the faces before its own styles, and each font stack starts with its bundled face', async () => {
  const html = await read('index.html');
  assert.ok(html.indexOf('vendor/fonts/fonts.css') > 0 && html.indexOf('vendor/fonts/fonts.css') < html.indexOf('href="style.css"'));
  for (const [, href] of html.matchAll(/rel="preload" href="([^"]+)"/g)) await stat(new URL(href, root));
  const css = await read('style.css');
  assert.match(css, /--mw-font-display: 'Mythic Display',/);
  assert.match(css, /--mw-font-body: 'Mythic Body',/);
  assert.match(css, /--mw-font-ui: 'Mythic UI',/);
});

test('the Pages deploy copies the vendor folder the fonts live in', async () => {
  assert.match(await read('.github/workflows/pages.yml'), /cp -r [^\n]*\bvendor\b/);
});
