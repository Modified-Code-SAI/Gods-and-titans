# Gotchas

Traps that each cost a previous developer at least one wasted round. Grouped by area. Feature-specific traps are in the matching note under [knowledge/](knowledge/README.md) (look for the `*-traps` and `*-gotchas` notes).

## Simulation and data

- **Determinism.** Only `src/sim/rng.js`; no `Math.random`, wall clock or `performance.now` in sim or AI decisions (AI `stats.thinkMs` is wall-clock and must be zeroed before comparing states). Replays, saves, online play and the audit all compare states.
- **Map generation:** always build maps through `mapgen.mapOptions(setup)` (it passes teams, landscape, player count). Calling `generateMap` with hand-made options gives a different map on the client and a hash mismatch.
- **Harm vs enemy:** use `world.canHarm(a, b)` for damage, spells and auras; `areEnemies` is for collision, placement, credit and the UI.
- **Walls are buildings that do not count as buildings.** Loops over `buildingList` for "real" buildings must skip `def.wall` (defeat, pop, stats, AI scans).
- **Killing in tests:** use `world.killEntity(e)`; setting `hp = 0` does nothing.
- **World events pile up** in a headless loop unless cleared: `getSnapshot()` clears them, so a bench that never snapshots must set `w.events = []` each tick.
- **Test worlds** (`tests/sim/helpers.js`) give player 0 Greek and player 1 Norse, whose blessings change numbers. Use `PLAIN_PANTHEONS` (norse, hindu) when a test checks plain unit stats. `place()` recomputes `popCap`, so assign `popCap` after placing.
- **Pantheon data shape:** `src/data/pantheon-list.js` only breaks the `upgrades.js` <-> `index.js` cycle; do not import `index.js` from data modules that `index.js` imports.
- **Upgrade lines:** a multi-level upgrade uses `line` + `after` and shows one command-card button per line; the Town Center card has 7 upgrade slots (4 to 10) and silently truncates beyond that.
- **Campaign:** mission ids must not equal a chapter id; AI names are cut at 20 characters; spawning ability minions (Osebo, Onini) by event gives units with no duration, so do not; scripted spawns need `guard: true` or `march` or the AI adopts them into its army.
- **Seeds matter** for campaign finales and AI tests: several tests run a seed known to finish in time. If a balance change breaks one, scan seeds rather than raising a time limit.

## Network

- **Wire changes need four edits:** `COMMAND_TYPES` (sim/commands.js), `COMMANDS` (net/sanitize.js), the `good` list in tests/net/hardening.test.js, and for events `EVENT_SHAPES` in net/delta.js (append at the end). The fingerprint changes automatically, so old tabs are refused: that is intended.
- **One snapshot goes to every client,** so per-viewer secrets cannot live in it. Team-only signals (team marks, team chat) are their own messages sent only to teammates. Order paths are sent only for human players' units and stop at the fog.
- **`LobbyClient.rejoin`** must drop its listeners synchronously on START, or the FULL snapshot right behind it is eaten.
- **Two tabs share localStorage**, so rejoin tickets and settings collide in two-tab tests; the check tools give each tab its own keys.
- **The public PeerJS broker** may be unreachable from CI or sandboxes; use `?transport=local` for automated online tests.

## Rendering

- **Patch order:** `patchWorldMaterial` (and team patches) before `patchFowMaterial`. After `setQuality` swaps materials, re-run `patchFowObject` on what was swapped in or it renders fully lit in unexplored ground.
- **Shader-expanded geometry** (billboards, leaf puffs): pad CPU bounds (`growForPuffs`) or it is culled at the screen edge, and give the depth material the same cut as the colour pass or shadows come out square.
- **Overlays** (rings, bars, markers, ghost) are in a separate `overlayScene` drawn after post so colours stay exact; test them on both the Low path and the post path.
- **Render tests** run on a stub WebGL without `setRenderTarget`, so post and environment code must no-op there; register the `three` resolver hook (head of tests/render/camera-free.test.js).
- **Rich models:** the 23+ bones are not in the scene graph (detached skeleton, `skeleton.update` is a no-op); rigid pieces ride a mount from `mountOn`, never `bone.add(mesh)`. A bone's `position` is the offset from its parent: poses must add the rest offset. A missing parent name in `createBones` silently detaches a bone.
- **Shared builders:** changing a shared rich builder can change older pantheons. Compare per-unit checksums of geometry arrays before and after (every earlier unit must be identical).
- **Vertex paint is per vertex:** a pattern finer than about three vertices per feature renders as mud; make trims their own geometry.
- **Team colour must be visible** from the game camera on every unit and building (tests ray-cast it); new geometry can hide a team band.
- **The renderer's `onEvent`** has a whitelist switch; a new event type must be added there to draw anything.
- **Camera facts:** fov 40, distance 10 to 44 normally (default 25), up to 170 in far zoom; nothing may change up to 44 tiles (`zoom-lod.js`). `setDistance` clamps at 10 by design.
- **Paused frames run dt 0:** anything that fades in over time (enemy fade, rebuilt views) stays invisible while paused unless flagged (see `rebuiltViews`).

## Interface

- **Fake DOM limits** (tests/ui/fake-dom.js): `className` and `classList` are separate, no `querySelectorAll`, no layout (set `offsetTop`/`offsetHeight` by hand), no `getComputedStyle`, no `firstChild` (use `children[0]`), no `closest()`. Menu tests also need a global `Node` with `Symbol.hasInstance` and a `requestAnimationFrame` stub (see tests/ui/alert-settings.test.js).
- **Emoji:** any new emoji in HUD or data text needs an `icon-map.js` entry or `tests/ui/icons.test.js` fails.
- **Every `title` attribute becomes a styled hover tip** (`hover-tip.js`); keep writing `title` in new code, or `data-native-tip` to opt out.
- **Settings keys** conflict with every other settings branch (defaults, `sanitize`, JSDoc, tests/ui/settings.test.js deepEqual): keep both sides when merging. `keyBindings` are validated (`cleanBindings`): a test binding that clashes is silently dropped.
- **Fake `this` tests** call `Game.prototype` methods on stubs: guard new `Game` methods for missing fields (`this.launch && this.launch.daily ? ... : ...`).
- **Rows that redraw** (the roster) must act on `pointerdown`, not `click`, or the click splits across redraws.
- **A ViewState pushes the snapshot before firing its events,** so on `playerDefeated` the local player already reads as defeated. Handle defeat events before any `playing()` guard.

## Audio

- **Browsers lock audio until a user gesture.** The intro waits behind a one-key card; do not test audio with `--autoplay-policy=no-user-gesture-required` if the question is a first visit. Playwright's own `evaluate`, `waitFor` and screenshot calls count as a gesture in Chromium: read state through raw CDP with `userGesture: false` (see `tools/shot-intro.mjs --sound`).
- **A new sfx name** must go in `SFX_NAMES` and in the test's `DESIGN_NAMES`.
- **Music cost:** every live WebAudio node costs audio-thread time; prefer sines and k-rate params, create notes just in time (`PLAY_AHEAD`), and keep the budget test (`tests/audio/music-budget.test.js`) green.
- **`setValueCurveAtTime`** takes a Float32Array, and nothing else may be scheduled on that param inside its span. Exponential ramps never reach zero.
- **Nobody has listened** to most sounds, the music or the voices: levels were set by loudness measurement. Treat the owner's ear as the authority.

## Tools and environment

- **Software GL is slow:** without a GPU a frame can take seconds. Poll DOM or game state with long timeouts (screenshots up to 240 s); never fixed sleeps. Run one capture job at a time on a 4-core machine.
- **Playwright pin:** the repo pins Playwright 1.56.1. On a machine where that browser cannot be installed (Ubuntu newer than 24.04), point `CHROMIUM_PATH` at any Chromium; `tools/browser.mjs` also tries `/opt/pw-browsers/chromium`, `/usr/bin/chromium` and Google Chrome.
- **`pkill -f <pattern>`** matches the calling shell's own command line and kills it; find the PID with `pgrep -af "[p]attern"` first.
- **Quote test globs:** `node --test "tests/**/*.test.js"`. `node --test tests/ui` fails.
- **Importing a tool script in a test runs it** unless the tool guards with `import.meta.url === pathToFileURL(process.argv[1]).href`.
- **Do not `git stash`** while a background tool is reading `src/` (an audit once ran on the wrong code that way). Do not edit a tree while a capture tool is serving it.
- **Git worktrees** inside the repo (for before/after stills) must not be committed: keep them outside the repo or in `.git/info/exclude`; a `node_modules` symlink is not matched by `.gitignore`'s `node_modules/`.
- **A pull request with a merge conflict** gets no CI run at all; merge `main` in first.
