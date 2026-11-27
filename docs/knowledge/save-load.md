# save-load

> save and load for solo games (PR #78, engagement item 16): graph packer, files, what is saved, determinism test, traps

PR #78 (merged 2026-10-28, `engagement-research-2026-10-28` (process note, not kept) item 16). DESIGN 9.4.

- F10: Save Game (slots 1-3), Save & Quit (autosave slot, career not counted). Autosave every 180 game s (`AUTOSAVE_EVERY`, game-saves.js); the match's own autosave is deleted at game over. Title: Continue (newest save) + Load Game screen.
- Files: src/sim/save-graph.js (generic packer: identity, cycles, Map/Set/typed arrays, statics by name, throws on functions with a path), src/game/save-game.js (`CLASSES` list: World, MapState, PathService, Pathfinder (scratch skipped), SpatialHash, RNG, AIPlayer; statics = data modules + regenerated mapData), save-store.js (IndexedDB gzipped + localStorage index `mythicwar-saves`), game-saves.js (MatchSaver; extras: fog explored, lastSeen, mineMemory, camera, groups, chronicle, career m). main.js `loadGame(slot)` builds a launch with `resume: save`; Game.init unpacks and passes `resumed: true` to HostSession.
- **Adding sim/AI state**: a new class stored in the world or an AIPlayer must be added to `CLASSES`; a closure in state breaks saving (the round-trip test fails with the path). A new data module whose objects entities point at should join the statics list in save-game.js.
- Determinism check: tests/game/save-game.test.js compares JSON of packMatch graphs of the original and loaded world after 90 s more of play (zero `ai.stats.thinkMs` first, it is wall-clock).
- Not handled: migrating saves across builds (an old save loads only while its fields still fit the code).
