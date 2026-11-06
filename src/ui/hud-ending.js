// The ending title (DESIGN 9, "The ending"; game/match-end.js): letterbox bars slide in, the HUD panels fade
// aside, and the result is carved across the middle of the screen until the game-over screen takes over.
import { el } from './hud-dom.js';

/** A press this soon after the ending began is not taken as a skip (a click that was already on its way). */
export const SKIP_AFTER_MS = 700;

/**
 * Play the ending over the HUD root. `done` is called once: after `ms`, or sooner when the player clicks or
 * presses a key. Returns { skip, dispose }.
 * @param {HTMLElement} root the HUD root (.hud)
 * @param {{ title: string, line: string }} words
 * @param {string} result 'victory' | 'defeat' | 'draw' | 'survival' (its colours)
 */
export function playEnding(root, words, result, ms, done) {
  const doc = root.ownerDocument || document;
  const started = Date.now();
  let finished = false;
  const box = el('div', `hud-ending is-${result}`,
    el('div', 'hud-ending-bar is-top'),
    el('div', 'hud-ending-bar is-bottom'),
    el('div', 'hud-ending-card',
      el('div', 'hud-ending-rule'),
      el('div', 'hud-ending-title', words.title),
      el('div', 'hud-ending-line', words.line),
      el('div', 'hud-ending-rule'),
    ),
  );
  box.setAttribute('role', 'status');
  root.appendChild(box);
  root.classList.add('is-ending');
  void box.offsetWidth;
  box.classList.add('is-on');

  const onPress = (e) => {
    if (Date.now() - started < SKIP_AFTER_MS) return;
    if (e && e.type === 'keydown' && (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta')) return;
    finish();
  };
  const timer = setTimeout(() => finish(), ms);
  box.addEventListener('pointerdown', onPress);
  doc.addEventListener('keydown', onPress, true);

  function dispose() {
    clearTimeout(timer);
    box.removeEventListener('pointerdown', onPress);
    doc.removeEventListener('keydown', onPress, true);
    root.classList.remove('is-ending');
    box.remove();
  }
  function finish() {
    if (finished) return;
    finished = true;
    dispose();
    if (typeof done === 'function') done();
  }
  return { skip: finish, dispose, el: box };
}
