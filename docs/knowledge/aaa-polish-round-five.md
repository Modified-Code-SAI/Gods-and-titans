# aaa-polish-round-five

> Round five of the owner's ongoing AAA polish (2026-11-06): live 3D title #131, versus loading screen; what is next and traps

Continues [aaa-polish-round-three](aaa-polish-round-three.md) (standing order: keep doing rounds until the owner says stop, merge on green).

- #131 live 3D title: details in [aaa-polish-round-three](aaa-polish-round-three.md).
- #131 merged 5b8bcdd. Loading screen PR #132: src/ui/match-loading.js `matchSides`, `matchTerms`, `buildMatchup`; game.js setLoading adds class mw-loading and clears the inline background, row gets class mw-ld-status; CSS in style.css. Campaign and tutorial keep the plain veil. Still: (an off-repo folder, not kept) Still script calls Game.prototype.setLoading.call({root, launch}) in the page.
- #132 merged adf9197. Realm panel PR #133: src/ui/hud-realm.js realmSummary/nextLine/RealmPanel, shown by hud-info when nothing is selected and vs.me exists (sig 'realm'); still realm-panel.png. tools/shot-overview.mjs gives a live-match still in ~3 min.
- #133 merged f175391. #134 merged c7d2bb1 (group selection): hud-info buildSummary/updateSummary (count, summed hp, type chips), 12-column bigger cells; still group-selection.png. Scratch shot-army.mjs spawns units via __game.session.world.spawnUnit and selects with __game.selection.set(ids).
- Round six: game menu tabs merged #135 da417aa (hud-overlays optionPages; tab 'Keys' not 'Controls' because tests click the button named Controls). Still round-six/game-menu.png.
- Settings tabs merged #136 67b39f7 (menu.js settingsPages; test sets globalThis.Node before importing menu.js).
- Campaign chapter map merged #137 3d6049b: src/ui/campaign-map.js (seeded SVG, stops via setAttribute class so fake-dom find() misses them); also phone panel-head fix. Still round-six/campaign-map.png; scratch shot-cmap.mjs seeds localStorage 'mythicwar-campaign'.
- Career renown banner merged #138 17eb124: src/game/renown.js (derived, not stored; titles Initiate..Ascended), renownBanner in menu-career.js; still round-six/career-renown.png; scratch shot-career.mjs seeds 'mythicwar-career'.
- How to Play tabs merged #139 6a127d8: howToPages() in menu-howto.js (renderHowToContent kept for tests); settingsPages(list, memo) remembers per screen; still round-six/how-to-play-1.png.
- Round seven: lobby map preview merged #140 8be5248, src/ui/map-preview.js (sample seed 'lobby-preview', real generateMap, cached); sits in .mw-opt-col under game mode; still round-seven/lobby-map-preview-islands.png. (Phone lobby overflow fixed later in #150.)
- Sky dial merged #141 cbe2ea4: src/ui/hud-sky.js over the top banner jewel; three-free clock split to src/render/day-clock.js (HUD tests cannot import three: atmosphere.js needs the vendor loader hook). Stills round-seven/sky-dial-*.png.
- Campaign mission loading card merged #142 f8897b0: missionCardSpec/buildMissionCard in match-loading.js, reuses buildChapterMap; still round-seven/mission-loading-card*.png.
- Rounds eight and nine onward: see [aaa-polish-round-eight](aaa-polish-round-eight.md).
- The AAA thread hit the 24 attached-outputs cap (2026-11-06): link stills by path in replies instead of attaching.
- Already done, do not propose: tier-up vfx, screen shake, themed cursors (hud.css, per-order), unit deaths, the ending.

**Why:** later rounds need to know what landed.
**How to apply:** update as PRs land; pick next gap after checking code.
