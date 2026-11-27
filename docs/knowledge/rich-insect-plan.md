# rich-insect-plan

> Egyptian Scarab (beetle plan) and Mesopotamian Scorpion Man (person on a scorpion) rich models, creature pass 9 (PR #45): dispatch, shared code, pose values, costs, checks

Part 19 of "Yes finish them next" (2026-10-24). Draft PR #45 stacked on #44 (branch `claude/creatures-insects-20tcd3`, worktree `/home/claude/gt-insects`). Two units of body `insect`, two plans.

**Scarab** (lapis shell, gold rim, team seam ridge, digging front legs): a creature plan of its own, `PLANS` gets `{ supported: insectSupported, build: buildInsectTemplate }` (rich-insect.js: no head/headgear/weapon, extras only shell/eye_glow). 27 bones; `BEETLE_LEGS` = F1 F-1 M1 M-1 B1 B-1, bones `<key>u/l/p`. `insectLeg` and `bead` are shared with the scorpion. Rig `stride: 0.9`. 5961 tris, 0.341 tall (1.01x low-poly), team seam 4.8% of the top-down area.

**Scorpion Man** (scale 1.15, bowman, bronze, team shawl and headband): a person on a scorpion, built like the centaur by the humanoid template path in rich-humanoid.js (`scorpion = v.body === 'insect'`, `scorpionFrame` tx 0.16 / lift 0.215 - hipY, `addScorpionBones`: 36 bones after the humanoid's 23, pelvis a child of `body`, `settle`). `richSupported` needs `scorpionSupported(v)` AND a `SCORPION_OUTFITS[unitType.lookOf || unitType.pantheon]` entry (rich-scorpion-outfits.js, only mesopotamian), so another pantheon's insect person keeps the low-poly model. `outfitFor(pan, 'insect')` lays it over the pantheon outfit; its `legs` layer is `addScorpion`. `PROFILES.scorpion` = the values the low-poly `insectTemplate` used inline, so low-poly is identical (966 tris / 1.0409; scarab 426 / 0.33854). 9558 tris, 0.997 tall (0.96x), 59 bones, team share 3.5%.

**Pose** (rich-insect-anim.js via `applyCreature` plans insect and scorpion; unit-anim.js insect case calls it when `m.rich`): `stepLegs` swing/roll/flex scarab 0.6/0.2/0.12, scorpion 0.34/0.14/0.28; tail joints `-st*(0.1 | 0.22)`; pelvis counter-pitch `-0.6*bRz`; person by `poseRider` (`rhythm` and `poseRider` exported from rich-centaur-anim.js; centaur bone matrices bit-identical, hashed over six states on both centaurs and six warriors).

**Checks**: tests/render/rich-insects.test.js (17 tests); checksums vs the centaur branch identical for all ten pantheons, rich and low-poly, except the two new units. Traps: [rich-insect-look-traps](rich-insect-look-traps.md). Overview: [rich-creatures-plans](rich-creatures-plans.md). Still to do: Airavata, the ram.
