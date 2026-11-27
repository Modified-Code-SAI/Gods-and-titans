# pop-cap-200

> Population limit 200 (PR #13): AI army caps are shares of POP_MAX, scale numbers at 4x200 pop, how to re-measure, test gotchas

The owner asked (2026-10-21) for a population cap of 200 (was 150); PR #13 sets POP_MAX in src/config.js. It was squash-merged at his request the same day (e421b2e) and is live on Pages. Everything else follows that constant.

- Supply: Town Center 12 + House 8 (10 with Large Families), so 24 Houses reach 200 (19 with Large Families). Nothing else supplies pop.
- AI profile armyCap = share of POP_MAX (easy 0.4, normal 0.8, hard 0.93). Normal and hard AIs fill 200/200 at about minute 12-14 (24 Houses placed fine in 2v2, FFA and solo); easy stays near 100-115.
- At the limit the train error and command card say "Population limit reached (200)."; below it the old "Build more Houses." text.
- Scale check, 4 players at 200/200, 2v2, ~520 entities, hard AIs: host step about 3.3 ms per tick (p99 ~8 ms of a 50 ms budget), ~35 KB/s per client, delta ~1.8 KB average, first full snapshot ~74 KB. Natural 16 min AI game: 16.5 KB/s per client. Re-run with `node tools/net-bandwidth.mjs --fill=200 --minutes=3 --difficulty=hard --quiet`. Client GPU cost at 500+ units was not measured.
- Gotchas: a solo-AI test must keep the idle opponent alive (hp = 1e9) or the game ends before the AI reaches the cap. Feature PRs update DESIGN.md but not notes/decisions.md (merge-conflict hotspot when threads run in parallel). Other hotspots: the config import in src/ui/command-card.js and the end of tests/ui/command-card.test.js, where every feature appends tests (these two conflicted with #14).

**Why:** later threads touching population, AI caps or net scale need these numbers without re-measuring.
**How to apply:** change POP_MAX only in config.js; see [mythic-war-game](mythic-war-game.md) for the stack and decisions.
