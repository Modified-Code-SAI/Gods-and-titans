# ai-difficulty-brutal

> Smarter Hard (raids, wounded pull) and Brutal difficulty (PRs #81, #82): what was measured, what was dropped, A/B bench method and traps

Plan item 11 (`engagement-research-2026-10-28` (process note, not kept)), PR #81, squash-merged 2026-10-28 as 1c6226e under the standing go-ahead.

- Hard/Brutal: worker raids (src/ai/raid.js, profile `raids`), wounded soldiers step back to a Priest (micro.js `pullWounded`). Brutal = Hard + think 3 + more raids, strictly fair. Achievement "Undaunted" (40 total).
- the owner chose "strictly fair" (2026-10-28): #81 shipped a 20% gather bonus for Brutal, PR #82 removed it (AI_INCOME_BONUS, player income, label hint). Do not add AI resource cheats.
- Bug fixed for all difficulties: military.js `centroid` is now the median of ground units (the mean let stragglers leave a winning army idle forever).
- Measured: new Hard vs main's Hard is EVEN once god powers (#67) exist (129-127 / 256): AI strikes hit raid squads. Raids skip players with a strike in hand, back off after losing raids. Fair Brutal vs Hard is 28-36 of 64 (noise; the bonus version won 91-37 / 128); Hard beats Normal 54-10.
- Dropped (measured, not better): army-mix "counters" (Lanchester per-gold pick 25-38, fewer archers worse, more archers / adaptive no gain). No damage types, so only anti-air matters. In-sim duels: 10 warriors beat 9 archers keeping 7 (archers poor value except vs air). Fair Brutal levers without the bonus: flat (28-36 of 64).
- Bench method: scratchpad bench.mjs-style A/B, frozen copy of the old src/ai as src/ai_base (git-excluded), EVERY MAP PLAYED TWICE WITH SIDES SWAPPED (a one-sided bench showed identical code losing 18-30). 64 games is noisy (+-4 wins SD); use 192+ to call a small effect. Snapshot src per bench run so edits mid-run don't leak in. `pkill -f bench.mjs` kills your own shell (pattern in the command line); use pgrep + kill PID.
