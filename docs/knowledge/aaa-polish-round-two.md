# aaa-polish-round-two

> Round two of the owner's AAA polish (2026-11-05): remains #124, weather #125, unit replies; code facts and traps

The owner said "Proceed" after round one ([aaa-polish-pass](aaa-polish-pass.md)). Ranked: 1 battlefield remains, 2 weather, 3 unit replies (synth grunts/war cries, ship only if measurements say clean). Merge on green under his standing go-ahead (`pr-merge-workflow` (process note, not kept)).

- #124 merged (f024687): src/render/remains.js. CORPSE.hold 14 s, corpseCap per quality, pose frozen after 1.3 s; RubbleLayer + scorch blobs, 75 s, cleared by a new building. shot-render `remains`. In tests/tools kill with world.killEntity (hp = 0 does nothing).
- #125: src/render/weather.js. Seeded 200 s spells, calm 240 s, CLIMATES per landscape (snow only Highlands), applyWeather on the atmosphere state before applyAtmosphere, WeatherLayer GPU rain/snow; `weather` setting; ambience rain layer (level unmeasured). shot-render `weather`, harness `weather=`.
- #125 merged 4d785f2. #126 merged 54f39b5 = unit replies (src/audio/sfx-voices.js: formant voices worker/soldier/god/creature/titan x select/ack/attack; unitBark + BarkGate; InputController.bark). Levels from loudest-100ms RMS; reel (an off-repo folder, not kept); not listened to. All of round two merged; awaiting the owner's listen.
- Trap: streak quads built from a screen direction flip winding; use DoubleSide or they vanish.
- Local env: fresh container lacks eslint deps; `npm i --no-save --ignore-scripts @eslint/js@9.39.5 eslint@9.39.5 globals@17.0.0 esbuild@0.28.2`.

**Why:** a later thread continuing the pass needs what landed and the traps.
**How to apply:** pick up at the first item not merged; update as PRs land.
