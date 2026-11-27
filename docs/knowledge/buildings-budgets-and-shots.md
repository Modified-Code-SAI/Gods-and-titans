# buildings-budgets-and-shots

> Building detail levels, triangle budgets with measured numbers, camera facts and the capture and measure tools for the buildings pass

Companion of [buildings-kit-code-map](buildings-kit-code-map.md) ([render-shot-workflow](render-shot-workflow.md) has the general capture notes).

- Detail follows `QUALITY.detail` in game-renderer.js: low 0, medium/high/ultra 1. Budgets in tests/render/building-models.test.js: 3000 tris a building, 700 a wall segment (2 meshes), 6 meshes; none raised. Low (level 0) geometry stays what it was.
- Measured at level 1: Town Center tier 3 is the tight one (Hindu 2969, Chinese 2957, Aztec 2895 of 3000); tc3 must exceed tc2 for every pantheon (a test, it forced the Celtic and West African trims). Walls: wooden worst 654, stone 564, no mask rebuilds at level 0 (a segment with towers on all four sides keeps 5-sided stakes). Exhaustive roster sweep of roof/wall/ornament combos: nothing over 3000.
- Camera: 40 degree fov, distance 10 to 44 (default 25), pitch 50 to 58, no rotation. At default zoom a house is about 120 px wide, so roofs and the platform dominate; detail shows up close. A golden low sun burns broad pale flat tops white: use darker stone for big horizontal surfaces.
- Capture: `node tools/shot-city.mjs --pantheons greek,norse --views village,tc,house,barracks,storehouse,shrine,temple,tower,gate,walls --tods golden,night [--quality low] [--zoom N] --out DIR --prefix NAME --stats`. The server serves the worktree live: do not edit that tree during a capture (use a second worktree). Software GL: one job at a time, about 10 s a still, 30 s for the village view.
- Cost: the city gallery has `bench(n)` (relative software-GL timing; separate browsers, two rounds, medians; single runs drift 10 to 17%). PR #25 measured +3/+2/+0.4% at Low/Medium/High, noise. PR #26 (parts 2 and 3) over part 1: roster triangles +4.1% at level 0 and +14.5% at level 1; a whole Celtic or Hindu village +0.5 to +0.7% (Low), +0.7 to +1.2% (Medium), +0.7 to +1.1% (High), draw calls 0 to +1; frame time inside the noise. Views are tuned close (house 8, tower 8, tc 12): `--zoom 12` on a house makes it farther.
- Triangle spend per function: wrap `Kit.prototype.add` and tally by caller at `setBuildingDetail(0)` (it double-counts when the governor rebuilds).
- Team color can hide under new geometry (Celtic thatch band sat under the course lips, 50 to 85% visible). Two checks: a test that ray-casts the team mesh from the game camera (pitch 55, area-weighted sample) for all ten pantheons, and stills with player 1 forced to magenta (route `src/config.js`, swap the red hex) counted by hue. Move bands out by `lip*R/h`.
- Looks fine, not a bug: at night a course-thatched hut's door glow reads smaller (the lower eave covers more of it) and its straw reads darker than the old smooth cone.

**Why:** later building work needs the real numbers, not guesses, before touching a budget.
**How to apply:** measure Town Center tier 3, wall masks and `info.level` for all ten pantheons after any added detail, and tell the owner before raising a budget.
