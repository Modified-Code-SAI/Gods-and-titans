"""Listen to rendered voice clips with Whisper (an open speech-recognition model) and list the ones whose words came out
wrong: a skipped word, a garbled phrase, a clip cut short. It reads the same --lines JSON render.py renders from.

    ./venv/bin/pip install faster-whisper          # the model (base.en, ~150 MB) downloads on first use
    node tools/narration/taunt-lines.mjs > taunts.json
    ./venv/bin/python tools/narration/check.py --lines taunts.json [--clips assets/narration] [--min 0.8] [--json report.json]

Each clip gets a score from 0 to 1: how closely the words heard match the words meant (punctuation and case aside).
A respelled name (a word with a hyphen, src/ai/taunt-voices.js SAY_AS) is left out of the match, since Whisper spells
it its own way. Clips under --min are printed, worst first; the exit code is 1 when there are any.
"""
import argparse, difflib, json, os, re, subprocess, sys

import numpy as np

from faster_whisper import WhisperModel


def words(s):
    return [w for w in re.sub(r"[^a-z0-9' -]", ' ', s.lower().replace('-', ' - ')).split() if w not in ('-',)]


def meant_words(text):
    # a respelled name ("Weet-see-lo-pocht-lee") is skipped whole
    return words(' '.join(w for w in text.split() if '-' not in w.strip('!?.,')))


def score(meant, heard):
    a, b = meant_words(meant), words(heard)
    if not a:
        return 1.0
    m = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    same = sum(bl.size for bl in m.get_matching_blocks())
    return same / len(a)


def load(path):
    """The clip as 16 kHz mono floats (decoded by ffmpeg, which every narration tool already needs)."""
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 's16le', '-ac', '1', '-ar', '16000', '-'], check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype='<i2').astype(np.float32) / 32768.0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--lines', required=True)
    ap.add_argument('--clips', default='assets/narration')
    ap.add_argument('--model', default='base.en')
    ap.add_argument('--min', type=float, default=0.8)
    ap.add_argument('--json', default=None, help='write every clip\'s score and transcript here')
    a = ap.parse_args()
    with open(a.lines) as f:
        lines = json.load(f)
    model = WhisperModel(a.model, device='cpu', compute_type='int8')
    rows = []
    for x in lines:
        path = os.path.join(a.clips, x['file'])
        if not os.path.exists(path):
            rows.append({'file': x['file'], 'text': x['text'], 'heard': None, 'score': 0.0})
            continue
        segs, _ = model.transcribe(load(path), language='en', beam_size=5, vad_filter=False)
        heard = ' '.join(s.text.strip() for s in segs)
        rows.append({'file': x['file'], 'text': x['text'], 'heard': heard, 'score': round(score(x['text'], heard), 3)})
    bad = sorted((r for r in rows if r['score'] < a.min), key=lambda r: r['score'])
    for r in bad:
        print(f"{r['score']:.2f}  {r['file']}\n      meant: {r['text']}\n      heard: {r['heard']}")
    mean = sum(r['score'] for r in rows) / max(1, len(rows))
    print(f'{len(rows)} clips, mean score {mean:.3f}, {len(bad)} under {a.min}')
    if a.json:
        with open(a.json, 'w') as f:
            json.dump(rows, f, indent=2)
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
