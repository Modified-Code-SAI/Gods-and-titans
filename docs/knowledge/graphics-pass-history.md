# graphics-pass-history

> What the four 2026-10-19 graphics passes (PRs #5 to #8: studio look, scene dressing, units and trees, gods and creatures) changed in the render code; split out of gods-titans-graphics

Dated log of the earlier passes; the pipeline rules are in [gods-titans-graphics](gods-titans-graphics.md). The tree and leaf details in the #7 and #8 entries were replaced by the foliage pass (PR #21, [foliage-look](foliage-look.md)): broadleaf and bushes are leaf puffs now, spruces take needle sprays.

- 2026-10-19 studio pass (PR #5, merged and deployed 2026-10-19 at the owner's request): warmer sun/less hemi, terrain "painted meadow" autumn/moss patches on grass, post grade tames lime greens, autumn trees, sparser flowers, smoky fog; HUD restyled CSS-only in a "DESIGN 10" block at the end of hud.css (overrides earlier rules). tools/shot-overview.mjs screenshots title/lobby/game; high quality can time out under swiftshader, use --quality low.
- 2026-10-19 pass two (PR #6, merged at the owner's request 2026-10-19): mapgen already gives buildings/props rich surface detail (patchBuilding classes, yard props), so gains came from scene dressing: GameRenderer.buildUndergrowth (render-only decor layer on forest edges + shore stones, hidden on fell via wrapped forest.fell) and terrain.paintYard (grass->dirt tile texture under/around buildings). Units still the weakest art.
- 2026-10-19 units/trees pass (PR #7, merged to main at the owner's request): unit geometry smooth-shaded via creased normals + morph normals in PartBuilder (unit material not flatShading); new humanoid proportions; mortals carry team colour on tunics/capes/stoles/shields, not hoods (ctx.tunic/sleeve/skirt in buildTemplate); mortals use lod 1; budgets mortal 1000, god 1400. Spruce = 7 drooping tiers, broadleaf = 6-cluster crown, both <=160 tris (the crowns changed in PR #21).
- 2026-10-19 gods/creatures/foliage pass (PR #8, merged to main at the owner's request): god regalia per pantheon (REGALIA in unit-bodies.js), layered pauldrons, caparison saddles, dorsal fins on serpent/eastern-dragon titans; leaf noise via patchFoliageMaterial({detail}) (uFolDetail, discard-based ragged edges; replaced by the leaf texture in PR #21); unit albedo/roughness noise in unit-models.js. God budget 1500. dFdx bumps on units show 2x2 pixel blocks: avoid.

**Why:** the units step of the overhaul starts from what these passes already did to unit and god geometry.
**How to apply:** read the PR #7 and #8 lines before touching unit-bodies.js, unit-models.js or PartBuilder.
