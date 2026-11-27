# rich-creature-look-traps

> Look traps from the quadruped, bird, lizard and beast-biped passes (lion/hyena heads, manes, spots, ears, wings, crocodile stance) and the shot framing facts for creatures

Look traps from the creature passes ([rich-creatures-plans](rich-creatures-plans.md), [rich-beast-biped-plan](rich-beast-biped-plan.md)):

- A big flat lion or cat head reads as a capybara: shrink it, add fur streaks, keep ears small, long legs and a tucked waist. A lion built from the mammal tables read as a rodent on a biped: the carnivore tables in rich-beast-heads.js fixed it.
- A full-length mane looks like a porcupine or quills: use rings of broad rounded locks laid back over a mane core, and for a face-framing mane two offset scalloped layers (4 rings each).
- Many-headed bodies need `lean` side heads (fewer rings) or they overshoot the triangle budget by about 40 percent.
- A bare wing bar reads as a stick from the side: add a flat covert pad over the leading edge and rows of coverts.
- A sprawling reptile built like a dog (legs under the body) reads as a hippo from above: stand the elbows out beyond the body's half width, flatten the barrel, spread the toes (see [rich-reptile-plan](rich-reptile-plan.md)).
- Per-vertex paint needs three vertices across a spot: the default 12-side torso cannot show them (the Bultungin gets denser lofts). A multiply by 0.3 barely shows under the studio light: tint toward a very dark brown.
- An ear whose open base lies outside the skull floats like a blade: start it round and put the base inside. White glow eyes on a beast look cartoonish: use amber.
- Flying units need aim `~-3` in `cview` close-ups (`~-1.5` cuts them off); in `lone.sh` real-renderer stills use `dy -3.5` (a positive dy pushes the unit out of the top of the frame).
- The thread's unit-models output attach cap is 24 files; give (an off-repo folder, not kept) path links instead of attaching more.
