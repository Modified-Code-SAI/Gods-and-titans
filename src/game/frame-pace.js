// Frame pacing (DESIGN 9, "Frame rate"): the Frame rate limit setting draws at most 60 or 30 frames a second, which
// spends less power on a fast screen and runs a laptop or a phone cooler; the Show frame rate setting puts a small
// counter in a corner. Pure, so Node tests drive them: Game.frame asks FrameCap whether this animation frame is due,
// and FpsMeter counts the frames that were drawn.

/** The frame period of each limit, in ms (0: none, every animation frame is drawn). */
export const FRAME_CAP_MS = { off: 0, 60: 1000 / 60, 30: 1000 / 30 };

// A frame may come this much early and still count (the screen's frames do not land on the limit's beat).
const EARLY_MS = 1.5;
// A gap this long (ms) between two drawn frames is a hidden tab, not a frame rate.
const STALL_MS = 5000;

export class FrameCap {
  constructor() {
    this.next = 0;
  }

  /**
   * Whether the animation frame at `now` (ms) should be drawn under a limit of `periodMs` (0 = always).
   * Keeps a beat rather than a gap from the last frame, so a 144 Hz screen held to 60 averages 60, not 48.
   */
  due(now, periodMs) {
    if (!(periodMs > 0)) {
      this.next = 0;
      return true;
    }
    if (now < this.next - EARLY_MS) return false;
    // On the beat; after a stall (a hidden tab, a long frame), start the beat again from now.
    this.next = now - this.next > periodMs ? now + periodMs : this.next + periodMs;
    return true;
  }
}

/** Counts drawn frames and says, twice a second, how many a second and how long each took on average. */
export class FpsMeter {
  constructor({ windowMs = 500 } = {}) {
    this.windowMs = windowMs;
    this.reset();
  }

  reset() {
    this.from = null;
    this.frames = 0;
    this.text = '';
  }

  /** A frame was drawn at `now` (ms). Returns the new text when the window closes, else null. */
  frame(now) {
    if (this.from === null) {
      this.from = now;
      return null;
    }
    this.frames++;
    const span = now - this.from;
    if (span < this.windowMs) return null;
    if (span > STALL_MS) {
      // a stall (a hidden tab): no honest number from it, start over (a slow machine's 1 fps still counts)
      this.from = now;
      this.frames = 0;
      return null;
    }
    const rate = (this.frames * 1000) / span;
    const fps = rate < 9.95 ? rate.toFixed(1) : String(Math.round(rate));
    const ms = (span / this.frames).toFixed(1);
    this.text = `${fps} fps · ${ms} ms`;
    this.from = now;
    this.frames = 0;
    return this.text;
  }
}
