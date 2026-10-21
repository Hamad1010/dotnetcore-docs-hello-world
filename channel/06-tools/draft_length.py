"""Length check for script drafts (03-episodes/EP00N/script-draft.md).

Counts the spoken characters of each part (each `## ` heading) and estimates when it starts. Lines that start
with `>` (notes), `|` or `#` and text in [brackets] are not spoken. Digits are counted as the words they become.

Run:  python3 channel/06-tools/draft_length.py EP002     (no argument = every draft)
"""
import glob
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RATE = 11.3   # the owner's real pace, pauses included (EP001 part A, second take, after clean_recording.py, 21 Oct 2026)
PAUSE = 0.0   # extra seconds for each "…": already inside the measured pace
WORDS_PER_DIGIT = 3
MIN_SECONDS = 8 * 60  # keep in step with the framework's minimum length (11-video-framework.md §2)


def spoken(line):
    line = re.sub(r'\[[^\]]*\]', '', line)
    line = re.sub(r'[*«»]', '', line).strip()
    digits = sum(len(d) for d in re.findall(r'\d', line))
    return len(re.sub(r'\d', '', line)) + digits * WORDS_PER_DIGIT


def report(path):
    parts, part = [], None
    for line in open(path, encoding='utf-8'):
        line = line.rstrip('\n')
        if line.startswith('## '):
            part = [line[3:].strip(), 0, 0]
            parts.append(part)
        elif part and line.strip() and line[0] not in '>|#' and not line.startswith('---'):
            part[1] += spoken(line)
            part[2] += line.count('…')
    t, total = 0.0, 0
    print(os.path.relpath(path, ROOT))
    for name, chars, pauses in parts:
        print(f'  {int(t // 60)}:{int(t % 60):02d}  {chars:5d}  {name}')
        t += chars / RATE + pauses * PAUSE
        total += chars
    warn = '   ⚠ under 8:00' if t < MIN_SECONDS else ''
    print(f'  total {total} characters ≈ {int(t // 60)}:{int(t % 60):02d}{warn}\n')


if __name__ == '__main__':
    ids = sys.argv[1:] or sorted(os.path.basename(os.path.dirname(p))
                                 for p in glob.glob(os.path.join(ROOT, '03-episodes', 'EP*', 'script-draft.md')))
    for ep in ids:
        report(os.path.join(ROOT, '03-episodes', ep, 'script-draft.md'))
