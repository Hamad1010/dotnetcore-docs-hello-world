---
name: audio-cleanup
description: Use this skill whenever the user wants to clean up, fix, master, denoise, de-hum, level, normalize, or enhance the audio on a video file or audio file. Trigger on direct requests like "clean up the audio," "fix this audio," "master the audio," "make this sound like a podcast," "podcast-grade audio," "enhance my voice," "remove the hum," "remove background noise," "denoise," "de-hiss," "the audio sounds bad," "voice sounds muddy/tinny/quiet/uneven," "even out the levels," "make it broadcast loud," "normalize loudness to -16 LUFS," "remove 60 Hz hum" (or 50 Hz), or any indirect ask where they share a recording and want it to sound professional. Works on MP4, MOV, MKV, WAV, MP3, M4A, AAC. Preserves the video stream untouched.
---

# Audio Cleanup

Turn raw talking-head recordings into clean, warm, podcast-grade sound. The skill diagnoses the source, removes mains hum and rumble, reduces broadband noise, shapes the voice with gentle EQ and compression, and normalizes loudness to a broadcast target.

## When to use this skill

Fire on any request to clean, fix, master, enhance, denoise, de-hum, level, or normalize a recording. The user does not need to say "skill" or name a preset. If they share a video or audio file and complain about the sound — hum, hiss, room noise, uneven volume, harsh sibilance, muddy or tinny voice — run this skill.

Skip when the user wants captions, transcription, silence trimming, music mastering, or multi-track mixing.

## Workflow

The processing is a single command. Drive it through `scripts/clean_audio.py`. The script handles analysis, filter-chain construction, ffmpeg invocation, and verification.

1. **Confirm the input file.** If the user did not name a path, ask. If the file has multiple audio tracks, tell the user you are using track 0 by default and offer to switch.
2. **Choose a preset.** Default to `podcast`. Pick `broadcast` for delivery to TV/film outlets, `streaming` for Spotify/Apple Music, `light` for already-clean recordings, `aggressive` for poor sources.
3. **Run the script.** It prints the measured diagnosis before processing so you can relay it to the user in plain language ("Source measures -27 LUFS, noise floor ~ -52 dB, strong 60 Hz hum detected — I'll notch the hum, reduce noise, and lift loudness to -16 LUFS").
4. **Verify.** The script re-measures the output and prints a summary. Confirm integrated loudness is within 1 LUFS of target and true peak is below the preset ceiling.
5. **Report.** Show the user the output path, what was applied, and the before/after numbers.

### Command shapes

```bash
# Default podcast preset, output written next to input as <name>_cleaned.<ext>
python3 scripts/clean_audio.py path/to/input.mp4

# Pick a preset
python3 scripts/clean_audio.py path/to/input.mp4 --preset broadcast
python3 scripts/clean_audio.py path/to/input.mp4 --preset streaming
python3 scripts/clean_audio.py path/to/input.mp4 --preset light
python3 scripts/clean_audio.py path/to/input.mp4 --preset aggressive

# Custom output path
python3 scripts/clean_audio.py path/to/input.mp4 --output path/to/out.mp4

# Force a hum frequency when the user knows the mains is 50 Hz
python3 scripts/clean_audio.py path/to/input.mp4 --hum 50

# Process a non-default audio track
python3 scripts/clean_audio.py path/to/input.mkv --audio-track 1
```

The script resolves `~/.claude/skills/audio-cleanup/scripts/clean_audio.py` when installed as a skill, or use the relative path inside this repo.

## Presets

| Preset | Target LUFS | True peak | Use case |
|---|---|---|---|
| `podcast` (default) | -16 | -1.5 dBTP | YouTube, podcasts, course videos |
| `broadcast` | -23 | -2.0 dBTP | EBU R128 delivery |
| `streaming` | -14 | -1.0 dBTP | Spotify, Apple Music, Tidal |
| `light` | -16 | -1.5 dBTP | Already-decent audio; hum notch + loudness only |
| `aggressive` | -16 | -1.5 dBTP | Poor source recordings; deep denoise + hum notching |

## Processing chain (podcast preset)

Filters run in this order. Order matters: clean before shaping, shape before normalizing.

1. **DC offset removal** when astats detects offset > 0.001.
2. **Hum notch filters** at 50 Hz or 60 Hz plus first three harmonics, depth scales with measured hum energy.
3. **Highpass at 80 Hz** to kill room rumble.
4. **`afftdn` broadband denoise**, noise-floor set from measured stats.
5. **De-esser** at moderate intensity to soften sibilance.
6. **Presence EQ** + 3 dB at 3 kHz for clarity.
7. **Warmth EQ** + 2 dB at 200 Hz for body.
8. **Lowpass at 14 kHz** to cut hiss above voice range.
9. **Compressor** at -21 dB / 3:1 to even out levels.
10. **`volume=0.6`** to create headroom before normalization.
11. **Two-pass `loudnorm`** seeded with measured values for accurate targeting.

`light` skips steps 3, 5–9 and the static-gain step. `aggressive` deepens hum notches and doubles `afftdn` reduction.

## Output handling

- **Video**: stream-copied with `-c:v copy`. Bit-for-bit identical to source.
- **Audio**: AAC at 192 kbps in video containers. For audio-only inputs, the script matches the source format (WAV stays WAV, MP3 re-encodes at 192k, M4A → AAC 192k).
- **Filename**: `<input_basename>_cleaned.<ext>`, overrideable with `--output`.
- **Safety**: never overwrites the source file.
- **Channels**: source layout is preserved (mono stays mono, stereo stays stereo).

## When to read references

- `references/filter-reference.md`: when tuning specific filter parameters or explaining what a filter does.
- `references/troubleshooting.md`: when the user asks for adjustments after listening ("too thin," "too boomy," "still hum," "sounds underwater," etc.).

## Edge cases

- **No video stream**: script auto-detects and skips `-c:v copy`.
- **Already clean**: use `light` and pass through with loudness correction only.
- **Clipped source**: script reports clipping; warn the user that distortion can't be undone.
- **Very quiet source**: script applies more makeup gain; flag rising noise floor.
- **Music or multi-speaker**: warn defaults are tuned for solo voice.

## Dependencies

- `ffmpeg` 4.0+ on PATH, with `loudnorm`, `afftdn`, `acompressor`, `deesser`, `equalizer`, `highpass`, `lowpass`, `astats`, `volumedetect` (all in the standard build).
- Python 3.8+.
- No Python packages required.
