# Detective soundbeds (no musical instruments)

Code that generates 20 background tracks for talking over in detective, analysis and focus videos.
No musical instruments, samples, bells or AI services are used:

- **Tracks 1–10** are wordless hummed and "ooh" choirs. The voices are formant-synthesized (glottal pulse,
  vocal-tract resonances, vibrato, breathing, ensemble timing).
- **Tracks 11–20** are pure sound design: rain, clocks, a typewriter, fire, a train, a film projector, a
  cave, a parked car in the rain and a server room. Every sound is built procedurally.

Every file is 10:00 long, loops seamlessly (end joins start with no gap or click), and is normalized
to −18 LUFS integrated with peaks at or below −2 dBFS.

| # | Title | Type |
|---|-------|------|
| 1 | Case File Noir | hummed choir, D minor |
| 2 | Deduction | hummed pulse + "ooh" choir, 96 BPM |
| 3 | Midnight Investigation | "ooh" choir, rain, thunder |
| 4 | Deep Focus Hum | humming choir, A minor |
| 5 | Clue by Clue | hummed drone, motif, clock |
| 6 | Cold Case | high voices, wind |
| 7 | The Suspect | low hum, heartbeat, swells |
| 8 | Mind Palace | "ooh/aah" choir, D Lydian |
| 9 | Thinking Loop | hummed arpeggio, F minor |
| 10 | Rainy Night Hum | humming choir, rain, clock |
| 11 | Rainy Detective Office | rain, clock, drips, thunder |
| 12 | Typewriter Night | typewriter, pages, rain |
| 13 | Interrogation Room | vent, tube light, clock, corridor |
| 14 | Fireside Study | fire, grandfather clock, pages |
| 15 | Night Train | rail rhythm, rumble |
| 16 | Film Projector Archive | 24 fps projector |
| 17 | Deep Focus Brown Noise | brown noise |
| 18 | Cave of Clues | drips, cave echo |
| 19 | City Stakeout | rain on car roof, traffic |
| 20 | Server Room Analysis | fans, keyboard, mouse |

## Regenerate

Requires Python 3.10+, `numpy`, `scipy`, `matplotlib` (only for `--preview` spectrograms) and `ffmpeg`
with `libmp3lame`.

```bash
pip install numpy scipy matplotlib
python render.py --out out                    # all 20 tracks, 10 minutes each
python render.py --ids 5 7 --seconds 900      # selected tracks, 15 minutes
python render.py --ids 1 --seconds 120 --preview --out previews   # short test + spectrogram
```

Vocal tracks are built from fixed-length musical cycles, so their `--seconds` must be a multiple of the
cycle (any multiple of 120 s works for all tracks). Seeds are fixed per track, so output is reproducible.

## Files

- `engine.py`: periodic (seamless-loop) buffers, filters, circular convolution reverb, BS.1770 loudness,
  limiter, MP3 encoding.
- `voice.py`: formant voice synthesizer and choir ensemble (humming "mmm", "ooh", "oh", "aah").
- `sfx.py`: procedural sound effects.
- `tracks.py`: the 20 track recipes (harmony, arrangement, mix levels).
- `render.py`: command-line renderer.
