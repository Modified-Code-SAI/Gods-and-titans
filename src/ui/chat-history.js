// Chat recall (DESIGN 9, "Chat"): the lines this player sent, so Up in the chat box brings the last one
// back (to send again or mend) and Down walks forward again to an empty box, the way a terminal does.
// Kept for this page only; nothing is stored or sent.

const KEEP = 20;

export class ChatHistory {
  constructor(keep = KEEP) {
    this.keep = keep;
    this.lines = [];
    this.at = 0; // where Up/Down stands: lines.length is the fresh, empty line
  }

  /** A line was sent: keep it (not twice in a row) and stand at the fresh line again. */
  add(line) {
    const s = typeof line === 'string' ? line.trim() : '';
    if (s && this.lines[this.lines.length - 1] !== s) {
      this.lines.push(s);
      if (this.lines.length > this.keep) this.lines.shift();
    }
    this.reset();
  }

  /** The chat box opened: Up starts from the newest line. */
  reset() {
    this.at = this.lines.length;
  }

  /** Up (-1) or Down (+1): the text the box shows now, or null when there is nowhere to go. */
  step(dir) {
    const next = this.at + (dir < 0 ? -1 : 1);
    if (next < 0 || next > this.lines.length) return null;
    this.at = next;
    return next === this.lines.length ? '' : this.lines[next];
  }
}
