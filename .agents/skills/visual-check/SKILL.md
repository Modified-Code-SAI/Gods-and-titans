---
name: visual-check
description: Take matched screenshots of Mythic War (game, menus, terrain, units, buildings, intro film) to judge a visual or UI change, including on machines without a GPU.
---

# Visual check with stills

1. `npm ci` and `npx playwright install chromium` (or set `CHROMIUM_PATH` to any Chromium). The tools launch through `tools/browser.mjs`; without a GPU they use SwiftShader, where a frame can take seconds: run one capture at a time and allow long timeouts.
2. Before stills: `git worktree add --detach ../gt-before main`, link or install its `node_modules`, and shoot the same view with `--prefix before`. Never commit the worktree or the images.
3. Pick the tool:
   - Whole game: `node tools/shot-overview.mjs` (title, lobby, live match) or `node tools/shot-fidelity.mjs` (before/after of the live game).
   - Menus and lobby flows: `node tools/shot-menu.mjs`. Text size and contrast: `node tools/shot-access.mjs`.
   - Terrain, water, light: `node tools/shot-terrain.mjs --quality medium --scenes lake,shore,far --tod golden` and `node tools/shot-lighting.mjs --tods 8,19,22.5`.
   - Units: `node tools/shot-characters.mjs --detail rich --scenes mortals@13,gods@15 --tods golden,night --t 8`; galleries `tools/gallery-units.html?detail=rich&filter=<pantheon>`.
   - Buildings: `node tools/shot-city.mjs --pantheons greek,norse --views village,tc,house --tods golden,night`.
   - Zoom levels and cost: `node tools/shot-zoom.mjs`. Late-game frame cost: `node tools/perf-late.mjs`.
   - Intro film: `node tools/shot-intro.mjs --at 2,16,26,42 --sheet`.
4. Judge at golden hour, day and night, and at Low and High quality. Look at the images yourself; describe what changed.
5. Software-GL timings are relative only; triangle and draw-call counts are exact. Real-GPU performance has not been measured: say so rather than guessing.
