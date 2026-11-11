"""Check that every cue in an episode is in its scene's spoken narration, in order.

A moment appears when its `cue` is said (src/scenes/common.tsx: cueAt, an exact match on the spoken words, "phrase@2" =
its second occurrence). When the owner edits the script or records with different words, a cue can stop matching and its
moment falls back to a guessed time. Run this after any change to the narration:

    python3 06-tools/check_cues.py EP006          (from channel/)

It lists each cue that is missing, each `until` that is not after its cue, and each part of a moment (a chip, a step, the
fork's paths…) whose word comes before the moment itself (usually the same word said earlier: use a longer phrase).
"""
import json
import os
import re
import sys

CHANNEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MARK = re.compile(r'\{([^|{}]*)\|([^{}]*)\}')
SUBKEYS = ['subCue', 'noteCue', 'titleCue', 'toCue', 'fillCue', 'highlightCue', 'fadeCue', 'markCue', 'badgeCue', 'revealCue',
           'usualCue', 'costCue', 'rightCue', 'resultCue', 'numberCue', 'labelCue', 'pressCue', 'startCue', 'fastCue', 'resultCue',
           'tryCue', 'stuckCue', 'longCue', 'turnCue', 'slipCue']


def spoken(text):
    return re.sub(r'\s+', ' ', MARK.sub(r'\2', text)).strip()


def find(text, cue):
    m = re.match(r'^(.*)@(\d+)$', cue)
    want, nth = (m.group(1), int(m.group(2))) if m else (cue, 1)
    i = -1
    for _ in range(nth):
        i = text.find(want, i + 1)
        if i < 0:
            return -1
    return i


def check(episode):
    problems = []
    for s in episode['scenes']:
        text = spoken(s.get('narration', ''))

        def chk(cue, where, after=None):
            if cue in (None, '-'):
                return None
            i = find(text, cue)
            if i < 0:
                problems.append(f"{s['id']}: «{cue}» is not in the narration ({where})")
            elif after is not None and after >= 0 and i < after:
                problems.append(f"{s['id']}: «{cue}» comes before its moment's cue ({where})")
            return i

        for k in ('darkCue', 'loopCue', 'puzzleCue', 'glowCue', 'glowEndCue', 'focusCue', 'phoneCue', 'timelineCue', 'fileCue', 'roadmapCue'):
            chk(s.get(k), k)
        if s['type'] == 'journey' and s.get('from', s.get('at', 0)) == s.get('at', 0):
            for stop in [s['start'], *s['stations'], s['destination']]:
                chk(stop.get('cue'), 'map stop')
        prev = -1
        for m in s.get('moments', []) or []:
            if m.get('at') is not None:
                continue
            i = chk(m['cue'], m['kind'])
            if i is not None and 0 <= i < prev:
                problems.append(f"{s['id']}: {m['kind']} «{m['cue']}» comes before the moment listed above it")
            if i is not None:
                prev = max(prev, i)
            if m.get('until'):
                u = find(text, m['until'])
                if u < 0:
                    problems.append(f"{s['id']}: until «{m['until']}» is not in the narration ({m['kind']})")
                elif i is not None and i >= 0 and u <= i:
                    problems.append(f"{s['id']}: until «{m['until']}» is not after «{m['cue']}» ({m['kind']})")
            for k in SUBKEYS:
                if m.get(k):
                    chk(m[k], f"{m['kind']}.{k}", i)
            tc = m.get('textCue')
            for t in (tc if isinstance(tc, list) else [tc] if tc else []):
                chk(t, f"{m['kind']}.textCue", i)
            for coll in ('items', 'bubbles', 'fields', 'terms', 'bands'):
                for it in m.get(coll) or []:
                    for k in ('cue', 'subCue', 'noteCue'):
                        chk(it.get(k), f"{m['kind']}.{coll}.{k}", i)
            for side in ('a', 'b'):
                if isinstance(m.get(side), dict):
                    chk(m[side].get('cue'), f'versus.{side}', i)
                    chk(m[side].get('noteCue'), f'versus.{side}.noteCue', i)
            for k in ('ask', 'result'):
                if isinstance(m.get(k), dict):
                    chk(m[k].get('cue'), f"{m['kind']}.{k}", i)
    return problems


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    path = os.path.join(CHANNEL, '03-episodes', sys.argv[1], 'episode.json')
    episode = json.load(open(path, encoding='utf-8'))
    problems = check(episode)
    moments = sum(len(s.get('moments') or []) for s in episode['scenes'])
    if problems:
        print('\n'.join(problems))
        print(f'{len(problems)} problem(s) in {moments} moments')
        sys.exit(1)
    print(f'{sys.argv[1]}: all cues found, in order ({moments} moments, {len(episode["scenes"])} scenes)')


if __name__ == '__main__':
    main()
