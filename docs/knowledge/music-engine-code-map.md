# music-engine-code-map

> Where the background music lives (PR #58, 2026-10-27 batch): files, API, hooks into menu, match, settings and the intro film, tools and tests, how to add a theme or voice

Procedural WebAudio score, no audio files (`parallel-ideas-batch-2026-10-27` (process note, not kept)). DESIGN.md 9 "Music" is the spec; this is the map. Traps are in [music-engine-traps](music-engine-traps.md).

- `src/audio/audio.js`: the hub the UI imports: `initAudio`, `syncAudio(settings, changed)`, `playTitleMusic()` (intensity 0.25), `quietMusic(fade)`, `previewMusic(themeId, intensity)`, `PREVIEW_MOODS` (Calm 0.08, Tense 0.45, Battle 0.9).
- `music.js`: `MusicEngine` (singleton `music`): look-ahead scheduler, layer buses with a mono 2 s reverb, crossfades, `DUCKS` (stingers by sfx name, through `sfx.onPlay`), `renderMusicOffline`. It joins `sfx.shared.out`, so one AudioContext, one unlock and one limiter serve both.
- `music-composer.js` (seeded score; tiers bass 0.1, soft perc 0.18, drive 0.40, war 0.62), `music-theory.js`, `music-themes.js` (data: `menu` plus the ten pantheon ids), `music-voices.js` (49 instruments as recipes over preset tables).
- `src/game/music-director.js`: events become heat (τ 10 s), intensity `1-exp(-heat/55)`; Decade of Peace caps it at 0.3 ([decade-of-peace](decade-of-peace.md)). `game.js` creates it in init and calls `update(dt)`.
- Settings `musicVolume` (0.5) and `musicMuted`: the Settings row (slider, Mute, Listen with theme and mood buttons) in `src/ui/menu.js`, F10 rows in `src/ui/hud-overlays.js`. Volume curve `MUSIC_GAIN 0.63 * v^1.5`.
- Intro film ([intro-film](intro-film.md)): `watchIntro` in `src/main.js` calls `quietMusic()` and `playTitleMusic()` at hand-over; between them the film plays its own score ([intro-score](intro-score.md)) through three engine calls: `conduct(v)` (intensity exactly, no easing), `setStage(gain, tc, delay)` (a fourth gain in the graph, bus, duck, stage, hide) and `setStingers(on)`. `state()` has `stage` and `waiting` (wanted, audible if allowed, only a click missing). `COMPOSE_AHEAD` is exported; `renderMusicOffline` takes `stageAt` and `fadeIn`.
- Tools: `node tools/music-render.mjs --out DIR --themes all --level 0.1` writes WAVs from headless Chromium (`--dry` no reverb, `--only perc,war` layers, `--curve story`; `--film [--speech a-b,...]` renders the intro film's score with the mix stepping back over those windows); `tools/music-lab.html` is the page behind it and can be listened to.
- Tests: tests/audio/music-{theory,composer,engine,budget}.test.js on the strict fake context in `tests/audio/fake-audio.js`, tests/game/music-director.test.js, tests/ui/music-settings.test.js.

To add a theme: copy a block in `music-themes.js` (mode, bar seconds, instruments, calm and tense progressions inside the mode, motif cells, patterns) and add it to `THEMES`; the composer and budget tests cover it. To add a voice: a recipe or preset row in `music-voices.js`, then trim its level ([music-loudness-workflow](music-loudness-workflow.md)) and check its cost ([music-cpu-findings](music-cpu-findings.md)).
