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

# (season no, Arabic title, English title, niche fit) — business channel «غرفة الفرص»
SEASONS = [
    (1, 'البداية: أقوى 20 فكرة', 'The start: the 20 strongest ideas', 'core'),
    (2, 'موهبتك المخفية', 'Find your hidden talent', 'core'),
    (3, 'من الموهبة إلى دخل', 'Turn talent into income', 'core'),
    (4, 'تموضعك وعلامتك', 'Positioning & personal brand', 'core'),
    (5, 'الثقة عملة', 'Trust: emotional intelligence for business', 'core'),
    (6, 'فن الإقناع والصفقة', 'Persuasion, sales & negotiation', 'core'),
    (7, 'شبكتك ثروتك', 'Networking & connections that pay off', 'core'),
    (8, 'الرافعة والتوسع', 'Leverage, systems & scaling', 'core'),
    (9, 'القيادة والفريق', 'Leadership & teams', 'core'),
    (10, 'من الوظيفة إلى المشروع', 'From job to business', 'adjacent'),
    (11, 'وقتك ومالك', 'Time, focus & money habits', 'adjacent'),
    (12, 'الثبات تحت الضغط', 'Steady under pressure', 'adjacent'),
]
STATUSES = {'todo', 'draft', 'scripted', 'test-30s', 'test-render', 'voiced', 'rendered', 'scheduled', 'published', 'skip'}


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
        '- `fit`: **core** = the main business promise; **adjacent** = useful and related; **off-niche** = keep for later',
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
        lines += ['', f'## Season {s[0]}: {s[1]}', f'*{s[2]}*', '', '| # | الدرس | Lesson | Core idea | Business angle | Status |', '|---|---|---|---|---|---|']
        for r in items:
            status = r['status'] + (f" · {r['episode']}" if r['episode'] else '')
            lines.append(f"| {r['lesson']} | {r['title_ar']} | {r['title_en']} | {r['idea']} | {r.get('business_angle', '')} | {status} |")
    with open(os.path.join(LESSONS_DIR, 'LESSONS.md'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')

    print(f'{len(rows)} lessons OK')
    for s in SEASONS:
        print(s[0], s[2], sum(1 for r in rows if int(r['season']) == s[0]))


if __name__ == '__main__':
    main()
