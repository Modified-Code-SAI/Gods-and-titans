# rich-rollout-status

> the ten-pantheon character rollout (PRs #24, #27 to #36) and the creature passes (#37 to #47) are complete and merged to main (2026-10-24); what is still open

Status 2026-10-24: **everything is merged.** the owner's first "Merge it" took the characters into main as squash commits (`stacked-pr-squash` (process note, not kept)): #24 Norse sample, #27 Norse complete + shared kit, #28 Greek, #29 Egyptian, #30 Hindu, #31 Japanese, #32 Chinese, #33 Aztec, #34 Celtic, #35 Mesopotamian, #36 West African (main af84711, 921 tests). `RICH_PANTHEONS` holds every pantheon in `PANTHEON_LIST`, and a test in game-renderer-detail.test.js says so.

Then "Yes finish them next": the non-humanoid creatures as stacked draft PRs #37 quadrupeds, #38 birds, #39 serpents, #40 lizards, #41 beast bipeds, #42 spirits, #43 nagas, #44 centaurs, #45 insects, #46 Airavata, #47 the battering ram, the last unit (every unit look, 158 in all, has a rich model; see [rich-creatures-plans](rich-creatures-plans.md), [rich-ram-plan](rich-ram-plan.md)). A second "Merge it" (13:06 UTC) took them into main the same way: 11 squash commits, main at c0aefc2, its tree equal to the tested #47 head (1061 tests), Tests and the Pages deploy green, no review-bot comments before any merge.

Open: nothing. The owner closed it out ("All good, completed for now.", 2026-10-24 15:53 UTC) and the thread was resolved; a new ask starts new work. Not measured on a real GPU (software GL only); the costs on record are triangle counts against the budgets. The old `claude/characters-*` and `claude/creatures-*` branches and worktrees are history: new work starts from `origin/main` (`git checkout -B <branch> origin/main`).

Kit and traps per pantheon: [rich-kit-pieces](rich-kit-pieces.md), [rich-kit-japanese](rich-kit-japanese.md), [rich-kit-chinese](rich-kit-chinese.md), [rich-kit-aztec](rich-kit-aztec.md), [rich-kit-celtic](rich-kit-celtic.md), [rich-kit-mesopotamian](rich-kit-mesopotamian.md), [rich-kit-west-african](rich-kit-west-african.md), [west-african-look-traps](west-african-look-traps.md). The routine for a part: [rich-part-routine](rich-part-routine.md).

**Why:** a new thread must know the chains are merged (nothing left to retarget) and what the owner has still not asked for.
**How to apply:** read with [rich-characters-rollout](rich-characters-rollout.md).
