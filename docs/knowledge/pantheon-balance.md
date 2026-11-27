# pantheon-balance

> Pantheon balance pass (PR #88, merged 2026-10-29): god powers decide AI games, power-bench + tournament method, results, traps

Wave 6 item 20 of the owner's improvement loop (`engagement-research-2026-10-28` (process note, not kept)). PR #88 evened the ten pantheons from 25-72% to 40-62% AI 1v1 win rate (720 games, seeds 1-8, Normal + Hard, small map). Full change list: notes/decisions.md `[balance]`; method: DESIGN 4.11 "Numbers".

- **God powers decide most AI games**, the City cataclysm above all. An army bench (late armies on open ground) did NOT match the tournament; cataclysm lethality did. A single cataclysm tweak moved Greek 56% to 17% and Celtic 25% to 68%.
- `tools/power-bench.mjs` scores every strike/cataclysm on a carpet of 150 20000-hp soldiers (kept: Town 4,400-6,900, Crows 3,250, City 26,400-52,000); it removes neutral creeps and holds the soldiers, or creeps add damage and pull them off the carpet. The sim re-derives unit stats mid-run (maxHp back to normal), so the bench resets and skips such a unit; an enemy of the caster's own pantheon gave a fake 4x number before that fix.
- `tools/ai-tournament.mjs --seeds=1-8 --diff=hard --workers=2` and the same with normal, run side by side on 4 cores: about 50 min for 720 games. The sim is deterministic (same data = same results), but chaotic: one 360-game run swings a pantheon up to 10 points; judge on 720.
- Trap: editing src/data while a tournament runs is safe for its workers (loaded at start) but not for a chained second run; use a separate worktree for a baseline.
- Pyramid Builders now +25% tower damage instead of +2 building armour (stacked with Eye of Horus).
- Audit scripts and raw before/after JSON: (an off-repo folder, not kept) and (an off-repo folder, not kept)
- Still slightly high/low after the pass: Hindu 62%, Japanese 40%, West African 42%.
