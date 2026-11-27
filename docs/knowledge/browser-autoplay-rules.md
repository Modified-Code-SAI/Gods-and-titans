# browser-autoplay-rules

> What Chromium lets a page do with sound and speech with no input (measured), the Sound: Allow setting, and the trap that Playwright's evaluate unlocks audio

Measured in real Chromium (probe pages and the real page), for [autoplay-first-visit](autoplay-first-visit.md):
- Default policy: a fresh load is locked (`AudioContext` suspended, `speak` refused with `not-allowed`). A reload after a click is locked again. A click on a link to a same-origin page leaves that next page unlocked.
- Count as activation: Tab, letters, Enter, Space, arrows, a click, a tap. Do not count: mouse move, wheel/scroll, a lone Shift, Escape.
- A per-site "Sound: Allow" exception or the flag `--autoplay-policy=no-user-gesture-required`: context `running` at creation, speech allowed. The exception was written into a profile (`Default/Preferences`, `profile.content_settings.exceptions.sound`, key `http://localhost:8106,*`, `setting: 1`, launched with `launchPersistentContext(dir, { channel: 'chromium' })`). The Chrome menu path (site information, Site settings, Sound, Allow) is Chrome's, not clicked through here.
- Not verified: Firefox and Safari settings, an installed PWA (Chrome allows autoplay there), Chrome's engagement score (media elements, as far as known), real speakers.
- No page-side trick gets sound at page load by default in any browser.

Trap: Playwright's own `evaluate`, `waitFor*`, `$` and screenshot calls count as a user gesture to Chromium. A tool that reads the page that way unlocks the audio it watches: Shift alone seemed to turn the context `running`, and `navigator.userActivation.hasBeenActive` reads true. `tools/shot-intro.mjs --sound` reads through raw CDP (`Runtime.evaluate` with `userGesture: false`, `Page.captureScreenshot`) until the input under test.

Other: headless speech fails with `synthesis-failed` after a speak (only `not-allowed` is a refusal). Chrome logs "The AudioContext was not allowed to start" on a first visit: expected. `pkill -f "serve.mjs"` matched my own shell and killed it (exit 144); use `pgrep -af "[s]erve.mjs"` ([two-tab-browser-check](two-tab-browser-check.md)).

**How to apply:** to test an input's effect on audio, read state with no gesture first, or the result is the harness's, not the browser's.
