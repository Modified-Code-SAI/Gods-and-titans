# rich-naga-look-traps

> Traps from the naga pass: loft frame flip on a vertical tangent, pot-like tail root, grey belly, tail length times unit scale, budget arithmetic, gallery t= phase, and still framing

Look and engine traps from the nagas pass ([rich-naga-plan](rich-naga-plan.md)):

- A loft with a fixed up `ref` flips its frame where the path turns from vertical to horizontal (the tail goes down the belly, then back along the ground). Use `BACK = [-.707,.707,0]` as `ref` and keep the keys in the down-and-back quadrant; do not let the path curl back past the vertical.
- Front view of a short fat tail root with a white belly reads as a pot. Narrow the belly stripe (`smoothstep(-0.5,-0.85,c)`), slope the root back and widen the plan-view S (z to 0.2) so the tail shows beside it.
- A belly made by lightening the skin toward white reads grey, on green skin like ash. `nagaBelly` mixes the skin 28 % into warm cream `#f2e4b8`; the cobra hood's face uses it too.
- The unit's `scale` multiplies the tail: Quetzalcoatl at 1.7 had a 3.0 long tail with the fan, so the fan is 0.42 long and rooted 5 stations back.
- Budget arithmetic: 46 stations of `sides + 4` = 2.0k triangles and put both gods over 9000; 40 of `sides + 2` = 1.6k fits. A tail-fan feather costs 24 triangles at 3 rows (32 at 4).
- A god's tiara and hairpins come from its pantheon dress (head layer), not from `headgear`: dropping `headgear` changes nothing on Nuwa. Removing `wings` from Quetzalcoatl saves only 0.9k, not 1.5k, because the feather cloak then draws more.
- unit-fade.js alpha-hashes a solid body (`alphaHash`, opacity k); only transparent materials (spirits) scale opacity.
- Gallery: `t=` does not move the tail's phase (0.6 s warm-up from the unit's seed each time); use `film=0.6,0.9,..` with `state=move` for a strip. `layertris-naga.mjs` and `attach-naga.mjs` (scratchpad) split triangles by layer and rigid piece.

**Framing**: `lone.sh` Naga dist 6 dy -0.8 (11 zoomed out), Nuwa dist 6.5 dy -0.9, Quetzalcoatl dist 7 dy -1.0, facing 0.3 so the tail trails visibly to the left. Gallery heads: `aim=1.15 dist=2.4`; whole body `aim=0.8 dist=4.6..7`.
