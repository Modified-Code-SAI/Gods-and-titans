# intro-score-late-join

> Intro score on a first visit (audio unlocks at a click): joinAt and Run.skip, the narrator LINE_MAX fix, the engine's new-piece wait, and how PR #60's review findings were answered

Part of [intro-score](intro-score.md). This was written when the sound engine made its context only at the first click, so a first visit's film was silent ("Click for sound", up while the voice is refused or `music.state().waiting`). Since [autoplay-first-visit](autoplay-first-visit.md) the context is made at load and the film waits behind a one-key card, so the film normally begins with audio running; the late join below stays as the fallback for audio that is still off or was suspended again.

Late click: `music.play('menu', { seed, joinAt })`; `FilmScore.joinAt()` answers `{ seconds: film t, levelAt: barLevel }` while the film plays; `Run.skip` composes the earlier bars silently at the story's level for each bar and sounds the bar in progress (held pad chord re-struck, bounded by `MAX_SKIP_BARS` 400). A click at 31 s lands on the titans' tense section. Whether sections after the second carry the tune is seed chance (RNG draws depend on level thresholds): warm equality is not claimed, only the section and mode.

Narrator: a line retried after a click can begin near the end of its caption, so a line's time is `max(caption end, handed over + LINE_MAX 4 s)`; the old failsafe let go too early or never and left the score ducked (Codex).

Engine: a new run waits until `CROSS_DELAY` 0.9 s after any run began to leave (`Run.fadedAt`), so the film's score after `quietMusic()` (Watch it now) does not overlap the title music still dying away (Bugbot). A plain crossfade is unchanged.

Checks: `node tools/shot-intro.mjs --music` (scenes 1 to 4, real Chromium, about 3 min each) reads the page's real Web Audio graph; scene 4 is the late click. Review rounds on #60: Codex P2 x3 and Bugbot Medium x2, all five real, each fixed with a test that fails on the old code (see `pr-review-history` (process note, not kept)). One side effect to know: after a skip (cut) the title's own piece now comes in 0.9 s after the cut, not at the hand-over.
