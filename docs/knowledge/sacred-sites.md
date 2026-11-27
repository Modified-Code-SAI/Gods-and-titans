# sacred-sites

> Sacred Sites and the Sacred Victory lobby toggle (engagement batch 2026-10-28, idea 3): rules, numbers, code map, AI pilgrims, traps

Built 2026-10-28 from (an off-repo folder, not kept) idea 3 (after AoE IV), under the owner's full-autonomy go-ahead (`engagement-research-2026-10-28` (process note, not kept)). Spec: DESIGN.md 5.11. PR #65, squash-merged 2026-10-28 as ef160aa (test green, Codex security clean, no bot findings at merge).

**Rules**: every map has 3 to 4 sites (mapgen `placeSacredSites`, deterministic part, whole symmetry orbits; center site only when the middle is not a lake or camp). Worshipper or Priest within SITE_RADIUS 3 captures a neutral site in 15 s; a rival's site is torn down in 10 s first; any rival unit there freezes it; 1 faith/s per held site; no building within SITE_KEEP 3 (`Too close to a sacred site.`). Sacred Victory (`setup.sacredVictory`, lobby `state.sacred`, `LobbyHost.setSacred`): hold every site 480 s → `gameOver { winningTeam, how: 'sacred' }`; no clock during a Decade of Peace. All knobs in config.js (SITE_*, SACRED_*).

**Code map**: sim/sacred.js (updateSites, accrueSiteFaith, siteViews, siteBlocksFootprint), world.js (sites, sacred, winSacred, siteBlocks), snapshot `sites` + `sacred`, delta EVENT_SHAPES (+5 at the end), view-state (sites, sacredLeft, sitesHeld), ui/hud-sites.js (🛐 chip), game/alerts.js (site/sacred alerts, marks 2:00/1:00/0:30), game/placement.js, render/sacred-sites.js (SacredSiteLayer, ~520 tris/site), ui/minimap.js diamonds, ai/sacred.js (pilgrims) + military mode 'site'.

**AI traps found**: pilgrims walked through creep camps and died in droves in the peace test (worker count fell to 7). Fixes kept: sites 12 tiles from camps (9 fallback), skip a site when live creeps are within 9 of the walk, 120 s retry after a death or 90 s give-up, manageWorkers skips `ai.pilgrims`. AIs still ping-pong-steal sites all game (lively, deliberate).

**Not done / ideas**: an achievement for a Sacred Victory (career PR #63 landed at the same time), AI voice lines for sites (#64), a site tooltip on hover. Stills: (an off-repo folder, not kept)
