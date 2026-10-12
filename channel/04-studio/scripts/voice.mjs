// Creates the narration audio for an episode: one MP3 per scene + audio/timings.json.
// The video then times every scene to the real voice automatically.
//
//   node scripts/voice.mjs EP001 --provider=elevenlabs   (best Saudi voice; needs ELEVENLABS_API_KEY + ELEVENLABS_VOICE_ID)
//   node scripts/voice.mjs EP001 --provider=google       (Google Cloud TTS free tier; needs GOOGLE_TTS_API_KEY)
//   node scripts/voice.mjs EP001 --provider=polly        (Amazon Polly Gulf Arabic "Zayd"/"Hala"; needs the AWS CLI logged in)
//   node scripts/voice.mjs EP001 --provider=edge         (free test voice; needs `pip install edge-tts`)
//   node scripts/voice.mjs EP001 --provider=recorded     (your own voice: put audio/<sceneId>.mp3|m4a|wav files in the folder first)
//   node scripts/voice.mjs EP001 --only=s3               (re-do one scene only)
//
// Keys can live in channel/04-studio/.env (never commit it). See .env.example.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {spoken} from '../src/lib/plan.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const studio = path.resolve(here, '..');
loadEnv(path.join(studio, '.env'));

const args = process.argv.slice(2);
const episodeId = args.find((a) => !a.startsWith('--')) || 'EP001';
const opt = (name, def) => (args.find((a) => a.startsWith(`--${name}=`)) || '').split('=')[1] || def;
const provider = opt('provider', process.env.VOICE_PROVIDER || 'edge');
const only = opt('only', null);

const epDir = path.resolve(studio, '../03-episodes', episodeId);
const audioDir = path.join(epDir, 'audio');
fs.mkdirSync(audioDir, {recursive: true});
const episode = JSON.parse(fs.readFileSync(path.join(epDir, 'episode.json'), 'utf8'));
const timingsPath = path.join(audioDir, 'timings.json');
const timings = fs.existsSync(timingsPath) ? JSON.parse(fs.readFileSync(timingsPath, 'utf8')) : {};

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

function ffmpeg(argv) {
  try {
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...argv], {stdio: 'inherit'});
  } catch {
    execFileSync('npx', ['remotion', 'ffmpeg', '-y', '-loglevel', 'error', ...argv], {stdio: 'inherit', cwd: studio});
  }
}

function duration(file) {
  // ffprobe may not exist on every machine; ask ffmpeg instead and parse "Duration: 00:00:31.20"
  let out = '';
  try {
    execFileSync('ffmpeg', ['-hide_banner', '-i', file], {stdio: ['ignore', 'ignore', 'pipe']});
  } catch (e) {
    out = String(e.stderr || '');
  }
  if (!out) {
    try {
      execFileSync('npx', ['remotion', 'ffmpeg', '-hide_banner', '-i', file], {stdio: ['ignore', 'ignore', 'pipe'], cwd: studio});
    } catch (e) {
      out = String(e.stderr || '');
    }
  }
  const m = out.match(/Duration: (\d+):(\d+):([\d.]+)/);
  if (!m) throw new Error(`Could not read duration of ${file}`);
  return +m[1] * 3600 + +m[2] * 60 + +m[3];
}

// Trim silence at both ends and normalise loudness so every episode sounds the same.
function polish(input, output) {
  ffmpeg([
    '-i', input,
    '-af', 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.1,areverse,loudnorm=I=-16:TP=-1.5:LRA=11',
    '-ar', '44100', '-ac', '1', '-b:a', '160k', output,
  ]);
}

async function synthElevenLabs(text, out) {
  const key = process.env.ELEVENLABS_API_KEY;
  const voice = process.env.ELEVENLABS_VOICE_ID;
  if (!key || !voice) throw new Error('Set ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID in 04-studio/.env');
  const model = process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: {'xi-api-key': key, 'content-type': 'application/json'},
    body: JSON.stringify({text, model_id: model, voice_settings: {stability: 0.45, similarity_boost: 0.8, style: 0.2, use_speaker_boost: true}}),
  });
  if (!r.ok) throw new Error(`ElevenLabs ${r.status}: ${await r.text()}`);
  fs.writeFileSync(out, Buffer.from(await r.arrayBuffer()));
}

async function synthGoogle(text, out) {
  const key = process.env.GOOGLE_TTS_API_KEY;
  if (!key) throw new Error('Set GOOGLE_TTS_API_KEY in 04-studio/.env (Cloud Text-to-Speech API enabled)');
  const name = process.env.GOOGLE_TTS_VOICE || 'ar-XA-Chirp3-HD-Charon';
  const r = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${key}`, {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({input: {text}, voice: {languageCode: 'ar-XA', name}, audioConfig: {audioEncoding: 'MP3', speakingRate: 1.0}}),
  });
  if (!r.ok) throw new Error(`Google TTS ${r.status}: ${await r.text()}`);
  const data = await r.json();
  fs.writeFileSync(out, Buffer.from(data.audioContent, 'base64'));
}

function synthPolly(text, out) {
  const voice = process.env.POLLY_VOICE || 'Zayd'; // Gulf Arabic neural voices: Zayd (male), Hala (female)
  execFileSync('aws', ['polly', 'synthesize-speech', '--engine', 'neural', '--language-code', 'ar-AE', '--voice-id', voice, '--output-format', 'mp3', '--text', text, out], {
    stdio: 'inherit',
  });
}

function synthEdge(text, out) {
  const voice = process.env.EDGE_VOICE || 'ar-SA-HamedNeural';
  execFileSync('edge-tts', ['--voice', voice, '--rate', process.env.EDGE_RATE || '-5%', '--text', text, '--write-media', out], {stdio: 'inherit'});
}

const raw = path.join(audioDir, '_raw');
fs.mkdirSync(raw, {recursive: true});
for (const scene of episode.scenes) {
  if (only && scene.id !== only) continue;
  const final = path.join(audioDir, `${scene.id}.mp3`);
  let source;
  if (provider === 'recorded') {
    source = ['mp3', 'm4a', 'wav', 'aac', 'ogg'].map((ext) => path.join(audioDir, `${scene.id}.${ext}`)).find((p) => fs.existsSync(p) && p !== final);
    if (!source && fs.existsSync(final)) {
      fs.copyFileSync(final, path.join(raw, `${scene.id}.mp3`));
      source = path.join(raw, `${scene.id}.mp3`);
    }
    if (!source) {
      console.warn(`! no recording for scene "${scene.id}" (expected audio/${scene.id}.mp3/.m4a/.wav) — skipped`);
      continue;
    }
  } else {
    source = path.join(raw, `${scene.id}.mp3`);
    process.stdout.write(`${provider}: ${scene.id} … `);
    if (provider === 'elevenlabs') await synthElevenLabs(spoken(scene.narration), source);
    else if (provider === 'google') await synthGoogle(spoken(scene.narration), source);
    else if (provider === 'polly') synthPolly(spoken(scene.narration), source);
    else if (provider === 'edge') synthEdge(spoken(scene.narration), source);
    else throw new Error(`Unknown provider "${provider}"`);
  }
  polish(source, final);
  timings[scene.id] = {duration: +duration(final).toFixed(3), file: `${scene.id}.mp3`};
  console.log(`${scene.id}: ${timings[scene.id].duration}s`);
}
fs.rmSync(raw, {recursive: true, force: true});
fs.writeFileSync(timingsPath, JSON.stringify(timings, null, 2));
const total = Object.values(timings).reduce((a, t) => a + t.duration, 0);
console.log(`\nvoice ready: ${Object.keys(timings).length} scenes, ${(total / 60).toFixed(2)} min of narration → ${path.relative(process.cwd(), timingsPath)}`);
