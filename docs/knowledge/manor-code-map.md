# manor-code-map

> Where the Manor (four Houses combined) code lives across data, sim, wire, HUD and render, how it rides the production queues and cancelTrain, and the merge hotspots with the other batch threads

For the rules and numbers see [manor-houses](manor-houses.md); the model is in [manor-model](manor-model.md); same pattern as the wall upgrade ([wall-code-map](wall-code-map.md)).

- `src/data/houses.js`: MANOR, `mergeRule()` (reads `mergesFrom` in data/buildings.js), `researchHostOf`, `houseBlocks`, `planMerges`, `MERGE_TEXT` (the refusals, word for word: the sim errors and the card reasons are the same strings).
- `src/sim/homes.js`: `issueHouseUpgrade`, `cancelMerge`, `advanceMerge`, `isMerging`. Hooks: `production.js` (`updateProduction` hands a group item to `advanceMerge`; `cancelTrain` calls `cancelMerge` for a group item inside the cancelled range and skips the normal refund; `issueResearch` refuses a merging House and accepts `researchHostOf`), `world.js` (`releaseBuilding` cancels the merge when a House of the square goes), `commands.js` + `net/sanitize.js` (`upgradeHouses { houses }`).
- `src/data/upgrades.js`: `COMBINED` (a building with `mergesFrom` takes the House effects, x4 for pop and hp), `upgradesFor` follows `researchHostOf`.
- HUD: `ui/command-card.js` `mergeButtons` (slots 0 and 1 of the House card), `ui/hud-data.js` `isMergingEntity` (a House whose `q` holds `u: 'manor'`), `ui/input.js` (`upgradeHouses`, `cancelMerge`, Esc and research-pick skip merging Houses), `ui/hud-info.js` notes, `ui/menu-howto.js`. The queue row of #49 shows "Upgrading to Manor" with no change.
- Tests: `tests/sim/homes.test.js`, `tests/net/homes-wire.test.js`, `tests/ui/hud-homes.test.js`, plus lines in `tests/data/data.test.js` (a `mergesFrom` building has no upgrades of its own), `tests/net/hardening.test.js` (`good` map) and `tests/render/building-models.test.js`.

**Merge hotspots (resolved by hand for #50):** the COMMAND_TYPES line in `src/sim/commands.js`, the `cancelTrain` body in `src/sim/production.js` (queue-50 added `count`), the imports at the top of `src/ui/menu-howto.js`, the `good` map in `tests/net/hardening.test.js` (put new lines away from the end), DESIGN.md 9 (info panel paragraph).
