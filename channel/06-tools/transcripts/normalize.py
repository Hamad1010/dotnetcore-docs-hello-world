import sys, unicodedata, re, json
src, out = sys.argv[1], sys.argv[2]
PRES = re.compile('[ﭐ-﷿ﹰ-﻿]')
lines = open(src, encoding='utf-8').read().split('\n')
res = []
for i, ln in enumerate(lines, 1):
    pres = len(PRES.findall(ln))
    reversed_flag = False
    if pres > 20:
        ln = unicodedata.normalize('NFKC', ln)
        # PDF visual-order extraction: reverse word order
        ln = ' '.join(reversed(ln.split()))
        reversed_flag = True
    res.append({'n': i, 'len': len(ln), 'rev': reversed_flag, 'text': ln})
json.dump(res, open(out, 'w', encoding='utf-8'), ensure_ascii=False)
for r in res:
    if r['len'] > 3000:
        print(f"{r['n']}: len={r['len']} rev={r['rev']} | {r['text'][:140]}")
