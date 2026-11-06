// Photo mode (DESIGN 9, "Photo mode"): Alt+H (or the game menu's Photo Mode) hides the interface and the overlays
// (health bars, selection rings, markers) for a clean view of the battle; the camera still moves as ever. P saves
// the picture as a PNG; Esc or Alt+H again brings the interface back. The match goes on meanwhile (a game against
// the computer can be paused from the menu first). The DOM side lives here; Game draws the frame and reads the canvas.

const TIP_MS = 3500;

/** What a key press means in or for photo mode: 'toggle', 'exit', 'shot', or null. `on`: photo mode is on. */
export function photoKey(e, on) {
  if (!e) return null;
  const h = e.code === 'KeyH' || e.key === 'h' || e.key === 'H';
  if (e.altKey && !e.ctrlKey && !e.metaKey && h) return 'toggle';
  if (!on) return null;
  if (e.key === 'Escape') return 'exit';
  if (!e.altKey && !e.ctrlKey && !e.metaKey && (e.code === 'KeyP' || e.key === 'p' || e.key === 'P')) return 'shot';
  return null;
}

/** A file name for a picture taken at `date`: mythic-war-2026-11-06-2215.png */
export function photoFileName(date = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `mythic-war-${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}-${p(date.getHours())}${p(date.getMinutes())}${p(date.getSeconds())}.png`;
}

export class PhotoMode {
  /** @param {{ root: HTMLElement|null, onChange?: (on: boolean) => void }} o root: #hud-root */
  constructor({ root, onChange = () => {} } = {}) {
    this.root = root;
    this.onChange = onChange;
    this.on = false;
    this.tip = null;
    this.tipTimer = 0;
  }

  set(on) {
    on = !!on;
    if (on === this.on) return false;
    this.on = on;
    if (this.root && this.root.classList) this.root.classList.toggle('is-photo', on);
    if (on) this.showTip('Photo mode · P saves a picture · Esc or Alt+H brings the interface back');
    else this.hideTip();
    this.onChange(on);
    return true;
  }

  toggle() {
    return this.set(!this.on);
  }

  showTip(text) {
    if (!this.root || typeof document === 'undefined') return;
    if (!this.tip) {
      this.tip = document.createElement('div');
      this.tip.className = 'hud-photo-tip';
      this.tip.setAttribute('role', 'status');
      this.root.appendChild(this.tip);
    }
    this.tip.textContent = text;
    this.tip.classList.remove('is-gone');
    clearTimeout(this.tipTimer);
    this.tipTimer = setTimeout(() => this.tip && this.tip.classList.add('is-gone'), TIP_MS);
  }

  hideTip() {
    clearTimeout(this.tipTimer);
    if (this.tip) this.tip.remove();
    this.tip = null;
  }

  dispose() {
    this.hideTip();
    if (this.root && this.root.classList) this.root.classList.remove('is-photo');
    this.on = false;
  }
}

/** Save a canvas as a PNG download (in the same task as the frame that drew it, so a WebGL canvas still holds it). */
export function saveCanvas(canvas, name = photoFileName(), done = () => {}) {
  if (!canvas || typeof canvas.toBlob !== 'function' || typeof URL === 'undefined' || typeof document === 'undefined') return done(false);
  canvas.toBlob((blob) => {
    if (!blob) return done(false);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    done(true);
  }, 'image/png');
}
