# mythic-war-game

> The owner's mythology RTS game (Gods-and-titans repo) - repo, decisions, architecture, hosting, PR state

The owner asked (2026-10-17) for an online multiplayer WC3-style RTS with gods/titans/creatures from world mythologies, worshippers who build towns and pray at shrines to summon them, co-op vs AI or versus.

- Repo: github.com/Modified-Code-SAI/Gods-and-titans (default branch main). Work branch claude/mythic-war-game, draft PR #1.
- the owner chose 3D like WC3 (low-poly Three.js, tilted camera) over 2D.
- Browser game, no build step: plain ES modules, Three.js 0.186.1 and PeerJS 1.5.5 vendored under vendor/ (container can't reach CDNs; npm registry works).
- Online play: host-authoritative sim on the host browser, PeerJS room codes (public broker 0.peerjs.com, ?turn= / ?relay=1 / ?peerHost= options), delta snapshots to clients. Sim is pure JS separate from rendering.
- 10 pantheons: Greek, Norse, Egyptian, Hindu, Japanese, Chinese, Aztec, Celtic, Mesopotamian, West African. Excludes central figures of living monotheistic faiths.
- Economy (WC3-like): 2 miners per mine at once, 1.5 s per 10 gold (13.3 g/s cap); drop-offs keep a 3-tile gap from mines.
- Hosting: GitHub Pages via Actions workflow from main (Pages Source set to GitHub Actions on 2026-10-17). Live: https://modified-code-sai.github.io/Gods-and-titans/
- PR #1 merged 2026-10-17 at the owner's request (early, so he could play online). PR #2 (17 code-review fixes) merged and deployed 2026-10-17. The owner now tests by hand and reports bugs/fix requests.
- Graphics overhaul (PR #3, merged 2026-10-18): HDR post, PBR, new terrain/water/foliage/VFX, Ultra tier; details in [gods-titans-graphics](gods-titans-graphics.md).
- AI retune for the new economy (2 miners/mine) was adopted from wip/ai-balance in the polish PR #4 (worker count sized to mines, earlier 2nd mine, prayLate raised after A/B tests); the pantheon-data edits on that branch were NOT adopted. Pantheon win-rate spread (Aztec/Japanese/Greek low, Hindu/Celtic high) is probably AI god choice/positioning more than unit data.
- DESIGN.md in the repo is the master spec; notes/ holds decisions and cross-owner requests.
- Single-player preview artifact (republish to keep the URL): (link not kept) Artifact pages block WebRTC, so online play needs GitHub Pages. Build it by inlining style.css + src/ui/hud.css into a skeleton-less index.html and publishing src/ + vendor/ as files.
- the owner wants speed without losing quality (2026-10-17): overlap work, give him something playable early.
- 2026-10-17: the owner does manual testing himself and reports issues. Threads should not run long automated playtests or the full local test suite; finish in-flight fixes, let GitHub's automatic checks run, and stop at a safe point, unless he asks for more testing.

**Why:** later threads need these decisions without re-asking the owner.
**How to apply:** follow DESIGN.md; keep sim/render split so look can change.
- 2026-10-18 polish pass (PR #4, merged to main and deployed at the owner's request 2026-10-18): 8 area reviews + fixes, merged and smoke-tested; see PR body for the hand-check list. Dev notes: workflow worktrees fork from the repo default, not the thread branch, so create the worktree/branch yourself from the merged HEAD; PROTOCOL_VERSION now carries a build fingerprint (src/net/wire-version.js) so mixed old/new tabs refuse to join; src/data and src/ui icons must be Emoji <= 11 (test enforces).
- 2026-10-19 repair + upgrades (PR #9, merged at the owner's request 2026-10-19): worker `repair` order (35% of cost per full bar, 75% build time), per-player Auto-Repair flag, 19 per-building upgrades in buildings.js `upgrades` with effect helpers in src/data/upgrades.js shared by sim and HUD; snapshot worker `tk` task drives the HUD task bar. Repairing keeps unit state 'build' so render needs no change.
- 2026-10-19 autocast (PR #10, merged to main at the owner's request 2026-10-19): every fighting unit's abilities autocast by default (u.manualMask, view key `mc`, `autocast` command); AI cast scoring moved to src/sim/cast-choice.js and shared by sim autocast + ai/micro.js; right-click ability button / backtick key toggles manual; neutral creeps keep data defaults; easy AI sets gods/titan manual.
- 2026-10-19 team market + team spawns (PR #11, merged to main at the owner's request): `trade {to,res,amount}` command (src/sim/trade.js, 10% cut rounded up, min 20, teammates only), HUD Market button/panel (src/ui/hud-market.js), AI aid in src/ai/team.js. mapgen startPlan(pc, teams): a team of two switches to a 180° 'teams' layout (pairs share top/bottom edge); 3v1 neighbouring corners; FFA/1v1 unchanged. Always build maps with mapgen.mapOptions(setup) (passes teams) or hashes mismatch.
- 2026-10-21 the owner's four-part request landed as PRs #13 (pop cap 200), #14 (worshipper upgrade lines: `work` effect, `line`/`after`), #15 (soldier ranks, DESIGN 5.9) and #16 (unique pantheons, merged the same day, see [pantheon-identity-system](pantheon-identity-system.md)); #17 (Decade of Peace game mode) landed in between.
