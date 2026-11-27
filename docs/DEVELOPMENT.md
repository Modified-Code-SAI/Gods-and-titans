# Development guide

Everything needed to set up, check, build and ship Mythic War from a fresh clone.

## Setup

Requirements: Node 22 (CI uses 22; 20+ works for the unit tests), npm, Git. A GPU is not needed for tests; the browser tools fall back to software WebGL.

```bash
git clone https://github.com/Modified-Code-SAI/Gods-and-titans.git
cd Gods-and-titans
npm ci
npx playwright install chromium   # only for the browser tools and npm run e2e
npm run serve                      # http://localhost:8080/
```

There is no build step: `index.html` loads `src/main.js` as an ES module and resolves `three` through its import map to `vendor/three/`. Any static server works (`python3 -m http.server 8080` too). Opening `index.html` from `file://` does not work (modules need http).

Online play from localhost uses the public PeerJS broker (0.peerjs.com) and STUN. To test online without a network, open two tabs with `?transport=local` (BroadcastChannel). `npm run peer-server` starts a local PeerJS broker on port 9000 (`?peerHost=localhost&peerPort=9000&peerPath=/myapp&peerSecure=0` points the game at it).

## Checks

| Command | What | Time |
|---|---|---|
| `npm run lint` | ESLint (eslint.config.js), mistakes only, no style rules | ~20 s |
| `npm test` | every `tests/**/*.test.js` with `node:test` | ~2.5 min, 2,323 tests (2026-11-27) |
| `node --test tests/sim/walls.test.js` | one file | seconds |
| `npm run audit` | `tools/sim-audit.mjs`: AI-vs-AI games with world invariants checked every 20 ticks and a same-seed determinism replay | ~2 min |
| `npm run e2e` | `tools/play-test.mjs --only sp`: drives the real UI in Chromium | 5 to 15 min; add `-- --slow` without a GPU |

Status on 2026-11-27, fresh `npm ci` on Linux: lint clean, 2,323 of 2,323 tests pass, audit passes with determinism "same".

CI (`.github/workflows/ci.yml`) on every pull request and push to `main`:
- `test`: `npm ci`, `npm run lint`, `npm test`.
- `audit`: sim-audit on 1v1 seeds 1-3 with determinism, 2v2 Hard seeds 4-5, FFA Brutal seed 6, all `--strict`.
- `play`: `play-test.mjs --only sp --slow` on `ubuntu-24.04` (pinned: Playwright 1.56 cannot install a browser on newer Ubuntu images), screenshots kept as an artifact for 7 days. About 9 to 15 minutes. It has failed once on an Ubuntu mirror 503 while installing the browser; rerun the failed job.

Notes:
- Timing-sensitive tests (four of them) can fail when the machine is busy (for example, a render capture running beside the suite). Re-run them alone before assuming a regression.
- When a run fails, re-run only the failing files while you fix them, then the whole suite once.
- `npm test | grep ...` in a chain can exit 0 even with failures: read the `# pass` and `# fail` counts.

## Build and deploy

- `.github/workflows/pages.yml` runs on every push to `main` (and by hand): `npm ci`, `node tools/build-site.mjs --out _site`, uploads `_site` to GitHub Pages. Pages "Source" must be set to "GitHub Actions" in repo settings.
- `tools/build-site.mjs` copies `index.html`, `manifest.webmanifest`, `sw.js`, `style.css`, `src/`, `vendor/`, `assets/` and bundles the modules with esbuild into `src/app/` with hashed names (so `import.meta.url` relative paths still resolve), adds `?v=<hash>` to stylesheets and writes `precache.json` for the service worker. `--no-bundle` skips bundling. `--out` is joined to the repo root (an absolute path still builds inside the repo).
- Check the deployed build locally: `node tools/build-site.mjs --out _site && npx http-server _site -p 8091`, or `node tools/play-test.mjs --site _site`.
- So a push to `main` is a release. Keep `main` green; use branches and pull requests. Squash-merge is the convention.
- Old tabs of a previous build refuse to join new hosts (protocol fingerprint in `src/net/wire-version.js`), so an online game never mixes builds.

## Tools

Headless (Node only, no browser):

- `tools/sim-audit.mjs` bug-hunt harness. `--seeds=1-3 --max=15 --teams=1v1|2v2|ffa|3v3|ffa6 --diff=easy|normal|hard|brutal --peace=30 --sacred --landscape=islands --purse=rich --style=guardian --determinism --strict`.
- `tools/sim-chaos.mjs` AI games with random "clumsy human" commands on top.
- `tools/ai-tournament.mjs --seeds=1-8 --diff=hard --workers=2 [--landscape=]` AI-vs-AI round robin of the pantheons (720 games is about 50 minutes on 4 cores). The sim is deterministic but chaotic: judge balance on hundreds of games, and play every map twice with sides swapped.
- `tools/power-bench.mjs` scores every god power on a carpet of tough soldiers.
- `tools/net-bandwidth.mjs --fill=200 --minutes=3 --difficulty=hard` network cost of a real World. `tools/fill-pop.mjs` fills players to a population.
- `tools/map-preview.mjs --landscapes a,b --teams 1,1,2,2` renders generated maps to PNG.
- `tools/build-icons.mjs` regenerates `src/ui/icon-paths.js` from the game-icons set (`npm pack @iconify-json/game-icons`).

Browser (Playwright; they launch Chromium through `tools/browser.mjs`; set `CHROMIUM_PATH` to use another browser; on a machine without a GPU they pass the `SOFTWARE_GL` flags). Most serve the repo themselves; the multi-tab checks say in their header to start `python3 -m http.server 8321` first:

- `tools/play-test.mjs --only sp,controls,late,online [--slow] [--size 1280x720] [--headed]` real UI end to end.
- `tools/online-audit.mjs`, `tools/rejoin-check.mjs`, `tools/handoff-check.mjs`, `tools/rematch-check.mjs`, `tools/net-test.mjs`: online play with two or three tabs over `?transport=local`.
- Screenshots for visual work: `shot-overview.mjs` (title, lobby, live game), `shot-menu.mjs` (every menu screen plus lobby flows), `shot-terrain.mjs`, `shot-lighting.mjs`, `shot-zoom.mjs`, `shot-characters.mjs`, `shot-units.mjs`, `shot-city.mjs`, `shot-buildings.mjs`, `shot-foliage.mjs`, `shot-vfx.mjs`, `shot-intro.mjs` (`--sound`, `--music`, `--voice`, `--narration` real-browser audio checks), `shot-chronicle.mjs`, `shot-ranks.mjs`, `shot-relics.mjs`, `shot-market.mjs`, `shot-access.mjs` (text size and contrast audit), `shot-fidelity.mjs` (before/after of the live game), `perf-late.mjs` (late-game frame cost).
- Pages you can open in a browser while serving the repo: `tools/render-harness.html` (the renderer with scenarios: `?scenario=base|battle|fog|construction|creeps|trees|perf|late|pantheon&quality=&tod=&landscape=&weather=&fill=200&reveal=1&manual=1`), `tools/gallery-units.html` (`?detail=rich&filter=norse&state=attack`), `gallery-buildings.html`, `gallery-city.html`, `gallery-foliage.html`, `gallery-vfx.html`, `gallery-icons.html`, `music-lab.html` (listen to every theme), `net-test.html`.

Python (optional, for audio and art assets only):

- `tools/narration/render.py`: renders narration and taunt clips with Kokoro-82M (`pip install kokoro-onnx soundfile`; model files from the GitHub release `thewh1teagle/kokoro-onnx` model-files-v1.0). Voice `bm_george` at speed 0.95 (campaign) or 0.85 (intro), loudness -20 LUFS. Clip file names carry a hash of the words: after editing a line, regenerate the lines JSON (`node tools/narration/campaign-lines.mjs > lines.json` or `taunt-lines.mjs`) and render only the missing clips. `tools/narration/check.py` transcribes clips back with faster-whisper to check them.
- `tools/cc0/bake.py`: bakes the CC0 Poly Haven textures in `assets/textures/`.

## Working on the game

- Before changing a feature, read its note in `docs/knowledge/` (search by name: `grep -ril "manor" docs/knowledge`) and its DESIGN.md section.
- Gameplay numbers: `src/config.js` and `src/data/`. Balance and AI changes need benches (see above), not a single game.
- Graphics: keep sim untouched, keep Low cheap, measure triangles against the budgets in `tests/render/`, judge looks from stills (`shot-*.mjs`) at golden hour, day and night.
- New player-facing feature checklist: sim rule + tests, wire (command/event, sanitizer, hardening `good` list), HUD/command card + tests, How to Play text (`src/ui/menu-howto.js`), tips if relevant (`src/ui/hint-data.js`), DESIGN.md section, README if it is a headline feature, What's New entry (`src/data/whats-new.js`).
- New campaign chapter recipe (ten exist, one per pantheon): copy a chapter's shape in `src/data/campaign.js` (`CHAPTERS`, mission ids must not equal a chapter id, AI names at most 20 characters, icons must exist in `icon-map.js`), add the CSS `.mw-cmap.is-<id>` and `CHAPTER_ICONS`, update the three tests that hard-code chapter counts (campaign, campaign-progress, howto), render only the missing narration clips, and bench each mission with the AI as the hero (Normal should win all five, an idle hero should lose).
