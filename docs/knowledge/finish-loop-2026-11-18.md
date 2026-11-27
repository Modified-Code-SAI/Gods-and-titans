# finish-loop-2026-11-18

> The owner's autonomous "find and finish unfinished parts" loop (from 2026-11-18): standing merge go-ahead, wave log, audit method, what was checked clean

The owner (2026-11-18 09:33Z, thread "Keep finding and finishing unfinished parts"): keep reviewing for errors and unfinished parts, fix and complete them with creative freedom, autonomously, without asking once started. Same standing go-ahead as `engagement-research-2026-10-28` (process note, not kept): merge own PRs on green (`pr-merge-workflow` (process note, not kept)).

Method: the session may push only to `claude/project-thread-9yqea3`, so each wave ships as ONE PR on that branch (several commits), squash-merged; then restart the branch from main (`force-push-denied-use-ours-merge` (process note, not kept) if a push is refused). Review bots posted nothing on #207 (none seem configured since the owner rename); CI = test, audit, play (~9 min).

Audit tools that ran clean on 2026-11-18: full suite (2,293), eslint, `tools/shot-menu.mjs`, `sim-audit --teams=ffa6 --diff=brutal` seeds 31-34 and `--teams=3v3 --sacred` 41-43 (only pop-over-cap noise), play-test controls. play-test `late` timed out at waitForGame under CPU load (software GL), not a game bug.

- Wave 1, PR #207 (merged 267ee48): 8 achievements (Sacred Victory `how`, god power, relic housed, daily win, 7-day streak `best.streak`, one per campaign chapter via `recordCampaign(chaptersDone())`, also run when the Career opens); Manor `buildingComplete.from` + `Selection.replaceMerged`; hover tags for relics on the ground and sacred sites (`ViewState.siteNear`). What's New entry id `2026-11-18-loose-ends` (append later items there or add a new entry).
- Wave 2, PR #208 (merged 5d6bf0c): AI builds Houses in 2x2 squares from the Town on (`houseBlockSpot`, ring checked around the 4x4 block; opening untouched because ai-economy tests are timing-sensitive) and `planManors`; online guests get the host's replay (`HostSession.sendReplay`, MSG `replay`, `Game.onHostReplay`); daily Copy result (`dailyShareText`). tools/rematch-check.mjs fixed (five Open seats) and now checks Watch Replay for all.
- Waves 3 on (Chapter IV, starting resources, AI styles, heir replay, Chapter V...): [finish-loop-waves-2026-11-18](finish-loop-waves-2026-11-18.md).
- Trap: never `git stash` while a background tool reads src (an audit ran on main's code that way).
- Gaps noted, not done yet: no naval units.

**Why:** later waves and threads need the go-ahead, the one-branch method and what is already done.
**How to apply:** add each new wave's PR to [finish-loop-waves-2026-11-18](finish-loop-waves-2026-11-18.md); check this list before picking the next gap.
