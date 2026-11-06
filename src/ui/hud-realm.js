// The realm panel (DESIGN 9, "Realm panel"): what the selection panel shows while nothing is selected, in place of
// an empty stone. Your pantheon's crest, the next age to reach (what it costs, which building it waits on, or how
// far the Town Center has grown), and what your realm counts: soldiers, gods and creatures, buildings.
// A click on the age card selects the Town Center that grows it. hud-info.js draws it; the numbers are realmSummary.
import { BUILDINGS, UNITS, getPantheon } from '../data/index.js';
import { isComplete, tierName, typeName } from './hud-data.js';
import { PANTHEON_EMBLEMS } from './menu-model.js';
import { el, setText, setStyle, setClass, fmt, pct } from './hud-dom.js';

const RES = [
  ['gold', '💰'],
  ['wood', '🌲'],
  ['faith', '✨'],
];

/**
 * The realm in numbers, from the view state: { pantheon, tier, next, army, tc }.
 *   next: null at the last age, else { to, cost, short: { gold: bool… }, requires: [{ name, have }], growing, progress }
 *   army: { soldiers, divine, buildings } (soldiers are every unit but Worshippers; divine are gods, titans, creatures)
 *   tc: the id of the Town Center to select (the growing one first), or null
 */
export function realmSummary(vs) {
  const me = vs && vs.me;
  if (!me) return null;
  const mine = vs.myIndex;
  const pan = me.pantheon ? getPantheon(me.pantheon) : null;
  const tier = me.tier || 1;
  const army = { soldiers: 0, divine: 0, buildings: 0 };
  const have = new Set();
  let tc = null;
  let growing = null;
  for (const e of vs.entities.values()) {
    if (!e || e.o !== mine) continue;
    if (e.k === 'u') {
      const d = UNITS[e.t];
      if (!d || d.class === 'worker') continue;
      if (d.class === 'god' || d.class === 'titan' || d.class === 'creature') army.divine++;
      else army.soldiers++;
    } else if (e.k === 'b') {
      army.buildings++;
      if (!isComplete(e)) continue;
      have.add(e.t);
      if (e.t === 'town_center') {
        if (tc === null) tc = e.id;
        if (!growing && e.q && e.q[0] && e.q[0].u === 'tier_up') growing = e;
      }
    }
  }
  if (growing) tc = growing.id;
  const up = ((BUILDINGS.town_center && BUILDINGS.town_center.tierUpgrades) || [])[tier];
  let next = null;
  if (up) {
    const cost = { gold: up.cost.gold || 0, wood: up.cost.wood || 0, faith: up.cost.faith || 0 };
    const short = {};
    for (const [r] of RES) short[r] = (me[r] || 0) < cost[r];
    next = {
      to: tierName(up.toTier),
      cost,
      short,
      requires: (up.requires || []).map((id) => ({ name: typeName(id), have: have.has(id) })),
      growing: !!growing,
      progress: growing ? Math.max(0, Math.min(1, growing.q[0].p || 0)) : 0,
    };
  }
  return {
    pantheon: pan ? { name: pan.name, culture: pan.culture || '', emblem: PANTHEON_EMBLEMS[me.pantheon] || '✦' } : null,
    tier,
    next,
    army,
    tc,
  };
}

/** The panel's words for the next age: a goal, what holds it back, or the growth under way. */
export function nextLine(next) {
  if (!next) return 'Your realm stands at its height.';
  if (next.growing) return `Growing into a ${next.to}…`;
  const missing = next.requires.filter((r) => !r.have).map((r) => r.name);
  if (missing.length) return `Build a ${missing.join(' and a ')} first.`;
  const short = RES.filter(([r]) => next.short[r]).map(([r]) => r);
  if (short.length) return `Gather more ${short.join(' and ')}.`;
  return 'Ready: select the Town Center to grow.';
}

/** Builds and refreshes the realm panel inside `root` (the selection panel). */
export class RealmPanel {
  /** @param {{ onSelect?: (id: number) => void }} o */
  constructor(root, o = {}) {
    this.o = o;
    this.sig = '';
    this.data = null;
    const crest = el('div', 'hr-crest', el('div', 'hr-ring', this.emblem = el('span', 'hr-emblem', '✦')));
    const who = el('div', 'hr-who', this.name = el('div', 'hr-name', ''), this.culture = el('div', 'hr-culture', ''), this.age = el('div', 'hr-age', ''));
    this.goal = el('button', 'hr-goal');
    this.goal.type = 'button';
    this.goal.tabIndex = -1;
    this.goal.title = 'Select your Town Center';
    this.goal.addEventListener('click', (ev) => {
      if (ev && ev.stopPropagation) ev.stopPropagation();
      if (this.data && this.data.tc !== null && this.o.onSelect) this.o.onSelect(this.data.tc);
    });
    this.goalHead = el('div', 'hr-goal-head', '');
    this.goalLine = el('div', 'hr-goal-line', '');
    this.costs = el('div', 'hr-costs');
    this.costEls = {};
    for (const [r, icon] of RES) {
      const n = el('span', 'hr-cost', el('span', 'hr-cost-i', icon), el('span', 'hr-cost-v', ''));
      this.costEls[r] = n;
      this.costs.append(n);
    }
    this.bar = el('div', 'hr-bar', this.fill = el('i', 'hr-bar-fill'));
    this.goal.append(this.goalHead, this.costs, this.bar, this.goalLine);
    this.counts = el('div', 'hr-counts');
    this.countEls = {};
    for (const [k, label, icon] of [['soldiers', 'Soldiers', '⚔️'], ['divine', 'Gods & creatures', '👑'], ['buildings', 'Buildings', '🏛️']]) {
      const v = el('span', 'hr-count-v', '0');
      this.countEls[k] = v;
      this.counts.append(el('div', 'hr-count', el('span', 'hr-count-i', icon), v, el('span', 'hr-count-l', label)));
    }
    this.el = el('div', 'hi-realm', crest, who, this.goal, this.counts);
    root.appendChild(this.el);
  }

  update(vs) {
    const d = realmSummary(vs);
    this.data = d;
    if (!d) {
      this.el.hidden = true;
      return;
    }
    this.el.hidden = false;
    const n = d.next;
    const sig = `${d.pantheon ? d.pantheon.name : ''}|${d.tier}|${n ? `${n.growing}|${n.requires.map((r) => r.have).join()}|${RES.map(([r]) => n.short[r]).join()}` : '-'}|${d.army.soldiers}|${d.army.divine}|${d.army.buildings}|${d.tc}`;
    if (n && n.growing) setStyle(this.fill, 'width', pct(n.progress));
    if (sig === this.sig) return;
    this.sig = sig;
    setText(this.emblem, d.pantheon ? d.pantheon.emblem : '✦');
    setText(this.name, d.pantheon ? d.pantheon.name : 'Your realm');
    setText(this.culture, d.pantheon ? d.pantheon.culture : '');
    setText(this.age, `${tierName(d.tier)} · age ${d.tier} of 3`);
    setText(this.goalHead, n ? `Next: ${n.to}` : tierName(d.tier));
    setText(this.goalLine, nextLine(n));
    setClass(this.goal, 'is-done', !n);
    setClass(this.goal, 'is-growing', !!(n && n.growing));
    setClass(this.goal, 'is-ready', !!(n && !n.growing && nextLine(n).startsWith('Ready')));
    this.costs.hidden = !n || n.growing;
    this.bar.hidden = !(n && n.growing);
    for (const [r] of RES) {
      const c = this.costEls[r];
      const v = n ? n.cost[r] : 0;
      c.hidden = !v;
      setText(c.children[1], fmt(v));
      setClass(c, 'is-short', !!(n && n.short[r]));
    }
    this.goal.disabled = d.tc === null;
    for (const k of Object.keys(this.countEls)) setText(this.countEls[k], fmt(d.army[k]));
  }
}
