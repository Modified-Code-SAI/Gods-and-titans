# rich-kit-japanese

> Pieces, outfit hooks and traps from the Japanese rich-character pass (fifth pantheon), to reuse in the Chinese, Aztec, Celtic, Mesopotamian and West African passes

Japanese pass (draft PR #31, stacked on Hindu #30; outfit file rich-outfits-japanese.js). New in src/render/models/:

- Outfit hooks, both optional and absent for older pantheons: `palette(pal, ctx)` recolors the shared palette before anything is built (black hair for `ctx.mortal`); `gear(ctx, item)` returns options for how a held item is built (`kanabo`, `yumi`, `staff:'shakujo'`, `fan:'hauchiwa'`, `drum:'stick'`).
- rich-heads: `crow` (Tengu beak) and `oni` (tusks, brow); `BEAST_HEADS` is now jackal, falcon, monkey, bird, demon.
- rich-headgear: `addChonmage`, `addJingasa`, `addKabuto` (the kuwagata crest is a bevelled `slab` placed with an Euler rotation), `addEboshi`, `addTokin`, `addHeadband`, `addHairSpikes`.
- rich-clothing: `addKosodeCollar`, `addObi`, `addHakama` (the hem is its own band loft), `addDoMaru`, `addSode` (stepped plate rows with lace strips), `addKote`; `addPteruges` takes `mat`. rich-body: `addGeta` (one tooth hangs below the sole: fliers only).
- rich-regalia: `addAuraRing(E,{kind:'rays'|'drums'})`, a closed ring on `bind.chest` that is part of the skinned mesh, not an attach piece (`aura_ring` is in `RICH_EXTRAS`); `addSashimono(E,{...})`, the banner on a pole for gods without a ring.
- Arms: katana (`RICH_WEAPONS`), `club` with `kanabo`, `bow` with `yumi`, the shakujo staff, ogi and hauchiwa fans, mirror, jewel (`orb` offhand), bachi (`drum` weapon). `richArm('drum')` is the damaru unless `opts.drum === 'stick'`.

Traps:
- `MeshKit.sheet` ignores `flip`; the outer face looks along du x dv, so for a left and right pair run `u` the other way on one side, or inner and outer colors swap.
- Vertex colors blur a hard trim inside one loft: make the trim its own band loft. Paint is per vertex, so a pattern finer than the ring spacing needs geometry (lacing).
- `slab` with bevel segments costs 150+ triangles; the Oni sits at 10.2k of the 10.5k creature budget.
- `unitLook(u, 'norse')` does not change a pantheon unit's own outfit (`E.pantheon = lookOf || pantheon`); to compare with the default build use `{...unit, pantheon: 'norse'}`.
- Re-use of a shared builder must leave older pantheons identical: check per unit a checksum of position, color, aFx, aAo, skinWeight and attach arrays between the previous branch and this one (an `ankh` offhand change was caught this way).

**Why:** each pantheon pass should add a few pieces to the kit, not rebuild them.
**How to apply:** read with [rich-kit-pieces](rich-kit-pieces.md) and [rich-characters-rollout](rich-characters-rollout.md) before the next pantheon.
