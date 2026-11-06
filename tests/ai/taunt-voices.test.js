import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { VOICE_LINES, fillLine } from '../../src/ai/voice-lines.js';
import { PANTHEON_VOICES, spokenText, tauntClips, tauntClip, allTauntLines } from '../../src/ai/taunt-voices.js';
import { godsFor, titanFor } from '../../src/data/index.js';
import { TauntVoice } from '../../src/game/taunt-voice.js';

const NARRATION = fileURLToPath(new URL('../../assets/narration/', import.meta.url));

test('every pantheon that speaks has a voice', () => {
  assert.deepEqual(Object.keys(PANTHEON_VOICES).sort(), Object.keys(VOICE_LINES).sort());
  for (const v of Object.values(PANTHEON_VOICES)) {
    assert.match(v.voice, /^[ab][fm]_[a-z]+$/);
    assert.ok(v.voice !== 'bm_george', 'the narrator keeps his own voice');
    assert.ok(v.speed > 0.8 && v.speed <= 1.1);
  }
});

test('the spoken text leaves out the other player and fills the unit', () => {
  assert.equal(spokenText('So, {enemy}, we meet at last.'), 'So, we meet at last.');
  assert.equal(spokenText('You dare raise a hand against Olympus, {enemy}?'), 'You dare raise a hand against Olympus?');
  assert.equal(spokenText('{enemy}! The sun will be glad to meet you.'), 'You! The sun will be glad to meet you.');
  assert.equal(spokenText('{unit} descends from Olympus!', 'Zeus'), 'Zeus descends from Olympus!');
  assert.equal(spokenText('Behold {unit}!', 'Quetzalcoatl'), 'Behold Ket-sahl-koh-ahtl!', 'a hard name is respelled for the voice');
  for (const c of allTauntLines()) {
    assert.ok(!/[{}]/.test(c.text), `no blank left: ${c.text}`);
    assert.ok(/^[A-Za-z]/.test(c.text), `starts with a word: ${c.text}`);
  }
});

test('each line has one clip per god or Titan it can name, and every clip is rendered', () => {
  const files = new Set();
  for (const p of Object.keys(VOICE_LINES)) {
    const clips = tauntClips(p);
    let want = 0;
    for (const [trigger, list] of Object.entries(VOICE_LINES[p])) {
      for (const line of list) want += line.includes('{unit}') ? (trigger === 'titan' ? 1 : godsFor(p).length) : 1;
    }
    assert.equal(clips.length, want, p);
    for (const c of clips) {
      assert.ok(!files.has(c.file), `one file per clip: ${c.file}`);
      files.add(c.file);
      const path = NARRATION + c.file;
      assert.ok(existsSync(path), `rendered: ${c.file} (node tools/narration/taunt-lines.mjs, then render.py --lines)`);
      const size = statSync(path).size;
      assert.ok(size > 3000 && size < 80000, `${c.file} is ${size} bytes`);
    }
  }
});

test('a line as it arrives in chat finds its clip', () => {
  for (const p of Object.keys(VOICE_LINES)) {
    const units = { god: godsFor(p).map((g) => g.name), titan: [titanFor(p).name] };
    for (const [trigger, list] of Object.entries(VOICE_LINES[p])) {
      for (const line of list) {
        const names = line.includes('{unit}') ? (trigger === 'titan' ? units.titan : units.god) : [undefined];
        for (const unit of names) {
          const text = fillLine(line, { unit, enemy: 'Ragnar the Bold' });
          const file = tauntClip(p, text);
          assert.ok(file, `${p}: ${text}`);
          const clip = tauntClips(p).find((c) => c.file === file);
          assert.equal(clip.line, line);
          if (unit) assert.equal(clip.unit, unit);
        }
      }
    }
  }
  assert.equal(tauntClip('greek', 'Hello there'), null, 'not one of theirs');
  assert.equal(tauntClip('greek', ''), null);
  assert.equal(tauntClip('nobody', 'Glory to Olympus! Your names will be forgotten.'), null);
});

function fakeSpeech() {
  const said = [];
  let cancels = 0;
  class Utterance {
    constructor(text) {
      this.text = text;
    }
  }
  return {
    said,
    get cancels() {
      return cancels;
    },
    Utterance,
    synth: {
      speak: (u) => {
        said.push(u.text);
        if (u.onstart) u.onstart();
      },
      cancel: () => cancels++,
    },
  };
}

test('TauntVoice says a line in its pantheon\'s voice, after cutting off the last', () => {
  const made = {};
  const ducks = [];
  let settings = { aiChat: true, aiVoices: true, volume: 0.7 };
  const voice = new TauntVoice({
    makeSpeech: (p) => (made[p] = fakeSpeech()),
    settings: () => settings,
    music: { duck: (d, s) => ducks.push([d, s]) },
  });
  voice.preload(['norse', 'norse', 'greek', false]);
  assert.deepEqual(Object.keys(made).sort(), ['greek', 'norse']);

  assert.equal(voice.say({ text: 'Valhalla calls. I go to drink with heroes.' }, 'norse'), true);
  assert.equal(made.norse.said.length, 1);
  assert.match(made.norse.said[0], /^taunts\/norse-defeat-[0-9a-f]{6}\.mp3$/);
  assert.equal(ducks.length, 1, 'the music steps back');

  assert.equal(voice.say({ text: 'Hubris, Ann. The gods punish hubris.' }, 'greek'), true);
  assert.ok(made.norse.cancels >= 1, 'the line before is cut off');
  assert.match(made.greek.said[0], /^taunts\/greek-struck-/);

  assert.equal(voice.say({ text: 'Not a line of theirs' }, 'greek'), false);
  assert.equal(voice.say({ text: 'Hubris, Ann. The gods punish hubris.' }, 'aztec'), false, 'another pantheon\'s line');

  settings = { aiChat: true, aiVoices: false, volume: 0.7 };
  assert.equal(voice.say({ text: 'Hubris, Ann. The gods punish hubris.' }, 'greek'), false, 'AI voices off');
  settings = { aiChat: false, aiVoices: true, volume: 0.7 };
  assert.equal(voice.say({ text: 'Hubris, Ann. The gods punish hubris.' }, 'greek'), false, 'AI chatter off');
  settings = { aiChat: true, aiVoices: true, volume: 0 };
  assert.equal(voice.say({ text: 'Hubris, Ann. The gods punish hubris.' }, 'greek'), false, 'muted');
});

test('TauntVoice without sound stays quiet and tries again later', () => {
  let ready = false;
  const voice = new TauntVoice({ makeSpeech: () => (ready ? fakeSpeech() : null), settings: () => ({ aiChat: true, aiVoices: true, volume: 1 }), music: null });
  assert.equal(voice.say({ text: 'Glory to Olympus! Your names will be forgotten.' }, 'greek'), false);
  ready = true;
  assert.equal(voice.say({ text: 'Glory to Olympus! Your names will be forgotten.' }, 'greek'), true);
  voice.stop();
});
