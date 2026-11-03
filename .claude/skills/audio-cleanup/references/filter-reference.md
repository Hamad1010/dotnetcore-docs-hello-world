# Filter reference

Full ffmpeg filter parameters used by the `audio-cleanup` skill, and the reasoning behind each value. Read this when tuning the chain by hand or explaining a result.

Filters run in this fixed order:

1. DC offset removal
2. Hum notches
3. Highpass (rumble)
4. `afftdn` broadband denoise
5. De-esser
6. Presence EQ
7. Warmth EQ
8. Lowpass (hiss)
9. Compressor
10. Static gain (headroom)
11. Loudness normalization

Order is intentional: clean the signal before shaping it, shape it before normalizing levels. Putting EQ before denoise causes the EQ to lift the noise floor. Putting compression before denoise pumps the noise.

---

## 1. DC offset removal

```
highpass=f=5
```

A 5 Hz highpass is below all audible content and removes any constant offset reported by `astats`. Triggered only when measured `dc_offset` > 0.001. Most modern interfaces have no offset; older USB mics sometimes do.

## 2. Hum notches

```
equalizer=f=<freq>:t=q:w=25:g=<depth>
```

Applied at the detected mains fundamental (50 Hz or 60 Hz) and the first three harmonics. For 60 Hz mains that means 60, 120, 180, 240 Hz. For 50 Hz mains: 50, 100, 150, 200 Hz.

- `t=q` selects the Q-based bandwidth mode.
- `w=25` gives a Q of 25 — narrow enough that the voice fundamental is untouched, wide enough to cover the actual hum line even if it drifts a few Hz.
- `g=` is the cut depth in dB. Defaults by preset:
  - `light`: -22 dB
  - `podcast`, `broadcast`, `streaming`: -28 dB
  - `aggressive`: -36 dB
- When measured hum is more than 20 dB above the voice band, depth drops a further 4 dB.

Why notch four lines: hum from mains transformers and ground loops is rich in harmonics. Killing only the fundamental leaves the buzz audible. Killing more than four harmonics starts to dull the voice without removing more buzz.

## 3. Highpass at 80 Hz

```
highpass=f=80
```

Removes room rumble, footfall, mic stand vibration, HVAC sub-bass. 80 Hz is below the fundamental of nearly every adult speaking voice (male voices typically sit at 85–180 Hz). Lower to 60 Hz if the voice sounds thin after processing. Raise to 100 Hz if it sounds muddy.

Skipped in `light` preset.

## 4. Broadband denoise

```
afftdn=nf=<floor>:nt=w:om=o
```

FFT-based spectral subtraction. Set noise floor from measured stats, clamped to [-50, -20] dB.

- `nf` is the noise floor estimate in dBFS.
- `nt=w` uses a "white" noise tracking profile (broadband, suitable for room noise and hiss).
- `om=o` outputs the cleaned audio (not the noise estimate).

Default `nf=-25` was the PRD reference; the script overrides with measured-floor + 5 dB so the denoise tracks the actual source. `aggressive` preset drops `nf` another 8 dB which deepens reduction.

Trade-off: deeper reduction → more artifact. Watery / robotic artifacts mean `nf` is too low.

Skipped in `light` preset.

## 5. De-esser

```
deesser=i=0.4:m=0.5:f=0.5:s=o
```

- `i=0.4` intensity. Light by default; harsh-sibilance sources can go to 0.6–0.8.
- `m=0.5` max relative threshold.
- `f=0.5` frequency centering (mid-treble band).
- `s=o` output mode.

Skipped in `light` preset.

## 6. Presence EQ

```
equalizer=f=3000:t=q:w=1.5:g=3
```

A +3 dB bell at 3 kHz lifts consonant clarity ("hard" consonants and the leading edge of words). 3 kHz is the classic "presence" region. Q of 1.5 is a moderate width — narrow enough to avoid coloring the rest of the band.

Skipped in `light` preset.

## 7. Warmth EQ

```
equalizer=f=200:t=q:w=1.0:g=2
```

A +2 dB bell at 200 Hz fills out the chest body of an adult voice. Q of 1.0 is wider than the presence band so the lift feels broad rather than nasal.

Skipped in `light` preset.

## 8. Lowpass at 14 kHz

```
lowpass=f=14000
```

Voice sibilance peaks below 12 kHz. Energy above 14 kHz is almost always microphone hiss, fan noise, or tape-style noise floor for digital sources. Cutting it cleans the top without dulling consonants.

Skipped in `light` preset.

## 9. Compressor

```
acompressor=threshold=-21dB:ratio=3:attack=5:release=50
```

- `threshold=-21dB` catches typical voice peaks.
- `ratio=3` evens out swings without squashing.
- `attack=5` ms preserves transients (consonants stay crisp).
- `release=50` ms tracks fast level changes.

Squashed-sounding result? Lower ratio to 2 and threshold to -18. Volume still jumps? Raise ratio to 4 and threshold to -24.

Skipped in `light` preset.

## 10. Static gain

```
volume=0.6
```

A flat -4.4 dB gain reduction creates headroom before the final loudness pass. The EQ boosts plus the compressor's makeup gain push peaks up; without this step the second loudnorm pass clips. Removed in `light` preset (replaced with `volume=0.85` since less upstream gain accumulates).

## 11. Loudness normalization (two-pass)

```
loudnorm=I=<target_I>:TP=<target_TP>:LRA=<target_LRA>:\
  measured_I=<meas_I>:measured_TP=<meas_TP>:measured_LRA=<meas_LRA>:\
  measured_thresh=<meas_thresh>:offset=<offset>:\
  linear=true:print_format=summary
```

Targets per preset:

| Preset      | I    | TP   | LRA |
|-------------|------|------|-----|
| podcast     | -16  | -1.5 | 11  |
| broadcast   | -23  | -2.0 | 11  |
| streaming   | -14  | -1.0 | 11  |
| light       | -16  | -1.5 | 11  |
| aggressive  | -16  | -1.5 | 11  |

The `measured_*` and `offset` fields come from the analysis-pass loudnorm. Feeding them back into the second pass turns it into a true two-pass linear normalization which preserves transient dynamics — that is what `linear=true` requires. Without `linear=true` you get a dynamic re-leveler that can pump.

When the analysis pass returns garbage (silent file, corrupt input), the script falls back to a single-pass `loudnorm` with target values only.

---

## Diagnosis inputs

The script measures four things before building the chain:

- **loudnorm pass 1** — `input_i`, `input_tp`, `input_lra`, `input_thresh`, `target_offset` (the JSON it prints).
- **volumedetect** — `mean_volume`, `max_volume`. Max ≥ -0.1 dB flags clipping risk.
- **astats** — `dc_offset`, RMS-based noise floor estimate.
- **Hum probe** — narrow `bandpass=f=50:w=4` and `bandpass=f=60:w=4` mean volumes, compared to a 300 Hz highpassed voice-band mean. ≥ 8 dB excess at 50 or 60 Hz triggers notch filters.

The whole filter chain is then assembled by `build_filter_chain()` in `scripts/clean_audio.py`. To inspect the chain without processing:

```bash
python3 scripts/clean_audio.py path/to/input.mp4 --dry-run
```
