#!/usr/bin/env python3
"""Build a short 10-second slideshow video from free-license photos.

Each photo gets a slow zoom (Ken Burns effect) and the photos cross-fade
into each other. Output is a 1920x1080, 30 fps H.264 MP4 suitable for YouTube.

Usage:
    python3 video/make_video.py <photos_dir> <output.mp4>

<photos_dir> must contain one sub-folder per photo (01, 02, ...), each holding
one image file. The sub-folders are sorted by name to set the order.
"""
import glob
import os
import subprocess
import sys

FPS = 30
W, H = 1920, 1080
CLIP_SECONDS = 3.0      # length each photo is on screen
FADE_SECONDS = 2.0 / 3  # cross-fade length between photos
ZOOM_STEP = 0.0008      # how fast the zoom grows per frame
ZOOM_MAX = 1.12


def find_photos(photos_dir):
    photos = []
    for folder in sorted(glob.glob(os.path.join(photos_dir, "*"))):
        if not os.path.isdir(folder):
            continue
        files = sorted(f for f in glob.glob(os.path.join(folder, "*"))
                       if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp")))
        if files:
            photos.append(files[0])
    if len(photos) < 2:
        raise SystemExit(f"Need at least 2 photos in {photos_dir}, found {len(photos)}")
    return photos


def build(photos, output):
    frames = int(round(CLIP_SECONDS * FPS))
    cmd = ["ffmpeg", "-y"]
    for p in photos:
        cmd += ["-loop", "1", "-t", str(CLIP_SECONDS), "-i", p]

    parts = []
    for i in range(len(photos)):
        # Crop to 16:9, then zoom slowly. The pre-scale keeps the zoom smooth.
        parts.append(
            f"[{i}:v]scale={W*2}:{H*2}:force_original_aspect_ratio=increase,"
            f"crop={W*2}:{H*2},"
            f"zoompan=z='min(zoom+{ZOOM_STEP},{ZOOM_MAX})':d={frames}"
            f":x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps={FPS},"
            f"setsar=1,format=yuv420p[v{i}]"
        )

    # Chain the clips with cross-fades. Each join starts earlier by the fade length.
    last = "v0"
    total = CLIP_SECONDS
    for i in range(1, len(photos)):
        offset = total - FADE_SECONDS
        out = f"x{i}"
        parts.append(
            f"[{last}][v{i}]xfade=transition=fade:duration={FADE_SECONDS:.4f}"
            f":offset={offset:.4f}[{out}]"
        )
        last = out
        total = offset + CLIP_SECONDS

    parts.append(f"[{last}]fade=t=in:st=0:d=0.3,fade=t=out:st={total-0.5:.3f}:d=0.5[vout]")
    cmd += [
        "-filter_complex", ";".join(parts),
        "-map", "[vout]",
        "-c:v", "libx264", "-preset", "medium", "-crf", "20",
        "-pix_fmt", "yuv420p", "-r", str(FPS), "-movflags", "+faststart",
        output,
    ]
    subprocess.run(cmd, check=True)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    build(find_photos(sys.argv[1]), sys.argv[2])
    print("Wrote", sys.argv[2])
