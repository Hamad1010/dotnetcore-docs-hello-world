// Renders the logo and thumbnail concepts (src/Brandkit.tsx) into 03-episodes/_brand/out/:
//   logo-sheet.png (all 5 logos side by side), logo-1.png … logo-5.png (800 × 800), thumb-A/B/C.png (1280 × 720)
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

const still = async (id, inputProps, file) => {
  const composition = await selectComposition({serveUrl, id, inputProps, browserExecutable});
  const output = path.join(outDir, file);
  await renderStill({composition, serveUrl, output, inputProps, browserExecutable});
  console.log('wrote', path.relative(process.cwd(), output));
};

await still('LogoSheet', {}, 'logo-sheet.png');
for (let n = 1; n <= 5; n++) await still('Logo', {n}, `logo-${n}.png`);
for (const [i, variant] of ['numbers', 'rejected', 'lever'].entries()) await still('ThumbConcept', {variant}, `thumb-${'ABC'[i]}.png`);
