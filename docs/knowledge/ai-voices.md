# ai-voices

> AI players' in-character chat lines (PR #64, engagement batch 2026-10-28): moments, rate limits, wire flag, aiChat setting, code map

Engagement improvement 5 from (an off-repo folder, not kept) (`engagement-research-2026-10-28` (process note, not kept)): AI players talk in chat like AoE II's. PR #64, squash-merged 2026-10-28 as 2479869 under the owner's full-autonomy go-ahead (`test` green; bots not waited on).

- Lines: src/ai/voice-lines.js, `VOICE_LINES[pantheon][trigger]`, ten triggers (greet, contact, struck, peaceEnd, god, titan, godLost, beaten, defeat, victory), `{unit}` / `{enemy}` blanks. A test keeps every pantheon covered, lines under 90 chars.
- Engine: src/ai/voice.js `AIVoices.step(events)` returns `{from, text}`; host-only, reads World only. `VOICE` knobs: playerGap 45, globalGap 15, repeatGap 150, urgent (titan, beaten) 2 s, final (defeat, victory) always, maxLines 24. A line it can't say is dropped. Gods are announced on first arrival only (revivals quiet).
- Wire: HostSession option `createVoices` (game.js loads it from ai.js with createAI); `speak()` in takeSnapshot broadcasts chat with `voice: true`; the client keeps it. Only setup AI slots speak. No MSG change, so no wire-fingerprint change.
- Setting `aiChat` (default true), "AI chatter" in menu.js Settings → Gameplay and hud-overlays in-game menu; `showChatLine` in game.js filters.
- Measured: a normal 1v1 (seed 1 greek-norse, about 18 min) says about 16 lines; voices cost under 0.02 ms a snapshot.
- Not done: no real-browser check of the cards (they use the existing chat card path), AI names stay "AI (Normal)" rather than a persona.
- Follow-up PR #71, squash-merged 2026-10-28 as b52886f (the owner, 2026-10-28: "put it in the middle top of the screen and make it slightly large ... add an appropriate sound ... more aggressive"): voice lines skip the feed and go to `Hud.showTaunt` (`.hud-taunt`, top 6.4em under the banners, text 1.6em, pantheon emblem, slam-in, `tauntDwell` 6 to 9.5 s), with sfx `taunt` (sfx-alerts.js, level 0.85, about the war horn's loudness). Screenshot (an off-repo folder, not kept)
- Trap: in a software-GL Playwright check, each evaluate can take seconds, so a timed card has gone by the next check; clear `hud.tauntTimer` in the same evaluate before screenshotting. Playwright here is global: load it with createRequire(import.meta.url)('playwright').
