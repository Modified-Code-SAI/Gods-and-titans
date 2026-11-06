// The computer players' spoken lines (DESIGN 10.1): as a taunt card comes up, its words are said in the voice of the
// speaker's pantheon (src/ai/taunt-voices.js, the clips in assets/narration/taunts), just after the taunt's war drums.
// It follows the AI voices and AI chatter settings and the volume, the music steps back while it speaks, and a new
// taunt cuts off the one being said. A line with no clip is shown and not said (never the browser's robot voice).
//
//   const voice = new TauntVoice();
//   voice.preload(['norse', 'aztec']);      // the AI pantheons of the match: their clips download at once
//   voice.say(line, 'norse');               // line = { text }, as it arrived in chat
//   voice.stop();                           // leaving the match
import { tauntClip, tauntClips } from '../ai/taunt-voices.js';
import { RecordedSpeech } from '../intro/voiceover.js';
import { sfx } from '../audio/sfx.js';
import { music } from '../audio/music.js';
import { getSettings } from '../settings.js';

export const TAUNT_LEAD = 0.55; // seconds after the card: the taunt's two drum blows, then the words over its brass
const WORDS_PER_SECOND = 2.6; // the voices' pace, for how long the music stays down
const DUCK = 0.5;

export class TauntVoice {
  /**
   * @param {object} [o]
   * @param {(pantheon: string) => object|null} [o.makeSpeech] a speech for one pantheon's clips ({ synth, Utterance }); tests pass their own
   * @param {() => object} [o.settings] getSettings
   * @param {{ duck: Function }|null} [o.music]
   */
  constructor({ makeSpeech = defaultSpeech, settings = getSettings, music: m = music } = {}) {
    this.makeSpeech = makeSpeech;
    this.settings = settings;
    this.music = m;
    this.speeches = new Map(); // pantheon → speech (or null when it could not be made)
  }

  get enabled() {
    const s = this.settings();
    return s.aiVoices !== false && s.aiChat !== false && s.volume > 0;
  }

  speechFor(pantheon) {
    if (!this.speeches.has(pantheon)) {
      let sp = null;
      try {
        sp = tauntClips(pantheon).length ? this.makeSpeech(pantheon) : null;
      } catch (err) {
        console.warn('[taunts] no voice for', pantheon, err);
      }
      // (made before the sound engine started: try again next time)
      if (sp) this.speeches.set(pantheon, sp);
      return sp;
    }
    return this.speeches.get(pantheon);
  }

  /** Start downloading these pantheons' clips (nothing when the voices are off). */
  preload(pantheons) {
    if (!this.enabled) return;
    for (const p of new Set(pantheons || [])) if (typeof p === 'string') this.speechFor(p);
  }

  /** Say a computer player's line; false when it is not said (voices off, no clip for it, no sound). */
  say(line, pantheon) {
    if (!line || !this.enabled) return false;
    const file = tauntClip(pantheon, line.text);
    if (!file) return false;
    const sp = this.speechFor(pantheon);
    if (!sp) return false;
    this.stop();
    try {
      const u = new sp.Utterance(file);
      const n = String(line.text).split(/\s+/).length;
      u.onstart = () => {
        if (this.music && typeof this.music.duck === 'function') this.music.duck(DUCK, TAUNT_LEAD + n / WORDS_PER_SECOND);
      };
      sp.synth.speak(u);
      return true;
    } catch (err) {
      console.warn('[taunts] could not say a line', err);
      return false;
    }
  }

  stop() {
    for (const sp of this.speeches.values()) {
      try {
        sp.synth.cancel();
      } catch {
        // nothing being said
      }
    }
  }
}

function defaultSpeech(pantheon) {
  if (!sfx.shared || typeof fetch !== 'function') return null;
  const clips = {};
  for (const c of tauntClips(pantheon)) clips[c.file] = c.file; // (spoken by file name: a line naming the enemy has no fixed text)
  return new RecordedSpeech({ clips, fallback: null, lead: TAUNT_LEAD });
}
