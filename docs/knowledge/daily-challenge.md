# daily-challenge

> Daily challenge (PR #76, 2026-10-28 engagement loop item 17): seeded per-day game, nine twists, best/streak in localStorage, code map

Engagement plan item 17 (`engagement-research-2026-10-28` (process note, not kept)), PR #76, squash-merged 2026-10-28 as 7f47cf0 on green `test` under the owner's standing go-ahead.

- `src/game/daily.js`: dayKey (local date), dailyChallenge(day) everything from hash of the day key, twists in a seeded 9-day shuffle cycle; dailyLaunch(lobbyMod, day, name) builds setup via the real lobby (not the mock), `launch.daily = day`; record in localStorage `mythicwar-daily` {days:{day:{best,plays,won}}}, 60 days; streak counts up to yesterday while today unplayed.
- `src/data/twists.js`: start twists (golden, blessed, humble, crowded) go into `setup.twist`, applied by World via `startOf` (world.start); lobby twists (worthy, outnumbered, brothers, holy, trial) only shape the slots.
- game.js: countDaily(won) once, in checkEnd and countLeave (career rules); twist feed line at start. main.js: daily launches are not saved for Quick Match; Play Again = retryDaily(same day). Game-over line `dailyLine` in hud-overlays.js. Title button `.mw-daily-btn` + streak badge in menu.js. DESIGN 9.3.
- Fake-`this` tests call checkEnd: guard new Game methods (`this.launch && this.launch.daily ? …`).
- Ideas not done: share a result string, a daily leaderboard (needs a server), a win bonus in the score.
