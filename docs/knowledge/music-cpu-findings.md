# music-cpu-findings

> What the music costs on the audio thread (PR #58): per-node cost table, the levers that cut it, how to measure it in Chromium, final per-theme numbers and the budget test's limits

Part of [music-engine-code-map](music-engine-code-map.md). The audio thread pays for every live node, so the score is built from few, cheap nodes.

**Measuring.** Chrome DevTools Protocol, `WebAudio.getRealtimeData` gives `renderCapacity` (the share of each render quantum's time budget the audio thread used); `WebAudio.audioNodeCreated` and `audioNodeWillBeDestroyed` give the live graph. Play a scenario in real time in headless Chromium (`--autoplay-policy=no-user-gesture-required`) and sample once a second; an offline render runs as fast as it can and says nothing about cost. The script was a scratchpad one (not committed). Numbers are from a cloud VM, not a laptop: trust the ratios between changes more than the percentages.

**Unit costs (render capacity).** Idle context 3.4%. A sine oscillator about 0.02%, a saw, square or custom-wave oscillator about 0.09% (4.5x). Roughly 0.1% per active node of any kind. Convolver: a 2.8 s stereo impulse response about 5%, 2.0 s mono about 1.3% (cost grows with length times channels). The limiter (DynamicsCompressor) about 0.7%.

**Levers that worked, in the order they were done.** Reverb mono and 2.0 s; filter sweeps and detune on `automationRate = 'k-rate'` (3 to 5 times cheaper); vibrato as one `setValueCurveAtTime` curve instead of an LFO oscillator plus gain; one shared panner per layer and position (`PAN_STEP` 0.15); notes created just in time; then the lean recipes: envelope tails cut 45 dB below the peak so voices end sooner, a lead's parallel band-pass formant replaced by one `peaking` filter, breath noise from the shared noise buffer, a lead's quieter oscillators sharing one gain.

**Result** (render capacity mean, headless Chromium): calm (intensity 0.1) 4.6 to 7.4% over the eleven themes, battle (0.9) 8.8 to 13.1%; Aztec is the heaviest (13.1%, 1590 live nodes on average), Mesopotamian the lightest. Single readings spike higher (Celtic battle once read 45.8%); the means are what to compare. Percussion-rich themes (Aztec, West African) were not thinned: the cost was judged acceptable.

**Budget test** (`tests/audio/music-budget.test.js`, fake clock, 70 s per theme): at intensity 0.1 at most 42 sources playing on average, 62 at once, 32 nodes created a second; at 0.9 at most 60, 100 and 185; a battle must have more voices than a calm bar but under 3 times. Measured today: 21 to 32 sources on average calm, 34 to 46 battle; 11 to 24 nodes a second calm, 61 to 141 battle. These counts track the real browser's load closely, which is why a test can guard it. A new voice that pushes a theme over a limit fails there before it reaches a laptop.

**How to apply:** before adding a voice, count its nodes per note and check one theme with the CDP numbers; prefer sines and k-rate; raise a limit only with a measured reason.
