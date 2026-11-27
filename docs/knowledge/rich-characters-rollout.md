# rich-characters-rollout

> Plan for taking the rich characters from the Norse sample to the other nine pantheons (the owner chose it 2026-10-23): scope, PR stacking, order, builder file map, budgets, what is held back

2026-10-23 00:35 UTC the owner tapped "Do the other nine pantheons" on the card after the Norse sample ([rich-characters](rich-characters.md); draft PR #24 stays unmerged until his "Merge it.", `pr-merge-workflow` (process note, not kept)).

- Scope: units with a humanoid or giant body on the 23-bone rig, about 80 units (mortals, elites, human-headed gods, giant titans, animal-headed gods such as Ra, Anubis, Hanuman; the Chinese upright monkeys through `RICH_BEAST_BIPEDS`). Animals, serpents, nagas, dragons, the hydra, elephants, birds, insects, centaurs and spirits need other rigs: held back, the owner was told, they stay on the old models.
- Order: Norse leftovers plus shared kit (#27, stacked on #24), then Greek, Egyptian, Hindu, Japanese, Chinese, Aztec, Celtic, Mesopotamian, West African. One draft PR each, base = the previous branch (after #24 squash-merges, retarget to main and cherry-pick onto the new main, as with #25 to #26). A pantheon is in play only when added to `RICH_PANTHEONS` (rich-humanoid.js), in its own PR.
- Builder map: rich-body (anatomy), rich-clothing, rich-headgear, rich-feathers, rich-regalia (wings, jewelry, spikes, cloaks, pennants), rich-gear (weapons, `richShield(ctx, D, style)`), rich-arms (tridents, bolts, scepters, scythes, fans), rich-outfits (`OUTFITS[pantheon]` overrides the layers legs, torso, arms, armor, cloaks, head, extras; optional hooks `shield`, `skinPaint`, `palette`, `gear`). `unitLook` sets `lookOf` so outfits know the pantheon of a shared mortal.
- Winged units get 27 bones. Test budgets: mortal 8500, god 9000, titan 14000, creature 10500, minion 8500, `multi_arms` +4000.
- Branches follow `claude/<topic>-20tcd3`; work stacked PRs in a `git worktree` (node_modules symlinked; never `git add -A`).

**Why:** a later thread needs the scope and the PR chain without asking the owner again.
**How to apply:** status and next steps are in [rich-rollout-status](rich-rollout-status.md); keep extras tier-gated ([gods-titans-graphics](gods-titans-graphics.md)), follow [rich-skeleton-rules](rich-skeleton-rules.md) for mounts, capture with [render-shot-workflow](render-shot-workflow.md).
