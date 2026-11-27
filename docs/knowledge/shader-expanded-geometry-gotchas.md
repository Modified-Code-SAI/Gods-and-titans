# shader-expanded-geometry-gotchas

> Three traps from the foliage PR review (#21) for any geometry a vertex shader expands or any material swapped after construction: fog re-patch after setQuality, CPU bounds, shadow-pass cut

Found by Codex and Bugbot on [foliage-look](foliage-look.md) (PR #21, 2026-10-21); all three were real and are fixed with tests.

- **Fog after a material swap**: the fog-of-war patch is per material (idempotent via `userData.__fow`). Whatever `GameRenderer.setQuality` swaps in later (the other puff material, ground cover) needs `patchFowObject` on its root again, or it renders fully lit in unexplored terrain. tests/render/game-renderer-foliage.test.js builds a real GameRenderer on a stub WebGL (the 'three' resolve hook is copied from foliage.test.js) and checks every foliage material after switching to low and back.
- **CPU bounds**: puffs sit at their centre in the position buffer and spread in the vertex shader, so the computed bounding sphere is too small and an instanced mesh near the screen edge is culled while outer puffs are still visible. `growForPuffs` in props.js `finish()` pads box and sphere by the widest puff reach (radius x 1.14 x hypot(sqrt 2, 0.55), plus 0.08 jitter). Do the same for any new billboard or shader-expanded geometry.
- **Shadow pass parity**: the depth material needs the colour pass's cut or the shadow is the whole quad (square bushes). Puff depth gets `vBbD` (the corner) and discards outside the unit disc; its program cache key is 'foliage-depth2b' (bump it when the depth shader changes).

**Why:** buildings and units will add shader-expanded or swapped materials and would hit the same three bugs.
**How to apply:** for every new shader-driven mesh, check fog after setQuality, bounds at the screen edge, and the shadow pass.
