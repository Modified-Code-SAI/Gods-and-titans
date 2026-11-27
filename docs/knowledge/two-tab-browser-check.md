# two-tab-browser-check

> Running a two-tab multiplayer check of the game with Playwright on software GL, plus shell and CI traps that cost time in the 2026-10-27 batch

For a feature that needs a host and a client (the team marks, [team-marks](team-marks.md)): serve the repo with `python3 -m http.server 8321` in the background, drive it with Playwright (global: `NODE_PATH=/opt/node-tools/node_modules`, CommonJS scripts), launch chromium with `--use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`, and join over the local transport (`?transport=local`, two tabs of one context; both players land on one team). Single-player vs AI needs one tab.

- Software GL with two tabs is slow: a screenshot takes tens of seconds (use `timeout: 240000`), frames take seconds, so a 6 s ping can expire between two steps. Poll for the DOM state instead of waiting a fixed time, read counts at the moment they matter, and keep a MutationObserver log for anything that fades (the hint line).
- Put `mythicwar-settings` in an init script (`quality: 'low'`, `tipsDismissed: true`, `volume: 0`) so tips and ultra effects do not get in the way. The page exposes `window.__game` (renderer, input, hud, session, viewState, marks).
- Aim clicks from each tab's own camera (`renderer.worldToScreen` and `screenToWorld`), not from the other tab's numbers.
- Two tabs are one team, so "the other team gets nothing" cannot be shown this way; the loopback session tests cover it (`createLoopbackPair` with `fakeWorldFactory`, as in tests/net/marks.test.js).
- Shell traps: `pkill -f "http.server 8321"` matches the shell's own command line and kills the shell (exit 144), so use `pgrep -af "[h]ttp.server"` first. `node --test tests/ui` fails; the glob must be quoted (`"tests/**/*.test.js"`). The full suite takes about a minute.
- CI trap: a draft PR whose `mergeable_state` is `dirty` (a conflict with main) starts no Tests run at all, so there is nothing to wait for; fetch main, merge, push.

**Why:** these cost several wasted runs and a killed shell.
**How to apply:** more graphics-side capture tips are in [render-shot-workflow](render-shot-workflow.md).
