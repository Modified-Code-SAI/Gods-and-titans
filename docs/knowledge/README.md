# Knowledge notes

Detailed notes written while each feature was built (2026-10-17 to 2026-11-19): code maps, the numbers that were measured, rules to keep, traps, and what was left undone. They were the previous developer's working memory and are kept here so the next developer (human or AI) has the same context.

How to use them:

- Search before changing a feature: `grep -ril "manor" docs/knowledge`. Then read DESIGN.md's section for the rules and the code for the truth.
- They are point-in-time notes. Code moved on after some were written: verify a file, function or number in the code before relying on it. When a note and the code disagree, the code wins (and please fix the note).
- PR numbers (#N) refer to pull requests in this repository; `git log --grep '#N'` finds the squash commit.
- "The owner" is the person this game is built for; they play it and decide its direction. Mentions of "threads", "waves", merge go-aheads, review bots and `claude/...` branch names describe how the previous AI agent organized its work. They are history, not instructions.
- Paths such as `/opt/node-tools/node_modules`, `/opt/pw-browsers/...`, `/home/claude/...` and "scratchpad" scripts belong to the old cloud sandbox and do not exist in this repository. Use the repo's own `node_modules` (after `npm ci`) and `tools/`. "(an off-repo folder, not kept)" marks screenshots and audio previews that were shared outside the repo.
- Add to these notes when you learn something non-obvious about a feature, and keep each note about one subject.

## Project overview and history

- [mythic-war-game](mythic-war-game.md): The owner's mythology RTS game (Gods-and-titans repo) - repo, decisions, architecture, hosting, PR state
- [quality-review-2026-11-05](quality-review-2026-11-05.md): Cloud env tool inventory and quality review of 2026-11-05: what runs here, the stuck-god bug lead, CI/tool gaps, report link
- [cloud-resources-survey-2026-11-06](cloud-resources-survey-2026-11-06.md): Survey (2026-11-06) of unused cloud-env resources for the game: what is reachable, what the game lacks, ranked ideas given to the owner
- [finish-loop-2026-11-18](finish-loop-2026-11-18.md): The owner's autonomous "find and finish unfinished parts" loop (from 2026-11-18): standing merge go-ahead, wave log, audit method, what was checked clean
- [finish-loop-waves-2026-11-18](finish-loop-waves-2026-11-18.md): Waves 3 on of the owner's "find and finish" loop (2026-11-18): each PR, its code names, bench methods and checks
- [finish-loop-waves-8-on](finish-loop-waves-8-on.md): waves 8 on of the 2026-11-18 find-and-finish loop: lobby AI styles, Chapters VI-X, handicaps, Guardian walls, tower fix
- [bug-hunt-2026-10-28](bug-hunt-2026-10-28.md): Bug hunt (plan item 10, PR #73 merged 2026-10-28): audit/chaos harness tools, the three bugs fixed, what came back clean, how to trace a stall

## Gameplay rules and modes

- [pop-cap-200](pop-cap-200.md): Population limit 200 (PR #13): AI army caps are shares of POP_MAX, scale numbers at 4x200 pop, how to re-measure, test gotchas
- [queue-depth-50](queue-depth-50.md): Production queue 5 to 50 per building (PR #49, merged 2026-10-27): what changed, the run-grouped queue row, cancelTrain count, measured wire sizes, what was left alone, test traps
- [worshipper-upgrades](worshipper-upgrades.md): Worshipper work-speed and health upgrade lines at the Town Center (PR #14): data shape, effects, one-card-slot-per-line rule
- [soldier-ranks](soldier-ranks.md): Soldier experience and ranks in the gods-and-titans game (PR #15, merged 2026-10-21): who ranks, the numbers to tune, why the marker is diamonds
- [pantheon-identity-system](pantheon-identity-system.md): How each pantheon is made unique in the game (blessings, elite soldier, looks), where the code is, and the test caveat
- [pantheon-balance](pantheon-balance.md): Pantheon balance pass (PR #88, merged 2026-10-29): god powers decide AI games, power-bench + tournament method, results, traps
- [god-powers](god-powers.md): AoM-style one-use god powers (PR #67, merged 2026-10-28): three per pantheon by tier, power bar beside minimap, AI casts them; code map, rules, traps
- [relics](relics.md): Relics from creep camps (PR #69, merged 2026-10-28, DESIGN 5.15): rules, code map, AI, balance observation, still tool
- [sacred-sites](sacred-sites.md): Sacred Sites and the Sacred Victory lobby toggle (engagement batch 2026-10-28, idea 3): rules, numbers, code map, AI pilgrims, traps
- [walls](walls.md): Wooden and stone walls (PR #18 and review follow-up #19, both merged 2026-10-21): what the owner asked, the rules as built, tuning knobs, open follow-ups
- [wall-code-map](wall-code-map.md): Where the wall code lives (data, sim, wire, render, HUD) and its gotchas: connection masks, two meshes a segment, the stone swap on the wire, loops that must skip walls
- [manor-houses](manor-houses.md): Four Houses in a 2x2 square become a Manor (U on a selection): interpretation, numbers, rules and status; built and merged 2026-10-27 as one of nine parallel feature threads
- [manor-code-map](manor-code-map.md): Where the Manor (four Houses combined) code lives across data, sim, wire, HUD and render, how it rides the production queues and cancelTrain, and the merge hotspots with the other batch threads
- [delete-key-kill](delete-key-kill.md): Delete and Backspace destroy the selected own units (PRs #48 and #54, 2026-10-27): sim `kill` command, the press-twice rule, Home for the Town Center, code map, what was left out
- [decade-of-peace](decade-of-peace.md): Decade of Peace game mode (PR #17): no player-vs-player harm for 30/45/60 game minutes; the canHarm rule, economy measurement, open question, and how to test the end of the peace live
- [peace-no-build-zone](peace-no-build-zone.md): Decade of Peace no-build ground (PR #51): nobody builds within 20 tiles of an enemy Town Center until the peace ends; where the rule, ghost and zone overlay live, numbers and limits
- [peace-zone-checks](peace-zone-checks.md): How the Decade of Peace no-build zone (PR #51) was checked: tests, the tint that was invisible at first, and the real-UI recipe (spawn a scout, wallTip, errorEl)
- [trial-of-the-titans](trial-of-the-titans.md): Trial of the Titans survival mode (PR #66, 2026-10-28): wave rules, code map, balance numbers, career link
- [daily-challenge](daily-challenge.md): Daily challenge (PR #76, 2026-10-28 engagement loop item 17): seeded per-day game, nine twists, best/streak in localStorage, code map
- [map-landscapes](map-landscapes.md): map landscapes (PR #77, merged 2026-10-28, plan item 14): Wildlands/Highlands/Rivers/Islands/Great Forest + Random in the lobby; how they are built, rules kept, tools
- [six-player-slots](six-player-slots.md): six seats (PR #163, 2026-11-06): ring map layout for 5-6 players, bigger map sizes, 3v3 preset, test and audit tools
- [guided-first-match](guided-first-match.md): Learn to Play tutorial (PR #68, engagement plan item 7): setup flag, sleeping raiders AI, objective director, HUD pin/glow, medals, code map, traps
- [campaign-chapter-one](campaign-chapter-one.md): Campaign Chapter I "The Long Winter" (PR #80, merged 2026-10-28, plan item 18): five Greek missions, sim objective engine, narration clips, code map, balance, traps
- [campaign-chapter-two](campaign-chapter-two.md): Campaign Chapter II "The Wolf Age" (PR #90, merged 2026-10-29, wave 7 item 26): Norse vs Loki, CHAPTERS data shape, objective `limit`, chapter tabs, balance numbers
- [campaign-chapter-three](campaign-chapter-three.md): Campaign Chapter III "The Sea of Chaos" (PR #104, merged 2026-10-29): Egyptians vs Akkad and Tiamat, mission ids, guard spawns, balance, bench and pkill traps

## Computer players

- [ai-difficulty-brutal](ai-difficulty-brutal.md): Smarter Hard (raids, wounded pull) and Brutal difficulty (PRs #81, #82): what was measured, what was dropped, A/B bench method and traps
- [ai-voices](ai-voices.md): AI players' in-character chat lines (PR #64, engagement batch 2026-10-28): moments, rate limits, wire flag, aiChat setting, code map
- [ai-ally-callouts](ai-ally-callouts.md): AI allies place Attack/Help markers plus a team line when a wave sets out or their base is attacked (wave 15 finding 7, 2026-10-30): rules, knobs, code map

## Online play

- [rejoin-online](rejoin-online.md): rejoining online games (PR #86, wave 6 item 19): token flow, stand-in AI difficulty, grace, UI, code map, the shared-software-GPU trap in two-tab checks
- [host-migration](host-migration.md): online games survive the host leaving (heir backups, takeover, followHeir) and online pause (PR #93, wave 7 item 24): code map, numbers, check tool, traps
- [online-rematch](online-rematch.md): online Rematch in the same room and Open seats for friends (PR #100, merged 2026-10-29): code map, rules, check tool, traps
- [team-marks](team-marks.md): Minimap pings and team markers (PR #52, 2026-10-27 batch): gestures, the teammates-only `mark` message, limits, code map and decisions
- [two-tab-browser-check](two-tab-browser-check.md): Running a two-tab multiplayer check of the game with Playwright on software GL, plus shell and CI traps that cost time in the 2026-10-27 batch

## Game services and interface

- [after-game-chronicle](after-game-chronicle.md): After-game chronicle (PR #62, merged 2026-10-28): match stats, score, awards, timeline chart; code map and traps
- [career-achievements](career-achievements.md): Career profile and 35 achievements (PR #63, 2026-10-28 engagement batch): client-only localStorage, code map, counting rules, how to add one
- [save-load](save-load.md): save and load for solo games (PR #78, engagement item 16): graph packer, files, what is saved, determinism test, traps
- [match-replays](match-replays.md): Match replays (PR #79, merged 2026-10-28): command recording, IndexedDB store, ReplaySession viewer, free camera; code map, rules, traps
- [alerts-and-tips](alerts-and-tips.md): In-game alerts, tab flash, gameplay tips and six alert sounds (PR #53, merged 2026-10-27): code map, settings, timings, how to add a tip or alert
- [alerts-tips-gotchas](alerts-tips-gotchas.md): Traps from the alerts and tips work: snapshot order for defeat events, attention-only alerts, late permission prompts, stacked cards, fake-DOM limits for menu tests, driving the real game with window.__game
- [alert-sounds](alert-sounds.md): The six alert sounds (nudge, drums, gong, research, tip, milestone): what each is for, measured levels against the horn, and that nobody has listened yet
- [message-feed-cards](message-feed-cards.md): Bottom-left message feed as stone cards (PR #59, merged 2026-10-27 as 66219d9): look, numbers, code map
- [message-feed-traps](message-feed-traps.md): Traps and the check recipe from the message-feed card work (PR #59): the this.card clash, shared keyframes, reduced-motion specificity, slide-in vs window checks, sandbox backdrop
- [order-paths](order-paths.md): dotted order paths under selected units (PR #114, wave 15 finding 10): snapshot wp/pe, OrderPaths overlay, rules
- [roster-and-group-bar](roster-and-group-bar.md): in-match player list (hud-roster.js) and control-group chip bar (hud-groups.js), PR #115 (merged 2026-10-30): placement, rules, traps
- [game-speed-ui-scale](game-speed-ui-scale.md): game speed (solo only, 0.5x-2x) and interface size settings (PR #75): how speed is applied without touching the sim, code map, check numbers
- [accessibility-keys-colours](accessibility-keys-colours.md): colour-blind team palette, rebindable camera/grid keys, 10 px text floor (PR #97, wave 8 item 30): code map, rules, traps
- [aaa-polish-pass](aaa-polish-pass.md): The owner's "Make everything AAA quality" thread (2026-11-05): ranked gap list, PRs, fonts/impact-sound/flinch facts, tool fixes
- [aaa-polish-round-two](aaa-polish-round-two.md): Round two of the owner's AAA polish (2026-11-05): remains #124, weather #125, unit replies; code facts and traps
- [aaa-polish-round-three](aaa-polish-round-three.md): Round three of the owner's AAA polish (2026-11-06): painted icons replace emoji (PR #127), 3D selection portrait (PR #128), both merged; code facts and traps
- [aaa-polish-round-five](aaa-polish-round-five.md): Round five of the owner's ongoing AAA polish (2026-11-06): live 3D title #131, versus loading screen; what is next and traps
- [aaa-polish-round-eight](aaa-polish-round-eight.md): Rounds eight and nine of the AAA polish (2026-11-06): arrival, age, tutorial and foe cards, after-game stat bars; what landed
- [aaa-polish-round-twelve](aaa-polish-round-twelve.md): AAA polish from round twelve on (2026-11-06): what landed after #156, gaps checked and found already done, traps
- [aaa-polish-touch](aaa-polish-touch.md): Touch play for phones and tablets from the AAA rounds (2026-11-06): what landed (#164 on), how to check it, traps
- [aaa-polish-comfort](aaa-polish-comfort.md): AAA rounds comfort and safety items (2026-11-06): rumble, Destroy button, offline play, shake and camera-speed settings, leave protection (#176 on)
- [aaa-polish-settings](aaa-polish-settings.md): AAA polish items after aaa-polish-comfort filled up (2026-11-07 on): Restore defaults #193, and gaps checked and found already done

## Graphics: pipeline, world, performance

- [gods-titans-graphics](gods-titans-graphics.md): Render pipeline decisions for the gods-and-titans game (post-processing, quality tiers, overlays, shader patch order) - read before touching src/render
- [graphics-overhaul-plan](graphics-overhaul-plan.md): Staged graphics overhaul the owner started 2026-10-21 (smooth, rounded, never blocky) - Ashbound Outpost look target, render-layer decision, step order, status
- [graphics-pass-history](graphics-pass-history.md): What the four 2026-10-19 graphics passes (PRs #5 to #8: studio look, scene dressing, units and trees, gods and creatures) changed in the render code; split out of gods-titans-graphics
- [time-of-day-system](time-of-day-system.md): Day/night cycle in gods-and-titans (src/render/atmosphere.js): how it is driven, uniform names, tuning workflow, gotchas for anyone touching lights, haze, post or shaders
- [terrain-ground-field](terrain-ground-field.md): Smooth ground and clear water (graphics overhaul step 1, terrain thread): the ground field architecture and where each piece lives in src/render
- [terrain-render-gotchas](terrain-render-gotchas.md): Traps, numbers and open follow-ups from the terrain and water work (outcrop tuning, glints, bump artifacts, shader patch order)
- [foliage-look](foliage-look.md): How trees, bushes, ferns and palms are drawn since the foliage pass (leaf puffs, needle sprays, quality hook, light) and the gallery/capture tools; read before touching props.js or foliage-shader.js
- [foliage-cost-and-outcrops](foliage-cost-and-outcrops.md): Measured cost of the foliage pass (software rasterizer, where it comes from, the lean-Low option) and the decorOffOutcrops rule that keeps plants and boulders off sandstone outcrops
- [shader-expanded-geometry-gotchas](shader-expanded-geometry-gotchas.md): Three traps from the foliage PR review (#21) for any geometry a vertex shader expands or any material swapped after construction: fog re-patch after setQuality, CPU bounds, shadow-pass cut
- [far-zoom](far-zoom.md): far zoom (PR #55, merged 2026-10-27): camera 10 to 170 tiles, where the curves and the three cost levels live, the rules to keep, costs
- [far-zoom-traps](far-zoom-traps.md): tools and traps from the far zoom work: shot-zoom.mjs options, the harness late scenario, static server, foreshortened heights, stale far flags, merge surprises from the intro film
- [late-game-perf](late-game-perf.md): Late-game performance pass (PR #74, merged 2026-10-28 as d011d28): where the cost is at 4x200 pop, shadow box fit, chunk box culling, perf-late tool and its traps
- [joined-unit-parts](joined-unit-parts.md): Low-poly units drawn as one skinned mesh each (PR #92, merged, wave 7 item 25): how it works, measured gains, traps, the --stub-draws measuring method
- [render-shot-workflow](render-shot-workflow.md): How to capture matched before/after stills, preview sibling branches together and smoke-test the real UI for gods-and-titans render work (software GL timing, flags, traps)

## Graphics: buildings

- [buildings-kit-code-map](buildings-kit-code-map.md): Where the building model code lives (core, materials, pieces, models) and the helpers to use for roofs, domes, battered and rounded masses
- [buildings-budgets-and-shots](buildings-budgets-and-shots.md): Building detail levels, triangle budgets with measured numbers, camera facts and the capture and measure tools for the buildings pass
- [manor-model](manor-model.md): How the Manor building model is built (courtyard house in each pantheon's style), its triangle budget numbers, the traps from trimming it and the gallery views used to check it

## Graphics: rich characters and creatures

- [rich-characters](rich-characters.md): Rich skinned character tier (High/Ultra only) built as the Norse sample - what it covers, gating, files, and what waits on the owner's call
- [rich-characters-rollout](rich-characters-rollout.md): Plan for taking the rich characters from the Norse sample to the other nine pantheons (the owner chose it 2026-10-23): scope, PR stacking, order, builder file map, budgets, what is held back
- [rich-rollout-status](rich-rollout-status.md): the ten-pantheon character rollout (PRs #24, #27 to #36) and the creature passes (#37 to #47) are complete and merged to main (2026-10-24); what is still open
- [rich-skeleton-rules](rich-skeleton-rules.md): Rules and measured costs of the rich character rig - detached skeleton, mounts for rigid pieces, template cache, triangle and CPU numbers, asset-source reachability
- [rich-part-routine](rich-part-routine.md): the per-part routine used for every rich character and creature pass (roster check, outfit or plan file, gallery rounds, before/after stills, tests, docs, checksum diff, idle full test run, draft PR); use it if a pantheon or plan is ever re-done or added
- [rich-kit-pieces](rich-kit-pieces.md): Shared rich-character pieces from the Greek, Egyptian and Hindu passes (heads, headgear, clothing, extra arms, flame arch, skinPaint hook) and the gallery sheet camera params, to reuse in the next pantheon passes
- [rich-kit-japanese](rich-kit-japanese.md): Pieces, outfit hooks and traps from the Japanese rich-character pass (fifth pantheon), to reuse in the Chinese, Aztec, Celtic, Mesopotamian and West African passes
- [rich-kit-chinese](rich-kit-chinese.md): Pieces, outfit rules and traps from the Chinese rich-character pass (sixth pantheon): upright monkeys on the humanoid rig, mirror armor, crossbow, pennants, ribbons, lean-detail options and the triangle trims that fixed the budget
- [rich-kit-aztec](rich-kit-aztec.md): Pieces, outfit rules and traps from the Aztec rich-character pass (seventh pantheon): maxtlatl, quilted armor, obsidian macuahuitl, eagle and hummingbird helms, jaguar pelt, Tlaloc's goggles, and team color on gods
- [rich-kit-celtic](rich-kit-celtic.md): Pieces, outfit rules and traps from the Celtic rich-character pass (eighth pantheon): tartan, mail, torc, brooch, antlers, flame crown, raven, double axe, torch, tall oval shield, and the drape-winding fix
- [rich-kit-mesopotamian](rich-kit-mesopotamian.md): Pieces, outfit rules, numbers and traps from the Mesopotamian rich-character pass (ninth pantheon): kaunakes, fringe, scale coat, cone helm, horned crowns, curled beard, fish hood and cloak, water streams, sling, pear mace, arched wicker shield
- [rich-kit-west-african](rich-kit-west-african.md): shared pieces, paints and the two new outfit hooks (skin palette, gear side) from the West African rich-character pass
- [west-african-look-traps](west-african-look-traps.md): pattern-density limits, the failed iterations, the team-color rule and the deliberately darker skin from the West African character pass
- [rich-creatures-plans](rich-creatures-plans.md): Rich creature body plans (quadrupeds PR #37 to the battering ram #47, all merged to main 2026-10-24; every unit has a rich model): the owner's ask, code map, dispatch, pose-key rules
- [loft-skinning-traps](loft-skinning-traps.md): MeshKit loft/skin gotchas found in the creature passes: paint angle is a fraction, mixBind order, alongPath ends, cap pole, backTone
- [rich-creature-look-traps](rich-creature-look-traps.md): Look traps from the quadruped, bird, lizard and beast-biped passes (lion/hyena heads, manes, spots, ears, wings, crocodile stance) and the shot framing facts for creatures
- [rich-serpent-plan](rich-serpent-plan.md): Serpent, hydra and eastern dragon rich models (7 units): bones, skin blend, hydra neck cap by class, costs
- [rich-reptile-plan](rich-reptile-plan.md): Cipactli (crocodile) and Mushussu (dragon-headed beast) rich models on the quadruped skeleton: files, builds, paint and stance knobs, traps, costs, still framing (PR #40)
- [rich-beast-biped-plan](rich-beast-biped-plan.md): Beast bipeds (Vanara, Ugallu, Sasabonsam, Bultungin) rich models on the humanoid rig: dispatch, new files and tables, costs (PR #41)
- [rich-spirit-plan](rich-spirit-plan.md): Shade and Banshee rich spirits on the humanoid rig with a tail-bone wisp and per-vertex alpha ghost (PR #42, creature pass 6): files, hooks, values, costs
- [rich-spirit-look-traps](rich-spirit-look-traps.md): Traps from the Shade and Banshee pass: glow-solid rule, translucent cloth, shadow flag override, pale colours, and the framing that works for their stills
- [rich-naga-plan](rich-naga-plan.md): Hindu Naga, Nuwa and Quetzalcoatl rich nagas on the humanoid rig with a nine-bone serpent tail (PR #43, creature pass 7): files, values, costs, checks
- [rich-naga-look-traps](rich-naga-look-traps.md): Traps from the naga pass: loft frame flip on a vertical tangent, pot-like tail root, grey belly, tail length times unit scale, budget arithmetic, gallery t= phase, and still framing
- [rich-centaur-plan](rich-centaur-plan.md): Greek Centaur and Celtic Dullahan rich centaurs (person on a horse, one skin on humanoid + horse bones, PR #44, creature pass 8): code map, bones, pose, values, costs, checks
- [rich-centaur-look-traps](rich-centaur-look-traps.md): Traps from the centaur pass: detached root parent bug, rigid held head lying sideways (palm pivot bone), cape through the barrel, equine neck bulge, belly patch, person scale, first-seen-dead NaN, still framing
- [rich-insect-plan](rich-insect-plan.md): Egyptian Scarab (beetle plan) and Mesopotamian Scorpion Man (person on a scorpion) rich models, creature pass 9 (PR #45): dispatch, shared code, pose values, costs, checks
- [rich-insect-look-traps](rich-insect-look-traps.md): Traps from the insect pass: ring-frame flip on a vertical tail, blendPose attenuation and stride, shin fold sign, settle moves the root, chitin vs skin tone, thin team ridge, still framing
- [rich-elephant-plan](rich-elephant-plan.md): Airavata (Hindu titan): Indra in a howdah on a three-headed white elephant, creature pass 10 (PR #46): dispatch, bones, outfit and rider hooks, pose values, costs, checks
- [rich-elephant-look-traps](rich-elephant-look-traps.md): Traps from the Airavata pass: rider context, leg and foot seam, gold bands, white hide bloom, sliding stride, bone world units, budget trims, still framing for a scale 3.8 titan
- [rich-ram-plan](rich-ram-plan.md): the battering ram (shared mortal, all ten pantheons), the last creature pass 11 (PR #47): dispatch, 11 bones, pendulum log, wheels, banner, costs, checks
- [rich-ram-look-traps](rich-ram-look-traps.md): traps from the battering ram pass: bone rest offsets in poses, lathe winding and rim turn, horn coil, vertex-paint resolution, log-vs-frame clearance, still framing for a small unit

## Audio and the intro film

- [music-engine-code-map](music-engine-code-map.md): Where the background music lives (PR #58, 2026-10-27 batch): files, API, hooks into menu, match, settings and the intro film, tools and tests, how to add a theme or voice
- [music-engine-traps](music-engine-traps.md): Traps in the music engine (PR #58): just-in-time notes, hidden tab, value-curve rules, audio unlock, kit hooks, and that nobody has listened to it yet
- [music-loudness-workflow](music-loudness-workflow.md): How the music was balanced by measurement (no ears): per-instrument loudness targets, the offline render plus ffmpeg ebur128 method, final LUFS per theme, and the tone check after a trim
- [music-cpu-findings](music-cpu-findings.md): What the music costs on the audio thread (PR #58): per-node cost table, the levers that cut it, how to measure it in Chromium, final per-theme numbers and the budget test's limits
- [intro-film](intro-film.md): The skippable intro film (PR #56, merged 2026-10-27): what plays, code map, when it plays, how to look at it and change a shot
- [intro-film-traps](intro-film-traps.md): Look, camera and test traps from building the intro film (summon pillar blowout, trees on the east and south, god facing, sfx gap, software GL stall, fake DOM setup)
- [intro-narration](intro-narration.md): Spoken narration for the intro film (PR #57, merged): browser speechSynthesis reads CAPTIONS, Narration setting, click-to-unlock hint, code map, real-browser check, what was not checked
- [intro-recorded-voice](intro-recorded-voice.md): Intro narration as recorded Kokoro clips (PR #72, 2026-10-28): voice bm_george chosen by the owner, render recipe, voiceover.js, fallback, checks
- [intro-score](intro-score.md): The score under the intro film (PR #60, 2026-10-27): title theme conducted by the story, ducked for the narration; code map, mix, start and exits, knobs
- [intro-score-late-join](intro-score-late-join.md): Intro score on a first visit (audio unlocks at a click): joinAt and Run.skip, the narrator LINE_MAX fix, the engine's new-piece wait, and how PR #60's review findings were answered
- [intro-score-measurements](intro-score-measurements.md): What was measured (never heard) for the intro film's score, how the previews were made, and the traps met
- [autoplay-first-visit](autoplay-first-visit.md): Why the intro film was silent on a first visit (browser autoplay lock) and what the early start plus one-key card does; DESIGN 9 and 11.1
- [browser-autoplay-rules](browser-autoplay-rules.md): What Chromium lets a page do with sound and speech with no input (measured), the Sound: Allow setting, and the trap that Playwright's evaluate unlocks audio
