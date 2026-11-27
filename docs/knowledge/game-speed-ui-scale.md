# game-speed-ui-scale

> game speed (solo only, 0.5x-2x) and interface size settings (PR #75): how speed is applied without touching the sim, code map, check numbers

PR #75 (merged 2026-10-28, engagement loop item 15, see `engagement-research-2026-10-28` (process note, not kept)).

- Settings `gameSpeed` (slow/normal/fast/faster = 0.5/1/1.5/2, `GAME_SPEEDS` in config.js) and `uiScale` (small/normal/large/larger = 0.85/1/1.15/1.3, `UI_SCALES`). Labels in src/ui/speed-options.js; rows in Settings screen (menu.js segField) and F10 menu (hud-overlays openMenu; speed row only when `game.solo`).
- `Game.solo` = isSolo(session) fixed right after session.start(); `Game.applySpeed()` calls `ticker.setSpeed`, `viewState.setRate`, `renderer.setSpeed`. Online always 1.
- Sim untouched: ticks stay DT long, the Ticker just runs more per real second (interval 1000/(rate*speed), re-anchors if running).
- ViewState clock uses `now * rate`; above 1x the interp delay is multiplied by rate (same real-time delay) — without that, 2x showed render catching the newest snapshot (zero lag frames).
- Renderer: world dt scaled, camera dt not.
- UI scale: `--hud-scale` CSS var on #hud-root multiplies the HUD base font-size; all HUD is em-sized.
- Measured live: sim 0.50x / 1.00x / 2.01x. Stills in (an off-repo folder, not kept)
