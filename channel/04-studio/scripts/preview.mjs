// Quick visual check without rendering the whole video:
// renders a few still frames (one per scene by default) to 03-episodes/<EP>/out/preview/.
//
//   node scripts/preview.mjs EP001            -> middle + end frame of every scene
//   node scripts/preview.mjs EP001 1200 4800  -> specific frames
//   node scripts/preview.mjs EP001 --short=s4  -> frames of a vertical Short made of scene s4
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const here = path.dirname(fileURLToPath(import.meta.url));
const studio = path.resolve(here, '..');
const episodes = path.resolve(studio, '../03-episodes');
const argv = process.argv.slice(2);
const shortArg = (argv.find((a) => a.startsWith('--short=')) || '').split('=')[1];
const [episodeId = 'EP001', ...frameArgs] = argv.filter((a) => !a.startsWith('--'));
const outDir = path.join(episodes, episodeId, 'out', 'preview');
fs.mkdirSync(outDir, {recursive: true});

const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({entryPoint: path.join(studio, 'src/index.ts'), publicDir: episodes});
const inputProps = shortArg ? {episodeId, sceneIds: shortArg.split(',')} : {episodeId};
const comp = await selectComposition({serveUrl, id: shortArg ? 'Short' : 'Episode', inputProps, browserExecutable});

let frames = frameArgs.map(Number);
if (!frames.length) {
  const plan = comp.props.data.plan;
  frames = plan.scenes.flatMap((s) => [s.from + Math.round(s.frames * 0.45), s.from + s.frames - 16]);
}
for (const frame of frames) {
  const output = path.join(outDir, `${shortArg ? 'short-' : ''}f${String(frame).padStart(5, '0')}.jpg`);
  await renderStill({composition: comp, serveUrl, output, frame, inputProps, imageFormat: 'jpeg', jpegQuality: 80, browserExecutable});
  console.log('wrote', path.relative(process.cwd(), output));
}

if (shortArg) process.exit(0);
const thumb = await selectComposition({serveUrl, id: 'Thumbnail', inputProps, browserExecutable});
const thumbOut = path.join(episodes, episodeId, 'out', 'thumbnail.png');
await renderStill({composition: thumb, serveUrl, output: thumbOut, inputProps, browserExecutable});
console.log('wrote', path.relative(process.cwd(), thumbOut));
