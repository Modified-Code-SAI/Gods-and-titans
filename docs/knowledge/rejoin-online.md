# rejoin-online

> rejoining online games (PR #86, wave 6 item 19): token flow, stand-in AI difficulty, grace, UI, code map, the shared-software-GPU trap in two-tab checks

PR #86, squash-merged 2026-10-29 as 7634b17 ( `engagement-research-2026-10-28` (process note, not kept) wave 6 item 19). DESIGN 7 "Rejoining".

- Flow: `LobbyHost.start` sends each client a 32-hex `rejoin` token in START; the menu saves it with `saveTicket` (src/net/rejoin-ticket.js, localStorage `mythicwar-rejoin`, 6 h). The host endpoint now stays open all game (closed by `lobby.close()` at menu return). After the start, `handleConnection` goes to `handleRejoin`: HELLO with a known token → `rejoinHandler(index, conn)`, which Game sets to `session.rejoin` (src/game/game.js init). `HostSession.rejoin` removes the stand-in AI (`standIns` set), replaces a link still open (kick `REPLACED`), sends START again, attaches, sends FULL.
- Client: `LobbyClient.rejoin({ transport, roomCode, token, name })` must drop its listeners synchronously on START, or the FULL right behind it is eaten (FramedConn backlogs only when no listener is attached).
- Stand-in difficulty = hardest AI in the setup, Normal among people only (`standInDifficulty`).
- `REJOIN_GRACE_MS` 120 s link timeout until 3 pings, because the rejoining client builds the renderer synchronously.
- UI: title "Rejoin Online Game" (`mw-rejoin-btn`) → menu screen `rejoin`; Game Ended after `host-left` shows "Rejoin Game" (`game.onRejoin` from main.js). The ticket is dropped at game over and on every end reason except host-left and REPLACED.
- Check: `tools/rejoin-check.mjs` (serve on 8321, NODE_PATH=/opt/node-tools/node_modules). **Trap:** two tabs share one swiftshader GPU, so with the host drawing, the client's load takes 2 to 3 minutes of long tasks and its link times out. The tool slows the host's requestAnimationFrame to one frame every 2 s while the client loads.
- Later fixes from bot review: retryable refusals (REJOIN_LATER, BUSY) keep the ticket; a quit game is settled once via `settleMatch('rejoin:<token>')`; the career tally rides on the ticket (`saveTally`, every 3 s) and a REPLACED window does not overwrite it.
- Not done: fog/explored memory is not restored after a rejoin (client starts with fresh fog); chat history (host leaving is now handled: [host-migration](host-migration.md)) for a rejoined player.
