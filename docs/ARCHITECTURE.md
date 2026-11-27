# Architecture

How Mythic War is put together. For exact rules, numbers and APIs follow the DESIGN.md section numbers given here. For a feature's detailed code map, see the matching note in [knowledge/](knowledge/README.md).

## The big picture

```
 index.html ─ importmap (three -> vendor/three) ─ src/main.js
     │
     ├─ settings (src/settings.js), audio (src/audio/audio.js), service worker (src/offline.js)
     ├─ intro film (src/ui/intro.js + src/intro/*) on every launch, then the menu
     └─ menu (src/ui/menu.js + menu-*.js) ── lobby (src/net/lobby.js) ── launch {setup, ...}
                                                       │
                                                       ▼
                                   Game (src/game/game.js)  ── window.__game
            ┌───────────────────────────┼───────────────────────────────┐
            ▼                           ▼                               ▼
   HostSession (src/net/session.js)  ClientSession                 ReplaySession (src/game/replay-session.js)
   ├─ World (src/sim/world.js)       (receives snapshots +          (re-runs recorded commands)
   ├─ createAI per AI seat            deltas, sends commands)
   ├─ Ticker: 20 ticks/s (DT 0.05)
   └─ snapshot -> delta -> clients
            │
            ▼
   ViewState (src/game/view-state.js): interpolated client view, same on host and client
            │
   ┌────────┼──────────────────────────────┬──────────────────────────┐
   ▼        ▼                              ▼                          ▼
 GameRenderer (src/render)   Hud (src/ui/hud.js)   InputController (src/ui/input.js)   trackers: alerts, career,
 terrain, units, VFX, fog    panels, minimap,      selection, orders, hotkeys,          chronicle, music director,
                             command card          touch, gamepad -> sendCommand()     saver, replay recorder
```

Single player is the same as hosting with no remote connections: the local browser runs `HostSession` with the `World` and the AIs. A client never runs the sim; it only sees snapshots. That is why the whole game is "host-authoritative" even offline.

## Layers

### Data (`src/data/`, `src/config.js`) — DESIGN 4

Pure data and small pure helpers, no DOM, no three.js. Shared by sim, AI, HUD and renderer.

- `config.js`: every global constant and tuning knob (map sizes, `POP_MAX` 200, `MAX_PLAYERS` 6, `MAX_QUEUE` 50, ranks, peace, sacred sites, survival, handicaps, game speeds).
- `index.js`: the registry of every unit, building and pantheon. `pantheon-list.js` exists only to break an import cycle.
- `pantheons/<id>.js` (ten files): each pantheon's gods, titan, creatures, minions, abilities, `identity` (two always-on blessings), `elite` soldier and render `looks`. DESIGN 4.2, 4.8, 4.10.
- `mortals.js` shared Worshipper, Warrior, Archer, Priest, Battering Ram. `buildings.js` shared buildings and their `upgrades`. `upgrades.js` turns upgrade ids into effects (`computeMods`). `schema.js` is the vocabulary and validation for all of it.
- `powers.js` god powers (3 per pantheon), `relics.js`, `ranks.js`, `walls.js`, `houses.js` (Manor), `landscapes.js`, `twists.js` (daily), `campaign.js` (`CHAPTERS`, `MISSIONS`), `achievements.js`, `medals.js`, `marks.js`, `quick-chat.js`, `ai-styles.js`, `score.js`, `whats-new.js`.

### Simulation (`src/sim/`) — DESIGN 3, 5, 6

`World` (world.js) is the authoritative game. Fixed step `DT` = 0.05 s. Deterministic; runs in Node and the browser.

- Inputs: `world.issueCommand(playerIndex, cmd)` (commands.js validates and normalizes; DESIGN 6.2). Outputs: `world.getSnapshot()` (snapshot.js; DESIGN 6.3) and `world.events` (DESIGN 6.4). Read API for AI and tests: DESIGN 6.5.
- Map: `mapgen.js` generates the map from the seed (`generateMap(mapOptions(setup))`; always go through `mapOptions` or map hashes mismatch between host and client), `map-state.js` holds mutable terrain/wood/occupancy, `pathfinding.js` A*, `spatial.js` and `building-grid.js` spatial indexes, `visibility.js` fog of war.
- Units: `orders.js` order state machines, `movement.js` steering and jam handling, `surround.js` melee surround, `combat.js` damage and projectiles, `abilities.js` + `cast-choice.js` + `status.js` spells and effects.
- Economy and building: `economy.js` (2 miners per mine, carrying, deposits), `construction.js` (placement rules, wall lines), `production.js` (queues of 50, research, tier-ups, wall upgrades), `homes.js` (four Houses into a Manor), `trade.js` (team market).
- Modes and features: `peace.js` (Decade of Peace, `canHarm`), `sacred.js` (sites and Sacred Victory), `survival.js` (Trial of the Titans), `relics.js`, `powers.js` (god powers), `creeps.js` (neutral camps), `spoils.js` (blessing payouts), `team-orders.js` (AI answers team marks), `campaign.js` (missions, objectives, scripted events), `tutorial.js` (guided first match).
- `rng.js` (mulberry32) is the only randomness. `save-graph.js` serializes the whole world graph for saves and host migration.

### Computer players (`src/ai/`) — DESIGN 10

`createAI(world, playerIndex, difficulty, opts)` returns `{ ai, tick() }`; `tick()` is called every sim tick, throttles itself to its think interval, never throws, and issues commands through the same `issueCommand` path a human uses (no cheats). Modules: `scan.js` (one pass building the AI's picture each think), `economy.js`, `build.js`, `placement.js`, `production.js`, `military.js` (defence, waves, retreat), `micro.js` (ability casting, wounded pull), `raid.js`, `powers.js`, `relics.js`, `sacred.js` (pilgrims), `walls.js` (Guardian style), `team.js` (shared targets, aid), `marks.js` (answering human team marks), `profiles.js` (difficulty numbers, `withStyle` for play styles), `voice.js` + `voice-lines.js` + `taunt-voices.js` (in-character chat and spoken taunts), `tutorial-ai.js`.

### Networking (`src/net/`) — DESIGN 7

- `transport.js`: PeerJS (WebRTC via the public broker 0.peerjs.com) or `local` (BroadcastChannel between two tabs, for tests). Same connection object either way.
- `lobby.js`: `LobbyHost` / `LobbyClient`: slots (up to 6), presets, teams, colours, pantheons, AI styles, handicaps, game modes, rejoin tokens, rematch.
- `session.js`: `HostSession` (runs World + AIs, rate-limits and sanitizes client commands, sends a full snapshot then deltas, relays team marks and chat, rejoin, pause, heir backups) and `ClientSession`.
- `delta.js` delta codec with `EVENT_SHAPES`; `sanitize.js` validates everything untrusted; `protocol.js` message names, room codes, URL overrides (`?turn=`, `?relay=1`, `?peerHost=`); `wire-version.js` the protocol fingerprint; `ticker.js` the fixed-rate clock; `handoff.js` host migration; `rejoin-ticket.js`; `fake-world.js` stand-in for net tests.

### Game controller and client state (`src/game/`) — DESIGN 9, 11

- `game.js`: builds the session, renderer, HUD and input from a launch; owns the frame loop, pause, ending, game over, rematch, host migration and every tracker.
- `view-state.js`: the client-side model built from snapshots, interpolated for drawing; used the same way on host and client.
- Match services: `alerts.js` (in-game alerts), `chronicle.js` (after-game stats and timeline), `career.js` + `career-tracker.js` + `renown.js` (achievements, localStorage), `campaign-progress.js` + `campaign-voice.js`, `tutorial.js` (objectives), `daily.js`, `music-director.js` (battle intensity), `team-marks.js`, `taunt-voice.js`, `match-end.js`, `frame-pace.js`, `slow-hint.js`, `placement.js` (client placement check mirroring the sim).
- Persistence: `save-game.js` + `save-store.js` + `game-saves.js` (solo saves in IndexedDB), `replay.js` + `replay-store.js` + `replay-session.js` (replays from recorded commands), `rematch.js`.

### Rendering (`src/render/`) — DESIGN 8

`GameRenderer` (game-renderer.js) draws the ViewState with Three.js r186 (WebGL 2). Quality tiers Low / Medium / High / Ultra (`settings.js QUALITIES`): Low draws straight to the canvas; Medium and up use the HDR post chain in `post.js` (bloom, AO on High/Ultra, tone map and grade, adaptive render scale).

- Lighting: `shading.js` (`WORLD_UNIFORMS`, `patchWorldMaterial`, environment), `atmosphere.js` (day/night cycle driven by the sim clock, 15-minute day), `day-clock.js`, `weather.js` (rain, snow, mist per landscape).
- World: `ground-field.js` (the single smooth height source), `height.js`, `terrain.js` (16x16-tile chunks), `terrain-water.js`, `terrain-textures.js`, `fog.js` (fog of war patch), `models/props.js` + `foliage-shader.js` (trees as leaf puffs and needle sprays), `models/props-far.js`.
- Units: `models/unit-models.js` (low-poly units joined into one skinned mesh), `unit-bodies.js`, `unit-anim.js` (pose keys, the source of truth for animation), `unit-looks.js`; rich skinned models in `models/rich-*.js` on High/Ultra (`rich-humanoid.js` is the entry; `rich-creatures.js` holds the creature `PLANS`; `rich-outfits-<pantheon>.js` dress each pantheon). `unit-fade.js`, `far-units.js`, `zoom-lod.js` (everything that changes beyond 44 tiles, up to the 170-tile far zoom), `portrait.js` (3D selection portrait).
- Buildings: `models/building-core.js`, `building-materials.js`, `building-pieces.js`, `building-models.js` (all ten pantheon styles, two detail levels).
- Overlays and effects: `overlays.js` (selection rings, bars, order paths, drawn in a separate scene after post), `status-markers.js`, `range-ring.js`, `placement.js` (ghost), `no-build-zone.js`, `sacred-sites.js`, `relics.js`, `remains.js` (corpses, rubble), `fires.js`, `vfx*.js` (spells, projectiles, hits).

### Interface (`src/ui/`) — DESIGN 9

HTML/CSS overlay on top of the canvas. `hud.js` (+ `hud-*.js` panels, `hud.css`), `input.js` (mouse/keyboard), `touch-input.js`, `gamepad-input.js`, `command-card.js` (the 12-slot card, pure: `getCommandCard(selection, viewState, mode)`), `minimap.js`, `key-bindings.js` + `key-panel.js`, `icons.js` + `icon-map.js` + `icon-paths.js` (painted game-icons replace emoji at runtime), `hover-tip.js` (every `title` becomes a styled tip), `menu.js` + `menu-*.js` (title, lobby, settings, how to play, career, campaign, replays), `intro.js` + `intro.css`, `photo-mode.js`, `camera-spots.js`.

### Audio (`src/audio/`) — DESIGN 9 "Music", 11.1

Everything is synthesized with WebAudio except the narration and taunt clips in `assets/narration/` (rendered offline with Kokoro TTS by `tools/narration/render.py`). `sfx.js` (+ `sfx-alerts.js`, `sfx-impacts.js`, `sfx-voices.js`) owns the one AudioContext and limiter; `music.js` + `music-composer.js` + `music-theory.js` + `music-themes.js` + `music-voices.js` compose a seeded score per pantheon live; `ambience.js` wind, birds, crickets, waves; `audio.js` is the hub the UI imports.

### Intro film (`src/intro/`) — DESIGN 11.1

A seeded little world (`stage.js`) drawn by the real `GameRenderer` with a scripted camera (`script.js` `SHOTS`, `film.js`), a sky dome (`sky.js`), recorded narration (`voiceover.js`, falling back to `narrator.js` speech synthesis) and a score conducted by the story (`score.js`). `menu-scene.js` reuses the stage as the live title backdrop.

## Key flows

- **A player order:** `InputController` -> `session.sendCommand(cmd)` -> (client) network -> `HostSession` sanitizes and rate-limits -> `world.issueCommand` -> next tick changes state -> snapshot/delta -> `ViewState` -> renderer and HUD.
- **A new match:** menu lobby -> `buildSetup` (seed, slots, landscape, modes) -> `main.js startGame(launch)` -> `new Game(...)` -> HostSession/ClientSession -> loading screen -> first full snapshot -> play.
- **Determinism:** same `GameSetup` + same command list = same game. Replays store only commands plus periodic checksums; saves pack the graph with `save-graph.js`; host migration ships gzipped backups to an heir.

## Tests and tools layout

- `tests/<area>/*.test.js` mirror `src/<area>/`. Helpers: `tests/sim/helpers.js` (test worlds; player 0 Greek, player 1 Norse; `PLAIN_PANTHEONS` for plain numbers), `tests/ui/fake-dom.js`, `tests/audio/fake-audio.js`, `tests/net` loopback sessions.
- `tools/` are runnable scripts (see [DEVELOPMENT.md](DEVELOPMENT.md#tools)): headless sim tools need only Node; browser tools need Playwright's Chromium and serve the repo first.
