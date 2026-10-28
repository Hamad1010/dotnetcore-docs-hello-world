// Renders the logo concepts (src/Brandkit.tsx) into 03-episodes/_brand/out/:
//   logo-sheet.png (all 5 logos side by side), logo-1.png … logo-5.png (800 × 800)
// (An episode's thumbnails: scripts/thumbs.mjs.)
//
//   node scripts/brandkit.mjs
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const here = path.dirname(fileURLToPath(import.meta.url));
const studio = path.resolve(here, '..');
const episodes = path.resolve(studio, '../03-episodes');
const outDir = path.join(episodes, '_brand', 'out');
fs.mkdirSync(outDir, {recursive: true});
const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({entryPoint: path.join(studio, 'src/index.ts'), publicDir: episodes});
// the bundle is a ~1 GB temporary copy of the studio: delete it however the script ends
process.on('exit', () => fs.rmSync(serveUrl, {recursive: true, force: true}));

const still = async (id, inputProps, file) => {
  const composition = await selectComposition({serveUrl, id, inputProps, browserExecutable});
  const output = path.join(outDir, file);
  await renderStill({composition, serveUrl, output, inputProps, browserExecutable});
  console.log('wrote', path.relative(process.cwd(), output));
};

await still('LogoSheet', {}, 'logo-sheet.png');
for (let n = 1; n <= 5; n++) await still('Logo', {n}, `logo-${n}.png`);
