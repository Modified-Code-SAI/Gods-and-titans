# rich-centaur-look-traps

> Traps from the centaur pass: detached root parent bug, rigid held head lying sideways (palm pivot bone), cape through the barrel, equine neck bulge, belly patch, person scale, first-seen-dead NaN, still framing

Traps from the centaurs pass ([rich-centaur-plan](rich-centaur-plan.md)):

- `createBones`/`addBones` look a parent up by name in `spec.ix`; a name that is missing gives an `undefined` parent and the bone is silently detached (no error). Symptom: rigid held pieces drew at the origin and hand bones sat at world (0,0,0). `addCentaurBones` starts `spec.ix = { root: B.root }` for that reason. Check any new bone chain with a world-position dump of its bones.
- A rigid held piece follows the hand's whole rotation. The Dullahan's head lay sideways with its hair along the forearm in attack and cast. Fix: a pivot bone at the palm (`addPalmBone`, `spec.ix.carry`) whose local rotation is the inverse of the hand's world rotation (read after the arm poses) times a small sway; the piece is built upright in the bone's frame (`style.pivot`).
- The equine build's barrel runs on to a neck and bulged in front of the person's belly; the centaur's `HORSE.body` stations end at x 0.37 and the cap depths are `[L*0.1, L*0.05]`. The belly's lighter tint also showed as a pale patch in front: `furPaint` takes `bellyEnd` and the barrel fades the tint out past u 0.62 to 0.86.
- A cape longer than ~0.42 hangs through the horse's barrel behind the rider (the Dullahan's is `len 0.42, wide 1.12`) and a long flag-like cape at the gallop looks stiff: `drag = -0.5 fl - 0.25 lean`, `fl` eased toward 0.55 moving.
- The low-poly person's size reads small on a big horse: the rich person is 1.12x (`CENTAUR_PERSON`, rich only). Low-poly output stays vertex-identical because `PROFILES.centaur` holds the same values the old inline code had.
- Team colour: the Centaur with only a baldric (two thin straps) was 2.7 % of the top-down area and vanished at the game's zoom; both centaurs wear the saddle cloth (a small pad behind the rider) and the Greek one keeps the baldric the quiver hangs from. The Greek coat is a buckskin (`mixC(skin, primary, 0.4)`): the skin's own tan read as one body with the rider. `teamcount.mjs` (scratchpad) prints the team share of the top-down area per unit.
- A centaur first animated in state `dead` had no arm keys (quadPose returns before writing them), so the arms went NaN; `quadPose` now writes rest arms first when `T.aRz` is undefined. The game never does this (corpses were animated before), tests do.
- Death uses the rig group's topple, 1.2 rad for the `centaur` kind (not 1.45), so a dead centaur's minY goes about -1.2 to -1.8 in a world-space check: it is the whole rig lying down, not a bug.
- Gallery stills use `facing=0` for a side view and `state=attack&phase=0.45`; the film strip param is `film=` (times). Framing for `lone.sh`: Centaur dist 6 dy -0.8 (11 zoomed out), Dullahan dist 8 dy -1.0 (13), facing 0.3.
