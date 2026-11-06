// Styled hover tips in place of the browser's own title tooltips (DESIGN 9, "Hover tips"). Across the HUD and the
// menus, hover text is written as a plain `title` (about a hundred of them: resource chips, the sky dial, the
// roster, powers, menu buttons), and the browser draws those as a small grey system box that matches nothing in
// the game. installHoverTips() watches the pointer over the page; when it rests on an element with a title, the
// title moves to `data-tip` (so the system box never shows) and a stone-and-gold card draws it beside the element.
// Code keeps writing `title` as before: a fresh title wins over the stored one, and a title rewritten while its tip
// is up updates the card at once. The text stays readable to screen readers through aria-description.
//
//   tipParts(text)                → { head, lines }   (pure: how a title splits into a heading and body lines)
//   tipPlace(rect, size, view)    → { x, y, below }   (pure: where the card goes, kept inside the window)
//   installHoverTips(doc)         → { hide, dispose } (DOM)

/** How long the pointer rests before the first tip shows, in ms. */
export const TIP_DELAY = 280;
/** After a tip closes, another within this many ms shows at once (sweeping along a row of chips). */
export const TIP_WARM = 450;
/** Gap between the element and the card, and the card's margin from the window's edges, in px. */
const GAP = 8;
const EDGE = 8;

/**
 * Split a title into a heading and body lines. A first line 'Name — what it does' heads with the name; a title of
 * several lines heads with its first; one plain line is all body.
 */
export function tipParts(text) {
  const all = String(text || '').split('\n').map((s) => s.trim()).filter(Boolean);
  if (!all.length) return { head: '', lines: [] };
  const first = all[0];
  const dash = first.indexOf(' — ');
  if (dash > 0 && dash <= 28) {
    const rest = first.slice(dash + 3);
    // 'Gold — mined by …' reads as a sentence once it stands under its heading.
    return { head: first.slice(0, dash), lines: [rest.charAt(0).toUpperCase() + rest.slice(1), ...all.slice(1)].filter(Boolean) };
  }
  if (all.length > 1 && first.length <= 48) return { head: first, lines: all.slice(1) };
  return { head: '', lines: all };
}

/**
 * Where the card goes: under an element in the top half of the window, over one in the bottom half, centred on it
 * and slid along to stay inside the window.
 * @param {{left:number, top:number, right:number, bottom:number}} rect the element
 * @param {{w:number, h:number}} size the card
 * @param {{w:number, h:number}} view the window
 */
export function tipPlace(rect, size, view) {
  const mid = (rect.top + rect.bottom) / 2;
  let below = mid < view.h / 2;
  let y = below ? rect.bottom + GAP : rect.top - GAP - size.h;
  if (below && y + size.h > view.h - EDGE && rect.top - GAP - size.h >= EDGE) { below = false; y = rect.top - GAP - size.h; }
  if (!below && y < EDGE && rect.bottom + GAP + size.h <= view.h - EDGE) { below = true; y = rect.bottom + GAP; }
  y = Math.max(EDGE, Math.min(y, view.h - EDGE - size.h));
  const cx = (rect.left + rect.right) / 2;
  const x = Math.max(EDGE, Math.min(cx - size.w / 2, view.w - EDGE - size.w));
  return { x: Math.round(x), y: Math.round(y), below };
}

/** The text an element's tip shows now: a title written since the last hover, else the one stored before. */
function tipText(n) {
  const t = n.getAttribute && n.getAttribute('title');
  if (t) return t;
  return (n.dataset && n.dataset.tip) || '';
}

/** Move an element's title into data-tip so the system tooltip never shows. */
function takeTitle(n) {
  const t = n.getAttribute('title');
  if (!t) return;
  n.dataset.tip = t;
  n.removeAttribute('title');
  if (!n.hasAttribute('aria-label') && !n.hasAttribute('aria-labelledby')) n.setAttribute('aria-description', t.replace(/\n/g, ' '));
}

export function installHoverTips(doc = document) {
  const win = doc.defaultView || window;
  const card = doc.createElement('div');
  card.className = 'mw-hovertip';
  card.setAttribute('role', 'tooltip');
  card.hidden = true;
  doc.body.appendChild(card);
  let target = null; // the element under the pointer that has a tip
  let shown = null; // the element whose tip is up
  let timer = 0;
  let watch = 0;
  let closedAt = -1e9;
  let lastText = '';
  const observer = typeof win.MutationObserver === 'function'
    ? new win.MutationObserver(() => { if (shown && shown.getAttribute('title')) { takeTitle(shown); draw(shown); } })
    : null;

  function draw(n) {
    const text = tipText(n);
    if (!text) { hide(); return; }
    if (text !== lastText) {
      lastText = text;
      const { head, lines } = tipParts(text);
      card.replaceChildren();
      if (head) {
        const h = doc.createElement('div');
        h.className = 'mw-hovertip-head';
        h.textContent = head;
        card.appendChild(h);
      }
      for (const l of lines) {
        const p = doc.createElement('div');
        p.className = 'mw-hovertip-line';
        p.textContent = l;
        card.appendChild(p);
      }
    }
    card.hidden = false;
    // Measured at the window's corner: left where it last stood, near an edge, it would wrap narrower than it is.
    card.style.transform = 'translate(0px, 0px)';
    const r = n.getBoundingClientRect();
    const c = card.getBoundingClientRect();
    const at = tipPlace(r, { w: c.width, h: c.height }, { w: win.innerWidth, h: win.innerHeight });
    card.style.transform = `translate(${at.x}px, ${at.y}px)`;
    card.className = `mw-hovertip ${at.below ? 'is-below' : 'is-above'}`;
  }

  function show(n) {
    clearTimeout(timer);
    timer = 0;
    if (!n.isConnected) return;
    takeTitle(n);
    if (shown && observer) observer.disconnect();
    shown = n;
    if (observer) observer.observe(n, { attributes: true, attributeFilter: ['title'] });
    draw(n);
    clearInterval(watch);
    // A tip outlives nothing: its element removed or hidden (a panel closed under the pointer) takes it away.
    watch = setInterval(() => { if (!shown || !shown.isConnected || shown.closest('[hidden]')) hide(); }, 250);
  }

  function hide() {
    clearTimeout(timer);
    timer = 0;
    clearInterval(watch);
    watch = 0;
    if (shown) closedAt = performance.now();
    if (observer) observer.disconnect();
    shown = null;
    target = null;
    card.hidden = true;
  }

  function over(e) {
    if (e.pointerType === 'touch') return;
    const from = e.target && e.target.closest ? e.target.closest('[title]:not([title=""]), [data-tip]') : null;
    if (from === target) return;
    if (from && from.closest('[data-native-tip]')) return;
    if (shown) { hide(); closedAt = performance.now(); }
    target = from;
    if (!from || !tipText(from)) { target = null; return; }
    // Strip the title now, so the system tooltip cannot race the card.
    takeTitle(from);
    clearTimeout(timer);
    const warm = performance.now() - closedAt < TIP_WARM;
    timer = setTimeout(() => { if (target === from) show(from); }, warm ? 0 : TIP_DELAY);
  }

  const out = (e) => { if (target && (!e.relatedTarget || !target.contains(e.relatedTarget))) hide(); };
  const off = () => hide();
  doc.addEventListener('pointerover', over, true);
  doc.addEventListener('pointerout', out, true);
  doc.addEventListener('pointerdown', off, true);
  doc.addEventListener('wheel', off, { capture: true, passive: true });
  doc.addEventListener('keydown', off, true);
  win.addEventListener('blur', off);
  return {
    hide,
    dispose() {
      hide();
      doc.removeEventListener('pointerover', over, true);
      doc.removeEventListener('pointerout', out, true);
      doc.removeEventListener('pointerdown', off, true);
      doc.removeEventListener('wheel', off, { capture: true });
      doc.removeEventListener('keydown', off, true);
      win.removeEventListener('blur', off);
      card.remove();
    },
  };
}
