# quality-review-2026-11-05

> Cloud env tool inventory and quality review of 2026-11-05: what runs here, the stuck-god bug lead, CI/tool gaps, report link

The owner asked (2026-11-05) for a review of the new default cloud environment plus a quality findings report (no code changes). Report: (link not kept)

Environment: Node 22.23, 4 cores, 15 GB, no GPU (SwiftShader only), ffmpeg/ffprobe, ImageMagick, Pillow, numpy, global ESLint 9 and tsc, Chromium + global Playwright 1.63 at /opt/node-tools/node_modules. Full unit suite 2065 tests, about 2.5 min.

Traps: repo pins playwright 1.56.1, whose browser is missing here, so every tools/*.mjs browser script fails at launch. Workaround used: temporarily symlink node_modules/playwright and playwright-core to /opt/node-tools versions (restore afterwards). play-test.mjs screenshots need timeout ~240000 on software GL; a single-player run takes ~15 min and the final defeat-screen click can still time out.

Findings: (1) NEW: god wedged next to an idle allied god against water, never escapes because the jam escape only counts moving allies and the AI re-orders every 4 s (repro `node tools/sim-audit.mjs --seeds=21 --teams=ffa --diff=brutal`, greek_athena#272 at 102,114.5 from ~t=940). (2) #117 worker bounce still unmerged; FFA Brutal seed 22 bounce=9. (3) idle wood worker, seed 11 2v2 hard. CI runs npm test only; `npm run e2e` points at missing tests/e2e/run-all.mjs; three different browser-path env var names in tools. Narration loudness all -20.3..-20.8 LUFS.

Related: [bug-hunt-2026-10-28](bug-hunt-2026-10-28.md), [two-tab-browser-check](two-tab-browser-check.md), `engagement-research-2026-10-29` (process note, not kept).

Follow-up 2026-11-05 (the owner: "Proceed with all"): #117 merged (213cc5b). PR #121 (merged 2026-11-05 as aac3b39 on the owner's "merge it"; Pages deploy with the bundle green): unit-held jam counter `u.jams` counts any touching ally and squeezes instead of failing; CI jobs test (lint+unit), audit (sim-audit --strict), play (play-test --only sp --slow); Pages builds with tools/build-site.mjs (esbuild, bundle at src/app/ so import.meta.url paths hold); tools/browser.mjs launcher (CHROMIUM_PATH, falls back to /opt/pw-browsers/chromium); eslint.config.js. Idle wood worker = gold/wood flip fixed by #117. Deleting 86 merged branches was blocked by the permission classifier; list in (an off-repo folder, not kept) (keep wip/ai-balance). Music previews (+9 dB, story curve, 90 s): (an off-repo folder, not kept)
CI trap: ubuntu-latest became 26.04, which Playwright 1.56 can't install a browser for; the play job is pinned to ubuntu-24.04. Play job takes ~9 min on GitHub.
