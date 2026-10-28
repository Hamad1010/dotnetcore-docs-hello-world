"""Turn short humming clips (human voices only) into one long, soft, seamless background loop.

    python3 channel/06-tools/humming_bed.py out.mp3 clip1.mp3 [clip2.mp3 …]

1. Finds each clip's key and tunes the others to the first one (rubberband, formants kept, so voices stay natural).
2. Chains the clips with slow crossfades and closes the loop, so the end flows back into the start.
3. Keeps it out of the narrator's way: high-pass 70 Hz, low-pass 5 kHz, a light room reverb (more of it starts to
   sound like a chant, not a hum), then -18 LUFS like every background. The studio plays it far lower under the voice (Episode.tsx).

Check a new bed for instruments with listen_check.py before using it (the channel's rule: no instruments).
"""
import os
import subprocess
import sys
import tempfile

import numpy as np

SR = 48000
XFADE = 2.5  # seconds
NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
MAJ = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
MIN = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])


def decode(path, filters=None):
    cmd = ['ffmpeg', '-v', 'error', '-i', path, *(['-af', filters] if filters else []), '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype=np.float32).reshape(-1, 2).copy()


def key_of(x):
    """Tonic (0-11) of the clip's key, from its pitch-class profile (Krumhansl-Schmuckler)."""
    mono, n = x.mean(1), 16384
    freqs = np.fft.rfftfreq(n, 1 / SR)
    band = (freqs > 70) & (freqs < 1000)
    pc = (np.round(12 * np.log2(freqs[band] / 261.63)) % 12).astype(int)
    ch = np.zeros(12)
    for s in range(0, len(mono) - n, n // 2):
        ch += np.bincount(pc, weights=np.abs(np.fft.rfft(mono[s:s + n] * np.hanning(n)))[band] ** 2, minlength=12)
    return max((np.corrcoef(np.roll(t, k), ch)[0, 1], k) for k in range(12) for t in (MAJ, MIN))[1]


def chain(clips):
    """Clips joined with equal-power crossfades; the tail is folded into the head so the loop has no seam."""
    f = int(XFADE * SR)
    a = np.sqrt(np.linspace(0, 1, f, dtype=np.float32))[:, None]
    out = clips[0]
    for c in clips[1:]:
        out = np.concatenate([out[:-f], out[-f:] * a[::-1] + c[:f] * a, c[f:]])
    head = out[:f] * a + out[-f:] * a[::-1]
    return np.concatenate([head, out[f:-f]])


def room(x, seconds=2.2, wet=0.14):
    """A soft room: convolution with a decaying, darkened noise tail (different per side, so it feels wide)."""
    rng = np.random.default_rng(7)
    n = int(seconds * SR)
    t = np.arange(n) / SR
    out = np.empty_like(x)
    for ch in range(2):
        ir = rng.standard_normal(n).astype(np.float32) * np.exp(-6.9 * t / seconds).astype(np.float32)
        for _ in range(3):  # darken the tail
            ir = np.convolve(ir, np.ones(6, dtype=np.float32) / 6, mode='same')
        ir[: int(0.02 * SR)] = 0  # pre-delay
        ir /= np.sqrt(np.sum(ir ** 2))
        # circular convolution: the loop's tail reverb wraps into its head, so the seam stays seamless
        size = 1 << int(np.ceil(np.log2(len(x) + n)))
        wetsig = np.fft.irfft(np.fft.rfft(x[:, ch], size) * np.fft.rfft(ir, size), size)[: len(x) + n]
        wetsig[: n] += wetsig[len(x):len(x) + n]
        out[:, ch] = x[:, ch] * (1 - wet) + wetsig[: len(x)] * wet * 0.9
    return out


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    dst, paths = sys.argv[1], sys.argv[2:]
    clips = [decode(p, 'highpass=f=70:poles=2,lowpass=f=5000') for p in paths]
    home = key_of(clips[0])
    for i in range(1, len(clips)):
        shift = (home - key_of(clips[i]) + 6) % 12 - 6  # nearest way to the first clip's key
        if shift:
            clips[i] = decode(paths[i], f'highpass=f=70:poles=2,lowpass=f=5000,rubberband=pitch={2 ** (shift / 12):.6f}:formant=preserved')
        print(f'  {os.path.basename(paths[i])}: {shift:+d} semitone(s) → {NAMES[home]}')
    bed = room(chain(clips))
    bed /= np.max(np.abs(bed)) / 0.8
    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, 'bed.f32')
        bed.astype(np.float32).tofile(wav)
        probe = subprocess.run(['ffmpeg', '-hide_banner', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', wav, '-af',
                                'loudnorm=I=-18:TP=-3:LRA=7:print_format=summary', '-f', 'null', '-'], capture_output=True, text=True).stderr
        gain = -18 - float(probe.split('Input Integrated:')[1].split('LUFS')[0])
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', wav, '-af', f'volume={gain:.2f}dB,alimiter=limit=0.7:level=false',
                        '-c:a', 'libmp3lame', '-b:a', '160k', dst], check=True)
    print(f'{dst}: {len(bed) / SR:.1f}s loop in {NAMES[home]}, -18 LUFS')


if __name__ == '__main__':
    main()
