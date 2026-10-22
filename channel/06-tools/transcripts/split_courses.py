import json, re, os
A = {r['n']: r['text'] for r in json.load(open('src/A_fixed.json', encoding='utf-8'))}
B = {r['n']: r['text'] for r in json.load(open('src/B_fixed.json', encoding='utf-8'))}
def rng(doc, a, b):
    return '\n'.join(doc[n] for n in range(a, b + 1) if n in doc and doc[n].strip())
# Course list and line ranges live in the private folder (git-ignored): sources/courses.json
COURSES = [(c['id'], c['ar'], c['en'], c['src'], c['start'], c['end']) for c in json.load(open('courses.json', encoding='utf-8'))]
meta = []
for cid, ar, en, src, a, b in COURSES:
    doc = A if src == 'A' else B
    txt = rng(doc, a, b)
    open(f'courses/{cid}.txt', 'w', encoding='utf-8').write(txt)
    meta.append({'id': cid, 'ar': ar, 'en': en, 'src': src, 'lines': [a, b], 'chars': len(txt)})
    print(cid, src, a, b, len(txt), en)
json.dump(meta, open('courses/meta.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
