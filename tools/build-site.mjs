// Build the site GitHub Pages serves (the Pages workflow runs this; nothing else needs it).
//
//   node tools/build-site.mjs [--out _site] [--no-bundle]
//
// The source stays plain ES modules with no build step: open index.html from the repo and it runs as it is.
// For the deployed site the ~270 modules and three.js are bundled and minified by esbuild into a few
// files whose names carry a hash of their content, so
//   - a first visit downloads a handful of files instead of ~270 one after another, and
//   - a tab open across a deploy never mixes old and new modules: the new index.html names new files.
// The bundle goes to src/app/ (two folders deep, like the source modules) so the paths the code builds
// from import.meta.url ('../../vendor/peerjs.min.js', '../../assets/narration/...') still resolve.
// The stylesheets get a ?v=<hash> so they are refetched after a change. The unbundled src/ is copied too.
import { build } from 'esbuild';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const outArg = args.indexOf('--out');
const out = join(root, outArg >= 0 ? args[outArg + 1] : '_site');
const bundle = !args.includes('--no-bundle');

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const p of ['index.html', 'style.css', 'src', 'vendor', 'assets']) cpSync(join(root, p), join(out, p), { recursive: true });
writeFileSync(join(out, '.nojekyll'), '');

const hashOf = (file) => createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 10);
let html = readFileSync(join(root, 'index.html'), 'utf8');
// Stylesheets: refetch after a change.
html = html.replace(/<link rel="stylesheet" href="([^"?]+\.css)">/g, (m, href) => {
  const file = join(root, href);
  return existsSync(file) ? `<link rel="stylesheet" href="${href}?v=${hashOf(file)}">` : m;
});

if (bundle) {
  const appDir = join(out, 'src', 'app');
  const result = await build({
    entryPoints: [join(root, 'src', 'main.js')],
    bundle: true,
    splitting: true,
    format: 'esm',
    minify: true,
    target: 'es2022',
    outdir: appDir,
    entryNames: '[name]-[hash]',
    chunkNames: 'chunk-[hash]',
    alias: { three: join(root, 'vendor', 'three', 'three.module.js') },
    plugins: [{
      name: 'three-addons',
      setup(b) {
        b.onResolve({ filter: /^three\/addons\// }, (a) => ({ path: join(root, 'vendor', 'three', 'addons', a.path.slice('three/addons/'.length)) }));
      },
    }],
    metafile: true,
    logLevel: 'warning',
    legalComments: 'linked',
  });
  const entry = Object.entries(result.metafile.outputs).find(([, o]) => o.entryPoint && o.entryPoint.endsWith('src/main.js'));
  if (!entry) throw new Error('esbuild produced no entry for src/main.js');
  const entryUrl = relative(out, join(root, entry[0])).split('\\').join('/');
  const tag = '<script type="module" src="src/main.js"></script>';
  if (!html.includes(tag)) throw new Error(`index.html no longer has ${tag}`);
  html = html.replace(tag, `<script type="module" src="${entryUrl}"></script>`);
  // Start fetching the entry's static chunks with the entry itself.
  const chunks = (result.metafile.outputs[entry[0]].imports || []).filter((i) => i.kind === 'import-statement').map((i) => relative(out, join(root, i.path)).split('\\').join('/'));
  html = html.replace(`<script type="module" src="${entryUrl}"></script>`, [...chunks.map((c) => `<link rel="modulepreload" href="${c}">`), `<script type="module" src="${entryUrl}"></script>`].join('\n  '));
  const files = Object.keys(result.metafile.outputs).filter((f) => f.endsWith('.js'));
  const bytes = files.reduce((s, f) => s + result.metafile.outputs[f].bytes, 0);
  console.log(`bundled into ${files.length} files, ${(bytes / 1e6).toFixed(2)} MB minified; entry ${entryUrl}`);
}
writeFileSync(join(out, 'index.html'), html);
console.log(`site in ${relative(root, out) || '.'}`);
