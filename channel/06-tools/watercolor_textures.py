"""Textures for the watercolor look (episode.json "look": "watercolor", an experiment from EP003): warm cold-press
paper and pigment washes that dry with darker edges and a little granulation. Drawn from noise with fixed seeds, so
every run writes the same files; all our own, nothing licensed.

    python3 channel/06-tools/watercolor_textures.py

Writes 03-episodes/_assets/look/: paper.jpg (the stage, 1920×1080), paper-tile.jpg (cards, 512 px, tiles seamlessly)
and wash-<pigment>.png (four washes with transparency, laid over the paper by Backdrop).
"""
import os

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


def main():
    os.makedirs(OUT, exist_ok=True)
    paper(1080, 1920, 11, (247, 241, 230), 0.045, 0.16).save(os.path.join(OUT, 'paper.jpg'), quality=90)
    paper(512, 512, 21, (255, 252, 245), 0.03, 0).save(os.path.join(OUT, 'paper-tile.jpg'), quality=90)
    for k, (name, (rgb, gran)) in enumerate(PIGMENTS.items()):
        wash(1024, 100 + k * 10, rgb, gran).save(os.path.join(OUT, f'wash-{name}.png'), optimize=True)
    for f in sorted(os.listdir(OUT)):
        print(f'{f:16s} {os.path.getsize(os.path.join(OUT, f)) / 1024:7.0f} KB')


if __name__ == '__main__':
    main()
