# intro-narration

> Spoken narration for the intro film (PR #57, merged): browser speechSynthesis reads CAPTIONS, Narration setting, click-to-unlock hint, code map, real-browser check, what was not checked

The owner asked (2026-10-27, 20:49 UTC) for the intro film ([intro-film](intro-film.md)) to be narrated, saying what its captions say. Built as the browser's `speechSynthesis` reading `CAPTIONS` (src/intro/script.js); no recorded audio. Merged as PR #57 (afbb84e, 21:14 UTC) when the owner tapped "Merge it" on a decision card 5 minutes after un-drafting; Tests and Deploy green by 21:17. Codex's reviews were clean, Cursor's security agent passed, Bugbot was still running with nothing posted.

Code map:
- `src/intro/narrator.js`: `createNarrator({ speech, volume, captions, onBlocked, onSpeaking })`, `browserSpeech()`. `update(t)` says each caption once as the film second passes its `from` (one already over is skipped), `retry()` after a click, `stop()` cancels for good. `onSpeaking(on)` fires as a line is handed over (before `speak`) and when none is left (`end`/`error` event, the caption running out, or `stop()`), which is what ducks the score. Knobs: `LANG` en-US, `RATE` 0.9, `PITCH` 0.9, `LATE` 1.2 s. No voice is picked by name (a macOS list can open on a novelty voice) and nothing is cancelled before a speak (Chrome can drop a speak right after a cancel; lines queue instead).
- `src/ui/intro.js`: `playIntro({ narrate, volume, createVoice })`; `paint` feeds `voice.update(view.t)`, `finish` calls `voice.stop()` first so every exit cuts the voice before the dip, a click on the overlay calls `retry()`, and `.mw-intro-hint` ("Click for sound" since the score, [intro-score](intro-score.md)) shows under class `needs-click`, up while the voice is refused or the score waits for a click.
- `narration` setting (default true, independent of `intro`): src/settings.js, a toggle in src/ui/menu.js, `watchIntro` in src/main.js.

The rule to know: Chrome refuses `speak()` until the page has had a click or a key (an `error` event `not-allowed`), like the film's sfx on a cold load; hence the hint. "Watch it now" speaks at once. Since [autoplay-first-visit](autoplay-first-visit.md) the film waits at a one-key card where the browser keeps audio off, so the voice normally starts allowed; `--narration` scene 4 begins at that card with a key, and its scenes 1 to 3 click once at the title first (nothing else unlocks the real audio there, so the score's own wait would otherwise put the hint up).

Checks: tests/intro/narrator.test.js, the narration section of tests/ui/intro.test.js, tests/ui/settings.test.js, and `node tools/shot-intro.mjs --narration` (18 checks, about 4 minutes on software GL; a stand-in synth records the calls). A fresh clone needs `ln -s /opt/node-tools/node_modules node_modules` plus `node_modules` in .git/info/exclude (.gitignore's `node_modules/` misses a symlink).

Not checked: how it sounds (no audio in the sandbox; nobody had heard it at merge), Firefox, Safari (it may stay silent until a click it cannot report). If the voice is off, `RATE` and `PITCH` come first.

**Why:** the film was silent apart from sound effects; the owner wanted the captions voiced.
**How to apply:** keep a lengthened caption's speech within 60% of its window (a test checks). It came after the batch, so its merge waited for the owner's tap: `auto-merge-batch-2026-10-27` (process note, not kept).
