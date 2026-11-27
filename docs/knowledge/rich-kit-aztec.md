# rich-kit-aztec

> Pieces, outfit rules and traps from the Aztec rich-character pass (seventh pantheon): maxtlatl, quilted armor, obsidian macuahuitl, eagle and hummingbird helms, jaguar pelt, Tlaloc's goggles, and team color on gods

Aztec pass (draft PR #33 stacked on Chinese #32; outfit file rich-outfits-aztec.js, 9 units: worshipper, warrior, archer, priest, Eagle Warrior, Huitzilopochtli, Tezcatlipoca, Tlaloc, Tlaloque; Quetzalcoatl (a naga), Cipactli, jaguar spirit, ahuizotl and Xiuhcoatl stay low-poly). New in src/render/models/:

- Gating: `RICH_PANTHEONS` + `aztec`; `RICH_HEADGEAR` + `headdress` (also lets the West African priest through for tools that pin rich; Quetzalcoatl is a naga, so nothing changes in play). An outfit's `shield` hook may now be a function of ctx (the sun god's shield is not the soldiers').
- rich-paint: `jaguarSpots(cell)`, `quilt(cell,k)`, `featherRows({pitch,per,cx,cz,dark,light})`.
- rich-clothing: `addMaxtlatl(kit,D,bind,{color,border,band,len,knot,mark,mat})` (each apron is a cloth sheet plus two side strips and a hem strip), `addIchcahuipilli`, `addLegBands`; `addFurMantle` and `addCape` gained an optional `paint` (cape also `mat`), defaults unchanged.
- rich-headgear: `addQuetzalFan`, `addEagleHelm`, `addHummingbirdHelm`, `addTlalocMask` (goggle rings, white lip, two fangs). rich-regalia: `addQuetzalBack` (plume fan on the chest bone).
- rich-gear: `macuahuitl` for club and sword when `gear` returns `{macuahuitl:true}` (flat paddle, serrated obsidian sheets, 784 tris); `richShield` options `puffs` and `fringe`. rich-arms: obsidian mirror (`obsidian:true`), clay jar for `cauldron` (`jar:true`).

Traps and numbers:
- Per-vertex paint blurs anything finer than the ring spacing: borders and checked hems are their own sheets. The AO bake smudges thin cloth near the body (middle of an apron). Obsidian prisms read as thorns; serrated sheet strips are denser and cheaper. featherRows and jaguarSpots read as mottling and blotches at this size (accepted).
- The hummingbird helm covered the eyes until its rim was cut back in front with a `warp` clamp.
- The gods first had 0 team-colored vertices (codex colors). Added: crest feather and shield face (sun god), headband and upper arms (Tezcatlipoca), crown plumes and back fan (Tlaloc), loincloth and plume (Tlaloque). Measure team share for every god before the PR (scratchpad `ameasure.mjs`).
- Budgets: Huitzilopochtli 8.5k of 9k is the tightest, warrior 6.2k of 8.5k, the rest 4.6k to 6.9k.
- The harness scenes (`tools/shot-characters.mjs`, `unit:ID`) only list the shared mortals, the pantheon's gods, creatures and minion, not the elite (Eagle Warrior): it shows only in the gallery sheet.
- To compare a held item with the shared one build `{...unit, pantheon:'norse', lookOf:'norse'}`: shared mortals pick their outfit from `lookOf`.

**Why:** Celtic, Mesopotamian and West African reuse these pieces and the same traps.
**How to apply:** read with [rich-kit-pieces](rich-kit-pieces.md), [rich-kit-chinese](rich-kit-chinese.md) and [rich-rollout-status](rich-rollout-status.md).
