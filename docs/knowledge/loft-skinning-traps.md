# loft-skinning-traps

> MeshKit loft/skin gotchas found in the creature passes: paint angle is a fraction, mixBind order, alongPath ends, cap pole, backTone

Traps when painting and skinning a `MeshKit` loft (rich-kit.js), found while building the creature plans ([rich-creatures-plans](rich-creatures-plans.md), [rich-serpent-plan](rich-serpent-plan.md)):

- The loft paint callback `(out, x, y, z, u, a)` gets `a` as a FRACTION 0..1 round the ring (0 = top for `ref [0,1,0]`); `warp(p, a, u)` gets radians. Use `Math.cos(a * TAU)` for back/belly masks and `col = a * per + ...` for scale columns. Using radians made the quadruped coat, bird plumage and mammal-head jaw stripes land in the wrong places (fixed in #37 and #38).
- `mixBind(f, g, t)`: t = 0 gives f, t = 1 gives g. Reversing them skinned the neck to the wrong chain, so nothing bent.
- `alongPath(bones, pts, hw)`: bones[i] sits at pts[i], the last bone holds everything beyond the polyline, and a vertex exactly on the last point gets half of the previous bone, so extend the polyline a little past the last bone (end caps then belong wholly to it).
- Cap rings come first in a loft's vertices (vertex 0 is the start cap's pole).
- A loft's paint is per vertex: a scale pattern needs about 3 vertices to a scale (`rings` and `sides` of the loft vs `rowsK` and `per` of `scalesPaint`), or it renders as mud. A limb loft with `ref [1,0,0]` has angle 0 at its front, so the shared back/belly tints land on its front and rear: paint limbs with the pattern only.
- Toning an orange back over blue skin makes mud: `backTone(skin, back, k)` in rich-reptile-heads.js stripes the tone when the colours are far apart and washes it wide when near.
- The shot tool wants an absolute map path (the script changes directory); never `pkill -f` a pattern that matches your own command line.
