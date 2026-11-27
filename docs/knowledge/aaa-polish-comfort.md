# aaa-polish-comfort

> AAA rounds comfort and safety items (2026-11-06): rumble, Destroy button, offline play, shake and camera-speed settings, leave protection (#176 on)

Continues [aaa-polish-touch](aaa-polish-touch.md). Standing order: keep doing rounds until the owner says stop, merge each PR on green, link stills by path (thread is at its attachment cap).

- Pad rumble on screen-shake kicks (GamepadInput.rumble, RUMBLE_KICK 0.08, vibrationActuator dual-rumble): PR #176 (merged).
- Destroy button (💀, .hud-del-btn) in the selection panel, calls input.deleteSelected(again) with "Tap 💀 again": PR #177 (merged). Gotcha: 5 starting workers die on the first tap (no confirm under 6), so the button hides.
- Hold a group chip on touch (HOLD_ADD_MS 700, past TIP_HOLD 450) adds the selection to it (GroupBar onAdd): PR #178 (merged).
- Offline play: network-first sw.js + src/offline.js (registers on https or ?sw only), build-site writes precache.json: PR #179 (merged). Live check: build _site, http-server _site on 8091, ?sw, ctx.setOffline(true).
- Offline notice on Host/Join (isOffline, OFFLINE_NOTE in menu-model.js; peer transport only): PR #180 (merged).
- Screen shake setting (screenShake full/reduced/off, SHAKE_SCALE, renderer.shakeScale; rumble follows; reduced default under prefers-reduced-motion): PR #181 (merged).
- Camera speed setting (scrollSpeed slow/normal/fast/faster, SCROLL_SCALE x PAN_SPEED in input.update): PR #182 (merged).
- Leave protection: MatchSaver.saveOnLeave on hidden/beforeunload (gap 20 game s), leaveNeedsAsking beforeunload prompt after 30 s: PR #183 (merged c467b0f). Live check: page.close({ runBeforeUnload: true }) + dialog event.
- Voices volume (voiceVolume, sfx voice bus + voiceReverb send, voiceLevel(s) for the browser voice and gates): PR #184 (merged c86da66). Still: round-thirteen/settings-voices.png.
- Camera spots F6..F9 (Ctrl/Shift saves, per match, src/ui/camera-spots.js; F5 left as reload): PR #185 (merged f6d0859). Live check scratch spots.mjs; feed cards need ~7 s on software GL before a still shows them.
- Frame rate limit (frameCap off/60/30, FrameCap.due keeps a beat) + Show frame rate (showFps, .hud-fps, FpsMeter, stall 5 s) in src/game/frame-pace.js: PR #186 (merged 6f2e357). Scratch fps.mjs; software GL draws ~1 frame per 2-3 s.
- Restart Match in F10 for any non-online match still played (fresh seed via game/rematch.js launchFrom, so not the same map; loss note after 60 s): PR #187 (merged fad25bd). Still round-thirteen/restart-match.png.
- What's New page (src/data/whats-new.js NEWS newest first, mythicwar-news-seen, .mw-news-dot on the title button; a text badge overflows the fixed-width small buttons): PR #188 (merged dd12921). Add an entry with a fresh id for each batch of player-facing changes.
- Photo mode (src/ui/photo-mode.js: Alt+H toggles, P saves PNG via saveCanvas, Esc exits; renderer.setPhotoMode hides overlayScene; #hud-root.is-photo hides HUD; portrait skipped while on): PR #189 (merged a7780b6).
- Quick chat (src/data/quick-chat.js QUICK_LINES/expandQuick; Hud.chatQuick buttons; openChat sets chatLog bottom from box height): PR #190 (merged 60fa7ab). What's New items must end in . or ! (test), not a quote.
- Chat sound 'chat' (sfx-alerts.js; Hud.chat plays it for others' lines unless alerts off; about -26 dB RMS in play, under tip/ping; not listened to): PR #191 (merged 96c03f1).
- Pause key vs AI (Game.toggleKeyPause/endKeyPause, keyPaused keeps frame() drawing so the camera is free; menu setPaused(true) takes it over; pauseText {solo}): PR #192 (merged f608dc5). GitHub 500'd PR creation twice; retry after a few minutes worked.
- Trap: MatchSaver busy clears in a later microtask; tests await setImmediate before the next save.

**Why:** later rounds need to know what is already done.
**How to apply:** add each new PR here.
