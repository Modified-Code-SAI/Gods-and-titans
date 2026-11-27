# alert-sounds

> The six alert sounds (nudge, drums, gong, research, tip, milestone): what each is for, measured levels against the horn, and that nobody has listened yet

Part of [alerts-and-tips](alerts-and-tips.md). `src/audio/sfx-alerts.js` holds the recipes and is merged into the sfx.js tables (`SFX_NAMES.push`, `Object.assign` of LIMITS, LEVEL and RECIPES from `ALERT_LIMITS`, `ALERT_LEVEL`, `ALERT_RECIPES`):

- `nudge`: two soft notes, the reminders (idle Worshippers, population cap, god ready, idle army).
- `drums`: four war-drum beats, enemies near the base (softer for an ally under attack).
- `gong`: the Decade of Peace is about to end (louder at each mark).
- `research`: an upgrade finished. `tip`: a gameplay tip appeared. `milestone`: a short fanfare.
- The team marks (PR #52) have their own `ping` and `ping_urgent` in sfx.js; the names do not collide.

Levels measured offline with `renderSfxOffline` in Chromium (peak dB / rms400 dB): drums -3.4/-15.9, gong -4.4/-12.9, nudge -8.7/-24.7, research -8.2/-21.2, tip -11.2/-25.3, milestone -7.5/-19.4, against the horn -5.2/-13.9. As of the merge (2026-10-27) nobody has listened to them.

**How to apply:** if the owner finds one too loud or too soft, change its `ALERT_LEVEL` entry and re-render it the same way against the horn. Warnings should sit near the horn, reminders near the other interface sounds.
