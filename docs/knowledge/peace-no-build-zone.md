# peace-no-build-zone

> Decade of Peace no-build ground (PR #51): nobody builds within 20 tiles of an enemy Town Center until the peace ends; where the rule, ghost and zone overlay live, numbers and limits

The owner's nine-idea message (2026-10-27) asked: "Force a no build area near enemy teams in the Decade of Peace game mode until the timer is up to attack". PR #51 (branch claude/project-thread-02tl3q) did it and was squash-merged on 2026-10-27 as cdaa25b under his standing go-ahead (`auto-merge-batch-2026-10-27` (process note, not kept)), with Codex and Cursor still running and no findings read. Spec: DESIGN.md 5.10 "Ground kept clear" (also 5.3, 6.5, 8, 9, 10). Builds on [decade-of-peace](decade-of-peace.md); checks and traps in [peace-zone-checks](peace-zone-checks.md).

**Rule**: while `world.peace` holds, `placementError` refuses a footprint within `PEACE_BUILD_GAP` (config.js, 20) empty tiles (straight rect-to-rect gap: a rounded square 44 tiles across) of an enemy Town Center, finished or a site. Only Town Centers claim ground (not houses, towers, walls, teammates' or your own). Code: `peaceBuildNotice`, `peaceBlocksFootprint(centers, tx, ty, size)`, `PEACE_ANCHOR` in sim/peace.js; `world.peaceBuildBlocks(i, tx, ty, size)`; one line in construction.js `placementError`. Orders, wall-line tiles, the arrival re-check, `findPlacement` and the AI all go through it, so multiplayer and the AI obey with no extra code. Nothing on the wire.

**Client**: game/placement.js `peaceAnchors(vs)` (enemy Town Centers seen or in `lastSeen`) feeds `checkFootprint` (red tiles, `peace: true`, the sim's text). render/no-build-zone.js (`NoBuildZone`, `zoneMask`) draws the tinted zone through `PlacementLayer.setZones` / `GameRenderer.setNoBuildZones`. ui/input.js `showPeaceZone` and `peaceTip` (reuses `wallTip`).

**Numbers**: generated starts are at least 62 tiles apart; four AI-vs-AI peace games of 20 min (2 to 4 players, small and medium) are identical with the rule on or off (0 refusals, nearest AI building to an enemy Town Center 25 tiles), so AI play is untouched.

**Limits kept on purpose**: symmetric (a Town Center planted just outside 20 tiles blocks the strip between; "older Town Center wins" was rejected as over-engineering); the sim's refusal reveals an unseen Town Center within 20 tiles; far chokepoints stay open to walls.

**How to apply**: for another radius or anchors (all buildings, "older wins", a minimap tint) start from `peaceBlocksFootprint` and DESIGN 5.10; the How to Play text reads `PEACE_BUILD_GAP`.
