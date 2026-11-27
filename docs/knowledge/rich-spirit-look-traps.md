# rich-spirit-look-traps

> Traps from the Shade and Banshee pass: glow-solid rule, translucent cloth, shadow flag override, pale colours, and the framing that works for their stills

Look and engine traps from the spirits pass ([rich-spirit-plan](rich-spirit-plan.md)):

- A vertex with glow at least `SOLID_GLOW` 0.6 is forced solid by `ghostly` (it is meant for the eyes and the circlet's gem). Tongue tips first built at glow 0.5 became bright flat planks; keep fading parts under 0.6 (they use 0.3).
- Cloth alpha under about 0.85 over the head shows the head through it (a hood at 0.7 read as a glass bag) and a dark see-through shell over grass tints green. The body is 0.88; the translucency that sells a ghost is the hem and the tongue tips.
- `UnitView.setCastShadow` (game-renderer.js) sets `castShadow` on every mesh of a unit at creation and on quality change, so a flag set in the model builder is overwritten: rich ghosts cast shadows like the low-poly ones. Do not claim otherwise.
- A near-white gown (the Banshee's #dfe6ef) burns out under golden hour and bloom: cap the luma in `palette`, then give the shawl and veil a darker blue-grey so head and shoulders read from above.
- unit-fade.js scales a transparent material's opacity, so vertex-alpha ghosts fade in and out correctly (tested).
- From the game camera the face is invisible; the hood's peak, the sash, the claws and the trailing hem carry the figure.

**Framing** (scratchpad tools): `lone.sh` Shade dist 4.5 dy -0.6 (dist 11 zoomed out), Banshee dist 9 dy -2.6 (dist 14 dy -1.5); `TODS=golden,dusk,night` env picks times of day. Gallery (`cview.sh`): Shade aim=1.1 dist=3.0, Banshee aim=3.0 dist=4.2 because she floats; `state=move&t=1.4`, `attack&t=0.35`, `cast&t=0.6` show the poses.
