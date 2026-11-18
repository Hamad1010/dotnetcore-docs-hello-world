# Transcript tools

The 21 source courses arrive as two raw transcript files (no punctuation, and partly extracted from PDF in
reversed word order). These scripts turn them into clean per-course text so Claude can look up a lesson's
original explanation in seconds instead of re-reading 5 MB.

**Privacy and copyright:** the transcripts and everything derived from them live in
`channel/02-lessons/sources/`, which is git-ignored. Never commit them.

| Script | What it does |
|---|---|
| `prepare.sh` | One command: normalize → recover reversed PDF text → split into `C01.txt … C21.txt` |
| `normalize.py` | Converts Arabic presentation forms to normal letters, flags reversed lines |
| `fix_reversed.py` | Rebuilds reading order of PDF-extracted lines (bigram language model + line-width estimate) |
| `split_courses.py` | Splits by course boundaries (line ranges) into `courses/Cxx.txt` |
| `skel2.py` | Prints a course's skeleton (القاعدة/القانون/السر/الفكرة الأولى، الثانية…) with positions |

Usage:
```bash
mkdir -p channel/02-lessons/sources
# copy the files: scripts 1-12 → A.md, scripts 12-21 → B.md
bash channel/06-tools/transcripts/prepare.sh
python3 channel/06-tools/transcripts/skel2.py channel/02-lessons/sources/courses/C01.txt 200
```
The course list (`sources/courses.json`) and the private lesson map (`sources/lesson-map.csv`, which links each
public lesson number to its course and position) also live in the git-ignored folder. Keep a copy of the whole
`sources/` folder on your computer: a cloud session starts empty and only has it after you upload it again.
You only need these when you want the original explanation of a lesson; the public catalog doesn't depend on them.
