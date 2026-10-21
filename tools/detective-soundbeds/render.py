"""Render tracks:  python render.py --ids 1 2 3 --seconds 600 --out DIR [--preview]"""
import argparse
import json
import os
import sys
import time

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from engine import S, SR, pfilt, hp, master, encode_mp3, envelope, spectrogram_png, write_json  # noqa: E402
from tracks import TRACKS  # noqa: E402


def slug_of(tid, title):
    return f"{tid:02d}-" + ''.join(ch for ch in title.lower().replace(' ', '-') if ch.isalnum() or ch == '-')


def render(tid, seconds, outdir, preview=False, bitrate='160k'):
    tid, fn, title, group, moods, desc = next(t for t in TRACKS if t[0] == tid)
    rng = np.random.default_rng(1000 + tid)
    L = S(seconds)
    t0 = time.time()
    y = fn(L, rng)
    y = pfilt(y, hp(30, 2))
    y, st = master(y, -18.0, -2.0)
    d = np.abs(np.diff(y, axis=1))
    st['seam_ratio'] = round(float(np.abs(y[:, 0] - y[:, -1]).max() / (np.percentile(d, 99) + 1e-12)), 3)
    slug = slug_of(tid, title)
    path = os.path.join(outdir, slug + '.mp3')
    meta = {'title': f'{tid:02d} {title}', 'artist': 'Procedural - no instruments',
            'album': 'Detective Backgrounds (No Instruments)', 'track': f'{tid}/20', 'genre': 'Ambient',
            'comment': f'Seamless loop, {seconds / 60:.0f} min, -18 LUFS'}
    encode_mp3(y, path, meta, bitrate)
    st.update(id=tid, title=title, group=group, moods=moods, desc=desc, slug=slug, seconds=seconds,
              render_s=round(time.time() - t0, 1), file=os.path.basename(path), bytes=os.path.getsize(path),
              envelope=envelope(y))
    if preview:
        spectrogram_png(y, os.path.join(outdir, slug + '.png'), title, seconds=min(60, seconds))
    write_json(os.path.join(outdir, slug + '.json'), st)
    print(json.dumps({k: v for k, v in st.items() if k not in ('envelope', 'desc', 'moods')}), flush=True)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--ids', type=int, nargs='+', default=[t[0] for t in TRACKS])
    ap.add_argument('--seconds', type=float, default=600)
    ap.add_argument('--out', default='out')
    ap.add_argument('--preview', action='store_true')
    ap.add_argument('--bitrate', default='160k')
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    for i in a.ids:
        render(i, a.seconds, a.out, a.preview, a.bitrate)
