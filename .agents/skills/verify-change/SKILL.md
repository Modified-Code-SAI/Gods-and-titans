---
name: verify-change
description: Run the right checks for a change to Mythic War before committing or opening a pull request (lint, targeted and full unit tests, the AI audit, and browser checks when UI or rendering changed).
---

# Verify a change

1. Lint: `npm run lint` (must be clean).
2. Targeted tests while you work: `node --test tests/<area>/<file>.test.js` for the files beside the code you changed. Quote any glob: `node --test "tests/sim/**/*.test.js"`.
3. Before a pull request: `npm test` (about 2.5 minutes, every test must pass). Read the `# pass` / `# fail` counts; a piped command can exit 0 with failures. If a timing-sensitive test fails while the machine is busy, re-run that file alone.
4. If `src/sim/`, `src/ai/` or `src/data/` changed: `npm run audit` (AI games with invariants and a determinism replay). For AI or balance changes also bench: `node tools/ai-tournament.mjs --seeds=1-8 --diff=normal --workers=2`, compare with a baseline worktree of `main`, play every map with sides swapped, judge on hundreds of games.
5. If a command, message or event changed: confirm `src/sim/commands.js` COMMAND_TYPES, `src/net/sanitize.js` COMMANDS, the `good` list in `tests/net/hardening.test.js` and `EVENT_SHAPES` in `src/net/delta.js` (appended at the end) all have it.
6. If UI or rendering changed: `npx playwright install chromium` once, then `npm run e2e -- --slow` (or `node tools/play-test.mjs --only sp,controls`) and the matching `tools/shot-*.mjs` stills. Look at the stills yourself.
7. If player-facing behaviour changed: DESIGN.md section, How to Play (`src/ui/menu-howto.js`), tips (`src/ui/hint-data.js`) and a What's New entry (`src/data/whats-new.js`) are updated, and their tests pass.
8. Nothing generated is staged: no `node_modules`, `_site/`, `play-shots/`, screenshots or worktrees (`git status` before `git add`).
