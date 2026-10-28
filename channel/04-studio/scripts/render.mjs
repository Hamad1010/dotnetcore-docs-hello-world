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
//   node scripts/render.mjs EP001 --audio      only the soundtrack → out/<EP>.wav (fast: to compare backgrounds)
//   node scripts/render.mjs EP003 --until=30   only the first 30 seconds (a new look's test, CLAUDE.md rule 9)
//                                              → out/<EP>-first30s.mp4
//   node scripts/render.mjs EP003 --remaster   the sound again, mastered onto the picture of the existing out/<EP>.mp4
//                                              (after a change to the mix or the mastering; the picture isn't redrawn)
//   --background=<name>                        a file in _assets/music/ (no .mp3), or none: overrides channel.json
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
const audioOnly = args.includes('--audio');
const remaster = args.includes('--remaster');
const bgArg = args.find((a) => a.startsWith('--background='));
const untilArg = args.find((a) => a.startsWith('--until='));
const untilSeconds = untilArg ? Number(untilArg.split('=')[1]) : null;
const outDir = path.join(episodes, episodeId, 'out');
fs.mkdirSync(outDir, {recursive: true});

const browserExecutable = process.env.REMOTION_BROWSER || null;
const inputProps = bgArg ? {episodeId, background: bgArg.split('=')[1]} : {episodeId};
console.log('Bundling…');
const serveUrl = await bundle({entryPoint: path.join(studio, 'src/index.ts'), publicDir: episodes});
// the bundle is a ~1 GB temporary copy of the studio: delete it however the script ends
process.on('exit', () => fs.rmSync(serveUrl, {recursive: true, force: true}));

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

// Integrated loudness (and true peak) of a file's sound; framelog=quiet keeps ffmpeg's output short for long videos.
const loudness = (file, options = '') => {
  const out = ffmpeg(['-hide_banner', '-nostats', '-i', file, '-vn', '-af', `ebur128=framelog=quiet${options}`, '-f', 'null', '-']).stderr || '';
  const s = out.slice(out.lastIndexOf('Summary:'));
  return {i: s.match(/I:\s+(-?[\d.]+) LUFS/)?.[1], tp: s.match(/Peak:\s+(-?[\d.]+)/)?.[1]};
};

// Final loudness: YouTube plays everything at about -14 LUFS and never turns a quiet video up, so the finished mix is
// brought to -14 LUFS under a limiter at -2 dBFS, and encoded once to AAC at 256k (at 192k one sharp click in EP002 came
// out 3 dB over the limiter). YouTube wants true peaks under -1 dB: the limiter runs at 4× the sample rate, so it sees
// the peaks between samples, and the encoded file is measured; if a click still comes out over -1 dB (EP003: an effect
// on a word, +0.3 dB) the ceiling drops by the overshoot and the mastering runs again. The picture is copied untouched.
// `sound` is the episode's separate WAV; without it the file's own sound is used (a Short).
const master = (picture, output, sound = null) => {
  const {i} = loudness(sound ?? picture);
  const gain = i ? -14 - parseFloat(i) : 0;
  const tmp = output.replace(/\.mp4$/, '.master.mp4');
  const inputs = sound ? ['-i', picture, '-i', sound, '-map', '0:v', '-map', '1:a'] : ['-i', picture];
  let ceiling = -2;
  let after = {};
  for (let pass = 1; pass <= 3; pass++) {
    const limiter = `aresample=192000,alimiter=limit=${(10 ** (ceiling / 20)).toFixed(3)}:attack=5:release=60:level=false,aresample=48000`;
    const filter = i ? ['-af', `volume=${(gain + 0.1).toFixed(2)}dB,${limiter}`] : [];
    const r = ffmpeg(['-y', '-loglevel', 'error', ...inputs, '-c:v', 'copy', ...filter, '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', tmp]);
    if (r.status !== 0) return console.log('  (mastering failed)', r.stderr);
    if (!i) break;
    after = loudness(tmp, ':peak=true');
    const tp = parseFloat(after.tp);
    if (!(tp > -1)) break;
    ceiling -= tp + 1.3;
  }
  fs.renameSync(tmp, output);
  if (!i) return console.log('  (loudness not measured, sound left as rendered)');
  console.log(`✓ loudness ${i} → ${after.i ?? '?'} LUFS (${gain >= 0 ? '+' : ''}${gain.toFixed(1)} dB), true peak ${after.tp ?? '?'} dB (limiter at ${ceiling.toFixed(1)} dB)`);
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
  // an entry is a list of scene ids, or {scenes, title} (the title is read from episode.json by the composition)
  for (const [i, sceneIds] of list.map((e) => (Array.isArray(e) ? e : e.scenes)).entries()) {
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
    master(out, out);
  }
  process.exit(0);
}

const comp = await selectComposition({serveUrl, id: 'Episode', inputProps, browserExecutable});
const {episode, plan} = comp.props.data;

if (audioOnly) {
  const wav = path.join(outDir, `${episodeId}${bgArg ? `-${bgArg.split('=')[1]}` : ''}.wav`);
  await renderMedia({composition: comp, serveUrl, codec: 'wav', outputLocation: wav, inputProps, browserExecutable, onProgress: progress('audio')});
  console.log(`✓ ${path.relative(process.cwd(), wav)}`);
  process.exit(0);
}

// Subtitles + chapters (from the same timing plan the video uses)
fs.writeFileSync(path.join(outDir, 'subtitles.ar.srt'), toSrt(plan));
fs.writeFileSync(path.join(outDir, 'chapters.txt'), toChapters(episode, plan) + '\n');
console.log('✓ subtitles.ar.srt + chapters.txt');

// The sound first, in parts of about 3 minutes cut where a scene starts, joined into one WAV: Remotion mixes all of a
// render's sounds through full-length temporary files (about 10 GB at once for a 15-minute episode), more than a cloud
// session's disk holds. Then the picture without sound; master() puts the two together.
const output = path.join(outDir, `${episodeId}${untilSeconds ? `-first${untilSeconds}s` : ''}${preview ? '-preview' : ''}.mp4`);
if (remaster && !fs.existsSync(output)) {
  console.log(`no ${path.relative(process.cwd(), output)} to put the sound on: render the episode first`);
  process.exit(1);
}
const work = path.join(outDir, 'parts');
fs.rmSync(work, {recursive: true, force: true});
fs.mkdirSync(work, {recursive: true});
const total = untilSeconds ? Math.min(comp.durationInFrames, Math.round(untilSeconds * plan.fps)) : comp.durationInFrames;
const cuts = [0];
for (const sc of plan.scenes) if (sc.from - cuts[cuts.length - 1] >= 180 * plan.fps && total - sc.from >= 60 * plan.fps) cuts.push(sc.from);
cuts.push(total);
const wavs = [];
for (let k = 0; k + 1 < cuts.length; k++) {
  wavs.push(`sound-${k + 1}.wav`);
  await renderMedia({composition: comp, serveUrl, codec: 'wav', outputLocation: path.join(work, wavs[k]), inputProps, browserExecutable, frameRange: [cuts[k], cuts[k + 1] - 1]});
}
fs.writeFileSync(path.join(work, 'sound.txt'), wavs.map((w) => `file '${w}'`).join('\n') + '\n');
const sound = path.join(work, 'sound.wav');
ffmpeg(['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(work, 'sound.txt'), '-c', 'copy', sound]);
console.log(`✓ sound (${wavs.length} parts)`);

if (remaster) {
  master(output, output, sound);
  fs.rmSync(work, {recursive: true, force: true});
  console.log(`✓ ${path.relative(process.cwd(), output)}  (new sound, the same picture)`);
  process.exit(0);
}

const picture = path.join(work, 'picture.mp4');
const started = Date.now();
let last = -1;
await renderMedia({
  composition: comp,
  serveUrl,
  codec: 'h264',
  crf: preview ? 26 : 18,
  muted: true,
  frameRange: [0, total - 1],
  scale: preview ? 2 / 3 : 1,
  outputLocation: picture,
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
const mins = (total / plan.fps / 60).toFixed(2);
master(picture, output, sound);
fs.rmSync(work, {recursive: true, force: true});
console.log(`✓ ${path.relative(process.cwd(), output)}  (${mins} min video, picture rendered in ${Math.round((Date.now() - started) / 1000)}s)`);
