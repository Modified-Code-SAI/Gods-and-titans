// Command card view: renders the 12 buttons from getCommandCard() into the
// bottom-right grid (hotkey letters, cost-driven disabled styling, cooldown
// sweeps, queue counts, autocast marks) and the WC3-style tooltip above it.
import { el, setText, setStyle, setHidden, fmt } from './hud-dom.js';

const STATE_CLASSES = ['is-ready', 'is-cooldown', 'is-unaffordable', 'is-locked', 'is-disabled', 'is-passive', 'is-active'];

/** The line under a right-click toggle's tooltip: autocast for an ability, repeat for a unit to train. */
export function toggleNote(b) {
  if (b.toggle.kind === 'repeat') {
    return b.autocast
      ? 'Repeating: another is queued whenever the queue runs empty. Right-click to stop.'
      : 'Right-click to repeat: another is queued whenever the queue runs empty, while you can pay for it.';
  }
  return b.autocast ? 'Casts automatically. Right-click to cast it yourself.' : 'Manual: cast it yourself. Right-click to cast automatically.';
}

/** Signature of the parts of a button that need a DOM rebuild. */
function shape(b) {
  if (!b) return '';
  return `${b.id}|${b.icon}|${b.keyLabel}|${b.state}|${b.queued}|${b.autocast ? 1 : 0}`;
}

/** ms a finger rests on a command button before its tooltip shows instead of the button being pressed. */
export const CARD_HOLD_MS = 450;

export class CardView {
  /**
   * @param {HTMLElement} grid container for the 12 slots
   * @param {HTMLElement} tip tooltip element
   * @param {{ onActivate: (b: object, e: MouseEvent) => void, onToggle?: (b: object) => void }} o
   */
  constructor(grid, tip, { onActivate, onToggle }) {
    this.grid = grid;
    this.tip = tip;
    this.onActivate = onActivate;
    this.onToggle = onToggle;
    this.card = new Array(12).fill(null);
    this.slots = [];
    this.hoverSlot = -1;
    this.tipSig = '';
    this.held = -1; // the slot whose tooltip a held finger opened (its click is swallowed)
    this.touchDown = false;
    this.touchAt = -Infinity;
    this.downStamp = 0;
    this.holdTimer = 0;
    for (let i = 0; i < 12; i++) {
      const btn = el('button', 'hc-btn is-empty');
      btn.type = 'button';
      btn.tabIndex = -1;
      btn.dataset.slot = String(i);
      const icon = el('span', 'hc-icon');
      const key = el('span', 'hc-key');
      const queue = el('span', 'hc-queue');
      const cd = el('span', 'hc-cd');
      const cdText = el('span', 'hc-cd-text');
      const auto = el('span', 'hc-auto');
      const lock = el('span', 'hc-lock', '🔒');
      btn.append(icon, cd, cdText, auto, lock, queue, key);
      const slot = { btn, icon, key, queue, cd, cdText, auto, lock, sig: null };
      btn.addEventListener('mousedown', (e) => e.preventDefault());
      // Touch (DESIGN 9 "Touch"): a finger held on a button shows its tooltip and does not press it; a tap presses it.
      btn.addEventListener('pointerdown', (e) => {
        this.touchDown = e.pointerType === 'touch';
        if (!this.touchDown) return;
        this.touchAt = performance.now();
        this.downStamp = e.timeStamp;
        clearTimeout(this.holdTimer);
        this.held = -1;
        this.holdTimer = setTimeout(() => {
          this.held = i;
          this.hoverSlot = i;
          this.renderTip();
        }, CARD_HOLD_MS);
      });
      const release = (e) => {
        clearTimeout(this.holdTimer);
        if (this.touchDown) this.touchAt = performance.now();
        // timed by the events' own clock: a busy frame that ran the timer late does not turn a tap into a hold
        if (this.held === i && Number.isFinite(e.timeStamp) && e.timeStamp - this.downStamp < CARD_HOLD_MS) this.held = -1;
        // the tip is read while the finger stays down; a tap's emulated hover would leave it standing otherwise
        if (this.touchDown && this.hoverSlot === i) {
          this.hoverSlot = -1;
          this.renderTip();
        }
      };
      btn.addEventListener('pointerup', release);
      btn.addEventListener('pointercancel', release);
      btn.addEventListener('click', (e) => {
        if (this.held === i) {
          this.held = -1; // the hold that read the tooltip is not a press
          return;
        }
        const b = this.card[i];
        if (b && this.onActivate) this.onActivate(b, e);
      });
      btn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (this.touchDown) return; // a long press is the tooltip, not the right-click toggle
        // Right-click an ability: autocast on / manual (WC3).
        const b = this.card[i];
        if (b && b.toggle && this.onToggle) this.onToggle(b);
      });
      btn.addEventListener('mouseenter', () => {
        if (this.touchDown && performance.now() - this.touchAt < 1000) return; // the hover a tap emulates
        this.hoverSlot = i;
        this.renderTip();
      });
      btn.addEventListener('mouseleave', () => {
        if (this.hoverSlot === i) this.hoverSlot = -1;
        this.renderTip();
      });
      this.slots.push(slot);
      grid.appendChild(btn);
    }
  }

  /** Show a new card (diffed per slot); `me` (the player's snapshot) marks the costs they cannot pay in the tooltip. */
  render(card, me = null) {
    this.card = card;
    this.me = me;
    for (let i = 0; i < 12; i++) {
      const b = card[i];
      const s = this.slots[i];
      const sig = shape(b);
      if (sig !== s.sig) {
        s.sig = sig;
        const btn = s.btn;
        for (const c of STATE_CLASSES) btn.classList.remove(c);
        if (!b) {
          btn.classList.add('is-empty');
          setText(s.icon, '');
          setText(s.key, '');
          setHidden(s.queue, true);
          setHidden(s.auto, true);
          setHidden(s.lock, true);
          btn.removeAttribute('aria-label');
          btn.removeAttribute('data-id');
        } else {
          btn.classList.remove('is-empty');
          btn.classList.add(`is-${b.state}`);
          btn.dataset.id = b.id;
          btn.setAttribute('aria-label', b.title);
          setText(s.icon, b.icon);
          setText(s.key, b.keyLabel || '');
          setHidden(s.key, !b.keyLabel);
          setText(s.queue, b.queued > 0 ? String(b.queued) : '');
          setHidden(s.queue, !(b.queued > 0));
          setHidden(s.auto, !b.autocast);
          setHidden(s.lock, b.state !== 'locked');
        }
      }
      // Cooldown sweep (every render; cheap property writes only when changed).
      const cd = b && b.cooldown > 0 ? b.cooldown : 0;
      setStyle(s.cd, '--cd', `${(cd * 360).toFixed(1)}deg`);
      setHidden(s.cd, !(cd > 0));
      setText(s.cdText, cd > 0 ? String(Math.ceil(b.cooldownLeft)) : '');
      setHidden(s.cdText, !(cd > 0));
    }
    this.renderTip();
  }

  /** Flash a slot (hotkey feedback). */
  flash(slot) {
    const s = this.slots[slot];
    if (!s) return;
    s.btn.classList.remove('is-pressed');
    void s.btn.offsetWidth;
    s.btn.classList.add('is-pressed');
    clearTimeout(s.flashTimer);
    s.flashTimer = setTimeout(() => s.btn.classList.remove('is-pressed'), 140);
  }

  renderTip() {
    const b = this.hoverSlot >= 0 ? this.card[this.hoverSlot] : null;
    const short = b ? shortCosts(b.cost, this.me) : null;
    const sig = b ? `${shape(b)}|${b.title}|${b.reason}|${b.description}|${JSON.stringify(b.cost)}|${short.join()}` : '';
    if (sig === this.tipSig) return;
    this.tipSig = sig;
    const tip = this.tip;
    if (!b) {
      setHidden(tip, true);
      return;
    }
    tip.textContent = '';
    const title = el('div', 'ht-title', b.title);
    if (b.keyLabel) title.append(' ', el('span', 'ht-key', `[${b.keyLabel}]`));
    tip.appendChild(title);
    const c = b.cost;
    if (c && (c.gold || c.wood || c.faith || c.pop)) {
      const row = el('div', 'ht-cost');
      const add = (res, icon, v) => {
        if (v) row.appendChild(el('span', `ht-res is-${res}${short.includes(res) ? ' is-short' : ''}`, el('i', 'ht-res-i', icon), fmt(v)));
      };
      add('gold', '💰', c.gold);
      add('wood', '🌲', c.wood);
      add('faith', '✨', c.faith);
      add('pop', '👥', c.pop);
      if (c.time) row.appendChild(el('span', 'ht-res is-time', el('i', 'ht-res-i', '⏳'), `${Math.round(c.time)}s`));
      tip.appendChild(row);
    } else if (c && c.cooldown) {
      const row = el('div', 'ht-cost');
      row.appendChild(el('span', 'ht-res is-time', el('i', 'ht-res-i', '⏳'), `${c.cooldown}s cooldown`));
      if (c.range) row.appendChild(el('span', 'ht-res', el('i', 'ht-res-i', '🎯'), `range ${c.range}`));
      if (c.target) row.appendChild(el('span', 'ht-res is-dim', c.target));
      tip.appendChild(row);
    }
    if (b.stats && b.stats.length) tip.appendChild(el('div', 'ht-stats', ...b.stats.map((line) => el('div', null, line))));
    if (b.description) tip.appendChild(el('div', 'ht-desc', b.description));
    if (b.toggle) tip.appendChild(el('div', 'ht-note', toggleNote(b)));
    else if (b.autocast) tip.appendChild(el('div', 'ht-note', 'Casts automatically.'));
    if (b.passive) tip.appendChild(el('div', 'ht-note', 'Passive.'));
    if (b.reason && b.state !== 'cooldown') tip.appendChild(el('div', 'ht-reason', b.reason));
    setHidden(tip, false);
  }

  hideTip() {
    this.hoverSlot = -1;
    this.renderTip();
  }
}

/** The parts of a cost a player cannot pay now: ['wood', 'pop'] and so on ([] with no player or no cost). */
export function shortCosts(cost, me) {
  if (!cost || !me) return [];
  const out = [];
  for (const r of ['gold', 'wood', 'faith']) if (cost[r] && (me[r] ?? 0) < cost[r]) out.push(r);
  if (cost.pop > 0 && Number.isFinite(me.popCap) && (me.pop ?? 0) + cost.pop > me.popCap) out.push('pop');
  return out;
}
