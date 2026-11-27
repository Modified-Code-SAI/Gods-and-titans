# ai-ally-callouts

> AI allies place Attack/Help markers plus a team line when a wave sets out or their base is attacked (wave 15 finding 7, 2026-10-30): rules, knobs, code map

Wave 15 finding 7 of the owner's improvement loop (`engagement-research-2026-10-29` (process note, not kept)): AI allies only answered marks, never called out. PR #113, squash-merged 2026-10-30 as 456f4b1 on the standing go-ahead. Codex found one real P2 (a defence was marked called before its threat qualified), fixed in abe3983 before the merge.

- `AIVoices.callOut` (src/ai/voice.js) reads each AI's `mil` and `threat` through the `ais` Map HostSession now passes as createVoices' third argument (entries are createAI handles `{ai, tick}`, so it unwraps `.ai`).
- Attack: `mil.waves` grew and phase past `assemble` -> marker at the end of `mil.route`. Help: mode `defend`, not `mil.ally`, threat power >= `callThreat` 1.5 and a player's unit near (creatures are no call).
- Output entry `{from, team:true, mark:{kind,x,y}, text?}`; `HostSession.speak` relays the marker with `relayMark(from, mark, {order:false})`, so it is NOT a `teamMark` sim command (World untouched, other AIs don't answer).
- Knobs in VOICE: callAttackGap 60, callHelpGap 45, maxCalls 24; the line shares ackGap 20. Only when a non-'ai' seat (setup.players kind) is on the team. Lines `callAttack` / `callHelp` per pantheon in voice-lines.js.
- Measured: 2v2 Normal seed 3, ally called 2 attacks + 2 helps in 18 min. Scratch harness idea: run createAI for all four seats, voice only 1..3.

**Why:** teammates should know where the AI is going without reading its mind; the enemy must never see it. Related: [team-marks](team-marks.md), [ai-voices](ai-voices.md).
**How to apply:** a new callout kind is a branch in `callOut` plus a trigger in VOICE_TRIGGERS and lines for all ten pantheons.
