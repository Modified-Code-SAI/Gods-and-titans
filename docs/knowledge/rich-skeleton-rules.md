# rich-skeleton-rules

> Rules and measured costs of the rich character rig - detached skeleton, mounts for rigid pieces, template cache, triangle and CPU numbers, asset-source reachability

For anyone editing the rich units ([rich-characters](rich-characters.md)):

- The 23 bones are NOT in the scene graph: DetachedBindMode, identity bind matrix, `skeleton.update` replaced by a no-op. `applyRich` (rich-anim.js) ends with `syncRich`, which recomputes bone matrices, skin matrices and the mounts. Rigid pieces (weapon, shield, tools, flames, cargo) must ride a mount from `mountOn(inst, parent, bone)`, never `bone.add(mesh)`. Why: 23 Object3D bones per unit made `scene.updateMatrixWorld` cost about 12 ms at 300 units; now the work happens only when a unit animates, inside the renderer's 2 ms animation budget (ANIM_MS, stride up to 5, only units under 40 px).
- Rich templates sit in `RICH_TEMPLATES` and survive `clearUnitModelCache` (a build takes 20 to 130 ms).
- Skinned and plain meshes need different unit material variants (`getUnitMaterial(color, morphs, ghost, skinned)`); the fade-variant warm-up meshes are SkinnedMeshes bound to the same skeleton.
- Harness gods spawn with a golden summon pillar: use `--t 8` in shot-characters.

Costs (Node, software): triangles per unit mortal about 5.0k (old 0.8k), warrior 7.8k, Thor 7.1k, Surtr 13.0k. Whole-scene triangles barely move (terrain and props dominate); a 100 to 200 unit army adds roughly 0.5 to 1M. Draw calls per unit fall (2 to 5 vs 5 to 6). `animate()` is about 30 us per rich unit vs 7 us old: 100 units 2 to 3 ms, 300 units 9 to 11 ms if every unit animates each frame, capped by the stride.

Authored assets (not pursued): from the sandbox only raw.githubusercontent.com is reachable; Quaternius, Kenney, Poly Pizza, Sketchfab, Mixamo, itch.io and jsDelivr are blocked. A rigged glb is 0.2 to 2 MB (three.js Soldier.glb 2.2 MB); GLTFLoader (119 KB) and SkeletonUtils would need vendoring; CC0 packs are stylized low-poly, not Valheim/Enshrouded.

**Why:** the mount rule and the cost numbers are not visible from the code alone.
**How to apply:** read before touching rich-*.js, unit animation or unit materials; re-measure with a Node script that builds N rich models and calls `animate`.
