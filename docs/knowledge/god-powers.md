# god-powers

> AoM-style one-use god powers (PR #67, merged 2026-10-28): three per pantheon by tier, power bar beside minimap, AI casts them; code map, rules, traps

Plan item 6 ((an off-repo folder, not kept)). Each pantheon: Village blessing, Town strike, City cataclysm, each once per game. DESIGN 4.11.

- Data `src/data/powers.js`: 30 powers via builders `boon` (gather +50% per deposited load, or faith x2, 60 s), `healRain`, `barrage` (bolts on random spots, max 4 s, `BARRAGE_MAX_SECONDS`). IDs `${pantheon}_power_${slug}`. Numbers are first guesses; tune only here.
- Sim `src/sim/powers.js`: `godPower` command, stand-in caster `{kind:'power', dead:true}` through `applyEffect` (kills/plunder credited, no retaliation). `p.powers = {used bitmask, boons}`; snapshot `gp`, `gb`. Strikes refused in peace and outside team sight; `teamSees` uses `tileInSight` (visibility.js) so it matches the client fog grid tile for tile (Codex finding).
- AI `src/ai/powers.js` every third think: economy thresholds, heal at 1200 missing hp, strikes at 1800 enemy hp in area (cataclysm 3600, buildings count 0.25). Easy's `castThreshold` raises bars.
- HUD `src/ui/hud-powers.js` PowerBar left of minimap; input.js `armPower`, ring red in fog. game.js/alerts.js announce casts (`power_enemy` alert).
- Trap: the meteor VFX flight was capped at 2.5 s; raised to 4 s so late barrage bolts land with their damage (second Codex finding).
- Merge hotspots hit: economy `deposit` (now also stats.gold/wood from the chronicle #62), snapshot player stats line, delta EVENT_SHAPES end, DESIGN 6.3 and 10, How to Play step numbers.

Related: [sacred-sites](sacred-sites.md), `pr-merge-workflow` (process note, not kept).
