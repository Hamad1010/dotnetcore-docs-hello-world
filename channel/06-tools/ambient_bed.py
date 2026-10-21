"""Generate a background bed with no instruments: soft pure tones that breathe, made from pure math.

    python3 channel/06-tools/ambient_bed.py clear-case out.mp3            (10-minute seamless loop, -18 LUFS)
    python3 channel/06-tools/ambient_bed.py insight out.mp3 --seconds 180

Presets (bright, never sad: no minor chords):
  clear-case  curious, with momentum: an open G chord (G D B E A, a "6/9") whose upper voices pulse softly, about 48
              times a minute, like a mind at work.
  insight     calm and bright: an A chord with its ninth (A E C# B) that slowly opens up, with a faint shimmer.

Like the owner's "Detective Backgrounds" pack: soft tones, each from three slightly detuned voices, long swells and a
soft room. Every tone completes a whole number of cycles in the loop and every slow
movement divides its length, so the end flows straight back into the start. Screen the result with
listen_check.py; the owner's ears decide.
"""
import os
import subprocess
import sys
import tempfile

import numpy as np

SR = 44100
LUFS = -18


def q(f, length):
    """A frequency nudged so it completes a whole number of cycles in the loop (inaudible change)."""
    return round(f * length) / length


def lfo(t, period, phase=0.0, depth=1.0):
    """0 → 1 → 0 slow movement; `period` must divide the loop length."""
    return 1 - depth * 0.5 * (1 + np.cos(2 * np.pi * t / period + phase))


def tones(n, length, notes, seed):
    """Soft tones, each sung by three slightly detuned voices (a gentle shimmer, not the slow wobble of a singing
    bowl) with a little of its octave and twelfth, each breathing on its own slow cycle and, if asked, pulsing.
    `notes` = [(Hz, level, breathing period in s, pulse Hz or 0)]."""
    rng = np.random.default_rng(seed)
    L = np.zeros(n, np.float32)
    R = np.zeros(n, np.float32)
    chunk = SR * 10
    params = [(f, lv, per, pz, rng.uniform(0, 2 * np.pi), rng.uniform(0.25, 0.75)) for f, lv, per, pz in notes]
    for s in range(0, n, chunk):
        t = (np.arange(s, min(n, s + chunk)) / SR).astype(np.float64)
        for f, lv, per, pz, ph, pan in params:
            amp = lv * (0.4 + 0.6 * lfo(t, per, ph))
            if pz:
                amp = amp * (0.55 + 0.45 * (0.5 + 0.5 * np.cos(2 * np.pi * q(pz, length) * t + ph)) ** 2)
            v = np.zeros_like(t)
            for h, hl in ((1, 1.0), (2, 0.12), (3, 0.04)):
                for k, d in enumerate((-1.7, 0.0, 1.9)):
                    v += hl * np.sin(2 * np.pi * q(f * h + d, length) * t + ph * h + k * 2.1)
            v *= amp / 3
            L[s:s + len(t)] += (v * (1 - pan * 0.6)).astype(np.float32)
            R[s:s + len(t)] += (v * (0.4 + pan * 0.6)).astype(np.float32)
    return L, R


def room(L, R, seconds=3.0, wet=0.35):
    """A soft, wide room (circular convolution with a dark decaying noise tail, so the loop stays seamless)."""
    n = len(L)
    k = int(seconds * SR)
    t = np.arange(k) / SR
    out = []
    for x, seed in ((L, 41), (R, 42)):
        ir = np.random.default_rng(seed).standard_normal(k) * np.exp(-6.9 * t / seconds)
        ir = np.fft.irfft(np.fft.rfft(ir) * np.exp(-np.fft.rfftfreq(k, 1 / SR) / 2500), k)  # darker tail
        ir[: int(0.025 * SR)] = 0
        ir /= np.sqrt(np.sum(ir ** 2))
        wetx = np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(ir, n), n).astype(np.float32)  # circular
        out.append(x * (1 - wet) + wetx * wet)
    return out


def clear_case(length):
    # G2 D3 G3 B3 E4 A4: an open G "6/9"; the top three pulse softly at 0.8 Hz
    L, R = tones(int(length * SR), length, [(98.0, 0.55, length / 10, 0), (146.83, 0.45, length / 12, 0),
                                             (196.0, 0.40, length / 8, 0), (246.94, 0.26, length / 15, 0.8),
                                             (329.63, 0.20, length / 12, 0.8), (440.0, 0.12, length / 20, 0.8)], 3)
    return room(L, R)


def insight(length):
    # A2 E3 A3 C#4 B4 and a faint E5 shimmer that comes and goes
    L, R = tones(int(length * SR), length, [(110.0, 0.55, length / 10, 0), (164.81, 0.42, length / 12, 0),
                                             (220.0, 0.35, length / 8, 0), (277.18, 0.24, length / 15, 0),
                                             (493.88, 0.12, length / 20, 0), (659.26, 0.06, length / 6, 0)], 7)
    return room(L, R)


PRESETS = {'clear-case': clear_case, 'insight': insight}


def main():
    if len(sys.argv) < 3 or sys.argv[1] not in PRESETS:
        sys.exit(__doc__)
    preset, dst = sys.argv[1], sys.argv[2]
    length = float(sys.argv[sys.argv.index('--seconds') + 1]) if '--seconds' in sys.argv else 600.0
    L, R = PRESETS[preset](length)
    x = np.stack([L, R], 1)
    x /= np.max(np.abs(x)) / 0.8
    with tempfile.TemporaryDirectory() as tmp:
        raw = os.path.join(tmp, 'bed.f32')
        x.astype(np.float32).tofile(raw)
        src = ['-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', raw]
        probe = subprocess.run(['ffmpeg', '-hide_banner', *src, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
        measured = float(probe[probe.rindex('Summary:'):].split('I:')[1].split('LUFS')[0])
        subprocess.run(['ffmpeg', '-v', 'error', '-y', *src, '-af', f'volume={LUFS - measured:.2f}dB,alimiter=limit=0.8:level=false',
                        '-c:a', 'libmp3lame', '-b:a', '160k', dst], check=True)
    print(f'{dst}: {preset}, {length:.0f}s seamless loop, {LUFS} LUFS')


if __name__ == '__main__':
    main()
