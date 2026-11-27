# aaa-polish-round-twelve

> AAA polish from round twelve on (2026-11-06): what landed after #156, gaps checked and found already done, traps

Continues [aaa-polish-round-eight](aaa-polish-round-eight.md) (that file is full). The standing order holds: keep doing rounds until the owner says stop, merge each PR on green, and link stills by path because the thread has hit its attachment cap.

- Menu hover tick merged in #157 (b565cb8). It is the new sfx name 'hover' in sfx.js (SFX_NAMES, LIMITS, LEVEL 1.1, recipe). menu.js plays it from a delegated pointerover, and hud-overlays btn() from pointerenter. It measured about 11 dB under the click (loudest 20 ms RMS from renderSfxOffline; scratch lvl.mjs). Nobody has listened to it yet.
- Phone-landscape HUD merged #158 bdf946e: hud.css @media (max-height: 520px) lowers #hud-root font floor 11px to 8.5px and --mw-min-text to 8px (console about 1/4 of a 390 px screen). Stills round-twelve/phone-hud-before/after.png (scratch phonehud.mjs: 844x390, hasTouch).
- Phone-portrait top bar merged #159 da68143: hud.css @media (max-width: 600px) hides banner+sky dial, rates, tier name, menu label/F10, pantheon/relic chips, ping; chips min-width 0. Stills round-twelve/phone-portrait-*.png.
- Taunt clear of player list merged #160 1b7dbdf: hud.js clearRoster(card) drops the AI taunt card below the roster when their rects overlap (narrow windows). Still round-twelve/phone-taunt-below-list.png.
- Edge-scroll arrow cursor merged #161 51faf9e: input.js edgeDir()/markEdge(), body[data-edge], hud.css --mw-cur-edge-* vars. Sheet round-twelve/edge-scroll-arrows.png. Context cursors (attack, gather, repair, pray, target) already existed.
- Building selection ring merged #162 5507636: overlays.js aRing is vec4 now (4th = shape, 1 = p8 superellipse); building r = size*0.5+0.38. Any test reading aRing must use stride 4. Stills round-thirteen/building-ring-*.png (scratch looksel.mjs).
- Touch controls merged #164 f448d5c: src/ui/touch-input.js maps tap (left, or right-click order with own units selected), 1-finger drag = middle pan, hold 420 ms then drag = box, pinch = zoom/pan. TOUCH_NOTICE rewritten. Live check scratch touch.mjs (CDP Input.dispatchTouchEvent); software GL is so slow (~1.4 s per event) that the test sets input.touch.holdMs; touches at y<10 hit the HUD menu.
- Touch tooltips merged #165 cea7a76: hold 450 ms on a command button (hud-card CARD_HOLD_MS) or titled element (hover-tip TIP_HOLD) shows the tip, swallows the click; hold judged by event timeStamps at release. CDP taps take ~1 s here, so quick taps only unit-tested.
- Minimap touch merged #166 20384d8: minimap.js touchstart/move/end = left button down/drag/up.
- Installable app merged #167 ea6f76b: manifest.webmanifest + assets/icons (icon.svg rendered by scratch icons.mjs), meta tags; build-site copies it. Trap: build-site --out joins with the repo root, so an absolute path builds inside the repo.
- Trap: a new sfx name must go in SFX_NAMES as well as in the test's DESIGN_NAMES.
- Trap: a background `eslint && npm test | grep` chain exits 0 even when a test fails, so read the pass/fail counts before you commit.
- Checked and already present: research-done alert (alerts.js), waypoint paths for queued orders, command markers, burning buildings, screen shake, hover rings, double-click select, '.' and ',' idle cycling, and the game menu layout.

**Why:** later rounds need to know what landed and what not to redo.
**How to apply:** add each new PR here, and check the code before you pick the next gap.
