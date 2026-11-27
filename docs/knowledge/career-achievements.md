# career-achievements

> Career profile and 35 achievements (PR #63, 2026-10-28 engagement batch): client-only localStorage, code map, counting rules, how to add one

Engagement plan item 2 (see `engagement-research-2026-10-28` (process note, not kept)), PR #63, squash-merged 2026-10-28 as 9babf40 (Codex security clean; Cursor bots still running at merge).

- Storage: localStorage `mythicwar-career`, `src/game/career.js` (getCareer, recordMatch, checkLive, markSeen, careerSummary, sanitizeCareer, resetCareer for tests). Nothing over the wire, no sim change.
- Facts: `src/game/career-tracker.js` CareerTracker, built in game.js init; reads ViewState '*' events + 'snapshot'. Spectators (myIndex < 0) have none.
- Achievements: `src/data/achievements.js` `{id, group, name, icon, desc, test(m, c), progress?(c)}`; m.result null mid-match, so result-free ones unlock live (feed line "Achievement unlocked: X" + tier_up chime).
- Counting: once, at game-over (checkEnd → finish(result) → showGameOver({unlocked})), or as a loss on quitToMenu (countLeave) if already defeated or match running ≥ 60 s and not ended by the host.
- UI: title Career button with unseen-count badge, `src/ui/menu-career.js` screen; game-over cards + career line in hud-overlays.js. DESIGN 9.1.
- Best survival wave: recordMatch takes optional `m.wave` → `best.wave` (shown only when > 0). The Trial of the Titans thread should pass the wave reached into the tracker's facts.
- Browser check recipe: Play vs AI → Start Battle → `window.__game.career.m.titanSummoned = true; career.dirty = true` → `__game.surrender()`.
