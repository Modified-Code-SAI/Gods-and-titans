# online-rematch

> online Rematch in the same room and Open seats for friends (PR #100, merged 2026-10-29): code map, rules, check tool, traps

PR #100, squash-merged 2026-10-29 as fbe67c1 (wave 10 item 35 of `engagement-research-2026-10-29` (process note, not kept)). Builds on [rejoin-online](rejoin-online.md) and [host-migration](host-migration.md). DESIGN 7 "Rematch" and the presets paragraph.

- Lobby: online rooms start with every seat Open, teams 1,2,1,2 row by row, small map, preset null (Play vs AI unchanged: 1v1 vs AI). Online presets fill other players' seats with Open, not AI (coop keeps AI). `openSlotFor` puts a newcomer on the emptier side; a full room adds a host lobby-chat line (`fullNotice`, 5 s).
- Rematch: `LobbyHost.reopen({ setup, myIndex, name })` makes a started room a lobby again; human seats Open and held in `seats` by rejoin token (token -> slot, pantheon, team, colour), given back once via `LobbyClient.join({ rematch, laterTries })`. Before reopen a rematch HELLO gets `REASONS.REMATCH_LATER`. A `forGame` room (new host) builds seats from the setup, the new host in slot 0.
- Wire: `MSG.REMATCH`: client asks (once, after game over, chat "X wants a rematch."), host `inviteRematch(room)` right before stop. Game: `onlineRematch()`, `rematchOnline`, `onNetRematch`, `rematchLabel`; main.js `onRematchOnline` -> menu lobby with `keepLobby` (host) or the new `rematch` menu screen (client). HUD `refreshGameOver(bringBack)`.
- Check: `tools/rematch-check.mjs` (serve on 8321, NODE_PATH=/opt/node-tools/node_modules), about 5 min, all 15 checks pass.
- **Traps:** Playwright's click on Start Battle hung waiting for the busy page (click by evaluate). Row textContent sliced to 70 chars hides the pantheon; read `.mw-pbtn-name`. Many lobby tests assumed the old online 1v1 default; they now call applyPreset('1v1') or set an AI seat.
