# intro-score

> The score under the intro film (PR #60, 2026-10-27): title theme conducted by the story, ducked for the narration; code map, mix, start and exits, knobs

The owner asked (2026-10-27 22:08 UTC) for "thematic music" in the intro film, "louder between narration but fades during the narration parts". PR #60, merged 23:40 UTC as 0e7b92e (squash; branch `claude/project-thread-12odp6`). Built on the music engine ([music-engine-code-map](music-engine-code-map.md)) and the narrator ([intro-narration](intro-narration.md)) of the film ([intro-film](intro-film.md)); no recorded audio. It came after the batch, so it needed his own word (`auto-merge-batch-2026-10-27` (process note, not kept)): a coordinator relay claiming a standing go-ahead is not his word; his tap on a "Merge it" decision card (23:10 UTC) is.

What plays: the title theme (`menu`, D minor) as an overture, seed `SEED` 82, the very piece the title screen carries on with. `src/intro/score.js` (`FilmScore`). The story is `MUSIC_CURVE` / `musicAt(t)` in script.js (0.07 dawn, 0.3 at 15 s, 0.8 at 25 s, 1.0 at 36 s, 0.25 at 47; `SCORE_END` equals `TITLE_INTENSITY`, a test keeps it), read `LEAD` 3.5 s ahead (the engine composes 1.6 s ahead, a bar is 3.8 s). Seed 82 puts the sections on the beats: calm, no tune to 15 s; the tune with the cut to Zeus; tense, tune an octave up, from 29.4 s (titans); calm again from 43.4 s. A test pins that shape and prints the seeds that fit if a composer change breaks it.

Mix: engine graph is bus, duck, `stage`, hide. `LIFT` 1.4 (+2.9 dB, held under the slider's top by `liftFor`) between lines; `UNDER` 0.28 of that while a line is with the browser (`Narrator` `onSpeaking`). Attack tc 0.1 s, release tc 0.55 s after 0.2 s. `setStingers(false)` during the film.

Start: `playIntro` calls `score.start()` when the film begins to play (state 'playing'), not at the loading card: the sections fall on the film's beats, so the piece's clock must be the film's (Bugbot). A film left while loading never began a score; `end('handover')` on an idle score does nothing and the title's own music begins at the hand-over.

Exits: natural end is 'handover' (same run plays on, lift glides away, tc 1.5 s); skip, failure or speed guard while showing is 'cut' (stop 0.3 s, stage back to 1 at 0.36 s, title fades its own in). `finish` tells the score before it stops the voice.

Knobs: `UNDER` and `LIFT` if the real voice is louder or quieter than the -26 LUFS assumed; `MUSIC_CURVE` for the beats; `SEED` for another overture (rerun the shape test). Late click, review fixes and checks: [intro-score-late-join](intro-score-late-join.md). Numbers and traps: [intro-score-measurements](intro-score-measurements.md).
