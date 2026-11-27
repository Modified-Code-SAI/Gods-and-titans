# relics

> Relics from creep camps (PR #69, merged 2026-10-28, DESIGN 5.15): rules, code map, AI, balance observation, still tool

Wave-2 item 8 of the engagement plan, under the owner's standing auto-merge go-ahead (`engagement-research-2026-10-28` (process note, not kept)).

- Level 2+ creep camps guard one relic each (10 types in src/data/relics.js, own RNG `${seed}:relics`). Last creature dies -> drop; smart `relic: index` sends nearest Worshipper/god; auto `deliver` order to nearest finished Temple; bonus via `computeMods(up, pantheon, p.relics)` + `World.refreshMods(i)`. Carrier death / Temple fall drops it.
- Code: src/sim/relics.js (state machine, snapshot `relics`, player `rl`), orders.js cases relic/deliver, commands.js smartRelic, src/ai/relics.js (worker job 'relic' in scan.js), src/render/relics.js (RelicLayer), view-state relic helpers, hud-data relicChip, alerts relicEvent.
- Balance seen: in Normal AI-vs-AI, one early Kusanagi turned a 15 min game into 9.5 min; AI fights are knife-edge. tests/ai/voice.test.js clears `world.relics` to keep its Titan lines.
- Covered relics: every 10 ticks a ground relic on an impassable tile rolls to the nearest open tile (Codex finding on #69).
- Main moved 4 times while #69 waited (section number went 5.12 -> 5.15); re-merge main right before merging.
- Stills: `PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome node tools/shot-relics.mjs --out DIR` (local node_modules playwright 1.56 cannot find the preinstalled browser without it; run `npm install` first for http-server).
