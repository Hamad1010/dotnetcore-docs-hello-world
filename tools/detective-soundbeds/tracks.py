"""The 20 track recipes.  Each takes (L samples, rng) and returns a periodic stereo mix.

Tracks 1-10: wordless hummed / "ooh" choir (a cappella, no instruments), some with ambience.
Tracks 11-20: pure sound design (no music at all).
"""
import os
import sys

import numpy as np

from engine import SR, S, db, lufs, limit, pfilt, hp, lp, make_ir, preverb, wrap_add, pcurve
from voice import sing, pad_part, seq, nm
import sfx


# ---------------------------------------------------------------- helpers
def fit(layers, base=-23.0, crest=16.0):
    """Sum layers [(stereo, relative LU)] after normalizing each to base + rel LUFS.

    Each layer's peaks are first held to `crest` dB above its own loudness, so sharp
    transients (ticks, clacks, keys) don't end up driving the master limiter.
    """
    out = None
    for x, rel in layers:
        l = lufs(x)
        if not np.isfinite(l):
            continue
        x, _ = limit(x, l + crest)
        l = lufs(x)
        x = x * db(base + rel - l)
        if os.environ.get('DEBUG_FIT'):
            print(f'  layer rel={rel:+.0f} LU  peak={20 * np.log10(np.abs(x).max()):+.1f} dBFS  '
                  f'crest={20 * np.log10(np.abs(x).max()) - (base + rel):.1f} dB', file=sys.stderr)
        out = x if out is None else out + x
    return out


def scatter(L, rng, maker, every=(40, 90), gain_db=(-3, 0), pan=(-0.6, 0.6)):
    out = np.zeros((2, L))
    T = L / SR
    t = rng.uniform(*every) * rng.uniform(0.15, 1.0)
    while t < T:
        wrap_add(out, maker(), S(t), db(rng.uniform(*gain_db)), rng.uniform(*pan))
        t += rng.uniform(*every)
    return out


def room(x, rng, rt=0.6, wet=0.3, predelay=0.008, hf=0.5):
    return x + wet * preverb(x, make_ir(rng, rt60=rt, predelay=predelay, hf=hf, er=8, er_spread=0.03))


def hall(bus, rng, rt=3.2, wet=0.6, dry=0.8, predelay=0.03):
    bus = pfilt(bus, hp(55, 2))
    return bus * dry + preverb(bus, make_ir(rng, rt60=rt, predelay=predelay)) * wet


def cycles(L, cycle_s):
    n = int(round(L / SR / cycle_s))
    assert abs(n * cycle_s - L / SR) < 1e-6, f'length must be a multiple of {cycle_s}s'
    return n


def male(**kw):
    return dict(female=False, **kw)


def female(**kw):
    return dict(female=True, **kw)


# ======================================================= HUMMED VOCALS (1-10)
def t01_case_file_noir(L, rng):
    """D minor line cliche: i - i(maj7) - i7 - i6 - VImaj7 - iv6/9 - V7sus4 - V7, 5 s per chord."""
    CH = [('D3', 'A3', 'D4', 'F4'), ('D3', 'A3', 'C#4', 'F4'), ('D3', 'A3', 'C4', 'F4'), ('D3', 'A3', 'B3', 'F4'),
          ('Bb2', 'A3', 'D4', 'F4'), ('G2', 'A3', 'Bb3', 'E4'), ('A2', 'G3', 'D4', 'E4'), ('A2', 'G3', 'C#4', 'E4')]
    n = cycles(L, 40)
    parts = [male(vowel='m', voices=5, width=0.3, attack=0.7, release=1.0, breath_every=10, vib=(4, 12)),
             male(vowel='m', voices=4, width=0.6, attack=0.7, release=1.0, breath_every=10, vib=(5, 15)),
             female(vowel='m', voices=5, width=0.5, attack=0.7, release=1.0, breath_every=10, vib=(6, 18)),
             female(vowel='u', voices=4, width=0.7, attack=0.9, release=1.2, breath_every=10, vib=(10, 25),
                    breath=0.07, air=0.03)]
    gains = [1.0, 0.7, 0.8, 0.5]
    act = [lambda c, i: True, lambda c, i: c % 5 in (1, 2, 3), lambda c, i: True, lambda c, i: c % 5 in (2, 3)]
    vel = lambda c, i: 0.7 + 0.25 * np.sin(np.pi * (i + 0.5) / 8)
    bus = np.zeros((2, L))
    for p, part in enumerate(parts):
        sing(bus, pad_part(CH, p, 5.0, n, vel=vel, active=act[p]), part, rng, gains[p])
    return hall(bus, rng, rt=3.2, wet=0.6)


def t02_deduction(L, rng):
    """E Phrygian vocal ostinato ("dm . . dm . . dm .") at 96 BPM under slow 'ooh' chords."""
    beat = 60 / 96
    bar, e8 = 4 * beat, beat / 2
    n = cycles(L, 16 * bar)
    cyc = 16 * bar
    osti, osti_lo, drone, mel = [], [], [], []
    for c in range(n):
        for b in range(12):
            t0 = c * cyc + b * bar
            cres = 0.75 + 0.2 * b / 11
            for k, idx in enumerate((0, 3, 6)):
                pitch = 'E3' if idx < 6 else ('F3' if b % 2 == 0 else 'D3')
                osti.append([t0 + idx * e8, t0 + idx * e8 + 0.2, nm(pitch), (0.95 if idx == 0 else 0.75) * cres])
            osti_lo.append([t0, t0 + 0.22, nm('E2'), 0.8 * cres])
        drone.append([c * cyc, (c + 1) * cyc, nm('E2'), 0.6])
        if c % 3 == 1:
            mel += seq([('E4', 4), ('F4', 2), ('E4', 2), ('D4', 4), ('E4', 4), ('G4', 3), ('F4', 1), ('E4', 4),
                        ('D4', 2), ('C4', 2), ('B3', 4)], beat, t0=c * cyc + 8 * bar, vel=0.7)
    for i in range(1, len(drone)):
        drone[i][0] = drone[i - 1][1]
    PAD = [('G3', 'B3', 'E4'), ('A3', 'C4', 'F4'), ('G3', 'B3', 'E4'), ('A3', 'D4', 'F4'),
           ('G3', 'B3', 'E4'), ('A3', 'C4', 'F4'), ('B3', 'D4', 'G4'), ('A3', 'C4', 'F4')]
    stac = dict(vowel='m', attack=0.012, release=0.12, vib=(0, 3), scoop=(0, 12), swell=0, dip=0, timing=0.008,
                glide=0.6, breath=0.02)
    bus = np.zeros((2, L))
    sing(bus, osti, male(voices=3, width=0.25, **stac), rng, 1.0)
    sing(bus, osti_lo, male(voices=2, width=0.1, **stac), rng, 0.55)
    sing(bus, drone, male(vowel='m', voices=3, width=0.2, attack=1.0, release=1.2, breath_every=9, vib=(3, 8)), rng, 0.45)
    padact = lambda c, i: i >= 2
    for p, (part, g) in enumerate([(male(vowel='u', voices=4, width=0.5, attack=1.2, release=1.4, breath_every=10, air=0.02), 0.55),
                                   (female(vowel='u', voices=4, width=0.6, attack=1.2, release=1.4, breath_every=10, air=0.03), 0.5),
                                   (female(vowel='u', voices=3, width=0.75, attack=1.4, release=1.6, breath_every=10, vib=(10, 24), air=0.03), 0.35)]):
        sing(bus, pad_part(PAD, p, 2 * bar, n, active=padact, vel=lambda c, i: 0.65 + 0.05 * i), part, rng, g)
    sing(bus, mel, female(vowel='u', voices=2, width=0.15, attack=0.35, release=0.9, vib=(15, 30), breath=0.08, air=0.04,
                          breath_every=8), rng, 0.45)
    return hall(bus, rng, rt=2.6, wet=0.5)


def t03_midnight_investigation(L, rng):
    """C minor lament bass (C-Bb-Ab-G) under held 'ooh' voices + soft rain and distant thunder."""
    CH = ([('C3', 'G3', 'C4', 'Eb4')] * 2 + [('Bb2', 'G3', 'C4', 'Eb4')] * 2 + [('Ab2', 'G3', 'C4', 'Eb4')] * 2
          + [('G2', 'G3', 'C4', 'D4'), ('G2', 'G3', 'B3', 'D4')])
    n = cycles(L, 24)
    parts = [male(vowel='u', voices=5, width=0.3, attack=0.9, release=1.2, breath_every=9, vib=(4, 12), tilt=0.8),
             male(vowel='u', voices=4, width=0.55, attack=0.9, release=1.2, breath_every=9, air=0.02),
             female(vowel='u', voices=4, width=0.5, attack=0.9, release=1.2, breath_every=9, air=0.03),
             female(vowel='u', voices=4, width=0.7, attack=1.1, release=1.4, breath_every=9, vib=(10, 24), air=0.03)]
    gains = [1.0, 0.75, 0.7, 0.5]
    act = [lambda c, i: True, lambda c, i: True, lambda c, i: c % 4 != 0, lambda c, i: c % 4 != 0]
    bus = np.zeros((2, L))
    for p, part in enumerate(parts):
        sing(bus, pad_part(CH, p, 3.0, n, active=act[p]), part, rng, gains[p])
    DESC = [('G4',), ('G4',), ('F4',), ('F4',), ('Eb4',), ('Eb4',), ('D4',), ('D4',)]
    sing(bus, pad_part(DESC, 0, 3.0, n, active=lambda c, i: c % 4 in (1, 2), vel=lambda c, i: 0.6),
         female(vowel='u', voices=3, width=0.3, attack=1.0, release=1.5, vib=(14, 28), breath=0.08, air=0.04), rng, 0.35)
    voices = hall(bus, rng, rt=3.4, wet=0.65)
    rain = sfx.rain(rng, L, density=0.6, hiss=0.8, muffle=2500)
    thunder = scatter(L, rng, lambda: sfx.thunder(rng, dist=0.9), every=(50, 110), gain_db=(-4, 0))
    return fit([(voices, 0), (rain, -9), (thunder, -5)])


def t04_deep_focus_hum(L, rng):
    """Calm A minor humming, 10 s per chord, alto slowly morphing 'mmm' <-> 'ooh'."""
    CH = [('A2', 'E3', 'B3', 'C4'), ('F2', 'E3', 'A3', 'C4'), ('C3', 'E3', 'G3', 'B3'), ('G2', 'E3', 'G3', 'B3')]
    n = cycles(L, 40)
    T = L / SR
    morph = lambda t: 0.5 + 0.6 * np.sin(2 * np.pi * t / (T / 5))
    common = dict(attack=1.2, release=1.6, breath_every=9, vib=(3, 10), timing=0.08, swell=0.18)
    parts = [male(vowel='m', voices=5, width=0.3, **common),
             male(vowel='m', voices=4, width=0.5, **common),
             female(vowel=('m', 'u'), mix=morph, voices=5, width=0.6, air=0.02, **common),
             female(vowel='m', voices=4, width=0.7, **common)]
    gains = [1.0, 0.7, 0.75, 0.55]
    vel = lambda c, i: 0.7 + 0.12 * np.sin(2 * np.pi * (c * 4 + i) / 12)
    bus = np.zeros((2, L))
    for p, part in enumerate(parts):
        sing(bus, pad_part(CH, p, 10.0, n, vel=vel), part, rng, gains[p])
    return hall(bus, rng, rt=3.6, wet=0.7)


def t05_clue_by_clue(L, rng):
    """G minor hummed drone + a ticking wall clock + a solo hummed motif every minute."""
    n = cycles(L, 60)
    CH = [('G2', 'D3', 'Bb3'), ('G2', 'D3', 'Bb3'), ('Eb2', 'Bb2', 'G3'), ('D2', 'A2', 'F#3')]
    dur = [20, 20, 10, 10]
    bus = np.zeros((2, L))
    drone = dict(attack=1.5, release=1.8, breath_every=8, vib=(3, 9), timing=0.1, swell=0.1)
    sing(bus, pad_part(CH, 0, dur, n, vel=lambda c, i: 0.75), male(vowel='m', voices=4, width=0.3, **drone), rng, 1.0)
    sing(bus, pad_part(CH, 1, dur, n, vel=lambda c, i: 0.7), male(vowel='m', voices=3, width=0.5, **drone), rng, 0.7)
    sing(bus, pad_part(CH, 2, dur, n, vel=lambda c, i: 0.6), male(vowel='u', voices=3, width=0.6, air=0.02, **drone), rng, 0.4)
    A = [('G4', 1), ('Bb4', 1), ('A4', 2), ('D4', 2), (None, 1), ('G4', 1), ('Bb4', 1), ('C5', 1), ('A4', 3)]
    B = [('D5', 1), ('C5', 1), ('Bb4', 1), ('A4', 1), ('Bb4', 1), ('G4', 3), (None, 1), ('F#4', 2), ('G4', 4)]
    motif = []
    for c in range(n):
        if c % 4 != 3:
            motif += seq(A if c % 2 == 0 else B, 1.0, t0=c * 60 + 4, vel=0.8)
    sing(bus, motif, female(vowel='m', voices=2, width=0.1, attack=0.25, release=0.9, vib=(18, 32), scoop=(25, 55),
                            breath=0.05, breath_every=7, pan=0.15), rng, 0.6)
    voices = hall(bus, rng, rt=3.0, wet=0.55)
    clk = room(sfx.clock(rng, L, 'wall', 1.0, pan=-0.35), rng, rt=0.7, wet=0.25)
    return fit([(voices, 0), (clk, -11)])


def t06_cold_case(L, rng):
    """Sparse high 'ooh' clusters (F# minor / eerie) over a cold howling wind and a low hum."""
    n = cycles(L, 40)
    R = (None, None, None)
    CH = [('C#5', 'A4', 'F#4'), R, ('D5', 'B4', 'G4'), R, ('B4', 'A4', 'F#4'), R, ('C#5', 'A4', 'F4'), R]
    dur = [8, 2, 8, 2, 8, 2, 8, 2]
    bus = np.zeros((2, L))
    hi = dict(vowel='u', attack=1.5, release=1.5, vib=(12, 28), breath=0.08, air=0.04, breath_every=None, timing=0.12)
    for p, g in enumerate([0.5, 0.55, 0.6]):
        sing(bus, pad_part(CH, p, dur, n, vel=lambda c, i: 0.6 + 0.1 * (c % 2)), female(voices=4, width=0.7, **hi), rng, g)
    low = [[c * 40, (c + 1) * 40, nm('F#2'), 0.6] for c in range(n)]
    sing(bus, low, male(vowel='m', voices=3, width=0.2, attack=2.0, release=2.0, breath_every=8, vib=(2, 6)), rng, 0.5)
    voices = hall(bus, rng, rt=4.0, wet=0.75)
    w = sfx.wind(rng, L, howl=0.6, tilt=0.5)
    return fit([(voices, 0), (w, -4)])


def t07_the_suspect(L, rng):
    """C# minor low hummed drone + slow heartbeat + rising 'ooh' tension swells."""
    n = cycles(L, 40)
    T = L / SR
    bus = np.zeros((2, L))
    for note, nv, g in [('C#3', 3, 1.0), ('G#2', 3, 0.8)]:
        sing(bus, [[0.0, T, nm(note), 0.7]],
             male(vowel='m', voices=nv, width=0.3, attack=1.5, release=1.5, breath_every=8, vib=(2, 7)), rng, g)
    swl_lo, swl_hi = [], []
    for c in range(n):
        a, b = (('C#4', 'D4') if c % 2 == 0 else ('G#3', 'A3'))
        swl_lo.append([c * 40 + 18, c * 40 + 27, nm(a), 0.9])
        swl_hi.append([c * 40 + 18.5, c * 40 + 27, nm(b), 0.85])
    sw = dict(vowel='u', voices=4, width=0.6, attack=4.0, release=2.2, vib=(8, 20), air=0.03, breath=0.06, swell=0.3)
    sing(bus, swl_lo, male(**sw), rng, 0.6)
    sing(bus, swl_hi, female(**sw), rng, 0.5)
    voices = hall(bus, rng, rt=3.0, wet=0.55)
    heart = sfx.heartbeat(rng, L, bpm=62)
    w = sfx.wind(rng, L, howl=0.15, tilt=1.1)
    return fit([(voices, 0), (heart, -6), (w, -14)])


def t08_mind_palace(L, rng):
    """D Lydian 'ooh/aah' shimmer (I - II - vi7 - IVmaj7#11) for discovery / analysis moments."""
    CH = [('D3', 'A3', 'C#4', 'F#4'), ('D3', 'G#3', 'B3', 'E4'), ('B2', 'A3', 'D4', 'F#4'), ('G2', 'F#3', 'B3', 'C#4')]
    n = cycles(L, 30)
    T = L / SR
    morph = lambda t: 0.5 - 0.5 * np.cos(2 * np.pi * t / (T / 5))
    common = dict(attack=1.0, release=1.4, breath_every=9, air=0.03)
    parts = [male(vowel='u', voices=4, width=0.3, vib=(5, 14), **common),
             male(vowel='u', voices=4, width=0.5, **common),
             female(vowel='u', voices=4, width=0.6, **common),
             female(vowel=('u', 'a'), mix=morph, voices=4, width=0.75, vib=(12, 26), **common)]
    gains = [0.9, 0.7, 0.7, 0.5]
    bus = np.zeros((2, L))
    for p, part in enumerate(parts):
        sing(bus, pad_part(CH, p, 7.5, n, vel=lambda c, i: 0.72), part, rng, gains[p])
    ARP = [['F#4', 'A4', 'C#5', 'A4'], ['E4', 'G#4', 'B4', 'G#4'], ['D4', 'F#4', 'A4', 'F#4'], ['B3', 'C#4', 'F#4', 'C#4']]
    arp = []
    for c in range(n):
        if c % 4 in (1, 2):
            for i, notes in enumerate(ARP):
                arp += seq([(x, 1) for x in notes], 1.875, t0=c * 30 + i * 7.5, vel=0.65)
    sing(bus, arp, female(vowel='u', voices=2, width=0.4, attack=0.3, release=1.0, vib=(14, 28), dip=0.25, air=0.04,
                          breath_every=7.5), rng, 0.35)
    return hall(bus, rng, rt=3.8, wet=0.7)


def t09_thinking_loop(L, rng):
    """F minor hummed arpeggio (96 BPM) over a bass hum and a soft tenor 'ooh' (i - VI - III - V)."""
    beat = 60 / 96
    bar, e8 = 4 * beat, beat / 2
    n = cycles(L, 8 * bar)
    PAT = [['F3', 'C4', 'F4', 'C4', 'Ab3', 'C4', 'F4', 'C4'], ['F3', 'Db4', 'F4', 'Db4', 'Ab3', 'Db4', 'F4', 'Db4'],
           ['Eb3', 'C4', 'Eb4', 'C4', 'Ab3', 'C4', 'Eb4', 'C4'], ['E3', 'C4', 'E4', 'C4', 'G3', 'C4', 'E4', 'C4']]
    arp = []
    for c in range(n):
        if c % 6 == 5:
            continue
        for ch, pat in enumerate(PAT):
            t0 = c * 8 * bar + ch * 2 * bar
            notes = pat + pat
            for k, x in enumerate(notes):
                a = t0 + k * e8
                arp.append([a, a + (e8 * 0.5 if k == 15 else e8), nm(x), 0.8 if k % 4 == 0 else 0.68])
    BASS = [('F2', 'C4'), ('Db2', 'Db4'), ('Ab2', 'C4'), ('C3', 'C4')]
    bus = np.zeros((2, L))
    sing(bus, arp, female(vowel='m', voices=3, width=0.35, attack=0.05, release=0.35, dip=0.45, glide=0.5, vib=(0, 6),
                          scoop=(0, 10), swell=0, timing=0.012, breath=0.03), rng, 0.8)
    sing(bus, pad_part(BASS, 0, 2 * bar, n, vel=lambda c, i: 0.75),
         male(vowel='m', voices=4, width=0.3, attack=0.6, release=0.9, breath_every=9, vib=(3, 9)), rng, 0.9)
    sing(bus, pad_part(BASS, 1, 2 * bar, n, vel=lambda c, i: 0.6),
         male(vowel='u', voices=3, width=0.6, attack=1.0, release=1.2, breath_every=9, air=0.02), rng, 0.4)
    return hall(bus, rng, rt=2.6, wet=0.5)


def t10_rainy_night_hum(L, rng):
    """B minor humming choir (i - VI - iv - V) with rain on the window, a soft clock and far thunder."""
    CH = ([('B2', 'F#3', 'B3', 'D4')] * 2 + [('G2', 'G3', 'B3', 'D4')] * 2 + [('E2', 'G3', 'B3', 'E4')] * 2
          + [('F#2', 'F#3', 'B3', 'C#4'), ('F#2', 'F#3', 'A#3', 'C#4')])
    n = cycles(L, 24)
    common = dict(vowel='m', attack=0.8, release=1.2, breath_every=9)
    parts = [male(voices=5, width=0.3, vib=(4, 12), **common), male(voices=4, width=0.5, **common),
             female(voices=4, width=0.55, **common), female(voices=4, width=0.7, vib=(8, 20), **common)]
    gains = [1.0, 0.7, 0.75, 0.5]
    act = [lambda c, i: True, lambda c, i: True, lambda c, i: True, lambda c, i: c % 3 != 0]
    bus = np.zeros((2, L))
    for p, part in enumerate(parts):
        sing(bus, pad_part(CH, p, 3.0, n, active=act[p], vel=lambda c, i: 0.72), part, rng, gains[p])
    voices = hall(bus, rng, rt=3.0, wet=0.55)
    rain = sfx.rain(rng, L, density=1.0, muffle=2600)
    clk = room(sfx.clock(rng, L, 'wall', 1.0, pan=0.4), rng, rt=0.7, wet=0.25)
    thunder = scatter(L, rng, lambda: sfx.thunder(rng, dist=1.0), every=(90, 170), gain_db=(-4, 0))
    return fit([(voices, 0), (rain, -5), (clk, -13), (thunder, -7)])


# ====================================================== SOUND DESIGN (11-20)
def t11_rainy_detective_office(L, rng):
    rain = sfx.rain(rng, L, density=1.1, muffle=2600, mod=0.25)
    T = L / SR
    drips = np.zeros((2, L))
    for _ in range(2):
        per = rng.uniform(0.9, 1.6)
        k = int(T / per)
        f0, pan = rng.uniform(900, 2000), rng.uniform(-0.7, 0.7)
        snd = [sfx.drip(rng, f0 * rng.uniform(0.97, 1.03)) for _ in range(3)]
        ph = rng.uniform(0.2, 0.8) * T / k
        for i in range(k):
            wrap_add(drips, snd[rng.integers(3)], S(i * T / k + ph + rng.normal(0, 0.03)), db(rng.normal(0, 2)), pan)
    drips = room(drips, rng, rt=0.5, wet=0.3)
    clk = room(sfx.clock(rng, L, 'wall', 1.0, pan=-0.35), rng, rt=0.7, wet=0.3)
    thunder = scatter(L, rng, lambda: sfx.thunder(rng, dist=0.8), every=(55, 130), gain_db=(-4, 0))
    return fit([(rain, 0), (drips, -14), (clk, -10), (thunder, -4), (sfx.room_tone(rng, L), -24)])


def t12_typewriter_night(L, rng):
    tw = room(pfilt(sfx.typewriter(rng, L, pan=0.1), lp(7000, 2)), rng, rt=0.5, wet=0.25)
    pages = room(scatter(L, rng, lambda: sfx.paper(rng), every=(30, 80), gain_db=(-3, 0), pan=(-0.2, 0.4)), rng, 0.5, 0.25)
    rain = sfx.rain(rng, L, density=0.7, muffle=2200)
    return fit([(tw, 0), (pages, -8), (rain, -5), (sfx.room_tone(rng, L), -22)])


def t13_interrogation_room(L, rng):
    vent = sfx.ventilation(rng, L)
    tube = sfx.fluorescent(rng, L)
    clk = room(sfx.clock(rng, L, 'office', 1.0, pan=0.3, tock_gain=0.9), rng, rt=0.45, wet=0.35, hf=0.7)
    creaks = room(scatter(L, rng, lambda: sfx.creak(rng), every=(30, 75), gain_db=(-4, 0), pan=(-0.3, 0.3)), rng, 0.45, 0.35)
    flick = scatter(L, rng, lambda: sfx.flicker(rng), every=(45, 120), gain_db=(-3, 0), pan=(-0.1, 0.1))
    hallway = np.zeros((2, L))
    hallway += scatter(L, rng, lambda: sfx.walk_by(rng, cut=2000), every=(70, 160), gain_db=(-2, 0), pan=(0, 0))
    hallway += 0.8 * scatter(L, rng, lambda: sfx.door_close(rng), every=(90, 200), gain_db=(-3, 0), pan=(-0.6, 0.6))
    hallway = pfilt(hallway, lp(1600, 2))
    hallway = room(hallway, rng, rt=1.4, wet=0.6, predelay=0.02)
    return fit([(vent, 0), (tube, -10), (clk, -8), (creaks, -9), (flick, -12), (hallway, -8)])


def t14_fireside_study(L, rng):
    fire = sfx.fire(rng, L)
    clk = room(sfx.clock(rng, L, 'grandfather', 1.0, pan=0.45, tock_gain=0.85), rng, rt=0.8, wet=0.3)
    pages = room(scatter(L, rng, lambda: sfx.paper(rng, rng.uniform(0.6, 1.0)), every=(20, 60), pan=(-0.3, 0.1)), rng, 0.6, 0.25)
    logs = scatter(L, rng, lambda: sfx.log_shift(rng), every=(60, 140), gain_db=(-4, 0), pan=(-0.2, 0.2))
    outside = pfilt(sfx.wind(rng, L, howl=0.3, tilt=0.8), lp(900, 2))
    return fit([(fire, 0), (clk, -9), (pages, -9), (logs, -6), (outside, -16)])


def t15_night_train(L, rng):
    clk, rum = sfx.train(rng, L)
    passing = scatter(L, rng, lambda: sfx.passing_train(rng), every=(100, 220), gain_db=(-3, 0))
    rattles = scatter(L, rng, lambda: sfx.rattle(rng), every=(2, 8), gain_db=(-8, 0), pan=(-0.7, 0.7))
    clk = room(pfilt(clk, lp(2500, 2)), rng, 0.35, 0.2)
    return fit([(rum, 0), (clk, -4), (passing, -3), (rattles, -14)])


def t16_film_projector_archive(L, rng):
    clk, mech = sfx.projector(rng, L)
    mix = fit([(mech, 0), (clk, -3), (sfx.room_tone(rng, L), -18)])
    return pfilt(room(mix, rng, rt=0.6, wet=0.2), lp(5000, 2))


def t17_deep_focus_brown_noise(L, rng):
    return sfx.brown_focus(rng, L)


def t18_cave_of_clues(L, rng):
    T = L / SR
    dry = np.zeros((2, L))
    for _ in range(7):
        k = int(T / rng.uniform(1.6, 6.5))
        f0, pan, g = rng.uniform(800, 2400), rng.uniform(-0.8, 0.8), rng.uniform(0.3, 1.0)
        snd = [sfx.drip(rng, f0 * rng.uniform(0.97, 1.03)) for _ in range(3)]
        ph = rng.uniform(0.2, 0.8) * T / k
        for i in range(k):
            if rng.random() < 0.9:
                wrap_add(dry, snd[rng.integers(3)], S(i * T / k + ph + rng.normal(0, T / k * 0.04)), g * db(rng.normal(0, 1.5)), pan)
    for _ in range(int(T * 0.5)):
        wrap_add(dry, sfx.drip(rng), S(rng.uniform(0, T)), rng.uniform(0.1, 0.6), rng.uniform(-1, 1))
    drips = dry * 0.5 + preverb(dry, make_ir(rng, rt60=4.5, predelay=0.04, hf=0.5, er=18, er_spread=0.12))
    rumble = np.zeros((2, L))
    for c in range(2):
        rumble[c] = pfilt(sfx.brown(rng, L), sfx.bp(28, 140, 2)) * np.maximum(0, 1 + 0.4 * pcurve(rng, L, T / 30))
    air = pfilt(np.vstack([sfx.pink(rng, L), sfx.pink(rng, L)]), lp(1200, 2))
    return fit([(drips, 0), (rumble, -8), (air, -18)])


def t19_city_stakeout(L, rng):
    roof = sfx.roof_rain(rng, L)
    traffic = sfx.traffic(rng, L)
    cars = scatter(L, rng, lambda: sfx.car_pass(rng), every=(12, 40), gain_db=(-6, 0))
    return fit([(roof, 0), (traffic, -9), (pfilt(cars, lp(2500, 2)), -5)])


def t20_server_room_analysis(L, rng):
    hum = sfx.server_hum(rng, L)
    typing = room(sfx.typing_modern(rng, L), rng, rt=0.5, wet=0.25)
    mouse = scatter(L, rng, lambda: sfx.mouse_click(rng), every=(4, 20), gain_db=(-4, 0), pan=(0.2, 0.35))
    mouse += 0.8 * scatter(L, rng, lambda: sfx.scroll(rng), every=(15, 45), gain_db=(-4, 0), pan=(0.2, 0.35))
    disks = scatter(L, rng, lambda: sfx.hdd(rng), every=(5, 25), gain_db=(-6, 0), pan=(-0.6, 0.6))
    return fit([(hum, 0), (typing, -7), (room(mouse, rng, 0.5, 0.2), -12), (disks, -18)])


# ================================================================ registry
TRACKS = [
    # id, function, title, group, moods, short description
    (1, t01_case_file_noir, 'Case File Noir', 'vocal', ['Detective', 'Mystery'],
     'A four-part humming choir walks the classic noir line in D minor. It sounds like something is not quite right.'),
    (2, t02_deduction, 'Deduction', 'vocal', ['Analysis', 'Suspense'],
     'A hummed "dm . . dm" pulse at 96 BPM under slow "ooh" chords. It keeps momentum while you explain the evidence.'),
    (3, t03_midnight_investigation, 'Midnight Investigation', 'vocal', ['Detective', 'Dark'],
     'A descending lament bass in C minor sung on "ooh", with soft rain outside and thunder far away.'),
    (4, t04_deep_focus_hum, 'Deep Focus Hum', 'vocal', ['Focus', 'Calm'],
     'Slow, warm humming in A minor that drifts between "mmm" and "ooh". It stays out of the way of your voice.'),
    (5, t05_clue_by_clue, 'Clue by Clue', 'vocal', ['Detective', 'Focus'],
     'A low hummed drone, a ticking wall clock and a short hummed motif once a minute.'),
    (6, t06_cold_case, 'Cold Case', 'vocal', ['Mystery', 'Eerie'],
     'Sparse high "ooh" clusters over a cold howling wind and a deep hum, for old unsolved stories.'),
    (7, t07_the_suspect, 'The Suspect', 'vocal', ['Suspense', 'Tension'],
     'A deep C# minor hum, a slow heartbeat and rising "ooh" swells every 40 seconds.'),
    (8, t08_mind_palace, 'Mind Palace', 'vocal', ['Analysis', 'Discovery'],
     'A bright Lydian "ooh" and "aah" choir with a slow sung arpeggio, for the moment the pieces click.'),
    (9, t09_thinking_loop, 'Thinking Loop', 'vocal', ['Focus', 'Analysis'],
     'A gentle hummed arpeggio at 96 BPM over a bass hum. Steady and hypnotic, for step-by-step analysis.'),
    (10, t10_rainy_night_hum, 'Rainy Night Hum', 'vocal', ['Detective', 'Calm'],
     'A B minor humming choir with rain on the window, a soft clock and thunder far away.'),
    (11, t11_rainy_detective_office, 'Rainy Detective Office', 'ambience', ['Detective', 'Focus'],
     'Rain against the office window, a wall clock, a dripping gutter and distant thunder.'),
    (12, t12_typewriter_night, 'Typewriter Night', 'ambience', ['Detective', 'Writing'],
     'An old typewriter writing up the case notes, with page rustles and muffled rain outside.'),
    (13, t13_interrogation_room, 'Interrogation Room', 'ambience', ['Suspense', 'Detective'],
     'Ventilation, a buzzing tube light, a loud clock, chair creaks and footsteps in the corridor.'),
    (14, t14_fireside_study, 'Fireside Study', 'ambience', ['Focus', 'Calm'],
     "A crackling fireplace, a grandfather clock, turning pages and wind outside. The detective's study."),
    (15, t15_night_train, 'Night Train', 'ambience', ['Mystery', 'Focus'],
     'Inside a moving train at night: a steady wheel rhythm, deep rumble and the odd passing train.'),
    (16, t16_film_projector_archive, 'Film Projector Archive', 'ambience', ['Analysis', 'Retro'],
     'An old film projector rattling at 24 frames per second while you review the archive footage.'),
    (17, t17_deep_focus_brown_noise, 'Deep Focus Brown Noise', 'ambience', ['Focus', 'Calm'],
     'Smooth, slowly breathing brown noise. The most neutral bed for long explanations.'),
    (18, t18_cave_of_clues, 'Cave of Clues', 'ambience', ['Mystery', 'Calm'],
     'Water dripping in a deep cave, with long echoes and a low rumble.'),
    (19, t19_city_stakeout, 'City Stakeout', 'ambience', ['Detective', 'Suspense'],
     'Sitting in a parked car: rain on the roof, distant traffic and cars hissing past on wet streets.'),
    (20, t20_server_room_analysis, 'Server Room Analysis', 'ambience', ['Analysis', 'Tech'],
     'Humming servers and fans, bursts of typing, mouse clicks and disk chatter. Digital investigation.'),
]
