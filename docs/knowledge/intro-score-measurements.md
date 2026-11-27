# intro-score-measurements

> What was measured (never heard) for the intro film's score, how the previews were made, and the traps met

For [intro-score](intro-score.md). Nobody has heard it; every level is a measurement against an assumed voice.

Offline (ffmpeg `ebur128`): a flite stand-in voice at -26 LUFS, Music slider 0.5. The score is -40..-34 LUFS under the voice (14 to 8 dB below it, closer as the story swells), -29..-23.5 between lines (+10 to +14 dB), -26.7 LUFS over the film, peak -11 dBFS before the voice; the mix peaks at -9.5 dBFS. Real browsers' voices may be 6 dB louder or quieter than -26, which is why `UNDER` and `LIFT` are the knobs.

Real Chromium: `node tools/shot-intro.mjs --music` (three scenes, about 3 min; `--scenes 2` for one) runs the page's overlay, narrator and engine over a film with no renderer in real time and a stand-in voice that takes time, and reads the live stage gain and an analyser on the `hide` node. Found: stage 0.39 under every line, 1.40 between; stingers off in the film and back after; the same run carries into the title; after a cut the 2 s hall rings on about 16 dB down (its return bypasses the run's fade), harmless.

Previews for the owner: (an off-repo folder, not kept) (MP3 with the stand-in voice, MP3 music only). Recipe: lines from `ffmpeg -f lavfi -i flite=text=...:voice=kal16`, `atempo=0.9`, gain to -26 LUFS; windows [caption.from, from + 0.2 + length]; `node tools/music-render.mjs --film --speech a-b,...`; `adelay` at from + 0.2; `amix normalize=0`; `alimiter`. The film's sfx cues are not in it.

Traps: `FakeParam.value` must follow automation (`setStage` reads it before cancelling). `stage.gain.value` is set in `_attach`, or a score begun before the context exists comes up unmixed. The tool's autoplay flag does not change the sound engine's click rule. `conduct()` skips the engine's easing and `playTitleMusic()`'s `setIntensity(0.25)` then matches, so no seam. A check window that straddles a line's start averages the duck wrongly: take the 400 ms before.
