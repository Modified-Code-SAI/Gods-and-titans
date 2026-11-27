# GEMINI.md

All agent instructions for this repository live in [AGENTS.md](AGENTS.md), shared by every coding agent so they never drift apart. Antigravity loads AGENTS.md by itself; for Gemini CLI the line below imports it.

@./AGENTS.md

## Notes for Gemini and Antigravity

- Start a task by reading the matching note in `docs/knowledge/` (`grep -ril "<feature>" docs/knowledge`) and the DESIGN.md section it cites. DESIGN.md is 3,700 lines: search it, do not load it whole.
- Repeatable procedures are packaged as skills in `.agents/skills/` (verify a change, add a game feature, take screenshots for visual work).
- Run `npm run lint` and the relevant `node --test` files after every change; run the full `npm test` before you open a pull request. Long browser checks (`npm run e2e`, `tools/shot-*.mjs`) are slow without a GPU: run them only when the change touches the UI or rendering.
- Keep each pull request to one feature, with tests and the DESIGN.md update in the same PR. A push to `main` deploys the live site.
