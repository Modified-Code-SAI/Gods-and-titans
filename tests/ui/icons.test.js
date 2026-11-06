// Painted icons in place of emoji (src/ui/icons.js, src/ui/icon-map.js, DESIGN 9 "Icons").
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ICON_MAP } from '../../src/ui/icon-map.js';
import { ICON_PATHS } from '../../src/ui/icon-paths.js';
import { TINTS, iconFor, hasIcon, iconVar, ICON_RE } from '../../src/ui/icons.js';
import { roundPath } from '../../tools/build-icons.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

function files(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : p.endsWith('.js') ? [p] : [];
  });
}

/** Emoji pictographs (not the typographic marks the HUD uses as text: ✓ ✕ ✖ ★ ✦ arrows, ⏸ ⏮ ☰ ♪ ❚ …). */
const PICTO = /\p{Extended_Pictographic}/gu;
const TEXT_MARKS = new Set(['✓', '✕', '✖', '★', '✦', '❚', '↻', '⌖', '♪', '☰', '⏸', '⏮', '↑', '↓', '←', '→', '↔', '⚜', '•', '©', '®', '™', '‼', '⁉', '↗', '↘', '▶', '◀', '⬅', '➜', '✔', '✗', '❖', '❯', '❮', '✧', '⌛']);

test('every emoji the data, HUD and menus show has a painted icon', () => {
  const missing = new Map();
  for (const f of [...files(join(root, 'src/data')), ...files(join(root, 'src/ui')), ...files(join(root, 'src/game'))]) {
    if (f.endsWith('icon-map.js') || f.endsWith('icon-paths.js')) continue;
    const text = readFileSync(f, 'utf8');
    for (const m of text.matchAll(PICTO)) {
      const e = m[0];
      if (TEXT_MARKS.has(e) || ICON_MAP[e]) continue;
      missing.set(e, f.slice(root.length + 1));
    }
  }
  assert.deepEqual([...missing], [], 'emoji without an entry in src/ui/icon-map.js');
});

test('every mapped icon has a path and a known tint', () => {
  for (const [e, [name, tint]] of Object.entries(ICON_MAP)) {
    assert.ok(ICON_PATHS[name], `${e}: no path for ${name} (run tools/build-icons.mjs)`);
    assert.ok(TINTS[tint], `${e}: unknown tint ${tint}`);
    assert.ok(!e.includes('️'), `${e}: write keys without the variation selector`);
  }
  const used = new Set(Object.values(ICON_MAP).map(([n]) => n));
  assert.deepEqual(Object.keys(ICON_PATHS).filter((n) => !used.has(n)), [], 'icon-paths.js holds icons nothing uses');
});

test('lookups ignore the variation selector, and only mapped emoji count', () => {
  assert.deepEqual(iconFor('🛡️'), iconFor('🛡'));
  assert.ok(iconFor('⚔️'));
  assert.equal(iconFor('Z'), null);
  assert.equal(iconFor(undefined), null);
  assert.ok(hasIcon('💰 400'));
  assert.ok(!hasIcon('400 gold ✓'));
  const parts = '⚔️ Attack 🛡 Hold'.match(ICON_RE);
  assert.deepEqual(parts, ['⚔️', '🛡']);
});

test('iconVar is an SVG data url with the icon, cached per icon', () => {
  const v = iconVar('🔥');
  assert.match(v, /^url\("data:image\/svg\+xml,/);
  assert.ok(decodeURIComponent(v).includes(ICON_PATHS.flame.slice(0, 40)));
  assert.equal(iconVar('🔥'), v);
  assert.equal(iconVar('nope'), null);
});

test('rounded paths keep relative commands from drifting', () => {
  // 200 relative steps of 0.4 each: rounding every step alone would lose all 80 units
  const d = `M10.2 10.2${'l0.4 0.4'.repeat(200)}z`;
  const r = roundPath(d);
  let x = 0;
  let y = 0;
  for (const [, c, a, b] of r.matchAll(/([mlML])(-?\d+)[ ,]?(-?\d+)/g)) {
    if (c === 'M') [x, y] = [Number(a), Number(b)];
    else { x += Number(a); y += Number(b); }
  }
  assert.ok(Math.abs(x - 90.2) <= 1 && Math.abs(y - 90.2) <= 1, `ended at ${x},${y}`);
  // arcs with packed flags ("a5 5 0 01 10 0") parse
  assert.equal(roundPath('M0 0a5 5 0 01 10.4 0z'), 'm0 0a5 5 0 0 1 10 0z');
});
