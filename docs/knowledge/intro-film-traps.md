# intro-film-traps

> Look, camera and test traps from building the intro film (summon pillar blowout, trees on the east and south, god facing, sfx gap, software GL stall, fake DOM setup)

From [intro-film](intro-film.md):

- **Camera orbit**: `yaw` is degrees from due south, the camera sits at `target + (sin yaw, cos yaw)` times the flat distance (yaw 90 is east, 180 north, -90 west). Gods face the way they walk; Zeus is spawned facing south and marches east from 17.5 s.
- **Trees**: the temple's south and east are dense forest, so a low camera there looks through foliage (Zeus vanishes). The west side at yaw -50 to -72 with pitch 15 or more and lift 2 gives a clear profile with the temple behind. The war reads best from the north (yaw 158 to 172): open meadow in front, armies side by side, the village on one side.
- **Summon pillar**: a god or titan spawned without `silent` draws a pillar about 8 to 9 tiles tall for 1.75 s. A close camera is washed white, so the finale starts wide (dist 22) and pushes in to 12.
- **Finale**: idle or held gods auto-acquire enemies and auto-cast, so the first lineup cue kills the Norse, gods get `hold`, and `stage.finale` keeps `castSpells` from touching them. The forest around the line is cut before the world is built (`clearForest(GLADE)`); no free rectangle existed on this seed.
- **sfx**: `summon_god` drops a start closer than 1 s to the last (LIMITS in src/audio/sfx.js), so the finale cues are 1.1 s apart.
- **Hours**: the sun runs forward through the film; per-frame `setTimeOfDay` would rebake the environment map, so use `atmo.setMode` plus `renderer.update`. The finale's dusk (hours 18.6 to 20.3) looked best near 19.8, a purple one.
- **Software GL**: the page submits frames far faster than swiftshader draws them, so freeing the renderer after Esc waits for the backlog (33 s in headless Chromium, nothing on a GPU). `--flow` waits up to 180 s. In manual mode the stills tool is fine.
- **Tests**: UI tests need `installFakeDom()` plus a global `Node` class with `Symbol.hasInstance` for `h()` (as tests/ui/howto.test.js), and recording `document.addEventListener` and `window.addEventListener` to fire keydown by hand. Render-side tests register the `three` resolver hook (copy the head of tests/render/camera-free.test.js); `IntroFilm` runs in Node with a stand-in Renderer (tests/intro/film.test.js).
- **Merging**: the settings keys conflict with every settings PR (defaults line, `sanitize`, the JSDoc and tests/ui/settings.test.js deepEqual); keep both sides. The squash message went in with typed `&lt;` and `&gt;` around the Co-Authored-By address: the merge tool takes raw text, so write real angle brackets.
