// What's New (DESIGN 9, "What's New"): the updates a returning player has not read yet, newest first, shown from the
// title screen's What's New button (src/ui/menu.js), which carries a "New" badge until the newest one has been
// opened. Add an update at the top with a fresh id; the badge comes back for everyone who has seen the last one.
// Kept per browser (localStorage), like the settings. Plain words: what a player can now do, not how it was built.

/** The updates, newest first: { id, date, title, items: string[] }. */
export const NEWS = [
  {
    id: '2026-11-19-poisoned-river',
    date: '19 November 2026',
    title: 'Campaign Chapter X: The Poisoned River',
    items: [
      'A new campaign chapter opens once you finish The Dragon King\'s Flood: five missions for the Hindus of Vrindavan.',
      'Kaliya, the king of the nagas, has poisoned the Yamuna. Guard the cowherds, save the kadamba grove, and hold the temple until Garuda comes.',
      'Then break the serpent towers and face Kaliya himself. With this chapter, every one of the ten peoples has a story of its own.',
    ],
  },
  {
    id: '2026-11-19-dragon-king',
    date: '19 November 2026',
    title: 'Campaign Chapter IX: The Dragon King\'s Flood',
    items: [
      'A new campaign chapter opens once you finish The Tablet of Destinies: five missions for the Chinese of Chentang.',
      'Guard the town\'s rice from the yaksha, save the shrines of Kunlun, and keep the temple standing through a night of flood.',
      'Then break the sea gates and bring down the four Dragon Kings, with the slingers of Babylon at your side. Every line is spoken.',
    ],
  },
  {
    id: '2026-11-18-tablet',
    date: '18 November 2026',
    title: 'Campaign Chapter VIII: The Tablet of Destinies',
    items: [
      'A new campaign chapter opens once you finish The Dragon of the Swamp: five missions for the Mesopotamians of Babylon.',
      'Save the scribes of Babylon, win back the shrines of Nippur, and guard the house of Marduk through a night of monsters.',
      'Then break the towers of Kingu and face Tiamat, the salt sea, with the horsemen of Oyo at your side. Every line is spoken.',
    ],
  },
  {
    id: '2026-11-18-guardian-walls',
    date: '18 November 2026',
    title: 'Guardians build walls',
    items: [
      'Computer players with the Guardian style now wall the front of their base once they reach the Town, leaving a gate open in the middle.',
      'In the City they turn the wall to stone. Bring a ram, or find the gate.',
    ],
  },
  {
    id: '2026-11-18-handicap',
    date: '18 November 2026',
    title: 'Handicaps for friendly games',
    items: [
      'Playing a friend who is newer to the game? Give yourself a handicap with the percent button beside your name in the lobby.',
      'At 80% you keep four fifths of the gold, wood and faith your people gather and pray. The host can set anyone\'s, from 100% down to 50%.',
    ],
  },
  {
    id: '2026-11-18-dragon-swamp',
    date: '18 November 2026',
    title: 'Campaign Chapter VII: The Dragon of the Swamp',
    items: [
      'A new campaign chapter opens once you finish The New Fire: five missions for the West Africans of Oyo.',
      'Save the drummers of Oyo, free the sacred grove of Osun, and guard the Ifá oracle through a night of hyena men.',
      'Then break the stilt towers and face Ninki Nanka, the dragon of the swamp, with the eagle warriors at your side. Every line is spoken.',
    ],
  },
  {
    id: '2026-11-18-new-fire',
    date: '18 November 2026',
    title: 'Campaign Chapter VI: The New Fire',
    items: [
      'A new campaign chapter opens once you finish The Eight-Headed Serpent: five missions for the Aztecs of the lake city.',
      'The great cycle is ending: guard the fire priests, take the Hill of the Star, and keep the new fire burning until the dawn.',
      'Then break the causeway towers and face Cipactli, the earth monster, with the samurai of Izumo at your side. Every line is spoken.',
    ],
  },
  {
    id: '2026-11-18-serpent',
    date: '18 November 2026',
    title: 'Campaign Chapter V: The Eight-Headed Serpent',
    items: [
      'A new campaign chapter opens once you finish The Eye of Balor: five missions for the Japanese of Izumo.',
      'Guard the old couple\'s house, take the fox shrines, keep Kushinada safe through the night and break the river gates.',
      'Then face Yamata no Orochi, the serpent of eight heads, with the Jade Emperor\'s guard at your side. Every line is spoken.',
    ],
  },
  {
    id: '2026-11-18-ai-styles',
    date: '18 November 2026',
    title: 'Rivals with a temper',
    items: [
      'Computer players now each have a play style: Raiders strike early and often, Builders grow huge and strike late, Guardians hide behind towers.',
      'The loading screen tells you which style each computer player has, so you can plan for it.',
      'Or choose it yourself: the small button beside each computer player in the lobby cycles Any style, Balanced, Raider, Builder and Guardian.',
    ],
  },
  {
    id: '2026-11-18-wave-four',
    date: '18 November 2026',
    title: 'Rich starts',
    items: [
      'New lobby option: Starting resources. Play a Standard game, or start everyone with Plenty or Rich stores for a fast, big battle.',
      'Online, when the host leaves and another player carries the game on, the match replay now carries on too.',
    ],
  },
  {
    id: '2026-11-18-balor',
    date: '18 November 2026',
    title: 'Campaign Chapter IV: The Eye of Balor',
    items: [
      'A new campaign chapter opens once you finish The Sea of Chaos: five missions for the Celts against Balor\'s Fomorians.',
      'Defend the harvest, hold the hills of Tara, keep the fires lit through the night of Samhain and tear down the towers of Tory.',
      'In the last battle, Balor of the evil eye himself walks onto the field of Mag Tuired. Every briefing is spoken aloud.',
      'Finishing the chapter earns its own achievement.',
    ],
  },
  {
    id: '2026-11-18-wave-two',
    date: '18 November 2026',
    title: 'Sharper rivals',
    items: [
      'The computer players now build their Houses in squares once they are a Town, and combine them into Manors.',
      'Online, every player now gets the match replay at the end, not only the host: Watch Replay is on everyone\'s end screen.',
      'After a daily challenge, Copy result puts your day, score and streak on the clipboard to share with a friend.',
    ],
  },
  {
    id: '2026-11-18-loose-ends',
    date: '18 November 2026',
    title: 'Loose ends',
    items: [
      'New achievements: win by Sacred Victory, cast a god power, bring a relic home, win a daily challenge, keep a seven-day daily streak.',
      'Each campaign chapter you finish now earns an achievement. Chapters already finished count when you open your Career.',
      'Rest the pointer on a relic or a sacred site to see what it is, who holds it and what it gives.',
      'When four selected Houses become a Manor, the Manor is selected in their place, and in any control group they were in.',
    ],
  },
  {
    id: '2026-11-07-home-select',
    date: '7 November 2026',
    title: 'Play your way',
    items: [
      'Home now selects your Town Center as well as showing it, so W trains a Worshipper at once. Press it again for the next one.',
      'Click a warning in the messages, such as an attack or an enemy god power, to look at where it happened.',
      'Right-click a train button to repeat it: the building queues another whenever its queue runs empty.',
      'A repeating building says so under its queue, and when it is waiting, what for: gold, wood or a House.',
      'Type /help in the chat box to see what the chat can do.',
      'A word ahead of your population limit: when only a couple of places are left while you train, it asks for a House.',
      'Press ? in a match to see every control at once.',
      'Mute a player: the small speaker at the end of their row in the player list hides their chat and taunts for the match.',
      'In the chat box, the Up arrow brings back a line you sent, to send it again or change it.',
      'The under-attack warning now says what was struck: your base, your Worshippers, or a god or Titan by name.',
      'You hear when another player grows into a Town or a City, a warning for a rival and good news for an ally.',
      'In the first ten minutes, a nudge when your Town Center stands idle while you could pay for a Worshipper.',
      'You hear of it when an enemy god or Titan you can see falls, and when an ally loses one.',
      'Restore defaults at the foot of Settings puts every setting back as it came, keeping your name and keys.',
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
