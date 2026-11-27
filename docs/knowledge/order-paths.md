# order-paths

> dotted order paths under selected units (PR #114, wave 15 finding 10): snapshot wp/pe, OrderPaths overlay, rules

PR #114 (merged 2026-10-30 01:37 as 5ca5df2): selected own units draw a faint dotted path through Shift-queued points and along a patrol.

- Snapshot `unitPath` in src/sim/snapshot.js: `wp` [[x, y, kind]] (0 move, 1 attack/patrol, 2 work), max WAYPOINTS_MAX 5, `pe` = patrol far end. A point on a unit carries its id as p[3]; the renderer places it at that unit's visible view and stops the path in the fog (Codex P2 finding: the live position leaked a hidden enemy). Only for `players[owner].kind === 'human'`; omitted when idle or on a standing order with no queue. One snapshot is shared by all clients, so per-viewer filtering is not possible; human-only keeps bandwidth flat.
- A patrol is always last in a queue: queueing after an open-ended order replaces it (orders.js queueOrder).
- Render: `OrderPaths` in src/render/overlays.js (instanced dots, marker colours, setPalette on team palette change), driven at the end of GameRenderer overlay update next to the rally flags.
- Still recipe: copy tools/shot-ranks.mjs; in the sandbox import playwright via createRequire('/opt/node-tools/node_modules/playwright/index.js') and serve with `python3 -m http.server` (node_modules has no http-server).

See `engagement-research-2026-10-29` (process note, not kept), `pr-merge-workflow` (process note, not kept).
