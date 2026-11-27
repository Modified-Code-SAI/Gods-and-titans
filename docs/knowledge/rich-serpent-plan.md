# rich-serpent-plan

> Serpent, hydra and eastern dragon rich models (7 units): bones, skin blend, hydra neck cap by class, costs

Units: Apep, Xiuhcoatl, Onini, Ninki Nanka (serpent/dragon bodies), celestial dragon, Tiamat, Yamata no Orochi (hydra, 8 necks). Files `rich-serpent.js` and `rich-reptile-heads.js` (REPTILES has `serpent` and `dragon` skulls, exports `backTone`); motion `applySerpent` / `applyHydra` in rich-creature-anim.js. Part of [rich-creatures-plans](rich-creatures-plans.md). PR #39 (draft, stacked on #38); stills in (an off-repo folder, not kept)

Serpent/dragon: one loft down a 12-station SPINE on bones root, s0 (base), n1..n3 (neck), head, jaw, b1..b7 (tail) plus dragon legs. Skin = `mixBind(backBind, frontBind, smoothstep(dB - dF))`, two `alongPath` chains whose polylines run past the last bone. Wave runs down the b bones from `m.wavePhase`; the neck rears from `st`. Winged dragons, weapons and other extras stay low-poly (`serpentSupported`).

Hydra: mound `body`, tail t1..t4, four legs, each neck `h<i>a/b/c/h/j`; a neck and head cost 960 triangles on a 4.25k body, so `HYDRA_NECKS` = titan 9, creature 6, minion 4 (a hydra over the cap keeps its low-poly model).

Costs (triangles): Onini 3.7k, Apep 5.0k, Xiuhcoatl 5.9k, Tiamat 8.0k, celestial dragon 9.5k, Ninki Nanka 9.6k, Orochi 11.9k; builds take 20 to 100 ms.

Framing for unit stills (shot-characters `--scenes unit:<id>@<dist>~<aim>`): apep `@16~-1`, xiuhcoatl `@10~-0.5`, onini `@6` to `@8`, ninki nanka `@16~-1`, orochi `@16~-1`, celestial dragon `@11~-3` (it flies), tiamat `@16~-1`.
