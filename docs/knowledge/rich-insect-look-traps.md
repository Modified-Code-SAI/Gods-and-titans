# rich-insect-look-traps

> Traps from the insect pass: ring-frame flip on a vertical tail, blendPose attenuation and stride, shin fold sign, settle moves the root, chitin vs skin tone, thin team ridge, still framing

Traps from the scarab and scorpion man pass ([rich-insect-plan](rich-insect-plan.md)):

- A loft whose path turns from along the ground to vertical flips its ring frame about a fixed `ref [0,1,0]` (the tail's rings twisted at the turn; same family as [rich-naga-look-traps](rich-naga-look-traps.md)). The tail uses `ref [0,0,1]` (the side vector: first radius lies along it). Use a ref perpendicular to the plane the path bends in.
- `blendPose` low-passes the old pose keys (rate 24), so at a fast cadence a leg sweeps less than the ground goes by and the planted feet slid. Fix in the rich rig only: shorter `rig.stride` (0.9 instead of the 1.25 default) and a bigger swing. Measure with the scratchpad `anim-insect.mjs` (`ROOT=... node anim-insect.mjs pan:id stride=0.9`): lift, x sweep and planted-foot velocity per leg.
- A leg's knee fold must oppose the thigh's roll: with the same sign the shin cancelled the lift (feet rose 1.6 cm). `stepLegs`: thigh `rotation(-side*(up*roll), side*swing, 0)`, shin `side*(curl - up*flex)`.
- `settle(geo, spec, F)` shifts ALL bone positions, root included, by `tx`; a pose that does `root.position.set(bX, y, 0)` drops the whole model by `tx`. Capture the rest position (`q.root`) and add to it.
- The mirrored legs: alternation of left and right swings shows as the SAME sign of `rotation.y` on the two thighs (mirror), so test alternation by foot world x relative to rest, not by comparing angle signs.
- The scarab's lunge lives on the root bone (`bX`), not on `body`.
- Chitin of the person's skin tone made the Scorpion Man read as one body with his shell: chitin is `mixC(skin, primary, 0.8)`, darker, with a gold rim.
- Team colour: a thin ridge was 2.9% of the scarab's top-down area; widened (`ps(.., 0.014, 0.034*taper)`, flecks > 0.965) to 4.8%. Scorpion man 3.5% (centaurs 4.9/5.2%, Lamassu 2.0%). Measure with scratchpad `teamcount2.mjs pan:id`.
- Scorpion man budget: first build was 11.0k tris (> 10.5k); trimmed leg sides (6), `lite` leg profile (7 stations, no joint rings, no ankle spur), pauldron rings, tail stations. `tricount.mjs` prints triangles per build call site.
- The skin-partition test must not count the sting as "person": it hooks forward over the back (x down to about -0.1, y to 0.69) and is skinned to the tail; restrict the "person" region to x > pelvis.x - 0.12.
- Framing for `lone.sh`: scarab dist 2.6 dy -0.1 (10 at the game's closest zoom), scorpion man dist 5.5 dy -0.5 (10.5), facing 0.5. Gallery: `cview.sh TAG "pan:unit:facing=35&pitch=18"`; `cfilm.sh` for walk and attack filmstrips (gallery stills do not animate).
