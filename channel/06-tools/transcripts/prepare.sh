#!/usr/bin/env bash
# Rebuild per-course text files from the raw transcripts (kept local, never committed).
#   1) put the two transcript .md files in channel/02-lessons/sources/ as A.md (scripts 1-12) and B.md (scripts 12-21)
#   2) bash channel/06-tools/transcripts/prepare.sh
# Output: channel/02-lessons/sources/courses/C01.txt … C21.txt  (+ meta.json)
set -euo pipefail
TOOLS="$(cd "$(dirname "$0")" && pwd)"
SRC="$(cd "$TOOLS/../../02-lessons/sources" && pwd)"
cd "$SRC"
mkdir -p src courses
cp A.md src/A.md && cp B.md src/B.md
python3 "$TOOLS/normalize.py" src/A.md src/A.json > /dev/null
python3 "$TOOLS/normalize.py" src/B.md src/B.json > /dev/null
# Part of file A was extracted from a PDF in visual (reversed) word order; recover reading order.
python3 "$TOOLS/fix_reversed.py" src/A.json src/B.json src/A.md src/A.json src/A_fixed.json
python3 - <<'PY'
import json
fix = lambda t: t.replace('ی', 'ي').replace('ھ', 'ه').replace('ک', 'ك')
for name, src in (('A', 'src/A_fixed.json'), ('B', 'src/B.json')):
    data = json.load(open(src, encoding='utf-8'))
    for r in data:
        r['text'] = fix(r['text'])
    json.dump(data, open(f'src/{name}_fixed.json', 'w', encoding='utf-8'), ensure_ascii=False)
PY
python3 "$TOOLS/split_courses.py"
echo "Done. Find a lesson's passage with:  python3 $TOOLS/skel2.py courses/C05.txt 200"
