# rich-characters

> Rich skinned character tier (High/Ultra only) built as the Norse sample - what it covers, gating, files, and what waits on the owner's call

2026-10-21, thread "Character look sample" (graphics step 3, [graphics-overhaul-plan](graphics-overhaul-plan.md)): the owner asked for a SAMPLE of the new character quality for one pantheon (Norse: worshipper, warrior, Thor, Surtr) before the other nine pantheons. Draft PR #24 (opened 2026-10-21 19:08 UTC, branch `claude/project-thread-20tcd3`); it merges only on his "Merge it." (`pr-merge-workflow` (process note, not kept)). Before/after shots, film strips and a README: (an off-repo folder, not kept).

- On High and Ultra only, humanoid/giant units with a human head (headgear none/hood/horned helmet/horns; extras beard, long hair, cape, armor, fur, skirt, flames, eye glow) are one skinned mesh on a 23-bone rig: lofted smooth bodies, layered garments, beveled axe/sword/hammer/shield, faces with brows, baked AO, spine/head/foot/cape/hair motion on top of the old pose keys. `richSupported(unitType)` covers 25 units across all pantheons, but only `RICH_PANTHEONS` (Norse) get them in play; the other pantheons wait for the owner's call (`setUnitDetail('rich')` pins them on for tools). Odin, Freyja, Valkyrie, Einherjar, Frost Troll, rams and animals stay low-poly. Low and Medium keep the old models unchanged.
- Gating: `GameRenderer.unitDetail()` (high/ultra = rich), `detailFor(pantheon)` (Norse only), `setUnitDetail('base'|'rich'|'auto')` pins it, `setQuality` rebuilds the unit views.
- Files: `src/render/models/rich-kit.js`, `rich-humanoid.js`, `rich-gear.js`, `rich-anim.js`, plus `unit-models.js` (`buildRichParts`, skinned material variant) and `unit-bodies.js` (`unitContext`). Tests: `tests/render/rich-models.test.js` (own `RICH_BUDGET`: mortal 8500, god 9000, titan 14000) and `game-renderer-detail.test.js`; the old `BUDGET` in unit-models.test.js was not raised. Tools: `tools/shot-characters.mjs`, `tools/gallery-units.html?detail=rich`.
- Open after the sample: the other nine pantheons (needs a look pass each), distance LOD, authored assets. Rules and costs: [rich-skeleton-rules](rich-skeleton-rules.md).

**Why:** a thread extending characters to other pantheons or changing the rig needs the scope and gating.
**How to apply:** keep extra detail tier-gated ([gods-titans-graphics](gods-titans-graphics.md)); capture with [render-shot-workflow](render-shot-workflow.md).
