# decade-of-peace

> Decade of Peace game mode (PR #17): no player-vs-player harm for 30/45/60 game minutes; the canHarm rule, economy measurement, open question, and how to test the end of the peace live

The owner asked (2026-10-21) for a game mode "Decade of Peace" with no combat for a chosen 30, 45 or 60 minutes, so players can build and mass armies for big battles. PR #17 (branch claude/project-thread-vwmcas) was opened as a draft and, after the owner's "Merge it." (sent twice within 80 s), squash-merged to main on 2026-10-21 as a91630c with `test` green while the Cursor and Codex reviews were still running (see `pr-merge-workflow` (process note, not kept)). The owner had not hand-tested it yet. Spec: DESIGN.md 5.10.

Readings of the ask that the owner has not commented on yet: host-only lobby setting; game time, not wall time (pausing a solo game does not use it up); spells blocked as well as weapons; neutral creeps stay fair game; AIs keep building and massing, launch no waves, then attack the moment the peace ends.

- Code rule: anything that means "may I hurt this" uses `world.canHarm(a, b)`, not `areEnemies` (which also drives collision, placement, kill credit, AI intel and the UI). A new ability, aura or damage path needs a row in tests/sim/peace.test.js. `dealDamage` has a backstop that returns 0 for player-on-player hits while `world.peace`.
- No snapshot field: the HUD countdown is `setup.peaceMinutes*60 - snapshot time` (`ViewState.peaceLeft`). The `peaceEnd` event is a zero-key shape in src/net/delta.js `EVENT_SHAPES`, so it changes the wire fingerprint (stale tabs are refused).
- Economy (Normal vs Normal, seed 1, small map, 30 min): pop cap 200 reached about minute 13, mines run dry about minute 26-28, each side still holds about 23 500 gold when the peace ends. Mines were NOT scaled for the mode; the PR flags it as an open question (bigger mines would have to feed `mapgen.mapOptions`).
- Live-testing tips: `window.__game.session.world` is the host World. To see the end of the peace, jump `w.tickCount = Math.round((w.peaceEnd - 3) / 0.05)`; setting `w.peaceEnd` alone leaves the HUD chip up because it is time based. Neutral camps sit mid-map and attack test units spawned there (not a peace bug), so spawn next to a player's Town Center (`w.buildingList`). Two-tab online flow: `?transport=local` on the host, `?transport=local&join=CODE` on the client; click `.mw-btn--start` with `noWaitAfter: true` (the click can hang past 30 s under swiftshader).

- No-build ground (2026-10-27, PR #51): nobody builds within 20 tiles of an enemy Town Center until the peace ends; sim rule in `placementError`, red ghost and tinted zone on the client. See [peace-no-build-zone](peace-no-build-zone.md) and [peace-zone-checks](peace-zone-checks.md).

**Why:** a later thread touching combat, abilities, the lobby or AI waves must keep the peace rule intact and knows what is still open.
**How to apply:** if the owner asks to tune it (mine size, lengths, AI behaviour), start from DESIGN.md 5.10; stack and decisions in [mythic-war-game](mythic-war-game.md), pop numbers the AI reaches in [pop-cap-200](pop-cap-200.md).
