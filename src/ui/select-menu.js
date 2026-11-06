// The game's own drop-down list for the menus' <select>s (DESIGN 9, "Drop-down lists"). A native select opens the
// operating system's list (white on Windows, a wheel on macOS) that matches nothing else in the lobby.
// installSelectMenus() catches the mouse press (or Enter, Space, Alt+Down) that would open one of the selects it
// is given by selector and opens a stone-and-gold list under it instead. The select stays the source of truth: a
// pick sets its value and fires 'input' and 'change' as the browser would, so menu code and tests that build or
// read selects need no change. Touch keeps the native picker, which is better on a phone.
//
//   menuItems(select)                → [{ value, label, disabled, selected }]   (pure enough for the fake DOM)
//   nextEnabled(items, from, step)   → index                                     (pure: arrow-key movement)
//   installSelectMenus(doc, sel)     → { close, dispose }                        (DOM)
import { sfx } from '../audio/sfx.js';

/** The selects that get the game's list. */
export const SELECT_MENU_SELECTOR = 'select.mw-select, select.hud-rp-vision';

/** The options of a select as list rows. */
export function menuItems(select) {
  const out = [];
  const opts = select && select.options ? Array.from(select.options) : [];
  for (const o of opts) out.push({ value: String(o.value), label: String(o.textContent || o.label || o.value), disabled: !!o.disabled, selected: String(o.value) === String(select.value) });
  return out;
}

/** The next row that can be picked from `from`, moving by `step` (±1); stays put when there is none. */
export function nextEnabled(items, from, step) {
  const n = items.length;
  for (let i = from + step; i >= 0 && i < n; i += step) if (!items[i].disabled) return i;
  return from;
}

export function installSelectMenus(doc = document, selector = SELECT_MENU_SELECTOR) {
  const win = doc.defaultView || window;
  let menu = null; // { select, node, items, rows, active }
  let lastPointer = 'mouse';

  function close(refocus = false) {
    if (!menu) return;
    const { select, node } = menu;
    node.remove();
    select.removeAttribute('aria-expanded');
    menu = null;
    if (refocus) select.focus();
  }

  function pick(i) {
    if (!menu) return;
    const { select, items } = menu;
    const it = items[i];
    if (!it || it.disabled) return;
    const changed = String(select.value) !== it.value;
    close(true);
    sfx.play('click'); // as every menu button does
    if (!changed) return;
    select.value = it.value;
    select.dispatchEvent(new win.Event('input', { bubbles: true }));
    select.dispatchEvent(new win.Event('change', { bubbles: true }));
  }

  function setActive(i) {
    if (!menu) return;
    menu.active = i;
    menu.rows.forEach((r, k) => { r.className = rowClass(menu.items[k], k === i); });
    const r = menu.rows[i];
    if (r && typeof r.scrollIntoView === 'function') r.scrollIntoView({ block: 'nearest' });
  }

  function rowClass(it, active) {
    return `mw-selmenu-item${it.selected ? ' is-selected' : ''}${it.disabled ? ' is-disabled' : ''}${active ? ' is-active' : ''}`;
  }

  function open(select) {
    close();
    const items = menuItems(select);
    if (!items.length) return;
    const node = doc.createElement('div');
    node.className = 'mw-selmenu';
    node.setAttribute('role', 'listbox');
    const rows = items.map((it, i) => {
      const r = doc.createElement('div');
      r.className = rowClass(it, false);
      r.setAttribute('role', 'option');
      r.setAttribute('aria-selected', it.selected ? 'true' : 'false');
      if (it.disabled) r.setAttribute('aria-disabled', 'true');
      r.textContent = it.label;
      r.addEventListener('pointerenter', () => { if (!it.disabled) setActive(i); });
      r.addEventListener('click', (e) => { e.stopPropagation(); pick(i); });
      node.appendChild(r);
      return r;
    });
    // On the body, over every panel and dialog, placed in window coordinates under (or over) the select.
    doc.body.appendChild(node);
    const sr = select.getBoundingClientRect();
    node.style.minWidth = `${Math.round(sr.width)}px`;
    const h = node.getBoundingClientRect().height;
    const room = win.innerHeight - sr.bottom - 8;
    const up = h > room && sr.top - 8 > room;
    const top = up ? Math.max(8, sr.top - 4 - h) : sr.bottom + 4;
    const left = Math.max(8, Math.min(sr.left, win.innerWidth - 8 - node.getBoundingClientRect().width));
    node.style.left = `${Math.round(left)}px`;
    node.style.top = `${Math.round(top)}px`;
    node.style.maxHeight = `${Math.round(Math.max(120, up ? sr.top - 12 : room))}px`;
    node.className = `mw-selmenu ${up ? 'is-up' : 'is-down'}`;
    select.setAttribute('aria-expanded', 'true');
    const cur = items.findIndex((it) => it.selected);
    menu = { select, node, items, rows, active: -1 };
    setActive(cur >= 0 ? cur : nextEnabled(items, -1, 1));
  }

  const isOurs = (t) => t && t.matches && t.matches(selector) && !t.disabled;

  const onPointerDown = (e) => {
    lastPointer = e.pointerType || 'mouse';
    if (menu && !menu.node.contains(e.target) && e.target !== menu.select) close();
  };
  const onMouseDown = (e) => {
    const t = e.target;
    if (!isOurs(t) || e.button !== 0 || lastPointer === 'touch') return;
    e.preventDefault(); // the native list never opens
    if (menu && menu.select === t) { close(true); return; }
    t.focus();
    open(t);
  };
  const onKeyDown = (e) => {
    if (menu) {
      const { items, active } = menu;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); setActive(nextEnabled(items, active, e.key === 'ArrowDown' ? 1 : -1)); return; }
      if (e.key === 'Home') { e.preventDefault(); setActive(nextEnabled(items, -1, 1)); return; }
      if (e.key === 'End') { e.preventDefault(); setActive(nextEnabled(items, items.length, -1)); return; }
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(active); return; }
      if (e.key === 'Escape' || e.key === 'Tab') { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); } close(e.key === 'Escape'); return; }
      return;
    }
    const t = e.target;
    if (!isOurs(t)) return;
    if (e.key === 'Enter' || e.key === ' ' || (e.altKey && e.key === 'ArrowDown') || e.key === 'F4') { e.preventDefault(); open(t); }
  };
  const onScroll = (e) => { if (menu && !menu.node.contains(e.target)) close(); };
  const onBlur = () => close();

  doc.addEventListener('pointerdown', onPointerDown, true);
  doc.addEventListener('mousedown', onMouseDown, true);
  doc.addEventListener('keydown', onKeyDown, true);
  doc.addEventListener('scroll', onScroll, true);
  win.addEventListener('resize', onBlur);
  win.addEventListener('blur', onBlur);
  return {
    close: () => close(),
    get open() { return !!menu; },
    dispose() {
      close();
      doc.removeEventListener('pointerdown', onPointerDown, true);
      doc.removeEventListener('mousedown', onMouseDown, true);
      doc.removeEventListener('keydown', onKeyDown, true);
      doc.removeEventListener('scroll', onScroll, true);
      win.removeEventListener('resize', onBlur);
      win.removeEventListener('blur', onBlur);
    },
  };
}
