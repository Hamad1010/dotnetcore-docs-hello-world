"""Recover logical word order for PDF-extracted Arabic lines (visual order per line).
Approach: segment raw word stream into visual lines with DP maximizing a bigram LM
trained on the normal (correct-order) transcripts from the same speaker."""
import sys, json, math, unicodedata, re
from collections import Counter

def norm_word(w):
    w = w.replace('ی','ي').replace('ھ','ه').replace('ک','ك')
    w = w.replace('ة','ه').replace('ى','ي')
    w = re.sub('[أإآ]', 'ا', w)
    return w

A = json.load(open(sys.argv[1], encoding='utf-8'))
B = json.load(open(sys.argv[2], encoding='utf-8'))
uni, bi = Counter(), Counter()
for doc in (A, B):
    for r in doc:
        if r['rev']:
            continue
        ws = [norm_word(w) for w in r['text'].split()]
        uni.update(ws)
        bi.update(zip(ws, ws[1:]))
V = len(uni) + 1
TOT = sum(uni.values())
K = 3.0
def lp_uni(b):
    return math.log((uni.get(b, 0) + 0.5) / (TOT + 0.5 * V))
cache = {}
def lp(a, b):
    key = (a, b)
    v = cache.get(key)
    if v is None:
        ca = uni.get(a, 0)
        lam = ca / (ca + K) if ca else 0.0
        pb = (bi.get(key, 0) / ca) if ca else 0.0
        v = math.log(lam * pb + (1 - lam) * math.exp(lp_uni(b)) + 1e-12)
        cache[key] = v
    return v

def is_frag(nt, toks, i):
    if i <= 0 or len(nt[i]) > 2:
        return False
    joined = nt[i-1] + nt[i]
    return uni.get(joined, 0) >= 2 and uni.get(joined, 0) > uni.get(nt[i-1], 0) * 0.05

MU, SIGMA = 120.0, 7.0
def len_prior(chars):
    return -0.5 * ((chars - MU) / SIGMA) ** 2

def recover(raw_line, minw=8, maxw=40):
    raw = unicodedata.normalize('NFKC', raw_line)
    toks = raw.split()
    nt = [norm_word(t) for t in toks]
    N = len(nt)
    # within(j): logical bigram nt[j] -> nt[j-1]
    frag = [is_frag(nt, toks, i) for i in range(N)]
    # estimate visual line width from spacing between split-word fragments
    global MU
    offs = [0]
    for t in toks:
        offs.append(offs[-1] + len(t) + 1)
    fpos = [i for i in range(N) if frag[i]]
    from collections import Counter as _C
    sp = _C(offs[b + 1] - offs[a + 1] for a, b in zip(fpos, fpos[1:]) if 90 <= offs[b + 1] - offs[a + 1] <= 140)
    if sp:
        tot = sum(sp.values())
        MU = sum(k * v for k, v in sp.items()) / tot
    print('estimated line width', round(MU, 1), file=sys.stderr)
    CL = [0] * (N + 1)
    for j in range(N):
        CL[j + 1] = CL[j] + len(toks[j]) + 1
    def seg_bonus(s, e):
        return len_prior(CL[e + 1] - CL[s] - 1) + (6.0 if frag[e] else 0.0) - (6.0 if frag[s] else 0.0)
    W = [0.0] * N
    for j in range(1, N):
        W[j] = lp(nt[j], nt[j - 1])
    P = [0.0] * (N + 1)
    for j in range(N):
        P[j + 1] = P[j] + W[j]
    def within(s, e):  # sum W[s+1..e]
        return P[e + 1] - P[s + 1]
    NEG = -1e18
    # D[(s,e)] best score with last segment [s,e]; back pointers
    D = {}
    BP = {}
    for e in range(minw - 1, min(maxw, N)):
        D[(0, e)] = within(0, e) + lp('<s>', nt[e]) + seg_bonus(0, e)
        BP[(0, e)] = None
    # iterate by end position
    ends = {}
    for (s, e) in list(D.keys()):
        ends.setdefault(e, []).append(s)
    for e in range(N):
        starts = ends.get(e)
        if not starts:
            continue
        for f in range(e + minw, min(e + maxw, N - 1) + 1):
            best, arg = NEG, None
            wf = within(e + 1, f) + seg_bonus(e + 1, f)
            for s in starts:
                v = D[(s, e)] + lp(nt[s], nt[f])
                if v > best:
                    best, arg = v, s
            key = (e + 1, f)
            val = best + wf
            if val > D.get(key, NEG):
                D[key] = val
                BP[key] = (arg, e)
                ends.setdefault(f, [])
                if (e + 1) not in ends[f]:
                    ends[f].append(e + 1)
    # final: segment ending at N-1 (allow short last segment)
    cands = [(D[(s, N - 1)], s) for s in ends.get(N - 1, [])]
    if not cands:
        return ' '.join(reversed(toks)), 0
    _, s = max(cands)
    segs = []
    key = (s, N - 1)
    while key is not None:
        segs.append(key)
        key = BP[key]
    segs.reverse()
    out = []
    for (s, e) in segs:
        seg = toks[s:e + 1]
        fr = frag[s:e + 1]
        # merge split words (stem + fragment) before reversing
        merged = []
        for t, f in zip(seg, fr):
            if f and merged:
                merged[-1] = merged[-1] + t
            else:
                merged.append(t)
        out.extend(reversed(merged))
    return ' '.join(out), len(segs)

if __name__ == '__main__':
    import time
    src_md, idx_json, out_json = sys.argv[3], sys.argv[4], sys.argv[5]
    lines = open(src_md, encoding='utf-8').read().split('\n')
    data = json.load(open(idx_json, encoding='utf-8'))
    for r in data:
        if r['rev']:
            t = time.time()
            txt, nseg = recover(lines[r['n'] - 1])
            r['text'] = txt
            r['len'] = len(txt)
            print(f"line {r['n']}: {nseg} visual lines, {time.time()-t:.1f}s", file=sys.stderr)
            print(txt[:600], file=sys.stderr)
    json.dump(data, open(out_json, 'w', encoding='utf-8'), ensure_ascii=False)
