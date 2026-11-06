// Touch controls for phones and tablets (DESIGN 9, "Touch"). The canvas turns finger gestures into the mouse
// actions the InputController already knows, so every rule (selection, orders, placement, targeting) stays in
// one place:
//
//   tap                → a left click, or the right-click order when own units are selected and the tap is not
//                        on another own unit (move, attack, gather, build; Worshippers go to work)
//   drag one finger    → pans the camera (the middle-button drag)
//   pinch, two fingers → zooms, and the two fingers' midpoint pans
//   hold, then drag    → a selection box (the left-button drag)
//
// Buttons and panels of the HUD are ordinary DOM and take taps as clicks, so only the canvas is handled here.
//
//   tapButton(input, x, y)   → 0 (left) | 2 (right)   which button a tap at window point x, y stands for (pure)
//   TouchInput               the listeners on the canvas (attach / dispose)

/** px a finger may wander before a press stops being a tap. */
export const TAP_SLOP = 10;
/** ms a finger rests before a drag draws a selection box instead of panning. */
export const HOLD_MS = 420;

/** Which mouse button a tap stands for: an order (2) with own units selected, unless it lands on an own unit. */
export function tapButton(input, x, y) {
  if (!input || input.mode.kind !== 'normal') return 0;
  if (!input.sel.ownUnitIds().length) return 0;
  const p = input.canvasPoint(x, y);
  const e = input.pick(p.x, p.y);
  if (e && e.k === 'u' && e.o === input.vs.myIndex) return 0;
  return 2;
}

const noop = () => {};
const stamp = (e) => (Number.isFinite(e.timeStamp) && e.timeStamp > 0 ? e.timeStamp : performance.now());

function fake(input, button, x, y) {
  return { button, clientX: x, clientY: y, shiftKey: false, ctrlKey: false, metaKey: false, altKey: false, target: input.canvas, preventDefault: noop };
}

export class TouchInput {
  constructor(input) {
    this.input = input;
    this.canvas = input.canvas;
    this.press = null; // one finger: { id, x, y, t, mode: 'tap' | 'pan' | 'box' }
    this.pinch = null; // two fingers: { d, mx, my }
    this.holdTimer = 0;
    this.holdMs = HOLD_MS;
    this.offs = [];
    const on = (type, fn) => {
      this.canvas.addEventListener(type, fn, { passive: false });
      this.offs.push(() => this.canvas.removeEventListener(type, fn, { passive: false }));
    };
    on('touchstart', (e) => this.onStart(e));
    on('touchmove', (e) => this.onMove(e));
    on('touchend', (e) => this.onEnd(e));
    on('touchcancel', (e) => this.onEnd(e, true));
    if (this.canvas.style) this.canvas.style.touchAction = 'none';
  }

  busy() {
    const i = this.input;
    return i.disposed || !i.hud || i.hud.overlays.open;
  }

  onStart(e) {
    if (e.cancelable) e.preventDefault(); // no emulated mouse events, no page zoom or scroll
    if (this.busy()) return;
    const ts = e.touches;
    if (ts.length >= 2) {
      this.endPress(true);
      this.pinch = this.pinchOf(ts[0], ts[1]);
      return;
    }
    const t = e.changedTouches[0];
    // t: when the finger went down, on the event clock (a busy frame delays handlers, not the timestamps)
    this.press = { id: t.identifier, x: t.clientX, y: t.clientY, t: stamp(e), mode: 'tap' };
    this.input.mx = t.clientX;
    this.input.my = t.clientY;
    this.input.overCanvas = true;
    // a short buzz, where the phone has one, says a drag from here now draws a box
    clearTimeout(this.holdTimer);
    this.holdTimer = setTimeout(() => {
      if (this.press && this.press.mode === 'tap' && typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') navigator.vibrate(12);
    }, this.holdMs);
  }

  pinchOf(a, b) {
    return { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) || 1, mx: (a.clientX + b.clientX) / 2, my: (a.clientY + b.clientY) / 2 };
  }

  onMove(e) {
    if (e.cancelable) e.preventDefault();
    if (this.busy()) return;
    const ts = e.touches;
    const input = this.input;
    if (this.pinch && ts.length >= 2) {
      const now = this.pinchOf(ts[0], ts[1]);
      const cam = input.renderer && input.renderer.camera;
      if (cam) {
        if (typeof cam.setDistance === 'function' && Number.isFinite(cam.goalDistance)) cam.setDistance(cam.goalDistance * (this.pinch.d / now.d));
        if (typeof cam.panPixels === 'function') cam.panPixels(now.mx - this.pinch.mx, now.my - this.pinch.my);
      }
      this.pinch = now;
      return;
    }
    const p = this.press;
    if (!p) return;
    const t = [...e.changedTouches].find((c) => c.identifier === p.id);
    if (!t) return;
    if (p.mode === 'tap' && Math.hypot(t.clientX - p.x, t.clientY - p.y) > TAP_SLOP) {
      clearTimeout(this.holdTimer);
      // a finger that rested first draws a selection box from where it went down; one that moved at once pans
      p.mode = stamp(e) - p.t >= this.holdMs ? 'box' : 'pan';
      input.onMouseDown(fake(input, p.mode === 'box' ? 0 : 1, p.x, p.y));
    }
    if (p.mode !== 'tap') input.onMouseMove(fake(input, p.mode === 'pan' ? 1 : 0, t.clientX, t.clientY));
  }

  onEnd(e, cancelled = false) {
    if (e.cancelable) e.preventDefault();
    if (this.pinch) {
      if (e.touches.length < 2) this.pinch = null;
      return;
    }
    const p = this.press;
    if (!p) return;
    const t = [...e.changedTouches].find((c) => c.identifier === p.id);
    if (!t) return;
    this.endPress(cancelled, t.clientX, t.clientY);
  }

  /** Finish the one-finger press: a tap becomes a click, a pan or box lets go of its button. */
  endPress(cancelled, x = null, y = null) {
    clearTimeout(this.holdTimer);
    const p = this.press;
    this.press = null;
    if (!p) return;
    const input = this.input;
    const ex = x === null ? p.x : x;
    const ey = y === null ? p.y : y;
    if (p.mode === 'pan') input.onMouseUp(fake(input, 1, ex, ey));
    else if (p.mode === 'box') {
      if (cancelled) {
        input.leftDown = null;
        input.box.hidden = true;
      } else input.onMouseUp(fake(input, 0, ex, ey));
    } else if (!cancelled && !this.busy()) {
      const button = tapButton(input, p.x, p.y);
      input.onMouseDown(fake(input, button, p.x, p.y));
      if (button === 0) input.onMouseUp(fake(input, 0, p.x, p.y));
    }
    // A finger has left the glass: no edge scroll, hover tag or hover ring stays behind where it last touched.
    input.mouseInWindow = false;
    input.overCanvas = false;
  }

  dispose() {
    clearTimeout(this.holdTimer);
    for (const off of this.offs.splice(0)) off();
  }
}
