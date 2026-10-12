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
The lesson list itself (`02-lessons/lessons_by_course.tsv`) is already extracted, so you only need this when
you want the course's original explanation of a lesson.
