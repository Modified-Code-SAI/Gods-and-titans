# finish-loop-waves-2026-11-18

> Waves 3 on of the owner's "find and finish" loop (2026-11-18): each PR, its code names, bench methods and checks

Continues [finish-loop-2026-11-18](finish-loop-2026-11-18.md) (go-ahead, method, waves 1-2).

- Wave 3, PR #209 (merged 6c8b163): Campaign Chapter IV "The Eye of Balor" (Celtic, ids eriu tara samhain tory mag_tuired, chapter id balor_eye), 28 Kokoro clips (bm_george, speed 0.95, venv in scratchpad), map colours, icon. Bench: scratch bench4.mjs (campaignSetup, hero kind ai) Normal 5/5, idle 0/5, Easy 4/5. AI names must be <=20 chars; tests hard-code chapter counts (campaign, campaign-progress, howto).
- Wave 4, PR #210 (merged 31bd421): lobby Starting resources (setup.startPurse plenty/rich, START_PURSES in config, startOf applies it before the twist, lobby.setPurse, menu .mw-purse-group); host-migration replay (prepareHandoff packs extra.replay up to MAX_HANDOFF_REPLAY_COMMANDS 60k, Game.recordOn in adopt); sim-audit --landscape --purse. Landscape audits 2v2 hard seeds 51-53 clean. Shift+train queueing 5 is by design (DESIGN 9), not a gap.
- Wave 5, PR #211 (merged d1ef331): AI play styles (src/data/ai-styles.js STYLES/drawStyle/styleInfo, profiles.js withStyle, AIPlayer.style; lobby buildSetup draws from seed; loading card names it). Bench scratch style-bench.mjs: style vs balanced paired on seeds 700+, Normal 1v1; seat/pantheon bias is large, compare with a 'none' baseline run.
- Wave 6, PR #212 (merged 4693aac): menu-quit host finished its recording (countLeave) before handOff's last copy; quitCarry fixes it. rematch-check now asserts Watch Replay on both friends after the move; online-audit chat check polls 10 s (was flaky).
- Wave 7, PR #213 (merged 7401fda): Campaign Chapter V "The Eight-Headed Serpent" (Japanese, ids izumo fox_shrines eight_valleys river_gates orochi, chapter id serpent, ally Chinese "Jade Emperor's Guard"). Bench Normal 5/5, idle 0/5, Easy 3/5. Whisper check (tools/narration/check.py, faster-whisper in the kokoro venv) mean 0.967.
- Waves 8 on (lobby AI styles, Chapters VI and VII, handicaps, Guardian walls): [finish-loop-waves-8-on](finish-loop-waves-8-on.md).

**Why:** later waves need to know what landed and how it was checked.
**How to apply:** add each wave's PR here; check before picking the next gap.
