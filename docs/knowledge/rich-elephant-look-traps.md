# rich-elephant-look-traps

> Traps from the Airavata pass: rider context, leg and foot seam, gold bands, white hide bloom, sliding stride, bone world units, budget trims, still framing for a scale 3.8 titan

Traps from the Airavata pass ([rich-elephant-plan](rich-elephant-plan.md)):

- The unit's visual head 'elephant' would give the person an elephant's head: dress him from `riderContext`, never straight from `unitContext`.
- Leg and foot as two lofts showed a cuff (each loft smooths its own normals and the foot's first ring sat above the leg's last). One loft down to the sole with a flat end fixed it. Gold bands on a leg must be centered on the leg's path at their height and 1.17 times the leg's polygon, else the leg shows through them as shards (same family as [loft-skinning-traps](loft-skinning-traps.md)).
- A white hide (`#efece6`) blooms into a white blob at golden hour: hide = `shadeC(pal.skin, 0.9)`. Dusk and night read fine.
- Stride 1.6 slid the feet; 1.3 with the swing reach and the knee fold holds them (see the blendPose note in [rich-insect-look-traps](rich-insect-look-traps.md)). `bone.matrixWorld` is in rig units and is not multiplied by the model scale 3.8: do not divide by it in a gait test.
- Budget: the first build was 16.7k (over 14k). Trimmed: ring and side counts, a `lean` build for the side heads (eyelids on the middle head only, the inner ear skipped), one gold band per tusk, 3 tassels a side, 7 plumes, caparison sheet 7 by 14. `tricount-deep.mjs` prints triangles per call site.
- The bolt at weaponSize 0.85 was as big as the rider: 0.55 now. The person is small on purpose (0.72), the elephant is the unit.
- Stills: a scale-3.8 titan fills the frame at the game's closest zoom (10): shoot at 17 and 28 with `lone.sh` DY -2.2 and -1.2 (positive DY moves the unit up: the rider and halo were cut off at +1.5). Gallery: `cview.sh` with `dist`, `aim`, `aimx` (unit-scale heights); facing 90 is the front and 270 the rear; film strips need 440 px or more per cell (`W=2300 H=440 zoom=1.2`); the death strip needs `PITCH=38 zoom=0.8` or the fall leaves the cell.
- The 'plate' where the front leg leaves the barrel, seen from the side, is the crease where two thick tubes meet; left as it is (not visible from the game camera).
