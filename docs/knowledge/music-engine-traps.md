# music-engine-traps

> Traps in the music engine (PR #58): just-in-time notes, hidden tab, value-curve rules, audio unlock, kit hooks, and that nobody has listened to it yet

Companion to [music-engine-code-map](music-engine-code-map.md).

- A note waiting in the audio graph is not free (the audio thread visits every live node): `PLAY_AHEAD` 0.6 s creates a note just before it sounds, while bars are composed 1.6 s ahead. Do not schedule further out to "be safe".
- Hidden tab: the score fades, then stops making notes after `HIDDEN_QUIET` 1.5 s, because a hidden tab hears nothing and a multiplayer match keeps running there. On show it resumes from the clock and does not play the missed bars to catch up. `tests/audio/music-engine.test.js` holds both cases.
- `setValueCurveAtTime` (vibrato as one curve instead of an LFO) takes a Float32Array and nothing else may be scheduled on that param inside its span; the fake context throws on both, as Chrome does. Reuse the cached curve helper (`vibratoCurve`) in `music-voices.js`.
- Exponential ramps never go to or from zero; envelopes fall 45 dB below their peak and then ramp to 0 in 0.03 s.
- Audio unlock is the sfx engine's: the context is made at load and its gesture handlers resume it. Esc is not a gesture, so a first visit stays silent until a click or another key; the intro film waits behind a card for one ([autoplay-first-visit](autoplay-first-visit.md), [browser-autoplay-rules](browser-autoplay-rules.md)).
- Hooks added to sfx.js for the music: `sfx.shared` (the limiter and context), `sfx.onPlay` (ducking), `kit.noiseBuf`, exported `kit` and `makeNoiseBuffer`. A rename there breaks `music.js`.
- The offline renderer (`renderMusicOffline`) uses an OfflineAudioContext through the same limiter, so its loudness numbers match the live game ([music-loudness-workflow](music-loudness-workflow.md)).
- Nobody has listened. The author cannot hear audio; every claim is a measurement. The owner judges by ear (Settings, Music, Listen): ask what sounds wrong before tuning by numbers.

**Why:** these cost a debugging round each (late notes after a hidden tab, a thrown curve, a silent first visit).
**How to apply:** read this before touching the scheduler, a voice recipe or the unlock path.
