// Renders the channel's launch kit into 03-episodes/_brand/launch-kit/:
//   avatars/host-01…10.png, name-01…10.png   (800 × 800: YouTube shows them as a circle)
//   banners/banner-1…5.png                   (2560 × 1440; the text sits inside the 1235 × 338 safe area)
//   banners/banner-1…5-guides.png            (the same with the safe areas drawn, to check them)
// (An episode's thumbnails: scripts/thumbs.mjs.)
//
//   node scripts/launchkit.mjs                 everything
//   node scripts/launchkit.mjs avatars         only the avatars   (or: banners)
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const here = path.dirname(fileURLToPath(import.meta.url));
const studio = path.resolve(here, '..');
const episodes = path.resolve(studio, '../03-episodes');
const outDir = path.join(episodes, '_brand', 'launch-kit');
const only = process.argv[2];
const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({entryPoint: path.join(studio, 'src/index.ts'), publicDir: episodes});
// the bundle is a ~1 GB temporary copy of the studio: delete it however the script ends
process.on('exit', () => fs.rmSync(serveUrl, {recursive: true, force: true}));

const still = async (id, inputProps, file) => {
  fs.mkdirSync(path.dirname(file), {recursive: true});
  const composition = await selectComposition({serveUrl, id, inputProps, browserExecutable});
  await renderStill({composition, serveUrl, output: file, inputProps, browserExecutable});
  console.log('wrote', path.relative(process.cwd(), file));
};

if (!only || only === 'avatars') {
  for (const group of ['host', 'name']) {
    for (let n = 1; n <= 10; n++) {
      const id = `${group}-${String(n).padStart(2, '0')}`;
      await still('Avatar', {id}, path.join(outDir, 'avatars', `${id}.png`));
    }
  }
}
if (!only || only === 'banners') {
  for (let n = 1; n <= 5; n++) {
    await still('Banner', {n, guides: false}, path.join(outDir, 'banners', `banner-${n}.png`));
    await still('Banner', {n, guides: true}, path.join(outDir, 'banners', `banner-${n}-guides.png`));
  }
}
