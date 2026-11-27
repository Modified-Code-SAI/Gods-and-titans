# trial-of-the-titans

> Trial of the Titans survival mode (PR #66, 2026-10-28): wave rules, code map, balance numbers, career link

Built from the engagement plan, item 4 (`engagement-research-2026-10-28` (process note, not kept)); spec in DESIGN 5.14 (renumbered as Sacred Sites, match statistics and the guided first match landed first). PR #66 squash-merged 2026-10-28 as 398ee8c on the owner's standing go-ahead.

- Setup flag `survival: true` (lobby `state.survival`, `setSurvival`; only one mode at a time with the peace). All players are forced onto team 1 in buildSetup and in World, so one player alone may start.
- `src/sim/survival.js`: waves at 120 s and then every 90 s, a boss Titan every 5th wave, budget `(4+3n)*(0.6+0.4*players)` pop, `u.boost` {hp,dmg} applied in `applyUnitStats`, at most 120 alive, neutral units with no camp sent by attack-move at the nearest player building, `waveCleared` gold. The game ends with `gameOver {winningTeam:null, wave}`.
- Follow-up PR #83 (merged 2026-10-28, the owner's first play: teammate across the map, no waves came at him): one-team setups use the mapgen team layout (bases share an edge; `mapOptions` forces one team when `survival`), each wave is dealt evenly to every living player from the edge nearest them (`u.waveTarget`, `waveFront` event), budget now `(4+3n+0.08n²)*factor`. Re-measured: Easy solo wave 17, Normal solo 20, 2 Normal 23, 4 Hard 24.
- Wire: snapshot `sv {w,m}`, events `wave` and `waveCleared` (they change the wire fingerprint). AI: `scan` adds the monsters to `enemyUnits`.
- Best wave lives in the career (#63): `CareerTracker.finish('survival', {wave})`, `getCareer().best.wave`. Result 'survival' is neither a win nor a loss. Achievements hold_the_line (wave 10) and titans_bane (wave 20); 39 achievements in all.
- Sacred Victory never runs in a trial (`sacredVictoryOn` checks `setup.survival`, lobby drops it, host toggle hidden); sacred sites still give faith. The end screen shows the chronicle like any game.

**Why:** later threads tuning waves or touching the lobby or game-over screen need the rules and where they live.
**How to apply:** tune with the knobs in config.js (SURVIVAL_*) and survival.js; re-measure with an AI-only loop like the one in tests/ai/ai-survival.test.js.
