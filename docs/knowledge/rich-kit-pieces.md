# rich-kit-pieces

> Shared rich-character pieces from the Greek, Egyptian and Hindu passes (heads, headgear, clothing, extra arms, flame arch, skinPaint hook) and the gallery sheet camera params, to reuse in the next pantheon passes

Reuse before writing new geometry (all in src/render/models/):

- rich-heads.js: `BEAST_HEADS` (the animal heads a unit may use and still be `richSupported`), `jackal` (Anubis; Set has squared ears and an ember eye, found by `/(^|_)set$/` on the unit id), `falcon` (Ra), `sideEyes`, `skullZ`. A new animal head goes here and into `BEAST_HEADS` (built: jackal, falcon, monkey, crow, demon; the Japanese pieces are in [rich-kit-japanese](rich-kit-japanese.md), the Chinese ones in [rich-kit-chinese](rich-kit-chinese.md)); built on the head bone from `headStations(D)` (rich-body.js).
- rich-headgear.js: nemes, uraeus, sun disk, double crown, plumes, laurel, crown, tall crown. Add kabuto and horn variants here; the dispatch list is `RICH_HEADGEAR` in rich-humanoid.js.
- rich-clothing.js: `addLongSkirt`, `addWaistBelt`, `addShendyt` (pleated kilt and apron), `addCorselet`, `addUsekh` (collar as one lofted strip per row), `addWraps` (real bandage geometry: paint on a limb is too coarse for stripes), plus the Greek chiton, peplos, drape, pteruges, greaves.
- rich-regalia.js `addTail(E,{color,len})`, rich-arms.js (trident, bolt, scepter, scythe, conch, ankh), rich-gear.js `richShield(ctx,D,style)`; unknown weapons fall back to the low-poly rigid piece in `heldPiece`.
- Outfit hook `skinPaint(E)` in a pantheon outfit returns a vertex paint for the bare skin (the Mummy). Outfits register in rich-outfits.js `OUTFITS`.
- A vertex paint can change only r/g/b, team and glow, not the material class; a stripe in the team colour is `recolor(o, TEAM(k))` from rich-paint.js. Detail finer than a vertex spacing needs real strips.

Gallery (tools/gallery-units.html, shot with scratchpad galw.mjs or the page directly): `sheet=1&cols=1` is the contact sheet; only there do `dist` (camera distance in unit heights) and `aim` (look-at height in unit heights) work; `facing` 90 faces the camera, 25 to 40 is three quarter. Full body `dist=2.5&aim=0.55`, head `dist=1.2&aim=0.95`. The sheet centres on the model's box, so a winged unit's head sits off to one side: use `facing` 60 to 90.

Hindu pass (PR #30) added: `MeshKit.placed(matrix, fn)` (build a piece in its own frame, put it in the same mesh); rich-regalia `extraArmsPiece(E, pairs)` (two extra pairs on the chest bone, items from `richWeapon`/`richArm`; units with `multi_arms`), `addTail(E,{kind:'monkey'})`, `addPrabhavali(E)` (flame arch behind the head, head bone, flickers); rich-heads `monkey`; rich-headgear `addTopknot`, `addCrescent`, `addKirita`; rich-clothing `addDhoti`, `addCharAina`, `addGarland`; rich-arms mace, discus, drum, lotus, flame (`RICH_ARMS`, `RICH_OFFHANDS`). Traps: `shadeC` on a TEAM colour gives grey (use the module-private `shade` in rich-clothing), `dye` with a TEAM colour gives NaN (use `recolor`), and `tongue` in rich-regalia takes `n`, `rings`, `cap` to go cheaper.
Each pantheon's old god costume has a signature piece (unit-bodies.js `REGALIA`: usekh, mantle, halo, banner, flags, fan, torc, fleece, beads, fibula): the first Hindu stills showed it missing, so give every rich pantheon its counterpart (Mesopotamian fleece, West African beads; the Japanese banner and rings, the Chinese kaoqi pennants, the Aztec fan of plumes and the Celtic torc are done, see [rich-kit-aztec](rich-kit-aztec.md) and [rich-kit-celtic](rich-kit-celtic.md)) and compare gods before and after.

**Why:** each pantheon pass should add a few pieces to the kit, not rebuild them.
**How to apply:** read this and [rich-characters-rollout](rich-characters-rollout.md) before starting the next pantheon; add the pieces you build here.
