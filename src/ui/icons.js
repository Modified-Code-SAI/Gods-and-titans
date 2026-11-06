// Painted icons in place of emoji (DESIGN 9, "Icons").
//
// The game's data and HUD name icons with emoji. Every emoji in src/ui/icon-map.js is drawn here instead as
// a game-icons.net silhouette (CC BY 3.0, vendor/game-icons/LICENSE.md) with a gilded or tinted fill and a dark
// outline, so a button looks the same on every system and matches the carved HUD.
//
// - watchIcons(root): swaps emoji in every text node under root, now and whenever the HUD or menus write
//   new text. The emoji stays in the page as hidden text inside the icon, so textContent (the HUD's
//   "set only when changed" checks, tests, screen readers) still reads the emoji.
// - iconVar(emoji): a CSS url() for the stylesheet's ::before emblems (feed cards, taunts), drawn from
//   attr(data-icon) before this pass; null when the emoji has no painted icon.
// - drawIcon(ctx, emoji, x, y, size): the icon on a 2D canvas (the minimap's team marks).
import { ICON_MAP } from './icon-map.js';
import { ICON_PATHS } from './icon-paths.js';

/** Fill colours per tint: [top, bottom] of the vertical gradient, then the outline. */
export const TINTS = {
  gold: ['#fff1b8', '#d9952a', '#2a1704'],
  bronze: ['#f6d7a4', '#a8642c', '#24130a'],
  pale: ['#ffffff', '#c9c2b2', '#1d1a16'],
  stone: ['#eef1f4', '#8b939e', '#15181c'],
  green: ['#d9f59a', '#4f9a35', '#0e1d08'],
  fire: ['#ffe27a', '#e2461b', '#2a0b02'],
  water: ['#c8f1ff', '#2f86c9', '#061827'],
  sky: ['#f1fbff', '#7fb2d8', '#0d1a26'],
  violet: ['#ecd3ff', '#8150c4', '#170a26'],
  blood: ['#ffb39a', '#b8231c', '#250605'],
};

const VS = '️';
const keys = Object.keys(ICON_MAP).sort((a, b) => b.length - a.length);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** Any mapped emoji, with or without its variation selector. */
export const ICON_RE = new RegExp(`(?:${keys.map(esc).join('|')})${VS}?`, 'gu');
const ANY_RE = new RegExp(ICON_RE.source, 'u');

/** [game-icons name, tint] for an emoji (variation selector ignored), or null. */
export function iconFor(emoji) {
  if (typeof emoji !== 'string') return null;
  return ICON_MAP[emoji.replace(VS, '')] || null;
}

/** True when the text holds at least one emoji that has a painted icon. */
export function hasIcon(text) {
  return typeof text === 'string' && ANY_RE.test(text);
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const OUTLINE = 22; // outline width in the icons' 512-unit box (behind the fill, so ~11 shows)

let defsDoc = null;
/** One hidden <svg> with a gradient per tint, shared by every icon on the page. */
function ensureDefs(doc) {
  if (defsDoc === doc && doc.getElementById('mw-ico-defs')) return;
  defsDoc = doc;
  if (doc.getElementById('mw-ico-defs')) return;
  const svg = doc.createElementNS(SVG_NS, 'svg');
  svg.id = 'mw-ico-defs';
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.position = 'absolute';
  const defs = doc.createElementNS(SVG_NS, 'defs');
  for (const [tint, [top, bottom]] of Object.entries(TINTS)) {
    const g = doc.createElementNS(SVG_NS, 'linearGradient');
    g.id = `mw-ico-${tint}`;
    g.setAttribute('x1', '0');
    g.setAttribute('y1', '0');
    g.setAttribute('x2', '0');
    g.setAttribute('y2', '1');
    for (const [off, col] of [['0', top], ['0.55', mix(top, bottom, 0.45)], ['1', bottom]]) {
      const s = doc.createElementNS(SVG_NS, 'stop');
      s.setAttribute('offset', off);
      s.setAttribute('stop-color', col);
      g.appendChild(s);
    }
    defs.appendChild(g);
  }
  svg.appendChild(defs);
  (doc.body || doc.documentElement).appendChild(svg);
}

function mix(a, b, t) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `#${x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
}

/** A painted icon element for one emoji (with the emoji kept as hidden text), or null when it has none. */
export function iconNode(emoji, doc = document) {
  const hit = iconFor(emoji);
  if (!hit) return null;
  const [name, tint] = hit;
  const d = ICON_PATHS[name];
  if (!d) return null;
  ensureDefs(doc);
  const span = doc.createElement('span');
  span.className = `mw-ico t-${tint}`;
  span.dataset.ico = name;
  const svg = doc.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 512 512');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const path = doc.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', d);
  path.setAttribute('fill', `url(#mw-ico-${tint})`);
  path.setAttribute('stroke', TINTS[tint][2]);
  path.setAttribute('stroke-width', String(OUTLINE));
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute('paint-order', 'stroke');
  svg.appendChild(path);
  const alt = doc.createElement('span');
  alt.className = 'mw-ico-alt';
  alt.textContent = emoji;
  span.append(svg, alt);
  return span;
}

/** Elements whose text must stay plain (form controls can't hold markup; code and styles aren't words). */
const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'OPTGROUP', 'TITLE', 'svg', 'SVG']);

function skipped(node) {
  for (let n = node.parentNode; n && n.nodeType === 1; n = n.parentNode) {
    if (SKIP.has(n.nodeName) || n.isContentEditable) return true;
    const c = n.classList;
    if (c && (c.contains('mw-ico') || c.contains('mw-noicons'))) return true;
  }
  return false;
}

/** Replace the mapped emoji in one text node with icons. Returns true when it changed anything. */
export function iconifyText(node) {
  const text = node.nodeValue;
  if (!text || !hasIcon(text) || !node.parentNode || skipped(node)) return false;
  const doc = node.ownerDocument;
  const frag = doc.createDocumentFragment();
  let last = 0;
  ICON_RE.lastIndex = 0;
  for (let m = ICON_RE.exec(text); m; m = ICON_RE.exec(text)) {
    const ico = iconNode(m[0], doc);
    if (!ico) continue;
    if (m.index > last) frag.appendChild(doc.createTextNode(text.slice(last, m.index)));
    frag.appendChild(ico);
    last = m.index + m[0].length;
  }
  if (last === 0) return false;
  if (last < text.length) frag.appendChild(doc.createTextNode(text.slice(last)));
  node.parentNode.replaceChild(frag, node);
  return true;
}

/** Swap emoji under a node (an element, or a single text node). */
export function iconify(root) {
  if (!root) return;
  if (root.nodeType === 3) {
    iconifyText(root);
    return;
  }
  if (root.nodeType !== 1 && root.nodeType !== 11) return;
  if (!hasIcon(root.textContent)) return;
  const doc = root.ownerDocument || root;
  const walker = doc.createTreeWalker(root, 4 /* NodeFilter.SHOW_TEXT */);
  const hits = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) if (hasIcon(n.nodeValue)) hits.push(n);
  for (const n of hits) iconifyText(n);
}

/**
 * Keep swapping emoji under root as the page changes. Returns the MutationObserver (disconnect() stops it),
 * or null where there is none (node tests).
 */
export function watchIcons(root) {
  if (!root || typeof MutationObserver === 'undefined') return null;
  iconify(root);
  const mo = new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === 'characterData') iconify(r.target);
      else for (const n of r.addedNodes) if (n.isConnected) iconify(n);
    }
  });
  mo.observe(root, { childList: true, subtree: true, characterData: true });
  return mo;
}

const urlCache = new Map();
/** CSS url() of the painted icon as an SVG image (gradient and outline baked in), or null. */
export function iconVar(emoji) {
  const hit = iconFor(emoji);
  if (!hit) return null;
  const key = hit.join('|');
  let url = urlCache.get(key);
  if (!url) {
    const [name, tint] = hit;
    const [top, bottom, line] = TINTS[tint];
    const svg = `<svg xmlns="${SVG_NS}" viewBox="0 0 512 512"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="0.55" stop-color="${mix(top, bottom, 0.45)}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><path d="${ICON_PATHS[name]}" fill="url(#g)" stroke="${line}" stroke-width="${OUTLINE}" stroke-linejoin="round" paint-order="stroke"/></svg>`;
    url = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    urlCache.set(key, url);
  }
  return url;
}

/** Set (or clear) an element's --ico from an emoji, for the ::before emblems. */
export function setIconVar(el, emoji) {
  const v = iconVar(emoji);
  if (v) el.style.setProperty('--ico', v);
  else if (el.style.removeProperty) el.style.removeProperty('--ico');
  el.classList.toggle('has-ico', !!v);
}

const pathCache = new Map();
/** Draw an emoji's icon centred at x, y, `size` pixels across, on a 2D canvas. False when it has none. */
export function drawIcon(ctx, emoji, x, y, size) {
  const hit = iconFor(emoji);
  if (!hit || typeof Path2D === 'undefined') return false;
  const [name, tint] = hit;
  let p = pathCache.get(name);
  if (!p) {
    p = new Path2D(ICON_PATHS[name]);
    pathCache.set(name, p);
  }
  const [top, bottom, line] = TINTS[tint];
  const k = size / 512;
  ctx.save();
  ctx.translate(x - size / 2, y - size / 2);
  ctx.scale(k, k);
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.lineJoin = 'round';
  ctx.lineWidth = OUTLINE * 1.6;
  ctx.strokeStyle = line;
  ctx.stroke(p);
  ctx.fillStyle = g;
  ctx.fill(p);
  ctx.restore();
  return true;
}
