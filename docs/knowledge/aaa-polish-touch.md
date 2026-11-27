# aaa-polish-touch

> Touch play for phones and tablets from the AAA rounds (2026-11-06): what landed (#164 on), how to check it, traps

Continues [aaa-polish-round-twelve](aaa-polish-round-twelve.md) (that file is full). The standing order holds: keep doing rounds until the owner says stop, merge each PR on green, and link stills by path.

- Touch controls merged in #164, tooltips by touch in #165, the minimap in #166, and the installable app in #167; details are in [aaa-polish-round-twelve](aaa-polish-round-twelve.md).
- Two-tap god power aiming merged in #169 (84796b8). `TouchInput.aimPower` handles point-target powers only: the first tap puts the ring and posts a line in the feed; a second tap within AIM_SLOP (48 px) casts; a tap elsewhere moves the ring. Scratch script: touchpower.mjs.
- Two-finger tap = Esc for the map (cancelMode, else sel.clear), TWO_TAP_MS 320 from the first finger: merged #170 (0f49637). Not live-testable on software GL.
- "+" chip in GroupBar (touch only, saveSlot = lowest free digit) saves a control group: merged #171 (af21544). Scratch touchgroup.mjs. Touch Chat button (hud.chatBtn, touch-only + online + not ended): merged #172 (434fb56), scratch touchchat.mjs. Still keyboard-only: Shift+digit add-to-group, Delete.
- Gamepad play: src/ui/gamepad-input.js GamepadInput polled in InputController.update (own cursor .mw-pad-cursor, A click/box, X order, B cancel, triggers zoom, LB/RB idle, Start menu): merged #173 (33e8b19). Live check scratch pad.mjs fakes navigator.getGamepads; software GL ran ~1 fps there, so hold buttons 2.5 s. Trap: any new emoji in a HUD message needs an icon-map.js entry (icons.test.js). Menus: MenuPad (boot in main.js, stands aside while window.__game.input exists; A clicks, B/Start dispatch Esc, .mw-pad-hover ring): merged #174 (edb540f), scratch padmenu.mjs. Fake DOM has no closest(). No real controller tried.
- Comfort and safety items #176 to #183 (rumble, Destroy button, hold-to-add, offline, shake, camera speed, leave protection): see [aaa-polish-comfort](aaa-polish-comfort.md).
- Controls page (menu-howto.js renderControls) lists Touch screen and Controller tables: merged #175 (b1be7e5).
- Nobody has tried any of it on a real phone. All checks so far ran in a touch-emulated browser.

**Why:** later rounds need to know what touch covers and what it does not.
**How to apply:** add each new PR here. Check the gesture rules in touch-input.js before changing input.js.
