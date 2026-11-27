# rich-kit-chinese

> Pieces, outfit rules and traps from the Chinese rich-character pass (sixth pantheon): upright monkeys on the humanoid rig, mirror armor, crossbow, pennants, ribbons, lean-detail options and the triangle trims that fixed the budget

Chinese pass (stacked draft PR on Japanese #31; outfit file rich-outfits-chinese.js, 11 units: worshipper, warrior, archer, priest, crossbowman, clay warrior, Sun Wukong, Guan Yu, Chang'e, Pangu, monkey clone; Nuwa, lion, fenghuang, dragon stay low-poly). New in src/render/models/:

- Gating: `RICH_BEAST_BIPEDS = new Set(['chinese'])` in rich-humanoid.js lets the body `beast_biped` (Monkey King and clones) be built on the humanoid rig; other pantheons' upright beasts (Hindu vanara) stay low-poly. `rig.leftElbow` is 1 when the left item's `gear` style has `crossbow` (carried level, elbow square).
- rich-headgear: `addDouli`, `addScarfCap`, `addCnHelm` (plume bell starts above the brow band so steel shows), `addDaoguan`, `addPheasantCrown`, `addFillet`, `addLongBeard` (hangs on the chest via `mixBind(head, chest)`), `addHairpins`, `addMoustache` (split out of `addBeard`), `addCrescent(...,{coil:false})`.
- rich-clothing: `addJiaoling` (`lapel:false` under a cuirass), `addWideSleeves`, `addSash`, `addMingguang` (four mirror discs), `addTunjian` (shoulder beasts), `addWrapSkirt`, `addFurCuff`; leg garments `addTrousers`, `addLegWraps(steps)`, `addAnkles`, `addHem` are shared with the Japanese.
- rich-regalia: `addKaoqi` (four pennants on poles, chest bone), `addPibo` (ribbons on the cape bones, they float). rich-gear: halberd (`guandao:true` for the crescent blade), crossbow (`magazine`), Ruyi staff (`staff:'ruyi'`), yue axe. rich-arms: crane fan (`fan:'crane'`), lantern offhand.
- Lean-detail options keep defaults unchanged: `addPauldrons(...,{sides,rings})`, `addMirrorDisc({sides,caps})`, `addLegWraps(...,steps)`.

Traps and numbers:
- First Chinese soldier was 10.5k triangles (mortal budget 8.5k). Cuts that worked: shield studs cost 40 each (dropped), shield sides 18 to 14, no hair cap under a helm or scarf, coarser pauldrons and discs, plume 8x24 to 6x18, kaoqi shafts. Now: warrior 8.1k/8.5k, Guan Yu 8.9k/9k (tightest), Wukong 8.9k/9k. Measure with scratchpad `layertris.mjs` (per layer) and `helpertris.mjs`.
- A global string replace in rich-gear.js hit `spear` too (same shaft text): always check the checksum diff of older pantheons after touching shared builders.
- Bare arms need `end:'round'` at the shoulder or the open tube shows as a flat paddle (clone). The shared `helmShell` covers the eyes for every helmeted unit (Norse and Greek too): known look, invisible at game zoom.
- Pangu got a team-colored sash: titans otherwise have no team color in the body mesh.

**Why:** the next pantheons (Aztec, Celtic, Mesopotamian, West African) reuse these pieces and the budget lessons.
**How to apply:** read with [rich-kit-pieces](rich-kit-pieces.md), [rich-kit-japanese](rich-kit-japanese.md) and [rich-characters-rollout](rich-characters-rollout.md).
