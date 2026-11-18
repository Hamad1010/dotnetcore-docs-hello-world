#!/usr/bin/env python3
"""Audio cleanup pipeline for the audio-cleanup Claude skill.

Analyzes a video or audio file, builds an ffmpeg filter chain from the
measured data, processes the file, and verifies the output.

Usage:
    clean_audio.py INPUT [--output OUTPUT] [--preset PRESET]
                   [--hum {auto,50,60,none}] [--audio-track N]
                   [--dry-run] [--verbose]
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shlex
import shutil
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path


PRESETS = {
    "podcast":    {"I": -16.0, "TP": -1.5, "LRA": 11.0, "style": "full"},
    "broadcast":  {"I": -23.0, "TP": -2.0, "LRA": 11.0, "style": "full"},
    "streaming":  {"I": -14.0, "TP": -1.0, "LRA": 11.0, "style": "full"},
    "light":      {"I": -16.0, "TP": -1.5, "LRA": 11.0, "style": "light"},
    "aggressive": {"I": -16.0, "TP": -1.5, "LRA": 11.0, "style": "aggressive"},
}


@dataclass
class Analysis:
    # Source measurements (for the user-facing diagnosis)
    source_i: float | None = None
    source_tp: float | None = None
    source_lra: float | None = None
    # Post-chain loudnorm measurements (fed into the second-pass loudnorm)
    input_i: float | None = None
    input_tp: float | None = None
    input_lra: float | None = None
    input_thresh: float | None = None
    target_offset: float | None = None
    mean_volume: float | None = None
    max_volume: float | None = None
    dc_offset: float = 0.0
    noise_floor: float | None = None
    hum_freq: int | None = None
    hum_strength: float = 0.0
    channels: int = 1
    sample_rate: int = 48000
    has_video: bool = False
    audio_tracks: int = 1
    duration: float | None = None
    clipping_risk: bool = False
    raw: dict = field(default_factory=dict)


def log(msg: str, verbose: bool = True) -> None:
    if verbose:
        print(msg, file=sys.stderr, flush=True)


def run(cmd: list[str], capture: bool = True) -> subprocess.CompletedProcess:
    return subprocess.run(
        cmd,
        stdout=subprocess.PIPE if capture else None,
        stderr=subprocess.PIPE if capture else None,
        text=True,
        check=False,
    )


def check_ffmpeg() -> None:
    if shutil.which("ffmpeg") is None or shutil.which("ffprobe") is None:
        sys.exit("error: ffmpeg and ffprobe must be installed and on PATH")


def ffprobe_streams(path: Path) -> dict:
    res = run([
        "ffprobe", "-v", "error", "-print_format", "json",
        "-show_streams", "-show_format", str(path),
    ])
    if res.returncode != 0:
        sys.exit(f"ffprobe failed: {res.stderr.strip()}")
    return json.loads(res.stdout)


def detect_streams(path: Path, audio_track: int, analysis: Analysis) -> None:
    info = ffprobe_streams(path)
    audio_streams = [s for s in info.get("streams", []) if s.get("codec_type") == "audio"]
    video_streams = [s for s in info.get("streams", []) if s.get("codec_type") == "video"]

    analysis.has_video = len(video_streams) > 0
    analysis.audio_tracks = len(audio_streams)

    if not audio_streams:
        sys.exit("error: no audio streams found in input")
    if audio_track >= len(audio_streams):
        sys.exit(f"error: requested audio track {audio_track} but only {len(audio_streams)} present")

    a = audio_streams[audio_track]
    analysis.channels = int(a.get("channels", 1))
    analysis.sample_rate = int(a.get("sample_rate", 48000))

    try:
        analysis.duration = float(info.get("format", {}).get("duration", 0)) or None
    except (TypeError, ValueError):
        analysis.duration = None


def run_loudnorm_pass(path: Path, target_i: float, target_tp: float,
                      target_lra: float, audio_track: int,
                      prefilter: str = "") -> dict:
    """Run a loudnorm measurement pass.

    `prefilter` is an optional ffmpeg filter chain inserted before loudnorm —
    used so the measured values apply to the post-chain signal, which is what
    the second loudnorm pass will actually receive.
    """
    af = (
        (prefilter + "," if prefilter else "")
        + f"loudnorm=I={target_i}:TP={target_tp}:LRA={target_lra}:print_format=json"
    )
    cmd = [
        "ffmpeg", "-hide_banner", "-nostats", "-i", str(path),
        "-map", f"0:a:{audio_track}",
        "-af", af,
        "-f", "null", "-",
    ]
    res = run(cmd)
    out = res.stderr
    matches = re.findall(r"\{[\s\S]*?\}", out)
    if not matches:
        return {}
    try:
        return json.loads(matches[-1])
    except json.JSONDecodeError:
        return {}


def run_volumedetect(path: Path, audio_track: int) -> tuple[float | None, float | None]:
    cmd = [
        "ffmpeg", "-hide_banner", "-nostats", "-i", str(path),
        "-map", f"0:a:{audio_track}",
        "-af", "volumedetect", "-f", "null", "-",
    ]
    res = run(cmd)
    mean = max_v = None
    for line in res.stderr.splitlines():
        m = re.search(r"mean_volume:\s*(-?\d+(?:\.\d+)?)\s*dB", line)
        if m:
            mean = float(m.group(1))
        m = re.search(r"max_volume:\s*(-?\d+(?:\.\d+)?)\s*dB", line)
        if m:
            max_v = float(m.group(1))
    return mean, max_v


def run_astats(path: Path, audio_track: int) -> dict:
    cmd = [
        "ffmpeg", "-hide_banner", "-nostats", "-i", str(path),
        "-map", f"0:a:{audio_track}",
        "-af", "astats=metadata=1:reset=0", "-f", "null", "-",
    ]
    res = run(cmd)
    stats: dict[str, float] = {}
    # astats prints stats per channel then an "Overall" section. Keep the last
    # value seen for each key (the overall figure). Only parse keys we can
    # interpret — raw "Min level"/"Max level" are not dB.
    keep = {
        "DC offset",
        "Peak level dB",
        "RMS level dB",
        "RMS peak dB",
        "RMS trough dB",
        "RMS through dB",
        "Noise floor dB",
        "Flat factor",
        "Dynamic range",
    }
    for line in res.stderr.splitlines():
        m = re.search(r"^\[Parsed_astats[^\]]*\]\s+([A-Za-z][A-Za-z0-9 _()]*?):\s+(-?\d+(?:\.\d+)?|-?inf|nan)\s*$", line)
        if not m:
            continue
        raw_key = m.group(1).strip()
        if raw_key not in keep:
            continue
        try:
            stats[raw_key.lower().replace(" ", "_")] = float(m.group(2))
        except ValueError:
            pass
    return stats


def _narrow_mean(path: Path, audio_track: int, freq: float,
                 width: float, sample_dur: float) -> float | None:
    # Cascade two bandpass filters to square the frequency response and
    # sharpen the rolloff — a single bandpass leaks too much voice-band
    # energy into the low-frequency probe.
    af = (
        f"bandpass=f={freq}:w={width},"
        f"bandpass=f={freq}:w={width},"
        f"volumedetect"
    )
    cmd = [
        "ffmpeg", "-hide_banner", "-nostats", "-nostdin",
        "-t", f"{sample_dur:.2f}",
        "-i", str(path),
        "-map", f"0:a:{audio_track}",
        "-af", af,
        "-f", "null", "-",
    ]
    res = run(cmd)
    for line in res.stderr.splitlines():
        m = re.search(r"mean_volume:\s*(-?\d+(?:\.\d+)?)\s*dB", line)
        if m:
            return float(m.group(1))
    return None


def detect_hum(path: Path, audio_track: int, duration: float | None
               ) -> tuple[int | None, float]:
    """Return (hum_freq, strength).

    Strategy: measure mean volume in a narrow bandpass at each candidate
    frequency (50 Hz, 60 Hz) and at control frequencies that sit between the
    mains lines (35 Hz, 75 Hz, 90 Hz — far from any harmonic).  Hum lines
    show up as narrow-band energy several dB above the off-mains control.

    Strength is reported as the excess (dB) of the strongest candidate above
    the median control level.
    """
    sample_dur = min(duration or 30.0, 30.0)
    width = 4.0  # cascaded bandpass — effective BW ~ 2 Hz, sharp rolloff

    candidates: dict[int, float] = {}
    for freq in (50, 60):
        v = _narrow_mean(path, audio_track, float(freq), width, sample_dur)
        if v is not None:
            candidates[freq] = v

    controls: list[float] = []
    for cf in (35.0, 75.0, 90.0):
        v = _narrow_mean(path, audio_track, cf, width, sample_dur)
        if v is not None:
            controls.append(v)

    if not candidates or not controls:
        return None, 0.0

    controls_sorted = sorted(controls)
    median_ctrl = controls_sorted[len(controls_sorted) // 2]
    best_freq = max(candidates, key=candidates.get)
    strength = candidates[best_freq] - median_ctrl

    # 4 dB above the off-mains control is the threshold for "probably hum".
    # Below that the filters cost more clarity than the hum costs in noise.
    if strength >= 4.0:
        return best_freq, strength
    return None, strength


def analyze(path: Path, audio_track: int, force_hum: str, verbose: bool
            ) -> Analysis:
    """Preliminary analysis: streams, volume, astats, hum detection.

    The loudness pass is run separately (after the chain is built) so
    measured values apply to the post-chain signal.
    """
    a = Analysis()
    detect_streams(path, audio_track, a)

    log(f"  -> {a.channels}ch @ {a.sample_rate} Hz, "
        f"{'video+audio' if a.has_video else 'audio-only'}, "
        f"{a.audio_tracks} audio track(s)", verbose)
    if a.audio_tracks > 1 and audio_track == 0:
        log(f"  -> file has {a.audio_tracks} audio tracks; using track 0", verbose)

    log("  -> measuring source loudness…", verbose)
    src_ln = run_loudnorm_pass(path, -16.0, -1.5, 11.0, audio_track)
    if src_ln:
        try:
            a.source_i = float(src_ln["input_i"])
            a.source_tp = float(src_ln["input_tp"])
            a.source_lra = float(src_ln["input_lra"])
        except (KeyError, ValueError):
            pass

    log("  -> measuring volume…", verbose)
    a.mean_volume, a.max_volume = run_volumedetect(path, audio_track)
    if a.max_volume is not None and a.max_volume >= -0.1:
        a.clipping_risk = True

    log("  -> measuring signal stats…", verbose)
    stats = run_astats(path, audio_track)
    a.raw["astats"] = stats
    nf_keys = ("noise_floor_db", "rms_trough_db", "rms_through_db", "rms_level_db")
    for k in nf_keys:
        if k in stats and -90.0 <= stats[k] <= 0.0:
            a.noise_floor = stats[k]
            break
    if a.noise_floor is None and a.mean_volume is not None:
        a.noise_floor = a.mean_volume - 20.0
    a.dc_offset = abs(stats.get("dc_offset", 0.0))

    log("  -> checking for mains hum…", verbose)
    if force_hum == "none":
        a.hum_freq = None
    elif force_hum in ("50", "60"):
        a.hum_freq = int(force_hum)
        a.hum_strength = 15.0
    else:
        a.hum_freq, a.hum_strength = detect_hum(path, audio_track, a.duration)

    return a


def measure_post_chain_loudness(path: Path, audio_track: int, prefilter: str,
                                preset: dict, a: Analysis,
                                verbose: bool) -> None:
    """Pass-1 loudnorm measurement on input after the prefilter chain.

    Stores measured values onto `a` for the second pass.
    """
    log("  -> measuring loudness through chain (pass 1)…", verbose)
    ln = run_loudnorm_pass(path, preset["I"], preset["TP"], preset["LRA"],
                           audio_track, prefilter=prefilter)
    a.raw["loudnorm"] = ln
    if not ln:
        return
    try:
        a.input_i = float(ln["input_i"])
        a.input_tp = float(ln["input_tp"])
        a.input_lra = float(ln["input_lra"])
        a.input_thresh = float(ln["input_thresh"])
        a.target_offset = float(ln["target_offset"])
    except (KeyError, ValueError):
        pass


def build_prefilter(a: Analysis, preset: dict) -> str:
    """Build everything in the chain except the final loudnorm."""
    style = preset["style"]
    parts: list[str] = []

    # 1. DC offset removal
    if a.dc_offset > 0.001:
        parts.append("highpass=f=5")

    # 2. Hum notches
    if a.hum_freq is not None:
        depth = -28.0
        if style == "aggressive":
            depth = -36.0
        elif style == "light":
            depth = -22.0
        if a.hum_strength >= 20.0:
            depth -= 4.0
        for n in range(1, 5):
            parts.append(f"equalizer=f={a.hum_freq * n}:t=q:w=25:g={depth:.1f}")

    if style == "light":
        parts.append("volume=0.85")
    else:
        # 3. Highpass
        parts.append("highpass=f=80")
        # 4. afftdn
        nf = -25.0
        if a.noise_floor is not None:
            nf = max(-50.0, min(-20.0, a.noise_floor + 5.0))
        if style == "aggressive":
            nf = max(-50.0, nf - 8.0)
        parts.append(f"afftdn=nf={nf:.1f}:nt=w:om=o")
        # 5. De-esser
        parts.append("deesser=i=0.4:m=0.5:f=0.5:s=o")
        # 6. Presence EQ
        parts.append("equalizer=f=3000:t=q:w=1.5:g=3")
        # 7. Warmth EQ
        parts.append("equalizer=f=200:t=q:w=1.0:g=2")
        # 8. Lowpass
        parts.append("lowpass=f=14000")
        # 9. Compressor
        parts.append("acompressor=threshold=-21dB:ratio=3:attack=5:release=50")
        # 10. Static gain
        parts.append("volume=0.6")

    return ",".join(parts)


def build_loudnorm(a: Analysis, preset: dict) -> str:
    if (a.input_i is not None and a.input_tp is not None
            and a.input_lra is not None and a.input_thresh is not None
            and a.target_offset is not None
            and a.input_i > -70.0):
        return (
            f"loudnorm=I={preset['I']}:TP={preset['TP']}:LRA={preset['LRA']}:"
            f"measured_I={a.input_i:.2f}:measured_TP={a.input_tp:.2f}:"
            f"measured_LRA={a.input_lra:.2f}:measured_thresh={a.input_thresh:.2f}:"
            f"offset={a.target_offset:.2f}:linear=true:print_format=summary"
        )
    return (
        f"loudnorm=I={preset['I']}:TP={preset['TP']}:LRA={preset['LRA']}:"
        f"print_format=summary"
    )


def build_filter_chain(a: Analysis, preset: dict) -> str:
    pre = build_prefilter(a, preset)
    ln = build_loudnorm(a, preset)
    return f"{pre},{ln}" if pre else ln


def diagnosis_summary(a: Analysis, preset_name: str, preset: dict,
                      audio_track: int) -> str:
    lines = ["Diagnosis:"]
    if a.audio_tracks > 1:
        lines.append(f"  Audio tracks:        {a.audio_tracks} present, "
                     f"processing track {audio_track} "
                     f"(use --audio-track to pick another)")
    if a.source_i is not None:
        lines.append(f"  Integrated loudness: {a.source_i:.1f} LUFS "
                     f"(target {preset['I']:.0f})")
    if a.source_tp is not None:
        lines.append(f"  True peak:           {a.source_tp:.1f} dBTP")
    if a.source_lra is not None:
        lines.append(f"  Loudness range:      {a.source_lra:.1f} LU")
    if a.max_volume is not None:
        lines.append(f"  Max sample:          {a.max_volume:.1f} dB"
                     + (" (CLIPPING RISK)" if a.clipping_risk else ""))
    if a.noise_floor is not None:
        lines.append(f"  Noise floor (est):   {a.noise_floor:.1f} dB")
    if a.dc_offset > 0.001:
        lines.append(f"  DC offset detected:  {a.dc_offset:.4f}")
    if a.hum_freq is not None:
        lines.append(f"  Mains hum detected:  {a.hum_freq} Hz "
                     f"({a.hum_strength:.1f} dB above voice band)")
    else:
        lines.append("  Mains hum:           none detected")
    lines.append(f"  Preset:              {preset_name}")
    return "\n".join(lines)


def pick_audio_codec(input_ext: str, has_video: bool) -> list[str]:
    """Return ffmpeg args for the audio encoder."""
    ext = input_ext.lower().lstrip(".")
    if has_video:
        return ["-c:a", "aac", "-b:a", "192k"]
    if ext == "wav":
        return ["-c:a", "pcm_s16le"]
    if ext == "flac":
        return ["-c:a", "flac"]
    if ext == "mp3":
        return ["-c:a", "libmp3lame", "-b:a", "192k"]
    # aac / m4a and friends
    return ["-c:a", "aac", "-b:a", "192k"]


def process(input_path: Path, output_path: Path, filter_chain: str,
            has_video: bool, audio_track: int, verbose: bool) -> None:
    cmd = [
        "ffmpeg", "-hide_banner", "-y",
        "-i", str(input_path),
    ]
    if has_video:
        cmd += ["-map", "0:v:0", "-c:v", "copy"]
    cmd += ["-map", f"0:a:{audio_track}"]
    cmd += pick_audio_codec(output_path.suffix, has_video)
    cmd += ["-af", filter_chain]
    cmd += [str(output_path)]
    log("  -> running ffmpeg…", verbose)
    log("     " + " ".join(shlex.quote(c) for c in cmd), verbose)
    res = run(cmd)
    if res.returncode != 0:
        sys.stderr.write(res.stderr)
        sys.exit("error: ffmpeg processing failed")


def verify(input_path: Path, output_path: Path, preset: dict, a: Analysis,
           verbose: bool) -> dict:
    log("Verifying output…", verbose)
    out_ln = run_loudnorm_pass(output_path, preset["I"], preset["TP"],
                               preset["LRA"], 0)
    out_mean, out_max = run_volumedetect(output_path, 0)
    out_hum_freq, out_hum_strength = (None, 0.0)
    if a.hum_freq is not None:
        out_hum_freq, out_hum_strength = detect_hum(output_path, 0, a.duration)

    report = {
        "output_i": float(out_ln.get("input_i", 0)) if out_ln.get("input_i") else None,
        "output_tp": float(out_ln.get("input_tp", 0)) if out_ln.get("input_tp") else None,
        "output_lra": float(out_ln.get("input_lra", 0)) if out_ln.get("input_lra") else None,
        "output_mean": out_mean,
        "output_max": out_max,
        "output_hum_strength": out_hum_strength if a.hum_freq else None,
    }
    return report


def print_summary(input_path: Path, output_path: Path, a: Analysis,
                  preset_name: str, preset: dict, applied: list[str],
                  report: dict) -> None:
    print()
    print("=" * 60)
    print("Audio cleanup summary")
    print("=" * 60)
    print(f"Input:   {input_path}")
    print(f"Output:  {output_path}")
    print(f"Preset:  {preset_name}")
    print()
    print("Applied:")
    for step in applied:
        print(f"  - {step}")
    print()
    print("Before -> After")
    if a.source_i is not None and report.get("output_i") is not None:
        delta = report["output_i"] - a.source_i
        print(f"  Integrated loudness: {a.source_i:6.1f} LUFS -> "
              f"{report['output_i']:6.1f} LUFS  (target {preset['I']:.0f}, "
              f"delta {delta:+.1f})")
    if a.source_tp is not None and report.get("output_tp") is not None:
        print(f"  True peak:           {a.source_tp:6.1f} dBTP -> "
              f"{report['output_tp']:6.1f} dBTP  (ceiling {preset['TP']:.1f})")
    if a.max_volume is not None and report.get("output_max") is not None:
        print(f"  Max sample:          {a.max_volume:6.1f} dB   -> "
              f"{report['output_max']:6.1f} dB")
    if a.hum_freq is not None and report.get("output_hum_strength") is not None:
        reduction = a.hum_strength - report["output_hum_strength"]
        print(f"  Hum @ {a.hum_freq} Hz:        {a.hum_strength:6.1f} dB   -> "
              f"{report['output_hum_strength']:6.1f} dB    (reduced {reduction:.1f} dB)")
    print()

    # Target check
    out_i = report.get("output_i")
    out_tp = report.get("output_tp")
    if out_i is not None:
        if abs(out_i - preset["I"]) <= 1.0:
            print(f"  [OK] Loudness within 1 LUFS of target ({preset['I']})")
        else:
            print(f"  [WARN] Loudness off target by {abs(out_i - preset['I']):.1f} LU")
    if out_tp is not None:
        if out_tp <= preset["TP"] + 0.1:
            print(f"  [OK] True peak under ceiling ({preset['TP']:.1f} dBTP)")
        else:
            print(f"  [WARN] True peak {out_tp:.1f} dBTP exceeds ceiling {preset['TP']:.1f}")
    print()


def applied_steps(a: Analysis, preset: dict) -> list[str]:
    style = preset["style"]
    steps: list[str] = []
    if a.dc_offset > 0.001:
        steps.append("DC offset removal")
    if a.hum_freq is not None:
        steps.append(f"Hum notch at {a.hum_freq} Hz + 3 harmonics")
    if style == "light":
        steps.append("Light gain trim")
    else:
        steps.append("Highpass at 80 Hz (rumble removal)")
        steps.append(f"afftdn broadband denoise ({'aggressive' if style == 'aggressive' else 'standard'})")
        steps.append("De-esser (sibilance control)")
        steps.append("Presence EQ +3 dB @ 3 kHz")
        steps.append("Warmth EQ +2 dB @ 200 Hz")
        steps.append("Lowpass at 14 kHz")
        steps.append("Compressor 3:1 @ -21 dB")
    steps.append(f"Loudness normalize to {preset['I']:.0f} LUFS / "
                 f"{preset['TP']:.1f} dBTP")
    return steps


def default_output(input_path: Path) -> Path:
    return input_path.with_name(f"{input_path.stem}_cleaned{input_path.suffix}")


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(
        description="Clean and master the audio track of a video or audio file."
    )
    p.add_argument("input", type=Path, help="Input video or audio file")
    p.add_argument("-o", "--output", type=Path, default=None,
                   help="Output path (default: <input>_cleaned.<ext>)")
    p.add_argument("--preset", choices=sorted(PRESETS.keys()), default="podcast",
                   help="Processing preset (default: podcast)")
    p.add_argument("--hum", choices=["auto", "50", "60", "none"], default="auto",
                   help="Mains hum frequency (default: auto-detect)")
    p.add_argument("--audio-track", type=int, default=0,
                   help="Audio track index to process (default: 0)")
    p.add_argument("--dry-run", action="store_true",
                   help="Analyze and print the filter chain without processing")
    p.add_argument("-q", "--quiet", action="store_true",
                   help="Suppress progress messages")
    args = p.parse_args(argv)

    verbose = not args.quiet

    check_ffmpeg()

    input_path: Path = args.input.expanduser().resolve()
    if not input_path.exists():
        sys.exit(f"error: input not found: {input_path}")

    output_path: Path = (args.output.expanduser().resolve()
                         if args.output else default_output(input_path))
    if output_path == input_path:
        sys.exit("error: output path matches input; refusing to overwrite source")

    preset = PRESETS[args.preset]

    log(f"Analyzing {input_path.name}…", verbose)
    a = analyze(input_path, args.audio_track, args.hum, verbose)

    # Build the prefilter chain (everything except the final loudnorm).
    prefilter = build_prefilter(a, preset)

    # Pass-1 loudnorm measurement — measured AFTER the prefilter chain so the
    # measured values apply to what the second loudnorm pass receives.
    measure_post_chain_loudness(input_path, args.audio_track, prefilter,
                                preset, a, verbose)

    print(diagnosis_summary(a, args.preset, preset, args.audio_track))

    if a.clipping_risk:
        print("warning: source shows clipping; distortion in the original "
              "cannot be fully repaired.", file=sys.stderr)

    chain = build_filter_chain(a, preset)
    log(f"Filter chain:\n  {chain}", verbose)

    if args.dry_run:
        print("\n--dry-run: skipping processing")
        return 0

    output_path.parent.mkdir(parents=True, exist_ok=True)
    process(input_path, output_path, chain, a.has_video, args.audio_track, verbose)
    report = verify(input_path, output_path, preset, a, verbose)

    steps = applied_steps(a, preset)
    print_summary(input_path, output_path, a, args.preset, preset, steps, report)
    return 0


if __name__ == "__main__":
    sys.exit(main())
