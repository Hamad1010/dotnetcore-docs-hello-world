"""Procedural sound effects (no musical instruments, no bells).

Beds return periodic stereo arrays (2, L); single sounds return short mono
arrays that tracks place with engine.wrap_add.
"""
import numpy as np
from scipy import signal

from engine import (SR, S, F, lp, hp, bp, peq, pfilt, white, pink, brown, pcurve, curve,
                    wrap_add, pan_gains, db, make_ir, preverb)


# ------------------------------------------------------------ primitives
def env_exp(n, tau, attack=0.0005):
    t = np.arange(n) / SR
    return np.exp(-t / tau) * (1 - np.exp(-t / max(attack, 1e-5)))


def peak_norm(y):
    return y / (np.abs(y).max() + 1e-12)


def put(y, x, t, g=1.0):
    i = S(t)
    m = min(len(x), len(y) - i)
    if m > 0:
        y[i:i + m] += g * x[:m]


def modal(rng, modes, dur, exc_len=24, exc_decay=5.0):
    """Decaying sinusoid modes [(Hz, tau s, amp)] excited by a tiny noise burst."""
    n = S(dur)
    t = np.arange(n) / SR
    y = np.zeros(n)
    for f, tau, a in modes:
        y += a * np.exp(-t / tau) * np.sin(2 * np.pi * f * t + rng.uniform(0, 2 * np.pi))
    exc = rng.standard_normal(exc_len) * np.exp(-np.arange(exc_len) / exc_decay)
    return peak_norm(np.convolve(exc, y)[:n])


def burst(rng, dur, f1, f2, tau, attack=0.0002, order=2):
    n = S(dur)
    x = rng.standard_normal(n) * env_exp(n, tau, attack)
    return peak_norm(F(x, bp(f1, f2, order) if f2 else hp(f1, order)))


def bubble(rng, f0, dur=0.05, rise=None, tau=None):
    """Water drop / bubble 'plip': decaying sine with rising pitch (Minnaert resonance)."""
    n = S(dur)
    t = np.arange(n) / SR
    rise = rng.uniform(0.15, 0.6) if rise is None else rise
    tau = tau or rng.uniform(0.006, 0.016)
    f = f0 * (1 + rise * t / dur)
    return peak_norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / tau) * (1 - np.exp(-t / 0.0005)))


def impulses(rng, L, rate, sigma=0.6, env=None, signed=False):
    """Random impulse train (Poisson, optionally rate-modulated by env)."""
    cnt = rng.poisson(rate * L / SR)
    if env is None:
        idx = rng.integers(0, L, cnt)
    else:
        cdf = np.cumsum(env)
        idx = np.minimum(np.searchsorted(cdf, rng.random(cnt) * cdf[-1]), L - 1)
    amp = np.minimum(rng.lognormal(0, sigma, cnt), np.exp(2.5 * sigma))
    if signed:
        amp *= rng.choice([-1.0, 1.0], cnt)
    imp = np.zeros(L)
    np.add.at(imp, idx, amp)
    return imp


def pconv(x, k):
    """Periodic convolution of a long signal with a short kernel."""
    y = signal.oaconvolve(x, k)
    L = len(x)
    out = y[:L].copy()
    out[:len(y) - L] += y[L:]
    return out


# ----------------------------------------------------------------- rain
def rain(rng, L, density=1.0, hiss=1.0, drops=1.0, muffle=None, mod=0.2, heavy=0.0, bright=1.0):
    out = np.zeros((2, L))
    common = pink(rng, L)
    for c in range(2):
        out[c] = pfilt(0.6 * common + 0.8 * pink(rng, L), bp(450, 11000, 2)) * 0.22 * hiss
    del common
    kinds = [
        (lambda: burst(rng, 0.006, 3000, 10000, 0.0007), 650, 0.09 * bright, 3),          # fine patter
        (lambda: burst(rng, 0.012, 900, 4000, 0.0018), 170, 0.15, 3),                     # taps
        (lambda: bubble(rng, rng.uniform(1300, 3300), 0.035), 16, 0.08, 3),               # plips
        (lambda: burst(rng, 0.03, 450, 2600, 0.005, attack=0.001), 30 + 60 * heavy, 0.2, 2),  # splats
    ]
    for maker, rate, g, nvar in kinds:
        for _ in range(nvar):
            k = maker()
            for c in range(2):
                out[c] += pconv(impulses(rng, L, rate * density / nvar), k) * g * drops
    T = L / SR
    out *= np.maximum(1 + mod * pcurve(rng, L, T * 0.04) + 0.05 * pcurve(rng, L, T * 0.5), 0.2)
    if muffle:
        out = pfilt(out, lp(muffle, 2))
    return out


def roof_rain(rng, L, density=1.0):
    """Rain heard from inside a car: dull metal-roof taps + glass ticks + muffled hiss."""
    out = np.zeros((2, L))
    for c in range(2):
        out[c] = pfilt(pink(rng, L), bp(250, 3500, 2)) * 0.18
    taps = [modal(rng, [(rng.uniform(170, 260), 0.02, 1.0), (rng.uniform(420, 620), 0.012, 0.6),
                        (rng.uniform(900, 1300), 0.006, 0.35), (rng.uniform(2500, 3500), 0.003, 0.2)], 0.06)
            for _ in range(4)]
    ticks = [burst(rng, 0.006, 2500, 9000, 0.0008) for _ in range(3)]
    for c in range(2):
        for k in taps:
            out[c] += pconv(impulses(rng, L, 260 * density / len(taps), 0.7), k) * 0.12
        for k in ticks:
            out[c] += pconv(impulses(rng, L, 120 * density / len(ticks), 0.7), k) * 0.05
    T = L / SR
    out *= np.maximum(1 + 0.18 * pcurve(rng, L, T * 0.04), 0.3)
    return out


def drip(rng, f0=None):
    """Single water drip into a puddle / pool."""
    f0 = f0 or rng.uniform(700, 2400)
    y = np.zeros(S(0.14))
    put(y, burst(rng, 0.004, 2000, 10000, 0.0006), 0, 0.25)
    put(y, bubble(rng, f0, dur=0.12, rise=rng.uniform(0.3, 1.0), tau=rng.uniform(0.012, 0.035)), 0.001, 1.0)
    return peak_norm(y)


# -------------------------------------------------------------- weather
def thunder(rng, dist=1.0, dur=None):
    dur = dur or rng.uniform(6, 11)
    n = S(dur)
    t = np.arange(n) / SR
    e = np.zeros(n)
    for _ in range(rng.integers(3, 8)):
        c, w = rng.uniform(0.3, dur * 0.55), rng.uniform(0.25, 1.4)
        e += rng.uniform(0.35, 1.0) * np.exp(-0.5 * ((t - c) / w) ** 2)
    e += 0.5 * np.exp(-t / (dur * 0.3)) * (1 - np.exp(-t / 0.4))
    e *= np.clip((dur - t) / 2.0, 0, 1)
    e = e / e.max() * np.maximum(0, 1 + 0.25 * curve(rng, n, 6.0, fs=SR))
    cut = 160 + 380 * (1 - dist)
    ch = []
    for _ in range(2):
        x = signal.lfilter([1.0], [1.0, -0.995], rng.standard_normal(n))
        ch.append(F(F(x, lp(cut, 4)), hp(22, 2)) * e)
    return peak_norm(np.array(ch))


def wind(rng, L, howl=0.5, tilt=0.5, gust_rate=0.06):
    """Gusty wind: modulated noise filterbank + a wandering narrow 'howl' resonance."""
    T = L / SR
    out = np.zeros((2, L))
    gust = pcurve(rng, L, T * gust_rate)
    centers = np.geomspace(90, 2400, 9)
    hc = np.geomspace(330, 950, 8)
    for c in range(2):
        src = white(rng, L)
        for fc in centers:
            m = np.maximum(0, 0.6 + 0.5 * gust + 0.35 * pcurve(rng, L, T * 0.12)) ** 1.5
            out[c] += pfilt(src, bp(fc / 1.25, fc * 1.25, 2)) * (fc / 90) ** -tilt * m
        if howl > 0:
            pos = np.clip((pcurve(rng, L, T * 0.05) + 1.6) / 3.2, 0, 1) * (len(hc) - 1)
            gw = np.maximum(0, 0.35 + 0.65 * gust)
            for j, fc in enumerate(hc):
                w = np.exp(-0.5 * ((pos - j) / 0.7) ** 2) * gw
                out[c] += howl * 5 * pfilt(src, bp(fc / 1.03, fc * 1.03, 2)) * w
    return out


# ---------------------------------------------------------------- clocks
CLOCKS = {
    'wall': [(3100, 0.010, 1.0), (4400, 0.007, 0.6), (5900, 0.004, 0.35), (1850, 0.016, 0.45),
             (760, 0.030, 0.5), (230, 0.025, 0.35)],
    'grandfather': [(1500, 0.020, 0.8), (2300, 0.012, 0.5), (520, 0.050, 0.9), (210, 0.070, 0.7),
                    (3400, 0.006, 0.3)],
    'office': [(2500, 0.008, 1.0), (3700, 0.006, 0.6), (1200, 0.012, 0.5), (5200, 0.003, 0.3),
               (420, 0.015, 0.3)],
}


def clock_tick(rng, kind='wall', tock=False):
    base = 0.92 if tock else 1.0
    modes = [(f * base * rng.uniform(0.99, 1.01) if f > 300 else f, tau, a) for f, tau, a in CLOCKS[kind]]
    y = np.zeros(S(0.16))
    for dt, a in [(0, 1.0), (rng.uniform(0.0025, 0.0045), 0.45), (rng.uniform(0.007, 0.011), 0.22)]:
        put(y, modal(rng, modes, 0.13), dt, a)
    return peak_norm(y)


def clock(rng, L, kind='wall', rate=1.0, pan=-0.3, tock_gain=0.8):
    T = L / SR
    nt = int(round(T * rate))
    var = [[clock_tick(rng, kind, False) for _ in range(4)], [clock_tick(rng, kind, True) for _ in range(4)]]
    out = np.zeros((2, L))
    for i in range(nt):
        g = (1.0 if i % 2 == 0 else tock_gain) * db(rng.normal(0, 0.8))
        wrap_add(out, var[i % 2][rng.integers(4)], S((i + 0.37) / rate + rng.normal(0, 0.0015)), g, pan)
    return out


# ----------------------------------------------------------- typewriter
def tw_key(rng):
    y = np.zeros(S(0.2))
    put(y, modal(rng, [(rng.uniform(1150, 1350), 0.020, 0.8), (rng.uniform(1900, 2150), 0.014, 0.7),
                       (rng.uniform(2700, 3000), 0.010, 0.6), (rng.uniform(3600, 4000), 0.006, 0.4),
                       (rng.uniform(170, 230), 0.025, 0.9), (rng.uniform(420, 520), 0.018, 0.5)], 0.12), 0, 0.9)
    put(y, burst(rng, 0.012, 1500, 9000, 0.0012), 0, 0.6)
    put(y, modal(rng, [(rng.uniform(3000, 3600), 0.004, 1.0), (rng.uniform(5200, 6000), 0.003, 0.5)], 0.03),
        rng.uniform(0.015, 0.025), 0.25)
    put(y, modal(rng, [(rng.uniform(800, 1000), 0.012, 1.0), (rng.uniform(2200, 2500), 0.008, 0.6)], 0.05),
        rng.uniform(0.07, 0.1), 0.18)
    return peak_norm(y)


def tw_space(rng):
    y = np.zeros(S(0.2))
    put(y, modal(rng, [(rng.uniform(140, 190), 0.03, 1.0), (rng.uniform(600, 750), 0.015, 0.5),
                       (rng.uniform(1600, 1900), 0.008, 0.3)], 0.1), 0, 0.8)
    put(y, modal(rng, [(rng.uniform(3000, 3600), 0.004, 1.0)], 0.03), rng.uniform(0.02, 0.03), 0.3)
    return peak_norm(y)


def tw_return(rng):
    """Carriage return: ratchet + slide + line-feed clunk (no margin bell)."""
    dur = rng.uniform(0.55, 0.8)
    y = np.zeros(S(dur + 0.3))
    nclick = int(rng.integers(14, 24))
    times = np.cumsum(np.linspace(0.04, 0.018, nclick) * rng.uniform(0.85, 1.15, nclick))
    for tt in times / times[-1] * dur * 0.85:
        put(y, modal(rng, [(rng.uniform(2400, 3200), 0.004, 1.0), (rng.uniform(900, 1200), 0.008, 0.5)], 0.02),
            tt, rng.uniform(0.25, 0.4))
    n = S(dur)
    put(y, peak_norm(F(rng.standard_normal(n), bp(700, 3500, 2)) * np.sin(np.linspace(0, np.pi, n)) ** 0.7), 0, 0.18)
    put(y, modal(rng, [(rng.uniform(110, 150), 0.05, 1.0), (rng.uniform(500, 650), 0.02, 0.6),
                       (rng.uniform(1800, 2200), 0.01, 0.4)], 0.15), dur, 0.9)
    return peak_norm(y)


def paper(rng, dur=None):
    """Paper rustle / page turn."""
    dur = dur or rng.uniform(0.5, 1.4)
    n = S(dur)
    imp = np.zeros(n)
    cnt = rng.poisson(rng.uniform(300, 900) * dur)
    np.add.at(imp, rng.integers(0, n, cnt), rng.lognormal(0, 0.9, cnt) * rng.choice([-1.0, 1.0], cnt))
    crk = F(imp, bp(1500, 9000, 2))
    whoosh = F(rng.standard_normal(n), bp(500, 4000, 2))
    e = np.sin(np.linspace(0, np.pi, n)) ** 0.6 * np.maximum(0, 1 + 0.5 * curve(rng, n, 8, fs=SR))
    return peak_norm((peak_norm(crk) * 0.7 + peak_norm(whoosh) * 0.3) * e)


def typewriter(rng, L, pan=0.15, pause=(5, 16), long_pause=(14, 30)):
    T = L / SR
    keys = [tw_key(rng) for _ in range(14)]
    spaces = [tw_space(rng) for _ in range(4)]
    rets = [tw_return(rng) for _ in range(3)]
    out = np.zeros((2, L))
    t, col, lim = rng.uniform(1, 4), 0, int(rng.integers(55, 70))
    while t < T - 1:
        for _ in range(int(rng.integers(4, 14))):
            for _ in range(int(rng.integers(2, 9))):
                wrap_add(out, keys[rng.integers(len(keys))], S(t), db(rng.normal(0, 1.5)), pan + rng.normal(0, 0.03))
                t += max(0.075, rng.normal(0.17, 0.05))
                col += 1
            wrap_add(out, spaces[rng.integers(len(spaces))], S(t), 0.7 * db(rng.normal(0, 1)), pan)
            t += max(0.09, rng.normal(0.21, 0.06))
            col += 1
            if col > lim:
                t += rng.uniform(0.2, 0.6)
                wrap_add(out, rets[rng.integers(len(rets))], S(t), 0.9, pan + 0.1)
                t += rng.uniform(1.0, 1.8)
                col, lim = 0, int(rng.integers(55, 70))
            if rng.random() < 0.08:
                t += rng.uniform(0.6, 2.2)
            if t > T - 1:
                break
        t += rng.uniform(*pause) if rng.random() < 0.75 else rng.uniform(*long_pause)
    return out


# --------------------------------------------------------- room sounds
def room_tone(rng, L, cut=900):
    out = np.zeros((2, L))
    for c in range(2):
        out[c] = pfilt(pink(rng, L), lp(cut, 2)) * 0.5 + brown(rng, L) * 0.3
    return out


def ventilation(rng, L):
    out = np.zeros((2, L))
    for c in range(2):
        out[c] = pfilt(brown(rng, L), lp(420, 2)) * 0.7 + pfilt(pink(rng, L), bp(200, 2600, 2)) * 0.22
    return out


def fluorescent(rng, L, mains=50):
    T = L / SR
    ph = 2 * np.pi * mains * (np.arange(L) / SR)
    rasp = np.abs(np.sin(ph)) ** 12
    rasp = pfilt(rasp - rasp.mean(), bp(180, 4000, 2))
    rasp /= rasp.std()
    hum = np.sin(2 * ph) + 0.35 * np.sin(4 * ph) + 0.15 * np.sin(6 * ph)
    hum /= hum.std()
    y = (0.35 * rasp + 0.65 * hum) * (1 + 0.12 * pcurve(rng, L, T * 2.0))
    return np.vstack([y, y])


def flicker(rng, mains=50):
    """A failing tube stutter: gated 100 Hz rasp with clicks (~0.4-1.3 s)."""
    dur = rng.uniform(0.4, 1.3)
    n = S(dur)
    ph = 2 * np.pi * mains * (np.arange(n) / SR)
    rasp = F(np.abs(np.sin(ph)) ** 16, bp(200, 5000, 2))
    gate = np.repeat(rng.random(int(dur * 25) + 1) > 0.45, S(0.04))[:n].astype(float)
    gate = F(gate, lp(300, 1))
    y = rasp * gate
    for _ in range(rng.integers(2, 6)):
        put(y, burst(rng, 0.004, 2000, 9000, 0.0006) * 0.5 * np.abs(y).max(), rng.uniform(0, dur * 0.9))
    return peak_norm(y)


def footstep(rng):
    y = np.zeros(S(0.35))
    put(y, burst(rng, 0.05, 200, 3000, 0.008, attack=0.0008), 0, 0.6)
    put(y, modal(rng, [(rng.uniform(80, 120), 0.03, 1.0), (rng.uniform(250, 350), 0.015, 0.4)], 0.12), 0, 0.8)
    put(y, burst(rng, 0.04, 400, 4000, 0.006, attack=0.001), rng.uniform(0.05, 0.08), 0.35)
    return peak_norm(y)


def walk_by(rng, rate=1.85, cut=2500):
    n_steps = int(rng.integers(10, 18))
    out = np.zeros((2, S(n_steps / rate + 0.6)))
    steps = [footstep(rng) for _ in range(4)]
    direction = rng.choice([-1, 1])
    for i in range(n_steps):
        u = i / (n_steps - 1)
        wrap_add(out, steps[i % 4] * (1 - 0.15 * (i % 2)), S(i / rate + rng.normal(0, 0.012)),
                 np.exp(-((u - 0.5) / 0.28) ** 2), direction * (u * 2 - 1) * 0.8)
    return F(out, lp(cut, 2))


def door_close(rng):
    y = np.zeros(S(0.8))
    put(y, modal(rng, [(rng.uniform(55, 80), 0.12, 1.0), (rng.uniform(140, 190), 0.06, 0.6),
                       (rng.uniform(400, 600), 0.03, 0.3)], 0.6), 0, 1.0)
    put(y, burst(rng, 0.08, 150, 2000, 0.02), 0, 0.4)
    put(y, modal(rng, [(rng.uniform(1800, 2600), 0.01, 1.0), (rng.uniform(3500, 4500), 0.006, 0.5)], 0.05),
        rng.uniform(0.01, 0.03), 0.35)
    return peak_norm(y)


def creak(rng, dur=None):
    """Wooden chair / floor creak: stick-slip impulses through wood resonances."""
    dur = dur or rng.uniform(0.3, 1.1)
    n = S(dur)
    rate = np.maximum(rng.uniform(40, 120) * (1 + 0.6 * curve(rng, n, 4, fs=SR)), 15)
    ticks = np.diff(np.floor(np.cumsum(rate) / SR), prepend=0) > 0
    exc = ticks * rng.lognormal(0, 0.4, n)
    k = modal(rng, [(rng.uniform(380, 520), 0.02, 1.0), (rng.uniform(900, 1200), 0.012, 0.7),
                    (rng.uniform(1700, 2300), 0.008, 0.4)], 0.05)
    return peak_norm(signal.oaconvolve(exc, k)[:n] * np.sin(np.linspace(0, np.pi, n)) ** 0.5)


# -------------------------------------------------------------- heartbeat
def heartbeat_sound(rng):
    y = np.zeros(S(0.6))

    def thump(f0, f1, tau, dur):
        n = S(dur)
        t = np.arange(n) / SR
        f = f1 + (f0 - f1) * np.exp(-t / 0.03)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / tau) * (1 - np.exp(-t / 0.004))

    put(y, thump(rng.uniform(62, 70), rng.uniform(40, 46), 0.07, 0.3), 0, 1.0)
    nz = F(rng.standard_normal(S(0.06)) * env_exp(S(0.06), 0.012, 0.002), lp(180, 2))
    put(y, peak_norm(nz), 0, 0.3)
    put(y, thump(rng.uniform(75, 85), rng.uniform(50, 58), 0.05, 0.25), rng.uniform(0.27, 0.31), 0.7)
    return peak_norm(y)


def heartbeat(rng, L, bpm=62):
    T = L / SR
    nb = int(round(T * bpm / 60))
    per = T / nb
    sounds = [heartbeat_sound(rng) for _ in range(4)]
    out = np.zeros((2, L))
    for i in range(nb):
        wrap_add(out, sounds[rng.integers(4)], S((i + 0.29) * per + rng.normal(0, 0.006)), db(rng.normal(0, 0.7)), 0.0)
    return out


# ------------------------------------------------------------------- fire
def fire(rng, L, size=1.0):
    T = L / SR
    out = np.zeros((2, L))
    for c in range(2):
        fl = np.maximum(0, 1 + 0.35 * pcurve(rng, L, T * 3) + 0.2 * pcurve(rng, L, T * 0.15))
        out[c] = (pfilt(brown(rng, L), lp(450, 2)) * 0.5 + pfilt(pink(rng, L), bp(2000, 9000, 2)) * 0.05) * fl
    small = [burst(rng, 0.004, rng.uniform(1500, 3000), 10000, 0.0006) for _ in range(4)]
    pops = [modal(rng, [(rng.uniform(500, 900), 0.006, 1.0), (rng.uniform(1500, 2500), 0.004, 0.6)], 0.03)
            for _ in range(3)]
    for c in range(2):
        env = np.maximum(0, pcurve(rng, L, T * 1.2)) ** 3 + 0.05
        for k in small:
            out[c] += pconv(impulses(rng, L, 12 * size / len(small), 0.8, env, True), k) * 0.25
        for k in pops:
            out[c] += pconv(impulses(rng, L, 1.2 * size / len(pops), 0.8, env, True), k) * 0.35
    return out


def log_shift(rng):
    """Burning log settling: soft thump + crackle burst."""
    dur = rng.uniform(1.0, 2.0)
    y = np.zeros(S(dur))
    put(y, modal(rng, [(rng.uniform(70, 110), 0.08, 1.0), (rng.uniform(200, 300), 0.04, 0.5)], 0.4), 0, 0.8)
    for _ in range(rng.integers(8, 25)):
        put(y, burst(rng, 0.004, rng.uniform(1500, 3000), 10000, 0.0006),
            rng.uniform(0, dur * 0.8) ** 1.5 / dur ** 0.5, rng.uniform(0.1, 0.6))
    return peak_norm(y)


# ------------------------------------------------------------------ train
def clack(rng):
    y = np.zeros(S(0.25))
    put(y, modal(rng, [(rng.uniform(70, 100), 0.05, 1.0), (rng.uniform(180, 240), 0.03, 0.5),
                       (rng.uniform(800, 1100), 0.018, 0.45), (rng.uniform(1500, 2000), 0.012, 0.35),
                       (rng.uniform(2700, 3300), 0.007, 0.2)], 0.2), 0, 1.0)
    put(y, burst(rng, 0.03, 300, 5000, 0.006), 0, 0.35)
    return peak_norm(y)


def train(rng, L, speed_kmh=95.0, joint_m=25.0):
    """Interior of a moving train: wheel-over-joint rhythm + rumble (periodic over the loop)."""
    T = L / SR
    tt = np.arange(int(T * 100)) / 100.0
    v = speed_kmh / 3.6 * (1 + 0.04 * np.sin(2 * np.pi * 2 * tt / T + rng.uniform(0, 6.3))
                           + 0.015 * np.sin(2 * np.pi * 5 * tt / T + rng.uniform(0, 6.3)))
    s = np.concatenate([[0.0], np.cumsum(v[:-1]) / 100.0])
    total = s[-1] + v[-1] / 100.0
    K = int(round(total / joint_m))
    s *= K * joint_m / total
    total = K * joint_m
    clacks = [clack(rng) for _ in range(6)]
    clk = np.zeros((2, L))
    axles = [(0.0, 0.85, -0.3), (2.6, 0.8, -0.3), (17.6, 0.55, 0.35), (20.2, 0.5, 0.35)]
    for k in range(K):
        for off, g, pan in axles:
            d = (k * joint_m + off) % total
            tk = np.interp(d, s, tt) + 0.37
            wrap_add(clk, clacks[rng.integers(6)], S(tk + rng.normal(0, 0.002)), g * db(rng.normal(0, 1.2)), pan)
    rum = np.zeros((2, L))
    for c in range(2):
        rum[c] = pfilt(brown(rng, L), lp(220, 2)) * 0.9 + pfilt(pink(rng, L), bp(300, 3000, 2)) * 0.12
    return clk, pfilt(rum, peq(95, 4.0, 1.2))


def passing_train(rng):
    dur = rng.uniform(5, 8)
    n = S(dur)
    t = np.arange(n) / SR
    e = np.exp(-0.5 * ((t - dur * 0.45) / (dur * 0.18)) ** 2)
    pan = rng.choice([-1, 1]) * np.tanh((t - dur * 0.45) / (dur * 0.18)) * 0.7
    x = F(brown(rng, n) * 0.7 + pink(rng, n) * 0.3, lp(1500, 2)) * e
    gl, gr = pan_gains(pan)
    return peak_norm(np.vstack([x * gl, x * gr]))


def rattle(rng):
    """Small loose-fitting rattle inside the carriage."""
    dur = rng.uniform(0.15, 0.5)
    y = np.zeros(S(dur + 0.05))
    for _ in range(rng.integers(3, 9)):
        put(y, modal(rng, [(rng.uniform(1800, 3500), 0.004, 1.0), (rng.uniform(600, 1000), 0.006, 0.4)], 0.02),
            rng.uniform(0, dur), rng.uniform(0.3, 1.0))
    return peak_norm(y)


# -------------------------------------------------------------- projector
def projector(rng, L, fps=24):
    """Film projector: 24 fps claw clatter (returned separately) + fan/motor/film rustle."""
    T = L / SR
    clk = np.zeros((2, L))
    clicks = [modal(rng, [(rng.uniform(1700, 2100), 0.004, 1.0), (rng.uniform(2800, 3300), 0.003, 0.6),
                          (rng.uniform(900, 1100), 0.006, 0.5), (rng.uniform(4500, 5500), 0.002, 0.3)], 0.02)
              for _ in range(6)]
    nclk = int(round(T * fps))
    accent = 0.75 + 0.25 * np.cos(2 * np.pi * np.arange(nclk) / 4)
    for i in range(nclk):
        wrap_add(clk, clicks[rng.integers(6)], S((i + 0.4) / fps + rng.normal(0, 0.0007)),
                 accent[i] * db(rng.normal(0, 1.0)), 0.1)
    t = np.arange(L) / SR
    mech = np.zeros((2, L))
    for c in range(2):
        mech[c] = pfilt(pink(rng, L), bp(150, 4000, 2)) * (1 + 0.25 * np.sin(2 * np.pi * 48 * t + c * 0.3)) * 0.35
    mech += (0.25 * np.sin(2 * np.pi * 120 * t) + 0.1 * np.sin(2 * np.pi * 240 * t)) * 0.3
    mech += pfilt(white(rng, L), bp(3000, 9000, 2)) * (0.5 + 0.5 * np.sin(2 * np.pi * 24 * t) ** 8) * 0.05
    return clk, mech


# ------------------------------------------------------------------ focus
def brown_focus(rng, L):
    T = L / SR
    common = brown(rng, L)
    w = np.clip(0.5 + 0.35 * pcurve(rng, L, T / 45), 0, 1)
    out = np.zeros((2, L))
    for c in range(2):
        x = 0.75 * common + 0.65 * brown(rng, L)
        out[c] = pfilt(x, lp(320, 2)) * (1 - w) + pfilt(x, lp(1100, 2)) * w
    return out * (1 + 0.1 * pcurve(rng, L, T / 60))


# ------------------------------------------------------------------- city
def car_pass(rng, wet=True):
    dur = rng.uniform(4, 7)
    n = S(dur)
    t = np.arange(n) / SR
    tc, w = dur * rng.uniform(0.45, 0.55), dur * rng.uniform(0.14, 0.2)
    e = np.exp(-0.5 * ((t - tc) / w) ** 2)
    pan = rng.choice([-1, 1]) * np.tanh((t - tc) / w * 1.2) * 0.85
    eng = brown(rng, n)
    body = F(eng, lp(400, 2)) * (1 - e) + F(eng, lp(1800, 2)) * e
    tire = F(pink(rng, n), bp(1200, 7000, 2)) * e ** 1.5 * (0.8 if wet else 0.3)
    x = (body * 0.6 + tire * 0.5) * e
    gl, gr = pan_gains(pan)
    return peak_norm(np.vstack([x * gl, x * gr]))


def traffic(rng, L):
    T = L / SR
    out = np.zeros((2, L))
    for c in range(2):
        m = np.maximum(0.2, 1 + 0.35 * pcurve(rng, L, T * 0.1))
        out[c] = (pfilt(brown(rng, L), lp(380, 2)) * 0.8 + pfilt(pink(rng, L), bp(300, 1500, 2)) * 0.15) * m
    return out


# ----------------------------------------------------------- server room
def server_hum(rng, L):
    T = L / SR
    t = np.arange(L) / SR
    out = np.zeros((2, L))
    for c in range(2):
        out[c] = pfilt(pink(rng, L), bp(150, 3500, 2)) * 0.3 + pfilt(brown(rng, L), lp(150, 2)) * 0.25
    for f, a in [(118, 0.05), (236, 0.025), (183, 0.03), (366, 0.015), (512, 0.01)]:
        f = round(f * T) / T
        out += np.sin(2 * np.pi * f * t + rng.uniform(0, 6.3)) * a * (1 + 0.2 * pcurve(rng, L, T * 0.3))
    return out


def kb_key(rng):
    y = np.zeros(S(0.14))
    put(y, modal(rng, [(rng.uniform(2200, 3200), 0.004, 1.0), (rng.uniform(4000, 5500), 0.003, 0.5),
                       (rng.uniform(600, 900), 0.008, 0.6), (rng.uniform(250, 350), 0.010, 0.4)], 0.05), 0, 1.0)
    put(y, modal(rng, [(rng.uniform(1800, 2600), 0.003, 1.0), (rng.uniform(700, 900), 0.006, 0.5)], 0.03),
        rng.uniform(0.06, 0.1), 0.35)
    return peak_norm(y)


def typing_modern(rng, L, pan=0.05, pause=(6, 25)):
    T = L / SR
    keys = [kb_key(rng) for _ in range(10)]
    out = np.zeros((2, L))
    t = rng.uniform(1, 5)
    while t < T - 1:
        burst_len = rng.uniform(2, 10)
        end = t + burst_len
        while t < end:
            wrap_add(out, keys[rng.integers(len(keys))], S(t), db(rng.normal(0, 2)), pan + rng.normal(0, 0.04))
            t += max(0.06, rng.normal(0.12, 0.04)) + (rng.uniform(0.2, 0.6) if rng.random() < 0.12 else 0)
        t += rng.uniform(*pause)
    return out


def mouse_click(rng):
    y = np.zeros(S(0.2))
    k = [(rng.uniform(3500, 4500), 0.002, 1.0), (rng.uniform(1500, 2200), 0.003, 0.5)]
    put(y, modal(rng, k, 0.02), 0, 1.0)
    put(y, modal(rng, k, 0.02), rng.uniform(0.07, 0.11), 0.6)
    return peak_norm(y)


def scroll(rng):
    nt = int(rng.integers(6, 15))
    y = np.zeros(S(nt / 30 + 0.05))
    for i in range(nt):
        put(y, modal(rng, [(rng.uniform(4000, 5500), 0.0015, 1.0)], 0.01), i / rng.uniform(25, 40), rng.uniform(0.5, 1.0))
    return peak_norm(y)


def hdd(rng):
    y = np.zeros(S(0.5))
    t = 0.0
    for _ in range(rng.integers(3, 12)):
        put(y, modal(rng, [(rng.uniform(3000, 6000), 0.0015, 1.0)], 0.01), t, rng.uniform(0.4, 1.0))
        t += rng.uniform(0.005, 0.04)
    return peak_norm(y)
