// Generates our own background music and sound effects (no licensing risk, no Content ID claims).
//   npm run music            ->  03-episodes/_assets/music/calm-pad.mp3 + every sound effect in _assets/sfx/
//   npm run music -- sfx     ->  only the sound effects
// Pure math: soft chord pads + gentle bells + a small reverb for the music; noise, filters and short sine bursts for
// the effects (pops, clicks, swishes, thuds, paper, coins: nothing melodic). The humming background (human voices, no
// instruments) is made from real hummed clips instead: 06-tools/humming_bed.py.
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

// ------------------------------------------------------------------ sound effects
// Each one is short and non-melodic: it marks a thing appearing, moving, landing or counting on screen.
const sec = (s) => Math.round(s * SR);
let fxSeed = 11;
const rand = () => ((fxSeed = (fxSeed * 16807) % 2147483647) / 2147483647);
const noise = () => rand() * 2 - 1;
const noiseBuf = (n) => Float32Array.from({length: n}, noise);

/** State-variable filter; `cutoff` may be a function of time (seconds) for sweeps. */
function svf(x, cutoff, q = 0.7, mode = 'band') {
  const y = new Float32Array(x.length);
  const damp = 1 / q;
  let low = 0;
  let band = 0;
  for (let i = 0; i < x.length; i++) {
    const fc = typeof cutoff === 'function' ? cutoff(i / SR) : cutoff;
    const f = 2 * Math.sin((Math.PI * Math.min(fc, SR / 6.5)) / SR);
    low += f * band;
    const high = x[i] - low - damp * band;
    band += f * high;
    y[i] = mode === 'low' ? low : mode === 'high' ? high : band;
  }
  return y;
}

/** A mono sound from a per-sample function of time. */
const make = (dur, fn) => Float32Array.from({length: sec(dur)}, (_, i) => fn(i / SR, i));

/** Mono → stereo (optionally panned from right to left as it plays, like things moving in an RTL layout), normalised. */
function finish(x, {peak = 0.7, pan = null, width = null} = {}) {
  const n = x.length;
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const other = width ? svf(noiseBuf(n), 2500, 0.7, 'band') : null;
  for (let i = 0; i < n; i++) {
    const u = i / n;
    const gl = pan ? 0.55 + 0.45 * u : 1;
    const gr = pan ? 1 - 0.45 * u : 1;
    L[i] = x[i] * gl;
    R[i] = x[i] * gr;
    if (width) {
      L[i] += width[i] * other[i];
      R[i] -= width[i] * other[i];
    }
  }
  let m = 0;
  for (let i = 0; i < n; i++) m = Math.max(m, Math.abs(L[i]), Math.abs(R[i]));
  const fade = sec(0.004);
  for (let i = 0; i < n; i++) {
    const g = (peak / (m || 1)) * Math.min(1, (n - 1 - i) / fade);
    L[i] *= g;
    R[i] *= g;
  }
  return [L, R];
}

/** Metallic or glassy strike: [frequency, level, decay per second] partials. */
const partials = (t, list) => list.reduce((a, [f, lv, d]) => a + Math.sin(2 * Math.PI * f * t) * lv * Math.exp(-t * d), 0);

function sweepTone(dur, freq, env) {
  let ph = 0;
  return make(dur, (t) => {
    ph += (2 * Math.PI * freq(t)) / SR;
    return Math.sin(ph) * env(t);
  });
}

const SFX = {
  // a card or chip appears
  pop: () => {
    const x = sweepTone(0.18, (t) => 260 + 640 * Math.exp(-t * 55), (t) => Math.min(1, t / 0.002) * Math.exp(-t * 30));
    for (let i = 0; i < sec(0.003); i++) x[i] += noise() * 0.25 * (1 - i / sec(0.003));
    return finish(x);
  },
  // a chat bubble or a small item
  bubble: () => finish(sweepTone(0.12, (t) => 420 + 1100 * Math.exp(-t * 70), (t) => Math.min(1, t / 0.002) * Math.exp(-t * 40)), {peak: 0.6}),
  // a list item, a field filled in
  tick: () => {
    const click = svf(make(0.05, (t) => noise() * Math.exp(-t * 600)), 3500, 1.5);
    return finish(make(0.05, (t, i) => Math.sin(2 * Math.PI * 1900 * t) * Math.exp(-t * 140) * 0.6 + click[i] * 2), {peak: 0.55});
  },
  // a word typed (two variants so typing doesn't sound like a machine gun)
  type: () => {
    const click = svf(make(0.08, (t) => noise() * Math.exp(-t * 220)), 2600, 1.2);
    return finish(make(0.08, (t, i) => Math.sin(2 * Math.PI * (170 + 40 * Math.exp(-t * 80)) * t) * Math.exp(-t * 70) * 0.5 + click[i] * 1.6), {peak: 0.5});
  },
  type2: () => {
    const click = svf(make(0.08, (t) => noise() * Math.exp(-t * 260)), 3300, 1.2);
    return finish(make(0.08, (t, i) => Math.sin(2 * Math.PI * (200 + 50 * Math.exp(-t * 90)) * t) * Math.exp(-t * 80) * 0.4 + click[i] * 1.6), {peak: 0.5});
  },
  // something slides in or flies across
  swish: () => {
    const dur = 0.35;
    const x = svf(noiseBuf(sec(dur)), (t) => 700 * Math.pow(6, t / dur), 1.2);
    return finish(Float32Array.from(x, (v, i) => v * Math.sin((Math.PI * i) / x.length) ** 2), {pan: true});
  },
  // a marker crosses something out
  strike: () => {
    const x = svf(noiseBuf(sec(0.16)), (t) => 4200 - 2700 * (t / 0.16), 1.4);
    return finish(Float32Array.from(x, (v, i) => v * Math.min(1, i / sec(0.004)) * Math.exp((-i / SR) * 18)), {peak: 0.6});
  },
  // a rubber stamp hits the page
  stamp: () => {
    const body = svf(noiseBuf(sec(0.6)), 900, 0.7, 'low');
    const snap = svf(noiseBuf(sec(0.6)), 2000, 0.7, 'high');
    const room = svf(noiseBuf(sec(0.6)), 1200, 0.7, 'low');
    const thump = sweepTone(0.6, (t) => 48 + 70 * Math.exp(-t * 28), (t) => Math.min(1, t / 0.001) * Math.exp(-t * 9));
    return finish(make(0.6, (t, i) => Math.tanh(1.6 * (thump[i] + body[i] * 0.7 * Math.exp(-t * 35) + snap[i] * 0.6 * Math.exp(-t * 400) + room[i] * 0.06 * Math.exp(-t * 7)))), {peak: 0.8});
  },
  // the big reveal
  impact: () => {
    const sub = sweepTone(1.5, (t) => 34 + 46 * Math.exp(-t * 9), (t) => Math.min(1, t / 0.002) * Math.exp(-t * 2.8));
    const burst = svf(noiseBuf(sec(1.5)), 500, 0.7, 'low');
    const air = svf(noiseBuf(sec(1.5)), 3000, 0.8);
    const x = make(1.5, (t, i) => Math.tanh(1.4 * (sub[i] + burst[i] * 0.8 * Math.exp(-t * 14))) + air[i] * 0.08 * Math.exp(-t * 3.5));
    return finish(x, {peak: 0.8, width: Float32Array.from(x, (_, i) => 0.05 * Math.exp((-i / SR) * 3.5))});
  },
  // tension before a reveal (a rising hiss, no pitch)
  riser: () => {
    const dur = 1.6;
    const x = svf(noiseBuf(sec(dur)), (t) => 250 * Math.pow(22, t / dur), 1.5);
    const env = (i) => Math.pow(i / x.length, 2.2) * Math.min(1, (x.length - i) / sec(0.025));
    return finish(Float32Array.from(x, (v, i) => v * env(i)), {peak: 0.6, width: Float32Array.from(x, (_, i) => 0.25 * env(i))});
  },
  // a hidden thing, a puzzle (tiny high sparkles)
  shimmer: () => {
    const dur = 1.0;
    const L = new Float32Array(sec(dur));
    const R = new Float32Array(sec(dur));
    for (let g = 0; g < 45; g++) {
      const t0 = dur * 0.85 * Math.pow(rand(), 1.6);
      const len = sec(0.006 + rand() * 0.012);
      const grain = svf(noiseBuf(len), 5000 + rand() * 4500, 4);
      const amp = Math.exp(-t0 * 3) * (0.4 + 0.6 * rand());
      const pan = rand();
      const s0 = sec(t0);
      for (let i = 0; i < len && s0 + i < L.length; i++) {
        const v = grain[i] * amp * Math.sin((Math.PI * i) / len);
        L[s0 + i] += v * (1 - pan);
        R[s0 + i] += v * pan;
      }
    }
    let m = 0;
    for (let i = 0; i < L.length; i++) m = Math.max(m, Math.abs(L[i]), Math.abs(R[i]));
    return [L.map((v) => (v * 0.6) / m), R.map((v) => (v * 0.6) / m)];
  },
  // a page turns (calendars, files)
  paper: () => {
    const hi = svf(noiseBuf(sec(0.32)), 1200, 0.7, 'high');
    const mid = svf(noiseBuf(sec(0.32)), 3200, 0.8);
    const burst = (t, at) => (t >= at && t < at + 0.12 ? Math.sin((Math.PI * (t - at)) / 0.12) ** 1.5 : 0);
    return finish(make(0.32, (t, i) => (hi[i] * 0.6 + mid[i]) * (burst(t, 0) + 0.7 * burst(t, 0.11)) * (1 + 0.5 * Math.sin(2 * Math.PI * 35 * t))), {peak: 0.55, pan: true});
  },
  // a counter rolls and slows to a stop
  roll: () => {
    const dur = 0.95;
    const x = new Float32Array(sec(dur));
    for (let t0 = 0, gap = 0.03; t0 < 0.85; t0 += gap, gap *= 1.12) {
      const u = t0 / 0.85;
      const s0 = sec(t0);
      for (let i = 0; i < sec(0.03) && s0 + i < x.length; i++) {
        const t = i / SR;
        x[s0 + i] += (Math.sin(2 * Math.PI * (1700 - 400 * u) * t) * Math.exp(-t * 180) + noise() * Math.exp(-t * 700) * 0.3) * (1 - 0.6 * u);
      }
    }
    return finish(x, {peak: 0.45});
  },
  // a positive result lands (one glassy tap)
  ping: () => finish(make(0.9, (t) => Math.min(1, t / 0.0015) * partials(t, [[1870, 1, 5.5], [4920, 0.35, 11], [7350, 0.12, 18]])), {peak: 0.45}),
  // a coin drops (money, one riyal a second)
  coin: () => {
    const strike = (t) => partials(t, [[3150, 1, 22], [4620, 0.7, 30], [7130, 0.45, 40], [9010, 0.25, 55]]);
    const bounce = (t) => partials(t, [[3213, 1, 26], [4712, 0.7, 34], [7273, 0.45, 44]]);
    return finish(make(0.45, (t) => strike(t) + (t > 0.075 ? 0.45 * bounce(t - 0.075) : 0) + (t < 0.002 ? noise() * 0.3 : 0)), {peak: 0.5});
  },
  // something soft lands
  thud: () => {
    const body = svf(noiseBuf(sec(0.3)), 600, 0.7, 'low');
    const tone = sweepTone(0.3, (t) => 60 + 80 * Math.exp(-t * 40), (t) => Math.min(1, t / 0.001) * Math.exp(-t * 16));
    return finish(make(0.3, (t, i) => tone[i] + body[i] * 0.5 * Math.exp(-t * 60)), {peak: 0.7});
  },
  // a question to the viewer: a soft rising "hm?"
  question: () => {
    const smooth = (u) => u * u * (3 - 2 * u);
    let ph = 0;
    return finish(make(0.38, (t) => {
      ph += (2 * Math.PI * (360 + 260 * smooth(Math.min(1, t / 0.25)) + 6 * Math.sin(2 * Math.PI * 7 * t))) / SR;
      return (Math.sin(ph) + 0.2 * Math.sin(2 * ph)) * Math.min(1, t / 0.015) * Math.exp(-Math.max(0, t - 0.2) * 14);
    }), {peak: 0.45});
  },
  // a phone vibrating (two buzzes)
  buzz: () => {
    const body = (t) => (t < 0.2 || (t > 0.27 && t < 0.47) ? 1 : 0);
    const x = make(0.55, (t) => Math.tanh(3 * Math.sin(2 * Math.PI * 150 * t)) * body(t) * (0.85 + 0.15 * noise()));
    return finish(svf(x, 900, 0.7, 'low'), {peak: 0.6});
  },
  // a button pressed
  click: () => {
    const hi = svf(noiseBuf(sec(0.08)), 2500, 0.7, 'high');
    return finish(make(0.08, (t, i) => hi[i] * (Math.exp(-t * 900) + 0.6 * (t > 0.022 ? Math.exp(-(t - 0.022) * 900) : 0)) + Math.sin(2 * Math.PI * 2600 * t) * Math.exp(-t * 250) * 0.3), {peak: 0.6});
  },
  whoosh,
};

fs.mkdirSync(path.join(assets, 'music'), {recursive: true});
fs.mkdirSync(path.join(assets, 'sfx'), {recursive: true});
const which = process.argv[2] || 'all'; // all | calm | sfx
if (which === 'all' || which === 'calm') {
  const [ml, mr] = music();
  writeWav(path.join(assets, 'music/calm-pad.wav'), ml, mr);
  toMp3(path.join(assets, 'music/calm-pad.wav'), path.join(assets, 'music/calm-pad.mp3'));
}
if (which === 'all' || which === 'sfx') {
  for (const [name, fn] of Object.entries(SFX)) {
    const [l, r] = fn();
    writeWav(path.join(assets, `sfx/${name}.wav`), l, r);
    toMp3(path.join(assets, `sfx/${name}.wav`), path.join(assets, `sfx/${name}.mp3`));
  }
}
console.log('music + sfx written to', path.relative(process.cwd(), assets));
