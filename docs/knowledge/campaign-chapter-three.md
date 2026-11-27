# campaign-chapter-three

> Campaign Chapter III "The Sea of Chaos" (PR #104, merged 2026-10-29): Egyptians vs Akkad and Tiamat, mission ids, guard spawns, balance, bench and pkill traps

Squash-merged 2026-10-29 (b3424ea). Follows [campaign-chapter-two](campaign-chapter-two.md). Built 2026-10-29 under the owner's standing merge go-ahead (`engagement-research-2026-10-29` (process note, not kept)).

- Chapter id `chaos_sea`, pantheon egyptian; opens when vigrid is won. Missions: delta (Temple, god, raid on tagged storehouse 'granary'), siwa (hold 2 sites 90 s, limit 1080; seed 7301 because on 7302 an Easy hero never reached the sites), karnak (survive 600, protect 'flame', waitFor hold, Bennu at 285), sinai (army 14 reveals destroy 'gate' towers; bonus kill 'lamassu' guard spawn), eridu (conquer Normal + Easy Mesopotamian with Norse ally "Jarl of Hordaland"; Tiamat at 780 `always`, brood on 'tiamat_brood', waitFor tiamat).
- New spawn option `guard: true` → `u.cGuard`; src/ai/scan.js treats cMarch or cGuard as scripted (never ordered). Without it the AI took idle spawns into its army.
- Balance: Normal wins all 5, idle loses all 5, Easy wins 1-3.
- Bench traps: world.events piles up unless cleared (getSnapshot clears it), so set `w.events = []` each tick in a headless loop. `pgrep -f X` / `pkill -f X` match the calling shell's own command line: an until-loop on pgrep never ends and pkill kills your own shell (exit 144).
- Kokoro: 28 clips rendered only for missing lines; still not heard by a human. Screens: (an off-repo folder, not kept)
