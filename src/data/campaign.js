// The campaign (DESIGN 5.16): seven chapters of five linked missions each. Chapter I, "The Long Winter", for
// the Greeks against raiders out of the frozen north; Chapter II, "The Wolf Age", for the Norse against Loki,
// opened by winning the last mission of Chapter I; Chapter III, "The Sea of Chaos", for the Egyptians against
// Akkad and Tiamat, opened by winning the last of Chapter II; Chapter IV, "The Eye of Balor", for the Celts against
// Balor and the Fomorians, opened by winning the last of Chapter III; Chapter V, "The Eight-Headed Serpent",
// for the Japanese of Izumo against Yamata no Orochi, opened by winning the last of Chapter IV; Chapter VI, "The New
// Fire", for the Aztecs against the cult of Cipactli, opened by winning the last of Chapter V; Chapter VII, "The Dragon
// of the Swamp", for the West Africans of Oyo against Ninki Nanka, opened by winning the last of Chapter VI. Plain data, read by the sim (src/sim/campaign.js runs the
// objectives and the scripted events), the HUD (the objective panel) and the menu (the chapter
// screen and the briefings). The briefings and the lines said during a mission are recorded
// (assets/narration/campaign, tools/narration/render.py --campaign); a line's clip is named by
// clipName(), so changing a line's words means rendering it again (tests/data/campaign.test.js checks
// every clip is there).
//
// Objective kinds (`kind`), each about the hero (player 0) unless it names a tag:
//   build    { type, count }   that many of a building finished and standing
//   gods     { count }         that many gods on the field at once
//   army     { count }         that many soldiers alive at once
//   kill     { tag }           every unit an event spawned with this tag is dead (none while not yet spawned)
//   destroy  { tag }           every building placed at the start with this tag has fallen
//   protect  { tag }           fails the mission when every building with this tag has fallen
//   survive  { seconds }       the game clock reaches it
//   hold     { count, seconds} the hero's team holds that many sacred sites at once, that long without a break
//   conquer                    every enemy player is beaten
// Any objective but a protect one may have a `limit` (seconds): not done by then, the mission is lost.
// `optional` objectives are a bonus; `hidden` ones show once an event reveals them. The mission is won when
// every objective that is not optional and not a protect one is done, or when every enemy is beaten. A
// mission's `waitFor` (objective ids) holds that second way back until those are done: its story beat (a
// hold to the end, a foe who arrives late) still has to happen when the enemy is wiped out early. A hidden
// `waitFor` objective carries a `waitText`: the panel's row while it waits to be revealed (with the clock to the
// event that reveals it), so a player who has beaten every enemy knows the mission is not over.
//
// Events: { at: seconds } or { after: objective id }, then any of: say (a line on the screen, spoken),
// spawn { owner, tag, units: [[type, n]], at: 'home'|'front', march, guard, always } (march: sent at the hero's
// buildings, or at the building tagged `target`; guard: they stay where they spawn, never taken into their
// owner's army; always: it comes even once its owner is beaten, from where
// their Town Center stood; otherwise a beaten owner's spawn does not come), reveal (an objective id).

/** Units of a spawn list: [[type, count], ...]. */
const U = (...pairs) => Object.freeze(pairs.map((p) => Object.freeze(p)));

const LONG_WINTER = [
  {
    id: 'shore',
    title: 'Ashes on the Shore',
    place: 'The island of Thera',
    seed: 2201,
    mapSize: 'small',
    creeps: false,
    players: [
      { pantheon: 'greek', team: 1 },
      { name: 'Jarl Hrolf\'s Raiders', pantheon: 'norse', team: 2, difficulty: 'tutorial' },
    ],
    start: [
      { gold: 500, wood: 300, faith: 80, units: U(['warrior', 3]) },
      { townHp: 1500, units: U(['warrior', 3], ['archer', 2]) },
    ],
    briefing: 'Thera, a small island in the Greek sea. For a hundred years its people have known only the sun and the waves. But this spring the sun grew cold, and strange sails came out of the north. Raise a Temple, Archon, and call a god of Olympus to your side. The raiders will not wait for you to be ready.',
    victory: 'The raiders broke on Thera\'s shore. But the prisoners speak of a winter that follows them south, and of the trickster god who sent them.',
    defeat: 'The raiders burned Thera. Gather your people and try again.',
    objectives: [
      { id: 'temple', kind: 'build', type: 'temple', count: 1, icon: '🏛️', text: 'Raise a Temple' },
      { id: 'god', kind: 'gods', count: 1, icon: '⚡', text: 'Summon a god of Olympus' },
      { id: 'raid', kind: 'kill', tag: 'raid', icon: '⚔️', text: 'Drive off the raiding party', hidden: true },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
      { id: 'camp', kind: 'conquer', optional: true, icon: '🔥', text: 'Bonus: burn the raiders\' camp' },
    ],
    events: [
      { at: 4, say: 'Your lookouts see sails on the horizon. Make ready, Archon.' },
      { at: 270, say: 'Longships on the beach! The raiders are coming ashore.', reveal: 'raid', spawn: { owner: 1, tag: 'raid', units: U(['warrior', 4], ['archer', 2]), at: 'front', march: true } },
      { after: 'raid', say: 'The raiders are beaten. Finish what you started.' },
    ],
  },
  {
    id: 'longhouses',
    title: 'Burn the Longhouses',
    place: 'The northern cape of Thera',
    seed: 4401,
    mapSize: 'small',
    players: [
      { pantheon: 'greek', team: 1 },
      { name: 'Jarl Hrolf', pantheon: 'norse', team: 2, difficulty: 'easy' },
    ],
    start: [
      { gold: 600, wood: 400, faith: 120, units: U(['warrior', 4], ['archer', 2]), buildings: [{ type: 'barracks' }, { type: 'house' }] },
      { gold: 300, wood: 200, buildings: [{ type: 'barracks', tag: 'longhouse', ring: 9 }, { type: 'barracks', tag: 'longhouse', ring: 9 }, { type: 'barracks', tag: 'longhouse', ring: 9 }] },
    ],
    briefing: 'The raiders have made a camp on the northern cape, and from three great longhouses their warriors pour out to burn our fields. Gather an army, Archon, and put those longhouses to the torch. Without them the northmen have nowhere to shelter from the winter they bring.',
    victory: 'The longhouses burn, and the cape is ours again. In the ashes we found a carved stone: a serpent eating its own tail, and a name. Loki.',
    defeat: 'Jarl Hrolf holds the cape. Raise a stronger army and try again.',
    objectives: [
      { id: 'burn', kind: 'destroy', tag: 'longhouse', icon: '🔥', text: 'Destroy the three longhouses' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
    ],
    events: [
      { at: 4, say: 'The longhouses stand beside the jarl\'s hall. Train soldiers at your Barracks, and strike.' },
      { at: 420, say: 'The jarl sends his huscarls against you!', spawn: { owner: 1, tag: 'huscarls', units: U(['warrior', 4], ['archer', 2]), at: 'front', march: true } },
    ],
  },
  {
    id: 'pass',
    title: 'The Narrow Pass',
    place: 'The road to Delphi',
    seed: 3301,
    mapSize: 'medium',
    creeps: false,
    players: [
      { pantheon: 'greek', team: 1 },
      { name: 'Host of the North', pantheon: 'norse', team: 2, difficulty: 'tutorial' },
    ],
    start: [
      { gold: 700, wood: 500, faith: 250, units: U(['warrior', 5], ['archer', 3]), buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'house' }, { type: 'temple', tag: 'oracle', ring: 11 }] },
      { townHp: 5000, units: U(['warrior', 4], ['archer', 2]) },
    ],
    briefing: 'The northmen\'s main host has crossed to the mainland. Between them and the holy city of Delphi there is one road, and on it one temple, guarding the narrow pass. Hold it, Archon. Keep that Temple standing until the Spartans march to your aid. Ten minutes. Not one more.',
    victory: 'The Spartans have come, and the pass held. The host of the north turns away, and makes instead for the sacred groves of Arcadia.',
    defeat: 'The Temple of the pass has fallen, and the road to Delphi lies open.',
    objectives: [
      { id: 'hold', kind: 'survive', seconds: 600, icon: '⏳', text: 'Hold out until the Spartans arrive' },
      { id: 'oracle', kind: 'protect', tag: 'oracle', icon: '🏛️', text: 'Keep the Temple of the pass standing' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
    ],
    events: [
      { at: 4, say: 'Here they come. Put your soldiers between the northmen and the Temple.' },
      { at: 75, spawn: { owner: 1, tag: 'w1', units: U(['warrior', 4], ['archer', 2]), at: 'front', march: true, target: 'oracle' } },
      { at: 165, spawn: { owner: 1, tag: 'w2', units: U(['warrior', 5], ['archer', 3]), at: 'front', march: true, target: 'oracle' } },
      { at: 255, say: 'Wolves of Fenrir run with them now!', spawn: { owner: 1, tag: 'w3', units: U(['warrior', 4], ['archer', 3], ['norse_wolf_of_fenrir', 3]), at: 'front', march: true, target: 'oracle' } },
      { at: 300, say: 'A messenger from Sparta: three hundred are on the road. Hold!', spawn: { owner: 0, tag: 'sparta1', units: U(['warrior', 3], ['archer', 1]), at: 'home' } },
      { at: 345, spawn: { owner: 1, tag: 'w4', units: U(['warrior', 6], ['archer', 4], ['norse_wolf_of_fenrir', 2]), at: 'front', march: true, target: 'oracle' } },
      { at: 435, say: 'Valkyries in the sky! Archers, look up!', spawn: { owner: 1, tag: 'w5', units: U(['warrior', 5], ['archer', 4], ['norse_valkyrie', 3]), at: 'front', march: true, target: 'oracle' } },
      { at: 525, say: 'A frost troll leads the last of them. One more push, Archon!', spawn: { owner: 1, tag: 'w6', units: U(['norse_frost_troll', 1], ['warrior', 6], ['archer', 4], ['norse_wolf_of_fenrir', 2]), at: 'front', march: true, target: 'oracle' } },
      { at: 600, spawn: { owner: 0, tag: 'sparta2', units: U(['warrior', 8], ['archer', 4]), at: 'home' } },
    ],
  },
  {
    id: 'groves',
    title: 'The Sacred Groves',
    place: 'The hills of Arcadia',
    seed: 7101,
    mapSize: 'small',
    players: [
      { pantheon: 'greek', team: 1 },
      { name: 'Hrolf Twice-Burned', pantheon: 'norse', team: 2, difficulty: 'easy' },
    ],
    start: [
      { gold: 600, wood: 400, faith: 150, units: U(['warrior', 3], ['archer', 2], ['priest', 2]), buildings: [{ type: 'barracks' }, { type: 'house' }] },
      {},
    ],
    briefing: 'Where the old gods are honoured, the earth itself gives strength. The northmen know it. They are marching on the sacred groves of Arcadia, to steal their power for Loki. Send your Worshippers and Priests to the holy stones before the enemy does, and hold three of them together for two minutes. Let the groves sing for Olympus.',
    victory: 'The groves are ours, and through them the Oracle speaks. The winter has a heart, she says: a giant of fire, sleeping on the frozen heights.',
    defeat: 'The groves have fallen silent. Try again, and guard the holy stones.',
    objectives: [
      { id: 'groves', kind: 'hold', count: 3, seconds: 120, icon: '✨', text: 'Hold three sacred sites at once for 2:00' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
    ],
    events: [
      { at: 4, say: 'The sacred sites glow on the map. Stand a Worshipper or a Priest on one, with no enemy near, to take it.' },
      { at: 420, say: 'Frost trolls! Hrolf sends them to tear down your holy ground.', spawn: { owner: 1, tag: 'trolls', units: U(['norse_frost_troll', 2], ['warrior', 3]), at: 'front', march: true } },
    ],
  },
  {
    id: 'twilight',
    title: 'Twilight of the North',
    place: 'The frozen heights',
    seed: 5501,
    mapSize: 'medium',
    players: [
      { pantheon: 'greek', team: 1 },
      { name: 'Hrolf of the Fire', pantheon: 'norse', team: 2, difficulty: 'normal' },
      { name: 'Pharaoh\'s Legions', pantheon: 'egyptian', team: 1, difficulty: 'normal' },
    ],
    start: [
      { gold: 700, wood: 500, faith: 200, units: U(['warrior', 4], ['archer', 3]), buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'house' }] },
      { gold: 900, wood: 700, faith: 200, buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'tower', ring: 8 }] },
      {},
    ],
    briefing: 'The last of the northmen hold the frozen heights, and Loki has promised them a champion: Surtr, the fire giant, whose burning sword will end the world. The Pharaoh of Egypt has sent her legions to stand beside us. Destroy the northern city before the giant wakes, Archon. And if he wakes, bring him down.',
    victory: 'Surtr\'s fire is out, and the long winter breaks. The sun returns to Thera. But far in the north the trickster only laughs, and other pantheons stir. The war of the gods has just begun.',
    defeat: 'The fire giant walks the world, and winter falls on Greece. Try again, Archon.',
    objectives: [
      { id: 'conquer', kind: 'conquer', icon: '🔥', text: 'Destroy every northern building' },
      { id: 'surtr', kind: 'kill', tag: 'surtr', icon: '🌋', text: 'Slay Surtr, the fire giant', hidden: true },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
    ],
    events: [
      { at: 4, say: 'The Egyptians march with you. Build, summon, and strike before the giant wakes.' },
      { at: 780, say: 'The ground shakes. Surtr is waking!' },
      { at: 840, say: 'Surtr walks! Bring the fire giant down!', reveal: 'surtr', spawn: { owner: 1, tag: 'surtr', units: U(['norse_surtr', 1]), at: 'front', march: true } },
      { after: 'surtr', say: 'The fire giant has fallen! Now finish the northmen.' },
    ],
  },
];

const WOLF_AGE = [
  {
    id: 'hordaland',
    title: 'The Wolf Winter',
    place: 'The fjords of Hordaland',
    seed: 6101,
    mapSize: 'small',
    creeps: false,
    players: [
      { pantheon: 'norse', team: 1 },
      { name: 'Loki\'s Sworn', pantheon: 'norse', team: 2, difficulty: 'tutorial' },
    ],
    start: [
      { gold: 500, wood: 300, faith: 80, units: U(['warrior', 3]), buildings: [{ type: 'storehouse', tag: 'stores', ring: 8 }] },
      { townHp: 1500, units: U(['warrior', 3], ['archer', 2]) },
    ],
    briefing: 'Hordaland, in the fjords of the north. Since the fire giant fell in the south, the winter has not lifted. Three summers have come and gone without a thaw, and men say Loki has slipped his chains. Now his sworn men burn every hall that will not kneel to him. Raise a Temple, Jarl, and call the gods of Asgard. And guard the winter stores, or your people will starve before the spring.',
    victory: 'Loki\'s sworn have fled across the sea. One of them, dying, laughed at us: the wolf\'s chain is nearly cut, he said. On the isle of Lyngvi, where Fenrir was bound, Loki\'s priests are wearing away the last link.',
    defeat: 'Loki\'s sworn burned Hordaland. Gather your people and try again.',
    objectives: [
      { id: 'temple', kind: 'build', type: 'temple', count: 1, icon: '🏛️', text: 'Raise a Temple' },
      { id: 'god', kind: 'gods', count: 1, icon: '⚡', text: 'Summon a god of Asgard' },
      { id: 'raid', kind: 'kill', tag: 'raid', icon: '⚔️', text: 'Drive off Loki\'s sworn', hidden: true },
      { id: 'stores', kind: 'protect', tag: 'stores', icon: '🌾', text: 'Keep the winter stores standing' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
      { id: 'camp', kind: 'conquer', optional: true, icon: '🔥', text: 'Bonus: burn the raiders\' camp' },
    ],
    events: [
      { at: 4, say: 'Smoke on the far side of the fjord. Loki\'s sworn are coming, Jarl. Make ready.' },
      { at: 270, say: 'Longships in the fjord! They are making for your winter stores.', reveal: 'raid', spawn: { owner: 1, tag: 'raid', units: U(['warrior', 4], ['archer', 2]), at: 'front', march: true, target: 'stores' } },
      { after: 'raid', say: 'The raiders are broken. Finish what you started.' },
    ],
  },
  {
    id: 'lyngvi',
    title: 'The Last Link',
    place: 'The isle of Lyngvi',
    seed: 6202,
    mapSize: 'small',
    players: [
      { pantheon: 'norse', team: 1 },
      { name: 'Loki\'s Priests', pantheon: 'norse', team: 2, difficulty: 'easy' },
    ],
    start: [
      { gold: 600, wood: 400, faith: 150, units: U(['warrior', 4], ['archer', 2]), buildings: [{ type: 'barracks' }, { type: 'house' }] },
      { gold: 300, wood: 200, buildings: [{ type: 'shrine', tag: 'serpent', ring: 9 }, { type: 'shrine', tag: 'serpent', ring: 9 }, { type: 'shrine', tag: 'serpent', ring: 9 }] },
    ],
    briefing: 'On the isle of Lyngvi the gods once bound the wolf Fenrir, with a chain no one could break. Now Loki\'s priests have raised three shrines of the serpent around the rock, and every night their chanting wears the chain thinner. Tear down those shrines, Jarl, before the last link breaks. You have twenty minutes.',
    victory: 'The serpent shrines are rubble, and the chain still holds. But Loki has gone where no chain can follow him: to Bifrost, the burning bridge, to lead the dead of Helheim against Asgard itself.',
    defeat: 'The last link broke, and the wolf runs free. Try again, Jarl.',
    objectives: [
      { id: 'shrines', kind: 'destroy', tag: 'serpent', limit: 1200, icon: '🐍', text: 'Tear down the three serpent shrines' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
    ],
    events: [
      { at: 4, say: 'The serpent shrines stand around the priests\' hall. Train soldiers at your Barracks, and strike.' },
      { at: 360, say: 'The priests loose the wolf\'s children on you!', spawn: { owner: 1, tag: 'pack', units: U(['norse_wolf_of_fenrir', 4], ['warrior', 2]), at: 'front', march: true } },
      { at: 900, say: 'The chain groans on the rock. Five minutes left, Jarl!' },
    ],
  },
  {
    id: 'bifrost',
    title: 'The Burning Bridge',
    place: 'The foot of Bifrost',
    seed: 6303,
    mapSize: 'medium',
    creeps: false,
    players: [
      { pantheon: 'norse', team: 1 },
      { name: 'Host of Helheim', pantheon: 'norse', team: 2, difficulty: 'tutorial' },
    ],
    start: [
      { gold: 700, wood: 500, faith: 250, units: U(['warrior', 5], ['archer', 3]), buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'house' }, { type: 'temple', tag: 'bridge', ring: 11 }] },
      { townHp: 5000, units: U(['warrior', 4], ['archer', 2]) },
    ],
    waitFor: ['hold'], // razing Helheim's town early does not sound Heimdall's horn: the hold still runs out
    briefing: 'Loki is leading the dead of Helheim up the burning bridge to Asgard. At the foot of the bridge stands one Temple, and while it stands, the bridge cannot be crossed. Hold it, Jarl. Hold it nine minutes, until Heimdall\'s horn calls the host of Asgard down to you.',
    victory: 'Heimdall\'s horn has sounded, and the host of Asgard holds the bridge. The dead fall back. But Loki was not among them. He has gone west, to the harbour of the dead, where the ship Naglfar is nearly built.',
    defeat: 'The Temple at the bridge has fallen, and the dead are crossing into Asgard.',
    objectives: [
      { id: 'hold', kind: 'survive', seconds: 540, icon: '⏳', text: 'Hold until Heimdall\'s horn sounds' },
      { id: 'bridge', kind: 'protect', tag: 'bridge', icon: '🌈', text: 'Keep the Temple at the bridge standing' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
    ],
    events: [
      { at: 4, say: 'Here come the dead. Put your soldiers between them and the Temple.' },
      { at: 60, spawn: { owner: 1, tag: 'w1', units: U(['warrior', 4], ['archer', 2]), at: 'front', march: true, target: 'bridge' } },
      { at: 150, spawn: { owner: 1, tag: 'w2', units: U(['warrior', 5], ['archer', 3]), at: 'front', march: true, target: 'bridge' } },
      { at: 240, say: 'Wolves of Fenrir run with the dead!', spawn: { owner: 1, tag: 'w3', units: U(['warrior', 4], ['archer', 3], ['norse_wolf_of_fenrir', 3]), at: 'front', march: true, target: 'bridge' } },
      { at: 270, say: 'Odin sends his Valkyries to your side!', spawn: { owner: 0, tag: 'valkyries', units: U(['norse_valkyrie', 3]), at: 'home' } },
      { at: 330, spawn: { owner: 1, tag: 'w4', units: U(['warrior', 6], ['archer', 4], ['norse_wolf_of_fenrir', 2]), at: 'front', march: true, target: 'bridge' } },
      { at: 420, say: 'Frost trolls on the bridge! Bring them down, Jarl!', spawn: { owner: 1, tag: 'w5', units: U(['norse_frost_troll', 2], ['warrior', 4], ['archer', 3]), at: 'front', march: true, target: 'bridge' } },
      { at: 495, say: 'Loki\'s berserkers lead the last of them. Hold!', spawn: { owner: 1, tag: 'w6', units: U(['norse_berserker', 4], ['warrior', 4], ['archer', 4]), at: 'front', march: true, target: 'bridge' } },
      { at: 540, spawn: { owner: 0, tag: 'asgard', units: U(['warrior', 8], ['archer', 4]), at: 'home' } },
    ],
  },
  {
    id: 'naglfar',
    title: 'The Ship of Nails',
    place: 'The harbour of the dead',
    seed: 6404,
    mapSize: 'small',
    players: [
      { pantheon: 'norse', team: 1 },
      { name: 'Hel\'s Shipwrights', pantheon: 'norse', team: 2, difficulty: 'easy' },
    ],
    start: [
      { gold: 700, wood: 500, faith: 150, units: U(['warrior', 4], ['archer', 3]), buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'house' }] },
      { gold: 400, wood: 300, buildings: [{ type: 'barracks', tag: 'yard', ring: 9 }, { type: 'barracks', tag: 'yard', ring: 9 }, { type: 'tower', ring: 7 }] },
    ],
    briefing: 'At the harbour of the dead, Hel\'s shipwrights are building Naglfar, the ship made from dead men\'s nails. When it is finished it will carry the giants to the last battle. Muster an army, Jarl, then burn the two shipyards before the ship is done.',
    victory: 'Naglfar burns on the black water, and the giants will have no ship. Loki has nothing left but his own sworn host, and he calls them to the plain of Vigrid, where the last battle was always meant to be fought.',
    defeat: 'Naglfar has sailed. Try again, Jarl.',
    objectives: [
      { id: 'army', kind: 'army', count: 12, icon: '⚔️', text: 'Muster an army of twelve soldiers' },
      { id: 'yards', kind: 'destroy', tag: 'yard', icon: '⚓', text: 'Burn the two shipyards', hidden: true },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
      { id: 'sites', kind: 'hold', count: 2, seconds: 60, optional: true, icon: '✨', text: 'Bonus: hold two sacred sites for 1:00' },
    ],
    events: [
      { at: 4, say: 'The shipyards lie beyond Hel\'s hall. Gather wood and gold, and muster your army.' },
      { after: 'army', say: 'Your army is ready. Now burn the shipyards!', reveal: 'yards' },
      { at: 540, say: 'Naglfar\'s crew comes ashore, the drowned dead!', spawn: { owner: 1, tag: 'crew', units: U(['norse_frost_troll', 1], ['warrior', 5], ['archer', 3]), at: 'front', march: true } },
    ],
  },
  {
    id: 'vigrid',
    title: 'Ragnarök',
    place: 'The plain of Vigrid',
    seed: 6505,
    mapSize: 'medium',
    players: [
      { pantheon: 'norse', team: 1 },
      { name: 'Loki\'s Sworn Host', pantheon: 'norse', team: 2, difficulty: 'normal' },
      { name: 'The Archon of Thera', pantheon: 'greek', team: 1, difficulty: 'normal' },
      { name: 'Jotuns of Utgard', pantheon: 'norse', team: 2, difficulty: 'easy' },
    ],
    start: [
      { gold: 700, wood: 500, faith: 200, units: U(['warrior', 4], ['archer', 3]), buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'house' }] },
      { gold: 900, wood: 700, faith: 200, buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'tower', ring: 8 }] },
      {},
      { gold: 600, wood: 400 },
    ],
    waitFor: ['loki'], // breaking the host before 13:00 does not end it: Loki still comes, and must fall
    briefing: 'On the plain of Vigrid the last battle was always meant to be fought. Loki\'s sworn host is camped there with the frost giants of Utgard, and the trickster has promised them the end of the world. But the Archon of Thera has not forgotten the long winter, and has sailed north with the Greeks to end it at its root. Break Loki\'s host, Jarl. And when the trickster comes, bring him down.',
    victory: 'Loki has fallen on Vigrid, and the gods have bound him again. The wolf sleeps, the sun climbs over the fjords, and the long winter is over at last. The world did not end. But far in the east, other gods have watched the north burn, and they are hungry.',
    defeat: 'Loki\'s host has won, and the world ends in fire and ice. Try again, Jarl.',
    objectives: [
      { id: 'conquer', kind: 'conquer', icon: '🔥', text: 'Destroy Loki\'s host and the giants' },
      { id: 'loki', kind: 'kill', tag: 'loki', icon: '🐍', text: 'Slay Loki, the trickster', hidden: true, waitText: 'Loki comes at the world\'s end' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
    ],
    events: [
      { at: 4, say: 'The Greeks of Thera stand beside you. Build, summon, and strike.' },
      { at: 720, say: 'The sky goes dark over Vigrid. Loki is coming!' },
      { at: 780, say: 'Loki walks on Vigrid with the wolves at his heel! Bring the trickster down!', reveal: 'loki', spawn: { owner: 1, tag: 'loki', units: U(['norse_loki', 1]), at: 'front', march: true, always: true } },
      { after: 'loki', say: 'The trickster has fallen! Now finish his sworn host.' },
      // His wolves, on a tag of their own: "Slay Loki" is done when Loki falls, not when the last wolf does.
      // (Last in the list: a spoken line's clip is named by its event's place.)
      { at: 780, spawn: { owner: 1, tag: 'loki_wolves', units: U(['norse_wolf_of_fenrir', 4]), at: 'front', march: true, always: true } },
    ],
  },
];

const CHAOS_SEA = [
  {
    id: 'delta',
    title: 'Sails on the Nile',
    place: 'The Nile delta',
    seed: 7201,
    mapSize: 'small',
    creeps: false,
    players: [
      { pantheon: 'egyptian', team: 1 },
      { name: 'Raiders of Akkad', pantheon: 'mesopotamian', team: 2, difficulty: 'tutorial' },
    ],
    start: [
      { gold: 500, wood: 300, faith: 80, units: U(['warrior', 3]), buildings: [{ type: 'storehouse', tag: 'granary', ring: 8 }] },
      { townHp: 1500, units: U(['warrior', 3], ['archer', 2]) },
    ],
    briefing: 'The Nile delta, at the mouth of the great river. The Pharaoh who sent her legions north to fight the fire giant has come home to a strange new war. Out of the east sail the raiders of Akkad, and their priests sing to Tiamat, the mother of monsters, who sleeps in the sea of chaos. Raise a Temple, Pharaoh, and call the gods of Egypt. And guard the granary: the harvest of the Nile feeds the whole kingdom.',
    victory: 'The raiders of Akkad are driven into the sea. On their banners is the sign of the dragon of the deep. Their priests have already gone south, the prisoners say, to poison the wells of the desert.',
    defeat: 'The raiders burned the delta. Gather your people and try again.',
    objectives: [
      { id: 'temple', kind: 'build', type: 'temple', count: 1, icon: '🏛️', text: 'Raise a Temple' },
      { id: 'god', kind: 'gods', count: 1, icon: '☀️', text: 'Summon a god of Egypt' },
      { id: 'raid', kind: 'kill', tag: 'raid', icon: '⚔️', text: 'Drive off the raiders of Akkad', hidden: true },
      { id: 'granary', kind: 'protect', tag: 'granary', icon: '🌾', text: 'Keep the granary standing' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
      { id: 'camp', kind: 'conquer', optional: true, icon: '🔥', text: 'Bonus: burn the raiders\' camp' },
    ],
    events: [
      { at: 4, say: 'Strange sails at the mouth of the river, Pharaoh. The raiders will come for the harvest. Make ready.' },
      { at: 270, say: 'The raiders are on the riverbank, with scorpion men at their side! They make for the granary.', reveal: 'raid', spawn: { owner: 1, tag: 'raid', units: U(['warrior', 3], ['archer', 2], ['mesopotamian_scorpion_man', 1]), at: 'front', march: true, target: 'granary' } },
      { after: 'raid', say: 'The raiders are broken. Finish what you started.' },
    ],
  },
  {
    id: 'siwa',
    title: 'The Wells of the Desert',
    place: 'The oasis of Siwa',
    seed: 7301,
    mapSize: 'small',
    players: [
      { pantheon: 'egyptian', team: 1 },
      { name: 'Priests of Tiamat', pantheon: 'mesopotamian', team: 2, difficulty: 'easy' },
    ],
    start: [
      { gold: 600, wood: 400, faith: 150, units: U(['warrior', 3], ['archer', 2], ['priest', 2]), buildings: [{ type: 'barracks' }, { type: 'house' }] },
      {},
    ],
    briefing: 'In the western desert lies the oasis of Siwa, where the wells are holy and the oracle of Amun speaks. The priests of Tiamat have come to poison them, and to turn the sacred water to the bitter sea of chaos. Send your Worshippers and Priests to the holy stones, Pharaoh, and hold two of them together for a minute and a half. Be quick: in eighteen minutes the wells will be bitter for ever.',
    victory: 'The wells of Siwa run sweet, and the oracle of Amun has spoken. Tiamat\'s servants are marching on Karnak, the house of the gods, to put out its sacred flame. When it goes out, the oracle says, the sun goes with it.',
    defeat: 'The wells have turned to bitter water. Try again, and guard the holy stones.',
    objectives: [
      { id: 'wells', kind: 'hold', count: 2, seconds: 90, limit: 1080, icon: '💧', text: 'Hold two sacred sites at once for 1:30' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
    ],
    events: [
      { at: 4, say: 'The sacred sites glow on the map. Stand a Worshipper or a Priest on one, with no enemy near, to take it.' },
      { at: 360, say: 'Anzu birds out of the east! The priests send them to drive you from the wells.', spawn: { owner: 1, tag: 'anzu', units: U(['mesopotamian_anzu', 2], ['warrior', 3]), at: 'front', march: true } },
      { at: 780, say: 'The water darkens in the wells. Five minutes left, Pharaoh!' },
    ],
  },
  {
    id: 'karnak',
    title: 'The Sacred Flame',
    place: 'The temple of Karnak',
    seed: 7403,
    mapSize: 'medium',
    creeps: false,
    players: [
      { pantheon: 'egyptian', team: 1 },
      { name: 'Host of Akkad', pantheon: 'mesopotamian', team: 2, difficulty: 'tutorial' },
    ],
    start: [
      { gold: 700, wood: 500, faith: 250, units: U(['warrior', 5], ['archer', 3]), buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'house' }, { type: 'temple', tag: 'flame', ring: 11 }] },
      { townHp: 5000, units: U(['warrior', 4], ['archer', 2]) },
    ],
    waitFor: ['hold'], // razing Akkad's camp early does not bring the sun back up: the night still has to be held
    briefing: 'Karnak, the house of the gods, where a flame has burned for Ra since the first morning of the world. The host of Akkad is marching on it to put it out, and with it the sun. Keep the Temple of the flame standing, Pharaoh, through ten minutes of darkness, until Ra rises again and the army of Nubia comes down the river to your aid.',
    victory: 'The sun has risen over Karnak, and the flame still burns. The Nubians have come. But Akkad\'s king has opened the old road through the Sinai, and behind his gate a greater army is gathering.',
    defeat: 'The sacred flame is out, and the sun has not risen over Egypt.',
    objectives: [
      { id: 'hold', kind: 'survive', seconds: 600, icon: '⏳', text: 'Hold out until the sun rises' },
      { id: 'flame', kind: 'protect', tag: 'flame', icon: '🔥', text: 'Keep the Temple of the flame standing' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
    ],
    events: [
      { at: 4, say: 'Night is falling, and the host of Akkad comes with it. Put your soldiers between them and the Temple.' },
      { at: 75, spawn: { owner: 1, tag: 'w1', units: U(['warrior', 4], ['archer', 2]), at: 'front', march: true, target: 'flame' } },
      { at: 165, spawn: { owner: 1, tag: 'w2', units: U(['warrior', 4], ['mesopotamian_slinger', 3], ['mesopotamian_scorpion_man', 1]), at: 'front', march: true, target: 'flame' } },
      { at: 255, say: 'Scorpion men out of the dark!', spawn: { owner: 1, tag: 'w3', units: U(['warrior', 4], ['archer', 3], ['mesopotamian_scorpion_man', 3]), at: 'front', march: true, target: 'flame' } },
      { at: 285, say: 'Ra sends the Bennu birds, the fire of the morning, to your side!', spawn: { owner: 0, tag: 'bennu', units: U(['egyptian_bennu', 3]), at: 'home' } },
      { at: 345, spawn: { owner: 1, tag: 'w4', units: U(['warrior', 6], ['mesopotamian_slinger', 4], ['mesopotamian_scorpion_man', 2]), at: 'front', march: true, target: 'flame' } },
      { at: 435, say: 'Anzu birds in the dark sky! Archers, look up!', spawn: { owner: 1, tag: 'w5', units: U(['warrior', 5], ['archer', 4], ['mesopotamian_anzu', 3]), at: 'front', march: true, target: 'flame' } },
      { at: 525, say: 'A lamassu leads the last of them. Hold until the dawn, Pharaoh!', spawn: { owner: 1, tag: 'w6', units: U(['mesopotamian_lamassu', 1], ['warrior', 6], ['archer', 4], ['mesopotamian_scorpion_man', 2]), at: 'front', march: true, target: 'flame' } },
      { at: 600, spawn: { owner: 0, tag: 'nubia', units: U(['warrior', 8], ['archer', 4]), at: 'home' } },
    ],
  },
  {
    id: 'sinai',
    title: 'The Gate of the East',
    place: 'The road through the Sinai',
    seed: 7504,
    mapSize: 'small',
    players: [
      { pantheon: 'egyptian', team: 1 },
      { name: 'Wardens of the Gate', pantheon: 'mesopotamian', team: 2, difficulty: 'easy' },
    ],
    start: [
      { gold: 700, wood: 500, faith: 150, units: U(['warrior', 4], ['archer', 3]), buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'house' }] },
      { gold: 400, wood: 300, buildings: [{ type: 'tower', tag: 'gate', ring: 9 }, { type: 'tower', tag: 'gate', ring: 9 }, { type: 'barracks', ring: 7 }] },
    ],
    briefing: 'On the old road through the Sinai, the king of Akkad has raised a gate of two great towers, and behind it his armies gather to pour into Egypt. Muster an army, Pharaoh, then tear the gate down. Two lamassu, the winged bulls of the east, stand guard before it. Bring them down too, if you can.',
    victory: 'The gate of the east is rubble, and the road lies open, to us now. The king of Akkad has fled to the marshes of Eridu, where the sea of chaos meets the land. There his priests will wake Tiamat herself.',
    defeat: 'The armies of the east have come through the gate. Try again, Pharaoh.',
    objectives: [
      { id: 'army', kind: 'army', count: 14, icon: '⚔️', text: 'Muster an army of fourteen soldiers' },
      { id: 'gate', kind: 'destroy', tag: 'gate', icon: '🗼', text: 'Tear down the two towers of the gate', hidden: true },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
      { id: 'lamassu', kind: 'kill', tag: 'lamassu', optional: true, icon: '🐂', text: 'Bonus: slay the two lamassu' },
    ],
    events: [
      { at: 2, spawn: { owner: 1, tag: 'lamassu', units: U(['mesopotamian_lamassu', 2]), at: 'front', guard: true } },
      { at: 4, say: 'The gate stands beyond the wardens\' camp. Gather wood and gold, and muster your army.' },
      { after: 'army', say: 'Your army is ready. Now tear down the gate!', reveal: 'gate' },
      { at: 540, say: 'The wardens come out to meet you, with the bulls of heaven!', spawn: { owner: 1, tag: 'wardens', units: U(['mesopotamian_bull_of_heaven', 2], ['warrior', 5], ['mesopotamian_slinger', 3]), at: 'front', march: true } },
    ],
  },
  {
    id: 'eridu',
    title: 'The Mother of Monsters',
    place: 'The marshes of Eridu',
    seed: 7605,
    mapSize: 'medium',
    players: [
      { pantheon: 'egyptian', team: 1 },
      { name: 'The King of Akkad', pantheon: 'mesopotamian', team: 2, difficulty: 'normal' },
      { name: 'Jarl of Hordaland', pantheon: 'norse', team: 1, difficulty: 'normal' },
      { name: 'Children of Tiamat', pantheon: 'mesopotamian', team: 2, difficulty: 'easy' },
    ],
    start: [
      { gold: 700, wood: 500, faith: 200, units: U(['warrior', 4], ['archer', 3]), buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'house' }] },
      { gold: 900, wood: 700, faith: 200, buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'tower', ring: 8 }] },
      {},
      { gold: 600, wood: 400 },
    ],
    waitFor: ['tiamat'], // breaking Akkad before 13:00 does not end it: Tiamat still rises, and must fall
    briefing: 'In the marshes of Eridu, where the rivers meet the sea of chaos, the king of Akkad makes his last stand, and his priests are singing Tiamat awake. The Jarl of Hordaland remembers how Egypt stood with the north, and has sailed south with the Norse to stand with us. Break the king and his monsters, Pharaoh. And when the mother of monsters rises from the deep, bring her down.',
    victory: 'Tiamat has sunk back into the deep, and the sea of chaos is still. The sun shines on the Nile and on the marshes of Eridu alike. Three pantheons have stood together, and the world is whole. But the gods are never quiet for long.',
    defeat: 'Tiamat has risen, and the sea of chaos covers the world. Try again, Pharaoh.',
    objectives: [
      { id: 'conquer', kind: 'conquer', icon: '🔥', text: 'Destroy Akkad and the children of Tiamat' },
      { id: 'tiamat', kind: 'kill', tag: 'tiamat', icon: '🐉', text: 'Slay Tiamat, the mother of monsters', hidden: true, waitText: 'Tiamat rises from the deep' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
    ],
    events: [
      { at: 4, say: 'The Norse of Hordaland stand beside you. Build, summon, and strike.' },
      { at: 720, say: 'The marsh water boils, and the singing grows loud. Tiamat is rising!' },
      { at: 780, say: 'Tiamat rises from the sea of chaos! Bring the mother of monsters down!', reveal: 'tiamat', spawn: { owner: 1, tag: 'tiamat', units: U(['mesopotamian_tiamat', 1]), at: 'front', march: true, always: true } },
      { after: 'tiamat', say: 'The mother of monsters has fallen! Now finish the king of Akkad.' },
      // Her serpents, on a tag of their own: "Slay Tiamat" is done when she falls, not when the last of them does.
      { at: 780, spawn: { owner: 1, tag: 'tiamat_brood', units: U(['mesopotamian_mushussu', 3]), at: 'front', march: true, always: true } },
    ],
  },
];

const BALOR_EYE = [
  {
    id: 'eriu',
    title: 'Ships from the West',
    place: 'The shore of Ériu',
    seed: 8101,
    mapSize: 'small',
    creeps: false,
    players: [
      { pantheon: 'celtic', team: 1 },
      { name: 'Fomorian Raiders', pantheon: 'celtic', team: 2, difficulty: 'tutorial' },
    ],
    start: [
      { gold: 500, wood: 300, faith: 80, units: U(['warrior', 3]), buildings: [{ type: 'storehouse', tag: 'harvest', ring: 8 }] },
      { townHp: 1500, units: U(['warrior', 3], ['archer', 2]) },
    ],
    briefing: 'Ériu, the green island at the edge of the world. Since the sea of chaos was stilled, the gods have been quiet. But out of the western sea come the Fomorians, a people of storm and blight, and their king is Balor of the evil eye. Raise a Temple, and call the gods of the Tuatha Dé Danann. And guard the storehouse: the harvest must last the winter.',
    victory: 'The Fomorians are driven back to their ships. They will come again, the druids say, for the tribute Balor has always taken: the grain and the milk of Ériu.',
    defeat: 'The Fomorians burned the harvest. Gather your people and try again.',
    objectives: [
      { id: 'temple', kind: 'build', type: 'temple', count: 1, icon: '🏛️', text: 'Raise a Temple' },
      { id: 'god', kind: 'gods', count: 1, icon: '🍀', text: 'Summon a god of the Tuatha Dé Danann' },
      { id: 'raid', kind: 'kill', tag: 'raid', icon: '⚔️', text: 'Drive off the Fomorian raiders', hidden: true },
      { id: 'harvest', kind: 'protect', tag: 'harvest', icon: '🌾', text: 'Keep the storehouse of the harvest standing' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
      { id: 'camp', kind: 'conquer', optional: true, icon: '🔥', text: 'Bonus: burn the raiders\' camp' },
    ],
    events: [
      { at: 4, say: 'Black sails on the western sea. The Fomorians will come for the harvest. Make ready.' },
      { at: 270, say: 'The Fomorians are ashore, with a hound of the hills at their heels! They make for the harvest.', reveal: 'raid', spawn: { owner: 1, tag: 'raid', units: U(['warrior', 3], ['archer', 2], ['celtic_cu_sith', 1]), at: 'front', march: true, target: 'harvest' } },
      { after: 'raid', say: 'The raiders are broken. Finish what you started.' },
    ],
  },
  {
    id: 'tara',
    title: 'The Hills of Tara',
    place: 'The sacred hills around Tara',
    seed: 8301,
    mapSize: 'small',
    players: [
      { pantheon: 'celtic', team: 1 },
      { name: 'Stewards of Balor', pantheon: 'celtic', team: 2, difficulty: 'easy' },
    ],
    start: [
      { gold: 600, wood: 400, faith: 150, units: U(['warrior', 3], ['archer', 2], ['priest', 2]), buildings: [{ type: 'barracks' }, { type: 'house' }] },
      {},
    ],
    briefing: 'The Fomorians have come for their tribute, and their tax-gatherers have taken the sacred hills around Tara, where the kings of Ériu are made. Send your Worshippers and Priests to the holy stones, and hold two of them together for a minute and a half. Be quick: in eighteen minutes the tribute is due.',
    victory: 'The hills of Tara are ours again, and the tribute will not be paid. Balor\'s answer comes on the wind: on the night of Samhain, when the door between the worlds stands open, his host will come for the Hill of the Druids.',
    defeat: 'The tax-gatherers hold the hills, and the tribute is paid. Try again, and stand on the holy stones.',
    objectives: [
      { id: 'hills', kind: 'hold', count: 2, seconds: 90, limit: 1080, icon: '✨', text: 'Hold two sacred sites at once for 1:30' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
    ],
    events: [
      { at: 4, say: 'The sacred sites glow on the map. Stand a Worshipper or a Priest on one, with no enemy near, to take it.' },
      { at: 360, say: 'Banshees out of the west! The tax-gatherers send them to drive you from the hills.', spawn: { owner: 1, tag: 'banshee', units: U(['celtic_banshee', 2], ['warrior', 3]), at: 'front', march: true } },
      { at: 780, say: 'The tax-gatherers count the grain. Five minutes until the tribute is due!' },
    ],
  },
  {
    id: 'samhain',
    title: 'The Night of Samhain',
    place: 'The Hill of the Druids',
    seed: 8403,
    mapSize: 'medium',
    creeps: false,
    players: [
      { pantheon: 'celtic', team: 1 },
      { name: 'Host of the Fomori', pantheon: 'celtic', team: 2, difficulty: 'tutorial' },
    ],
    start: [
      { gold: 700, wood: 500, faith: 250, units: U(['warrior', 5], ['archer', 3]), buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'house' }, { type: 'temple', tag: 'hill', ring: 11 }] },
      { townHp: 5000, units: U(['warrior', 4], ['archer', 2]) },
    ],
    waitFor: ['hold'], // razing the Fomorian camp early does not shut the door between the worlds: the night still has to be held
    briefing: 'Samhain, the night when summer dies and the door between the worlds stands open. Balor\'s host is coming for the Hill of the Druids, and the dead ride with it. Keep the Temple on the hill standing through ten minutes of darkness, until the dawn shuts the door again and the Fianna come down from the hills to your aid.',
    victory: 'The dawn has come, and the door between the worlds is shut. The Fianna have come. But on Tory, off the northern coast, Balor has raised two great towers, and from them his ships go out to burn the island.',
    defeat: 'The Temple on the hill has fallen, and the dead walk in Ériu.',
    objectives: [
      { id: 'hold', kind: 'survive', seconds: 600, icon: '⏳', text: 'Hold out until the dawn' },
      { id: 'hill', kind: 'protect', tag: 'hill', icon: '🔥', text: 'Keep the Temple on the hill standing' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
    ],
    events: [
      { at: 4, say: 'Night is falling, and the door between the worlds is opening. Put your soldiers between the Fomorians and the Temple.' },
      { at: 75, spawn: { owner: 1, tag: 'w1', units: U(['warrior', 4], ['archer', 2]), at: 'front', march: true, target: 'hill' } },
      { at: 165, spawn: { owner: 1, tag: 'w2', units: U(['warrior', 4], ['celtic_woad_raider', 2], ['celtic_cu_sith', 1]), at: 'front', march: true, target: 'hill' } },
      { at: 255, say: 'The dead ride with them! A headless rider comes out of the dark!', spawn: { owner: 1, tag: 'w3', units: U(['warrior', 4], ['archer', 3], ['celtic_dullahan', 1]), at: 'front', march: true, target: 'hill' } },
      { at: 285, say: 'Brigid lights the fires of Samhain, and the hounds of the hills run at your side!', spawn: { owner: 0, tag: 'hounds', units: U(['celtic_cu_sith', 3]), at: 'home' } },
      { at: 345, spawn: { owner: 1, tag: 'w4', units: U(['warrior', 6], ['celtic_woad_raider', 3], ['celtic_cu_sith', 2]), at: 'front', march: true, target: 'hill' } },
      { at: 435, say: 'Banshees shriek in the dark sky! Archers, look up!', spawn: { owner: 1, tag: 'w5', units: U(['warrior', 5], ['archer', 4], ['celtic_banshee', 3]), at: 'front', march: true, target: 'hill' } },
      { at: 525, say: 'A headless rider leads the last of them. Hold until the dawn!', spawn: { owner: 1, tag: 'w6', units: U(['celtic_dullahan', 1], ['warrior', 6], ['archer', 4], ['celtic_woad_raider', 2]), at: 'front', march: true, target: 'hill' } },
      { at: 600, spawn: { owner: 0, tag: 'fianna', units: U(['warrior', 8], ['archer', 4]), at: 'home' } },
    ],
  },
  {
    id: 'tory',
    title: 'The Towers of Tory',
    place: 'Tory, off the northern coast',
    seed: 8504,
    mapSize: 'small',
    players: [
      { pantheon: 'celtic', team: 1 },
      { name: 'Wardens of Tory', pantheon: 'celtic', team: 2, difficulty: 'easy' },
    ],
    start: [
      { gold: 700, wood: 500, faith: 150, units: U(['warrior', 4], ['archer', 3]), buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'house' }] },
      { gold: 400, wood: 300, buildings: [{ type: 'tower', tag: 'towers', ring: 9 }, { type: 'tower', tag: 'towers', ring: 9 }, { type: 'barracks', ring: 7 }] },
    ],
    briefing: 'On Tory, the island of towers off the northern coast, Balor has raised two great towers, and from them his ships go out to burn Ériu. Muster an army, then tear the towers down. Two headless riders, the dullahan, keep watch before them. Bring them down too, if you can.',
    victory: 'The towers of Tory are broken, and Balor has no harbour on our coast. Now he comes himself, with all the Fomorians, to the plain of Mag Tuired. And when Balor opens his eye, the druids say, whatever it looks upon burns.',
    defeat: 'Balor\'s ships still sail from Tory. Try again.',
    objectives: [
      { id: 'army', kind: 'army', count: 14, icon: '⚔️', text: 'Muster an army of fourteen soldiers' },
      { id: 'towers', kind: 'destroy', tag: 'towers', icon: '🗼', text: 'Tear down the two towers of Tory', hidden: true },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
      { id: 'riders', kind: 'kill', tag: 'riders', optional: true, icon: '💀', text: 'Bonus: bring down the two headless riders' },
    ],
    events: [
      { at: 2, spawn: { owner: 1, tag: 'riders', units: U(['celtic_dullahan', 2]), at: 'front', guard: true } },
      { at: 4, say: 'The towers stand beyond the wardens\' camp. Gather wood and gold, and muster your army.' },
      { after: 'army', say: 'Your army is ready. Now tear down the towers!', reveal: 'towers' },
      { at: 540, say: 'The wardens come out to meet you, with banshees over their heads!', spawn: { owner: 1, tag: 'wardens', units: U(['celtic_banshee', 2], ['celtic_woad_raider', 4], ['archer', 3]), at: 'front', march: true } },
    ],
  },
  {
    id: 'mag_tuired',
    title: 'The Eye of Balor',
    place: 'The plain of Mag Tuired',
    seed: 8605,
    mapSize: 'medium',
    players: [
      { pantheon: 'celtic', team: 1 },
      { name: 'Host of Balor', pantheon: 'celtic', team: 2, difficulty: 'normal' },
      { name: 'Pharaoh\'s Legion', pantheon: 'egyptian', team: 1, difficulty: 'normal' },
      { name: 'Fomori of the Sea', pantheon: 'celtic', team: 2, difficulty: 'easy' },
    ],
    start: [
      { gold: 700, wood: 500, faith: 200, units: U(['warrior', 4], ['archer', 3]), buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'house' }] },
      { gold: 900, wood: 700, faith: 200, buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'tower', ring: 8 }] },
      {},
      { gold: 600, wood: 400 },
    ],
    waitFor: ['balor'], // breaking the Fomorians before 13:00 does not end it: Balor still comes, and must fall
    briefing: 'The plain of Mag Tuired, where the last battle for Ériu will be fought. All the Fomorians have come, and Balor of the evil eye comes behind them. The Pharaoh remembers how the peoples of the world stood with her against Tiamat, and her legion has sailed north to stand with us. Break the Fomorians. And when Balor comes onto the field, bring him down: one stone in the eye, the druids say, is all it takes.',
    victory: 'Balor has fallen on Mag Tuired, struck in his burning eye, and the Fomorians have gone back into the western sea. Ériu is green again, and four peoples have stood together against the dark. For now, the gods are quiet.',
    defeat: 'Balor\'s eye has opened, and Ériu burns. Try again.',
    objectives: [
      { id: 'conquer', kind: 'conquer', icon: '🔥', text: 'Break the host of Balor and the Fomori of the sea' },
      { id: 'balor', kind: 'kill', tag: 'balor', icon: '👁️', text: 'Slay Balor of the evil eye', hidden: true, waitText: 'Balor comes to Mag Tuired' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
    ],
    events: [
      { at: 4, say: 'The legion of the Pharaoh stands beside you. Build, summon, and strike.' },
      { at: 720, say: 'The ground shakes on Mag Tuired. Balor is coming, and his eye is shut, for now.' },
      { at: 780, say: 'Balor is on the field, and his eye is opening! Bring him down!', reveal: 'balor', spawn: { owner: 1, tag: 'balor', units: U(['celtic_balor', 1]), at: 'front', march: true, always: true } },
      { after: 'balor', say: 'Balor has fallen! Now finish the Fomorians.' },
      // His guard, on a tag of their own: "Slay Balor" is done when he falls, not when the last of them does.
      { at: 780, spawn: { owner: 1, tag: 'balor_guard', units: U(['celtic_woad_raider', 4]), at: 'front', march: true, always: true } },
    ],
  },
];

const SERPENT = [
  {
    id: 'izumo',
    title: 'Banished to Izumo',
    place: 'The river Hi, in Izumo',
    seed: 9101,
    mapSize: 'small',
    creeps: false,
    players: [
      { pantheon: 'japanese', team: 1 },
      { name: 'Serpent Cult', pantheon: 'japanese', team: 2, difficulty: 'tutorial' },
    ],
    start: [
      { gold: 500, wood: 300, faith: 80, units: U(['warrior', 3]), buildings: [{ type: 'house', tag: 'elders', ring: 8 }] },
      { townHp: 1500, units: U(['warrior', 3], ['archer', 2]) },
    ],
    briefing: 'Izumo, a land of rivers and pine on the shore of the western sea. Since Balor fell, the gods have been quiet. But in the hills above the river Hi a cult has woken something old: an eight-headed serpent that eats a maiden every year. An old couple by the river have lost seven daughters to it, and their last, Kushinada, is the eighth. Raise a Temple, call the kami, and keep the old couple\'s house standing.',
    victory: 'The cult\'s raiders are thrown back across the river. The old couple weep for joy, and Kushinada is safe, for now. But the priests of the serpent are gathering at the fox shrines in the hills.',
    defeat: 'The cult burned the house by the river. Gather your people and try again.',
    objectives: [
      { id: 'temple', kind: 'build', type: 'temple', count: 1, icon: '🏛️', text: 'Raise a Temple' },
      { id: 'god', kind: 'gods', count: 1, icon: '⛩️', text: 'Summon a god of the kami' },
      { id: 'raid', kind: 'kill', tag: 'raid', icon: '⚔️', text: 'Drive off the cult\'s raiders', hidden: true },
      { id: 'elders', kind: 'protect', tag: 'elders', icon: '🏠', text: 'Keep the old couple\'s house standing' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
      { id: 'camp', kind: 'conquer', optional: true, icon: '🔥', text: 'Bonus: burn the cult\'s camp' },
    ],
    events: [
      { at: 4, say: 'Smoke in the hills above the river. The cult will come for the old couple\'s house. Make ready.' },
      { at: 270, say: 'The cult crosses the river, and an oni walks with them! They make for the old couple\'s house.', reveal: 'raid', spawn: { owner: 1, tag: 'raid', units: U(['warrior', 3], ['archer', 2], ['japanese_oni', 1]), at: 'front', march: true, target: 'elders' } },
      { after: 'raid', say: 'The raiders are broken. Finish what you started.' },
    ],
  },
  {
    id: 'fox_shrines',
    title: 'The Fox Shrines',
    place: 'The shrine hills of Izumo',
    seed: 9301,
    mapSize: 'small',
    players: [
      { pantheon: 'japanese', team: 1 },
      { name: 'Serpent Priests', pantheon: 'japanese', team: 2, difficulty: 'easy' },
    ],
    start: [
      { gold: 600, wood: 400, faith: 150, units: U(['warrior', 3], ['archer', 2], ['priest', 2]), buildings: [{ type: 'barracks' }, { type: 'house' }] },
      {},
    ],
    briefing: 'The priests of the serpent have taken the fox shrines in the hills, and they pray there for its waking. Send your Worshippers and Priests to the holy stones, and hold two of them together for a minute and a half. Be quick: in eighteen minutes the serpent wakes, and the priests will have their offering.',
    victory: 'The fox shrines are ours, and Inari\'s foxes run in the hills again. The priests have fled up the eight valleys, where the serpent sleeps. Tonight, they say, it will come down for Kushinada.',
    defeat: 'The priests hold the shrines, and the serpent stirs. Try again, and stand on the holy stones.',
    objectives: [
      { id: 'shrines', kind: 'hold', count: 2, seconds: 90, limit: 1080, icon: '✨', text: 'Hold two sacred sites at once for 1:30' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
    ],
    events: [
      { at: 4, say: 'The sacred sites glow on the map. Stand a Worshipper or a Priest on one, with no enemy near, to take it.' },
      { at: 360, say: 'Tengu on the wind! The priests send them to drive you from the shrines.', spawn: { owner: 1, tag: 'tengu', units: U(['japanese_tengu', 2], ['warrior', 3]), at: 'front', march: true } },
      { at: 780, say: 'The priests\' drums are louder. Five minutes until the serpent wakes!' },
    ],
  },
  {
    id: 'eight_valleys',
    title: 'The Night of Eight Valleys',
    place: 'The shrine where Kushinada hides',
    seed: 9403,
    mapSize: 'medium',
    creeps: false,
    players: [
      { pantheon: 'japanese', team: 1 },
      { name: 'Host of the Serpent', pantheon: 'japanese', team: 2, difficulty: 'tutorial' },
    ],
    start: [
      { gold: 700, wood: 500, faith: 250, units: U(['warrior', 5], ['archer', 3]), buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'house' }, { type: 'temple', tag: 'kushinada', ring: 11 }] },
      { townHp: 5000, units: U(['warrior', 4], ['archer', 2]) },
    ],
    waitFor: ['hold'], // razing the cult's camp early does not end the night: Kushinada must still be kept until the dawn
    briefing: 'Kushinada hides in the Temple on the hill, and tonight the serpent\'s host comes down the eight valleys to take her. Keep the Temple standing through ten minutes of darkness. At dawn the samurai of Izumo will come to your aid.',
    victory: 'The dawn has come, and Kushinada is safe. The samurai of Izumo have come. But the serpent\'s cult still holds the river gates, two great watchtowers where the eight valleys meet, and beyond them the serpent sleeps.',
    defeat: 'The Temple on the hill has fallen, and Kushinada is taken.',
    objectives: [
      { id: 'hold', kind: 'survive', seconds: 600, icon: '⏳', text: 'Hold out until the dawn' },
      { id: 'kushinada', kind: 'protect', tag: 'kushinada', icon: '🌸', text: 'Keep the Temple where Kushinada hides standing' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
    ],
    events: [
      { at: 4, say: 'Night is falling over the eight valleys. Put your soldiers between the serpent\'s host and the Temple.' },
      { at: 75, spawn: { owner: 1, tag: 'w1', units: U(['warrior', 4], ['archer', 2]), at: 'front', march: true, target: 'kushinada' } },
      { at: 165, spawn: { owner: 1, tag: 'w2', units: U(['warrior', 4], ['japanese_kitsune', 2], ['archer', 1]), at: 'front', march: true, target: 'kushinada' } },
      { at: 255, say: 'An oni leads them out of the dark! Hold the line!', spawn: { owner: 1, tag: 'w3', units: U(['warrior', 4], ['archer', 3], ['japanese_oni', 1]), at: 'front', march: true, target: 'kushinada' } },
      { at: 285, say: 'Inari sends her foxes down from the shrines to fight at your side!', spawn: { owner: 0, tag: 'foxes', units: U(['japanese_kitsune', 3]), at: 'home' } },
      { at: 345, spawn: { owner: 1, tag: 'w4', units: U(['warrior', 6], ['japanese_kitsune', 3], ['archer', 2]), at: 'front', march: true, target: 'kushinada' } },
      { at: 435, say: 'Tengu dive out of the night sky! Archers, look up!', spawn: { owner: 1, tag: 'w5', units: U(['warrior', 5], ['archer', 4], ['japanese_tengu', 3]), at: 'front', march: true, target: 'kushinada' } },
      { at: 525, say: 'An oni leads the last of them. Hold until the dawn!', spawn: { owner: 1, tag: 'w6', units: U(['japanese_oni', 1], ['warrior', 6], ['archer', 4], ['japanese_kitsune', 2]), at: 'front', march: true, target: 'kushinada' } },
      { at: 600, spawn: { owner: 0, tag: 'samurai', units: U(['japanese_samurai', 4], ['warrior', 6], ['archer', 2]), at: 'home' } },
    ],
  },
  {
    id: 'river_gates',
    title: 'The River Gates',
    place: 'Where the eight valleys meet',
    seed: 9504,
    mapSize: 'small',
    players: [
      { pantheon: 'japanese', team: 1 },
      { name: 'Keepers of the Gate', pantheon: 'japanese', team: 2, difficulty: 'easy' },
    ],
    start: [
      { gold: 700, wood: 500, faith: 150, units: U(['warrior', 4], ['archer', 3]), buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'house' }] },
      { gold: 400, wood: 300, buildings: [{ type: 'tower', tag: 'gates', ring: 9 }, { type: 'tower', tag: 'gates', ring: 9 }, { type: 'barracks', ring: 7 }] },
    ],
    briefing: 'Where the eight valleys meet, the cult has raised two great watchtowers over the river, the gates to the serpent\'s lair. Muster an army, then tear the gates down. Two oni keep watch before them. Bring them down too, if you can.',
    victory: 'The river gates are broken, and the way to the serpent is open. Susanoo has a plan: eight vats of the strongest sake, set out where the serpent will drink. And from the west, an old friend sends help: the Jade Emperor\'s guard has crossed the sea.',
    defeat: 'The river gates still stand. Try again.',
    objectives: [
      { id: 'army', kind: 'army', count: 14, icon: '⚔️', text: 'Muster an army of fourteen soldiers' },
      { id: 'gates', kind: 'destroy', tag: 'gates', icon: '🗼', text: 'Tear down the two river gates', hidden: true },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
      { id: 'oni', kind: 'kill', tag: 'oni', optional: true, icon: '👹', text: 'Bonus: bring down the two oni of the gate' },
    ],
    events: [
      { at: 2, spawn: { owner: 1, tag: 'oni', units: U(['japanese_oni', 2]), at: 'front', guard: true } },
      { at: 4, say: 'The gates stand beyond the keepers\' camp. Gather wood and gold, and muster your army.' },
      { after: 'army', say: 'Your army is ready. Now tear down the gates!', reveal: 'gates' },
      { at: 540, say: 'The keepers come out to meet you, with tengu over their heads!', spawn: { owner: 1, tag: 'keepers', units: U(['japanese_tengu', 2], ['japanese_kitsune', 4], ['archer', 3]), at: 'front', march: true } },
    ],
  },
  {
    id: 'orochi',
    title: 'The Eight-Headed Serpent',
    place: 'The serpent\'s lair, at the head of the river Hi',
    seed: 9605,
    mapSize: 'medium',
    players: [
      { pantheon: 'japanese', team: 1 },
      { name: 'Host of Orochi', pantheon: 'japanese', team: 2, difficulty: 'normal' },
      { name: 'Jade Emperor\'s Guard', pantheon: 'chinese', team: 1, difficulty: 'normal' },
      { name: 'Cult of the Valleys', pantheon: 'japanese', team: 2, difficulty: 'easy' },
    ],
    start: [
      { gold: 700, wood: 500, faith: 200, units: U(['warrior', 4], ['archer', 3]), buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'house' }] },
      { gold: 900, wood: 700, faith: 200, buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'tower', ring: 8 }] },
      {},
      { gold: 600, wood: 400 },
    ],
    waitFor: ['orochi'], // breaking the cult before 13:00 does not end it: the serpent still wakes, and must fall
    briefing: 'The head of the river Hi, where Yamata no Orochi sleeps: eight heads and eight tails, as long as eight valleys and eight hills. The cult and the serpent\'s host stand before its lair, and the Jade Emperor\'s guard stands with us. Break the cult. And when the serpent wakes, drunk on the sake of eight vats, cut it down.',
    victory: 'Yamata no Orochi has fallen, and the river Hi runs red to the sea. In the serpent\'s tail Susanoo found a sword, Kusanagi, the grass-cutter, and he gave it to his sister Amaterasu in the heavens. Kushinada is safe, and five peoples have now stood together against the dark.',
    defeat: 'The serpent has woken, and Izumo is lost. Try again.',
    objectives: [
      { id: 'conquer', kind: 'conquer', icon: '🔥', text: 'Break the host of Orochi and the cult of the valleys' },
      { id: 'orochi', kind: 'kill', tag: 'orochi', icon: '🐍', text: 'Slay Yamata no Orochi', hidden: true, waitText: 'The serpent wakes' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
    ],
    events: [
      { at: 4, say: 'The Jade Emperor\'s guard stands beside you. Build, summon, and strike.' },
      { at: 720, say: 'The ground shakes at the head of the river. The serpent has drunk the sake, and it is waking.' },
      { at: 780, say: 'Yamata no Orochi is awake, all eight heads of it! Bring it down!', reveal: 'orochi', spawn: { owner: 1, tag: 'orochi', units: U(['japanese_yamata_no_orochi', 1]), at: 'front', march: true, always: true } },
      { after: 'orochi', say: 'The serpent has fallen! Now finish the cult.' },
      // Its guard, on a tag of their own: "Slay Yamata no Orochi" is done when it falls, not when the last of them does.
      { at: 780, spawn: { owner: 1, tag: 'orochi_guard', units: U(['japanese_oni', 2], ['japanese_kitsune', 2]), at: 'front', march: true, always: true } },
    ],
  },
];

const NEW_FIRE = [
  {
    id: 'tenochtitlan',
    title: 'The Last Night of the Cycle',
    place: 'The lake city of Tenochtitlan',
    seed: 10101,
    mapSize: 'small',
    creeps: false,
    players: [
      { pantheon: 'aztec', team: 1 },
      { name: 'Cult of the Stars', pantheon: 'aztec', team: 2, difficulty: 'tutorial' },
    ],
    start: [
      { gold: 500, wood: 300, faith: 80, units: U(['warrior', 3]), buildings: [{ type: 'house', tag: 'priests', ring: 8 }] },
      { townHp: 1500, units: U(['warrior', 3], ['archer', 2]) },
    ],
    briefing: 'Tenochtitlan, the city on the lake. Every fifty-two years the great cycle ends, and every fire in the land is put out. At midnight the fire priests must kindle a new flame on the Hill of the Star, or the sun will never rise again and the star demons will come down to eat the world. This cycle a cult has come out of the marshes, sworn to Cipactli, the earth monster, and they want the fire to fail. Raise a Temple, call the gods, and keep the fire priests\' house standing.',
    victory: 'The cult\'s raiders are driven back into the reeds, and the fire priests are safe. But the cult has gone to the Hill of the Star, where the new fire must be lit.',
    defeat: 'The cult burned the fire priests\' house. Gather your people and try again.',
    objectives: [
      { id: 'temple', kind: 'build', type: 'temple', count: 1, icon: '🏛️', text: 'Raise a Temple' },
      { id: 'god', kind: 'gods', count: 1, icon: '☀️', text: 'Summon a god of the Mexica' },
      { id: 'raid', kind: 'kill', tag: 'raid', icon: '⚔️', text: 'Drive off the cult\'s raiders', hidden: true },
      { id: 'priests', kind: 'protect', tag: 'priests', icon: '🕯️', text: 'Keep the fire priests\' house standing' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
      { id: 'camp', kind: 'conquer', optional: true, icon: '🔥', text: 'Bonus: burn the cult\'s camp' },
    ],
    events: [
      { at: 4, say: 'The fires of the city are going out, one by one. In the dark, the cult will come for the fire priests. Make ready.' },
      { at: 270, say: 'The cult comes across the causeway, and a jaguar spirit stalks with them! They make for the fire priests.', reveal: 'raid', spawn: { owner: 1, tag: 'raid', units: U(['warrior', 3], ['archer', 2], ['aztec_jaguar_spirit', 1]), at: 'front', march: true, target: 'priests' } },
      { after: 'raid', say: 'The raiders are broken. Finish what you started.' },
    ],
  },
  {
    id: 'star_hill',
    title: 'The Hill of the Star',
    place: 'The Hill of the Star, above the lake',
    seed: 10301,
    mapSize: 'small',
    players: [
      { pantheon: 'aztec', team: 1 },
      { name: 'Priests of Cipactli', pantheon: 'aztec', team: 2, difficulty: 'easy' },
    ],
    start: [
      { gold: 600, wood: 400, faith: 150, units: U(['warrior', 3], ['archer', 2], ['priest', 2]), buildings: [{ type: 'barracks' }, { type: 'house' }] },
      {},
    ],
    briefing: 'The cult\'s priests have taken the holy stones on the Hill of the Star, where the new fire must be lit. Send your Worshippers and Priests to the stones, and hold two of them together for a minute and a half. Be quick: in eighteen minutes it is midnight, and if the hill is still theirs, there will be no new fire.',
    victory: 'The Hill of the Star is ours, and the fire priests climb it with their fire drill. But the cult is gathering in the dark below. They will try to put the new flame out before it can be carried to the city.',
    defeat: 'Midnight has come, and the cult still holds the hill. Try again, and stand on the holy stones.',
    objectives: [
      { id: 'stones', kind: 'hold', count: 2, seconds: 90, limit: 1080, icon: '✨', text: 'Hold two sacred sites at once for 1:30' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
    ],
    events: [
      { at: 4, say: 'The sacred sites glow on the map. Stand a Worshipper or a Priest on one, with no enemy near, to take it.' },
      { at: 360, say: 'Jaguar spirits in the dark! The priests send them to drive you from the stones.', spawn: { owner: 1, tag: 'jaguars', units: U(['aztec_jaguar_spirit', 2], ['warrior', 3]), at: 'front', march: true } },
      { at: 780, say: 'The stars are turning toward midnight. Five minutes left!' },
    ],
  },
  {
    id: 'fire_temple',
    title: 'The New Fire',
    place: 'The temple of the new fire',
    seed: 10403,
    mapSize: 'medium',
    creeps: false,
    players: [
      { pantheon: 'aztec', team: 1 },
      { name: 'Host of the Stars', pantheon: 'aztec', team: 2, difficulty: 'tutorial' },
    ],
    start: [
      { gold: 700, wood: 500, faith: 250, units: U(['warrior', 5], ['archer', 3]), buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'house' }, { type: 'temple', tag: 'fire', ring: 11 }] },
      { townHp: 5000, units: U(['warrior', 4], ['archer', 2]) },
    ],
    waitFor: ['hold'], // razing the cult's camp early does not end the night: the flame must still be kept until the dawn
    briefing: 'The new fire burns in the Temple on the hill, a single flame in a dark world. Every hearth in the land must be lit from it before the dawn, and the cult knows it. Their host comes out of the night to put it out. Keep the Temple standing through ten minutes of darkness, and the sun will rise.',
    victory: 'The sun has risen! Runners carry the new fire to every hearth in the land, and a new cycle has begun. But the cult has fled across the lake to the causeways, and beyond them, deep in the marsh, something huge is stirring.',
    defeat: 'The new fire has gone out, and the sun will not rise.',
    objectives: [
      { id: 'hold', kind: 'survive', seconds: 600, icon: '⏳', text: 'Hold out until the dawn' },
      { id: 'fire', kind: 'protect', tag: 'fire', icon: '🔥', text: 'Keep the Temple of the new fire standing' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
    ],
    events: [
      { at: 4, say: 'The new fire is lit! Put your soldiers between the cult\'s host and the Temple.' },
      { at: 75, spawn: { owner: 1, tag: 'w1', units: U(['warrior', 4], ['archer', 2]), at: 'front', march: true, target: 'fire' } },
      { at: 165, spawn: { owner: 1, tag: 'w2', units: U(['warrior', 4], ['aztec_jaguar_spirit', 2], ['archer', 1]), at: 'front', march: true, target: 'fire' } },
      { at: 255, say: 'An ahuizotl crawls out of the lake with them! Hold the line!', spawn: { owner: 1, tag: 'w3', units: U(['warrior', 4], ['archer', 3], ['aztec_ahuizotl', 1]), at: 'front', march: true, target: 'fire' } },
      { at: 285, say: 'The eagle warriors of the city have seen the flame, and they come to fight at your side!', spawn: { owner: 0, tag: 'eagles', units: U(['aztec_eagle_warrior', 3]), at: 'home' } },
      { at: 345, spawn: { owner: 1, tag: 'w4', units: U(['warrior', 6], ['aztec_jaguar_spirit', 3], ['archer', 2]), at: 'front', march: true, target: 'fire' } },
      { at: 435, say: 'Fire serpents in the dark! Archers, bring them down!', spawn: { owner: 1, tag: 'w5', units: U(['warrior', 5], ['archer', 4], ['aztec_xiuhcoatl', 2]), at: 'front', march: true, target: 'fire' } },
      { at: 525, say: 'An ahuizotl leads the last of them. Hold until the dawn!', spawn: { owner: 1, tag: 'w6', units: U(['aztec_ahuizotl', 1], ['warrior', 6], ['archer', 4], ['aztec_jaguar_spirit', 2]), at: 'front', march: true, target: 'fire' } },
      { at: 600, spawn: { owner: 0, tag: 'dawn', units: U(['aztec_eagle_warrior', 4], ['warrior', 6], ['archer', 2]), at: 'home' } },
    ],
  },
  {
    id: 'causeways',
    title: 'The Causeways',
    place: 'The causeways across the lake',
    seed: 10504,
    mapSize: 'small',
    players: [
      { pantheon: 'aztec', team: 1 },
      { name: 'Keepers of the Marsh', pantheon: 'aztec', team: 2, difficulty: 'easy' },
    ],
    start: [
      { gold: 700, wood: 500, faith: 150, units: U(['warrior', 4], ['archer', 3]), buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'house' }] },
      { gold: 400, wood: 300, buildings: [{ type: 'tower', tag: 'causeway', ring: 9 }, { type: 'tower', tag: 'causeway', ring: 9 }, { type: 'barracks', ring: 7 }] },
    ],
    briefing: 'The cult holds the causeways across the lake, and two great towers guard the way into the marsh where the earth monster sleeps. Muster an army, then tear the towers down. Two ahuizotl lurk in the water before them. Drag them out too, if you can.',
    victory: 'The towers have fallen, and the way into the marsh is open. Tezcatlipoca and Quetzalcoatl, old rivals, have sworn to fight the earth monster together. And from across the sea, an old friend has come: the samurai of Izumo, who know how to kill a monster.',
    defeat: 'The towers on the causeways still stand. Try again.',
    objectives: [
      { id: 'army', kind: 'army', count: 14, icon: '⚔️', text: 'Muster an army of fourteen soldiers' },
      { id: 'towers', kind: 'destroy', tag: 'causeway', icon: '🗼', text: 'Tear down the two causeway towers', hidden: true },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
      { id: 'ahuizotl', kind: 'kill', tag: 'ahuizotl', optional: true, icon: '🐊', text: 'Bonus: slay the two ahuizotl of the lake' },
    ],
    events: [
      { at: 2, spawn: { owner: 1, tag: 'ahuizotl', units: U(['aztec_ahuizotl', 2]), at: 'front', guard: true } },
      { at: 4, say: 'The towers stand beyond the keepers\' camp. Gather wood and gold, and muster your army.' },
      { after: 'army', say: 'Your army is ready. Now tear down the towers!', reveal: 'towers' },
      { at: 540, say: 'The keepers come out to meet you, with fire serpents at their side!', spawn: { owner: 1, tag: 'keepers', units: U(['aztec_xiuhcoatl', 2], ['aztec_jaguar_spirit', 4], ['archer', 3]), at: 'front', march: true } },
    ],
  },
  {
    id: 'cipactli',
    title: 'The Earth Monster',
    place: 'The black marsh, at the edge of the world',
    seed: 10605,
    mapSize: 'medium',
    players: [
      { pantheon: 'aztec', team: 1 },
      { name: 'Host of Cipactli', pantheon: 'aztec', team: 2, difficulty: 'normal' },
      { name: 'Samurai of Izumo', pantheon: 'japanese', team: 1, difficulty: 'normal' },
      { name: 'Cult of the Marsh', pantheon: 'aztec', team: 2, difficulty: 'easy' },
    ],
    start: [
      { gold: 700, wood: 500, faith: 200, units: U(['warrior', 4], ['archer', 3]), buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'house' }] },
      { gold: 900, wood: 700, faith: 200, buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'tower', ring: 8 }] },
      {},
      { gold: 600, wood: 400 },
    ],
    waitFor: ['cipactli'], // breaking the cult before 13:00 does not end it: the earth monster still rises, and must fall
    briefing: 'The black marsh at the edge of the world, where Cipactli sleeps: the earth monster, half crocodile and half fish, with a hungry mouth at every joint. The cult and its host stand before the marsh, and the samurai of Izumo stand with us. Break the cult. And when the earth monster rises, tear it down.',
    victory: 'Cipactli has fallen. Tezcatlipoca and Quetzalcoatl pulled the monster apart, and from its body they made the mountains, the rivers and the fields. The new sun shines on a new world, and six peoples have now stood together against the dark.',
    defeat: 'The earth monster has risen, and swallowed the lake city whole. Try again.',
    objectives: [
      { id: 'conquer', kind: 'conquer', icon: '🔥', text: 'Break the host of Cipactli and the cult of the marsh' },
      { id: 'cipactli', kind: 'kill', tag: 'cipactli', icon: '🐊', text: 'Slay Cipactli, the earth monster', hidden: true, waitText: 'The earth monster rises' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
    ],
    events: [
      { at: 4, say: 'The samurai of Izumo stand beside you. Build, summon, and strike.' },
      { at: 720, say: 'The marsh is boiling. Something vast is moving under the mud.' },
      { at: 780, say: 'Cipactli rises from the marsh, with a mouth at every joint! Bring it down!', reveal: 'cipactli', spawn: { owner: 1, tag: 'cipactli', units: U(['aztec_cipactli', 1]), at: 'front', march: true, always: true } },
      { after: 'cipactli', say: 'The earth monster has fallen! Now finish the cult.' },
      // Its guard, on a tag of their own: "Slay Cipactli" is done when it falls, not when the last of them does.
      { at: 780, spawn: { owner: 1, tag: 'cipactli_guard', units: U(['aztec_xiuhcoatl', 2], ['aztec_jaguar_spirit', 2]), at: 'front', march: true, always: true } },
    ],
  },
];

const DRAGON_SWAMP = [
  {
    id: 'oyo',
    title: 'The Drums of Oyo',
    place: 'The city of Oyo, by the Niger',
    seed: 11101,
    mapSize: 'small',
    creeps: false,
    players: [
      { pantheon: 'west_african', team: 1 },
      { name: 'Cult of the Swamp', pantheon: 'west_african', team: 2, difficulty: 'tutorial' },
    ],
    start: [
      { gold: 500, wood: 300, faith: 80, units: U(['warrior', 3]), buildings: [{ type: 'house', tag: 'drummers', ring: 8 }] },
      { townHp: 1500, units: U(['warrior', 3], ['archer', 2]) },
    ],
    briefing: 'Oyo, the city of horsemen on the plains above the Niger. The rains have not come for two years, and the river is shrinking into the mangroves. The talking drums say a cult has risen in the swamps, feeding a dragon that no one may look on and live: Ninki Nanka. Now the cult wants the drummers silenced, so that no warning can travel from village to village. Raise a Temple, call the orishas, and keep the drummers\' house standing.',
    victory: 'The cult\'s raiders run back to the river, and the drums of Oyo are beating again. They carry a warning: the cult\'s sorcerers have taken the sacred grove of Osun, and they are poisoning its waters.',
    defeat: 'The cult burned the drummers\' house, and the drums are silent. Gather your people and try again.',
    objectives: [
      { id: 'temple', kind: 'build', type: 'temple', count: 1, icon: '🏛️', text: 'Raise a Temple' },
      { id: 'god', kind: 'gods', count: 1, icon: '⚡', text: 'Summon one of the orishas' },
      { id: 'raid', kind: 'kill', tag: 'raid', icon: '⚔️', text: 'Drive off the cult\'s raiders', hidden: true },
      { id: 'drummers', kind: 'protect', tag: 'drummers', icon: '🥁', text: 'Keep the drummers\' house standing' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
      { id: 'camp', kind: 'conquer', optional: true, icon: '🔥', text: 'Bonus: burn the cult\'s camp' },
    ],
    events: [
      { at: 4, say: 'The drums fall quiet at the edge of the city. The cult is coming for the drummers. Make ready.' },
      { at: 270, say: 'The cult comes out of the long grass, and a sasabonsam swings down from the trees with them! They make for the drummers.', reveal: 'raid', spawn: { owner: 1, tag: 'raid', units: U(['warrior', 3], ['archer', 2], ['west_african_sasabonsam', 1]), at: 'front', march: true, target: 'drummers' } },
      { after: 'raid', say: 'The raiders are broken. Finish what you started.' },
    ],
  },
  {
    id: 'osun_grove',
    title: 'The Grove of Osun',
    place: 'The sacred grove of Osun',
    seed: 11301,
    mapSize: 'small',
    players: [
      { pantheon: 'west_african', team: 1 },
      { name: 'Swamp Sorcerers', pantheon: 'west_african', team: 2, difficulty: 'easy' },
    ],
    start: [
      { gold: 600, wood: 400, faith: 150, units: U(['warrior', 3], ['archer', 2], ['priest', 2]), buildings: [{ type: 'barracks' }, { type: 'house' }] },
      {},
    ],
    briefing: 'The sacred grove of Osun, where the river goddess keeps her shrines among the trees. The cult\'s sorcerers have taken the holy stones, and every day they pour poison into her waters. Send your Worshippers and Priests to the stones, and hold two of them together for a minute and a half. Be quick: in eighteen minutes the river will be poisoned beyond saving.',
    victory: 'The grove is ours, and the river runs clean again. But the sorcerers have gone to the Ifá oracle\'s temple, and tonight, when the moon is dark, they will come with every beast of the night to tear it down.',
    defeat: 'The sorcerers held the grove, and the river is poisoned. Try again, and stand on the holy stones.',
    objectives: [
      { id: 'stones', kind: 'hold', count: 2, seconds: 90, limit: 1080, icon: '✨', text: 'Hold two sacred sites at once for 1:30' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
    ],
    events: [
      { at: 4, say: 'The sacred sites glow on the map. Stand a Worshipper or a Priest on one, with no enemy near, to take it.' },
      { at: 360, say: 'Hyena men in the grove! The sorcerers send them to drive you from the stones.', spawn: { owner: 1, tag: 'hyenas', units: U(['west_african_bultungin', 2], ['warrior', 3]), at: 'front', march: true } },
      { at: 780, say: 'The water is turning dark. Five minutes left!' },
    ],
  },
  {
    id: 'ifa',
    title: 'The Night of the Hyenas',
    place: 'The temple of the Ifá oracle',
    seed: 11403,
    mapSize: 'medium',
    creeps: false,
    players: [
      { pantheon: 'west_african', team: 1 },
      { name: 'Beasts of the Night', pantheon: 'west_african', team: 2, difficulty: 'tutorial' },
    ],
    start: [
      { gold: 700, wood: 500, faith: 250, units: U(['warrior', 5], ['archer', 3]), buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'house' }, { type: 'temple', tag: 'oracle', ring: 11 }] },
      { townHp: 5000, units: U(['warrior', 4], ['archer', 2]) },
    ],
    waitFor: ['hold'], // razing the cult's camp early does not end the night: the oracle must still be kept until the dawn
    briefing: 'The Ifá oracle has read the palm nuts, and she knows where the dragon sleeps. The cult must not let her speak. Tonight the moon is dark, and they come with hyena men and the vampires of the forest to tear her temple down. Keep the Temple standing through ten minutes of darkness, and at dawn she will tell us the way.',
    victory: 'The dawn has come, and the oracle has spoken. Ninki Nanka sleeps in the mangroves at the river\'s mouth, behind the cult\'s stilt towers. And whoever looks on its face must look at it through a mirror, or die.',
    defeat: 'The oracle\'s temple has fallen, and her words are lost.',
    objectives: [
      { id: 'hold', kind: 'survive', seconds: 600, icon: '⏳', text: 'Hold out until the dawn' },
      { id: 'oracle', kind: 'protect', tag: 'oracle', icon: '🔮', text: 'Keep the Temple of the oracle standing' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
    ],
    events: [
      { at: 4, say: 'The moon is dark tonight. Put your soldiers between the cult\'s beasts and the Temple.' },
      { at: 75, spawn: { owner: 1, tag: 'w1', units: U(['warrior', 4], ['archer', 2]), at: 'front', march: true, target: 'oracle' } },
      { at: 165, spawn: { owner: 1, tag: 'w2', units: U(['warrior', 4], ['west_african_bultungin', 2], ['archer', 1]), at: 'front', march: true, target: 'oracle' } },
      { at: 255, say: 'A sasabonsam drops out of the trees with them! Hold the line!', spawn: { owner: 1, tag: 'w3', units: U(['warrior', 4], ['archer', 3], ['west_african_sasabonsam', 1]), at: 'front', march: true, target: 'oracle' } },
      { at: 285, say: 'The aziza, the little folk of the forest, have come to fight at your side!', spawn: { owner: 0, tag: 'aziza', units: U(['west_african_aziza', 3]), at: 'home' } },
      { at: 345, spawn: { owner: 1, tag: 'w4', units: U(['warrior', 6], ['west_african_bultungin', 3], ['archer', 2]), at: 'front', march: true, target: 'oracle' } },
      { at: 435, say: 'Two sasabonsam this time, and more hyena men behind them!', spawn: { owner: 1, tag: 'w5', units: U(['warrior', 5], ['archer', 4], ['west_african_sasabonsam', 2]), at: 'front', march: true, target: 'oracle' } },
      { at: 525, say: 'The last of the beasts are coming. Hold until the dawn!', spawn: { owner: 1, tag: 'w6', units: U(['west_african_sasabonsam', 1], ['warrior', 6], ['archer', 4], ['west_african_bultungin', 2]), at: 'front', march: true, target: 'oracle' } },
      { at: 600, spawn: { owner: 0, tag: 'hunters', units: U(['west_african_dart_hunter', 4], ['warrior', 6], ['archer', 2]), at: 'home' } },
    ],
  },
  {
    id: 'stilt_towers',
    title: 'The Stilt Towers',
    place: 'The mangroves at the river\'s mouth',
    seed: 11504,
    mapSize: 'small',
    players: [
      { pantheon: 'west_african', team: 1 },
      { name: 'Keepers of the Mud', pantheon: 'west_african', team: 2, difficulty: 'easy' },
    ],
    start: [
      { gold: 700, wood: 500, faith: 150, units: U(['warrior', 4], ['archer', 3]), buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'house' }] },
      { gold: 400, wood: 300, buildings: [{ type: 'tower', tag: 'stilts', ring: 9 }, { type: 'tower', tag: 'stilts', ring: 9 }, { type: 'barracks', ring: 7 }] },
    ],
    briefing: 'At the river\'s mouth the cult has raised two towers on stilts above the mangroves, to watch the only way into the dragon\'s swamp. Muster an army, then tear the towers down. Two sasabonsam hang in the trees before them. Bring them down too, if you can.',
    victory: 'The stilt towers have fallen, and the way into the swamp is open. Ogun has forged mirrors of polished iron for every soldier. And from across the sea, an old friend has come: the eagle warriors of the lake city, who have killed a monster before.',
    defeat: 'The stilt towers still stand. Try again.',
    objectives: [
      { id: 'army', kind: 'army', count: 14, icon: '⚔️', text: 'Muster an army of fourteen soldiers' },
      { id: 'towers', kind: 'destroy', tag: 'stilts', icon: '🗼', text: 'Tear down the two stilt towers', hidden: true },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
      { id: 'sasabonsam', kind: 'kill', tag: 'sasabonsam', optional: true, icon: '🦇', text: 'Bonus: bring down the two sasabonsam' },
    ],
    events: [
      { at: 2, spawn: { owner: 1, tag: 'sasabonsam', units: U(['west_african_sasabonsam', 2]), at: 'front', guard: true } },
      { at: 4, say: 'The towers stand beyond the keepers\' camp. Gather wood and gold, and muster your army.' },
      { after: 'army', say: 'Your army is ready. Now tear down the towers!', reveal: 'towers' },
      { at: 540, say: 'The keepers come out to meet you, with the hyena men at their side!', spawn: { owner: 1, tag: 'keepers', units: U(['west_african_bultungin', 4], ['west_african_sasabonsam', 1], ['archer', 3]), at: 'front', march: true } },
    ],
  },
  {
    id: 'ninki_nanka',
    title: 'The Dragon of the Swamp',
    place: 'The deep swamp, where the river ends',
    seed: 11611,
    mapSize: 'medium',
    players: [
      { pantheon: 'west_african', team: 1 },
      { name: 'Host of Ninki Nanka', pantheon: 'west_african', team: 2, difficulty: 'normal' },
      { name: 'Eagles of the Lake', pantheon: 'aztec', team: 1, difficulty: 'normal' },
      { name: 'Cult of the Mangrove', pantheon: 'west_african', team: 2, difficulty: 'easy' },
    ],
    start: [
      { gold: 700, wood: 500, faith: 200, units: U(['warrior', 4], ['archer', 3]), buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'house' }] },
      { gold: 900, wood: 700, faith: 200, buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'tower', ring: 8 }] },
      {},
      { gold: 600, wood: 400 },
    ],
    waitFor: ['ninki_nanka'], // breaking the cult before 13:00 does not end it: the dragon still wakes, and must fall
    briefing: 'The deep swamp where the river ends, and where Ninki Nanka sleeps: a dragon as long as a river, with a crown of mirrors on its head. The cult and its host stand before the swamp, and the eagle warriors of the lake city stand with us. Break the cult. And when the dragon wakes, keep your iron mirrors high, and bring it down.',
    victory: 'Ninki Nanka has fallen, and the swamp is still. That night the rains came at last, and the Niger rose and ran to the sea again. The drums of Oyo carried the news from village to village, and seven peoples have now stood together against the dark.',
    defeat: 'The dragon has woken, and the swamp has swallowed the river. Try again.',
    objectives: [
      { id: 'conquer', kind: 'conquer', icon: '🔥', text: 'Break the host of Ninki Nanka and the cult of the mangrove' },
      { id: 'ninki_nanka', kind: 'kill', tag: 'ninki_nanka', icon: '🐉', text: 'Slay Ninki Nanka, the dragon of the swamp', hidden: true, waitText: 'The dragon wakes' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
    ],
    events: [
      { at: 4, say: 'The eagle warriors of the lake city stand beside you. Build, summon, and strike.' },
      { at: 720, say: 'The swamp is steaming. Something long and vast is moving in the reeds.' },
      { at: 780, say: 'Ninki Nanka rises from the swamp, its crown of mirrors blazing! Bring it down!', reveal: 'ninki_nanka', spawn: { owner: 1, tag: 'ninki_nanka', units: U(['west_african_ninki_nanka', 1]), at: 'front', march: true, always: true } },
      { after: 'ninki_nanka', say: 'The dragon has fallen! Now finish the cult.' },
      // Its guard, on a tag of their own: "Slay Ninki Nanka" is done when it falls, not when the last of them does.
      { at: 780, spawn: { owner: 1, tag: 'ninki_guard', units: U(['west_african_sasabonsam', 2], ['west_african_bultungin', 2]), at: 'front', march: true, always: true } },
    ],
  },
];

const TABLET = [
  {
    id: 'babylon',
    title: 'The Gate of the Gods',
    place: 'Babylon, on the Euphrates',
    seed: 12101,
    mapSize: 'small',
    creeps: false,
    players: [
      { pantheon: 'mesopotamian', team: 1 },
      { name: 'Raiders of Kingu', pantheon: 'mesopotamian', team: 2, difficulty: 'tutorial' },
    ],
    start: [
      { gold: 500, wood: 300, faith: 80, units: U(['warrior', 3]), buildings: [{ type: 'house', tag: 'scribes', ring: 8 }] },
      { townHp: 1500, units: U(['warrior', 3], ['archer', 2]) },
    ],
    briefing: 'Babylon, the gate of the gods, on the banks of the Euphrates. The tablet of destinies, that gives its keeper rule over heaven and earth, has been stolen, and Kingu wears it on his breast. Tiamat, the salt sea, has made him captain of her eleven monsters, and his raiders are coming up the river. The scribes of Babylon are writing down the names of the gods, so that whatever happens they will not be forgotten. Raise a Temple, call the gods, and keep the scribes\' house standing.',
    victory: 'Kingu\'s raiders are running down the river. One of them, taken alive, says Kingu has sent his priests to Nippur, to the shrines of Enlil, to scratch the names of the gods from the holy stones.',
    defeat: 'The raiders burned the house of the scribes. Gather your people and try again.',
    objectives: [
      { id: 'temple', kind: 'build', type: 'temple', count: 1, icon: '🏛️', text: 'Raise a Temple' },
      { id: 'god', kind: 'gods', count: 1, icon: '🌀', text: 'Summon a god of the two rivers' },
      { id: 'raid', kind: 'kill', tag: 'raid', icon: '⚔️', text: 'Drive off Kingu\'s raiders', hidden: true },
      { id: 'scribes', kind: 'protect', tag: 'scribes', icon: '📜', text: 'Keep the house of the scribes standing' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
      { id: 'camp', kind: 'conquer', optional: true, icon: '🔥', text: 'Bonus: burn the raiders\' camp' },
    ],
    events: [
      { at: 4, say: 'Boats on the river, coming up from the south. Kingu\'s raiders want the scribes. Make ready.' },
      { at: 270, say: 'The raiders are on the bank, and an ugallu, a lion-demon of the storm, runs with them! They make for the scribes.', reveal: 'raid', spawn: { owner: 1, tag: 'raid', units: U(['warrior', 3], ['archer', 2], ['mesopotamian_ugallu', 1]), at: 'front', march: true, target: 'scribes' } },
      { after: 'raid', say: 'The raiders are broken. Finish what you started.' },
    ],
  },
  {
    id: 'nippur',
    title: 'The Shrines of Nippur',
    place: 'The holy city of Nippur',
    seed: 12301,
    mapSize: 'small',
    players: [
      { pantheon: 'mesopotamian', team: 1 },
      { name: 'Priests of Kingu', pantheon: 'mesopotamian', team: 2, difficulty: 'easy' },
    ],
    start: [
      { gold: 600, wood: 400, faith: 150, units: U(['warrior', 3], ['archer', 2], ['priest', 2]), buildings: [{ type: 'barracks' }, { type: 'house' }] },
      {},
    ],
    briefing: 'Nippur, the holy city of Enlil, where the names of the gods are cut into the standing stones. Kingu\'s priests have taken the stones, and day by day they are scratching the names away. Send your Worshippers and Priests to the holy stones, and hold two of them together for a minute and a half. Be quick: in eighteen minutes the names will be gone for ever.',
    victory: 'The shrines of Nippur are ours, and the names of the gods are safe. But Tiamat\'s eleven monsters have gathered at last, and tonight they march on the Esagila, the house of Marduk in Babylon.',
    defeat: 'The priests held the stones, and the names of the gods are gone. Try again, and stand on the holy stones.',
    objectives: [
      { id: 'stones', kind: 'hold', count: 2, seconds: 90, limit: 1080, icon: '✨', text: 'Hold two sacred sites at once for 1:30' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
    ],
    events: [
      { at: 4, say: 'The sacred sites glow on the map. Stand a Worshipper or a Priest on one, with no enemy near, to take it.' },
      { at: 360, say: 'Lion-demons in the city! The priests send the ugallu to drive you from the stones.', spawn: { owner: 1, tag: 'ugallu', units: U(['mesopotamian_ugallu', 2], ['warrior', 3]), at: 'front', march: true } },
      { at: 780, say: 'Half the names are gone from the stones. Five minutes left!' },
    ],
  },
  {
    id: 'esagila',
    title: 'The Night of Monsters',
    place: 'The Esagila, the house of Marduk',
    seed: 12403,
    mapSize: 'medium',
    creeps: false,
    players: [
      { pantheon: 'mesopotamian', team: 1 },
      { name: 'The Eleven Monsters', pantheon: 'mesopotamian', team: 2, difficulty: 'tutorial' },
    ],
    start: [
      { gold: 700, wood: 500, faith: 250, units: U(['warrior', 5], ['archer', 3]), buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'house' }, { type: 'temple', tag: 'esagila', ring: 11 }] },
      { townHp: 5000, units: U(['warrior', 4], ['archer', 2]) },
    ],
    waitFor: ['hold'], // razing the monsters' camp early does not end the night: the Esagila must still be kept until the dawn
    briefing: 'The Esagila, the house of Marduk, whose roof touches heaven. Tonight Tiamat sends her eleven monsters against it: scorpion men, lion-demons, the dragon mušḫuššu, and birds of the storm. If the house of Marduk falls, no god will dare to stand against her. Keep the Temple standing through ten minutes of darkness, until the dawn.',
    victory: 'The dawn has come, and the house of Marduk still stands. The gods have met in council, and they have chosen Marduk to fight Tiamat. But first the tablet of destinies must be won back from Kingu, who waits behind two great towers on the road to the sea.',
    defeat: 'The Esagila has fallen, and the gods have lost heart.',
    objectives: [
      { id: 'hold', kind: 'survive', seconds: 600, icon: '⏳', text: 'Hold out until the dawn' },
      { id: 'esagila', kind: 'protect', tag: 'esagila', icon: '🏛️', text: 'Keep the Temple of Marduk standing' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
    ],
    events: [
      { at: 4, say: 'The night is falling, and the monsters come with it. Put your soldiers between them and the Temple.' },
      { at: 75, spawn: { owner: 1, tag: 'w1', units: U(['warrior', 4], ['archer', 2]), at: 'front', march: true, target: 'esagila' } },
      { at: 165, spawn: { owner: 1, tag: 'w2', units: U(['warrior', 4], ['mesopotamian_slinger', 3], ['mesopotamian_scorpion_man', 1]), at: 'front', march: true, target: 'esagila' } },
      { at: 255, say: 'Scorpion men out of the dark, and a mušḫuššu behind them! Hold the line!', spawn: { owner: 1, tag: 'w3', units: U(['warrior', 4], ['archer', 3], ['mesopotamian_scorpion_man', 2], ['mesopotamian_mushussu', 1]), at: 'front', march: true, target: 'esagila' } },
      { at: 285, say: 'The lamassu, the winged bulls of the city gates, have come to stand beside you!', spawn: { owner: 0, tag: 'lamassu', units: U(['mesopotamian_lamassu', 2]), at: 'home' } },
      { at: 345, spawn: { owner: 1, tag: 'w4', units: U(['warrior', 6], ['mesopotamian_slinger', 4], ['mesopotamian_ugallu', 2]), at: 'front', march: true, target: 'esagila' } },
      { at: 435, say: 'Anzû birds in the dark sky! Archers, look up!', spawn: { owner: 1, tag: 'w5', units: U(['warrior', 5], ['archer', 4], ['mesopotamian_anzu', 3]), at: 'front', march: true, target: 'esagila' } },
      { at: 525, say: 'Two mušḫuššu lead the last of them. Hold until the dawn!', spawn: { owner: 1, tag: 'w6', units: U(['mesopotamian_mushussu', 2], ['warrior', 6], ['archer', 4], ['mesopotamian_scorpion_man', 2]), at: 'front', march: true, target: 'esagila' } },
      { at: 600, spawn: { owner: 0, tag: 'guards', units: U(['warrior', 8], ['mesopotamian_slinger', 4]), at: 'home' } },
    ],
  },
  {
    id: 'kingu',
    title: 'The Towers of Kingu',
    place: 'The road to the salt sea',
    seed: 12504,
    mapSize: 'small',
    players: [
      { pantheon: 'mesopotamian', team: 1 },
      { name: 'Wardens of Kingu', pantheon: 'mesopotamian', team: 2, difficulty: 'easy' },
    ],
    start: [
      { gold: 700, wood: 500, faith: 150, units: U(['warrior', 4], ['archer', 3]), buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'house' }] },
      { gold: 400, wood: 300, buildings: [{ type: 'tower', tag: 'towers', ring: 9 }, { type: 'tower', tag: 'towers', ring: 9 }, { type: 'barracks', ring: 7 }] },
    ],
    briefing: 'On the road to the salt sea, Kingu has raised two great towers, and the tablet of destinies is kept between them. Muster an army, then tear the towers down. Two mušḫuššu, the serpent-dragons of Tiamat, lie before them. Bring them down too, if you can.',
    victory: 'Kingu\'s towers have fallen, and the tablet of destinies is fastened on the breast of Marduk. Only Tiamat is left, the salt sea herself. And across the desert the horsemen of Oyo have come, who remember how the world stood with them against the dragon of the swamp.',
    defeat: 'Kingu\'s towers still stand, and the tablet is still his. Try again.',
    objectives: [
      { id: 'army', kind: 'army', count: 14, icon: '⚔️', text: 'Muster an army of fourteen soldiers' },
      { id: 'towers', kind: 'destroy', tag: 'towers', icon: '🗼', text: 'Tear down Kingu\'s two towers', hidden: true },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
      { id: 'mushussu', kind: 'kill', tag: 'mushussu', optional: true, icon: '🐍', text: 'Bonus: slay the two mušḫuššu' },
    ],
    events: [
      { at: 2, spawn: { owner: 1, tag: 'mushussu', units: U(['mesopotamian_mushussu', 2]), at: 'front', guard: true } },
      { at: 4, say: 'The towers stand beyond the wardens\' camp. Gather wood and gold, and muster your army.' },
      { after: 'army', say: 'Your army is ready. Now tear down the towers!', reveal: 'towers' },
      { at: 540, say: 'The wardens come out to meet you, with scorpion men at their side!', spawn: { owner: 1, tag: 'wardens', units: U(['mesopotamian_scorpion_man', 3], ['mesopotamian_ugallu', 1], ['mesopotamian_slinger', 3]), at: 'front', march: true } },
    ],
  },
  {
    id: 'salt_sea',
    title: 'The Tablet of Destinies',
    place: 'Where the two rivers meet the sea',
    seed: 12606,
    mapSize: 'medium',
    players: [
      { pantheon: 'mesopotamian', team: 1 },
      { name: 'Host of Kingu', pantheon: 'mesopotamian', team: 2, difficulty: 'normal' },
      { name: 'Horsemen of Oyo', pantheon: 'west_african', team: 1, difficulty: 'normal' },
      { name: 'Children of Tiamat', pantheon: 'mesopotamian', team: 2, difficulty: 'easy' },
    ],
    start: [
      { gold: 700, wood: 500, faith: 200, units: U(['warrior', 4], ['archer', 3]), buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'house' }] },
      { gold: 900, wood: 700, faith: 200, buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'tower', ring: 8 }] },
      {},
      { gold: 600, wood: 400 },
    ],
    waitFor: ['tiamat'], // breaking Kingu's host before 13:00 does not end it: Tiamat still rises, and must fall
    briefing: 'Where the Tigris and the Euphrates run into the salt sea, the last of Kingu\'s host stands on the shore, and behind them the water is rising. The horsemen of Oyo stand with us. Break Kingu\'s host. And when Tiamat comes up out of the sea, bring the mother of monsters down, and end this war for ever.',
    victory: 'Marduk\'s net has caught the salt sea, and his storm winds have filled her. Tiamat has fallen, and out of her body the heavens and the earth are made anew. The tablet of destinies is with the gods again, and eight peoples have now stood together against the dark.',
    defeat: 'Tiamat has risen, and the salt sea has covered the land between the rivers. Try again.',
    objectives: [
      { id: 'conquer', kind: 'conquer', icon: '🔥', text: 'Break the host of Kingu and the children of Tiamat' },
      { id: 'tiamat', kind: 'kill', tag: 'tiamat', icon: '🐉', text: 'Slay Tiamat, the salt sea', hidden: true, waitText: 'Tiamat rises from the sea' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
    ],
    events: [
      { at: 4, say: 'The horsemen of Oyo stand beside you. Build, summon, and strike.' },
      { at: 720, say: 'The sea is boiling at the river mouths. Something vast is coming up out of the deep.' },
      { at: 780, say: 'Tiamat rises from the salt sea! Bring the mother of monsters down!', reveal: 'tiamat', spawn: { owner: 1, tag: 'tiamat', units: U(['mesopotamian_tiamat', 1]), at: 'front', march: true, always: true } },
      { after: 'tiamat', say: 'Tiamat has fallen! Now finish Kingu\'s host.' },
      // Her monsters, on a tag of their own: "Slay Tiamat" is done when she falls, not when the last of them does.
      { at: 780, spawn: { owner: 1, tag: 'tiamat_brood', units: U(['mesopotamian_mushussu', 2], ['mesopotamian_ugallu', 2]), at: 'front', march: true, always: true } },
    ],
  },
];

const DRAGON_KING = [
  {
    id: 'chentang',
    title: 'The Pass of Chentang',
    place: 'Chentang Pass, by the Eastern Sea',
    seed: 13101,
    mapSize: 'small',
    creeps: false,
    players: [
      { pantheon: 'chinese', team: 1 },
      { name: 'Yaksha of the Sea', pantheon: 'chinese', team: 2, difficulty: 'tutorial' },
    ],
    start: [
      { gold: 500, wood: 300, faith: 80, units: U(['warrior', 3]), buildings: [{ type: 'storehouse', tag: 'granary', ring: 8 }] },
      { townHp: 1500, units: U(['warrior', 3], ['archer', 2]) },
    ],
    briefing: 'Chentang Pass, where the mountains come down to the Eastern Sea. Ao Guang, the Dragon King of the Eastern Sea, has sent no rain for three years, and now he demands the town\'s rice as tribute, or he will send the sea itself. His yaksha, the sea demons, are already coming ashore. Raise a Temple, call the gods of heaven, and keep the granary standing: it is all that stands between the town and hunger.',
    victory: 'The yaksha are driven back into the waves. But the Dragon King has heard, and he is angry. His servants have gone up into the mountains of Kunlun, to break the shrines where the people pray for rain.',
    defeat: 'The yaksha emptied the granary, and the town will starve. Gather your people and try again.',
    objectives: [
      { id: 'temple', kind: 'build', type: 'temple', count: 1, icon: '🏛️', text: 'Raise a Temple' },
      { id: 'god', kind: 'gods', count: 1, icon: '☁️', text: 'Summon a god of heaven' },
      { id: 'raid', kind: 'kill', tag: 'raid', icon: '⚔️', text: 'Drive off the yaksha of the sea', hidden: true },
      { id: 'granary', kind: 'protect', tag: 'granary', icon: '🌾', text: 'Keep the granary standing' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
      { id: 'camp', kind: 'conquer', optional: true, icon: '🔥', text: 'Bonus: burn the yaksha\'s camp' },
    ],
    events: [
      { at: 4, say: 'The sea is restless below the pass. The yaksha will come for the rice. Make ready.' },
      { at: 270, say: 'The yaksha come up out of the surf with their crossbows! They make for the granary.', reveal: 'raid', spawn: { owner: 1, tag: 'raid', units: U(['warrior', 3], ['chinese_crossbowman', 3]), at: 'front', march: true, target: 'granary' } },
      { after: 'raid', say: 'The yaksha are broken. Finish what you started.' },
    ],
  },
  {
    id: 'kunlun',
    title: 'The Shrines of Kunlun',
    place: 'The mountains of Kunlun',
    seed: 13301,
    mapSize: 'small',
    players: [
      { pantheon: 'chinese', team: 1 },
      { name: 'Servants of Ao Guang', pantheon: 'chinese', team: 2, difficulty: 'easy' },
    ],
    start: [
      { gold: 600, wood: 400, faith: 150, units: U(['warrior', 3], ['archer', 2], ['priest', 2]), buildings: [{ type: 'barracks' }, { type: 'house' }] },
      {},
    ],
    briefing: 'High in the mountains of Kunlun stand the shrines where the people have prayed for rain since the first emperors. The Dragon King\'s servants have taken them, and they mean to break them stone by stone. Send your Worshippers and Priests to the holy stones, and hold two of them together for a minute and a half. Be quick: in eighteen minutes the shrines will be rubble.',
    victory: 'The shrines of Kunlun are ours. But from the peaks we saw the sea rising. Tonight the Dragon King will send the flood against Chentang, and the temple of the town must not fall.',
    defeat: 'The shrines are broken, and no prayer for rain will be heard. Try again, and stand on the holy stones.',
    objectives: [
      { id: 'stones', kind: 'hold', count: 2, seconds: 90, limit: 1080, icon: '✨', text: 'Hold two sacred sites at once for 1:30' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
    ],
    events: [
      { at: 4, say: 'The sacred sites glow on the map. Stand a Worshipper or a Priest on one, with no enemy near, to take it.' },
      { at: 360, say: 'A dragon of the sea flies over the peaks! Archers, look up!', spawn: { owner: 1, tag: 'dragon', units: U(['chinese_celestial_dragon', 1], ['warrior', 3]), at: 'front', march: true } },
      { at: 780, say: 'The servants are breaking the stones. Five minutes left!' },
    ],
  },
  {
    id: 'flood_night',
    title: 'The Night of the Flood',
    place: 'The temple of Chentang',
    seed: 13403,
    mapSize: 'medium',
    creeps: false,
    players: [
      { pantheon: 'chinese', team: 1 },
      { name: 'Tide of the East Sea', pantheon: 'chinese', team: 2, difficulty: 'tutorial' },
    ],
    start: [
      { gold: 700, wood: 500, faith: 250, units: U(['warrior', 5], ['archer', 3]), buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'house' }, { type: 'temple', tag: 'shrine', ring: 11 }] },
      { townHp: 5000, units: U(['warrior', 4], ['archer', 2]) },
    ],
    waitFor: ['hold'], // razing the sea camp early does not end the night: the temple must still be kept until the dawn
    briefing: 'Tonight the Dragon King sends the sea against Chentang. Wave after wave of his yaksha will come with the tide, and his dragons with them, to drown the temple where the town prays. Keep the Temple standing through ten minutes of darkness, and at dawn the tide will turn.',
    victory: 'The dawn has come, and the tide has gone out. The temple of Chentang still stands. Now the Dragon King hides behind the sea gates, two towers at the edge of the water. The Monkey King knows the way: he once stole his iron staff from Ao Guang\'s own treasury.',
    defeat: 'The flood has taken the temple, and Chentang is under the sea.',
    objectives: [
      { id: 'hold', kind: 'survive', seconds: 600, icon: '⏳', text: 'Hold out until the dawn' },
      { id: 'shrine', kind: 'protect', tag: 'shrine', icon: '🏛️', text: 'Keep the Temple of Chentang standing' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
    ],
    events: [
      { at: 4, say: 'The tide is coming in, and the yaksha with it. Put your soldiers between the sea and the Temple.' },
      { at: 75, spawn: { owner: 1, tag: 'w1', units: U(['warrior', 4], ['archer', 2]), at: 'front', march: true, target: 'shrine' } },
      { at: 165, spawn: { owner: 1, tag: 'w2', units: U(['warrior', 4], ['chinese_crossbowman', 3]), at: 'front', march: true, target: 'shrine' } },
      { at: 255, say: 'A sea dragon rides the tide with them! Hold the line!', spawn: { owner: 1, tag: 'w3', units: U(['warrior', 4], ['archer', 3], ['chinese_celestial_dragon', 1]), at: 'front', march: true, target: 'shrine' } },
      { at: 285, say: 'The fenghuang, the birds of peace, have flown down from the mountains to your side!', spawn: { owner: 0, tag: 'fenghuang', units: U(['chinese_fenghuang', 3]), at: 'home' } },
      { at: 345, spawn: { owner: 1, tag: 'w4', units: U(['warrior', 6], ['chinese_crossbowman', 4], ['archer', 2]), at: 'front', march: true, target: 'shrine' } },
      { at: 435, say: 'Two dragons in the storm! Archers, look up!', spawn: { owner: 1, tag: 'w5', units: U(['warrior', 5], ['archer', 4], ['chinese_celestial_dragon', 2]), at: 'front', march: true, target: 'shrine' } },
      { at: 525, say: 'The last wave of the tide is coming. Hold until the dawn!', spawn: { owner: 1, tag: 'w6', units: U(['chinese_celestial_dragon', 1], ['warrior', 6], ['archer', 4], ['chinese_crossbowman', 2]), at: 'front', march: true, target: 'shrine' } },
      { at: 600, spawn: { owner: 0, tag: 'lions', units: U(['chinese_guardian_lion', 3], ['warrior', 6], ['chinese_crossbowman', 2]), at: 'home' } },
    ],
  },
  {
    id: 'sea_gates',
    title: 'The Sea Gates',
    place: 'The shore of the Eastern Sea',
    seed: 13504,
    mapSize: 'small',
    players: [
      { pantheon: 'chinese', team: 1 },
      { name: 'Keepers of the Gate', pantheon: 'chinese', team: 2, difficulty: 'easy' },
    ],
    start: [
      { gold: 700, wood: 500, faith: 150, units: U(['warrior', 4], ['archer', 3]), buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'house' }] },
      { gold: 400, wood: 300, buildings: [{ type: 'tower', tag: 'gates', ring: 9 }, { type: 'tower', tag: 'gates', ring: 9 }, { type: 'barracks', ring: 7 }] },
    ],
    briefing: 'At the edge of the Eastern Sea the Dragon King has raised two towers, the gates of his drowned kingdom. While they stand, no army can reach his palace under the waves. Muster an army, then tear the towers down. Two of his dragons circle above them. Bring them down too, if you can.',
    victory: 'The sea gates have fallen, and the road into the Dragon King\'s kingdom lies open. Ao Guang has called his three brothers, the Dragon Kings of the South, the West and the North, to rise with him. And from the land between the rivers, an old friend has come: the slingers of Babylon, who have fought the sea before.',
    defeat: 'The sea gates still stand. Try again.',
    objectives: [
      { id: 'army', kind: 'army', count: 14, icon: '⚔️', text: 'Muster an army of fourteen soldiers' },
      { id: 'gates', kind: 'destroy', tag: 'gates', icon: '🗼', text: 'Tear down the two sea gates', hidden: true },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
      { id: 'dragons', kind: 'kill', tag: 'dragons', optional: true, icon: '🐉', text: 'Bonus: bring down the two dragons' },
    ],
    events: [
      { at: 2, spawn: { owner: 1, tag: 'dragons', units: U(['chinese_celestial_dragon', 2]), at: 'front', guard: true } },
      { at: 4, say: 'The gates stand beyond the keepers\' camp. Gather wood and gold, and muster your army.' },
      { after: 'army', say: 'Your army is ready. Now tear down the gates!', reveal: 'gates' },
      { at: 540, say: 'The keepers come out to meet you, with crossbows and a dragon above them!', spawn: { owner: 1, tag: 'keepers', units: U(['chinese_crossbowman', 4], ['chinese_celestial_dragon', 1], ['warrior', 3]), at: 'front', march: true } },
    ],
  },
  {
    id: 'east_sea',
    title: 'The Four Dragon Kings',
    place: 'The palace under the Eastern Sea',
    seed: 13611,
    mapSize: 'medium',
    players: [
      { pantheon: 'chinese', team: 1 },
      { name: 'Host of Ao Guang', pantheon: 'chinese', team: 2, difficulty: 'normal' },
      { name: 'Slingers of Babylon', pantheon: 'mesopotamian', team: 1, difficulty: 'normal' },
      { name: 'Yaksha of the Deep', pantheon: 'chinese', team: 2, difficulty: 'easy' },
    ],
    start: [
      { gold: 700, wood: 500, faith: 200, units: U(['warrior', 4], ['archer', 3]), buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'house' }] },
      { gold: 900, wood: 700, faith: 200, buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'tower', ring: 8 }] },
      {},
      { gold: 600, wood: 400 },
    ],
    waitFor: ['kings'], // breaking the host before 13:00 does not end it: the four Dragon Kings still rise, and must fall
    briefing: 'The shore of the Eastern Sea, where the water has drawn back to show the road to the Dragon King\'s palace. His host and his yaksha stand before it, and the slingers of Babylon stand with us. Break them. And when the four Dragon Kings rise out of the sea together, keep your archers close, and bring them down.',
    victory: 'The four Dragon Kings have fallen into the sea, and they have sworn by heaven to send the rain in its season. That night the rain came down on Chentang, soft and warm, and the rice stood green again. Nine peoples have now stood together against the dark.',
    defeat: 'The Dragon Kings have risen, and the sea has covered Chentang. Try again.',
    objectives: [
      { id: 'conquer', kind: 'conquer', icon: '🔥', text: 'Break the host of Ao Guang and the yaksha of the deep' },
      { id: 'kings', kind: 'kill', tag: 'kings', icon: '🐉', text: 'Bring down the four Dragon Kings', hidden: true, waitText: 'The Dragon Kings rise' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
    ],
    events: [
      { at: 4, say: 'The slingers of Babylon stand beside you. Build, summon, and strike.' },
      { at: 720, say: 'The sea is drawing back from the shore. Something is coming up out of the deep.' },
      { at: 780, say: 'The four Dragon Kings rise out of the sea together! Bring them down!', reveal: 'kings', spawn: { owner: 1, tag: 'kings', units: U(['chinese_celestial_dragon', 4]), at: 'front', march: true, always: true } },
      { after: 'kings', say: 'The Dragon Kings have fallen! Now finish their host.' },
      // Their yaksha, on a tag of their own: "Bring down the four Dragon Kings" is done when the dragons fall.
      { at: 780, spawn: { owner: 1, tag: 'kings_guard', units: U(['chinese_crossbowman', 4], ['warrior', 4]), at: 'front', march: true, always: true } },
    ],
  },
];

const POISONED_RIVER = [
  {
    id: 'vrindavan',
    title: 'The Herds of Vrindavan',
    place: 'Vrindavan, on the Yamuna',
    seed: 14101,
    mapSize: 'small',
    creeps: false,
    players: [
      { pantheon: 'hindu', team: 1 },
      { name: 'Serpents of Kaliya', pantheon: 'hindu', team: 2, difficulty: 'tutorial' },
    ],
    start: [
      { gold: 500, wood: 300, faith: 80, units: U(['warrior', 3]), buildings: [{ type: 'storehouse', tag: 'herds', ring: 8 }] },
      { townHp: 1500, units: U(['warrior', 3], ['archer', 2]) },
    ],
    briefing: 'Vrindavan, the village of the cowherds, on the banks of the river Yamuna. Kaliya, the king of the nagas, has made his home in the river, and his venom has turned the water black. The cattle that drink from it fall dead, and the trees on the bank are bare. Now his serpents are coming up the bank to burn the cowherds\' stores and drive the people away. Raise a Temple, call the gods, and keep the storehouse standing.',
    victory: 'The serpents have slid back into the black water. But the river is still poison, and it is spreading. The old cowherds say the kadamba grove upstream is holy, and while its stones are tended, one stretch of the river stays clean.',
    defeat: 'The serpents burned the stores, and the cowherds have fled Vrindavan. Gather your people and try again.',
    objectives: [
      { id: 'temple', kind: 'build', type: 'temple', count: 1, icon: '🏛️', text: 'Raise a Temple' },
      { id: 'god', kind: 'gods', count: 1, icon: '🔱', text: 'Summon one of the gods' },
      { id: 'raid', kind: 'kill', tag: 'raid', icon: '⚔️', text: 'Drive off the serpents of Kaliya', hidden: true },
      { id: 'herds', kind: 'protect', tag: 'herds', icon: '🌾', text: 'Keep the cowherds\' storehouse standing' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
      { id: 'camp', kind: 'conquer', optional: true, icon: '🔥', text: 'Bonus: burn the serpents\' camp' },
    ],
    events: [
      { at: 4, say: 'The river is black this morning, and the reeds are moving. The serpents will come for the stores. Make ready.' },
      { at: 270, say: 'They are on the bank, and a naga is with them, spitting venom! They make for the storehouse.', reveal: 'raid', spawn: { owner: 1, tag: 'raid', units: U(['warrior', 3], ['archer', 2], ['hindu_naga', 1]), at: 'front', march: true, target: 'herds' } },
      { after: 'raid', say: 'The serpents are broken. Finish what you started.' },
    ],
  },
  {
    id: 'kadamba',
    title: 'The Kadamba Grove',
    place: 'The kadamba grove, upstream',
    seed: 14301,
    mapSize: 'small',
    players: [
      { pantheon: 'hindu', team: 1 },
      { name: 'Priests of the Naga', pantheon: 'hindu', team: 2, difficulty: 'easy' },
    ],
    start: [
      { gold: 600, wood: 400, faith: 150, units: U(['warrior', 3], ['archer', 2], ['priest', 2]), buildings: [{ type: 'barracks' }, { type: 'house' }] },
      {},
    ],
    briefing: 'The kadamba grove, where one great tree still stands green above the poisoned river. Kaliya\'s priests have taken the holy stones around it, and they are pouring venom on its roots. Send your Worshippers and Priests to the stones, and hold two of them together for a minute and a half. Be quick: in eighteen minutes the last green tree on the Yamuna will be dead.',
    victory: 'The grove is ours, and the kadamba tree still stands. But Kaliya has felt it. Tonight he sends everything that crawls in the river against the temple of Vrindavan.',
    defeat: 'The kadamba tree is dead, and the whole river is poison. Try again, and stand on the holy stones.',
    objectives: [
      { id: 'stones', kind: 'hold', count: 2, seconds: 90, limit: 1080, icon: '✨', text: 'Hold two sacred sites at once for 1:30' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
    ],
    events: [
      { at: 4, say: 'The sacred sites glow on the map. Stand a Worshipper or a Priest on one, with no enemy near, to take it.' },
      { at: 360, say: 'Nagas in the grove! The priests send them to drive you from the stones.', spawn: { owner: 1, tag: 'nagas', units: U(['hindu_naga', 2], ['warrior', 3]), at: 'front', march: true } },
      { at: 780, say: 'The leaves of the kadamba are falling. Five minutes left!' },
    ],
  },
  {
    id: 'yamuna_night',
    title: 'The Night on the Yamuna',
    place: 'The temple of Vrindavan',
    seed: 14403,
    mapSize: 'medium',
    creeps: false,
    players: [
      { pantheon: 'hindu', team: 1 },
      { name: 'Brood of the River', pantheon: 'hindu', team: 2, difficulty: 'tutorial' },
    ],
    start: [
      { gold: 700, wood: 500, faith: 250, units: U(['warrior', 5], ['archer', 3]), buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'house' }, { type: 'temple', tag: 'mandir', ring: 11 }] },
      { townHp: 5000, units: U(['warrior', 4], ['archer', 2]) },
    ],
    waitFor: ['hold'], // razing the brood's camp early does not end the night: the temple must still be kept until the dawn
    briefing: 'Tonight the river comes for Vrindavan. Kaliya\'s brood will crawl out of the black water, wave after wave, to pull down the temple where the people pray to Vishnu. Keep the Temple standing through ten minutes of darkness. Help is coming on great wings: Garuda, the eagle of Vishnu, is the enemy of every serpent.',
    victory: 'The dawn has come, and the temple still stands. Garuda has seen where Kaliya hides: in a deep pool of the river, behind two towers his serpents have raised on the bank.',
    defeat: 'The temple of Vrindavan has fallen, and the river has taken the village.',
    objectives: [
      { id: 'hold', kind: 'survive', seconds: 600, icon: '⏳', text: 'Hold out until the dawn' },
      { id: 'mandir', kind: 'protect', tag: 'mandir', icon: '🏛️', text: 'Keep the Temple of Vrindavan standing' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
    ],
    events: [
      { at: 4, say: 'The night is falling, and the river is stirring. Put your soldiers between the water and the Temple.' },
      { at: 75, spawn: { owner: 1, tag: 'w1', units: U(['warrior', 4], ['archer', 2]), at: 'front', march: true, target: 'mandir' } },
      { at: 165, spawn: { owner: 1, tag: 'w2', units: U(['warrior', 4], ['archer', 2], ['hindu_naga', 1]), at: 'front', march: true, target: 'mandir' } },
      { at: 255, say: 'Nagas out of the black water! Hold the line!', spawn: { owner: 1, tag: 'w3', units: U(['warrior', 4], ['archer', 3], ['hindu_naga', 2]), at: 'front', march: true, target: 'mandir' } },
      { at: 285, say: 'Garuda has come! The eagle of Vishnu falls on the serpents!', spawn: { owner: 0, tag: 'garuda', units: U(['hindu_garuda', 1]), at: 'home' } },
      { at: 345, spawn: { owner: 1, tag: 'w4', units: U(['warrior', 6], ['archer', 3], ['hindu_naga', 2]), at: 'front', march: true, target: 'mandir' } },
      { at: 435, say: 'More nagas, and the largest yet! Archers, aim for the hoods!', spawn: { owner: 1, tag: 'w5', units: U(['warrior', 5], ['archer', 4], ['hindu_naga', 3]), at: 'front', march: true, target: 'mandir' } },
      { at: 525, say: 'The last of the brood is coming. Hold until the dawn!', spawn: { owner: 1, tag: 'w6', units: U(['hindu_naga', 3], ['warrior', 6], ['archer', 4]), at: 'front', march: true, target: 'mandir' } },
      { at: 600, spawn: { owner: 0, tag: 'vanaras', units: U(['hindu_vanara', 4], ['warrior', 6], ['archer', 2]), at: 'home' } },
    ],
  },
  {
    id: 'naga_towers',
    title: 'The Serpent Towers',
    place: 'The deep pool of the Yamuna',
    seed: 14504,
    mapSize: 'small',
    players: [
      { pantheon: 'hindu', team: 1 },
      { name: 'Guards of the Pool', pantheon: 'hindu', team: 2, difficulty: 'easy' },
    ],
    start: [
      { gold: 700, wood: 500, faith: 150, units: U(['warrior', 4], ['archer', 3]), buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'house' }] },
      { gold: 400, wood: 300, buildings: [{ type: 'tower', tag: 'towers', ring: 9 }, { type: 'tower', tag: 'towers', ring: 9 }, { type: 'barracks', ring: 7 }] },
    ],
    briefing: 'On the bank above Kaliya\'s pool, his serpents have raised two towers, and from them they watch every path to the water. Muster an army, then tear the towers down. Two great nagas lie coiled before them. Bring them down too, if you can.',
    victory: 'The serpent towers have fallen, and the way to the pool is open. And up the river road, under red banners, an old friend has come: the crossbows of Chentang, who know what it is to fight a king of the water.',
    defeat: 'The serpent towers still stand. Try again.',
    objectives: [
      { id: 'army', kind: 'army', count: 14, icon: '⚔️', text: 'Muster an army of fourteen soldiers' },
      { id: 'towers', kind: 'destroy', tag: 'towers', icon: '🗼', text: 'Tear down the two serpent towers', hidden: true },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
      { id: 'nagas', kind: 'kill', tag: 'nagas', optional: true, icon: '🐍', text: 'Bonus: slay the two great nagas' },
    ],
    events: [
      { at: 2, spawn: { owner: 1, tag: 'nagas', units: U(['hindu_naga', 2]), at: 'front', guard: true } },
      { at: 4, say: 'The towers stand beyond the guards\' camp. Gather wood and gold, and muster your army.' },
      { after: 'army', say: 'Your army is ready. Now tear down the towers!', reveal: 'towers' },
      { at: 540, say: 'The guards of the pool come out to meet you, with nagas at their side!', spawn: { owner: 1, tag: 'guards', units: U(['hindu_naga', 3], ['warrior', 3], ['archer', 3]), at: 'front', march: true } },
    ],
  },
  {
    id: 'kaliya',
    title: 'The Serpent King',
    place: 'Kaliya\'s pool',
    seed: 14605,
    mapSize: 'medium',
    players: [
      { pantheon: 'hindu', team: 1 },
      { name: 'Host of Kaliya', pantheon: 'hindu', team: 2, difficulty: 'normal' },
      { name: 'Chentang Crossbows', pantheon: 'chinese', team: 1, difficulty: 'normal' },
      { name: 'Brood of the Pool', pantheon: 'hindu', team: 2, difficulty: 'easy' },
    ],
    start: [
      { gold: 700, wood: 500, faith: 200, units: U(['warrior', 4], ['archer', 3]), buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'house' }] },
      { gold: 900, wood: 700, faith: 200, buildings: [{ type: 'barracks' }, { type: 'house' }, { type: 'tower', ring: 8 }] },
      {},
      { gold: 600, wood: 400 },
    ],
    waitFor: ['kaliya'], // breaking the host before 13:00 does not end it: Kaliya still rises, and must fall
    briefing: 'Kaliya\'s pool, where the Yamuna runs deepest and blackest. His host and his brood hold the banks, and the crossbows of Chentang stand with us. Break them. And when the serpent king himself rises from the pool, with his queens around him, bring them down, and let the river run clean.',
    victory: 'Kaliya is beaten. He has bowed his many heads and sworn to leave the Yamuna for the far ocean, and never to return. The river runs clear, the kadamba is in flower, and the herds are drinking at the bank. Ten peoples have now stood together against the dark, and every one of them has its tale.',
    defeat: 'Kaliya has risen, and the Yamuna is poison from the mountains to the sea. Try again.',
    objectives: [
      { id: 'conquer', kind: 'conquer', icon: '🔥', text: 'Break the host of Kaliya and the brood of the pool' },
      { id: 'kaliya', kind: 'kill', tag: 'kaliya', icon: '🐍', text: 'Bring down Kaliya and his serpent queens', hidden: true, waitText: 'Kaliya rises from the pool' },
      { id: 'home', kind: 'protect', tag: 'home', icon: '🛡️', text: 'Keep your Town Center standing' },
    ],
    events: [
      { at: 4, say: 'The crossbows of Chentang stand beside you. Build, summon, and strike.' },
      { at: 720, say: 'The pool is boiling, and the water is turning blacker still. The serpent king is waking.' },
      { at: 780, say: 'Kaliya rises from the pool, with his queens around him! Bring them down!', reveal: 'kaliya', spawn: { owner: 1, tag: 'kaliya', units: U(['hindu_naga', 6]), at: 'front', march: true, always: true } },
      { after: 'kaliya', say: 'The serpent king is beaten! Now finish his host.' },
      // His guard, on a tag of their own: "Bring down Kaliya" is done when the nagas fall.
      { at: 780, spawn: { owner: 1, tag: 'kaliya_guard', units: U(['warrior', 5], ['archer', 4]), at: 'front', march: true, always: true } },
    ],
  },
];

/** The chapters, in order; a chapter's first mission opens once the last of the chapter before is won. */
export const CHAPTERS = Object.freeze([
  {
    id: 'long_winter',
    chapter: 'Chapter I',
    title: 'The Long Winter',
    pantheon: 'greek',
    people: 'the Greeks',
    blurb: 'A cold sun, strange sails, and a trickster god in the north. Five battles for the Greeks of Thera.',
    missions: LONG_WINTER,
  },
  {
    id: 'wolf_age',
    chapter: 'Chapter II',
    title: 'The Wolf Age',
    pantheon: 'norse',
    people: 'the Norse',
    blurb: 'Loki has slipped his chains, and the winter will not end. Five battles for the Norse of Hordaland, to stop the end of the world.',
    missions: WOLF_AGE,
  },
  {
    id: 'chaos_sea',
    chapter: 'Chapter III',
    title: 'The Sea of Chaos',
    pantheon: 'egyptian',
    people: 'the Egyptians',
    blurb: 'Out of the east come the priests of Tiamat, to drown the world in the sea of chaos. Five battles for the Egyptians of the Nile.',
    missions: CHAOS_SEA,
  },
  {
    id: 'balor_eye',
    chapter: 'Chapter IV',
    title: 'The Eye of Balor',
    pantheon: 'celtic',
    people: 'the Celts',
    blurb: 'Out of the western sea come the Fomorians, and their king Balor has an eye that burns whatever it looks upon. Five battles for the Tuatha Dé Danann of Ériu.',
    missions: BALOR_EYE,
  },
  {
    id: 'serpent',
    chapter: 'Chapter V',
    title: 'The Eight-Headed Serpent',
    pantheon: 'japanese',
    people: 'the Japanese',
    blurb: 'In the hills of Izumo a cult has woken Yamata no Orochi, the serpent of eight heads that eats a maiden every year. Five battles for the people of Izumo.',
    missions: SERPENT,
  },
  {
    id: 'new_fire',
    chapter: 'Chapter VI',
    title: 'The New Fire',
    pantheon: 'aztec',
    people: 'the Aztecs',
    blurb: 'The great cycle is ending, and every fire is out. If the new fire fails, the sun will not rise. Five battles for the Mexica of the lake city.',
    missions: NEW_FIRE,
  },
  {
    id: 'dragon_swamp',
    chapter: 'Chapter VII',
    title: 'The Dragon of the Swamp',
    pantheon: 'west_african',
    people: 'the West Africans',
    blurb: 'The rains have failed, and in the mangroves a cult feeds a dragon no one may look on and live. Five battles for the people of Oyo.',
    missions: DRAGON_SWAMP,
  },
  {
    id: 'tablet',
    chapter: 'Chapter VIII',
    title: 'The Tablet of Destinies',
    pantheon: 'mesopotamian',
    people: 'the Mesopotamians',
    blurb: 'Kingu has stolen the tablet of destinies, and Tiamat\'s eleven monsters are marching on Babylon. Five battles for the people of the two rivers.',
    missions: TABLET,
  },
  {
    id: 'dragon_king',
    chapter: 'Chapter IX',
    title: 'The Dragon King\'s Flood',
    pantheon: 'chinese',
    people: 'the Chinese',
    blurb: 'Ao Guang, the Dragon King of the Eastern Sea, has held back the rain for three years, and now he sends the flood. Five battles for the people of Chentang.',
    missions: DRAGON_KING,
  },
  {
    id: 'poisoned_river',
    chapter: 'Chapter X',
    title: 'The Poisoned River',
    pantheon: 'hindu',
    people: 'the Hindus',
    blurb: 'Kaliya, the king of the nagas, has made his home in the Yamuna, and his venom has turned the river black. Five battles for the cowherds of Vrindavan.',
    missions: POISONED_RIVER,
  },
].map((c, ci) => Object.freeze({
  ...c,
  n: ci + 1,
  missions: Object.freeze(c.missions.map((m, i) => Object.freeze({ ...m, n: i + 1, chapter: c.id }))),
})));

export const CHAPTER_BY_ID = Object.freeze(Object.fromEntries(CHAPTERS.map((c) => [c.id, c])));

/** Every mission of every chapter, in the order they open. */
export const MISSIONS = Object.freeze(CHAPTERS.flatMap((c) => c.missions));

export const MISSION_BY_ID = Object.freeze(Object.fromEntries(MISSIONS.map((m) => [m.id, m])));

/** The chapter a mission (or mission id) belongs to, or null. */
export function chapterOf(m) {
  const mission = typeof m === 'string' ? MISSION_BY_ID[m] : m;
  return mission && Object.hasOwn(CHAPTER_BY_ID, mission.chapter) ? CHAPTER_BY_ID[mission.chapter] : null;
}

/** The mission after this one (the next chapter's first after a chapter's last), or null for the very last. */
export function nextMission(id) {
  const i = MISSIONS.findIndex((m) => m.id === id);
  return i >= 0 && i + 1 < MISSIONS.length ? MISSIONS[i + 1] : null;
}

/** Short file name of a spoken line: the mission, what it is, and a hash of its words (so new words need a new clip). */
export function clipName(missionId, part, text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return `${missionId}-${part}-${h.toString(16).padStart(8, '0').slice(0, 6)}.mp3`;
}

/** Every line the campaign says, as { file, text }: each mission's briefing, its victory, and its events' lines. */
export function campaignLines() {
  const out = [];
  for (const m of MISSIONS) {
    out.push({ file: clipName(m.id, 'briefing', m.briefing), text: m.briefing });
    out.push({ file: clipName(m.id, 'victory', m.victory), text: m.victory });
    m.events.forEach((e, i) => {
      if (e.say) out.push({ file: clipName(m.id, `e${i}`, e.say), text: e.say });
    });
  }
  return out;
}
