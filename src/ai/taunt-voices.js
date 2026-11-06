// The spoken voices of the computer players' lines (DESIGN 10.1): every line of src/ai/voice-lines.js is a short clip,
// rendered offline with Kokoro, the open neural voice model the intro film's narrator uses (tools/narration/render.py),
// in one voice per pantheon. The clips live in assets/narration/taunts; src/game/taunt-voice.js plays them as the taunt
// card comes up. This file is pure (no audio, no DOM) so the render tool, the game and the tests share it.
//
// A line about a god or a Titan (`{unit}`) has a clip for each one the pantheon can field. A line naming the other
// player (`{enemy}`) cannot know the name, so its clip says the line without it ("You dare raise a hand against
// Olympus?") while the card still shows it in writing.
import { VOICE_LINES } from './voice-lines.js';
import { godsFor, titanFor } from '../data/index.js';

/** The voice of each pantheon: a Kokoro v1.0 voice and its speed (1 is the model's own pace). The narrator is bm_george. */
export const PANTHEON_VOICES = Object.freeze({
  greek: { voice: 'bm_fable', speed: 0.95 },
  norse: { voice: 'am_fenrir', speed: 0.95 },
  egyptian: { voice: 'bf_emma', speed: 0.92 },
  hindu: { voice: 'af_kore', speed: 0.95 },
  japanese: { voice: 'af_aoede', speed: 0.95 },
  chinese: { voice: 'am_michael', speed: 0.95 },
  aztec: { voice: 'am_puck', speed: 0.97 },
  celtic: { voice: 'af_bella', speed: 0.97 },
  mesopotamian: { voice: 'bf_isabella', speed: 0.92 },
  west_african: { voice: 'af_heart', speed: 0.97 },
});

/**
 * How a name is said (the voice model guesses at words it has never seen). Only the spoken text uses these; the card
 * shows the real spelling. Whole words, matched case-sensitively.
 */
export const SAY_AS = Object.freeze({
  Huitzilopochtli: 'Weet-see-lo-pocht-lee',
  Tezcatlipoca: 'Tess-kaht-lee-poh-kah',
  Quetzalcoatl: 'Ket-sahl-koh-ahtl',
  Tlaloc: 'Tlah-lock',
  Cipactli: 'See-pahkt-lee',
  'Morrígan': 'Morrigan',
  'Nüwa': 'Noo-wah',
  "Chang'e": 'Chahng-uh',
  Susanoo: 'Soo-sah-no',
  Airavata: 'Eye-rah-vah-tah',
  Oya: 'Oh-yah',
  Ogun: 'Oh-goon',
  Lugh: 'Loo',
  Apep: 'Ah-pep',
  Surtr: 'Sert',
  Freyja: 'Fray-ah',
  'Skål': 'Skoal',
  'Ragnarök': 'Ragnarok',
  Duat: 'Doo-aht',
  'Àṣẹ': 'Ah-shay',
  Namaste: 'Nah-mah-stay',
});

/** Lines whose sentence needs the other player's name: what the voice says instead. */
export const SPOKEN_AS = Object.freeze({
  '{enemy} crosses our path. Karma brings us together.': 'You cross our path. Karma brings us together.',
  '{enemy}! The sun will be glad to meet you.': 'You! The sun will be glad to meet you.',
  '{enemy}! Your name is now written on my clay tablets.': 'You! Your name is now written on my clay tablets.',
  'Ah, {enemy} wanders into our forests. Unwise.': 'Ah, a stranger wanders into our forests. Unwise.',
});

const SAY_RE = new RegExp(`(^|[^\\p{L}'])(${Object.keys(SAY_AS).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?![\\p{L}])`, 'gu');

/** A line as the voice says it: the unit filled in, the other player's name left out, the hard names respelled. */
export function spokenText(line, unit = '') {
  let s = (SPOKEN_AS[line] || line).replace(/\{unit\}/g, unit);
  s = s.replace(/,\s*\{enemy\}(?=\s*[,.?!])/g, ''); // "So, {enemy}, we meet" → "So, we meet"; "...Olympus, {enemy}?" → "...Olympus?"
  s = s.replace(/\{enemy\},?\s*/g, '');
  s = s.replace(SAY_RE, (_, pre, w) => pre + SAY_AS[w]);
  return s.replace(/\s{2,}/g, ' ').trim();
}

/** A short hash of a clip's words and voice (FNV-1a), so changed words or a changed voice need a new render. */
function hash6(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0').slice(0, 6);
}

function unitNames(pantheon, trigger) {
  if (trigger === 'titan') {
    const t = titanFor(pantheon);
    return t ? [t.name] : [];
  }
  return godsFor(pantheon).map((g) => g.name);
}

const cache = new Map();

/**
 * Every clip of a pantheon: `{ file, text, trigger, line, unit }` with `file` under assets/narration and `text` what
 * the voice says. Cached.
 */
export function tauntClips(pantheon) {
  if (cache.has(pantheon)) return cache.get(pantheon);
  const lines = VOICE_LINES[pantheon];
  const v = PANTHEON_VOICES[pantheon];
  const out = [];
  if (lines && v) {
    for (const [trigger, list] of Object.entries(lines)) {
      for (const line of list) {
        const units = line.includes('{unit}') ? unitNames(pantheon, trigger) : [''];
        for (const unit of units) {
          const text = spokenText(line, unit);
          out.push({ file: `taunts/${pantheon}-${trigger}-${hash6(`${v.voice}@${v.speed}:${text}`)}.mp3`, text, trigger, line, unit });
        }
      }
    }
  }
  cache.set(pantheon, out);
  return out;
}

const matchers = new Map();

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * The clip for a line a computer player of this pantheon said (the text as it arrived, blanks filled), or null when
 * it is none of theirs (a campaign foe's own line, a line from a newer version of the game).
 */
export function tauntClip(pantheon, text) {
  if (typeof text !== 'string' || !text) return null;
  let m = matchers.get(pantheon);
  if (!m) {
    m = { exact: new Map(), withName: [] };
    for (const c of tauntClips(pantheon)) {
      const filled = c.line.replace(/\{unit\}/g, c.unit);
      if (filled.includes('{enemy}')) m.withName.push({ re: new RegExp(`^${filled.split('{enemy}').map(escapeRe).join('.+')}$`, 'su'), file: c.file });
      else m.exact.set(filled, c.file);
    }
    matchers.set(pantheon, m);
  }
  const hit = m.exact.get(text);
  if (hit) return hit;
  for (const w of m.withName) if (w.re.test(text)) return w.file;
  return null;
}

/** Every clip of every pantheon as { file, text, voice, speed }, for tools/narration/render.py --lines. */
export function allTauntLines() {
  const out = [];
  for (const p of Object.keys(PANTHEON_VOICES)) {
    const v = PANTHEON_VOICES[p];
    for (const c of tauntClips(p)) out.push({ file: c.file, text: c.text, voice: v.voice, speed: v.speed });
  }
  return out;
}
