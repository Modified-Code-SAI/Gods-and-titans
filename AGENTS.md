# AGENTS.md: Mythic War (Gods-and-titans)

Instructions for any AI coding agent (Gemini, Antigravity, Codex, Claude and others) or human working in this repository. Read this first; it is short on purpose and points to the longer docs.

## What this is

**Mythic War** is a real-time strategy game in the style of Warcraft III, in low-poly 3D (Three.js, WebGL 2), that runs in the browser with no build step. Players lead Worshippers, grow a Village into a Town and a City, pray for Faith, and summon the creatures, gods and titans of ten mythologies (Greek, Norse, Egyptian, Hindu, Japanese, Chinese, Aztec, Celtic, Mesopotamian, West African). Up to 6 players, human or computer (Easy, Normal, Hard, Brutal), co-op or versus, online over WebRTC (PeerJS) with the host's browser running the authoritative simulation.

- Live site: GitHub Pages, deployed from `main` on every push (see [Deploy](#build-and-deploy)). After the account rename the URL is https://modified-code-sai.github.io/Gods-and-titans/ (check repo Settings > Pages if it moves).
- Repository: https://github.com/Modified-Code-SAI/Gods-and-titans (default branch `main`).
- About 270 source modules, about 2,300 unit tests, 10 campaign chapters (50 missions), 158 unit looks, all with a "rich" skinned model on High/Ultra.

## Read next (in this order, as needed)

| Doc | What it holds |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | How the pieces fit: data flow from menu to sim to network to renderer and HUD, and a map of every folder |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Setup from a fresh clone, every test and check, the browser tools, CI, build and deploy |
| [docs/GOTCHAS.md](docs/GOTCHAS.md) | Cross-cutting traps that each cost a previous developer a debugging round |
| [docs/STATUS.md](docs/STATUS.md) | What is done, what is known to be open, ideas not built, what nobody has verified yet |
| [docs/knowledge/README.md](docs/knowledge/README.md) | 120+ detailed notes per feature (code maps, numbers, traps), written while building it |
| [DESIGN.md](DESIGN.md) | The master spec (3,700 lines). Every rule, number and API. Search it by section number; do not read it whole |
| [notes/decisions.md](notes/decisions.md) | Why numbers and designs were chosen (tagged by area, e.g. `[balance]`, `[zoom]`) |

## Commands

```bash
npm ci                      # Node 22 (CI uses 22). Installs eslint, esbuild, http-server, peer, playwright
npm run serve               # http://localhost:8080/ (any static server works; there is no build step)
npm test                    # all unit tests: node --test "tests/**/*.test.js" (~2.5 min, ~2,300 tests)
npm run lint                # ESLint, real mistakes only (no style rules)
npm run audit               # headless AI-vs-AI games with world invariants checked + same-seed replay
npx playwright install chromium   # once, for the browser tools below
npm run e2e                 # the real UI driven by mouse and keyboard in Chromium (add -- --slow without a GPU)
node tools/build-site.mjs --out _site   # the bundled site Pages serves (esbuild); only CI needs it
```

Run one test file: `node --test tests/sim/walls.test.js`. Always quote a glob: `node --test "tests/ui/**/*.test.js"` (an unquoted glob or a bare folder fails).

Before you push: `npm run lint && npm test` must pass. If you touched `src/sim/` or `src/ai/`, also run `npm run audit`. CI (`.github/workflows/ci.yml`) runs three jobs on every PR: `test` (lint + unit), `audit`, `play` (single-player play test, ~9 to 15 min).

## Repository map (short)

```
index.html, style.css, sw.js, manifest.webmanifest   page shell, menu CSS, offline service worker, PWA manifest
src/main.js            entry: settings, audio, menu, intro film, starts a Game
src/config.js          every global constant and tuning knob (POP_MAX, MAX_PLAYERS, RANK_XP, SITE_*, ...)
src/settings.js        player settings in localStorage 'mythicwar-settings'
src/data/              pure game data: units, buildings, 10 pantheons, powers, upgrades, campaign, achievements...
src/sim/               the deterministic simulation (World). Pure JS, runs in Node. No DOM, no three.js
src/ai/                computer players: createAI(world, playerIndex, difficulty) -> { tick() }
src/net/               lobby, host/client sessions, delta codec, sanitizer, transports, host migration
src/game/              game controller (game.js), ViewState, saves, replays, career, alerts, campaign progress
src/render/            Three.js renderer: terrain, water, foliage, buildings, units, VFX, fog, post, weather
src/render/models/     procedural models: buildings kit, low-poly units, rich skinned units (rich-*.js)
src/ui/                HTML/CSS overlay: HUD, input, command card, minimap, menus, touch, gamepad
src/audio/             procedural WebAudio sfx and music (no audio files except narration clips)
src/intro/             the 47 s intro film played live in the engine
assets/                narration MP3s (Kokoro TTS), icons, CC0 textures
vendor/                three.js r186, PeerJS 1.5.5, fonts, game-icons. Vendored on purpose: never load from a CDN
tests/                 node:test unit tests, mirroring src/ folders (sim, ai, net, game, render, ui, audio, data, intro)
tools/                 browser and headless tools: play-test, sim-audit, screenshots (shot-*.mjs), galleries, benches
notes/                 decisions.md (why), interface-requests.md and status.md (historical, from the first build)
docs/                  agent and developer docs (this handoff)
```

## Hard rules (break one and something subtle breaks)

1. **No build step for development.** Plain ES modules; `three` resolves through the import map in `index.html` (`vendor/three/...`). Do not add a bundler, TypeScript compile, framework or CDN import. Only `tools/build-site.mjs` bundles, for Pages.
2. **The simulation is deterministic and headless.** Everything in `src/sim/` must give identical results for the same `GameSetup` and commands: use the seeded RNG (`src/sim/rng.js`), never `Math.random()`, `Date.now()`, `performance.now()` or iteration over unordered state that differs between runs. Replays, saves, online play, host migration and `npm run audit --determinism` all depend on it. Never import DOM or three.js into `src/sim/`, `src/data/` or `src/ai/`.
3. **Sim and render are split.** Visual changes go in `src/render/` and must not change the sim. The time of day, weather, far-zoom levels and rich models are render-only.
4. **The host is authoritative; the wire is versioned.** `src/net/wire-version.js` fingerprints commands, message names and event shapes so old and new tabs refuse to play together. A new player command needs: `COMMAND_TYPES` in `src/sim/commands.js`, `COMMANDS` in `src/net/sanitize.js` (whitelist + clamps), and an entry in the `good` list of `tests/net/hardening.test.js`. A new sim event needs a shape appended at the END of `EVENT_SHAPES` in `src/net/delta.js`, and the renderer's `onEvent` switch in `game-renderer.js` if it should draw.
5. **"May I hurt this?" is `world.canHarm(a, b)`**, never `areEnemies` (which also drives collision, placement and the UI). The Decade of Peace depends on it; a new damage path needs a row in `tests/sim/peace.test.js`.
6. **Prices and timings go through `p.mods`** (blessings, upgrades, relics, handicaps). Tune numbers in `src/config.js` or `src/data/` only, never inline in sim code. The Brutal AI is strictly fair: no resource bonuses for the AI.
7. **Saves:** a new class held by the World or an `AIPlayer` must join `CLASSES` in `src/game/save-game.js`; never store a closure in sim state (the save round-trip test fails with its path). A new sim-affecting `GameSetup` field must survive `validateSetup` and `sanitizeReplay`, or replays drift.
8. **Icons:** every emoji in `src/data`, `src/ui`, `src/game` needs an entry in `src/ui/icon-map.js` (a test fails on unmapped pictographs) and must be Emoji version 11 or older.
9. **Model budgets are tests.** Triangle and mesh budgets live in `tests/render/*models*.test.js` (buildings 3000 tris, mortals 8500 rich, gods 9000, titans 14000, creatures 10500). Measure before you change one; do not raise a budget to fit art.
10. **Shaders:** a new lit material gets `patchWorldMaterial` and then `patchFowMaterial` (that order), and again after any `setQuality` swap. Low quality must stay playable on an ordinary laptop: heavy effects go in High/Ultra.
11. **Keys and colours:** a new global key joins `RESERVED` or becomes a `KEY_ACTION` in `src/ui/key-bindings.js`. Anything that draws a team colour calls `displayColor` (`src/team-colors.js`) so the colour-blind palette works.
12. **Docs move with the code.** A rule change updates the matching DESIGN.md section; numbers or keys quoted in How to Play (`src/ui/menu-howto.js`) and tips (`src/ui/hint-data.js`) are read by tests; a player-facing batch of changes gets an entry in `src/data/whats-new.js` (fresh id, items end in `.` or `!`).
13. **The intro film plays on every launch** with Esc/Enter/Space/Skip to skip. The owner asked for no off switch; do not add one.
14. **Never commit** `node_modules/`, `_site/`, `play-shots/`, screenshots, secrets or tokens. There are no secrets in this repo and none are needed to build or deploy.

## Conventions

- JavaScript ES2024 modules, 2-space indent, single quotes, semicolons, long lines are fine. Match the surrounding file.
- Comments explain why and cite the DESIGN.md section (`// DESIGN 5.10`). Module headers say what the file is for.
- UI text is plain, friendly English. Gatherers are called "Worshippers" in UI text.
- Every new behaviour gets a `node:test` test beside its siblings in `tests/<area>/`. UI tests run on the fake DOM in `tests/ui/fake-dom.js` (it has limits: see GOTCHAS). Render tests register the `three` resolver hook (copy the head of `tests/render/camera-free.test.js`).
- Shared hotspots that conflict between branches: `COMMAND_TYPES` in `src/sim/commands.js`, the `good` list in `tests/net/hardening.test.js`, `src/settings.js` + `tests/ui/settings.test.js`, `src/ui/command-card.js` imports, DESIGN.md sections 6.2 and 9.
- Branch from `main`, keep a PR focused on one feature, squash-merge. A push to `main` deploys.

## Debugging and checking in a real browser

- `window.__game` exposes the running match: `session.world` (the host World), `session.ticker.run(n)` (step n ticks, 20 per game second), `renderer`, `hud`, `input`, `viewState`, `selection`.
- Spawn for a test: `__game.session.world.spawnUnit(owner, 'warrior', x, y, { silent: true })`; kill with `world.killEntity(e)` (setting hp to 0 does nothing).
- URL switches: `?tod=night` or `?tod=18.5` (hold an hour), `?intro=0` (skip the film), `?transport=local` (two tabs play online with no network), `?livemenu=1`, `?sw` (service worker on http), `?voice=browser`.
- Without a GPU (CI, cloud VMs) the tools run Chromium on SwiftShader (`SOFTWARE_GL` in `tools/browser.mjs`): a frame takes seconds, so wait on DOM state, never on fixed sleeps, and give screenshots long timeouts.

## Working style the owner expects

- The owner tests by hand and reports bugs. Give them something playable early; keep the game working on `main` at all times.
- Prefer measured decisions: AI and balance changes are judged by A/B benches over hundreds of seeded games (`tools/ai-tournament.mjs`, `tools/power-bench.mjs`), not a single game.
- Audio levels were set by measurement only (no one has listened to most sounds): if the owner says something sounds wrong, change its level knob and re-measure rather than redesigning.
- When unsure about a game-design choice that changes the owner's intent, ask; for anything that can be undone (a branch, a draft PR, a test), just do it and say what you did.
