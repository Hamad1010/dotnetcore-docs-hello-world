#!/usr/bin/env python3
"""The «foley» sound set (the owner, 4 Nov 2026: "change the effect sounds to something new"): paper, cards, books,
wood and coins on a desk, to match the watercolor-anime look, from Kenney's packs (CC0, public domain: free for
commercial use, no credit needed). Each sound keeps its old name and job, so the studio needs no other change, and each
is matched to the old sound's short-term loudness so the levels in src/components/Sfx.tsx still hold.

    git clone --depth 1 https://github.com/kapishdima/soundcn /tmp/soundcn    # Kenney's packs, mirrored with their licences
    python3 channel/06-tools/sfx_foley.py /tmp/soundcn/assets

Writes channel/03-episodes/_assets/sfx-foley/<name>.mp3 and prints the lengths for Sfx.tsx. The old synthesized set stays
in _assets/sfx/ (EP001–EP003 keep it: "sfx": "synth" in their episode.json).
"""
import os
import subprocess
import sys

import numpy as np

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '03-episodes', '_assets', 'sfx-foley')
OLD = os.path.join(HERE, '..', '03-episodes', '_assets', 'sfx')

# name → [(pack file, gain in dB), ...] (several = mixed), and the longest it may last in seconds
SET = {
    'pop': ([('kenney_casino-audio/card-place-1', 0)], None),            # a card laid on the table
    'bubble': ([('kenney_casino-audio/chip-lay-1', 0)], None),           # a clay chip set down
    'tick': ([('kenney_interface-sounds/tick_002', 0)], None),
    'type': ([('kenney_interface-sounds/switch_002', 0)], None),         # a key under a finger
    'type2': ([('kenney_interface-sounds/switch_005', 0)], None),
    'swish': ([('kenney_casino-audio/card-slide-3', 0)], None),          # a card slid across felt
    'whoosh': ([('kenney_casino-audio/card-fan-1', 0)], None),           # a deck fanned open: the brush wipe
    'strike': ([('kenney_casino-audio/card-slide-1', 0)], None),
    'stamp': ([('kenney_rpg-audio/bookPlace2', 0), ('kenney_impact-sounds/impactWood_heavy_000', -6)], None),
    'impact': ([('kenney_rpg-audio/bookPlace1', 0), ('kenney_impact-sounds/impactSoft_heavy_000', -3)], None),
    'riser': ([('kenney_casino-audio/card-shuffle', 0)], 1.4),          # a riffle: the build-up before a reveal
    'shimmer': ([('kenney_casino-audio/cards-pack-open-1', 0)], None),  # a pack torn open: «فيه مشهد في النهاية»
    'paper': ([('kenney_rpg-audio/bookFlip1', 0)], None),
    'roll': ([('kenney_casino-audio/dice-shake-1', 0)], None),          # a number counting up
    'ping': ([('kenney_rpg-audio/metalLatch', 0)], None),
    'coin': ([('kenney_rpg-audio/handleCoins', 0)], None),
    'thud': ([('kenney_rpg-audio/dropLeather', 0)], None),
    'question': ([('kenney_rpg-audio/bookOpen', 0)], None),
    'buzz': ([('kenney_impact-sounds/impactPlank_medium_000', 0)], None),  # a dull knock for "wrong"
    'click': ([('kenney_interface-sounds/click_003', 0)], None),
}


def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()


def short_term(x, win=0.1):
    """The loudest 100 ms of a sound (RMS, mono): how loud a short effect feels."""
    m = x.mean(axis=1)
    n = int(SR * win)
    if len(m) <= n:
        return float(np.sqrt(np.mean(m ** 2)) + 1e-9)
    c = np.cumsum(np.concatenate([[0.0], m.astype(np.float64) ** 2]))
    return float(np.sqrt((c[n:] - c[:-n]).max() / n) + 1e-9)


def main(src):
    os.makedirs(OUT, exist_ok=True)
    lengths = {}
    for name, (parts, longest) in SET.items():
        mix = None
        for rel, gain in parts:
            x = load(os.path.join(src, rel + '.ogg')) * (10 ** (gain / 20))
            mix = x if mix is None else np.pad(mix, ((0, max(0, len(x) - len(mix))), (0, 0))) + np.pad(x, ((0, max(0, len(mix) - len(x))), (0, 0)))
        # start on the transient (cues land on the word), stop where it has died away
        env = np.abs(mix).max(axis=1)
        on = np.nonzero(env > env.max() * 0.02)[0]
        mix = mix[max(0, on[0] - int(0.004 * SR)): on[-1] + int(0.03 * SR)]
        if longest:
            mix = mix[: int(longest * SR)]
        fade = np.ones(len(mix))
        k = min(len(mix) // 3, int(0.06 * SR))
        fade[-k:] = np.linspace(1, 0, k)
        fade[: int(0.002 * SR)] = np.linspace(0, 1, int(0.002 * SR))
        mix = mix * fade[:, None]
        # as loud as the sound it replaces: these are sharper than the synthesized ones (a card's snap is mostly peak),
        # so an oversampled limiter holds the peaks at -1 dBFS and takes at most 6 dB off them; past that a sound stays
        # a little quieter rather than lose its snap
        target = short_term(load(os.path.join(OLD, name + '.mp3')))
        gain = target / short_term(mix)
        peak = np.abs(mix).max() * gain
        if peak > 0.891 * 2:
            gain *= 0.891 * 2 / peak
        mix *= gain
        wav = os.path.join(OUT, name + '.wav')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-',
                        '-af', 'aresample=192000,alimiter=limit=0.891:attack=0.5:release=25:level=disabled,aresample=48000',
                        '-c:a', 'pcm_f32le', wav], input=mix.astype(np.float32).tobytes(), check=True)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-codec:a', 'libmp3lame', '-q:a', '2',
                        os.path.join(OUT, name + '.mp3')], check=True)
        os.remove(wav)
        done = load(os.path.join(OUT, name + '.mp3'))
        lengths[name] = round(len(mix) / SR, 2)
        print(f'{name:9s} {lengths[name]:5.2f} s  {20 * np.log10(np.abs(done).max()):6.1f} dBFS peak  '
              f'{20 * np.log10(short_term(done) / target):+5.1f} dB against the old sound')
    return lengths


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
