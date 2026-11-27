# far-zoom

> far zoom (PR #55, merged 2026-10-27): camera 10 to 170 tiles, where the curves and the three cost levels live, the rules to keep, costs

The camera zooms out to 170 tiles (was 44; a whole 128 tile map fits a 16:9 window). The owner's batch idea "zoom out much farther" (`parallel-ideas-batch-2026-10-27` (process note, not kept)). Render only, plus `hearingScale` in game.js (up to 4.5). DESIGN 8 "Far zoom" and notes/decisions.md `[zoom]` have the numbers.

**Code map.** `src/render/zoom-lod.js` holds every curve as a pure function of the distance (`NEAR_RANGE` 44, `hazeStretch`, `shadowShare` 48 to 88, `aoShare` 60 to 110, overlay and ring scales, `detailPixels`, `terrainStride`, `forestFar`, `unitFar`). Also `far-units.js` (one instanced 54 triangle marker in the team colour), `models/props-far.js` (plain forest crowns), `terrain.js` (`setStride`), `camera.js` (pitch 58 to 66 beyond 44, `updateClipPlanes`), `GameRenderer.updateLod / syncUnits / zoomDistance`, and `renderer.lodPin` to pin a level in tools and tests.

**Rules to keep.**
- Nothing changes up to 44 tiles in a window of any height (`detailPixels` is Infinity there; Codex caught markers inside the old range in a 600 pixel window).
- Levels go by CSS pixels a tile, each with a way back at another value: ground step 2 below 16 and 4 below 7, crowns below 11, a marker for a unit under 11 px tall and under 20 pixels a tile.
- A marker shows its ring, a bar only when hurt, shielded or hovered, no rank pips or buff icon, and is as tall as foot to model top (a flyer's foot is at the hover).
- With the shadow pass skipped (from 88 tiles) the sun still follows SUN_DIR.
- While `camera.free` is set (the intro film, first shot 74 tiles out) `zoomDistance` is held at 44, so the film looks as on main.

**Cost** (late game: four AIs, ten minutes, 231 units; 1280x720, 170 tiles): low 1830 to 420 calls and 2.2 M to 0.5 M triangles, medium 2042 to 632 calls, high 1405 to 635; about 2.5 times less frame time under software GL (relative only).

**Why:** from 170 tiles a late game cost 1830 calls at low, so the levels, not the clamp, make the far view playable.
**How to apply:** change a curve in zoom-lod.js with its test. Tools and traps are in [far-zoom-traps](far-zoom-traps.md); see also [terrain-ground-field](terrain-ground-field.md), [foliage-look](foliage-look.md), [time-of-day-system](time-of-day-system.md).
