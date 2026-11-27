# time-of-day-system

> Day/night cycle in gods-and-titans (src/render/atmosphere.js): how it is driven, uniform names, tuning workflow, gotchas for anyone touching lights, haze, post or shaders

Built 2026-10-21 by the Lighting and atmosphere thread (PR #20, merged to main as 33d22e6 the same day on the owner's "Merge it.") as step 1 of [graphics-overhaul-plan](graphics-overhaul-plan.md). Render-only: the hour is a pure function of the sim clock in snapshots (`vs.renderTime`), so every client agrees and sim/net/protocol are untouched. DESIGN.md section 8 has the full description.

- `atmosphere.js` (pure math, runs in Node): `DAY_SECONDS` 900, match opens 08:00 (golden), 8 keyframes (golden, day, afternoon, dusk pink-lilac, blue hour, teal night, violet predawn, peach dawn). Key light = sun by day, moon at night, swapped at hours 20.0 and 4.7 where its intensity is 0; key elevation never below 14 degrees so shadows do not graze. Setting `timeOfDay` (default `cycle`; also golden/day/dusk/night/dawn); `?tod=night` or `?tod=18.5` in the URL holds one time for a page load.
- Retune in a live page: `(await import('/src/render/atmosphere.js')).tuneLook('dusk', { key: '#ffaeb8' })`; fields are listed in the FIELDS table in atmosphere.js. Colors are authored as display hex.
- Shared uniforms in shading.js `WORLD_UNIFORMS` (mutated in place, never cloned): uSunDirW, uSunColor, uMoonDirW, uMoonColor, uSkyZenith, uSkyHorizon, uSkyAmbient, uGroundAmbient, uRimColor, uNight, uLamp, uShaft, uLampSpot[8] (`setLampSpots`). Building GLSL can use them because the world patch's declarations come right after `#include <common>`.
- Key light intensities are big (up to ~9 at dusk, noon about 3.4, moon about 3.6) because a low light's cosine factor is small; anything that wants a normalised sun colour should not use uSunColor raw.
- Haze: `hazeNear`/`hazeFar` are offsets beyond the point the camera looks at (fog = camera.distance + offset), so zooming out does not fog the middle.
- Low has no post pass: the grade (highlight/shadow tint) is multiplied into the light colors instead. Medium and up carry grade, glow veil and bloom in post.js composite.
- `updateLook(true)` runs inside the GameRenderer constructor BEFORE `this.camera` exists, so it must tolerate a missing camera.
- Screenshots: `tools/shot-lighting.mjs --tods 8,19,22.5 --scenes world,hall,far --quality high --canvas`; software GL times out on high/ultra unless `--canvas` captures in the draw's own task.

**Why:** the terrain, trees and later building/unit threads must light things the same way.
**How to apply:** read uniforms by reference, add new lit materials through patchWorldMaterial, check dusk and night after any color change; pale sand and bare soil read salmon at dusk if their albedo is warm.
