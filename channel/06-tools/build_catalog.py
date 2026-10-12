"""Check the lesson tracker and rebuild the readable catalog.

Source of truth: 02-lessons/lessons.csv (one row per lesson = one video). Edit titles, order or seasons there.
Output:          02-lessons/LESSONS.md (readable catalog, by season)

Run from the channel/ folder:  python3 06-tools/build_catalog.py
"""
import csv
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LESSONS_DIR = os.path.join(ROOT, '02-lessons')

# (season no, Arabic title, English title, niche fit)
SEASONS = [
    (1, 'الأساسيات: أقوى 20 درس', 'Foundations: the 20 strongest lessons', 'core'),
    (2, 'الجاذبية والانطباع الأول', 'Charisma & first impressions', 'core'),
    (3, 'فهم الناس والشخصيات الصعبة', 'Understanding people & difficult personalities', 'core'),
    (4, 'فن الكلام والردود الذكية', 'Talking & smart replies', 'core'),
    (5, 'إدارة المشاعر', 'Managing your emotions', 'core'),
    (6, 'الثقة وتقدير الذات', 'Confidence & self-worth', 'core'),
    (7, 'الحضور والاحترام', 'Presence & respect', 'core'),
    (8, 'الإقناع بدون ضغط', 'Persuasion without pressure', 'core'),
    (9, 'الخوف والحزن والتعافي', 'Fear, grief & healing', 'core'),
    (10, 'الأهداف والعادات والتركيز', 'Goals, habits & focus', 'adjacent'),
    (11, 'العقلية والحكمة', 'Mindset & wisdom', 'adjacent'),
    (12, 'مع مديرك وزملائك', 'With your boss & colleagues', 'adjacent'),
    (13, 'الترقية والقيادة', 'Career growth & leadership', 'adjacent'),
    (14, 'الأسرة والعلاقات القريبة', 'Family & close relationships', 'adjacent'),
    (15, 'ملحق: مشروعك واسمك', 'Bonus: your project & personal brand', 'off-niche'),
]
STATUSES = {'todo', 'scripted', 'test-render', 'voiced', 'rendered', 'scheduled', 'published', 'skip'}


def main():
    csv_path = os.path.join(LESSONS_DIR, 'lessons.csv')
    with open(csv_path, encoding='utf-8') as f:
        rows = list(csv.DictReader(f))

    seasons = {s[0]: s for s in SEASONS}
    errors = []
    for i, r in enumerate(rows, 1):
        if r['lesson'] != f'L{i:03d}':
            errors.append(f"row {i}: lesson is {r['lesson']}, expected L{i:03d}")
        s = seasons.get(int(r['season']))
        if not s:
            errors.append(f"{r['lesson']}: unknown season {r['season']}")
        elif r['season_title'] != s[1]:
            errors.append(f"{r['lesson']}: season_title should be '{s[1]}'")
        if r['status'] not in STATUSES:
            errors.append(f"{r['lesson']}: status '{r['status']}' not in {sorted(STATUSES)}")
    if errors:
        print('\n'.join(errors))
        sys.exit(1)

    lines = [
        '# كتالوج الدروس · Lesson Catalog',
        '',
        f'**{len(rows)} lessons** in **{len(SEASONS)} seasons**. One lesson = one video. The lesson number is the episode number.',
        '',
        '- Tracker (status, dates, results): [`lessons.csv`](lessons.csv), which opens in Excel or Google Sheets',
        '- `lessons.csv` is the source of truth. Edit titles or order there, then run `python3 06-tools/build_catalog.py` to refresh this page',
        '- `fit`: **core** = social/emotional intelligence; **adjacent** = useful and related; **off-niche** = keep for later or a second channel',
        '',
        '## Seasons',
        '',
        '| Season | Title | Lessons | Fit |',
        '|---|---|---|---|',
    ]
    for s in SEASONS:
        items = [r for r in rows if int(r['season']) == s[0]]
        if items:
            lines.append(f"| {s[0]} | {s[1]} ({s[2]}) | {items[0]['lesson']}–{items[-1]['lesson']} ({len(items)}) | {s[3]} |")
    for s in SEASONS:
        items = [r for r in rows if int(r['season']) == s[0]]
        lines += ['', f'## Season {s[0]}: {s[1]}', f'*{s[2]}*', '', '| # | الدرس | Lesson | Core idea | Status |', '|---|---|---|---|---|']
        for r in items:
            status = r['status'] + (f" · {r['episode']}" if r['episode'] else '')
            lines.append(f"| {r['lesson']} | {r['title_ar']} | {r['title_en']} | {r['idea']} | {status} |")
    with open(os.path.join(LESSONS_DIR, 'LESSONS.md'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')

    print(f'{len(rows)} lessons OK')
    for s in SEASONS:
        print(s[0], s[2], sum(1 for r in rows if int(r['season']) == s[0]))


if __name__ == '__main__':
    main()
