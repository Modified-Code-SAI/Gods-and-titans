// The name tag beside the cursor over a unit, building or gold mine on the map (DESIGN 9, "Hover tag"). The hover
// ring says something is there; the tag says what it is and whose: "Hoplite", "Tlaloc · Enemy" in the owner's
// colour, and a thin health bar (gold left for a mine). It shows after the pointer rests a moment, follows it,
// and stays out of the way while a building is placed, a box is dragged or a wall's tip is up.
//
//   hoverTagInfo(e, vs)   → { name, who, color, rel, frac, note } | null   (pure)
//   HoverTag              the DOM tag the input controller drives (show / hide / dispose)
import { nameOf } from './hud-data.js';
import { safeColor, fmt } from './hud-dom.js';
import { sanitizeName } from '../net/protocol.js';
import { displayColor } from '../team-colors.js';

/** How long the pointer rests on a thing before its tag shows, in ms. */
export const HOVER_TAG_DELAY = 350;

const REL_TEXT = { ally: 'Ally', enemy: 'Enemy' };

/** What the tag says about an entity, or null when there is nothing to name. */
export function hoverTagInfo(e, vs) {
  if (!e || !vs) return null;
  const name = nameOf(e);
  if (!name) return null;
  const rel = typeof vs.relation === 'function' ? vs.relation(e.o) : 'neutral';
  let who = '';
  let color = '';
  if (rel === 'ally' || rel === 'enemy') {
    const p = (vs.players && vs.players[e.o]) || (vs.setup && vs.setup.players && vs.setup.players[e.o]) || null;
    who = `${sanitizeName(p && p.name, `Player ${e.o + 1}`)} · ${REL_TEXT[rel]}`;
    color = displayColor(safeColor(p && p.color, '#888888'));
  } else if (rel === 'neutral' && e.k === 'u') who = 'Neutral creature';
  let frac = null;
  let note = '';
  if (e.k === 'm') {
    const left = typeof vs.mineGold === 'function' ? vs.mineGold(e) : null;
    if (Number.isFinite(left)) note = `💰 ${fmt(left)} gold left`;
  } else if (e.mhp > 0) frac = Math.max(0, Math.min(1, (e.hp || 0) / e.mhp));
  return { name, who, color, rel, frac, note };
}

export class HoverTag {
  constructor(root) {
    const doc = root.ownerDocument || document;
    this.node = doc.createElement('div');
    this.node.className = 'hud-hovertag';
    this.node.hidden = true;
    this.nameEl = doc.createElement('b');
    this.whoEl = doc.createElement('span');
    this.whoEl.className = 'hud-hovertag-who';
    this.noteEl = doc.createElement('span');
    this.noteEl.className = 'hud-hovertag-note';
    this.bar = doc.createElement('i');
    this.bar.className = 'hud-hovertag-bar';
    this.fill = doc.createElement('i');
    this.bar.appendChild(this.fill);
    this.node.append(this.nameEl, this.whoEl, this.noteEl, this.bar);
    root.appendChild(this.node);
    this.sig = '';
  }

  /** Show (or refresh) the tag for `info` at window point x, y. */
  show(info, x, y) {
    if (!info) return this.hide();
    const sig = `${info.name}|${info.who}|${info.color}|${info.note}|${info.frac === null ? '' : Math.round(info.frac * 100)}`;
    if (sig !== this.sig) {
      this.sig = sig;
      this.nameEl.textContent = info.name;
      this.whoEl.textContent = info.who;
      this.whoEl.hidden = !info.who;
      this.whoEl.style.color = info.color || '';
      this.noteEl.textContent = info.note;
      this.noteEl.hidden = !info.note;
      this.bar.hidden = info.frac === null;
      if (info.frac !== null) {
        this.fill.style.width = `${Math.round(info.frac * 100)}%`;
        this.fill.className = info.frac > 0.6 ? 'is-high' : info.frac > 0.3 ? 'is-mid' : 'is-low';
      }
      this.node.className = `hud-hovertag is-${info.rel}`;
    }
    this.node.style.transform = `translate(${Math.round(x + 16)}px, ${Math.round(y + 20)}px)`;
    this.node.hidden = false;
  }

  hide() {
    this.node.hidden = true;
  }

  dispose() {
    this.node.remove();
  }
}
