# Project status (handoff, 2026-11-27)

`main` is at the last merged feature PR (#223, Campaign Chapter X), deployed to GitHub Pages, with no open pull requests. A fresh `npm ci` passes lint, all 2,323 unit tests and the AI audit. The previous development round was closed by the owner on 2026-11-19 ("wrap up, no new waves until asked"), so there is no work in flight.

## How it was built

About 220 pull requests from 2026-10-17 to 2026-11-19, built by an AI coding agent working for the owner, who plays the game and reports bugs and wishes. Each feature landed as one squash-merged PR with tests, a DESIGN.md section and, usually, a note now kept in `docs/knowledge/`. Git history on `main` (`git log`) has a commit per PR with a summary.

## What the game has

- **Core RTS:** 10 pantheons, each with mortals, an elite soldier, gods (up to 3, they level up and revive), creatures, minions, a titan, two always-on blessings and three one-use god powers. Gold (2 miners per mine), wood, faith from prayer. Village, Town, City tiers. Population cap 200, production queues of 50, repeat training, soldier ranks, 19+ building upgrades, Worshipper upgrade lines, repair and auto-repair, autocast, walls (wood to stone, towers join), Manors (four Houses in a square), team market, relics from creep camps, sacred sites.
- **Modes:** skirmish 1v1 to 6 players (presets 1v1, 2v2, 3v3, FFA, co-op), Decade of Peace (with a no-build zone), Sacred Victory, Trial of the Titans (survival waves), daily challenge with twists, starting resources, handicaps, five landscapes plus Random, guided first match (Learn to Play) with medals, campaign of 10 chapters x 5 missions (one per pantheon, narrated).
- **Computer players:** Easy, Normal, Hard, strictly fair Brutal; play styles (balanced, raider, builder, Guardian with walls); AI allies answer and send team marks; in-character spoken taunts.
- **Online:** PeerJS rooms with codes and invite links, host-authoritative with delta snapshots, rejoin after a drop, host migration when the host leaves, online pause, rematch in the same room, open seats for friends, team chat, quick chat, team pings and markers.
- **Presentation:** HDR post, day/night cycle, weather, smooth terrain and clear water, foliage, building kit for 10 styles, rich skinned models for all 158 unit looks on High/Ultra, far zoom to 170 tiles, live 3D title screen, 47 s intro film with recorded narration and a conducted score, procedural music per pantheon, ambience, impact sounds, unit replies, painted icons, 3D selection portrait, photo mode.
- **Interface and comfort:** after-game chronicle, career with 55 achievements and renown, saved games, replays, alerts and tips, What's New page, colour-blind palette, rebindable keys, interface size, game speed (solo), camera spots, touch controls for phones and tablets, gamepad, installable offline PWA, accessibility text floor.

## Known open issues and limits

- Balance: after the balance pass (PR #88) pantheon AI win rates were 40 to 62 percent; Hindu still about 62, Japanese 40, West African 42. Numbers for blessings, elites and powers are first guesses meant to be tuned from play.
- Rare "unproductive Worshipper" reports in AI games (about 1 in 12 games) were never investigated (`tools/sim-audit.mjs` prints them).
- Decade of Peace: gold mines were not scaled for long peaces (mines run dry around minute 26 to 28 of a 30-minute peace).
- Islands landscape: level-1 camps sometimes land in sea corners with a long sand bridge along the map edge.
- Host migration: a tree felled in the last 10 s before the host left can stay felled in the view after the rollback (accepted).
- A rejoined player does not get the chat history.
- Saves are not migrated between builds: an old save loads only while its fields still fit the code.
- A destroyed building's production queue is lost without a refund (population is freed). Shift+train queues 5 at a time by design.
- Assigning PRs to the owner's old login fails since the account rename; skip it.

## Never verified (no GPU, no speakers, no real devices were available to the builder)

- How the graphics look and perform on a real GPU, especially Low on an ordinary laptop. Every check ran on software WebGL; costs on record are triangle and draw-call counts.
- How anything sounds: music, sfx, alert sounds, unit replies, ambience, chat sound. Levels were set by loudness measurement. Narration and taunt clips were checked by speech recognition, not by ear.
- Touch controls on a real phone, a real gamepad, Firefox and Safari audio behaviour.

## Ideas not built (candidates for future work)

- Naval units (none exist).
- Own TURN and signaling servers (today: the public PeerJS broker and its cloud TURN), so strict networks can join.
- Daily challenge leaderboard and shared results (needs a server); persona names for AI players.
- Select the new Manor when a merge finishes; a placement ghost that snaps Houses into a square.
- Wall gates (today: dismantle a segment for a gap); a Town-tier requirement for stone.
- Hotkeys for team markers, marks for late joiners, grouping overlapping marker chips.
- Fewer message cards on short windows; a quieter look for routine milestones.
- Performance: low-poly shadow proxies for trees, smaller forest chunks; a leaner Low tree crown if Low feels heavy (measured +5 percent instead of +14).
- Graphics: distance LOD for rich units; authored or CC0 rigged assets were considered and not pursued.
- Real-GPU and real-device checks on the owner's machine before any further graphics or audio tuning.

Where to start on any of these: the matching note in [knowledge/](knowledge/README.md), then DESIGN.md.
