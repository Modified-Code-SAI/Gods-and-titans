# campaign-chapter-two

> Campaign Chapter II "The Wolf Age" (PR #90, merged 2026-10-29, wave 7 item 26): Norse vs Loki, CHAPTERS data shape, objective `limit`, chapter tabs, balance numbers

Squash-merged 2026-10-29 (2299e6f) under the owner's standing merge go-ahead (`engagement-research-2026-10-28` (process note, not kept)). Follows [campaign-chapter-one](campaign-chapter-one.md).

- Data: `src/data/campaign.js` now has `CHAPTERS` (id, chapter, title, pantheon, people, blurb, missions). Each mission carries `chapter` and `n` (its number within the chapter). `MISSIONS` lists every mission flat, in unlock order, so Chapter II's first mission (hordaland) opens when twilight is won. `chapterOf(m|id)`, `CHAPTER_BY_ID`. The old `CAMPAIGN` export is gone.
- Chapter II missions: hordaland (Temple, god, raid on the tagged storehouse 'stores'), lyngvi (destroy 3 'serpent' shrines, limit 1200 s), bifrost (survive 540 s and protect the temple 'bridge'), naglfar (army 12 reveals destroy 'yard'; bonus hold 2 sites for 60 s), vigrid (conquer a Normal and an Easy Norse AI with the Greek ally "The Archon of Thera"; Loki spawns at 780 s).
- New objective field `limit` (seconds; not on protect objectives): fails the mission when still open (sim/campaign.js updateCampaign). The HUD shows "words · clock left".
- Progress: `wonCount(p, chapterId)`, `chapterUnlocked(id)`; `chapterDone` is counted per chapter. Game over: "Begin Chapter II" button and "Chapter II is open" text. menu.js names the chapter of nextToPlay().
- Balance (AI hero, after #88): Normal wins all 5. Easy wins 1-3 (lyngvi at 18:50 of 20:00). Idle loses all. Before the second enemy was added, an idle hero won vigrid because the Greek ally alone conquered.
- Bench script pattern: /tmp scratch run.mjs looping ai.tick + w.tick and logging campaign.state changes; run all 15 (5 missions x normal/easy/idle) in parallel, about 10 minutes.
- Narration: render only the missing clips (filter lines.json by existsSync) and delete orphans after edits. Not yet listened to by a human.
