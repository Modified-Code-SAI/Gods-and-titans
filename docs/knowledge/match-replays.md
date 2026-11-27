# match-replays

> Match replays (PR #79, merged 2026-10-28): command recording, IndexedDB store, ReplaySession viewer, free camera; code map, rules, traps

Engagement plan item 13 (`engagement-research-2026-10-28` (process note, not kept)), PR #79, squash b566715. DESIGN 9.5.

- Record: `World.onCommand(tick, player, cmd)` hook in issueCommand → `ReplayRecorder` (src/game/replay.js), host only, AIs included; checksum (`worldChecksum`) on host snapshots every 10 s. Kept at game over (`keepReplay` in checkEnd) or leaving (countLeave) if ≥ 30 s. Not recorded: tutorial, a game resumed from a save (#78 saved games).
- Store: src/game/replay-store.js, IndexedDB `mythicwar-replays`, gzip via CompressionStream, newest 12; `setReplayBackend(memoryBackend())` in tests. Files `.mwreplay` go through `sanitizeReplay` (validateSetup drops extra setup fields: the daily `twist` is re-added there; any NEW sim-affecting setup field must be added too or replays drift).
- Play: src/game/replay-session.js `ReplaySession` (HostSession surface, isReplay), `PlaybackClock` fed to ViewState `clock`; seek ahead in slices, back = new Game via Game.replayFrom → main.startReplay(record, {startAt, viewer, speed, paused, camera}). Bar src/ui/hud-replay.js; Career list src/ui/menu-replays.js. Game skips alerts, chronicle, career, saver, game-speed setting in replays (`this.replay`).
- Free camera: CameraController.yaw/tilt, rotate, tiltBy, resetAngle (pan rotated by yaw); only replays set them.
- Determinism measured: 4 hard AIs 22 min replayed identically; browser run 20/20 checksums.
- Traps: a merged main brought ViewState.setRate and Ticker.setSpeed (#75) — replays use ticker.setSpeed and keep rate 1; isSolo() is true for a ReplaySession, so guard with `this.replay`. Follow-up idea: host sends the replay to clients at game end.
