# finish-loop-waves-8-on

> waves 8 on of the 2026-11-18 find-and-finish loop: lobby AI styles, Chapters VI-X, handicaps, Guardian walls, tower fix

Continues [finish-loop-waves-2026-11-18](finish-loop-waves-2026-11-18.md) (waves 3-7) of [finish-loop-2026-11-18](finish-loop-2026-11-18.md).

- Wave 8, PR #214 (merged 0869258): lobby slot.style choice (STYLE_CHOICES random/balanced/styles, resolveStyle in buildSetup, host cycles a .mw-style-chip beside AI slots, clients see the icon). Port 8321 http-server may already be running from an earlier wave (EADDRINUSE is harmless).
- Wave 9, PR #215 (merged 986bdc4): Campaign Chapter VI "The New Fire" (Aztec, chapter id new_fire, missions tenochtitlan star_hill fire_temple causeways cipactli; mission ids must not equal a chapter id). Bench Normal 5/5, idle 0/5, Easy 3/5; Whisper mean 0.983. Achievement range test widened to 30-60.
- Wave 10, PR #216 (merged 964117a): Chapter VII "The Dragon of the Swamp" (west_african, chapter id dragon_swamp, missions oyo osun_grove ifa stilt_towers ninki_nanka). Finale seed matters: Normal lost on 11605/11606, won on 11611 (scratch bench-dbg.mjs <id> <diff> [seed] logs TCs and unit counts per minute). Never spawn Osebo/Onini (ability minions, no duration when spawned). Chaos hunt seeds 61-64 clean.
- Wave 11, PR #217 (merged 20a6fd0): player handicaps (HANDICAPS 100..50 in config, setup.players[i].handicap humans only, p.handicap in deposit/accrueFaith with ?? 1 for old saves, lobby slot.handicap host-any/self, .mw-handicap-chip, loading card).
- Wave 12, PR #218 (merged 651f40d): online-audit read lobby rows to 80 chars (the handicap chip pushed the pantheon past it); now 160 plus a client-handicap check. 3v3 forest hard audits 71-73 clean.
- Wave 13, PR #219 (merged c2da2a8): Guardian walls (src/ai/walls.js wallPlan/cutsOff/planWalls; Guardian scale now firstAttack 1.05 only, 14/40 vs 16 balanced). Fixed expansion guard towers ringing a mine (towerSpot non-urgent minR 4.5; stop at 2 own+allied towers). sim-audit --style. Bench: scratch style-bench2.mjs <style> <n> <diff> <offset>, run 4 shards of 10 in parallel.
- Wave 14, PR #220 (merged 29010e1): pickBuilder skips relic carriers (runRelics vs resumeSites swapped a worker every think). play-test surrender wait 10 s -> 60 s (CI frames up to 7.5 s flaked it). Style audits ffa/3v3/2v2 rivers clean.
- Wave 15, PR #221 (merged eaff8fc): Chapter VIII "The Tablet of Destinies" (mesopotamian, chapter id tablet, missions babylon nippur esagila kingu salt_sea; Tiamat boss again, fits the pattern of each chapter's boss being its own pantheon's titan). Ugallu, mushussu, bull_of_heaven, apkallu are minions (pop 0) but spawning them by event works (Ch III did). Finale mirror match is hard: seed sweep 12601-16 Normal won 10/16, picked 12606. Narration: render from a respelt copy of the lines JSON (mush-hush-shoo, Kin-goo) keeping the file names; Whisper 0.977. Audits ffa6 builder hard, islands raider sacred, brutal guardian peace rich: clean (pop-over-cap cap=0 is a near-dead player, soft).
- Wave 16, PR #222 (merged f37ee4c): Chapter IX "The Dragon King's Flood" (chinese, chapter id dragon_king, missions chentang kunlun flood_night sea_gates east_sea). Boss with no titan fit: a flight of four chinese_celestial_dragon (tag kings) instead; finale Normal won 11/12 seeds, kept 13611. Respellings: Ow Gwahng, Chen-tahng, Kwen-loon, fung-hwahng, yahk-sha; Whisper 0.990.
- Wave 17, PR #223 (merged b223622): Chapter X "The Poisoned River" (hindu, chapter id poisoned_river, missions vrindavan kadamba yamuna_night naga_towers kaliya; boss six hindu_naga tag kaliya; ally Chentang Crossbows; seed 14605, Normal won 13/16 of 14601-16; icon 🔱). All ten pantheons now have a chapter (50 missions). CI play failed once on an Ubuntu mirror 503 during browser install (not the game); rerun_failed_jobs fixed it.
- Round closed 2026-11-19 at the owner's word (wrap up, no new waves until he asks): main b223622 deployed, no open PRs.
- Campaign recipe: copy a chapter's shape, names <=20 chars, icons must exist in icon-map, update the three count tests, CSS .mw-cmap.is-<id>, CHAPTER_ICONS, render missing clips only.


**Why:** later waves need to know what landed, how it was measured, and what is left.
**How to apply:** add each wave's PR here; check before picking the next gap.
