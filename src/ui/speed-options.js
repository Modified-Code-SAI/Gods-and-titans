// The "Game speed" and "Interface size" choices of the settings screen and the in-game menu.
// Ids are the `gameSpeed` and `uiScale` settings' values (src/settings.js); the factors are in
// src/config.js (GAME_SPEEDS, UI_SCALES) and src/game/game.js applies them.

/** [id, label, one line of explanation] */
export const GAME_SPEED_OPTIONS = [
  ['slow', 'Slow', 'Half speed: time to think and to manage every fight. For games against the computer.'],
  ['normal', 'Normal', 'The standard pace. Online games always run at this speed.'],
  ['fast', 'Fast', 'One and a half times as fast. For games against the computer.'],
  ['faster', 'Very fast', 'Twice as fast: the economy and the armies grow in half the time. For games against the computer.'],
];

export const UI_SCALE_OPTIONS = [
  ['small', 'Small', 'A smaller interface: more of the battlefield shows.'],
  ['normal', 'Normal', 'The interface grows and shrinks with the window.'],
  ['large', 'Large', 'A larger interface, easier to read on a big screen or from a sofa.'],
  ['larger', 'Larger', 'The largest interface.'],
];

// The "Team colours" and "Command keys" choices (settings `teamColors`, src/team-colors.js, and
// `cardKeys`, src/ui/key-bindings.js).
export const TEAM_COLOR_OPTIONS = [
  ['standard', 'Standard', 'The colours chosen in the lobby.'],
  ['colorblind', 'Colour-blind safe', 'Team colours, selection rings and order markers drawn in colours that stay apart with red-green or blue-yellow colour blindness. Only your screen changes.'],
];

export const CARD_KEY_OPTIONS = [
  ['classic', 'Classic', 'Each command has its own letter: M Move, A Attack, B Build, W Warrior…'],
  ['grid', 'Grid', 'The keys follow the card\'s 4 × 3 layout (Q W E R, A S D F, Z X C V by default), whatever is selected. Tips and How to Play still name the Classic letters.'],
];

// "Screen shake" (setting `screenShake`): how far blasts, quakes and Titans shake the camera, times SHAKE_SCALE.
// A controller's rumble (src/ui/gamepad-input.js) follows the same choice.
export const SCREEN_SHAKE_OPTIONS = [
  ['full', 'Full', 'Blasts, quakes and Titans shake the camera.'],
  ['reduced', 'Reduced', 'A gentle shake, about a third as strong.'],
  ['off', 'Off', 'The camera holds still. Better if motion on screen bothers you.'],
];
export const SHAKE_SCALE = { full: 1, reduced: 0.35, off: 0 };

// "Camera speed" (setting `scrollSpeed`): how fast the arrow keys, edge scrolling and a controller's stick move the
// camera, times SCROLL_SCALE. Dragging the map follows the finger or the mouse whatever it is.
export const SCROLL_SPEED_OPTIONS = [
  ['slow', 'Slow', 'The camera glides: easier to follow on a small screen.'],
  ['normal', 'Normal', 'The arrow keys and the screen edge move the camera at the usual pace.'],
  ['fast', 'Fast', 'Half again as fast: across the map in a few seconds.'],
  ['faster', 'Faster', 'Over twice as fast, for a big map.'],
];
export const SCROLL_SCALE = { slow: 0.6, normal: 1, fast: 1.5, faster: 2.2 };

// "Frame rate limit" (setting `frameCap`): at most this many frames a second (src/game/frame-pace.js FRAME_CAP_MS).
export const FRAME_CAP_OPTIONS = [
  ['off', 'None', 'As many frames as the screen shows.'],
  ['60', '60', 'At most 60 a second: a fast screen spends less power.'],
  ['30', '30', 'At most 30 a second: a laptop or a phone runs cooler and its battery lasts longer.'],
];

/** The explanation of one option id ('' for an unknown one). */
export function optionNote(options, id) {
  const o = options.find((x) => x[0] === id);
  return o ? o[2] : '';
}

// The "Graphics quality" choices (setting `quality`, src/render/game-renderer.js QUALITY). The renderer
// changes quality live, so the in-game menu offers them too.
export const QUALITY_OPTIONS = [
  ['low', 'Low', 'No shadows or post-processing, fewer particles. For older laptops.'],
  ['medium', 'Medium', 'Shadows, glow (bloom), smoothed edges and cloud shadows. Recommended.'],
  ['high', 'High', 'Adds ambient occlusion, sharper shadows, unit shadows and the most particles.'],
  ['ultra', 'Ultra', 'Everything at its best and finest. For gaming PCs.'],
];
