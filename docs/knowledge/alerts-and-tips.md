# alerts-and-tips

> In-game alerts, tab flash, gameplay tips and six alert sounds (PR #53, merged 2026-10-27): code map, settings, timings, how to add a tip or alert

Part of the owner's 2026-10-27 batch ("notifications, sounds, tips, anything to keep the player engaged and pull them back when not focused"). One PR (#53, squash-merged 2026-10-27 as 7b410d9 after the team marks #52 landed first), client-side only: nothing on the wire, the sim is untouched. DESIGN 9 "Alerts, tips and sounds" has the full rules; a short README paragraph too. Codex's code review found nothing; Cursor Bugbot's three findings were real and fixed (a late notification prompt overwriting a newer pick, a silenced warning clearing a tip, the card staying low after the checklist closed).

Code map:
- `src/game/alerts.js` AlertEngine({ viewState, notify, settings }): ViewState events plus a survey every 0.5 s of game time on `snapshot`. All numbers are constants at the top. `emit({ id, level, kind, text, sound, ping, jump, attention })` applies the `alerts` level (all / important = warnings only / off), the 2 s sound gap with PRIORITY and the `tabAlerts` choice.
- `Game.onAlert` (game.js) carries it out: HUD line, `sfx.play`, minimap ping, `input.noteAlert` (Space), `TabAttention`, and `hud.holdHints()` only when a line, sound, ping or jump was given.
- `src/ui/tab-attention.js`: TabAttention (title flash, silent Notification), `chooseTabAlerts` (asks from a click; refused or missing falls back to 'title'; resolves to null when the player picked again while the prompt was open, and both screens then keep the newer pick).
- `src/ui/hint-data.js`: HINTS (45; `team-marks` fits only with a living teammate and reads its marker names from src/data/marks.js), `[[Key]]` markers become `<kbd>`, `when(ctx)` from `hintContext(vs)`, `pickHint`. `src/ui/hud-hints.js`: HintScheduler (game time: first at 90 s, every 150 s, held 30 s after underAttack), HintsView (re-placed every frame, under the checklist while that is up), `hintStore` (localStorage `mythicwar-hints`, each tip at most twice).
- `src/audio/sfx-alerts.js`: six sounds, see [alert-sounds](alert-sounds.md). `src/ui/alert-options.js`: option lists shared by the Settings screen and the F10 menu. Settings keys: `alerts`, `hints`, `tabAlerts`.
- Tests: tests/game/alerts.test.js, game-alerts.test.js, tests/ui/tab-attention, hud-hints, alert-settings.
- 2026-10-27 22:40Z follow-up (PR #59, [message-feed-cards](message-feed-cards.md)): the HUD lines the alerts produce are now stone cards with an emblem (each alert carries `icon`; texts use `[[Space]]` / `[[.]]` key markers instead of "(Space)"); `Game.onAlert` passes `{ icon }` to `hud.message`.

**How to apply:** when another change alters a control or number a tip quotes (Shift batch of five, queue of 50, minimap clicks, hotkeys, peace rules), edit the tip in hint-data.js; the test "tips that quote a build hotkey or a game number" reads the data, so add a line there for new numbers. Tips that fit only some matches need a `when`; those without one also show on the loading screen. See [alerts-tips-gotchas](alerts-tips-gotchas.md) for the traps.
