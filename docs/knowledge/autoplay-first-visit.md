# autoplay-first-visit

> Why the intro film was silent on a first visit (browser autoplay lock) and what the early start plus one-key card does; DESIGN 9 and 11.1

The owner (2026-10-28) asked what happened to the intro film's sound and music, found a click brings them, then asked for sound with no click at all. Cause: browsers keep Web Audio and `speechSynthesis` off until the page has had user activation. The sound engine only made its context inside a gesture, every real-browser check ran with `--autoplay-policy=no-user-gesture-required` (so a first visit was never seen), and the "Click for sound" hint was small, dim, top left and only showed once the film was already running. No merge-order regression: after a click the film, score and voice all worked.

Now ([intro-film](intro-film.md), DESIGN 9 and 11.1):
- `sfx.init` makes the context at page load and asks it to run (`unlock()`; handlers on `pointerdown`, `pointerup`, `mousedown`, `click`, `keydown`, `touchend`, visibilitychange). New `sfx.supported`, `sfx.onReady(cb)`.
- A browser that allows sound with no input runs it at once: the film plays with sound from frame one, no card. Where it does not (the default for everyone), `playIntro({ gate })` holds the film at its first frame behind a card, "Press any key or click to begin" ("Tap to begin" on touch), class `is-gated`. `main.js` passes `gate` when the volume is above 0 or the music is on and not muted. Any key but Esc and modifiers, a click or a tap begins it and unlocks in the same event; Esc and Skip still skip.
- The late-join (`joinAt`) and the "Click for sound" hint stay as fallbacks ([intro-score-late-join](intro-score-late-join.md)). Settings note on the Intro film row explains the wait and the site-sound setting.
- What browsers permit, and how to check it: [browser-autoplay-rules](browser-autoplay-rules.md). Check: `node tools/shot-intro.mjs --sound` (four scenes, about 4 min).

Merged as PR #61 (1d8f7fc) on 2026-10-28, 3.5 minutes after un-drafting, on the owner's own "merge it" in the thread (the coordinator's earlier "standing go-ahead" was not used, `auto-merge-batch-2026-10-27` (process note, not kept)). Before the squash: `test` green, Codex code and security reviews and the Cursor Security Agent clean, Bugbot and the Approval Agent still running (`pr-review-history` (process note, not kept)). Open: nobody has heard it, and Firefox, Safari and a real GPU were not tried.

**Why:** a silent film on a first visit looked like a bug; the lock cannot be removed, only started as early as the browser allows and made obvious.
**How to apply:** when changing the intro, the sound engine or their checks, keep the real-browser tools on the browser's own policy (no autoplay flag).
