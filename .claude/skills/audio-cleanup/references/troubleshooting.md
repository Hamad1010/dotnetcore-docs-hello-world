# Troubleshooting

If the default `podcast` chain doesn't sound right on a particular source, walk down this list. Each row tells you what to change and where, plus the parameter the user can hand-edit.

For most cases the right answer is to switch presets (`light`, `aggressive`) before reaching for individual filter tweaks. If the source is wildly off-target (huge clipping, music underneath, multiple speakers at different volumes), the chain alone won't fix it.

---

## Symptoms and fixes

### Voice sounds thin or tinny

The lows are gone or the highs dominate.

- Raise warmth: `equalizer=f=200:t=q:w=1.0:g=3` (+1 dB).
- Drop highpass to 60 Hz: `highpass=f=60` instead of 80.
- Soften presence: `equalizer=f=3000:t=q:w=1.5:g=2`.

### Voice sounds boomy or muddy

Too much low-mid energy.

- Lower warmth: `equalizer=f=200:t=q:w=1.0:g=1`.
- Raise highpass to 100 Hz: `highpass=f=100`.
- If still muddy, add a small cut around 300 Hz: `equalizer=f=300:t=q:w=1.0:g=-2`.

### Voice not clear enough

Diction sounds soft, words run together.

- Raise presence: `equalizer=f=3000:t=q:w=1.5:g=4`.
- Add an "air" lift: `equalizer=f=8000:t=q:w=1.5:g=2` (insert after the warmth EQ).

### Voice sounds squashed or pumping

Compressor is working too hard.

- Lower ratio and threshold: `acompressor=threshold=-18dB:ratio=2:attack=8:release=80`.
- Slow the release: change `release=50` to `release=80`.

### Volume still jumps around

Compressor isn't doing enough.

- Tighten threshold and raise ratio: `acompressor=threshold=-24dB:ratio=4:attack=5:release=50`.
- Confirm the input isn't wildly inconsistent (consider re-recording).

### Background noise reduction sounds watery or robotic

`afftdn` is too aggressive.

- Raise the noise floor parameter: change `nf=-30` to `nf=-25` (less negative = less reduction).
- Switch from `aggressive` to `podcast` preset.
- For tonal noise (fan whine), narrow notches will outperform broadband denoise — use the hum-notch syntax at the offending frequency.

### Sibilance still harsh

De-esser too gentle.

- Raise intensity: `deesser=i=0.6:m=0.5:f=0.5:s=o`.
- For extreme cases: `deesser=i=0.8:m=0.6:f=0.5:s=o`.

### Hum is still audible after processing

Several possibilities:

- Wrong mains frequency detected. Force it: `--hum 50` (Europe, most of Asia, Africa) or `--hum 60` (North America, much of South America). The default heuristic compares 50 Hz and 60 Hz narrow-band energy; sources with strong sub-bass content can fool it.
- Hum landed between the notch and a harmonic. Add another notch line at the offending frequency: `equalizer=f=120:t=q:w=25:g=-32`.
- Hum is not at the mains frequency at all — could be ground-loop interference or device-specific. Use a spectrum analyzer (or `ffmpeg -i in.wav -lavfi showspectrumpic=...:out.png`) to find the exact line.

### Output is clipping or sounds distorted

The chain pushed peaks too high.

- Make the static gain step more aggressive: `volume=0.5` instead of `volume=0.6`.
- Drop the loudness target: switch from `streaming` (-14 LUFS) to `podcast` (-16) or `broadcast` (-23).
- Check the source for clipping. If the input already clips, no chain can undo that distortion.

### Loudness target missed by more than 1 LU

The two-pass loudnorm fell back to single-pass, usually because the input is silent in stretches or extremely dynamic.

- Run the script again — it will re-measure the first output and tighten on the second pass.
- For very quiet inputs, pre-amplify: `volume=6dB` at the head of the chain.

### Voice sounds underwater

Usually an interaction of `afftdn` + `lowpass` cutting too much top end.

- Raise the lowpass: `lowpass=f=16000`.
- Soften `afftdn`: change `nf` toward -22.

### Output is mono when source was stereo (or vice versa)

The script preserves channel layout via the audio decode path; if the result is wrong, the source itself is wrong. Check with `ffprobe -show_streams INPUT` — the audio stream's `channels` and `channel_layout` should match what you expect.

### Multiple audio tracks — wrong one was processed

Default is track 0. Use `--audio-track 1` (or 2, etc.) to pick a different track. The output keeps only the processed track and the video stream.

### Want to preview without writing a file

```bash
python3 scripts/clean_audio.py INPUT --dry-run
```

Prints the diagnosis and the full filter chain, then exits.
