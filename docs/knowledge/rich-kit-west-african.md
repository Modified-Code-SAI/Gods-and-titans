# rich-kit-west-african

> shared pieces, paints and the two new outfit hooks (skin palette, gear side) from the West African rich-character pass

West African pass (part 10, the last; worktree /home/claude/gt-african, branch `claude/characters-west-african-20tcd3`). Ten rich units: worshipper, warrior, archer, priest, Dart Hunter (elite), Shango, Oya, Ogun, Anansi, Aziza. Low-poly: Ninki Nanka (dragon), Sasabonsam and Bultungin (beast_biped, only the Chinese build those), Osebo (quadruped), Onini (serpent), battering ram.

New shared pieces, all additive (defaults unchanged; all nine earlier pantheons checksum-identical):
- rich-paint.js: `kente({colors, strip, block, r|flat, cx, cz})` strips round a body, even strips banded across in the colors that follow, odd ones plain with a band every third block; `kenteAt(colors, i, j)` the same by a cloth's own grid (a drape's u/a); `mudcloth({ink, cell, r|flat})` dark ground, every other strip a ladder of pale bars, the strips between dotted.
- rich-clothing.js: `addTunic`, `addLongSkirt`, `addWrapSkirt` take `weave` (a pattern in the cloth itself, laid on before its shading) plus `sides`/`rings` for a finer grid; `addRaffia` (rows of strands over a short under-skirt, `under`/`band`/`rows`/`n`/`len`), `addBangles` (`color` one or a list cycled, `n`, `gap`, up the forearm), `addAmulets` (strap shoulder → opposite hip, leather packets, cowries between, `side`/`low`/`high`).
- rich-headgear.js: `addHeadWrap` (gele: stacked leaning bands, a fan, tails), `addBeadedCrown` (ade: cone of beadwork squares, metal band, knob, veil of strands before the face; `veil: 0` none), `addHornedCap` (cap + band, antelope horns or a `plume`, `cowrie` row), `addFila` (folded cap flopping to a side), `addRaffiaCrest`.
- rich-regalia.js: `addQuiver`, `addSpiderPendant`; `extraArmsPiece` items may be `{ id, opts }`.
- rich-gear.js: `oshe` (`double_axe` + `oshe`), `whisk` (`whip` + `whisk`), `machete` (`sword` + `machete`), `spiderStaff` (`staff: 'spider'`), exported `spider(kit, matrix, size, …)`. double_axe and whip are not in `RICH_WEAPONS`, so both need `build: true`.
- rich-arms.js: `DRUMS` = {stick (thunder god), talking, beater}, by `opts.drum`.

Two new hooks any pantheon can use: an outfit's `palette` may recolor the skin (`E.skin` is re-read from the palette right after it, rich-humanoid.js ~line 127) and its `gear(ctx, item, side)` is told the hand (1 right, -1 left), because a drum weapon fills both hands (the priest: talking drum left, beater right).

**Why:** the pieces and both hooks are shared, so a later pantheon or look change can reuse them.
**How to apply:** read with [rich-kit-pieces](rich-kit-pieces.md) and [rich-rollout-status](rich-rollout-status.md); the density limits and iterations are in [west-african-look-traps](west-african-look-traps.md); held-item frame and budgets in [rich-skeleton-rules](rich-skeleton-rules.md).
