# peace-zone-checks

> How the Decade of Peace no-build zone (PR #51) was checked: tests, the tint that was invisible at first, and the real-UI recipe (spawn a scout, wallTip, errorEl)

For any later change to [peace-no-build-zone](peace-no-build-zone.md):

- **Tests**: tests/sim/peace-build.test.js (11, sim rule), tests/ui/placement.test.js (client ghost vs `placementError` over a sweep of every site), tests/ui/input-placement.test.js (zone sent once, tip, refused click), tests/render/game-renderer-parts.test.js (`zoneMask`, mesh, layer), tests/ai/ai-peace.test.js (mutation-checked: switching the rule off makes the sim and AI tests fail).
- **Look trap**: the first tint (alpha 0.075 to 0.15, rim 0.1 tile) was nearly invisible over foliage in the real renderer. Now 0.12 + 0.17 hatch with a 0.2-wide pulsing rim, and quads share edges (no inset, so no grid seams). Judge any tint change from stills (render harness `tools/render-harness.html?manual=1&scenario=base&reveal=1`, `h.renderer.setNoBuildZones([...])`, `h.renderer.showPlacement(...)`), not from tests.
- **Real-UI recipe** (Playwright, software GL, quality low via localStorage `mythicwar-settings`): title, "Play vs AI", click `.mw-seg[data-mode="peace"]`, Start; spawn my own worshippers next to the enemy Town Center through `__game.session.world.spawnUnit(0, 'worshipper', x, y, { silent: true })` and `__game.session.ticker.run(6)` so it is seen; select it, B then H; hover over ground; read `__game.input.wallTip`, `__game.renderer.placement.zone.mesh.visible`; click a refused spot (message is in `__game.hud.errorEl`, not `.hud-msg`). Jump the end of the peace with `w.tickCount = Math.round((w.peaceEnd - 1) / 0.05)`.
