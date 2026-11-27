# gods-titans-graphics

> Render pipeline decisions for the gods-and-titans game (post-processing, quality tiers, overlays, shader patch order) - read before touching src/render

Graphics overhaul requested by the owner 2026-10-17 ("best graphics you can give the game"); PR #3 merged to main and deployed 2026-10-18 at the owner's request. Graphics preview artifact (single player): (link not kept)

- Stays Three.js r186 WebGL2, no build step; must stay playable on an ordinary laptop.
- Quality tiers low/medium/high/ultra (settings.js QUALITIES). Low = direct-to-canvas with Neutral tone mapping, no shadows/post. Medium+ = HDR post (src/render/post.js): MSAA HalfFloat scene target, bloom, AO from depth (high/ultra), Neutral tone map + grade, adaptive render scale.
- Overlays (selection rings, bars, markers, flags, placement ghost) live in a separate overlayScene drawn after post, so their colors stay exact; composite writes gl_FragDepth so they still depth-test.
- Shared lighting in src/render/shading.js: SUN_DIR, PMREM sky environment, cloud shadows + rim (patchWorldMaterial). Patch order: patchWorldMaterial / team patches BEFORE patchFowMaterial (fog keeps the previous hook and cache key).
- VFX ignore 'ultra' (mapped to 'high'); render tests use a stub WebGL without setRenderTarget, so post/env must no-op there.
- Adaptive render scale (game-renderer adaptResolution) learns the display period from rAF timestamps game.js passes to render(now).
- Cloud shadows dim only the directional sun (patched inside the light loop) so VFX point lights stay bright; idle point lights are skipped via directLight.visible.
- Model budgets in tests are tight (unit tris, ≤8 meshes; buildings ≤3000 tris); don't raise them to fit art.
- The 2026-10-19 passes (PRs #5 to #8: studio look, scene dressing, units, gods) are logged in [graphics-pass-history](graphics-pass-history.md); the foliage pass (PR #21) replaced their tree and leaf details ([foliage-look](foliage-look.md)).

**Why:** later threads changing visuals need these constraints without rediscovering them.
**How to apply:** keep sim untouched; new lit materials get patchWorldMaterial then patchFowMaterial (again after any setQuality swap: [shader-expanded-geometry-gotchas](shader-expanded-geometry-gotchas.md)); test overlays on both low and post paths. See [mythic-war-game](mythic-war-game.md).
