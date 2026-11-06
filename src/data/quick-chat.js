// Quick chat (DESIGN 7, "Quick chat"): nine set lines a player can send without typing them, the
// way the old RTS games numbered their taunts. Typing the number alone and pressing Enter sends the
// line, and the chat box shows them as buttons (for a phone, a tablet or a hurried hand). They go
// where the chat box points (all players or the allies), as the words themselves, so nothing new
// rides over the wire and an older game still reads them.

/** The lines, by number 1 to 9. */
export const QUICK_LINES = [
  'Yes.',
  'No.',
  'Attack now!',
  'Help! My base is under attack!',
  'I need gold.',
  'I need wood.',
  'Wait for me.',
  'Ready.',
  'Good game.',
];

/** The short words on each line's button. */
export const QUICK_LABELS = ['Yes', 'No', 'Attack', 'Help', 'Gold', 'Wood', 'Wait', 'Ready', 'GG'];

/**
 * The line a typed text stands for: a lone number 1 to 9 becomes that quick line, anything else
 * stays as typed.
 * @param {string} text the chat text (already trimmed, its "/t " prefix taken off)
 */
export function expandQuick(text) {
  const m = /^([1-9])$/.exec(typeof text === 'string' ? text.trim() : '');
  return m ? QUICK_LINES[Number(m[1]) - 1] : text;
}
