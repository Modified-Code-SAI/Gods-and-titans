# message-feed-traps

> Traps and the check recipe from the message-feed card work (PR #59): the this.card clash, shared keyframes, reduced-motion specificity, slide-in vs window checks, sandbox backdrop

From [message-feed-cards](message-feed-cards.md):

- The Hud constructor owns `this.card` (the command-card array): a method named `card` clashed (TypeError). A sandbox built with `Object.create(Hud.prototype)` hid it; the unit tests and the real game caught it. The method is `feedCard`.
- `.hud-msg.is-alert { animation: … }` (specificity 0,2,0) beats the reduced-motion override `.hud-msg { animation: none }` (0,1,0) even though the media query comes later: Codex's P2 on #59, reproduced in Chromium (`newContext({ reducedMotion: 'reduce' })`, then `getComputedStyle(el).animationName`). The override now names `.hud-msg.is-alert`; tests/ui/hud-feed.test.js reads hud.css and fails if a `.hud-msg.is-*` rule with its own animation is missing from it.
- `@keyframes hud-msg-in` is shared by the tips, the checklist and the market panel: keep it when rewriting the message CSS.
- The fake DOM has no `firstChild`: use `children[0]`.
- A card that has just come in or was re-appended (the ×N repeat) starts 1.8em left of the window, invisible, on purpose. A "stays inside the window" check must first wait for the feed's `document.getAnimations()` to finish, or it fails on a card mid slide-in (software GL is slow enough that the idle alert refires between stills).
- `#game-root` has an opaque background in hud.css: a CSS sandbox page over a screenshot backdrop must not use that wrapper.

Check recipe: a sandbox page for the look (stills at 720p, 1080p, far zoom, frozen animation frames); then a real-game Playwright run (Play vs AI, `window.__game`, `session.ticker.run(520)` for the real idle alert) that measures the cards against `.hud-bottom`, `.hud-workers`, `.hud-minimap`, `.hud-hint` and `.hud-god` at 800x600, 1024x768, 1280x720, 1920x1080, 2560x1080, 3440x1440 and the 170-tile zoom, plus no console errors. Freeze the cards for measuring with `hud.arm = () => {}` and clearing `_timer`. A full stack of six takes about a third of the window height at the left edge. Nobody has judged it on a real GPU.
