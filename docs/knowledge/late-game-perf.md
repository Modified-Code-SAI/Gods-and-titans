# late-game-perf

> Late-game performance pass (PR #74, merged 2026-10-28 as d011d28): where the cost is at 4x200 pop, shadow box fit, chunk box culling, perf-late tool and its traps

Measured 2026-10-28 at 4 players x 200 pop (item 9 of the engagement plan, PR #74).

- **Sim and network are not the problem.** The host step is about 5 ms of the 50 ms tick, the client gets about 36 KB/s, and the encode takes 0.8 ms. The renderer update is about 1.4 ms per frame and the HUD 2 to 3 ms.
- **The GPU was the problem.** On Medium the shadow pass drew more triangles (1.0M) than the visible scene, because the square shadow box reached 100+ tiles up-sun at a low sun. The fix fits the box to the view in light space (right/up extents plus an 8-unit lift margin) and culls forest chunks by their instance Box3 (props.js chunkInFrustum). Result: 1747k to 1120k triangles and 373 to 228 draw calls (chunk boxes padded by CHUNK_BOX_PAD for pineMorph and wind after a Codex finding). On Low the frames are pixel-identical.
- Other fixes in the PR:
  - The minimap pinged with a negative arc radius when a ping's t0 was later than the frame's `now`. The throw skipped the rest of Hud.update.
  - ViewState.pushSnapshot now deletes only the keys of the previous source object.
- **Tools.** `node tools/perf-late.mjs [--quality medium] [--profile] [--game --settle 90]` measures the battle; it needs `CHROMIUM_PATH=/opt/pw-browsers/chromium`. `tools/fill-pop.mjs` fills each player to N population, and the render harness takes `fill=200`.
- **Traps:**
  - The project pins playwright 1.56.1, but the container has the 1243 browsers. Other tools have no CHROMIUM_PATH option, so point `PLAYWRIGHT_BROWSERS_PATH` at a dir with `chromium_headless_shell-1194/chrome-linux/headless_shell` symlinked to the 1243 headless shell.
  - `--game` right after start shows getProgramInfoLog stalls. These are the warm-up's programs finishing linking under SwiftShader, not late compiles: 0 new programs. Use `--settle 90`.
  - `pkill -f perf-late` kills your own shell.

**Why:** the next performance pass should start from the GPU side and these numbers, not re-profile the sim.
**How to apply:** look at shadow and forest triangles first. Remaining ideas: low-poly shadow proxies for trees (a visual change, so ask the owner), and a smaller CHUNK.
