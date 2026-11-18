"""Keep what the owner said beyond the script (framework v7 §3.21): add it to the narration, so it is captioned and can get
its own moment on screen.

The owner records from the script but talks more than it: a story of his own, an example, a joke, a second way of
saying a point. clean_recording.py keeps those words in the audio (it only drops retakes, repeats, stutters and what
audio/cuts.json names); this tool puts them into episode.json too:

    python3 channel/06-tools/clean_recording.py EP006 <recording>    first: clean, cut and transcribe each finished scene
    python3 channel/06-tools/adopt_extras.py EP006                    report only: what was said beyond the script
    python3 channel/06-tools/adopt_extras.py EP006 --write            add every passage of 3+ words to its scene's narration
    python3 channel/06-tools/clean_recording.py EP006 --marks         then: word marks for the new words too
    python3 channel/06-tools/check_cues.py EP006                      and the cues still in order

How: each scene's finished audio was transcribed (audio/work/<scene>.stt.json); its words are lined up with the script
(the same fuzzy alignment as the word marks). A run of heard words that matches no script word is something the owner
added. Runs of 3 words or more (`--min=N`) are inserted after the last script word said before them, as he said them
(the speech-to-text's spelling and punctuation; check the spelling once); shorter ones ("يعني", "طيب") are listed, not
added. Each insertion is also recorded in the scene's "added" list, with where it went, for the moment design.
Script words he skipped are listed too (check_cues.py shows the moments that lose their word).

Every added passage is read before the moments are designed: a new fact, number or name in it is checked like any
other (CLAUDE.md rule 1); one that can't be checked is cut in audio/cuts.json, with the owner's agreement, or said as
his own experience. His own stories need no source: they are his.
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from clean_recording import MARK, ROOT, align, heard_forms, norm, number_tails, spoken_words  # noqa: E402


def chunks(narration):
    """The narration's tokens (a {display|spoken} mark is one token) and, for each spoken word, the token it is in."""
    toks = re.findall(r'(?:\{[^{}]*\}|[^\s{}])+', narration)
    owner = []
    for t, tok in enumerate(toks):
        owner += [t] * len(MARK.sub(r'\2', tok).split())
    return toks, owner


def extras(scene, heard, min_words):
    """(added runs, short runs, skipped script words) for one scene."""
    said = spoken_words(scene['narration'])
    hit = align(said, heard, heard_forms(scene['narration']))
    matched = {j for j in hit if j is not None}
    runs, j = [], 0
    while j < len(heard):
        if j in matched or not norm(heard[j]['text']):
            j += 1
            continue
        k = j
        while k < len(heard) and k not in matched:
            k += 1
        # the last script word heard before this run: the passage goes right after it
        before = max((i for i, h in enumerate(hit) if h is not None and h < j), default=None)
        runs.append({'from': j, 'to': k, 'after': before, 'text': ' '.join(w['text'] for w in heard[j:k]),
                     'start': heard[j]['start'], 'words': sum(1 for w in heard[j:k] if norm(w['text']))})
        j = k
    long = [r for r in runs if r['words'] >= min_words]
    short = [r for r in runs if r['words'] < min_words]
    tails = number_tails(scene['narration'])  # «وخمسين» of {1955|…}: the speech-to-text wrote the number as one group of digits
    skipped = [said[i] for i, h in enumerate(hit) if h is None and norm(said[i]) and not tails[i]]
    return long, short, skipped


def insert(narration, runs):
    """The narration with each run inserted after its script word (or at the start)."""
    toks, owner = chunks(narration)
    after = {}
    for r in runs:
        at = -1 if r['after'] is None else owner[r['after']]
        after.setdefault(at, []).append(r['text'])
    out = list(after.get(-1, []))
    for t, tok in enumerate(toks):
        out.append(tok)
        out += after.get(t, [])
    return ' '.join(out)


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    episode_id = sys.argv[1]
    write = '--write' in sys.argv
    min_words = next((int(a.split('=')[1]) for a in sys.argv if a.startswith('--min=')), 3)
    ep_dir = os.path.join(ROOT, '03-episodes', episode_id)
    path = os.path.join(ep_dir, 'episode.json')
    episode = json.load(open(path, encoding='utf-8'))
    total = 0
    for scene in episode['scenes']:
        stt = os.path.join(ep_dir, 'audio', 'work', f"{scene['id']}.stt.json")
        if not scene.get('narration') or not os.path.exists(stt):
            continue
        heard = json.load(open(stt, encoding='utf-8'))
        long, short, skipped = extras(scene, heard, min_words)
        if not (long or short or skipped):
            continue
        print(f"== {scene['id']}")
        said = spoken_words(scene['narration'])
        for r in long:
            where = ' '.join(said[max(0, r['after'] - 3):r['after'] + 1]) if r['after'] is not None else '(the start)'
            print(f"  + {r['start']:6.1f}s after «{where}»: «{r['text']}»")
        if short:
            print('  · short, not added: ' + ' · '.join(f"«{r['text']}»" for r in short))
        if skipped:
            print('  - script words not heard: ' + ' · '.join(f'«{w}»' for w in skipped))
        if write and long:
            scene['narration'] = insert(scene['narration'], long)
            scene.setdefault('added', [])
            for r in long:
                scene['added'].append({'text': r['text'], 'after': ' '.join(said[max(0, r['after'] - 3):r['after'] + 1]) if r['after'] is not None else ''})
        total += len(long)
    if write and total:
        json.dump(episode, open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
        open(path, 'a', encoding='utf-8').write('\n')
        print(f'{total} passage(s) added to {os.path.relpath(path, ROOT)}: now run clean_recording.py {episode_id} --marks, '
              f'then design their moments')
    elif total:
        print(f'{total} passage(s) of {min_words}+ words beyond the script; --write adds them')
    else:
        print('nothing beyond the script')


if __name__ == '__main__':
    main()
