# campaign-chapter-one

> Campaign Chapter I "The Long Winter" (PR #80, merged 2026-10-28, plan item 18): five Greek missions, sim objective engine, narration clips, code map, balance, traps

Built and squash-merged (825193983) 2026-10-28 from `engagement-research-2026-10-28` (process note, not kept) item 18 under the owner's standing merge go-ahead. DESIGN 5.16 (sim) and 9.6 (UI).

- Data: `src/data/campaign.js` MISSIONS (shore, longhouses, pass, groves, twilight): seed, mapSize, players (hero index 0), start[i] {purse, townHp, buildings with tag/ring, units}, objectives (build/gods/army/kill/destroy/protect/survive/hold/conquer, optional, hidden), events ({at}|{after}, say, reveal, spawn {owner, tag, units, at, march, target}).
- Sim: `src/sim/campaign.js` (setup `campaign: id`, campaignStart, updateCampaign once/sec judging, campaignVictory overrides World.checkVictory; conquest always wins). Snapshot `cp`, events `campaignSay`, `objective`.
- Client: ViewState.mission()/campaign(); Game.mission, CampaignVoice (src/game/campaign-voice.js), recordMission (src/game/campaign-progress.js, localStorage `mythicwar-campaign`); HUD `src/ui/hud-campaign.js` (panel + missionPointer reusing GuidePointer); chapter screen `src/ui/menu-campaign.js`; main.js onNextMission → backToMenu('campaign', {mission}).
- Narration: 26 Kokoro bm_george clips in assets/narration/campaign, file name carries a hash of the words: edit a line → `node tools/narration/campaign-lines.mjs > lines.json` then `render.py --lines lines.json --speed 0.95 --out assets/narration/campaign` (kokoro-onnx via pip and the GitHub release model files download fine from the sandbox). Not yet listened to by a human.
- Balance (computer as hero): Normal wins all five; Easy wins 1-4, loses 5 to Surtr; idle hero loses The Narrow Pass at 3:49. Smoke script pattern: setup.players[0].kind='ai'.
- Traps: AI names cap at 20 chars (sanitizeName cuts; test checks). Playwright `text=Next Mission` matched "The next mission is open" text (case-insensitive substring); use a locator with hasText on `.hud-gameover button`. Setting world.time in the page also needs tickCount.
- With saved games and replays (merged the same day): a mission is never saved (MatchSaver gated on `!this.mission`); it is recorded as a replay, and sanitizeReplay keeps `setup.campaign` (validateSetup drops unknown fields, like `twist`). Review: Codex found 3 (protect lost with the last enemy, late briefing, AI redirecting scripted raids), all fixed.
