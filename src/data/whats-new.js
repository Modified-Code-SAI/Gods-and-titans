// What's New (DESIGN 9, "What's New"): the updates a returning player has not read yet, newest first, shown from the
// title screen's What's New button (src/ui/menu.js), which carries a "New" badge until the newest one has been
// opened. Add an update at the top with a fresh id; the badge comes back for everyone who has seen the last one.
// Kept per browser (localStorage), like the settings. Plain words: what a player can now do, not how it was built.

/** The updates, newest first: { id, date, title, items: string[] }. */
export const NEWS = [
  {
    id: '2026-11-06-comfort-pause',
    date: '6 November 2026',
    title: 'Play your way',
    items: [
      'Against the computer, the Pause key now stops the game and leaves the camera free to look around.',
      'Quick chat: type a number 1 to 9 alone, or press a button in the chat box, to send a set line such as Attack now or I need gold.',
      'Photo mode: Alt+H hides the interface so only the world shows, and P saves a picture of it.',
      'Restart Match in the game menu starts a game against the computer again with the same players and settings.',
      'Camera spots: Ctrl+F6 to F9 keeps where you are looking, F6 to F9 brings you back.',
      'A frame rate limit (60 or 30) for a cooler laptop or phone, and a frame rate counter, in Settings → Graphics.',
      'A Voices volume of its own for the narrator, the campaign storyteller and the taunts of the computer players.',
      'Screen shake (Full, Reduced or Off) and Camera speed settings.',
      'A match against the computer saves itself when you switch away, and the game asks before you close a match.',
      'Play offline: once loaded, the game starts without a network for games against the computer, the campaign and replays.',
    ],
  },
  {
    id: '2026-11-06-touch',
    date: '6 November 2026',
    title: 'Phones, tablets and controllers',
    items: [
      'Touch controls: tap, drag the map, hold and drag to box-select, pinch to zoom; tap twice with a god power to aim it.',
      'Install the game on a phone or tablet from the browser menu.',
      'Play with a gamepad, menus included, with rumble when a blast shakes the screen.',
      'A Destroy button in the selection panel, a Chat button for online games, and control groups by touch.',
      'Up to six players in a game, on a ring map for five or six.',
    ],
  },
  {
    id: '2026-11-05-look',
    date: '5 November 2026',
    title: 'A new look and sound',
    items: [
      'New typefaces, painted icons and a live 3D portrait of what you select.',
      'Impact sounds by material, units that flinch when struck, and the fallen left on the field.',
      'Weather: passing rain, snow and mist, with the ambience to match.',
      'Selected units answer in their own voice, and the computer players speak their taunts aloud.',
      'A live 3D village behind the title screen, and a carved ending where the match was decided.',
    ],
  },
];

const KEY = 'mythicwar-news-seen';

function store() {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

/** The id of the newest update this browser has opened, or null. */
export function newsSeen() {
  try {
    const s = store();
    return (s && s.getItem(KEY)) || null;
  } catch {
    return null;
  }
}

/** Whether the newest update is still unread here. */
export function hasUnreadNews(seen = newsSeen()) {
  return NEWS.length > 0 && seen !== NEWS[0].id;
}

/** The updates published after `seen` (all of them for a browser that has read none), newest first. */
export function unreadNews(seen = newsSeen()) {
  const i = NEWS.findIndex((n) => n.id === seen);
  return i < 0 ? NEWS.slice() : NEWS.slice(0, i);
}

/** The newest update has been read. */
export function markNewsSeen() {
  try {
    const s = store();
    if (s && NEWS.length) s.setItem(KEY, NEWS[0].id);
  } catch {
    // storage blocked: the badge shows again next visit
  }
}
