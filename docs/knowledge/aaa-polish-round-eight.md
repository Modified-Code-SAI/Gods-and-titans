# aaa-polish-round-eight

> Rounds eight and nine of the AAA polish (2026-11-06): arrival, age, tutorial and foe cards, after-game stat bars; what landed

Continues [aaa-polish-round-five](aaa-polish-round-five.md) (standing order: keep doing rounds until the owner says stop, merge on green; link stills by path, the thread's attachment cap is hit).

- Round eight: arrival card merged #143 e763a62 (src/ui/hud-arrival.js, Hud.showArrival from game.js spawn; fake huds in tests need showArrival). Still round-eight/arrival-cards.png. Age card (ageSpec, Hud.showAge on tierUp) merged #144 072f87b; still round-eight/age-cards.png. Tutorial loading card (tutorialCardSpec, column-flow grid via --rows) merged #145 f10014c. Round nine: red foe/wave-boss card (arrivalSpec foe/wave/count) merged #146 b205451.
- After-game stats merged #147 a3c9870: hud-chronicle.js table() takes a measure {of, best} per column; leader cell gets 'has-bar is-best' (gold), others 'has-bar' with --share underline; Losses/Lost never lead; a fully tied column marks nobody; body keeps its tallest min-height across tab switches. Still round-nine/chronicle-military.png (tools/shot-chronicle.mjs, ~3 min).
- Round ten: top-bar income rates merged #148 55e063a: src/ui/hud-income.js IncomeMeter samples stats.gold/stats.wood (gathered, not bank) over 60 s game time, hidden under 15 s, resets on clock back/jump; faith = faithRate*60; all '+N/min'; chip titles via rateTitle (Hud.updateIncome). Gatherers are called Worshippers in UI text. Still round-ten/income-rates.png (seed hud.income[k].samples while paused).
- Hover tips merged #149 6dfaa2c: src/ui/hover-tip.js installHoverTips(document) in main.js turns every `title` into a styled .mw-hovertip card (style.css); title moves to data-tip + aria-description; tipParts heads 'Name — …' (dash within 28 chars); [data-native-tip] opts out. Keep writing `title` in new code. Stills round-ten/hover-tip-*.png.
- Phone lobby pantheon panel overflow FIXED #150 d8935c1 (style.css 900px rule: flex 1 1 min(20em,100%), min-width 0). Menu screens swept at 360px: clean (scratch sweep.mjs measures elements outside the viewport not clipped by a scroller).
- Drop-off numbers merged #151 6fc31f6: sim economy.deposit emits {type:'deposit',player,amount,res,x,y} (new EVENT_SHAPES entry at the end); game-renderer onEvent accepts it, floats '+N' at scale 0.72, one per 2x2 spot per 0.6 s (DEPOSIT_GAP). Trap: renderer onEvent has a whitelist switch; new event types must be added there. Software GL makes floating texts live far longer (dt clamp), so stills overstate piles.
- Drop-down lists merged #152 726fee2: src/ui/select-menu.js installSelectMenus(document) in main.js; mousedown preventDefault on select.mw-select / select.hud-rp-vision opens .mw-selmenu; pick sets value + fires input/change (menu code untouched); touch keeps native. Still round-ten/lobby-drop-down.png.
- Idle-button flash merged #153 db51fe0 (Hud.updateIdle adds .is-new when the idle count rises; idlePrev). Ideas checked and already present: click sounds, construction scaffolds, hover rings, idle chip, settings toggles.
- Short-of chip flash merged #154 a77da25: hud.js shortOf(text) + Hud.flashShort (.is-short red shake) called from Hud.message error branch. Still round-ten/short-of-wood.png.
- Tooltip short costs merged #155 b1da24f: hud-card.js shortCosts(cost, me); CardView.render(card, me) marks .ht-res.is-short. Research-done message already exists (alerts.js 'researched'). Still round-eleven/tooltip-short-cost.png.
- Map hover tag merged #156 f53ccae: src/ui/hover-tag.js (hoverTagInfo, HoverTag), InputController.updateHoverTag; 350 ms rest; name, owner+Ally/Enemy, hp bar or mine gold. Stills round-eleven/hover-tag-*.png.

**Why:** later rounds need to know what landed.
**How to apply:** add each new PR here; pick the next gap after checking code.
