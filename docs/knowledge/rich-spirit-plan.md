# rich-spirit-plan

> Shade and Banshee rich spirits on the humanoid rig with a tail-bone wisp and per-vertex alpha ghost (PR #42, creature pass 6): files, hooks, values, costs

Part 16 of "Yes finish them next" (2026-10-24). Draft PR #42 stacked on #41 (branch `claude/creatures-spirits-20tcd3`). Greek Shade (minion, hood, eye_glow) and Celtic Banshee (creature, air, scale 1.2, veil, long_hair). Not a plan of its own, like [rich-beast-biped-plan](rich-beast-biped-plan.md): body `spirit` is in `RICH_BODIES` (rich-humanoid.js); dims from `PROFILES.spirit` (unit-bodies.js, shared with the low-poly `spiritTemplate`; its `lean -0.08` is read only by the rich rig).

**Code** (src/render/models): `rich-spirit.js` has all the dressing (shroud = bell + 11 tongues, robe + TEAM sash, mantle, sleeves, hands, `cowl` for hood or veil, hair, circlet, `face`, palette cap, `SPIRIT` outfit, `ghostly(kit)`). Kit: `humanoidSpec(d, { tail: [[x,y,z]..] })` appends chained bones after any wing bones (`spec.tail = {first,count}`, `spec.wing` boolean; `applyRich` tests those, not the bone count), reusable for the nagas; a paint may set `out.alpha`, then `build()` writes a 4-component color. `outfitFor(pantheon, body)` gives body `spirit` the SPIRIT outfit; outfits gained hooks `hands(E)` and `face(E)`. Anim: `poseTail` in rich-anim.js; unit-anim's naga/spirit case calls `applyRich` when `m.rich`; `rig.float` 0.12. The skinned ghost material is opacity 1 + transparent + depthWrite (low-poly ghosts stay 0.62).

**Values**: BODY_ALPHA 0.88, SOLID_GLOW 0.6, BASE_GLOW 0.12, `build({ground:0, strength:0.6})`, palette luma caps 0.68 to 0.78, hood `peak` 0.08.

**Costs and checks**: Shade 6164 triangles, Banshee 7616, about 100 ms a template. tests/render/rich-spirits.test.js (16 tests); rich-models.test.js gates now list only the centaur, Dullahan and ram as low-poly. All ten pantheons identical, rich (`col-root.mjs`) and low-poly (`col-base.mjs`). Traps and framing: [rich-spirit-look-traps](rich-spirit-look-traps.md). Overview: [rich-creatures-plans](rich-creatures-plans.md).
