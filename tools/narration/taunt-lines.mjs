// Prints every line the computer players say aloud (src/ai/taunt-voices.js) as JSON, each with its pantheon's voice,
// for tools/narration/render.py --lines.
//   node tools/narration/taunt-lines.mjs > taunts.json
//   ./venv/bin/python tools/narration/render.py --models . --lines taunts.json --bitrate 48k --skip-existing
import { allTauntLines } from '../../src/ai/taunt-voices.js';

process.stdout.write(`${JSON.stringify(allTauntLines(), null, 2)}\n`);
