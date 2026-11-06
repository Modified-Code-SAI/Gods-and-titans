// Gamepad play (DESIGN 9, "Gamepad"). A controller in the browser's "standard" layout drives a cursor of its
// own and turns its buttons into the mouse and key actions the InputController already knows, as touch does
// (touch-input.js), so selection, orders, placement and targeting keep one set of rules:
//
//   left stick          → pans the camera (as the arrow keys, at a speed the tilt sets)
//   right stick         → moves the pad's cursor (drawn as an arrow; the OS pointer is not moved)
//   A                   → a left click at the cursor; held while the cursor moves, a selection box. Over the
//                         HUD or a menu it clicks the button under the cursor.
//   X                   → the right-click order at the cursor (move, attack, gather, build)
//   B                   → Esc for the map: calls off a placement or targeted order, else clears the selection
//   LT / RT             → zoom out / in
//   LB / RB             → the next idle Worshipper / the next idle soldier ('.' and ',')
//   Start               → the game menu
//
// A blast that shakes the screen (a titan's stomp, a god power, a collapse) also rumbles a pad that has a motor.
//
// Polled once a frame from InputController.update (the Gamepad API has no button events).
//
//   readPad(gp)            → { lx, ly, rx, ry, down: Set<number> }   the stick axes past the dead zone (pure)
//   GamepadInput           the cursor and the per-frame poll (update / dispose)

/** Stick tilt below which a stick reads as centred. */
export const DEAD_ZONE = 0.2;
/** px per second the pad's cursor moves at full tilt. */
export const CURSOR_SPEED = 1100;
/** Fraction of the zoom distance a fully pulled trigger moves per second. */
export const ZOOM_RATE = 1.4;
/** Smallest jump in the screen shake (vfx.shake, 0..1) that also rumbles the pad. */
export const RUMBLE_KICK = 0.08;
/** Standard-layout button numbers. */
export const PAD = { A: 0, B: 1, X: 2, Y: 3, LB: 4, RB: 5, LT: 6, RT: 7, BACK: 8, START: 9 };

/** One stick axis past the dead zone, rescaled so the edge of the zone reads 0 (keeps fine aim near centre). */
function axis(v) {
  if (!Number.isFinite(v)) return 0;
  const a = Math.abs(v);
  if (a < DEAD_ZONE) return 0;
  return Math.sign(v) * Math.min(1, (a - DEAD_ZONE) / (1 - DEAD_ZONE));
}

/** A trigger's pull 0..1 (some pads report triggers only as pressed). */
function pull(b) {
  if (!b) return 0;
  const v = Number.isFinite(b.value) ? b.value : 0;
  return Math.max(v, b.pressed ? 1 : 0);
}

/** What a pad reads this frame: the four stick axes past the dead zone, the two trigger pulls and the buttons down. */
export function readPad(gp) {
  const ax = (gp && gp.axes) || [];
  const bs = (gp && gp.buttons) || [];
  const down = new Set();
  for (let i = 0; i < bs.length; i++) if (bs[i] && (bs[i].pressed || bs[i].value > 0.5)) down.add(i);
  return { lx: axis(ax[0]), ly: axis(ax[1]), rx: axis(ax[2]), ry: axis(ax[3]), lt: pull(bs[PAD.LT]), rt: pull(bs[PAD.RT]), down };
}

/** The first connected pad in the standard layout (or any connected pad), or null. */
export function firstPad(nav = globalThis.navigator) {
  if (!nav || typeof nav.getGamepads !== 'function') return null;
  let list;
  try {
    list = nav.getGamepads() || [];
  } catch {
    return null;
  }
  let any = null;
  for (const gp of list) {
    if (!gp || gp.connected === false) continue;
    if (gp.mapping === 'standard') return gp;
    any = any || gp;
  }
  return any;
}

const noop = () => {};

const CURSOR_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'><path d='M3 2 L3 22 L8.5 17 L12.5 26 L16 24.5 L12 15.5 L20 15.5 Z' fill='%23f6d98a' stroke='%23201508' stroke-width='1.6' stroke-linejoin='round'/></svg>";

/** What the pad's cursor is over that a press would work: the nearest button, link or field (or null). */
export function pressable(el) {
  if (!el) return null;
  if (typeof el.closest === 'function') return el.closest('button, a[href], input, select, textarea, [role="button"]') || null;
  for (let n = el; n; n = n.parentNode) if (/^(BUTTON|A|INPUT|SELECT|TEXTAREA)$/.test(n.tagName || '')) return n;
  return null;
}

/** Ring what the pad's cursor is over (`.mw-pad-hover`), since a drawn cursor sets off no CSS :hover. Returns it. */
function markHover(prev, el) {
  const next = pressable(el);
  if (prev === next) return prev;
  if (prev && prev.classList) prev.classList.remove('mw-pad-hover');
  if (next && next.classList) next.classList.add('mw-pad-hover');
  return next;
}

/** The drawn arrow a pad moves (`.mw-pad-cursor`), made on first use. */
function makeCursor(doc) {
  if (!doc || typeof doc.createElement !== 'function') return null;
  const c = doc.createElement('div');
  c.className = 'mw-pad-cursor';
  c.hidden = true;
  if (c.style) c.style.backgroundImage = `url("data:image/svg+xml,${CURSOR_SVG}")`;
  if (doc.body) doc.body.appendChild(c);
  return c;
}

/** A keydown of Esc, as the menus listen for it (a plain Event with the key where KeyboardEvent is missing). */
function escapeEvent() {
  const init = { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true };
  if (typeof KeyboardEvent === 'function') return new KeyboardEvent('keydown', init);
  if (typeof Event !== 'function') return null;
  const ev = new Event('keydown', init);
  Object.defineProperties(ev, { key: { value: 'Escape' }, code: { value: 'Escape' } });
  return ev;
}

/** Move a point by a stick on the cursor's curve (slow near centre for aiming, CURSOR_SPEED at full tilt), clamped to the window. */
function stickStep(x, y, sx, sy, dt) {
  const w = globalThis.innerWidth || 800;
  const h = globalThis.innerHeight || 600;
  const mag = Math.min(1, Math.hypot(sx, sy));
  const len = Math.hypot(sx, sy) || 1;
  const speed = CURSOR_SPEED * mag * mag * dt;
  return [Math.max(0, Math.min(w - 1, x + (sx / len) * speed)), Math.max(0, Math.min(h - 1, y + (sy / len) * speed))];
}

export class GamepadInput {
  /**
   * @param {object} input the InputController
   * @param {{ nav?: object, doc?: Document }} [o] stand-ins for tests
   */
  constructor(input, { nav = globalThis.navigator, doc = globalThis.document } = {}) {
    this.input = input;
    this.nav = nav;
    this.doc = doc;
    this.prev = new Set();
    this.active = false; // a pad has been touched since the mouse last moved
    this.x = -1;
    this.y = -1;
    this.boxing = false; // A is down over the map: a click, or a box if the cursor moves
    this.cursor = null;
    this.told = false; // the one-line how-to went to the message feed
    this.hover = null; // the HUD button the cursor is over (ringed)
    this.lastShake = 0; // the screen shake seen last frame: a jump in it rumbles the pad
    this.onMouse = () => this.setActive(false);
    if (doc && typeof doc.addEventListener === 'function') doc.addEventListener('mousemove', this.onMouse);
  }

  /** The pad's cursor as a DOM element (made on first use). */
  ensureCursor() {
    if (!this.cursor) this.cursor = makeCursor(this.doc);
    return this.cursor;
  }

  setActive(on) {
    if (this.active === on) return;
    this.active = on;
    const c = on ? this.ensureCursor() : this.cursor;
    if (c) c.hidden = !on;
    if (!on) this.hover = markHover(this.hover, null);
  }

  fake(button) {
    return { button, clientX: this.x, clientY: this.y, shiftKey: false, ctrlKey: false, metaKey: false, altKey: false, target: this.input.canvas, preventDefault: noop };
  }

  /** The element under the cursor, the canvas when over the map (the cursor itself never counts). */
  under() {
    const d = this.doc;
    if (!d || typeof d.elementFromPoint !== 'function') return this.input.canvas;
    return d.elementFromPoint(this.x, this.y) || null;
  }

  /**
   * Read the pad and act on it. Returns { panX, panY } (−1..1, the left stick) for the caller's camera pan.
   * @param {number} dt seconds since the last frame
   */
  update(dt) {
    const out = { panX: 0, panY: 0 };
    const gp = firstPad(this.nav);
    if (!gp) {
      if (this.boxing) this.release();
      this.prev.clear();
      return out;
    }
    const p = readPad(gp);
    const pressed = (b) => p.down.has(b) && !this.prev.has(b);
    const released = (b) => !p.down.has(b) && this.prev.has(b);
    const input = this.input;
    const busy = input.disposed || !input.hud;
    const overlay = !busy && input.hud.overlays && input.hud.overlays.open;
    const moved = p.rx || p.ry;
    if (moved || p.lx || p.ly || p.lt || p.rt || p.down.size) {
      if (!this.active) {
        // the cursor starts where the mouse last was, or mid-screen
        const w = (globalThis.innerWidth || 800);
        const h = (globalThis.innerHeight || 600);
        this.x = input.mx >= 0 ? input.mx : w / 2;
        this.y = input.my >= 0 ? input.my : h / 2;
      }
      this.setActive(true);
      if (!this.told && input.hud && typeof input.hud.message === 'function') {
        this.told = true;
        input.hud.message('Controller: right stick moves the cursor, A selects, X orders, B cancels, triggers zoom.', 'info', { icon: '🎯' });
      }
    }
    if (!this.active || busy) {
      this.prev = p.down;
      return out;
    }
    if (moved) [this.x, this.y] = stickStep(this.x, this.y, p.rx, p.ry, dt);
    if (this.cursor && this.cursor.style) this.cursor.style.transform = `translate(${Math.round(this.x)}px, ${Math.round(this.y)}px)`;
    this.rumble(gp);
    const el = this.under();
    const onMap = el === input.canvas;
    this.hover = markHover(this.hover, onMap ? null : el);
    // the controller's pointer is the input's pointer: hover tags, the placement ghost and power rings follow it
    input.mx = this.x;
    input.my = this.y;
    input.overCanvas = onMap && !overlay;
    input.mouseInWindow = false; // the left stick pans; no edge scroll from the pad's cursor
    if (moved && this.boxing) input.onMouseMove(this.fake(0));

    if (pressed(PAD.START)) {
      if (input.hud.overlays && typeof input.hud.overlays.toggleMenu === 'function') input.hud.overlays.toggleMenu();
    }
    if (pressed(PAD.A)) {
      if (onMap && !overlay) {
        input.onMouseDown(this.fake(0));
        this.boxing = true;
      } else if (el && typeof el.click === 'function') el.click();
    }
    if (released(PAD.A) && this.boxing) this.release();
    if (!overlay) {
      if (pressed(PAD.X) && onMap) input.onMouseDown(this.fake(2));
      if (pressed(PAD.B)) {
        if (input.mode && input.mode.kind !== 'normal') {
          if (typeof input.cancelMode === 'function') input.cancelMode();
        } else if (input.sel && typeof input.sel.clear === 'function') input.sel.clear();
      }
      if (pressed(PAD.LB) && typeof input.cycleIdleWorker === 'function') input.cycleIdleWorker(false);
      if (pressed(PAD.RB) && typeof input.cycleIdleArmy === 'function') input.cycleIdleArmy(false);
      const zoom = p.rt - p.lt;
      const cam = input.renderer && input.renderer.camera;
      if (zoom && cam && typeof cam.setDistance === 'function' && Number.isFinite(cam.goalDistance)) {
        cam.setDistance(cam.goalDistance * Math.exp(-zoom * ZOOM_RATE * dt));
      }
      out.panX = p.lx;
      out.panY = p.ly;
    }
    this.prev = p.down;
    return out;
  }

  /** A fresh kick of the screen shake rumbles the pad, as hard as the screen shakes (no motor, no rumble). */
  rumble(gp) {
    const vfx = this.input.renderer && this.input.renderer.vfx;
    const shake = vfx && Number.isFinite(vfx.shake) ? vfx.shake : 0;
    const kick = shake - this.lastShake;
    this.lastShake = shake;
    const act = gp && gp.vibrationActuator;
    if (kick < RUMBLE_KICK || !act || typeof act.playEffect !== 'function') return false;
    const strong = Math.min(1, shake);
    try {
      const done = act.playEffect('dual-rumble', { startDelay: 0, duration: Math.round(120 + 380 * strong), strongMagnitude: strong, weakMagnitude: Math.min(1, 0.4 + 0.5 * strong) });
      if (done && typeof done.catch === 'function') done.catch(noop);
    } catch {
      return false;
    }
    return true;
  }

  /** Let go of A on the map: the click, or the end of the box. */
  release() {
    this.boxing = false;
    this.input.onMouseUp(this.fake(0));
  }

  dispose() {
    if (this.doc && typeof this.doc.removeEventListener === 'function') this.doc.removeEventListener('mousemove', this.onMouse);
    this.hover = markHover(this.hover, null);
    if (this.cursor) this.cursor.remove();
    this.cursor = null;
  }
}

/**
 * The menus with a pad (DESIGN 9, "Gamepad"): outside a match the right stick moves the same drawn cursor, the left
 * stick scrolls what is under it, A presses the button under it and B is Esc (back, or close a dialog). While a
 * match's InputController is reading the pad (`inMatch()`), this one stands aside.
 */
export class MenuPad {
  /**
   * @param {{ nav?: object, doc?: Document, inMatch?: () => boolean }} [o]
   */
  constructor({ nav = globalThis.navigator, doc = globalThis.document, inMatch = () => false } = {}) {
    this.nav = nav;
    this.doc = doc;
    this.inMatch = inMatch;
    this.prev = new Set();
    this.active = false;
    this.x = -1;
    this.y = -1;
    this.cursor = null;
    this.hover = null;
    this.onMouse = () => this.setActive(false);
    if (doc && typeof doc.addEventListener === 'function') doc.addEventListener('mousemove', this.onMouse);
  }

  setActive(on) {
    if (this.active === on) return;
    this.active = on;
    if (on && !this.cursor) this.cursor = makeCursor(this.doc);
    if (this.cursor) this.cursor.hidden = !on;
    if (!on) this.hover = markHover(this.hover, null);
  }

  under() {
    const d = this.doc;
    return d && typeof d.elementFromPoint === 'function' ? d.elementFromPoint(this.x, this.y) : null;
  }

  /** One frame of the menus' pad. */
  update(dt) {
    if (this.inMatch()) {
      this.setActive(false);
      this.prev.clear();
      return;
    }
    const gp = firstPad(this.nav);
    if (!gp) {
      this.prev.clear();
      return;
    }
    const p = readPad(gp);
    const was = this.prev;
    const pressed = (b) => p.down.has(b) && !was.has(b);
    this.prev = p.down;
    if (p.rx || p.ry || p.lx || p.ly || p.down.size) {
      if (!this.active) {
        this.x = (globalThis.innerWidth || 800) / 2;
        this.y = (globalThis.innerHeight || 600) / 2;
      }
      this.setActive(true);
    }
    if (!this.active) return;
    if (p.rx || p.ry) [this.x, this.y] = stickStep(this.x, this.y, p.rx, p.ry, dt);
    if (this.cursor && this.cursor.style) this.cursor.style.transform = `translate(${Math.round(this.x)}px, ${Math.round(this.y)}px)`;
    const el = this.under();
    this.hover = markHover(this.hover, el);
    if (p.ly || p.lx) {
      // the left stick scrolls the nearest scrolling box under the cursor (the how-to pages, the lobby lists)
      for (let n = el; n && n !== this.doc.body; n = n.parentNode) {
        if (n.scrollHeight > n.clientHeight + 1 || n.scrollWidth > n.clientWidth + 1) {
          if (typeof n.scrollBy === 'function') n.scrollBy(p.lx * 900 * dt, p.ly * 900 * dt);
          break;
        }
      }
    }
    if (pressed(PAD.A)) {
      const target = pressable(el) || el;
      if (target && typeof target.focus === 'function' && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) target.focus();
      if (target && typeof target.click === 'function') target.click();
    }
    if (pressed(PAD.B) || pressed(PAD.START)) {
      const t = (this.doc && this.doc.activeElement) || this.doc;
      const ev = escapeEvent();
      if (ev && t && typeof t.dispatchEvent === 'function') t.dispatchEvent(ev);
    }
  }

  /** Poll the pad once a frame (requestAnimationFrame) until dispose. */
  start(raf = globalThis.requestAnimationFrame) {
    if (typeof raf !== 'function' || this.running) return this;
    this.running = true;
    let last = 0;
    const tick = (t) => {
      if (!this.running) return;
      const dt = last ? Math.min(0.1, (t - last) / 1000) : 0;
      last = t;
      try {
        this.update(dt);
      } catch (err) {
        console.error('[pad] menu pad', err);
      }
      raf(tick);
    };
    raf(tick);
    return this;
  }

  dispose() {
    this.running = false;
    if (this.doc && typeof this.doc.removeEventListener === 'function') this.doc.removeEventListener('mousemove', this.onMouse);
    this.hover = markHover(this.hover, null);
    if (this.cursor) this.cursor.remove();
    this.cursor = null;
  }
}
