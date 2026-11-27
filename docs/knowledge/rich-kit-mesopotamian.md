# rich-kit-mesopotamian

> Pieces, outfit rules, numbers and traps from the Mesopotamian rich-character pass (ninth pantheon): kaunakes, fringe, scale coat, cone helm, horned crowns, curled beard, fish hood and cloak, water streams, sling, pear mace, arched wicker shield

Mesopotamian pass (draft PR stacked on the Celtic one; outfit file rich-outfits-mesopotamian.js; 10 units: worshipper, warrior, archer, priest, Slinger (elite, `mesopotamian_slinger`), Marduk, Ishtar (winged), Enki, Nergal, apkallu; Tiamat, scorpion man, Anzu, lamassu, bull of heaven, ugallu, mushussu and the ram stay low-poly). All kit changes are additive with unchanged defaults: checksums of the eight earlier pantheons were identical.

- Gating: `RICH_PANTHEONS` + mesopotamian; the game-renderer-detail test now names `west_african` as the pantheon without the new characters.
- rich-clothing: `addKaunakes` (tiers of fleece flounces with rounded tufts; returns its lowest row), `addFringe(kit, bindFn, points, {len,color,r})` and `addDrape` option `fringe:{color,n,len,r}`, `addScaleCoat`, `addFishCloak`. rich-headgear: `addConeHelm` (flap option), `addHornedTiara` (`tiers`, `star`, `horns:false` for a plain cap), `addCurledBeard`, `addNapeBun`, `addFishHood`. rich-regalia: `addWaterStreams` (cape bones, glowing). rich-arms: mace `head:'pear'`. rich-gear: sling (the `whip` case; the outfit's `gear` returns `{build:true}`), `richShield` options `arch`, `pattern:'wicker'`, roundel `x` and `sides`.
- West African can reuse: `richShield` arch/wicker/roundels (tall shield), `addFringe` and drape `fringe` (raffia, tassels), `addHornedTiara` without horns as a cap, the sling pattern for `gear build:true`.

Traps and numbers:
- A hair cap under a pale cap shows as black marks: the priest is shaved (no hair cap), the cap sits 0.007 head-sizes off the skull and gold rings on it need 0.012 (they z-fight otherwise and read as dashes).
- Curls vanish in black hair: `beardOf(pal)` mixes the hair a third toward brown. Red tassels on cream read as blood: use wool or gold, thickness 0.0045.
- Crown horns: chunky, standing out from a short cap (thin horns on a tall cap read as a bucket). A cloak that hugs the back vanishes into a skirt: the fish cloak stands off it.
- The wicker shield is 1.15k triangles (24 face sides, 8-sided studs; 12-sided studs 1.44k, 36 sides 1.73k).
- Budgets: Ishtar 8.8k of 9k (four wings of 0.4k plus her sword), warrior 7.7k of 8.5k, Enki 8.2k of 9k, the rest 5.1k to 7.9k.
- Hair: the people's `palette` is black; gods and the apkallu keep their own. Team color: shawl, cloak, helm flap, headband, shield face, the apkallu's crest and tail.
- The Slinger is not in the harness formation: spawn it with `--eval` beside the warrior for stills.

**Why:** West African is the last pass and shares the shield and fringe options.
**How to apply:** read with [rich-kit-celtic](rich-kit-celtic.md), [rich-kit-pieces](rich-kit-pieces.md) and [rich-rollout-status](rich-rollout-status.md).
