# after-game-chronicle

> After-game chronicle (PR #62, merged 2026-10-28): match stats, score, awards, timeline chart; code map and traps

PR #62 (squash f72295e) turned the game-over screen into four tabs: Summary (score, awards), Economy, Military, Timeline (SVG lines of score / army / resources / kills).

- Stats: `newStats`, `costValue`, `scoreOf` in src/data/score.js (DESIGN 5.12). Sim counts gold/wood apart, faith earned (prayer, blessings, spoils, spells, sacred sites in src/sim/sacred.js), razed, killValue, lostValue; snapshot adds `army` and floors faith. Any new faith source should add to `p.stats.faith` too.
- A finished building's worth counts as lost whatever destroyed it (surrender, creatures); razed / killValue need an enemy player (bot finding on #62).
- Timeline sampling is client-only: src/game/chronicle.js listens to ViewState 'snapshot', samples every 30 s game time plus the end. Awards in the same file. UI src/ui/hud-chronicle.js; axis steps are whole numbers (bot finding).
- Career (#63) unlock cards and career line sit under the chronicle in showGameOver; Sacred Victory passes `how`.
- tests/ui/fake-dom.js gained createElementNS and replaceChildren. Stills: tools/shot-chronicle.mjs (needs CHROMIUM_PATH=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome when npm's playwright differs; the screen fades in slowly under software GL, wait ~4 s).
- Lesson: main moved twice while #62 waited (three wave-1 PRs landed); a `dirty` PR starts no Tests run, so fetch and merge main before waiting on CI. Related: `engagement-research-2026-10-28` (process note, not kept), `auto-merge-batch-2026-10-27` (process note, not kept).
- Play Again / Quick Match (PR #70, squash 77b3524): src/game/rematch.js keeps the last solo lobby (localStorage mythicwar-last-skirmish, checked by sanitizeLobbyState; a survival lobby may be one team); main.js passes Game `onRematch`; title Quick Match button under Play vs AI. The tutorial launch has no lobby, so it is never saved.
