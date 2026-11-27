# guided-first-match

> Learn to Play tutorial (PR #68, engagement plan item 7): setup flag, sleeping raiders AI, objective director, HUD pin/glow, medals, code map, traps

Engagement plan item 7 (see `engagement-research-2026-10-28` (process note, not kept)), PR #68, squash-merged 2026-10-28 as fe39404 (standing go-ahead; Cursor bots still running at merge, Codex security clean).

- Title button "Learn to Play" (menu.js `startTutorial`, no lobby; "New? Start here" tag while career has no game and no medal). Setup `tutorial: true` from `src/sim/tutorial.js` `tutorialSetup` (seed 7101 small map, Greek learner 600/300/100, Norse "Raiders of the North" AI difficulty `'tutorial'`). World `tutorialStart`: no creeps, raiders' TC 1200 hp, 3 Warriors + 1 Archer guards. DESIGN 5.13 (5.11 Sacred Sites, 5.12 match stats; sites and AI voices still run in the lesson).
- `src/ai/tutorial-ai.js`: workers to the mine once, nothing else. createAI dispatches on difficulty.
- `src/game/tutorial.js` TutorialDirector (Game, host only; `game.tutorial`, not `game.director` which is the MusicDirector): 11 `TUTORIAL_STEPS` {done, progress, target, guide}; sticky, sequential.
- `src/ui/hud-tutorial.js`: TutorialView (replaces checklist; hints off), GuidePointer (subclass of MarksLayer; store the latest mark on the item or clicks go to a stale spot), `lightCard` (glow by command-card button id: 'build:house', 'train:greek_zeus', 'attack').
- Medals `src/data/medals.js` (gold ≤12:00, silver ≤18:00); `recordTutorial(rank)` in career.js keeps `best.medal`, not a career game; achievements first_lessons, top_of_the_class (37 total).
- Scripted learner test wins at 5:39 (tests/game/tutorial.test.js). Screenshots in (an off-repo folder, not kept)

**How to apply:** a change to start resources, building hotkeys or god costs flows into the step texts from data; a new step needs a test in tutorial.test.js's play-through.
