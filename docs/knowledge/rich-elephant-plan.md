# rich-elephant-plan

> Airavata (Hindu titan): Indra in a howdah on a three-headed white elephant, creature pass 10 (PR #46): dispatch, bones, outfit and rider hooks, pose values, costs, checks

Part 20 of "Yes finish them next" (2026-10-24). Draft PR #46 stacked on #45 (branch `claude/creatures-airavata-20tcd3`, worktree `/home/claude/gt-airavata`). One unit of body `elephant`: `hindu_airavata` (titan, scale 3.8, 3 heads, extras jewelry + rider).

**Dispatch**: a person on an animal, like the centaur and the scorpion man, by the humanoid template path in rich-humanoid.js (`elephant = base.v.body === 'elephant'`). `richSupported` needs `elephantSupported(v)` (rich-elephant.js: head elephant or none, heads 1 or 3, headgear none or headdress, no weapon or offhand, extras only jewelry and rider, rider included) AND an `ELEPHANT_OUTFITS[unitType.lookOf || unitType.pantheon]` entry (rich-elephant-outfits.js, only hindu). The unit's head, headgear and heads are the elephant's, so the person is dressed from `riderContext(base, outfit.rider)` (Indra: human head, tall_crown, lightning_bolt). `richDims(ctx, 'rider')` = the scorpion profile times 0.72 (`RIDER_PERSON`), weaponSize 0.55. `elephantFrame` = tx -0.04, lift 0.955 - hipY, then `settle`.

**Skeleton**: humanoid 23 + 43 (`addElephantBones`): hips, back, withers, tail1-4, `F1 F-1 B1 B-1` each u/l/p, and per head h0/h1/h2 + 5 trunk + 2 ear bones (one head = 16 fewer). The pelvis is a child of `back` and the howdah is rigid on `back`. Template `kind 'quadruped'`, `rich.plan 'elephant'`, rig stride 1.3, humanTop true.

**Files**: rich-elephant.js (barrel, legs as one loft to the sole, caparison, howdah), rich-elephant-head.js (skull, trunk, tusks, ears, forehead cloth, plume), rich-elephant-anim.js (`applyElephant`), rich-elephant-outfits.js. Shared edits: unit-anim.js (`poseGroupsFor` and `quadPose` treat a `rig.humanTop` quadruped like a centaur for the arm keys; no low-poly quadruped has humanTop, 18 checked), rich-creature-anim.js (case 'elephant'), rich-outfits.js (`outfitFor(.., 'elephant')`), rich-body.js (`richDims` 'rider').

**Pose values**: legs reach `1 + 0.3*gait`, knee fold 0.5 front and 0.6 hind, `u.z = sw - pitch`; back takes 0.45 and withers 0.55 of the pitch; middle head pitch 1.5 times `hRz`, side heads 1.3; trunk CURL 0.12 to 0.32 over five bones; pelvis counter -0.85 of the pitch and -0.7 of the yaw.

**Costs**: 13,534 triangles (titan budget 14,000), 66 bones, 3 meshes (body, prabhavali on the head bone, bolt on the hand), 0.975 times the low-poly height, template about 100 ms.

**Checks**: tests/render/rich-elephant.test.js (16 tests). Checksums against the insects branch identical for all ten pantheons except hindu_airavata; bone matrices of 22 rich units over six states bit-identical (`anim-hash.mjs`). Traps: [rich-elephant-look-traps](rich-elephant-look-traps.md). Overview: [rich-creatures-plans](rich-creatures-plans.md). Still to do: the battering ram.
