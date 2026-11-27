# rich-kit-celtic

> Pieces, outfit rules and traps from the Celtic rich-character pass (eighth pantheon): tartan, mail, torc, brooch, antlers, flame crown, raven, double axe, torch, tall oval shield, and the drape-winding fix

Celtic pass (draft PR stacked on the Aztec one; outfit file rich-outfits-celtic.js; 10 units: worshipper, warrior, archer, priest (the druid), Woad Raider (the elite), the Dagda, the Morrigan, Lugh, Brigid, Balor; the Cu Sith (quadruped), banshee (spirit), Dullahan (centaur) and battle crow (bird) stay low-poly). New in src/render/models/:

- Gating: `RICH_PANTHEONS` + celtic; `RICH_HEADGEAR` + antlers and flame (the West African Dart Hunter wears antlers: the default outfit draws none until its pass). An outfit's `gear` may return `{build:true}` for a weapon outside `RICH_WEAPONS` (double_axe, torch, so no other pantheon changes); a held piece with a flicker morph becomes a `flicker` attach.
- rich-paint: `tartan({cell,hue,k,cx,cz,r,flat,band})`, `mailSheen(cell,k)`.
- rich-clothing: `addTorc`, `addBrooch` (option `at:{c,n}` sets it on a surface of its own, a cloak collar), `addMailShirt`, `addTrews`, `addArmBands` (the Aztec outfit calls it too); `addCape` and `addChlamys` take `cells` and the cape's options, `addBelt` a height, `addBoots` `{top}`. rich-headgear: `addAntlers` (tines, band, size). rich-regalia: `addFlameCrown` (head bone, flickers), `addRaven` (chest bone). rich-gear: double axe, torch, druid staff, `richShield` options `band` and `roundels`.
- FIX: `addDrape` with `side:-1` was wound the wrong way round and showed its grey inner face; Hindu Durga's pallu changed with it (the only checksum difference to the earlier pantheons). A test checks the team-colored faces of a drape look outward for both sides.

Traps and numbers:
- A tartan cell needs about two vertices per band: 0.1 on limbs, a cloak needs `cells:[14,10]`.
- Corrugated metal reflects as dirt: the mail is smooth with a paint sheen; golden mail is material `lacquer` (a flat clean gold).
- A cloak's collar over mail z-fights into red smudges: collar-less capes for warrior, archer and Lugh.
- `DEFAULT.head` adds a hair cap: the druid and the raider add their own beard instead of calling it.
- The raven at size 1.8 covers the Morrigan's face: 1.25 on the shoulder tip.
- Budgets: warrior 8.3k of 8.5k, Lugh 8.6k of 9k, Balor 13.7k of 14k, the rest 5.0k to 8.0k.
- The Woad Raider is not in the harness formation: spawn one with `--eval` (`h.world.spawnUnit(0,'celtic_woad_raider',x,y,{silent:true,facing:1.45})` beside the warrior) for real-renderer stills (scratchpad run-k-raider.sh).

**Why:** Mesopotamian and West African reuse the tall shield options, antlers, torc and brooch pieces and the same traps.
**How to apply:** read with [rich-kit-pieces](rich-kit-pieces.md), [rich-kit-aztec](rich-kit-aztec.md) and [rich-rollout-status](rich-rollout-status.md).
