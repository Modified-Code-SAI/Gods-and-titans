# west-african-look-traps

> pattern-density limits, the failed iterations, the team-color rule and the deliberately darker skin from the West African character pass

From the West African look pass (the pieces themselves: [rich-kit-west-african](rich-kit-west-african.md)).

- Vertex-color patterns need at least two vertices a band. Kente wrappers are 48 sides round × 12 rings down with a 0.09 strip; mud cloth is cell 0.13 on the body, 0.09 on the sleeves with 9 rings. Mud cloth failed three ways first: diamonds blurred, bars-and-dots read as a sawtooth or a zebra, big cells as a striped sweater. Ladders of bars with dashes between reads as bogolan.
- An embroidered front painted on a robe blurs. The agbada's bib is two `kit.sheet` panels (an edge, then a face) laid on the robe at `torsoRing` f 1.0 down to 0.44/0.5, with +0.012 extra clearance near the top or the tunic pokes through at the neck.
- A fly whisk of strands all round reads as a cage or a claw, and a sheet shell of hair as a black bell. It is nine strands fanned toward +x (the direction the hand hangs it), chestnut, every other one lighter.
- A fur mantle under a smock vanishes: the Dart Hunter's leopard is `addCape` with `jaguarSpots(0.1)` on cells [12, 14]. At 0.075 on [10, 12] the rosettes did not show at all.
- Every earlier pantheon's tests require some of the team's color on every unit. Ogun (iron and palm fibre) and the Aziza (leaves) had none, so Ogun got a team under-skirt, waistband, helmet band and pauldron trims, and the Aziza a team sash.
- The people's skin is deliberately #6b4630 with black hair, set in the outfit's `palette`: darker than the shared default and darker than their own data (#c8a07a, the Dart Hunter included). The gods keep their data's colors.
- Budgets: Oya 8.2k of 9k (god), Dart Hunter 7.9k of 8.5k (mortal), Anansi 9.4k of 13k (multi_arms), the rest 5.9k–7.2k.

**Why:** these cost five gallery rounds to find; a later pass that adds cloth patterns or a held piece hits the same limits.
**How to apply:** check a new pattern's cell against the garment's ring spacing before rendering, and give every unit some team color.
