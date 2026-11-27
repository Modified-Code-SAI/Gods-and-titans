# six-player-slots

> six seats (PR #163, 2026-11-06): ring map layout for 5-6 players, bigger map sizes, 3v3 preset, test and audit tools

The owner asked (2026-11-06) for 2 more player slots, 6 total. PR #163, squash-merged 2026-11-06 as ea065f5 after his "push/merge/proceed."

- config.js: MAX_PLAYERS 6; `CROWDED_MAP_SIZES` {small 120, medium 152} and `mapTiles(size, playerCount)` (5+ players use the crowded table). Lobby shows it via menu-model `mapSizeTiles`.
- mapgen: startPlan for pc>=5 returns mode 'ring' (`ringPlan`, RING_ORDER [4,5,0,1,2,3], positions clockwise from top-left). `planRing` puts the bases on a regular hexagon (side bases 0.165n from the side edges), 180° symmetry, one expansion between each neighbouring pair, and on medium (n>=140) inner naturals. `finishLayout`/`kindRoll` were split out of planLayout with the RNG order kept, so maps for 4 players or fewer are byte-identical. The seed tag is '|ring'.
- Presets: new '3v3'. 1v1/2v2/ffa fill 4 seats and close the rest. Co-op uses 4 seats unless there are 4+ humans.
- Tests: tests/sim/mapgen-six.test.js. Audit: `node tools/sim-audit.mjs --teams=3v3|ffa6`. 12 Normal 3v3 games were split 6/6.
- Known oddity, not fixed: on Islands, level-1 camps sometimes land in the sea corners with a long sand bridge along the edge (the 'anywhere' camp pool).

**How to apply:** new code that assumes 4 slots should read MAX_PLAYERS; map width must come from map.width or mapTiles, never MAP_SIZES alone.
