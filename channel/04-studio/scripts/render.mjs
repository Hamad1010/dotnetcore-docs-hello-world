// Renders an episode and everything needed to publish it, into 03-episodes/<EP>/out/:
//   <EP>.mp4            the video (1080p, or 720p with --preview), mastered to -14 LUFS
//   thumbnail.png/.jpg  YouTube thumbnail (1280×720, jpg < 2 MB)
//   subtitles.ar.srt    Arabic captions to upload to YouTube (better SEO + accessibility)
//   chapters.txt        timestamps to paste into the description
//
//   node scripts/render.mjs EP001              full quality
//   node scripts/render.mjs EP001 --preview    fast 720p check
//   node scripts/render.mjs EP001 --thumb-only
//   node scripts/render.mjs EP001 --shorts     vertical Shorts listed in episode.json "shorts" → out/short-N.mp4
//   node scripts/render.mjs EP001 --short=2    only Short number 2
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync, spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {toChapters, toSrt} from '../src/lib/plan.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const studio = path.resolve(here, '..');
const episodes = path.resolve(studio, '../03-episodes');
const args = process.argv.slice(2);
const episodeId = args.find((a) => !a.startsWith('--')) || 'EP001';
const preview = args.includes('--preview');
const thumbOnly = args.includes('--thumb-only');
const shortArg = args.find((a) => a.startsWith('--short='));
const onlyShort = shortArg ? Number(shortArg.split('=')[1]) : null;
const shortsOnly = args.includes('--shorts') || onlyShort !== null;
const outDir = path.join(episodes, episodeId, 'out');
fs.mkdirSync(outDir, {recursive: true});

const browserExecutable = process.env.REMOTION_BROWSER || null;
const inputProps = {episodeId};
console.log('Bundling…');
const serveUrl = await bundle({entryPoint: path.join(studio, 'src/index.ts'), publicDir: episodes});

// Thumbnail
const thumb = await selectComposition({serveUrl, id: 'Thumbnail', inputProps, browserExecutable});
const thumbPng = path.join(outDir, 'thumbnail.png');
await renderStill({composition: thumb, serveUrl, output: thumbPng, inputProps, browserExecutable});
try {
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', thumbPng, '-q:v', '3', path.join(outDir, 'thumbnail.jpg')]);
} catch {
  execFileSync('npx', ['remotion', 'ffmpeg', '-y', '-loglevel', 'error', '-i', thumbPng, '-q:v', '3', path.join(outDir, 'thumbnail.jpg')], {cwd: studio});
}
console.log('✓ thumbnail');
if (thumbOnly) process.exit(0);

// ffmpeg from the system, else the one that ships with Remotion.
const ffmpeg = (args) => {
  const sys = spawnSync('ffmpeg', args, {encoding: 'utf8'});
  if (!sys.error) return sys;
  return spawnSync('npx', ['remotion', 'ffmpeg', ...args], {encoding: 'utf8', cwd: studio});
};

// Final loudness: YouTube plays everything at about -14 LUFS and never turns a quiet video up, so the finished mix is
// brought to -14 LUFS with a limiter that keeps peaks under -1 dB. The picture is copied untouched.
const master = (file) => {
  const probe = ffmpeg(['-hide_banner', '-nostats', '-i', file, '-vn', '-af', 'ebur128', '-f', 'null', '-']).stderr || '';
  const m = probe.slice(probe.lastIndexOf('Summary:')).match(/I:\s+(-?[\d.]+) LUFS/);
  if (!m) return console.log('  (loudness not measured, left as rendered)');
  const gain = -14 - parseFloat(m[1]);
  const tmp = file.replace(/\.mp4$/, '.master.mp4');
  const r = ffmpeg(['-y', '-loglevel', 'error', '-i', file, '-c:v', 'copy', '-af', `volume=${gain.toFixed(2)}dB,alimiter=limit=0.85:attack=5:release=60:level=false`, '-c:a', 'aac', '-b:a', '192k', tmp]);
  if (r.status !== 0) return console.log('  (mastering failed, left as rendered)', r.stderr);
  fs.renameSync(tmp, file);
  console.log(`✓ loudness ${m[1]} → -14 LUFS (${gain >= 0 ? '+' : ''}${gain.toFixed(1)} dB), peaks under -1 dB`);
};

const progress = (label) => {
  const t0 = Date.now();
  let last = -1;
  return ({progress: p}) => {
    const pct = Math.floor(p * 100);
    if (pct >= last + 10) {
      last = pct;
      process.stdout.write(`  ${label} ${pct}% (${Math.round((Date.now() - t0) / 1000)}s)\n`);
    }
  };
};

if (shortsOnly) {
  const ep = JSON.parse(fs.readFileSync(path.join(episodes, episodeId, 'episode.json'), 'utf8'));
  const list = ep.shorts && ep.shorts.length ? ep.shorts : ep.scenes.filter((s) => s.type === 'story').slice(0, 3).map((s) => [s.id]);
  for (const [i, sceneIds] of list.entries()) {
    if (onlyShort !== null && i + 1 !== onlyShort) continue;
    const props = {episodeId, sceneIds};
    const short = await selectComposition({serveUrl, id: 'Short', inputProps: props, browserExecutable});
    const out = path.join(outDir, `short-${i + 1}-${sceneIds.join('-')}.mp4`);
    await renderMedia({
      composition: short,
      serveUrl,
      codec: 'h264',
      crf: 20,
      audioCodec: 'aac',
      outputLocation: out,
      inputProps: props,
      browserExecutable,
      concurrency: Math.max(1, os.cpus().length),
      imageFormat: 'jpeg',
      jpegQuality: 90,
      onProgress: progress(`short ${i + 1}`),
    });
    console.log(`✓ ${path.relative(process.cwd(), out)} (${(short.durationInFrames / short.fps).toFixed(1)} s)`);
    master(out);
  }
  process.exit(0);
}

const comp = await selectComposition({serveUrl, id: 'Episode', inputProps, browserExecutable});
const {episode, plan} = comp.props.data;

// Subtitles + chapters (from the same timing plan the video uses)
fs.writeFileSync(path.join(outDir, 'subtitles.ar.srt'), toSrt(plan));
fs.writeFileSync(path.join(outDir, 'chapters.txt'), toChapters(episode, plan) + '\n');
console.log('✓ subtitles.ar.srt + chapters.txt');

const output = path.join(outDir, `${episodeId}${preview ? '-preview' : ''}.mp4`);
const started = Date.now();
let last = -1;
await renderMedia({
  composition: comp,
  serveUrl,
  codec: 'h264',
  crf: preview ? 26 : 18,
  audioCodec: 'aac',
  audioBitrate: '192k',
  scale: preview ? 2 / 3 : 1,
  outputLocation: output,
  inputProps,
  browserExecutable,
  concurrency: Math.max(1, os.cpus().length),
  imageFormat: 'jpeg',
  jpegQuality: preview ? 80 : 92,
  onProgress: ({progress}) => {
    const pct = Math.floor(progress * 100);
    if (pct >= last + 5) {
      last = pct;
      const sec = (Date.now() - started) / 1000;
      process.stdout.write(`  ${pct}% (${Math.round(sec)}s)\n`);
    }
  },
});
const mins = (plan.total / plan.fps / 60).toFixed(2);
console.log(`✓ ${path.relative(process.cwd(), output)}  (${mins} min video, rendered in ${Math.round((Date.now() - started) / 1000)}s)`);
master(output);
