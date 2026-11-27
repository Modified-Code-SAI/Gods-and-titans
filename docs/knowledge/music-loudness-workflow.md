# music-loudness-workflow

> How the music was balanced by measurement (no ears): per-instrument loudness targets, the offline render plus ffmpeg ebur128 method, final LUFS per theme, and the tone check after a trim

Part of [music-engine-code-map](music-engine-code-map.md). The author cannot hear audio, so levels were set by numbers; the owner has not yet judged them by ear.

**Method.** (1) One instrument at a time: render a representative note alone (lead mid-range, pad 4 s, bass at MIDI 40, drums at 60) through `playVoice` from `/src/audio/music-voices.js` in `tools/music-lab.html` with an OfflineAudioContext, then `ffmpeg -i f.wav -af ebur128=peak=true -f null -` and read the momentary maximum (M-max, 400 ms) and the peak. (2) Trim by scaling that preset's `level:` or `peak:` (the recipes read them directly), re-render until it is on target. (3) Whole mixes: `node tools/music-render.mjs --out DIR --themes all --level 0.5 --volume 0.5 --seconds 60` per level, then integrated LUFS and true peak from ebur128. (4) Tone: compare third-octave band levels before and after for the same note; a trim should move every band by the same amount (within about 1 dB for tonal instruments).

**M-max targets (LUFS, one note alone).** Leads (every flute, fiddle, erhu, duduk, horn) -19; conch, lur -21; brass -20; plucks, mallet, pads -25; oud, bassPluck -22; drone -27, tanpura -29; taiko, huehuetl -20; djembeBass, bodhran, bayan, tom -20.5; frame -22; cymbal, gong -23. Small percussion (shaker, woodblock, clave, sistrum, slaps, tones) was left at -26 to -35: they are accents.

**Final mixes** (volume 0.5, 60 s, through the sfx limiter): intensity 0.05 gives -31.4 to -33.0 LUFS (true peak -18 to -21 dBFS), 0.5 gives -28.2 to -29.8 (-11 to -14), 0.9 gives -25.9 to -27.2 (-8.6 to -12.7; the Hindu battle mix peaks highest). The ten themes sit within 1.6 dB of each other at each level, so changing pantheon does not change the volume. Sound effects were measured the same way, peak and rms at master gain 1 ([alert-sounds](alert-sounds.md)); `MUSIC_GAIN` 0.63 was balanced against them by those numbers.

**Traps.**
- Read the row of the right preset: `horn` the lead and `brass` the horn-role are different rows (-18.8 and -20.3); one trim went to the wrong one.
- Removing a partial to save nodes can cost a band: dropping the marimba's 10x partial was -26 dB at 2.5 kHz, so it was restored ([music-cpu-findings](music-cpu-findings.md)).
- A cheaper recipe (formant as one peaking filter) lost about 1.2 dB: re-trim after any recipe change.
- The scratchpad scripts (voice-levels, apply-trims, mixes, spec-compare) were not committed; the repo's `tools/music-render.mjs` plus ffmpeg redo steps 3 and 4.

**How to apply:** when the owner says a pantheon or an instrument is too loud or too soft, change its `level`, re-render that one note and the mix, and report the numbers with the by-ear change.
