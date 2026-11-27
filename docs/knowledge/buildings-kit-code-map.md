# buildings-kit-code-map

> Where the building model code lives (core, materials, pieces, models) and the helpers to use for roofs, domes, battered and rounded masses

Buildings pass (graphics step 2, thread "Buildings and structures", started 2026-10-21; see [graphics-overhaul-plan](graphics-overhaul-plan.md), [gods-titans-graphics](gods-titans-graphics.md), budgets and tools in [buildings-budgets-and-shots](buildings-budgets-and-shots.md)):

- `src/render/models/building-core.js`: colors, `CLS`/`SURF` surface classes, primitives (`box`, `bevelBox` 30 tris with a square foot, `bevelFrustum` = bevelBox battered by height with exact normals, `cyl`, `pole`, `strut`, `hipLoft`), `courseSlope`/`courseLoft` (roofs and pyramids in overlapping courses with lip, shadow and butt shading), `courseCone` (round roofs and domes, smooth analytic normals), `shadedTris`, `Kit` (parts into base/body/team/glow buckets; `k.lod` 0 plain / 1 detailed, `k.tight` = City leaves out optional extras).
- `building-materials.js`: shared materials and the surface shader `bldSurface` (one branch per class: stone, sandstone, mudbrick, brick, tile, TILEG, TURF, THATCH, COURT...). Fetches inside a branch need `textureGrad` with derivatives taken before it. `k.hole` openings glow warm after dusk (`uLamp`); the glow material follows the lamp level.
- `building-pieces.js`: palette (`gradeColor` pulls near-white down), props, `rectWalls`, `door`, `windowHole`, `wallLantern`, `postLamp`; helpers `bx`/`bfr` (bevelled at lod 1 when the narrow side is 0.2 or more, else plain), `roofRows`, `domeCuts`; one roof function per style for all ten pantheons (`roofStepped` = deck, coping, merlons, stair-house).
- `building-models.js`: the buildings, `getBuildingGeometry` (cache key includes the detail level; a build over budget is redone at level 0, `info.level`), `setBuildingDetail`, `model.refresh()`, `pruneBuildingCaches()`.

**Why:** the kit was split from one 2300-line file so reviews and later PRs stay small.
**How to apply:** new roofs use `courseLoft`/`courseCone`/`roofRows` and respect `k.lod`/`k.tight`; use `bx`/`bfr` for masses a player can see up close.
