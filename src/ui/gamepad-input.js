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
    this.onMouse = () => this.setActive(false);
    if (doc && typeof doc.addEventListener === 'function') doc.addEventListener('mousemove', this.onMouse);
  }

  /** The pad's cursor as a DOM element (made on first use). */
  ensureCursor() {
    if (this.cursor || !this.doc || typeof this.doc.createElement !== 'function') return this.cursor;
    const c = this.doc.createElement('div');
    c.className = 'mw-pad-cursor';
    c.hidden = true;
    if (c.style) {
      c.style.backgroundImage = `url("data:image/svg+xml,${CURSOR_SVG}")`;
    }
    if (this.doc.body) this.doc.body.appendChild(c);
    this.cursor = c;
    return c;
  }

  setActive(on) {
    if (this.active === on) return;
    this.active = on;
    const c = on ? this.ensureCursor() : this.cursor;
    if (c) c.hidden = !on;
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
    if (moved) {
      const w = globalThis.innerWidth || 800;
      const h = globalThis.innerHeight || 600;
      const mag = Math.min(1, Math.hypot(p.rx, p.ry));
      const speed = CURSOR_SPEED * mag * mag * dt; // a curve: slow near centre for aiming, quick at full tilt
      const len = Math.hypot(p.rx, p.ry) || 1;
      this.x = Math.max(0, Math.min(w - 1, this.x + (p.rx / len) * speed));
      this.y = Math.max(0, Math.min(h - 1, this.y + (p.ry / len) * speed));
    }
    if (this.cursor && this.cursor.style) this.cursor.style.transform = `translate(${Math.round(this.x)}px, ${Math.round(this.y)}px)`;
    const el = this.under();
    const onMap = el === input.canvas;
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

  /** Let go of A on the map: the click, or the end of the box. */
  release() {
    this.boxing = false;
    this.input.onMouseUp(this.fake(0));
  }

  dispose() {
    if (this.doc && typeof this.doc.removeEventListener === 'function') this.doc.removeEventListener('mousemove', this.onMouse);
    if (this.cursor) this.cursor.remove();
    this.cursor = null;
  }
}
