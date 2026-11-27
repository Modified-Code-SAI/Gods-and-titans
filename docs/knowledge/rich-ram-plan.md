# rich-ram-plan

> the battering ram (shared mortal, all ten pantheons), the last creature pass 11 (PR #47): dispatch, 11 bones, pendulum log, wheels, banner, costs, checks

Part 21 of "Yes finish them next" (2026-10-24), the last unit. PR #47, stacked on #46 and merged with the whole creature stack on the owner's "Merge it" (squash c0aefc2 on main; branch `claude/creatures-ram-20tcd3`, worktree `/home/claude/gt-ram` is history). One unit: `battering_ram` (a shared mortal, body 'ram'), dressed in each pantheon's colors. With it every unit look (158, ten pantheons) passes `richSupported`; a test says so.

**Dispatch**: PLANS entry `{ supported: ramSupported, build: buildRamTemplate }` in rich-creatures.js (body 'ram', no head, headgear, weapon, offhand or extras). The template keeps `kind 'ram'` so `animateModel` picks the ram's case; in unit-anim.js that case integrates `m.wheelAngle` and `blendPose` first, then `if (m.rich) { applyCreature(...); break; }`; rich-creature-anim.js `case 'ram': applyRam`. Pose keys stay `['lx']`.

**Skeleton (11)**: root; body (0, 0.178, 0); log (0, 0.38, 0) < body; ropeA and ropeB (x -0.25 and 0.2, y 0.735) < body; axleF and axleB (+-0.36, 0.14) < root; flag1 to flag4 a chain < body. `creatureSpec` takes ABSOLUTE rest positions, a bone's `position` is the offset from its parent, so a pose that moves a bone adds the rest (`bodyRest`, `logRest` in applyRam).

**Files**: rich-ram.js (template; exports WHEEL_R, SILL_Y, RIDGE_Y, POST_Z, TIE_Y, LOG_Y, ROPE_LEN), rich-ram-parts.js (timber, lathe, mirrored, wheel, ramHead, hideRoof, hemRoll, flagCloth), rich-ram-anim.js (applyRam).

**Pose**: wheels `rotation.z = m.wheelAngle`; frame bobs 0.008 |sin 2wa|; log pendulum, ROPE_LEN 0.28: theta = asin(clamp(0.8 lx / 0.28, +-0.95)) plus sway plus slump (0.55 rad over 0.5 s when dead); ropes rotate z by theta, the log moves (L sin t, L(1 - cos t)); banner ripples sin(wavePhase - 0.9 i). In play theta runs about -0.68 to 0.51 because blendPose smooths the pose's peak.

**Look**: roof `TEAM(0.88, 'leather')` (two panels, 16 by 8 outer cells, a coarse inner layer), banner `TEAM(1)`: 362 of 3,650 vertices team painted, 56% of the top-down silhouette (low-poly 64%). Metal parts use `pal.accentMetal`, hem trim `pal.accent`.

**Costs**: 6,766 triangles (mortal budget 8,500), 11 bones, one mesh, 1.342 high against 1.30, template about 60 ms warm.

**Checks**: tests/render/rich-ram.test.js (17, with a clearance sweep of the log against the posts and tie, pendulum invariants, wheel contact); about 13 "ram stays low-poly" assertions in rich-models, rich-insects, rich-centaurs, rich-nagas and rich-elephant tests rewritten (the low-poly example in rich-models is a Thor with a dragon head); checksums vs the Airavata branch identical except the ram; `anim-hash.mjs` identical for 108 pantheon units; `npm test` 1061 pass. Traps: [rich-ram-look-traps](rich-ram-look-traps.md). Overview: [rich-creatures-plans](rich-creatures-plans.md). Nothing is left to do: no unit is low-poly any more.
