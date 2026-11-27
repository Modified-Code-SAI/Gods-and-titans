# rich-reptile-plan

> Cipactli (crocodile) and Mushussu (dragon-headed beast) rich models on the quadruped skeleton: files, builds, paint and stance knobs, traps, costs, still framing (PR #40)

Units: `aztec_cipactli` (titan, scale 4, crocodile head) and `mesopotamian_mushussu` (minion, scale 1.5, dragon head, horns). PR #40 (draft, stacked on #39, opened 2026-10-24); stills in (an off-repo folder, not kept) Part of [rich-creatures-plans](rich-creatures-plans.md); heads and paint come from [rich-serpent-plan](rich-serpent-plan.md).

Files: `rich-reptile.js` (`reptileSupported`: quadruped body, head crocodile or dragon, 1 head, nothing held, dragon gear none/horns/antlers/crown, extras spikes/tail/eye_glow). It uses the quadruped bone names minus ears, so `applyQuadruped` poses it; template `rich.plan` is 'quadruped'. A sprawl rig (`rig.sprawl: true`, the beasts set false) makes `applyQuadruped` wag hips/spine/chest yaw 2.4x. Crocodile skull is in `REPTILES.crocodile` (rich-reptile-heads.js; `browTone` paints the brow ridge halfway to skin, tooth row is `teeth`/`toothLen`/`lowerTeeth` table data). Opt-in options added to shared code: `scalesPaint` `plates` / `per` / `rowsK`, `dorsal` `a` / `flip` / `w`.

Builds (`BUILDS` croc, drake): L, H, W, leg (belly clearance), stance and out (elbows stand out to `stance*out*W` from the middle, 1.5x the body half width on the croc), neckLen / neckA, `toes` (croc: `lizardFoot`, 5 front, 4 hind; drake keeps `paw`). Team colour: two `ring` bands if scale >= 2.6, else the beasts' `saddle`.

Traps: a croc with legs under the body and a deep barrel reads as a hippo from the game camera (W 0.27, leg 0.115, stance 0.74, out 1.5 fixed it). A leg loft has `ref [1,0,0]`, so the shared back/belly tint put a pale wedge on the back of the upper leg: legs get the pattern only (`back: skin, belly: skin`). Per-vertex paint needs about 3 vertices per scale: 19 rings gave mud, 30 rings x 22 sides reads. A dark brow ridge on a croc looks like a hat brim. The dragon's cheek fins read as a blue scarf on the Mushussu, so `fin` is null there.

Costs: Mushussu 6.5k (minion budget 8.5k), Cipactli 7.6k (titan 14k); rich height 1.24 and 1.64 against low-poly 0.89 and 2.05 (the test allows 0.6 to 1.5 times).

Stills: scratchpad `lone.sh TAG TREE DETAIL PORT PANTHEON UNIT DIST DY FACING [DX]` moves the rest of the formation out of frame with `--eval` and faces the unit; croc `16 0 0.4 -9` (clear grass, west of its start), mushussu `6 0 0.6`. Gallery views: `cview.sh` with `facing=0&pitch=82` (from above) and `pitch=8` (side).
