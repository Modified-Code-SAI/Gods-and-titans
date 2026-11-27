# roster-and-group-bar

> in-match player list (hud-roster.js) and control-group chip bar (hud-groups.js), PR #115 (merged 2026-10-30): placement, rules, traps

Wave 15 audit findings 6 and 9, PR #115 (part of `engagement-research-2026-10-29` (process note, not kept)).

- Player list: `src/ui/hud-roster.js` RosterView, top-left at left 4.9em beside the god column, `rosterOpen` setting (default true). A 1v1 or an FFA (every team of one player) is one flat list; teams get "Your team" / "Team N" headers. Hidden when there are fewer than 2 players and in the tutorial. The score is `scoreOf` from data/score.js. Palette change calls `roster.invalidate()`.
- Group bar: `src/ui/hud-groups.js` GroupBar is appended to `.hud-bottom`. The CSS needs `.hud-bottom > .hud-groups` because `.hud-bottom > div { position: relative }` otherwise wins and the bar lands inside the selection panel. hud.js `groupBarLeft()` puts it past the `.hud-workers` row (same height as the task counts) or at the info panel's left, whichever is further right.
- Clicking a chip calls `input.recallGroup(n)`; the digit key path uses it too (double tap within DOUBLE_MS = jump).
- "Fighting" means a member has `st` attack or cast, or its hp fell since the last look (FIGHT_MS 3 s). A unit hurt before the bar's first look does not count.
- Browser check recipe: Play vs AI, then set lobby selects `Slot 3` / `Slot 4` to an Easy AI and `Team for slot N`. The repo's playwright 1.56 needs `executablePath: '/opt/pw-browsers/chromium'`, and ESM scripts must sit inside the repo to resolve playwright.
