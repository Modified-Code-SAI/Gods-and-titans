# cloud-resources-survey-2026-11-06

> Survey (2026-11-06) of unused cloud-env resources for the game: what is reachable, what the game lacks, ranked ideas given to the owner

The owner asked (2026-11-06) what in the cloud environment could improve the game that we don't use yet. Findings only, nothing built.

Checked facts: 4 cores, 15 GB, no GPU (SwiftShader). Have ffmpeg, ImageMagick, Python 3.13 with numpy, pillow, onnxruntime; Node 22, bun, go, rust (host target only), docker, gcloud/gsutil/bq, gh. Reachable: huggingface.co (model downloads work), polyhaven.com and dl.polyhaven.org (CC0 HDRIs), ambientcg.com, static.rust-lang.org, npm, pypi. Not reachable: freesound.org, cdn.jsdelivr.net, api.polyhaven.com. Many plugin MCPs (Figma, Notion, Linear...) fail with proxy 403. The owner's computer can be linked to a thread (Remote Control: real GPU and speakers).

Game gaps seen: no TURN servers (only public 0.peerjs.com signaling, no iceServers), service worker in #179 (the PWA manifest and icons landed in #167 from the AAA thread, see [aaa-polish-touch](aaa-polish-touch.md)), no gamepad (gamepad play landed in #173). Kokoro (tools/narration/render.py) voices only the intro and campaign; AI taunts (src/ai/voice-lines.js) are text only; unit replies are wordless formant synth.

Ranked ideas given: 1 real-GPU checks on the owner's machine, 2 Kokoro voices for taunts/gods (+ Whisper check), 3 CC0 HDRI/textures, 4 TURN + own signaling (docker to test), 5 trailer/store art via Canva/HyperFrames/Descript, 6 installable offline PWA.

Built (2026-11-06, the owner chose 2, 3 and 5): PR #168 (merged 2026-11-06 as 7158740 on the owner's "Proceed") = spoken taunts (src/ai/taunt-voices.js voices/SAY_AS/SPOKEN_AS, src/game/taunt-voice.js, setting aiVoices, 460 clips in assets/narration/taunts at 48k, tools/narration/taunt-lines.mjs + check.py Whisper, mean 0.94) and CC0 art (sky-detail.png clouds in shading.js env bake; ground-detail.png TERRAIN_DETAIL on high/ultra; tools/cc0/bake.py). Trailer (53 s, every intro frame at High via shot-intro --at 0.05 steps, ~2 h on software GL; score from music-render --film) and store art in (an off-repo folder, not kept); trailer also in the owner's Descript project "Mythic War trailer". Traps: ambientcg.com downloads 403 (use dl.polyhaven.org); Canva upload URL blocked by proxy (CONNECT 403); faster-whisper's PyAV fails, decode with ffmpeg; shot-intro still names are inconsistent (t008_3.png), sort by parsed number. Nobody has listened to the voices yet.

Related: [quality-review-2026-11-05](quality-review-2026-11-05.md), [intro-narration](intro-narration.md), [rejoin-online](rejoin-online.md).
