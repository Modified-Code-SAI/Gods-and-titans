# rich-part-routine

> the per-part routine used for every rich character and creature pass (roster check, outfit or plan file, gallery rounds, before/after stills, tests, docs, checksum diff, idle full test run, draft PR); use it if a pantheon or plan is ever re-done or added

The routine behind parts 1 to 21 (characters #24, #27 to #36; creatures #37 to #47), if another pantheon, unit or re-do is ever asked for:

1. Roster check (scratchpad `roster-root.mjs <pantheon>`); an outfit file `rich-outfits-<name>.js` registered in `OUTFITS` and `RICH_PANTHEONS` for people, or a plan in `PLANS` (rich-creatures.js) for a creature.
2. Gallery rounds, then before/after stills from the real renderer into (an off-repo folder, not kept) with a README and a line in the top-level README "Later parts" (parts 1 to 21 exist).
3. Tests (rich-models.test.js, or a new tests/render/rich-<plan>.test.js), DESIGN.md and notes/decisions.md.
4. Checksum diff of every earlier unit (`col-root.mjs` with ROOT=<old worktree> vs ROOT=<new>, must be identical; `anim-hash.mjs` for bone matrices over six states).
5. Full `npm test` on an idle machine (the four timing tests fail if renders run beside it; about 95 s).
6. Draft PR in the style of the earlier ones, `update_pull_request` with the same body, subscribe, one short reply.

Elites are not in the shot tool's start formation: spawn them with `--eval` (see [rich-kit-celtic](rich-kit-celtic.md)). Overview: [rich-rollout-status](rich-rollout-status.md); merging a stack: `stacked-pr-squash` (process note, not kept).
