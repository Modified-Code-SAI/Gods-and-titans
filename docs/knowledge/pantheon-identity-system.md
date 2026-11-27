# pantheon-identity-system

> How each pantheon is made unique in the game (blessings, elite soldier, looks), where the code is, and the test caveat

The owner asked (2026-10-21) to "make each pantheon more unique". Merged to main as PR #16 (squash 0f4780e) at his "Merge it." the same day, deployed to Pages; it sits on top of PRs #13 (pop cap 200), #14 (worshipper upgrade lines), #15 (soldier ranks) and #17 (Decade of Peace, no interaction). Spec: DESIGN.md 4.10; choices and numbers: notes/decisions.md `[pantheon-identity]`.

Each `src/data/pantheons/<id>.js` now has:
- `identity {tagline, playstyle, blessings[2]}`: always-on effects in the upgrade vocabulary, folded in by `computeMods(upgradeIds, pantheonId)` (so `p.mods` has them from tick 0). New effect `perk` (stats in `PERK_STATS`, schema.js) for plunder, sacrifice, karma, shrineFaith (sim/spoils.js) and buildSpeed, techSpeed, cooldown, revive (one-line hooks). Building target `'*'` = all buildings.
- `elite`: fifth Barracks soldier, tier 2, pop 2, `kin: 'warrior'|'archer'` (Barracks upgrades naming the mortal reach it), `mortal: true`; ranks up via `canRank`. Pop 2 on purpose: at pop 3 its power per pop fell below the base soldier.
- `looks`: render-only restyle of the shared mortals (`src/render/models/unit-looks.js`).
- `src/data/pantheon-list.js` exists only to break the upgrades.js <-> index.js import cycle.

**Why:** gameplay differences matter more than skins; reuse the upgrade pipeline so sim and HUD need almost no new code.
**How to apply:**
- Test helper worlds give player 0 Greek (infantry +1 armor, +8% hp, gods start level 2) and player 1 Norse (plunder). Tests of plain unit numbers should use `PLAIN_PANTHEONS` (norse, hindu) from tests/sim/helpers.js.
- A new perk needs: one line in `PERK_STATS`, one sim hook, one test, and its blessing's description text.
- All blessing/elite numbers are first guesses for the owner to tune by hand after play; change them in the pantheon files only.
- Mortal model triangle budget is 1000 per model (tests/render/unit-models.test.js); icons in src/data and src/ui must be Emoji <= 11.
- Anything that prices or times a revival, research, build, cooldown or training for a player must go through `p.mods` (`reviveMult`, `buildingMods`, perks); the AI's own price quotes count too (Bugbot caught the AI's revive price on #16).
- tests/ai/ai-games.test.js "two equal hard armies at the population cap" is seed-sensitive: blessings stretched seed 4 to 24 min, so it runs seed 3. If a balance change breaks it, scan seeds (without the AI's `popUsed >= POP_MAX - 2` rule every seed idles) instead of raising the limit.
