# intro-film

> The skippable intro film (PR #56, merged 2026-10-27): what plays, code map, when it plays, how to look at it and change a shot

A 47 s film plays live when the page opens, before the title screen (`parallel-ideas-batch-2026-10-27` (process note, not kept)): dawn flyover of the Greek village, the prayer and Zeus at the temple, the god in profile, the two hosts closing, the melee, Kronos and Surtr, then ten gods (one per pantheon) in a line at dusk. Esc, Enter, Space or the Skip button end it at any time (even while loading) and land on the title. Merged as #56 (3d0ee09); DESIGN.md 11.1 is the spec.

Code map:
- `src/intro/script.js`: pure data and arithmetic. `SHOTS` (from/to, `cut` 'hard' or 'dip', `hours` the sky runs through, camera specs `{at, dx, dy, dist, pitch, yaw, lift, fov}`), `CAPTIONS`, `AUDIO_CUES` (the game's own `sfx` names), `hourAt`, `fadeAt`, `barsAt`, `captionAt`, `cameraAt`. `at` is an anchor, an actor (`zeus`, `kronos`, `surtr`, `thor`) or `crowd`.
- `src/intro/stage.js`: seeded `World` (seed 12345, small map), village, two armies, cues at `CUE_TIMES` (Zeus 11.5, march 17.5 and 19, titans 29.5, ten gods from 36.7 every 0.3 s), Node-runnable.
- `src/intro/film.js`: the clock, eased look-at tracking, `renderer.camera.setFree(pose)`, `atmo.setMode(hourAt(t))`. `sky.js`: the dome for shots that look past the map's edge.
- `src/ui/intro.js` + `intro.css`: the overlay, skip keys, `introWanted`, the 5 fps guard. `src/main.js` `watchIntro` hides the menu, shows it again on hand-over, then `warmUp`.
- Settings "Intro film" field: note, Narration toggle, "Watch it now" (returns to Settings, guard off). No `intro` setting since #119.
- Voice: since PR #57 the browser's speech synthesis reads `CAPTIONS` aloud (`src/intro/narrator.js`, `narration` setting, default true, next to `intro`); it stops before the dip on every exit. See [intro-narration](intro-narration.md). If you lengthen or add a caption, keep its speech inside 60% of its window (a test checks it).

When it plays: EVERY launch, no setting to turn it off (the owner, 2026-10-30: "play every time, no matter what, no off setting; Esc skips"). PR #119 (457519c) removed #111's Intro film choice / `introSeen` and the reduced-motion skip. Still skipped: `?join=`, webdriver (e2e and Playwright tools), `?intro=0` (dev tools), no WebGL 2, the 5 fps guard. Title screen "▶ Intro Film" (#118) and Settings "Watch it now" replay it; Narration keeps its toggle. Do not re-add an off switch or first-launch rule without asking him.

Looking at it: `node tools/shot-intro.mjs --at 2,16,26,42 --sheet --size 640x360 [--quality low|ultra] [--hour H] [--pose x,x,dist,pitch,yaw,lift,fov]` (an `x` leaves a field as the script has it; run one angle per call, then edit SHOTS). The film runs in manual mode, so software GL is enough (a 18-still sheet takes about 65 s). `--flow` checks the page in a browser (about 90 s, [two-tab-browser-check](two-tab-browser-check.md) for the shell traps). Stills at 19 s and 36 s land on the dip's black frames. Share stills as in [render-shot-workflow](render-shot-workflow.md).

To change a shot: edit its camera in `SHOTS`, keep `hours` rising (a jump only behind a dip) and captions off the dips; `tests/intro/script.test.js` checks both. Look traps are in [intro-film-traps](intro-film-traps.md).

Sound on a first visit (PR #61, merged 2026-10-28 as 1d8f7fc): the context is made at page load and the film waits at a one-key card where the browser keeps audio off ([autoplay-first-visit](autoplay-first-visit.md), [browser-autoplay-rules](browser-autoplay-rules.md)); `--sound` checks it in real Chromium. Not done: nobody has watched it at a real frame rate on a GPU (every check was software GL stills). The score under the film (title theme, ducked for the voice) is [intro-score](intro-score.md); `watchIntro` calls `quietMusic()` first, the film starts its own score, and the hand-over either carries it on or starts the title's own.
