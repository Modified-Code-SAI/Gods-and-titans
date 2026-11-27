# terrain-render-gotchas

> Traps, numbers and open follow-ups from the terrain and water work (outcrop tuning, glints, bump artifacts, shader patch order)

Learned while building [terrain-ground-field](terrain-ground-field.md):

- Sim rock clusters are tiny (at most 6 tiles, many 1-wide strips): blur the rock distance lightly or outcrops never rise. The camera never gets closer than distance 10, so outcrops need to be about 0.7 tall to read.
- The sun sits behind the camera, so a plain specular lobe on the water never shows: glints use a "virtual light" mirrored in z.
- Screen-space bump derivatives (dFdx) make checker and hatch artifacts on edge-on cliff walls: keep FACE bump small and fade bump at the shelf seam.
- Layer switches need blends, not steps: a hard BED/sand switch at the waterline left a dark outline outside the foam.
- Patch order stays `patchWorldMaterial` before `patchFowMaterial`; screenshots go black with fog of war unless `reveal=1`.
- `screenToWorld` starts its ray above `field.hMax`, otherwise picks over outcrops land on the wrong ground.
- A map without `heights` (the flat stand-ins in tests and tools) has to be cached by its own `heights` value (undefined), not by the fallback array, or every `heightAt` call rebuilds the field (about 60 ms on 96x96). Codex found it two minutes after #22 merged; fixed and tested in PR #23 (merged, squash 6160e3b).
- Numbers: terrain about 295k triangles on the small map, 524k on medium (chunk culled); field build 0.25 to 0.45 s.
- Open follow-ups: shore stones belong to the Trees step; at golden hour the sand can read salmon (Lighting tuning); many glints at full day (could thin); outcrop strata read as stylized marbling.

**Why:** each of these cost an iteration; a later pass (buildings step, retuning) should not repeat them.
**How to apply:** check them before changing terrain shaders, outcrop shapes or water lighting.
