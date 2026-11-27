# far-zoom-traps

> tools and traps from the far zoom work: shot-zoom.mjs options, the harness late scenario, static server, foreshortened heights, stale far flags, merge surprises from the intro film

**Tools.** `tools/shot-zoom.mjs`: the same view at any distances (`--dists`), levels `--lod auto|full|far`, `--sel army`, `--fow` (looks as player 0 with fog of war on), `--at X,Y`, `--quality`, `--tod`, and a cost table (calls, triangles, frame time). The harness has a `late` scenario (four AIs, ten minutes, 231 units). `tools/shot-intro.mjs` takes stills of the intro film. The repo's node_modules has no http-server: start `python3 -m http.server PORT` in the tree first and the tools use the server that answers ([render-shot-workflow](render-shot-workflow.md)).

**Traps.**
- Heights on the screen are foreshortened by cos(pitch), so the marker rule uses the projected foot to head span, never the distance alone.
- A unit off the screen keeps its last `far` flag until it is seen again, so a test must count only units in view.
- The harness `sel=` option needs one frame before the view knows the entities; `--at` is clamped by the camera's target limits.
- A unit's model `height` is measured from the ground, so a flyer's marker must subtract the hover.
- Software GL milliseconds are relative only; calls and triangles are exact.
- A PR that lands later can add a camera mode (the intro film's `setFree`): compare stills before and after (pixel diff against a main worktree) and hold the film on the old look.

Back to [far-zoom](far-zoom.md).
