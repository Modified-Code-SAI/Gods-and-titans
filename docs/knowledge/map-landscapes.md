# map-landscapes

> map landscapes (PR #77, merged 2026-10-28, plan item 14): Wildlands/Highlands/Rivers/Islands/Great Forest + Random in the lobby; how they are built, rules kept, tools

Plan item 14 of the 2026-10-28 improvement loop (`engagement-research-2026-10-28` (process note, not kept)). Lobby "Landscape" chips: Wildlands (`classic`, the original generator, byte-for-byte unchanged: hashes compared on 108 configs), Highlands, Rivers, Islands, Great Forest (`forest`), Random.

- Data: `src/data/landscapes.js` (ids, names, blurbs, `resolveLandscape(choice, seed)`). Random is resolved in `buildSetup` from the seed; `GameSetup.landscape` is only present for non-classic; `mapOptions` passes it; `validateSetup` keeps only real ids.
- Generator: `LANDSCAPE_RULES` + `landscapePass()` in src/sim/mapgen.js. Ridges (rock) and rivers are contour lines of orbit-averaged noise, distance = |f-level|/|grad f|, tapered to 0 near L.zones. Islands = sea except smoothstep bumps under bases/expansions/camps/center; lane carve turns water into sand, so lanes become fords / land bridges. Non-classic seeds get a `|landscape` tag. Sacred sites get a widened search on new landscapes only, and generateMap retries non-classic maps until they have at least one site (falls back to the first valid map).
- Survival spawn points are snapped to tiles reachable from player buildings (`reachablePoints` in src/sim/survival.js); Great Forest medium seed 26 used to trap monsters.
- Team layouts are fair team-vs-team (each base rotates onto its rival), not teammate-vs-teammate; tests compare p with (p+2)%4.
- Tools: `map-preview.mjs --landscapes a,b --teams 1,1,2,2`, `render-harness.html?landscape=`, `shot-zoom.mjs --landscape`, `ai-tournament.mjs --landscape=`.
- Sandbox: no node_modules; symlink /opt/node-tools/node_modules/playwright and install http-server into /tmp for the shot tools (never commit node_modules).
