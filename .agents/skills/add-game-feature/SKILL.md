---
name: add-game-feature
description: Checklist for adding or changing a gameplay feature in Mythic War end to end (data, deterministic sim, network wire, AI, HUD, docs, tests) without breaking online play, saves or replays.
---

# Add a gameplay feature

Read first: the closest note in `docs/knowledge/` (search by name), the DESIGN.md section, and `docs/GOTCHAS.md`.

1. **Data and knobs.** Numbers go in `src/config.js` or `src/data/` (validated by `src/data/schema.js`). Prices and timings that depend on a player go through `p.mods` (`computeMods` in `src/data/upgrades.js`).
2. **Simulation** (`src/sim/`). Deterministic only: `src/sim/rng.js`, no wall clock, no DOM, no three.js. Damage and spells check `world.canHarm(a, b)`. New world state that is a class joins `CLASSES` in `src/game/save-game.js`; no closures in state. A new `GameSetup` field must survive `validateSetup` (net/lobby) and `sanitizeReplay`.
3. **Commands and events.** New command: `COMMAND_TYPES` (`src/sim/commands.js`), `COMMANDS` with clamps (`src/net/sanitize.js`), `good` list (`tests/net/hardening.test.js`). New event: append to `EVENT_SHAPES` (`src/net/delta.js`) and add it to the renderer's `onEvent` switch if it draws. New snapshot keys: `src/sim/snapshot.js`, the delta codec, `src/game/view-state.js`.
4. **AI** (`src/ai/`). Decide whether computer players use the feature; they act only through `world.issueCommand`, like a human. Brutal stays strictly fair.
5. **Interface.** Command card (`src/ui/command-card.js`), HUD panel or alert, input/hotkeys (`src/ui/key-bindings.js` RESERVED or KEY_ACTION), touch and gamepad if relevant, any emoji mapped in `src/ui/icon-map.js`, team colours through `displayColor`.
6. **Render** if it has a look: `src/render/`, budgets in `tests/render/`, Low stays cheap, materials patched world then fog.
7. **Docs.** DESIGN.md section, How to Play (`src/ui/menu-howto.js`), tips that quote numbers (`src/ui/hint-data.js`), README for headline features, `src/data/whats-new.js` entry, and a note in `docs/knowledge/` for anything non-obvious you learned.
8. **Tests** beside the code in `tests/<area>/`, then run the `verify-change` skill.
