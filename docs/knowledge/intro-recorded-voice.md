# intro-recorded-voice

> Intro narration as recorded Kokoro clips (PR #72, 2026-10-28): voice bm_george chosen by the owner, render recipe, voiceover.js, fallback, checks

The owner (2026-10-28) found the browser speechSynthesis narration ([intro-narration](intro-narration.md)) robotic. PR #72 (squash-merged b58eb0b, 15:53 UTC, on his standing "push/merge on completion") replaced it with recorded clips; he picked voice A "George" (Kokoro `bm_george`, deep British) from three 47 s previews (score + voice) in (an off-repo folder, not kept) (B was bm_fable, C am_michael).

- Render: `tools/narration/render.py` (Kokoro-82M via `pip install kokoro-onnx soundfile`; model files from the GitHub release thewh1teagle/kokoro-onnx model-files-v1.0, since huggingface.co is blocked by the sandbox proxy; PyPI and github.com work). Speed 0.85, EQ, loudnorm -20 LUFS / -2 dBTP, mono MP3 64k in `assets/narration/` (~90 KB). Pages workflow copies `assets/`.
- Play: `src/intro/voiceover.js` `RecordedSpeech` mimics `{synth, Utterance}` so `Narrator` is unchanged; plays through `sfx.shared.master` (+0.12 reverb send), LEAD 0.15 s. Fallback to browser voice per line (no Web Audio, fetch/decode failure, clip not there after WAIT 1.5 s). Suspended ctx >0.4 s = `not-allowed`. `?voice=browser` forces the old voice; the old tool scenes (--narration, --music, --sound) now load with it.
- Checks: tests/intro/voiceover.test.js; `node tools/shot-intro.mjs --voice` (real clips in Chromium, ~2 min; steps the manual film in real time, or lines queue).
- Intelligibility check without ears: pocketsphinx (pip, model bundled) transcribes the clips (British "war" reads as "wall", expected).

**How to apply:** a changed caption needs a re-render and a new entry in VOICE_CLIPS; a new voice is a `--voice` flag on render.py.
