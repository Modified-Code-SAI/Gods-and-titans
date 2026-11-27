# host-migration

> online games survive the host leaving (heir backups, takeover, followHeir) and online pause (PR #93, wave 7 item 24): code map, numbers, check tool, traps

PR #93, squash-merged 2026-10-29 as 51e77a9 ( `engagement-research-2026-10-28` (process note, not kept) wave 7 item 24), builds on [rejoin-online](rejoin-online.md). DESIGN 7 "Host migration" and "Pause".

- Code: src/net/handoff.js (encodeState/decodeState gzip+base64, sanitizePlan/sanitizeHandoff, takeOver, followHeir); HostSession.enableHandoff/pickHeir/updatePlan/backup/handOff/seatAbsent/waitFor/setPause; ClientSession plan/backup/handoffInfo, END `carry: true` only from handOff; LobbyHost.forGame, hostToken, gameTokens; Game.prepareHandoff/migrate/adopt/listenTo/togglePause; ViewState.resetMotion; hud pause bar (hud.setPause, pauseText in hud-data).
- Numbers: backup every 10 s (first after 2 s), ~90 KB gz for 4 players at 25 min, pack ~20 ms; new host waits 30 s paused; followers retry 45 s; 3 pauses per player, auto-end 2 min.
- The Game swaps the session in place (renderer, HUD, trackers stay); the heir has no replay recorder or saver.
- Check: tools/handoff-check.mjs (serve on 8321, NODE_PATH=/opt/node-tools/node_modules), all checks pass in about 2 min.
- Seat proofs: `HostSession.proofs` (random per seat, in that seat's PLAN and the heir's HANDOFF); START on rejoin carries it, `LobbyClient.rejoin({proof})` refuses a START without it (REASONS.NOT_HOST). Stops a player squatting on the planned room code from posing as host (Cursor security finding).
- Rejoin tickets carry the seat's proof (`ticket.proof`) so title Rejoin checks it too; a new host still waiting for players is not `isSolo`. Token is still sent before the host proves itself (accepted trade-off, PR thread).
- Not fixed by choice: a tree felled in the <=10 s rollback stays felled in the view (Codex P2, DESIGN 7).
- **Traps:** two tabs share localStorage, so the new host's ticket overwrites the old host's (the tool puts it back before the old host reloads). The pause bar's countdown made Playwright call the button "not stable" (tabular-nums plus click force). A test that fakes the host vanishing must set host.stopped first, or handleDisconnect re-plans the heir.
