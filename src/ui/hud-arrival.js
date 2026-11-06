// The arrival card (DESIGN 9, battle HUD): when one of my gods answers the call or my Titan rises, a carved plate
// slides down under the top bar for a few seconds: the hero's icon in a glowing ring, "Answers your call" or "Has
// risen", the name in carved gold, the title, and the powers it brings. The feed keeps its message (the log for screen
// readers); the card is the moment. An enemy Titan keeps the red banner (game.js).
import { el } from './hud-dom.js';
import { PANTHEONS } from '../data/index.js';

export const ARRIVAL_MS = 5200;

/**
 * What the card shows for a unit type: { kind: 'god'|'titan', kicker, name, title, pantheon, icon, powers: [{ icon, name }] },
 * or null for anything but a god or a Titan.
 */
export function arrivalSpec(def) {
  if (!def || (def.class !== 'god' && def.class !== 'titan')) return null;
  const titan = def.class === 'titan';
  const pan = def.pantheon && Object.hasOwn(PANTHEONS, def.pantheon) ? PANTHEONS[def.pantheon] : null;
  return {
    kind: titan ? 'titan' : 'god',
    kicker: titan ? 'Your Titan has risen' : 'A god answers your call',
    name: String(def.name || ''),
    title: String(def.title || ''),
    pantheon: pan && pan.name ? pan.name : '',
    icon: def.icon || (titan ? '🗿' : '⚡'),
    powers: (def.abilities || []).filter((a) => a && a.name).slice(0, 4).map((a) => ({ icon: a.icon || '✦', name: a.name })),
  };
}

export class ArrivalCard {
  constructor() {
    this.el = el('div', 'hud-arrival');
    this.el.hidden = true;
    this.el.setAttribute('role', 'status');
    this.timer = 0;
  }

  /** Shows the card for a god or Titan type; returns whether it showed. */
  show(def) {
    const s = arrivalSpec(def);
    if (!s) return false;
    const ring = el('div', 'hud-arrival-ring', el('span', 'hud-arrival-icon', s.icon));
    const text = el('div', 'hud-arrival-text',
      el('div', 'hud-arrival-kicker', s.kicker),
      el('div', 'hud-arrival-name', s.name),
      el('div', 'hud-arrival-title', [s.title, s.pantheon].filter(Boolean).join(' · ')));
    if (s.powers.length) {
      text.appendChild(el('div', 'hud-arrival-powers', s.powers.map((p) => el('span', 'hud-arrival-power', el('i', null, p.icon), p.name))));
    }
    this.el.replaceChildren(ring, text);
    this.el.className = `hud-arrival is-${s.kind}`;
    this.el.setAttribute('aria-label', `${s.kicker}: ${s.name}, ${s.title}`);
    this.el.hidden = false;
    void this.el.offsetWidth;
    this.el.classList.add('is-on');
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.el.classList.remove('is-on');
      this.timer = setTimeout(() => (this.el.hidden = true), 600);
    }, ARRIVAL_MS);
    return true;
  }

  get showing() {
    return !this.el.hidden;
  }

  cleanup() {
    clearTimeout(this.timer);
  }
}
