// Renders the three thumbnails of an episode's publish kit (framework §3.13) from 03-episodes/<EP>/thumbs.json
// into 03-episodes/<EP>/out/thumb-1.png … thumb-3.png (+ .jpg under 2 MB for YouTube).
//
//   node scripts/thumbs.mjs EP001
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const here = path.dirname(fileURLToPath(import.meta.url));
const studio = path.resolve(here, '..');
const episodes = path.resolve(studio, '../03-episodes');
const episodeId = process.argv[2] || 'EP001';
const specs = JSON.parse(fs.readFileSync(path.join(episodes, episodeId, 'thumbs.json'), 'utf8'));
const outDir = path.join(episodes, episodeId, 'out');
fs.mkdirSync(outDir, {recursive: true});
const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({entryPoint: path.join(studio, 'src/index.ts'), publicDir: episodes});
// the bundle is a ~1 GB temporary copy of the studio: delete it however the script ends
process.on('exit', () => fs.rmSync(serveUrl, {recursive: true, force: true}));

for (let index = 0; index < specs.length; index++) {
  const inputProps = {episodeId, index};
  const composition = await selectComposition({serveUrl, id: 'ThumbVariant', inputProps, browserExecutable});
  const png = path.join(outDir, `thumb-${index + 1}.png`);
  await renderStill({composition, serveUrl, output: png, inputProps, browserExecutable});
  const jpg = png.replace(/\.png$/, '.jpg');
  try {
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', png, '-q:v', '3', jpg]);
  } catch {
    execFileSync('npx', ['remotion', 'ffmpeg', '-y', '-loglevel', 'error', '-i', png, '-q:v', '3', jpg], {cwd: studio});
  }
  console.log('wrote', path.relative(process.cwd(), png), '+ .jpg');
}
