// Generates our own background music and sound effects (no licensing risk, no Content ID claims).
//   npm run music   ->  03-episodes/_assets/music/calm-pad.mp3, _assets/sfx/whoosh.mp3
// Pure math: soft chord pads + gentle bells + a small reverb, then encoded to MP3 with ffmpeg.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const assets = path.resolve(here, '../../03-episodes/_assets');
const SR = 44100;

const midiHz = (m) => 440 * Math.pow(2, (m - 69) / 12);

function writeWav(file, L, R) {
  const n = L.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.max(-1, Math.min(1, L[i])) * 32767, 44 + i * 4);
    buf.writeInt16LE(Math.max(-1, Math.min(1, R[i])) * 32767, 46 + i * 4);
  }
  fs.writeFileSync(file, buf);
}

function toMp3(wav, mp3) {
  const args = ['-y', '-loglevel', 'error', '-i', wav, '-codec:a', 'libmp3lame', '-b:a', '160k', mp3];
  try {
    execFileSync('ffmpeg', args, {stdio: 'inherit'});
  } catch {
    execFileSync('npx', ['remotion', 'ffmpeg', ...args], {stdio: 'inherit', cwd: path.resolve(here, '..')});
  }
  fs.unlinkSync(wav);
}

// Small Schroeder reverb (4 combs + 2 allpasses) for a soft, roomy sound.
function reverb(x, mix = 0.28) {
  const combs = [1557, 1617, 1491, 1422].map((d) => ({buf: new Float32Array(d), i: 0, fb: 0.78}));
  const aps = [225, 556].map((d) => ({buf: new Float32Array(d), i: 0}));
  const y = new Float32Array(x.length);
  for (let n = 0; n < x.length; n++) {
    let s = 0;
    for (const c of combs) {
      const out = c.buf[c.i];
      c.buf[c.i] = x[n] + out * c.fb;
      c.i = (c.i + 1) % c.buf.length;
      s += out;
    }
    s /= combs.length;
    for (const a of aps) {
      const b = a.buf[a.i];
      const out = -s + b;
      a.buf[a.i] = s + b * 0.5;
      a.i = (a.i + 1) % a.buf.length;
      s = out;
    }
    y[n] = x[n] * (1 - mix) + s * mix;
  }
  return y;
}

function music() {
  // Am9 → Fmaj9 → Cmaj9 → G6/9, 8 seconds each, looped twice (64 s loop).
  const chords = [
    [45, 52, 55, 59, 60],
    [41, 48, 52, 55, 57],
    [48, 55, 59, 62, 64],
    [43, 50, 52, 57, 59],
  ];
  const CH = 8;
  const LOOP = CH * chords.length * 2;
  const total = (LOOP + CH) * SR; // extra chord to crossfade the loop seam
  const L = new Float32Array(total);
  const R = new Float32Array(total);
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  for (let c = 0; c * CH < LOOP + CH; c++) {
    const notes = chords[c % chords.length];
    const start = c * CH * SR;
    const len = (CH + 3) * SR; // overlap into the next chord
    for (const [k, m] of notes.entries()) {
      const f = midiHz(m);
      const amp = (k === 0 ? 0.11 : 0.06) * (m > 58 ? 0.8 : 1);
      for (let i = 0; i < len && start + i < total; i++) {
        const t = i / SR;
        const env = Math.min(1, t / 2.2) * Math.min(1, Math.max(0, (CH + 3 - t) / 3));
        const ph = 2 * Math.PI * f * t;
        const s = Math.sin(ph) + 0.18 * Math.sin(2 * ph) + 0.05 * Math.sin(3 * ph);
        L[start + i] += s * amp * env * (1 + 0.1 * Math.sin(2 * Math.PI * 0.11 * t + k));
        R[start + i] += Math.sin(2 * Math.PI * f * 1.0015 * t) * amp * env;
      }
    }
    // gentle bells from the chord's upper notes, every 2 seconds
    for (let b = 0; b < CH / 2; b++) {
      const m = notes[2 + Math.floor(rand() * 3)] + 12;
      const f = midiHz(m);
      const bs = start + Math.round((b * 2 + 0.6) * SR);
      for (let i = 0; i < 3 * SR && bs + i < total; i++) {
        const t = i / SR;
        const env = Math.exp(-t * 2.2) * Math.min(1, t * 30);
        const s = (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 2.01 * t)) * 0.035 * env;
        const pan = rand();
        L[bs + i] += s * (1 - pan * 0.5);
        R[bs + i] += s * (0.5 + pan * 0.5);
      }
    }
  }
  // warm low-pass
  let pl = 0;
  let pr = 0;
  for (let i = 0; i < total; i++) {
    pl += 0.18 * (L[i] - pl);
    pr += 0.18 * (R[i] - pr);
    L[i] = pl;
    R[i] = pr;
  }
  const RL = reverb(L);
  const RR = reverb(R);
  // crossfade the tail into the head so the loop is seamless
  const n = LOOP * SR;
  const fade = CH * SR;
  const outL = new Float32Array(n);
  const outR = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let l = RL[i];
    let r = RR[i];
    if (i < fade) {
      const a = i / fade;
      l = RL[i] * a + RL[n + i] * (1 - a);
      r = RR[i] * a + RR[n + i] * (1 - a);
    }
    outL[i] = l;
    outR[i] = r;
  }
  let peak = 0;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(outL[i]), Math.abs(outR[i]));
  const g = 0.6 / peak;
  for (let i = 0; i < n; i++) {
    outL[i] *= g;
    outR[i] *= g;
  }
  return [outL, outR];
}

function whoosh() {
  const dur = 0.7;
  const n = Math.round(dur * SR);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  let seed = 3;
  const noise = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
  let lp = 0;
  let bp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const fc = 300 + 2600 * Math.sin(Math.PI * t * 0.9);
    const a = (2 * Math.PI * fc) / SR;
    const x = noise();
    lp += a * (x - lp);
    bp += a * (lp - bp);
    const env = Math.sin(Math.PI * Math.min(1, t * 1.15)) ** 2;
    const s = (lp - bp) * env * 2.2;
    L[i] = s * (1 - t * 0.6);
    R[i] = s * (0.4 + t * 0.6);
  }
  return [L, R];
}

fs.mkdirSync(path.join(assets, 'music'), {recursive: true});
fs.mkdirSync(path.join(assets, 'sfx'), {recursive: true});
const [ml, mr] = music();
writeWav(path.join(assets, 'music/calm-pad.wav'), ml, mr);
toMp3(path.join(assets, 'music/calm-pad.wav'), path.join(assets, 'music/calm-pad.mp3'));
const [wl, wr] = whoosh();
writeWav(path.join(assets, 'sfx/whoosh.wav'), wl, wr);
toMp3(path.join(assets, 'sfx/whoosh.wav'), path.join(assets, 'sfx/whoosh.mp3'));
console.log('music + sfx written to', path.relative(process.cwd(), assets));
