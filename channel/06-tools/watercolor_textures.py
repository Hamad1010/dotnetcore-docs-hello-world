"""Textures for the watercolor look (episode.json "look": "watercolor", an experiment from EP003): warm cold-press
paper and pigment washes that dry with darker edges and a little granulation. Drawn from noise with fixed seeds, so
every run writes the same files; all our own, nothing licensed.

    python3 channel/06-tools/watercolor_textures.py

Writes 03-episodes/_assets/look/: paper.jpg (the stage, 1920×1080), paper-tile.jpg (cards, 512 px, tiles seamlessly),
wash-<pigment>.png (four washes with transparency, laid over the paper by Backdrop), stroke-<pigment>.png (four wide
brush strokes, the wipe between scenes when an episode's motion is "rich") and deckle.png (the torn paper edge of the
pure watercolor look, "aquarelle": a 9-slice mask, 96 px slices, whose edges tile).

    python3 channel/06-tools/watercolor_textures.py deckle    # only deckle.png
"""
import os
import sys

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, '03-episodes', '_assets', 'look')
# pigments: ultramarine/cerulean (granulates), gamboge, sap green, vermilion; and how much each granulates
PIGMENTS = {'blue': ((58, 120, 194), 0.30), 'gold': ((233, 174, 59), 0.12), 'green': ((62, 154, 98), 0.18), 'rose': ((222, 91, 71), 0.15)}


def noise(shape, size, seed):
    """Smooth noise with features about `size` px across, mean 0 and spread 1; it wraps around (tiles seamlessly)."""
    rng = np.random.default_rng(seed)
    fy = np.fft.fftfreq(shape[0])[:, None]
    fx = np.fft.fftfreq(shape[1])[None, :]
    spectrum = np.fft.fft2(rng.standard_normal(shape)) * np.exp(-((np.hypot(fx, fy) * size) ** 2))
    n = np.real(np.fft.ifft2(spectrum))
    return (n - n.mean()) / (n.std() + 1e-9)


def blur(a, sigma):
    """Gaussian blur through the FFT (wraps around: the washes keep a margin, the paper tiles anyway)."""
    fy = np.fft.fftfreq(a.shape[0])[:, None]
    fx = np.fft.fftfreq(a.shape[1])[None, :]
    return np.real(np.fft.ifft2(np.fft.fft2(a) * np.exp(-2 * (np.pi * sigma) ** 2 * (fx ** 2 + fy ** 2))))


def paper(h, w, seed, base, grain, vignette):
    """Cold-press paper: a fine tooth lit from the top right, soft mottling, a slightly darker edge."""
    tooth = noise((h, w), 3.5, seed) * 0.6 + noise((h, w), 9, seed + 1) * 0.4
    # light from the top right: the slope of the tooth facing it is brighter
    lit = np.roll(tooth, (1, -1), axis=(0, 1)) - tooth
    mottle = noise((h, w), 140, seed + 2)
    shade = 1 + grain * (0.55 * lit + 0.35 * tooth) + 0.012 * mottle
    if vignette:
        y, x = np.mgrid[0:h, 0:w]
        r = np.hypot((x - w / 2) / (w / 2), (y - h / 2) / (h / 2))
        shade *= 1 - vignette * np.clip(r - 0.55, 0, None) ** 2
    rgb = np.clip(np.array(base)[None, None, :] * shade[..., None], 0, 255)
    return Image.fromarray(rgb.astype(np.uint8))


def wash(size, seed, rgb, granulation):
    """One wash as it dries: an irregular blot, pigment pooled at its edge, lighter and mottled inside, grainy."""
    y, x = np.mgrid[0:size, 0:size]
    r = np.hypot(x - size / 2, y - size / 2) / (size * 0.30)
    shape = 1 - r + 0.16 * noise((size, size), 150, seed) + 0.035 * noise((size, size), 26, seed + 1)
    inside = np.clip(shape / 0.02, 0, 1)  # a sharp but smooth edge, like paint that stopped where it dried
    near_edge = np.clip((1 - blur(inside, 16)) * 2.4, 0, 1) * inside
    density = inside * (0.42 + 0.58 * near_edge) * (1 + 0.22 * noise((size, size), 60, seed + 2))
    density *= 1 + granulation * noise((size, size), 1.6, seed + 3)
    alpha = np.clip(density * 0.82, 0, 1)
    out = np.zeros((size, size, 4), np.uint8)
    out[..., :3] = rgb
    out[..., 3] = (alpha * 255).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def stroke(w, h, seed, rgb):
    """One loaded brush pulled across the paper: a swelling start, ragged edges, a solid body, bristle streaks along
    it that open into dry brush at the end, pigment pooled at the edges, and the paper's grain."""
    rng = np.random.default_rng(seed)
    y, x = np.mgrid[0:h, 0:w]
    u = x / w  # along the stroke
    v = (y - h / 2) / (h / 2)  # across it, -1..1
    along = lambda size, s: noise((1, w), size, seed + s)[0]
    # the half-width: swells in over the first 7%, holds, and thins over the last 25%; the edges wander
    width = np.clip(u / 0.07, 0, 1) ** 0.6 * np.clip((1 - u) / 0.25, 0, 1) ** 0.8 * 0.86
    top = width * (1 + 0.06 * along(70, 1) + 0.012 * along(14, 2))
    bottom = width * (1 + 0.06 * along(70, 3) + 0.012 * along(14, 4))
    edge = np.where(v < 0, top[None, :] + v, bottom[None, :] - v)
    inside = np.clip(edge / 0.05, 0, 1)
    # bristles: fine streaks along the stroke, opening into gaps where the brush runs dry
    bristle = noise((h, 1), 2.2, seed + 5)[:, 0][:, None]
    dry = np.clip((u - 0.62) / 0.38, 0, 1) ** 1.5 + 0.35 * np.clip(np.abs(v) - 0.55, 0, 1)
    gaps = np.clip(1 - dry * 1.6 * np.clip(0.6 - bristle, 0, None), 0, 1)
    streak = 0.03 + 0.12 * np.clip((u - 0.45) / 0.55, 0, 1)  # the body is solid; the streaks show where it thins
    density = inside * gaps * (0.95 + streak * bristle.clip(-1, 1)) * (1 + 0.15 * np.clip(1 - edge / 0.12, 0, 1) * inside)
    density *= 1 + 0.10 * noise((h, w), 1.6, seed + 6)
    out = np.zeros((h, w, 4), np.uint8)
    out[..., :3] = rgb
    out[..., 3] = (np.clip(density, 0, 1) * 255).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def edge(seed, length=512, offset=96, period=320):
    """How far a torn edge bites into the sheet along one side, in px: periodic over the 9-slice's middle (`period`),
    so the edge tiles when the mask repeats it, and continuous into the corners."""
    rng = np.random.default_rng(seed)
    x = np.arange(length) - offset
    p = np.zeros(length)
    for h in range(1, 60):
        p += np.sin(2 * np.pi * h * x / period + rng.uniform(0, 2 * np.pi)) / h ** 1.15
    p = (p - p.mean()) / p.std()
    return np.clip(22 + 6.5 * p, 7, 40)


def deckle(size=512, seed=300):
    """A hand-torn sheet as a mask (white, the alpha does the work): each side bites in by its own periodic profile,
    with a fibrous fringe a few px wide, and the corners worn round."""
    yy, xx = np.mgrid[0:size, 0:size].astype(float)
    fib = noise((size, size), 2, seed) * 0.32 + noise((size, size), 7, seed + 1) * 0.18
    feather = 5.0
    # worn corners: each side bites deeper over its last 40 px along a quarter circle, so two sides meet in a round
    t = np.arange(size, dtype=float)
    r = 40.0
    arc = r - np.sqrt(np.clip(r ** 2 - np.clip(r - np.minimum(t, size - 1 - t), 0, None) ** 2, 0, None))
    top, bottom, left, right = (edge(seed + 10 * k) + arc for k in range(4))
    a = np.minimum.reduce([
        (yy - top[None, :]) / feather,
        (size - 1 - yy - bottom[None, :]) / feather,
        (xx - left[:, None]) / feather,
        (size - 1 - xx - right[:, None]) / feather,
    ])
    alpha = np.clip(a + fib, 0, 1)
    rgba = np.dstack([np.full((size, size, 3), 255.0), alpha[..., None] * 255]).astype(np.uint8)
    return Image.fromarray(rgba, 'RGBA')


def main():
    os.makedirs(OUT, exist_ok=True)
    if sys.argv[1:] == ['deckle']:
        deckle().save(os.path.join(OUT, 'deckle.png'), optimize=True)
        print('deckle.png', os.path.getsize(os.path.join(OUT, 'deckle.png')) // 1024, 'KB')
        return
    paper(1080, 1920, 11, (247, 241, 230), 0.045, 0.16).save(os.path.join(OUT, 'paper.jpg'), quality=90)
    paper(512, 512, 21, (255, 252, 245), 0.03, 0).save(os.path.join(OUT, 'paper-tile.jpg'), quality=90)
    for k, (name, (rgb, gran)) in enumerate(PIGMENTS.items()):
        wash(1024, 100 + k * 10, rgb, gran).save(os.path.join(OUT, f'wash-{name}.png'), optimize=True)
        stroke(1600, 420, 200 + k * 10, rgb).save(os.path.join(OUT, f'stroke-{name}.png'), optimize=True)
    deckle().save(os.path.join(OUT, 'deckle.png'), optimize=True)
    for f in sorted(os.listdir(OUT)):
        print(f'{f:16s} {os.path.getsize(os.path.join(OUT, f)) / 1024:7.0f} KB')


if __name__ == '__main__':
    main()
