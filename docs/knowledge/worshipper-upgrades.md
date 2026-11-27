# worshipper-upgrades

> Worshipper work-speed and health upgrade lines at the Town Center (PR #14): data shape, effects, one-card-slot-per-line rule

2026-10-21: the owner asked for "worshiper upgrades for working and health". It was one of four parallel threads (200 pop cap, soldier XP, unique pantheons, this one). PR #14 (branch claude/project-thread-j1i8cs) was squash-merged to main at the owner's request the same day with CI green (551 tests); see `pr-merge-workflow` (process note, not kept).

- Two 3-level lines in buildings.js `town_center.upgrades`: Work Songs, Master Craftsmen, Tireless Devotion (hotkey K, line `worshipper_work`, new `work` effect +15/+15/+20% added up) and Hearty Meals, Healing Herbs, Blessed Vigor (hotkey H, line `worshipper_health`, `unit` hp +20% each of base 220 via `classes: ['worker']`). Levels need settlement tier 1/2/3.
- New upgrade fields: `line` (shared id and hotkey, levels adjacent in the list) and `after` (id of the previous level; sim error "Requires <name>."). `validateUpgradeLines` (schema.js) checks them. `offeredUpgrades()` / `lineOf()` in src/data/upgrades.js make the command card show ONE button per line (the next level), which is how the Town Center card fits its 7 upgrade slots (4-10; the card silently truncates beyond that).
- Work speed (`workSpeed`, `chopSpeed` in data/upgrades.js; `workSpeedOf` in sim/economy.js) multiplies the mining timer rate, chopping (times Sharpened Axes), construction and repair. Not praying, walking or training. Mining is tick-quantized (30 to 27 ticks at +15%).
- HUD: Worshipper panel "Work" stat; gold mine rule line and Gather tooltip quote the viewer's trip (`mineTripText`, `workText` in ui/hud-data.js); the Town Center "Upgrades:" line shows only the top level per line.
- AI: `RESEARCH_ORDER` (exported, ai/production.js) lists the lines; `planResearch` skips unmet `after`.

**Why:** later upgrade work should reuse the line/after pattern instead of adding card slots or a second system.
**How to apply:** for a multi-level upgrade add the levels next to each other with `line`, `after` and one hotkey, add the ids to RESEARCH_ORDER. See [mythic-war-game](mythic-war-game.md).
