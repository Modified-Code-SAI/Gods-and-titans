# soldier-ranks

> Soldier experience and ranks in the gods-and-titans game (PR #15, merged 2026-10-21): who ranks, the numbers to tune, why the marker is diamonds

2026-10-21: the owner asked for "basic soldier experience gain", one of four parallel asks (pop cap 200 is PR #13, worshipper upgrades PR #14, plus making pantheons more distinct). PR #15 was merged to main at the owner's request the same day (squash, deployed to Pages). He tests by hand and will tune the numbers.

- Everything the Barracks trains ranks (Warrior, Archer, Priest, Battering Ram): Recruit / Veteran / Elite / Champion at 0 / 60 / 150 / 300 xp, each rank +10% hp, +5% damage, +0.5 armor. XP comes only from the killing blow (units: `xpValue`, completed buildings: hp / 50) plus 0.1 per hp a Priest heals. Gods, titans, creatures and Worshippers do not rank.
- All knobs are constants in src/config.js (`RANK_XP`, `RANK_HP`, `RANK_DAMAGE`, `RANK_ARMOR`, `HEAL_XP`, `BUILDING_XP_HP`); the thresholds are a first guess, not play-tested. The AI's soldiers rank too, and its force estimate (`liveCombat` in src/ai/unit-info.js) counts rank damage but still ignores building-upgrade damage.
- State is `rank` and `xp` on the sim unit and `rk` / `xp` in the EntityView, plus a `rankUp` event. The repo has no save/load (the coordinator's "games can be saved" did not match the code); a later save only needs those two numbers.
- The marker over a unit is one to three bronze / silver / gold diamonds (`StatusLayer.addRank`), not chevrons: the buff status icon is already a pair of gold chevrons and a buffed Recruit read as a Veteran. Keep new markers off the chevron shape. Ranked units push the status icon row up one slot.

**Why:** a later thread that tunes combat or balance, adds Barracks units, or adds status icons needs to know soldiers grow stronger in fights and where the knobs are.
**How to apply:** change numbers in config.js; a new unit with `producedAt: 'barracks'` ranks automatically (`canRank` in src/data/ranks.js). Details in DESIGN.md 5.9 and the `[soldier-ranks]` entry in notes/decisions.md. See [mythic-war-game](mythic-war-game.md) and `pr-merge-workflow` (process note, not kept).
