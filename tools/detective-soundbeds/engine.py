"""Core DSP for seamless-loop procedural background audio.

Everything here treats a track as ONE PERIOD of an endlessly repeating signal:
events wrap around the end, filters are warmed up with the tail, reverb is a
circular convolution and modulation curves are periodic.  The rendered file
therefore loops with no click, gap or crossfade.
"""
import json
import subprocess

import numpy as np
from scipy import signal
from scipy.ndimage import minimum_filter1d, uniform_filter1d

SR = 44100
CR = 441            # control rate for slow modulation (SR / 100)
UP = SR // CR


def S(t):
    """Seconds -> samples."""
    return int(round(t * SR))


# ----------------------------------------------------------------- filters
def lp(f, order=2):
    return signal.butter(order, min(f, 0.45 * SR), 'lowpass', fs=SR, output='sos')


def hp(f, order=2):
    return signal.butter(order, f, 'highpass', fs=SR, output='sos')


def bp(f1, f2, order=2):
    return signal.butter(order, [f1, min(f2, 0.45 * SR)], 'bandpass', fs=SR, output='sos')


def peq(f, gain_db, q):
    """RBJ peaking EQ as a one-row sos."""
    A = 10 ** (gain_db / 40)
    w0 = 2 * np.pi * f / SR
    al = np.sin(w0) / (2 * q)
    cw = np.cos(w0)
    b = np.array([1 + al * A, -2 * cw, 1 - al * A])
    a = np.array([1 + al / A, -2 * cw, 1 - al / A])
    return np.array([[*(b / a[0]), 1.0, *(a[1:] / a[0])]])


def F(x, sos):
    return signal.sosfilt(sos, x, axis=-1)


def pfilt(x, sos, warm_s=3.0):
    """Filter a periodic signal so the result is periodic too (state warmed with the tail)."""
    w = min(S(warm_s), x.shape[-1])
    xx = np.concatenate([x[..., -w:], x], axis=-1)
    return signal.sosfilt(sos, xx, axis=-1)[..., w:]


def pfilt_ba(b, a, x, warm_s=3.0):
    w = min(S(warm_s), x.shape[-1])
    xx = np.concatenate([x[..., -w:], x], axis=-1)
    return signal.lfilter(b, a, xx, axis=-1)[..., w:]


# ------------------------------------------------------------------- noise
PINK_B = [0.049922035, -0.095993537, 0.050612699, -0.004408786]
PINK_A = [1.0, -2.494956002, 2.017265875, -0.522189400]


def white(rng, n):
    return rng.standard_normal(n)


def pink(rng, n):
    y = pfilt_ba(PINK_B, PINK_A, rng.standard_normal(n))
    return y / (y.std() + 1e-12)


def brown(rng, n, hpf=18.0):
    y = pfilt_ba([1.0], [1.0, -0.997], rng.standard_normal(n))
    y = pfilt(y, hp(hpf, 2))
    return y / (y.std() + 1e-12)


# ------------------------------------------------------- modulation curves
def pcurve(rng, n, cycles, smooth=True):
    """Periodic smooth random curve (~N(0,1)) of length n with `cycles` random knots per period."""
    k = max(3, int(round(cycles)))
    pts = rng.standard_normal(k)
    if not smooth:
        return np.interp(np.arange(n), np.arange(k) * (n / k), pts, period=n)
    nc = max(k * 8, min(n, k * 64))
    x = np.arange(nc) * (k / nc)
    i = np.floor(x).astype(int)
    u = x - i
    w = (1 - np.cos(np.pi * u)) / 2
    c = pts[i % k] * (1 - w) + pts[(i + 1) % k] * w
    return np.interp(np.arange(n) * (nc / n), np.arange(nc), c, period=nc)


def curve(rng, n, rate, fs=CR):
    """Non-periodic smooth random curve (for short, local use), n samples at rate fs."""
    k = int(np.ceil(n / fs * rate)) + 3
    pts = rng.standard_normal(k)
    x = np.arange(n) / fs * rate
    i = np.floor(x).astype(int)
    u = x - i
    w = (1 - np.cos(np.pi * u)) / 2
    return pts[i] * (1 - w) + pts[i + 1] * w


# ------------------------------------------------------------------ mixing
def pan_gains(p):
    a = (np.clip(p, -1, 1) + 1) * np.pi / 4
    return np.cos(a), np.sin(a)


def wrap_add(buf, x, start, gain=1.0, pan=0.0):
    """Add mono (n,) or stereo (2, n) `x` into periodic stereo `buf` at sample `start`, wrapping."""
    L = buf.shape[-1]
    if x.ndim == 1:
        gl, gr = pan_gains(pan)
        chans = (x * (gain * gl), x * (gain * gr))
    else:
        chans = (x[0] * gain, x[1] * gain)
    n = chans[0].shape[0]
    s = int(start) % L
    pos = 0
    while pos < n:
        c = min(n - pos, L - s)
        buf[0, s:s + c] += chans[0][pos:pos + c]
        buf[1, s:s + c] += chans[1][pos:pos + c]
        pos += c
        s = 0


def stereo(m, width=1.0, rng=None, other=None):
    """Mono -> stereo; optionally blend with a decorrelated `other` for width."""
    if other is None:
        return np.vstack([m, m])
    return np.vstack([m + width * other, m - width * other]) / np.sqrt(1 + width ** 2)


def rms(x):
    return float(np.sqrt(np.mean(np.square(x))) + 1e-12)


def norm_rms(x, target=0.1):
    return x * (target / rms(x))


def db(x):
    return 10 ** (x / 20)


# ----------------------------------------------------------------- reverb
def make_ir(rng, rt60=2.0, predelay=0.02, hf=0.6, er=10, er_spread=0.06, length=None,
            lo_mult=1.15, diffuse_ms=15):
    """Synthetic stereo impulse response (decaying filtered noise + early reflections), unit energy."""
    length = length or min(rt60 * 1.3, 7.0)
    n = S(length)
    t = np.arange(n) / SR
    irs = []
    for _ in range(2):
        nz = rng.standard_normal(n)
        ir = np.zeros(n)
        for lo, hi, k in [(None, 250, lo_mult), (250, 2000, 1.0), (2000, 6000, hf), (6000, None, hf * 0.55)]:
            sos = lp(hi, 4) if lo is None else (hp(lo, 4) if hi is None else bp(lo, hi, 4))
            ir += F(nz, sos) * np.exp(-6.9078 * t / (rt60 * k))
        ir *= 1 - np.exp(-t / (diffuse_ms / 1000))
        pk = np.abs(ir[:S(0.12)]).max()
        for _ in range(er):
            tp = rng.uniform(0.004, er_spread)
            i = S(tp)
            ir[i:i + 3] += rng.choice([-1, 1]) * rng.uniform(0.4, 1.0) * pk * np.exp(-tp / 0.05) * 1.5 * np.array([1, 0.6, 0.25])
        irs.append(np.concatenate([np.zeros(S(predelay)), ir]))
    irs = np.array(irs)
    return irs / np.sqrt((irs ** 2).sum(axis=1, keepdims=True))


def preverb(x, ir):
    """Circular (periodic) convolution reverb; returns the wet signal only."""
    L = x.shape[-1]
    out = np.empty_like(x)
    for c in range(2):
        y = signal.oaconvolve(x[c], ir[c])
        o = y[:L].copy()
        tail = y[L:]
        k = 0
        while k < len(tail):
            m = min(L, len(tail) - k)
            o[:m] += tail[k:k + m]
            k += m
        out[c] = o
    return out


# --------------------------------------------------------------- loudness
def _biquad(G, Q, fc, kind):
    A = 10 ** (G / 40)
    w0 = 2 * np.pi * fc / SR
    al = np.sin(w0) / (2 * Q)
    cw = np.cos(w0)
    if kind == 'shelf':
        b0 = A * ((A + 1) + (A - 1) * cw + 2 * np.sqrt(A) * al)
        b1 = -2 * A * ((A - 1) + (A + 1) * cw)
        b2 = A * ((A + 1) + (A - 1) * cw - 2 * np.sqrt(A) * al)
        a0 = (A + 1) - (A - 1) * cw + 2 * np.sqrt(A) * al
        a1 = 2 * ((A - 1) - (A + 1) * cw)
        a2 = (A + 1) - (A - 1) * cw - 2 * np.sqrt(A) * al
    else:
        b0, b1, b2 = (1 + cw) / 2, -(1 + cw), (1 + cw) / 2
        a0, a1, a2 = 1 + al, -2 * cw, 1 - al
    return [b0 / a0, b1 / a0, b2 / a0, 1.0, a1 / a0, a2 / a0]


KW = np.array([_biquad(4.0, 1 / np.sqrt(2), 1500.0, 'shelf'), _biquad(0.0, 0.5, 38.0, 'hp')])


def lufs(x):
    """ITU-R BS.1770 integrated loudness (gated) of stereo/mono x."""
    x = np.atleast_2d(x)
    y = signal.sosfilt(KW, x, axis=-1)
    blk, hop = S(0.4), S(0.1)
    if y.shape[1] < blk:
        return -np.inf
    cs = np.concatenate([np.zeros((y.shape[0], 1)), np.cumsum(y * y, axis=1)], axis=1)
    st = np.arange(0, y.shape[1] - blk + 1, hop)
    z = ((cs[:, st + blk] - cs[:, st]) / blk).sum(axis=0)
    l = -0.691 + 10 * np.log10(z + 1e-20)
    g1 = l > -70
    if not g1.any():
        return -np.inf
    rel = -0.691 + 10 * np.log10(z[g1].mean()) - 10
    g2 = g1 & (l > rel)
    return float(-0.691 + 10 * np.log10(z[g2].mean()))


def limit(x, ceiling_db=-2.0, win_ms=8.0):
    """Look-ahead peak limiter (periodic-aware). Returns (y, max gain reduction dB)."""
    c = db(ceiling_db)
    pk = np.max(np.abs(x), axis=0)
    g = np.minimum(1.0, c / np.maximum(pk, 1e-12))
    if g.min() >= 1.0:
        return x, 0.0
    w = max(1, int(win_ms * SR / 1000))
    gm = minimum_filter1d(g, size=2 * w + 1, mode='wrap')
    gs = uniform_filter1d(gm, size=w + 1, mode='wrap')
    return x * gs, float(20 * np.log10(gs.min()))


def master(x, target=-18.0, ceiling=-2.0):
    x = x - x.mean(axis=1, keepdims=True)
    for _ in range(3):
        l = lufs(x)
        x = x * db(target - l)
        x, gr = limit(x, ceiling)
        if abs(lufs(x) - target) < 0.15:
            break
    return x, dict(lufs=round(lufs(x), 2), peak_db=round(float(20 * np.log10(np.abs(x).max())), 2),
                   limiter_db=round(gr, 2))


# --------------------------------------------------------------- outputs
def encode_mp3(x, path, meta, bitrate='160k'):
    pcm = np.ascontiguousarray(x.T.astype(np.float32))
    cmd = ['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2',
           '-i', 'pipe:0', '-c:a', 'libmp3lame', '-b:a', bitrate, '-id3v2_version', '3']
    for k, v in meta.items():
        cmd += ['-metadata', f'{k}={v}']
    cmd.append(path)
    subprocess.run(cmd, input=pcm.tobytes(), check=True)


def envelope(x, points=160):
    """Normalized RMS envelope (for drawing a waveform)."""
    m = np.mean(np.abs(x), axis=0)
    n = len(m) // points
    e = np.sqrt(np.mean(np.square(m[:n * points]).reshape(points, n), axis=1))
    return [round(float(v), 3) for v in e / (e.max() + 1e-12)]


def spectrogram_png(x, path, title, seconds=60):
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    m = x[:, :S(seconds)].mean(axis=0)
    fig, ax = plt.subplots(2, 1, figsize=(12, 6), gridspec_kw=dict(height_ratios=[1, 3]))
    t = np.arange(len(m)) / SR
    step = max(1, len(m) // 6000)
    ax[0].plot(t[::step], m[::step], lw=0.4)
    ax[0].set_xlim(0, t[-1])
    ax[0].set_title(title)
    ax[1].specgram(m, NFFT=4096, Fs=SR, noverlap=2048, cmap='magma', vmin=-150, vmax=-30)
    ax[1].set_ylim(0, 8000)
    fig.tight_layout()
    fig.savefig(path, dpi=80)
    plt.close(fig)


def write_json(path, obj):
    with open(path, 'w') as f:
        json.dump(obj, f, indent=1)
