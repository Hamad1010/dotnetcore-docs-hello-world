"""Formant-synthesized wordless voices: humming ("mmm"), "ooh", "oh", "aah".

Source-filter model: a Rosenberg glottal pulse (+ breath noise) driven by a
humanized pitch contour (portamento, scoops, delayed vibrato, drift, jitter)
feeds a Klatt-style cascade of formant resonators.  A choir part is an
ensemble of independent voices, each with its own timing, breathing, detune,
vocal-tract size and stereo position.
"""
import numpy as np
from scipy import signal

from engine import SR, CR, S, F, hp, bp, curve, wrap_add

# vowel -> (formant poles [(Hz, bandwidth)], anti-formants, spectral-tilt lowpass Hz); adult male
FORMANTS = {
    'm': ([(260, 90), (1050, 320), (2250, 280), (3200, 350)], [(850, 220)], 1100),
    'u': ([(310, 70), (800, 90), (2250, 130), (3250, 220), (3800, 260)], [], 2600),
    'o': ([(470, 80), (820, 90), (2550, 140), (3300, 220), (3800, 260)], [], 2900),
    'a': ([(700, 110), (1150, 120), (2550, 160), (3350, 250), (3850, 260)], [], 3300),
}
BREATH_SOS = bp(500, 6000, 2)
AIR_SOS = bp(3500, 11000, 2)
NOTE_IDX = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}


def nm(s):
    """Note name ('C#4', 'Bb2') -> MIDI number (C4 = 60)."""
    if isinstance(s, (int, float, np.integer)):
        return int(s)
    i, acc = 1, 0
    while i < len(s) and s[i] in '#b':
        acc += 1 if s[i] == '#' else -1
        i += 1
    return 12 * (int(s[i:]) + 1) + NOTE_IDX[s[0]] + acc


def _reson(f, bw):
    T = 1.0 / SR
    C = -np.exp(-2 * np.pi * bw * T)
    B = 2 * np.exp(-np.pi * bw * T) * np.cos(2 * np.pi * f * T)
    A = 1 - B - C
    return A, B, C


def reson(f, bw):
    A, B, C = _reson(f, bw)
    return [A, 0.0, 0.0, 1.0, -B, -C]


def antireson(f, bw):
    A, B, C = _reson(f, bw)
    return [1 / A, -B / A, -C / A, 1.0, 0.0, 0.0]


def vowel_sos(v, scale=1.0, tilt=1.0):
    poles, zeros, tilt_hz = FORMANTS[v]
    rows = [reson(f * scale, bw * (0.85 + 0.15 * scale)) for f, bw in poles]
    rows += [antireson(f * scale, bw) for f, bw in zeros]
    rows.append(signal.butter(1, min(tilt_hz * tilt, 0.4 * SR), 'lowpass', fs=SR, output='sos')[0])
    rows.append(hp(55, 1)[0])
    return np.array(rows)


def glottal(frac, oq=0.6, sq=2.4):
    """Rosenberg glottal-flow derivative for phase fraction in [0, 1)."""
    tp = oq * sq / (1 + sq)
    tn = oq / (1 + sq)
    y = np.zeros_like(frac)
    m = frac < tp
    y[m] = np.sin(np.pi * frac[m] / tp) * (np.pi / (2 * tp))
    m2 = (~m) & (frac < tp + tn)
    y[m2] = -np.sin(np.pi * (frac[m2] - tp) / (2 * tn)) * (np.pi / (2 * tn))
    return y


def voice_params(rng, part):
    female = part.get('female', False)
    return dict(
        detune=rng.normal(0, part.get('detune', 6.0)),
        drift=part.get('drift', 6.0),
        jitter=part.get('jitter', 2.5),
        vib_rate=rng.uniform(4.7, 5.9),
        vib_depth=rng.uniform(*part.get('vib', (8, 22))),
        vib_delay=rng.uniform(0.3, 0.8),
        glide=rng.uniform(0.05, 0.09) * part.get('glide', 1.0),
        scoop=rng.uniform(*part.get('scoop', (15, 45))),
        attack=part.get('attack', 0.45) * rng.uniform(0.8, 1.25),
        release=part.get('release', 0.8) * rng.uniform(0.8, 1.25),
        dip=part.get('dip', 0.12),
        swell=part.get('swell', 0.12),
        shimmer=part.get('shimmer', 0.05),
        oq=min(0.85, rng.uniform(0.55, 0.7) * part.get('oq', 1.0)),
        breath=part.get('breath', 0.04) * rng.uniform(0.7, 1.3),
        air=part.get('air', 0.0) * 0.5 * rng.uniform(0.7, 1.3),
        fscale=(1.16 if female else 1.0) * rng.uniform(0.96, 1.04) * part.get('fscale', 1.0),
    )


def calibrate(vp, sos, f0):
    n = S(0.5)
    ph = np.arange(n) * f0 / SR
    y = F(glottal(ph - np.floor(ph), vp['oq']), sos)[S(0.15):]
    return 1.0 / (np.sqrt(np.mean(y * y)) + 1e-9)


def render_phrase(notes, vp, rng, sos_list, mixw=None):
    """notes: contiguous legato [(t0, t1, midi, vel)] -> (start_sample, mono signal)."""
    t0 = notes[0][0]
    dur = notes[-1][1] - t0
    rel, att = vp['release'], vp['attack']
    T = dur + rel + 0.05
    nc = int(np.ceil(T * CR)) + 2
    tc = np.arange(nc) / CR
    tgt = np.full(nc, float(notes[-1][2]))
    vel = np.full(nc, float(notes[-1][3]))
    since = np.zeros(nc)
    bounds = []
    for j, (a, b, m, v) in enumerate(notes):
        i0 = max(0, int(round((a - t0) * CR)))
        i1 = nc if j == len(notes) - 1 else max(i0 + 1, int(round((b - t0) * CR)))
        tgt[i0:i1] = m
        vel[i0:i1] = v
        since[i0:i1] = tc[i0:i1] - tc[i0]
        if j:
            bounds.append(a - t0)
    ap = np.exp(-1.0 / (vp['glide'] * CR))
    pitch = signal.lfilter([1 - ap], [1, -ap], tgt, zi=[ap * tgt[0]])[0]
    pitch = pitch - vp['scoop'] / 100.0 * np.exp(-tc / 0.08)
    vd = vp['vib_depth'] * np.clip((since - vp['vib_delay']) / 0.7, 0, 1)
    vr = vp['vib_rate'] * (1 + 0.05 * curve(rng, nc, 0.4))
    vph = 2 * np.pi * np.cumsum(vr) / CR + rng.uniform(0, 2 * np.pi)
    cents = (vd * np.sin(vph) + vp['detune'] + vp['drift'] * curve(rng, nc, 0.35)
             + vp['jitter'] * curve(rng, nc, 11.0))
    f0 = 440.0 * 2 ** ((pitch + cents / 100.0 - 69) / 12)

    av = np.exp(-1.0 / (0.08 * CR))
    amp = signal.lfilter([1 - av], [1, -av], vel, zi=[av * vel[0]])[0]
    u = np.clip(tc / att, 0, 1)
    env = u * u * (3 - 2 * u)
    r = np.clip((tc - dur) / rel, 0, 1)
    env *= np.cos(r * np.pi / 2) ** 2
    for tb in bounds:
        env *= 1 - vp['dip'] * np.exp(-((tc - tb) / 0.045) ** 2)
    if vp['swell']:
        for (a, b, m, v) in notes:
            d = b - a
            if d > 1.5:
                inside = (tc >= a - t0) & (tc < b - t0)
                uu = (tc[inside] - (a - t0)) / d
                env[inside] *= 1 + vp['swell'] * (np.sin(np.pi * uu) - 0.5)
    env *= np.maximum(0, 1 + vp['shimmer'] * curve(rng, nc, 7.0))

    n = int(np.ceil(T * SR))
    xi = np.arange(n) * (CR / SR)
    idx = np.arange(nc)
    f0a = np.interp(xi, idx, f0)
    ea = np.interp(xi, idx, amp * env)
    ph = np.cumsum(f0a) / SR + rng.random()
    frac = ph - np.floor(ph)
    src = glottal(frac, vp['oq'])
    if vp['breath'] > 0:
        nz = F(rng.standard_normal(n), BREATH_SOS)
        src += vp['breath'] * 6.0 * nz * (0.35 + 0.65 * (frac < vp['oq']))
    src *= ea
    y = F(src, sos_list[0])
    if mixw is not None and len(sos_list) > 1:
        w = np.clip(mixw(t0 + np.arange(n) / SR), 0, 1)
        y = y * (1 - w) + F(src, sos_list[1]) * w
    if vp['air'] > 0:
        # breathy "air" above the formants, relative to the calibrated voiced level
        y += (vp['air'] / vp['cal']) * F(rng.standard_normal(n), AIR_SOS) * ea
    return S(t0), y


def phrases(notes, tol=1e-6):
    out, cur = [], []
    for n in notes:
        if cur and abs(cur[-1][1] - n[0]) > tol:
            out.append(cur)
            cur = []
        cur.append(n)
    if cur:
        out.append(cur)
    return out


def humanize(notes, rng, part):
    sd = part.get('timing', 0.05)
    out = []
    for ph in phrases(notes):
        st = ph[0][0] + abs(rng.normal(0, sd))
        for j, (a, b, m, v) in enumerate(ph):
            jit = rng.normal(0, sd)
            nb = b + (float(np.clip(jit, -2 * sd, 2 * sd)) if j < len(ph) - 1 else jit)
            nb = max(nb, st + 0.06)
            out.append([st, nb, m, v * rng.uniform(0.92, 1.08)])
            st = nb
    return out


def add_breaths(notes, rng, every, gap=(0.3, 0.6)):
    """Insert per-voice breaths: cut a note short before a chord change, or split a long note."""
    notes = [list(n) for n in notes]
    if not every or not notes:
        return notes
    t = notes[0][0] + every * rng.uniform(0.3, 1.0)
    end = notes[-1][1]
    while t < end - 1.0:
        g = rng.uniform(*gap)
        best = None
        for j in range(len(notes) - 1):
            if abs(notes[j][1] - notes[j + 1][0]) < 1e-6 and abs(notes[j][1] - t) < 1.5:
                if best is None or abs(notes[j][1] - t) < abs(notes[best][1] - t):
                    best = j
        if best is not None:
            nj = notes[best]
            if nj[1] - g > nj[0] + 0.25:
                nj[1] -= g
            t = nj[1] + g + every * rng.uniform(0.75, 1.2)
        else:
            for j, nj in enumerate(notes):
                if nj[0] + 0.8 < t < nj[1] - 0.8:
                    notes.insert(j + 1, [t + g / 2, nj[1], nj[2], nj[3]])
                    nj[1] = t - g / 2
                    break
            t += every * rng.uniform(0.75, 1.2)
    return notes


def seam_join(notes, T, rng):
    """Make the phrase that ends at the loop end continue into the phrase that starts at 0.

    A single phrase spanning the whole loop is rotated to start at a random point, so each
    voice of an ensemble breathes somewhere different instead of all at the loop seam.
    """
    notes = [list(n) for n in notes]
    if not notes or abs(notes[-1][1] - T) > 1e-6 or abs(notes[0][0]) > 1e-6:
        return notes
    ph = phrases(notes)
    if len(ph) > 1:
        first = ph[0]
        return notes[len(first):] + [[a + T, b + T, m, v] for a, b, m, v in first]
    r = rng.uniform(0.1, 0.9) * T
    before, after = [], []
    for a, b, m, v in notes:
        if b <= r:
            before.append([a, b, m, v])
        elif a >= r:
            after.append([a, b, m, v])
        else:
            before.append([a, r, m, v])
            after.append([r, b, m, v])
    return after + [[a + T, b + T, m, v] for a, b, m, v in before]


def sing(bus, notes, part, rng, gain=1.0):
    """Render an ensemble part into the periodic stereo bus."""
    if not notes:
        return
    T = bus.shape[-1] / SR
    nv = part.get('voices', 5)
    width = part.get('width', 0.6)
    vowels = part.get('vowel', 'u')
    vowels = vowels if isinstance(vowels, tuple) else (vowels,)
    f0med = 440.0 * 2 ** ((float(np.median([n[2] for n in notes])) - 69) / 12)
    center = part.get('pan', 0.0)
    for k in range(nv):
        vp = voice_params(rng, part)
        sos_list = [vowel_sos(v, vp['fscale'], part.get('tilt', 1.0)) for v in vowels]
        vp['cal'] = calibrate(vp, sos_list[0], f0med)
        g = gain * vp['cal'] / np.sqrt(nv)
        pan = center + (((k / (nv - 1)) * 2 - 1) * width if nv > 1 else 0.0) + rng.normal(0, 0.05)
        vn = humanize(seam_join(notes, T, rng), rng, part)
        vn = add_breaths(vn, rng, part.get('breath_every'), part.get('breath_gap', (0.3, 0.6)))
        for ph in phrases(vn):
            s, y = render_phrase(ph, vp, rng, sos_list, part.get('mix'))
            wrap_add(bus, y, s, g, pan)


# ------------------------------------------------------------ score helpers
def pad_part(chords, part, dur, cycles, t0=0.0, vel=None, active=None):
    """Chord table -> notes for one part; repeated pitches are tied into one long note."""
    notes, t = [], t0
    for c in range(cycles):
        for i, ch in enumerate(chords):
            d = dur[i] if isinstance(dur, (list, tuple)) else dur
            name = ch[part]
            if name is not None and (active is None or active(c, i)):
                m, v = nm(name), (vel(c, i) if vel else 0.8)
                if notes and notes[-1][2] == m and abs(notes[-1][1] - t) < 1e-9:
                    notes[-1][1] = t + d
                else:
                    notes.append([t, t + d, m, v])
            t += d
    return notes


def seq(items, beat, t0=0.0, vel=0.8):
    """[(note | None, beats), ...] -> legato notes (None = rest)."""
    notes, t = [], t0
    for name, b in items:
        if name is not None:
            notes.append([t, t + b * beat, nm(name), vel])
        t += b * beat
    return notes
