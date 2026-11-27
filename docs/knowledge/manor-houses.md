# manor-houses

> Four Houses in a 2x2 square become a Manor (U on a selection): interpretation, numbers, rules and status; built and merged 2026-10-27 as one of nine parallel feature threads

The owner asked (batch of nine ideas, 2026-10-27): "Allow 4 grouped houses to be selected and upgraded to larger homes that increase population greater than what 4 homes would allow." Merged as PR #50 (squash d0fe4f5, Tests and Deploy green) about 3 minutes after marking ready, under `auto-merge-batch-2026-10-27` (process note, not kept); no bot findings by then. Code: [manor-code-map](manor-code-map.md); model: [manor-model](manor-model.md).

**Interpretation (stated in the PR):** grouped = an exact 2x2 block of the owner's finished Houses touching edge to edge (a 4x4-tile square). The Manor stands on the union of the four footprints, so no placement check. Town (Manor `tier` 2) only.

**Numbers:** Manor 48 population (four Houses 32, so +16), hp 2400 (2000), armor 4 (House 2), `cost` 420 gold / 180 wood (= 4 Houses + the merge), merge price 100 gold / 60 wood, 45 s, icon 🏡, U combines, C cancels. A Town Center plus four Manors is 204 against POP_MAX 200; it took 24 Houses ([pop-cap-200](pop-cap-200.md)).

**Rules:**
- No worker; the Houses keep sheltering meanwhile; busy Houses (researching or merging) are excluded; several squares start in row order as far as the purse goes.
- The square holds the price: cancelling on any House (or a House dying) stops all four and refunds once.
- The Manor keeps the average health fraction; House bonuses count again (x4 for pop and hp, x1 for armor) and it researches the House upgrades.
- `build` of a Manor is ignored (BUILD_MENU only); the AI never merges; no `stats.buildings` increment.

**Not done (ideas if the owner asks):** select the new Manor when the merge completes (the four selected Houses just vanish), a placement ghost that snaps Houses into a square, letting the AI merge.

**Why:** the batch go-ahead lets each thread merge its own PR on a green `test`.
**How to apply:** change the rule in `data/houses.js` first; the sim and the command card read it together and cannot drift.
