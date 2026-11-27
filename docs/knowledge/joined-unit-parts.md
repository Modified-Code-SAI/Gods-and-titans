# joined-unit-parts

> Low-poly units drawn as one skinned mesh each (PR #92, merged, wave 7 item 25): how it works, measured gains, traps, the --stub-draws measuring method

2026-10-29, PR #92 (merged 2026-10-29 17:21 UTC as 2b9ac51, branch `claude/project-thread-sc2doz`), item 25 of `engagement-research-2026-10-28` (process note, not kept). Follows #89 (per-frame JS) and [late-game-perf](late-game-perf.md).

- **What:** `buildJoined` (unit-models.js) joins a low-poly template's solid parts into one SkinnedMesh. Each part is a bone (full weight). Part objects are plain Object3Ds the animation still poses. `syncJoined` (end of `animate`) writes their rig transforms into the detached bones' matrixWorld and `skeleton.boneMatrices`; `skeleton.update` is a no-op, as for rich units ([rich-skeleton-rules](rich-skeleton-rules.md)). Joint morphs are slots per (part, morph name); a part's `morphTargetDictionary` maps into the mesh's shared `morphTargetInfluences`. Slots padded to a multiple of 4. Worker tool arms = extra bones `armR:<kind>` (base arm is `armR:none`), hidden ones get a zero matrix. Ghost parts keep their own mesh; single-mesh bodies are not joined. Parts with no ghost or cargo below them are not in the scene graph.
- **Shader:** UNIT_SKIN_VERTEX captures `unitRestP` before `<skinning_vertex>`; noise coords use it (identical for old meshes and rich units). Program key bumped to v5.
- **Measured** (`node tools/perf-late.mjs --focus --stub-draws --warm 10`, 415 units, densest crowd): Medium default zoom 853 to 485 draw calls, render() JS 10.2 to 6.1 ms, update 1.5 to 1.65 ms. Low 650 to 282, 5.3 to 3.8 ms. High barely changes (rich units). Stills pixel-identical.
- **Method:** `--stub-draws` no-ops gl.draw* so render() is pure JS; `--focus` aims at the densest 16-tile cell (the map middle shows few units, 228 calls); `--warm N` skips the SwiftShader first-use link stall (reported as "waits for a shader link", ~5 s on frame 0, not a real-GPU issue).
- **Traps:** Box3.setFromObject(precise) needs the bones' matrixWorld (set). The gallery framing box no longer counts the hidden cargo sack, so worker films shift under a pixel. Tests read `m.joined.rel.get(m.parts.torso)` and bone names. A rich-ram death test is seed-order dependent (passes alone, fails if an earlier test throws before dispose).

**Why:** next perf pass should not redo this; remaining draw calls are buildings, props, overlays.
**How to apply:** new part kinds work automatically; anything swapping a part's geometry must become a bone, like the tool arms.
