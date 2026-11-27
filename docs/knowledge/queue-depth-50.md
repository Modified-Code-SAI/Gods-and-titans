# queue-depth-50

> Production queue 5 to 50 per building (PR #49, merged 2026-10-27): what changed, the run-grouped queue row, cancelTrain count, measured wire sizes, what was left alone, test traps

The owner asked (2026-10-27, one of nine ideas given to parallel threads, `parallel-ideas-batch-2026-10-27` (process note, not kept)): "Maximum build que to any unit should be 50, not 5 as long as the player has the resources." PR #49 (squash a262847, 4 minutes after un-drafting) does it.

- `MAX_QUEUE` 5 to 50 in src/config.js. The sim already charged cost and pop when an item is queued and refunded each item at its own price on cancel, so production.js needed no other change: the purse and the pop cap end a queue early, and one player never holds more than `POP_MAX` queued units (every trainable unit has pop 1 or more) [pop-cap-200](pop-cap-200.md).
- `cancelTrain` takes an optional `count` (items from `index`, clamped to the end; sanitizer 1 to MAX_QUEUE). One command takes a whole queue back; 49 single cancels would meet the host's token bucket (40/s, burst 80) and shift each other's indices.
- Queue row (src/ui/hud-info.js `queueRuns`, `QUEUE_CHIPS` 12): runs of the same unit with a count badge, a "+N" fold button, "n / 50" beside the item in progress; click takes one unit, Shift-click a run, Shift-click on the big button the whole queue.
- Wire, no codec change (JSON bytes, one Town Center): progress tick 19 B; unit queued or finished at depth 50 is 1.3 to 1.5 KB (a length change resends the whole `q`; 171 and 316 B at depth 5); full snapshot with 49 queued 4.1 KB; worst case about 5 KB of queue per player. DESIGN.md section 7 has the numbers.
- Left alone on purpose: Shift plus a train button still queues 5 at a time (`budget = 5` in src/ui/input.js; it was "fill the queue" when the cap was 5, so a bigger batch is a fair follow-up if the owner asks); a destroyed building loses its queue with no refund (pop is freed); research and Town Center growth wait behind queued units, and a queued `tier_up` blocks further training.

Test traps: `place()` in tests/sim/helpers.js recomputes `popCap`, so assign it after placing; every refused train emits its own error event (10 trains over the cap gives one error per refusal); a second god needs `tier: 2`; the fake DOM's `classList` is not synced with `className`. For a real-browser still: serve the repo with `python3 -m http.server` (no node_modules), stub `window.__game.renderer.render` and give `page.screenshot` 120 s (software GL); `__game.session.world` is the host World.

**Why:** the owner wants to bank long orders as long as the resources allow; reserving cost and pop at queue time is what keeps that fair and bounded.
**How to apply:** for a refund on destroy, a bigger Shift batch or queue reordering, start from these rules (refund per item at its queued cost) and keep tests/sim/queue-depth.test.js green. Merge workflow: `pr-merge-workflow` (process note, not kept).
