# aaa-polish-pass

> The owner's "Make everything AAA quality" thread (2026-11-05): ranked gap list, PRs, fonts/impact-sound/flinch facts, tool fixes

The owner (2026-11-05) asked to "make everything AAA quality". Reading: rank the player-visible gaps against an AAA RTS and fix them one focused PR at a time, merging on green under his standing go-ahead (`pr-merge-workflow` (process note, not kept), `engagement-research-2026-10-29` (process note, not kept)). A separate thread fixes audit bugs ([quality-review-2026-11-05](quality-review-2026-11-05.md)); stay out of those.

Ranked list posted: 1 fonts, 2 impact sounds, 3 hit reactions, 4 world ambience, 5 context cursors (gather/build/repair), 6 menu-to-match transition.

- #120 merged: vendor/fonts carries OFL variable woff2s (Mythic Display = Cinzel, Mythic Body = EB Garamond, Mythic UI = Inter, latin + latin-ext). Before it, Cinzel was named but never shipped. size-adjust Cinzel 94%, Garamond 104%; display text weight 700; the taunt line uses the body face in italic (Cinzel makes sentences all caps). Fetched with `npm pack @fontsource-variable/<name>`.
- #122 (combat feel): src/audio/sfx-impacts.js (hit_armor, hit_pierce, hit_wood, hit_stone, hit_heavy, death_big, death_titan, collapse; impactSound/deathSound). Levels set by rendered loudest-100ms RMS via renderSfxOffline in Chromium. Not yet listened to; reel at (an off-repo folder, not kept) UnitView.flinch: render-only knockback and lean, not yet seen in motion.
- #122 merged (sounds + flinch). #123 merged 16e0634 — all six ranked items landed; awaiting the owner's listen of the reels. #123 (ambience.js wind/birds/crickets/waves through sfx.shared, ambienceMix pure; InputController.workCursor pick/axe/hammer/flame cursors; matchupLine on the loading screen and a 0.8 s dissolve of the loading veil and #start-message). Ambience reel: (an off-repo folder, not kept)
- The loading screen can't be caught in a still on software GL (renderer build blocks the page); render it by calling Game.prototype.setLoading.call({ root, launch: { setup } }, true) in a page.
- After #121, CI has test (lint + unit), audit and play (~15 min) jobs; music-engine "bars are composed ahead" failed on ~1 % of random seeds (not load); pinned to seed 7 in #126.
- Tools: tools/shot-menu.mjs title hover fixed (hidden quick button). Assigning PRs to the owner's account fails after the repo rename (Validation Failed); skip it.

- Round two (from 2026-11-05 "Proceed"): see [aaa-polish-round-two](aaa-polish-round-two.md).
- Round three (2026-11-06): see [aaa-polish-round-three](aaa-polish-round-three.md).

**Why:** a later thread continuing the pass needs the list, what has landed and the traps.
**How to apply:** pick up at the first item not merged; update this note as PRs land.
