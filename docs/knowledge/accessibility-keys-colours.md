# accessibility-keys-colours

> colour-blind team palette, rebindable camera/grid keys, 10 px text floor (PR #97, wave 8 item 30): code map, rules, traps

PR #97 (merged 2026-10-29 as 8969e7f, engagement loop wave 8 item 30, `engagement-research-2026-10-28` (process note, not kept); standing merge go-ahead).

- **Palette:** `src/team-colors.js` (`displayColor`, `relationColor`, `markerColors`, `setTeamPalette`, listeners). Setting `teamColors` 'standard'|'colorblind'; main.js sets it at boot and on change and toggles `cb-teams` on <html>. Display-only per device: never touch setup/lobby colours (wire unchanged). Renderer `colorOf` wraps displayColor; `setTeamPalette()` rebuilds unit views and swaps building models; `rebuiltViews` flag skips the enemy fog fade-in (paused frames run dt 0, so faded-in views stayed invisible: the same trap existed for quality changes while paused). Game.onSettings sets needsRender. Minimap caches colours per palette; hud-info sig includes palette.
- **Keys:** `src/ui/key-bindings.js` (KEY_ACTIONS: cam_up/down/left/right, cam_zoom_in '=', cam_zoom_out '-', cam_jump Space, cam_home Home, card_0..11 QWER/ASDF/ZXCV). Settings `cardKeys` 'classic'|'grid' and `keyBindings` (only changes; `cleanBindings` reverts clashing changed actions). `rebind` swaps. RESERVED includes Esc, Pause, F1-12, digits, Enter, Tab, Delete, Backspace, '.', '`'. Input checks camera bindings before the card, so a camera letter blocks a Classic letter. Grid: `withCardKeys(card, cardKeysOf(settings))` in hud.js; Cancel keeps `esc`. Panel `src/ui/key-panel.js` (window capture keydown while waiting), in Settings and F10 → Change keys… (overlay 'keys'). Tips/How to Play still quote Classic letters.
- **Text:** `--mw-min-text: 10px` floor via max(em, var) on every em size ≤ 0.9 in style.css/hud.css/intro.css; `--mw-ink-mute` #a39983. `tools/shot-access.mjs` audits size+contrast per screen (gradient backgrounds give false lows on message cards). Before: 36 HUD texts < 10 px at 1280x720 (hotkey 6.6 px); after: 0.
- Trap: `node_modules` symlink is not matched by `.gitignore`'s `node_modules/`; put it in .git/info/exclude before `git add -A`.

**How to apply:** a new place that draws a team colour must call displayColor; a new global key must join RESERVED or become a KEY_ACTION.
