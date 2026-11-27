# manor-model

> How the Manor building model is built (courtyard house in each pantheon's style), its triangle budget numbers, the traps from trimming it and the gallery views used to check it

`buildManor(k, P, st)` in `src/render/models/building-models.js` (case `'manor'` in `getBuildingGeometry`), on the building kit ([buildings-kit-code-map](buildings-kit-code-map.md), budgets in [buildings-budgets-and-shots](buildings-budgets-and-shots.md)): a hall at the back (door, team banners) with a lower wing each side around a paved court with a fountain, hedges, barrel and sacks, `ornamentPair` at the gate (z 1.58) and a flag each side. Round styles (`isRound`: Celtic, West African) get a round hall and two round wings, domes keep their dome. Aztec/Mesopotamian flat roofs read as terraced halls.

**Numbers (2026-10-27):** detailed level 1.58k (Egyptian) to 2.55k (Norse) triangles, plain level 1.07k to 1.94k, 3 to 4 meshes, extent 1.90 from centre (limit size/2 - 0.1 = 1.9), heights 1.74 to 3.01 (Hindu). All ten pantheons build at level 1 with no fallback to level 0.

**Traps from the first draft:**
- The first version reached 2.8k triangles: Aztec and Mesopotamian fell back to level 0 (the test "detailed one is never degraded" catches it) and the Mesopotamian lamassu pair at z 1.92 made `fit` 0.99. Fix: trimmed wing detail (`simple: true`, fewer windows/tiers) and moved the ornament pair in to z 1.58.
- The Celtic round roofs must keep their team band clear of the thatch courses: `manor` is in the `banded` list of the team-colour test (share >= 0.9).
- Japanese torii at the gate covers part of the fountain from the game camera; accepted.

**Checking it:** `tools/gallery-city.html` has `put('manor', ...)` plus a `house_square` of four Houses; views `manor` and `square` through `window.gallery.view(...)` (see [render-shot-workflow](render-shot-workflow.md)). Copy the tree with `tar` (no rsync in the sandbox), serve with `python3 -m http.server`, drive with Playwright under software GL (about 10 s a pantheon to load).
