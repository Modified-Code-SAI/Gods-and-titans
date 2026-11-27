# message-feed-cards

> Bottom-left message feed as stone cards (PR #59, merged 2026-10-27 as 66219d9): look, numbers, code map

The owner: "For the updates (food gathered, idle worshiper) that shows up in the left bottom corner, make it more visible like you did with the Tips that show in the top right." PR #59 (squash-merged 2026-10-27 as 66219d9, Tests and Deploy green on main) makes every `.hud-msg` a card in the tips' carved stone ([alerts-and-tips](alerts-and-tips.md)). Client only, nothing on the wire. Traps and checks: [message-feed-traps](message-feed-traps.md).

Look and numbers:
- Emblem chip drawn by CSS from `data-icon`: the emoji of what the line is about (unit, building, god, resource), else the kind's (`MESSAGE_ICONS`: info 📜, good ✨, alert ⚠️, system 📢, chat 💬); `messageIcon(kind, icon)` takes a string of at most 8 characters.
- Edge colour by kind (`--msg-accent`): info blue, good gold, alert orange (bold, pulses 3 times), system grey italic, chat in the sender's colour. Text 1.18em; `[[Key]]` becomes a key cap.
- Dwell `messageDwell`: 8.5 s + 45 ms a letter, clamped 10 to 16 s, +2.5 s for alerts; chat and system 14 s; fade 0.6 s. A repeat of a line still up shows a ×N badge and slides in again; at most 6 cards (oldest out). `role="log"`, `pointer-events: none`, same place above the idle row.

Code map: `Hud.message(text, kind, opts)`, `feedCard`, `pushLine`, `arm`, `chat` in src/ui/hud.js; `messageIcon`, `messageDwell`, `RESOURCE_ICONS` in src/ui/hud-data.js; the "messages" block of src/ui/hud.css; alert `icon` and `[[Space]]` / `[[.]]` texts in src/game/alerts.js; emblems for the game's own lines in game.js `onEvent` and three input.js messages. Tests: tests/ui/hud-feed.test.js (18, the last reads hud.css), alerts.test.js, game-alerts.test.js.

Merge: not under the 2026-10-27 batch go-ahead (`auto-merge-batch-2026-10-27` (process note, not kept)); a card (`pr-merge-workflow` (process note, not kept)) was tapped 10 minutes after un-drafting. Codex found one real P2 (reduced motion, see [message-feed-traps](message-feed-traps.md)), fixed first in 3a7ab47. Ideas not done: fewer cards on short windows (six take a third of the height), a quieter look for routine milestones.
