"""Build the lesson catalog (publishing order) from the per-course lesson list.

Input : 02-lessons/lessons_by_course.tsv  (one row per lesson, grouped by source course)
        02-lessons/courses.json           (course titles)
Output: 02-lessons/lessons.csv            (the tracker: one row per lesson = one video)
        02-lessons/LESSONS.md             (readable catalog, by season)

Run from the channel/ folder:  python3 06-tools/build_catalog.py
Re-running keeps any status/date/url/notes you already filled in lessons.csv.
"""
import csv
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LESSONS_DIR = os.path.join(ROOT, '02-lessons')

# Season 1 = the strongest lessons across all topics (tests what the audience loves first).
SEASON1 = [
    ('C01', 1), ('C05', 2), ('C02', 1), ('C01', 27), ('C08', 12),
    ('C16', 11), ('C14', 10), ('C01', 22), ('C05', 16), ('C02', 7),
    ('C08', 3), ('C19', 7), ('C01', 11), ('C14', 21), ('C16', 17),
    ('C11', 7), ('C05', 12), ('C13', 6), ('C18', 9), ('C16', 1),
]

# (season no, Arabic title, English title, niche fit, courses in order)
SEASONS = [
    (1, 'الأساسيات: أقوى 20 درس', 'Foundations: the 20 strongest lessons', None, []),
    (2, 'الكاريزما والجاذبية', 'Charisma & attraction', 'core', ['C01', 'C17']),
    (3, 'الذكاء العاطفي وإدارة المشاعر', 'Emotional intelligence', 'core', ['C05', 'C13']),
    (4, 'تقدير الذات والتعافي', 'Self-worth & healing', 'core', ['C11', 'C04']),
    (5, 'الذكاء الاجتماعي وفن الردود', 'Social intelligence & smart replies', 'core', ['C16', 'C02', 'C19']),
    (6, 'الهيبة وقوة الشخصية', 'Presence & strong personality', 'core', ['C08']),
    (7, 'الإقناع والتفاوض', 'Persuasion & negotiation', 'core', ['C14']),
    (8, 'العقلية والأفكار الملهمة', 'Mindset & inspiring ideas', 'adjacent', ['C18', 'C12', 'C15']),
    (9, 'الذكاء الاجتماعي في العمل', 'Social intelligence at work', 'adjacent', ['C03', 'C07', 'C21', 'C06', 'C20']),
    (10, 'التربية بذكاء عاطفي', 'Parenting with emotional intelligence', 'adjacent', ['C09']),
    (11, 'ملحق: المشاريع والهوية الشخصية', 'Bonus: business & personal brand', 'off-niche', ['C10']),
]

CORE_COURSES = {'C01', 'C02', 'C04', 'C05', 'C08', 'C11', 'C13', 'C14', 'C16', 'C17', 'C19'}
KEEP = ['status', 'episode', 'publish_date', 'video_url', 'views_7d', 'ctr', 'avd', 'notes']


def main():
    courses = {c['id']: c for c in json.load(open(os.path.join(LESSONS_DIR, 'courses.json'), encoding='utf-8'))}
    with open(os.path.join(LESSONS_DIR, 'lessons_by_course.tsv'), encoding='utf-8') as f:
        rows = list(csv.DictReader(f, delimiter='\t'))
    by_key = {(r['course'], int(r['n'])): r for r in rows}

    ordered = []  # (season tuple, row)
    used = set()
    for key in SEASON1:
        ordered.append((SEASONS[0], by_key[key]))
        used.add(key)
    for season in SEASONS[1:]:
        for cid in season[4]:
            for r in rows:
                key = (r['course'], int(r['n']))
                if r['course'] == cid and key not in used:
                    ordered.append((season, r))
                    used.add(key)
    missing = [k for k in by_key if k not in used]
    assert not missing, f'lessons not placed in any season: {missing}'

    # keep progress already tracked in an existing lessons.csv
    csv_path = os.path.join(LESSONS_DIR, 'lessons.csv')
    previous = {}
    if os.path.exists(csv_path):
        with open(csv_path, encoding='utf-8') as f:
            for r in csv.DictReader(f):
                previous[(r['course'], r['ref_n'])] = r

    out = []
    for i, (season, r) in enumerate(ordered, 1):
        prev = previous.get((r['course'], r['n']), {})
        fit = season[3] or ('core' if r['course'] in CORE_COURSES else 'adjacent')
        row = {
            'lesson': f'L{i:03d}',
            'season': season[0],
            'season_title': season[1],
            'course': r['course'],
            'ref_n': r['n'],
            'source_ref': r['ref'],
            'title_ar': r['title_ar'],
            'title_en': r['title_en'],
            'idea': r['idea'],
            'fit': fit,
        }
        for k in KEEP:
            row[k] = prev.get(k, 'todo' if k == 'status' else '')
        out.append(row)

    fields = list(out[0].keys())
    with open(csv_path, 'w', encoding='utf-8', newline='') as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(out)

    # readable catalog
    lines = [
        '# كتالوج الدروس — Lesson Catalog',
        '',
        f'**{len(out)} lessons** from **{len(courses)} source courses**, arranged into **{len(SEASONS)} seasons**. '
        'One lesson = one video. The lesson number is the episode number.',
        '',
        '- Tracker (status, dates, results): [`lessons.csv`](lessons.csv), which opens in Excel or Google Sheets',
        '- Built by `06-tools/build_catalog.py` from [`lessons_by_course.tsv`](lessons_by_course.tsv); edit the TSV, then re-run',
        '- `fit`: **core** = social/emotional intelligence; **adjacent** = useful and related; **off-niche** = keep for later or a second channel',
        '',
        '## Seasons',
        '',
        '| Season | Title | Lessons | Fit |',
        '|---|---|---|---|',
    ]
    for s in SEASONS:
        items = [o for o in out if o['season'] == s[0]]
        lines.append(f"| {s[0]} | {s[1]} ({s[2]}) | {items[0]['lesson']}–{items[-1]['lesson']} ({len(items)}) | {s[3] or 'mixed'} |")
    lines += ['', '## Source courses', '', '| ID | Course | Lessons |', '|---|---|---|']
    for cid, c in courses.items():
        n = sum(1 for r in rows if r['course'] == cid)
        lines.append(f"| {cid} | {c['en']} | {n} |")
    for s in SEASONS:
        items = [o for o in out if o['season'] == s[0]]
        lines += ['', f'## Season {s[0]}: {s[1]}', f'*{s[2]}*', '', '| # | الدرس | Lesson | Core idea | Source |', '|---|---|---|---|---|']
        for o in items:
            lines.append(f"| {o['lesson']} | {o['title_ar']} | {o['title_en']} | {o['idea']} | {o['course']} · {o['source_ref']} |")
    with open(os.path.join(LESSONS_DIR, 'LESSONS.md'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')

    print(f'{len(out)} lessons written')
    for s in SEASONS:
        print(s[0], s[2], sum(1 for o in out if o['season'] == s[0]))


if __name__ == '__main__':
    main()
