# aaa-polish-settings

> AAA polish items after aaa-polish-comfort filled up (2026-11-07 on): Restore defaults #193, and gaps checked and found already done

Continues [aaa-polish-comfort](aaa-polish-comfort.md) (that file is near 4 KB). The owner ended the rounds on 2026-11-07 03:25Z ("once everything finishes, merge and close the threads"); #206 was the last. Before that the order was: keep doing rounds until the owner says stop, merge each PR on green, and link stills by path because the thread hit its attachment cap.

- Restore defaults (settings.js restoreDefaults + KEPT_ON_RESTORE name/tipsDismissed/rosterOpen/keyBindings/cardKeys; link .mw-restore-defaults at the foot of Settings, confirm then go(settings)): PR #193 (merged 0b7a1d1). Still round-thirteen/restore-defaults.png.
- Foe/ally god or Titan death feed line (game.js onEvent 'death', only when vs.isVisibleAt): PR #194 (merged 1f9e32d).
- Idle Town Center nudge (alerts.js townIdle, tc_idle: 15 s idle + Worshipper ready, every 75 s, first 600 s; names bound Home key): PR #195 (merged 871cd50). Alert test scenes keep the TC busy by default (townIdle option); a new AlertEngine test must do the same.
- Rival/ally age-up feed line (game.js onEvent 'tierUp', other players; tier is public via roster): PR #196 (merged b9c3ae3).
- Under-attack line names what was struck (hud-data underAttackText, used by game.js and alerts.js tab text): PR #197 (merged 4a0ab90).
- Chat recall with Up/Down (src/ui/chat-history.js, Hud.chatSent; Hud.chatHistory is the received-lines log, a name trap): PR #198 (merged 09d7898).
- Mute a player from the roster (RosterView.muteButton, Hud.muted, Game.onChat drop) + removed the doubled 'select' click on chat lines: PR #199 (merged a6b8db8). Stills round-thirteen/roster-*.png. Trap: roster rows redraw whenever a score moves, so a button inside must act on pointerdown (click can split across drawings; Playwright hover/click times out as 'not stable').
- ? opens Controls over the game menu (input.js after F10; '?' added to key-bindings RESERVED): PR #200 (merged 7a15b3b).
- Nearly-full pop warning (alerts.js pop_near, s.training from survey; pop_capped quiet 30 s after): PR #201 (merged 67e5517).
- /help chat command (hud-data chatCommand + CHAT_HELP, local system lines): PR #202 (merged 9ce849b).
- Repeat training (right-click a train button; sim repeatTrain, building.repeat, snapshot rt, issueTrain quiet flag, REPEAT_EVERY 5 ticks; not gods/Titans): PR #203 (merged bd7fe9e). Info-panel line saying what it waits for (hud-info repeatNote): PR #204 (merged fb62956).
- Feed cards about a place link to it (Hud.message opts.at -> linkCard, pointerdown; .hud-msg.is-jump takes the pointer; underAttack, waves, enemy powers, onAlert a.jump): PR #205 (merged 71b8b44).
- Home selects the Town Center too and cycles several (input.js jumpHome; howto.test checks the row text): PR #206 (merged 782d827).
- Checked and already present (don't redo): camera spots F6-F9 (camera-spots.js), Alt shows all health bars + setting, Space jumps to last alert, game speed, autosave, live player list with score (hud-roster.js), score-over-time chart in the chronicle, Ctrl+click portrait selects a type, attack traits in tooltips (command-card.js), idle worker/army keys, custom cursors per context, own god/Titan/building loss messages, gold mine collapse line, chat log timestamps, Controls panel in the game menu.
- Trap: settings keyBindings are validated (cleanBindings); a test binding such as cam_up 'W' can be dropped, use cam_jump 'J'.

**Why:** later rounds need to know what landed and what not to redo.
**How to apply:** add each new PR here; check the code before picking the next gap.
