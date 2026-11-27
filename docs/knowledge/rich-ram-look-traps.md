# rich-ram-look-traps

> traps from the battering ram pass: bone rest offsets in poses, lathe winding and rim turn, horn coil, vertex-paint resolution, log-vs-frame clearance, still framing for a small unit

Traps from the ram pass ([rich-ram-plan](rich-ram-plan.md)):

- **A pose must add the bone's rest offset.** `bone.position` is the offset from the parent (createBones subtracts the parent's absolute rest). `applyRam` first set `body.position.y = 0.008 |sin|` (or 0) and the whole frame sat 0.178 too low in every render; the gallery showed the sills lying on the ground. A test now holds the frame's bone at its rest height in every state. Same family as the root-parent bug in [rich-centaur-look-traps](rich-centaur-look-traps.md).
- **Lathe rules** (rich-ram-parts.js): the profile runs with the outside on its left as it climbs, closed profiles for rings; a mirrored wheel reverses the profile and negates t. A 14-sided rim floated 0.004 off the ground: `turn: PI / 14` puts a vertex straight down.
- **Horns**: a coil flat to the side vanished into the skull, and 1.55 turns at radius 0.056 read as a bird's bill. 1.12 turns in a plane tilted 0.35 rad shows from above and from the side. The head's `|z|` reach is 0.129 at the log's height.
- **Vertex paint is coarse.** The roof's outer layer is 153 vertices a side; a painted iron strap came out as a blurred stripe. Use creases at battens, tone per hide and a trim; the geometry (pillows, scalloped hem, rolled hem, battens) carries the rest.
- **Log versus frame**: posts leaning to the ridge (z 0.215 to 0.032) let the horns in 5 mm and the log's flank 16 mm at the top of the forward swing; a tie at y 0.6 sat in the arc; a post with a knee put its iron band through the roof. Now posts z 0.24 to 0.05, tie y 0.66, and a test sweeps theta -0.75 to 1.26. `clear-ram.mjs` in the scratchpad was the prototype.
- **Budget**: the first build was 8.5k; trimmed with one fine roof layer plus a coarse underside, one-segment posts and ropes, 8-sided battens, fewer wheel and head sides. `tricount-ram.mjs` prints triangles per call site.
- **Tests that assumed the ram stays low-poly** broke the moment the plan landed: any new plan must grep tests for `battering_ram` and the unit's id.
- **Stills**: the ram is about 115 px long at the game's closest zoom (distance 10); shoot at 4.5 and 10 with `lone.sh`, DY -0.4 at 4.5 keeps the banner in frame (positive DY moves the unit up). Gallery: `cview.sh` with `facing`, `pitch`, `dist`, `aim`, `aimx`; the head close-up needed `dist=1.05&aim=0.4&aimx=0.62`. The dusk light is pink everywhere, so a red roof reads salmon.
