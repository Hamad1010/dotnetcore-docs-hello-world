"""Turn the owner's Recording Booth file into clean, studio-like scene audio, synced word by word.

    python3 channel/06-tools/clean_recording.py EP001 path/to/recording.m4a
    python3 channel/06-tools/clean_recording.py EP001 --marks     (only re-align the words, after a small text change)

1. Listens: transcribes the recording with word times (ElevenLabs speech-to-text. In a cloud session the key is
   the environment's network secret; on a computer, set ELEVENLABS_API_KEY).
2. Cuts it into the episode's scenes at the Booth's quiet countdowns (pauses of 2.5 s or more), or, when the owner
   reads straight through, where the script says each scene starts. Drops what the
   viewer shouldn't hear: a sentence said again after a "Mistake" pause, a word said twice by accident
   ("شغل، شغل"), a stutter ("كا-كانت"). Repetitions that are in the script ("ريال ريال") stay.
3. Tightens long pauses: up to 0.7 s after a question or a full stop, 0.45 s after a comma, 0.3 s mid-sentence.
4. Studio sound: high-pass, RNNoise noise removal, EQ (less boxiness, more presence and air), de-esser,
   compressor, a soft gate that quiets the room between phrases, then loudness -16 LUFS with true peak -1.5 dB (two-pass, so the voice keeps its dynamics).
5. Writes audio/<sceneId>.mp3 and audio/timings.json for the studio, with `marks`: when each word of the
   narration starts, so captions, subtitles and on-screen cues land on the word.

Everything stays in the git-ignored audio/ folder: the owner's voice is never committed.
"""
import json
import os
import re
import subprocess
import sys
import wave
from difflib import SequenceMatcher

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
PART_GAP = 2.5          # a pause this long is a Booth countdown (a new part) or a retake
PAUSE_CAP = {'end': 0.7, 'comma': 0.45, 'word': 0.3}
LEAD, TAIL = 0.12, 0.30  # breath room kept before the first and after the last word of a scene
RNNOISE_URL = 'https://raw.githubusercontent.com/GregorR/rnnoise-models/master/somnolent-hogwash-2018-09-01/sh.rnnn'
RNNOISE = os.path.expanduser('~/.cache/channel-studio/rnnoise-sh.rnnn')
CHAIN = ('highpass=f=75,{denoise}equalizer=f=220:t=q:w=1.0:g=-3,equalizer=f=3200:t=q:w=1.2:g=2.5,'
         'highshelf=f=9000:g=2,deesser=i=0.35,acompressor=threshold=-24dB:ratio=3:attack=8:release=180:makeup=4dB:knee=4,'
         'agate=threshold=-42dB:ratio=3:range=-18dB:attack=5:release=160:knee=6')  # the gate quiets the room in pauses
MARK = re.compile(r'\{([^|{}]*)\|([^{}]*)\}')
AR = str.maketrans({'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ى': 'ي', 'ة': 'ه', 'ؤ': 'و', 'ئ': 'ي'})


def norm(word):
    word = re.sub(r'[ً-ْـ]', '', word).translate(AR)
    return re.sub(r'[^\w]', '', word)


def spoken_words(narration):
    return re.sub(r'\s+', ' ', MARK.sub(r'\2', narration)).strip().split(' ')


def heard_forms(narration):
    """For each spoken word, the digits the speech-to-text may write instead: «ألفين» of {2009|ألفين وتسعة} → 2009."""
    forms = []
    for chunk in re.findall(r'(?:\{[^{}]*\}|[^\s{}])+', narration):
        n = len(MARK.sub(r'\2', chunk).split())
        forms += [MARK.sub(r'\1', chunk) if '{' in chunk else None] + [None] * (n - 1)
    return forms


def ffmpeg(*args):
    subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', *args], check=True)


def transcribe(path):
    """Word list [{text, start, end}] from ElevenLabs speech-to-text (Arabic, word timestamps)."""
    cmd = ['curl', '-sS', '--max-time', '900', '-X', 'POST', 'https://api.elevenlabs.io/v1/speech-to-text',
           '-F', 'model_id=scribe_v1', '-F', f'file=@{path}', '-F', 'language_code=ara',
           '-F', 'timestamps_granularity=word', '-F', 'tag_audio_events=false']
    if os.environ.get('ELEVENLABS_API_KEY'):
        cmd[1:1] = ['-H', f"xi-api-key: {os.environ['ELEVENLABS_API_KEY']}"]
    out = subprocess.run(cmd, capture_output=True, text=True, check=True).stdout
    data = json.loads(out)
    if 'words' not in data:
        sys.exit(f'speech-to-text failed: {out[:300]}')
    return [w for w in data['words'] if w.get('type') == 'word']


def read_wav(path):
    with wave.open(path) as w:
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768


def write_wav(path, x):
    with wave.open(path, 'w') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())


def split_parts(words, scenes):
    """Groups of words, one per scene. A long pause followed by words already said is a retake, not a new part.
    When the owner reads straight through (no Booth pauses between parts), the script says where each part starts."""
    groups, cur = [], [words[0]]
    for prev, nxt_i in zip(words, range(1, len(words))):
        nxt = words[nxt_i]
        if nxt['start'] - prev['end'] < PART_GAP:
            cur.append(nxt)
            continue
        ahead = [norm(w['text']) for w in words[nxt_i:nxt_i + 3]]
        back = [norm(w['text']) for w in cur[-30:]]
        hit = next((j for j in range(len(back) - 2) if back[j:j + 3] == ahead), None)
        if hit is not None:  # the owner said it again after a "Mistake" pause: keep only the second take
            del cur[len(cur) - len(back) + hit:]
            cur.append(nxt)
        else:
            groups.append(cur)
            cur = [nxt]
    groups.append(cur)

    def starts_right(group, scene):  # the part opens with (most of) its scene's first three words
        said = [norm(w) for w in spoken_words(scene['narration'])[:3]]
        return sum(same(a, norm(w['text'])) >= 0.6 for a, w in zip(said, group[:3])) >= 2

    if len(groups) == len(scenes) and all(starts_right(g, sc) for g, sc in zip(groups, scenes)):
        return groups
    flat = [w for g in groups for w in g]
    script, forms, first = [], [], []
    for scene in scenes:
        first.append(len(script))
        script += spoken_words(scene['narration'])
        forms += heard_forms(scene['narration'])
    first.append(len(script))
    hit = align(script, flat, forms)
    cuts = []
    for k in range(1, len(scenes)):
        before = [j for j in hit[first[k - 1]:first[k]] if j is not None]
        after = [j for j in hit[first[k]:first[k + 1]] if j is not None]
        if not before or not after:
            sys.exit(f"couldn't find where «{scenes[k]['id']}» starts in the recording")
        lo, hi = max(before), min(after)
        # cut at the longest pause between this part's last word and the next part's first word
        cuts.append(max(range(lo + 1, hi + 1), key=lambda j: flat[j]['start'] - flat[j - 1]['end']) if hi > lo else hi)
    print(f'  {len(groups)} pause-separated part(s) for {len(scenes)} scenes: split where the script says each scene starts')
    bounds = [0, *cuts, len(flat)]
    return [flat[a:b] for a, b in zip(bounds, bounds[1:])]


def plan_cuts(group, narration, x):
    """Kept spans [(start, end)] in seconds for one scene, and a list of what was removed."""
    script_text = ' ' + ' '.join(norm(w) for w in spoken_words(narration)) + ' '
    keep, removed = list(group), []
    # A word (or 2-3 words) said twice by accident, not doubled in the script: drop the first one.
    for n in (3, 2, 1):
        i = 0
        while i + 2 * n <= len(keep):
            a = [norm(w['text']) for w in keep[i:i + n]]
            if a == [norm(w['text']) for w in keep[i + n:i + 2 * n]] and f" {' '.join(a + a)} " not in script_text:
                removed.append(('repeat', keep[i]['start'], ' '.join(w['text'] for w in keep[i:i + n])))
                del keep[i:i + n]
            else:
                i += 1
    kept = {id(w) for w in keep}
    # Each kept word, with the stretch of audio removed just before it (dropped words, or the first half of a stutter).
    items, pending = [], None
    for w in group:
        if id(w) not in kept:
            pending = [w['start'], w['end']] if pending is None else [pending[0], w['end']]
            continue
        start, cut = w['start'], pending
        m = re.match(r'^([^-]+)-(.+)$', w['text'])
        if m and norm(m.group(2)).startswith(norm(m.group(1))):  # a stutter: restart at the quietest point of its first half
            lo, hi, hop = int(w['start'] * SR), int((w['start'] + 0.6 * (w['end'] - w['start'])) * SR), int(0.01 * SR)
            rms = [np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(lo, hi - hop, hop)]
            if rms:
                start = (lo + int(np.argmin(rms)) * hop) / SR
                cut = [w['start'] if cut is None else cut[0], start]
                removed.append(('stutter', w['start'], w['text']))
        items.append({'start': start, 'end': w['end'], 'text': w['text'], 'cut': cut})
        pending = None
    first = items[0]
    spans = [[first['start'] if first['cut'] else first['start'] - LEAD, first['end']]]
    for prev, cur in zip(items, items[1:]):
        tail = prev['text'][-1:]
        cap = PAUSE_CAP['end'] if tail in '؟?.!' else PAUSE_CAP['comma'] if tail in '،,:؛' else PAUSE_CAP['word']
        if cur['cut']:
            r0, r1 = cur['cut']
            before, after = min(cap / 2, max(0.0, r0 - prev['end'])), min(cap / 2, max(0.0, cur['start'] - r1))
            spans[-1][1] = prev['end'] + before
            spans.append([cur['start'] - after, cur['end']])
            continue
        gap = cur['start'] - prev['end']
        if gap > cap:
            spans[-1][1] = prev['end'] + cap / 2
            spans.append([cur['start'] - cap / 2, cur['end']])
            removed.append(('pause', prev['end'], round(gap - cap, 2)))
        else:
            spans[-1][1] = cur['end']
    spans[-1][1] += TAIL
    return spans, removed


def assemble(x, spans):
    fade = int(0.008 * SR)
    ramp = np.linspace(0, 1, fade, dtype=np.float32)
    pieces = []
    for a, b in spans:
        seg = x[max(0, int(a * SR)):min(len(x), int(b * SR))].copy()
        if len(seg) > 2 * fade:
            seg[:fade] *= ramp
            seg[-fade:] *= ramp[::-1]
        pieces.append(seg)
    return np.concatenate(pieces)


def loudnorm(src, dst):
    probe = subprocess.run(['ffmpeg', '-hide_banner', '-i', src, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=7:print_format=json',
                            '-f', 'null', '-'], capture_output=True, text=True).stderr
    m = json.loads(probe[probe.rindex('{'):probe.rindex('}') + 1])
    ffmpeg('-i', src, '-af', f"loudnorm=I=-16:TP=-1.5:LRA=7:linear=true:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
           f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}", '-ar', str(SR),
           '-c:a', 'libmp3lame', '-b:a', '192k', dst)


# Names the speech-to-text may write in Latin letters, so they still match the Arabic script.
LATIN = {'whatsapp': 'واتساب', 'facebook': 'فيسبوك', 'instagram': 'انستغرام', 'yahoo': 'ياهو', 'google': 'قوقل',
         'microsoft': 'مايكروسوفت', 'windows': 'ويندوز', 'uber': 'اوبر', 'twitter': 'تويتر', 'linkedin': 'لينكدان'}


def same(a, b):
    """How alike two normalised words are (0-1): spelling differences such as تسعطعش / تسعطعشر still match."""
    a, b = LATIN.get(a.lower(), a), LATIN.get(b.lower(), b)
    return 1.0 if a == b else SequenceMatcher(None, a, b).ratio()


def align(script, words, forms=None):
    """For each script word, the index of the heard word it matches (fuzzy Needleman-Wunsch, in order), or None.
    `forms` are other ways a word may be heard (digits for a number)."""
    a, b = [norm(w) for w in script], [norm(w['text']) for w in words]
    alt = [norm(f) if f else None for f in (forms or [None] * len(a))]
    n, m = len(a), len(b)
    # a similar word pair scores up to +2, a skipped word -0.6
    score = [[0.0] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        score[i][0] = -0.6 * i
    for j in range(1, m + 1):
        score[0][j] = -0.6 * j
    sims = [[max(same(a[i], b[j]), same(alt[i], b[j]) if alt[i] else 0.0) for j in range(m)] for i in range(n)]
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            sim = sims[i - 1][j - 1]
            score[i][j] = max(score[i - 1][j - 1] + (2 * sim if sim >= 0.6 else -1), score[i - 1][j] - 0.6, score[i][j - 1] - 0.6)
    hit, i, j = [None] * n, n, m
    while i > 0 and j > 0:
        sim = sims[i - 1][j - 1]
        if sim >= 0.6 and abs(score[i][j] - (score[i - 1][j - 1] + 2 * sim)) < 1e-9:
            hit[i - 1] = j - 1
            i, j = i - 1, j - 1
        elif abs(score[i][j] - (score[i - 1][j] - 0.6)) < 1e-9:
            i -= 1
        else:
            j -= 1
    return hit


def marks_for(narration, words, duration):
    """Seconds at which each spoken word of the narration starts, aligned to what was heard."""
    hit = align(spoken_words(narration), words, heard_forms(narration))
    n = len(hit)
    times = [None if j is None else words[j]['start'] for j in hit]
    known = [k for k, t in enumerate(times) if t is not None]
    if not known:
        return [round(duration * k / n, 3) for k in range(n)]
    for k in range(n):
        if times[k] is None:
            lo = max((q for q in known if q < k), default=None)
            hi = min((q for q in known if q > k), default=None)
            if lo is None:
                times[k] = max(0.0, times[hi] - 0.35 * (hi - k))
            elif hi is None:
                times[k] = min(duration, times[lo] + 0.35 * (k - lo))
            else:
                times[k] = times[lo] + (times[hi] - times[lo]) * (k - lo) / (hi - lo)
    return [round(t, 3) for t in times]


def remark(episode_id):
    """Recompute only the word marks from the saved transcripts (after a small change to a scene's narration)."""
    ep_dir = os.path.join(ROOT, '03-episodes', episode_id)
    audio = os.path.join(ep_dir, 'audio')
    timings = json.load(open(os.path.join(audio, 'timings.json')))
    for scene in json.load(open(os.path.join(ep_dir, 'episode.json'), encoding='utf-8'))['scenes']:
        stt = os.path.join(audio, 'work', f"{scene['id']}.stt.json")
        if scene['id'] in timings and os.path.exists(stt):
            t = timings[scene['id']]
            t['marks'] = marks_for(scene['narration'], json.load(open(stt)), t['duration'])
    json.dump(timings, open(os.path.join(audio, 'timings.json'), 'w'), indent=2)
    print('marks updated')


def main():
    if len(sys.argv) == 3 and sys.argv[2] == '--marks':
        return remark(sys.argv[1])
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    episode_id, recording = sys.argv[1], sys.argv[2]
    ep_dir = os.path.join(ROOT, '03-episodes', episode_id)
    audio = os.path.join(ep_dir, 'audio')
    work = os.path.join(audio, 'work')
    os.makedirs(work, exist_ok=True)
    scenes = json.load(open(os.path.join(ep_dir, 'episode.json'), encoding='utf-8'))['scenes']
    scenes = [s for s in scenes if s.get('narration')]

    raw = os.path.join(work, 'raw.wav')
    ffmpeg('-i', recording, '-ac', '1', '-ar', str(SR), '-c:a', 'pcm_s16le', raw)
    stt_cache = os.path.join(work, 'stt.json')
    if os.path.exists(stt_cache) and json.load(open(stt_cache)).get('source') == os.path.abspath(recording):
        words = json.load(open(stt_cache))['words']
    else:
        print('listening (speech-to-text)…')
        words = transcribe(recording)
        json.dump({'source': os.path.abspath(recording), 'words': words}, open(stt_cache, 'w'), ensure_ascii=False)

    if not os.path.exists(RNNOISE):
        os.makedirs(os.path.dirname(RNNOISE), exist_ok=True)
        subprocess.run(['curl', '-sSfL', '--max-time', '120', RNNOISE_URL, '-o', RNNOISE], check=False)
    denoise = f'arnndn=m={RNNOISE}:mix=0.92,' if os.path.exists(RNNOISE) else 'afftdn=nr=12:nf=-44:tn=1,'
    studio = os.path.join(work, 'studio.wav')
    ffmpeg('-i', raw, '-af', CHAIN.format(denoise=denoise), '-ar', str(SR), '-c:a', 'pcm_s16le', studio)
    x = read_wav(studio)

    timings, report = {}, []
    for scene, group in zip(scenes, split_parts(words, scenes)):
        spans, removed = plan_cuts(group, scene['narration'], x)
        part = os.path.join(work, f"{scene['id']}.wav")
        write_wav(part, assemble(x, spans))
        final = os.path.join(audio, f"{scene['id']}.mp3")
        loudnorm(part, final)
        dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', final],
                                   capture_output=True, text=True).stdout)
        heard = transcribe(final)
        json.dump(heard, open(os.path.join(work, f"{scene['id']}.stt.json"), 'w'), ensure_ascii=False)
        timings[scene['id']] = {'duration': round(dur, 3), 'file': f"{scene['id']}.mp3", 'marks': marks_for(scene['narration'], heard, dur)}
        raw_span = group[-1]['end'] - group[0]['start']
        pauses = [r for r in removed if r[0] == 'pause']
        report.append(f"{scene['id']}: {raw_span:.1f}s spoken → {dur:.1f}s · {len(pauses)} long pauses tightened "
                      f"(-{sum(r[2] for r in pauses):.1f}s)" + ''.join(f" · removed {r[0]} «{r[2]}» at {r[1]:.1f}s" for r in removed if r[0] != 'pause'))
    json.dump(timings, open(os.path.join(audio, 'timings.json'), 'w'), indent=2)
    print('\n'.join(report))
    total = sum(t['duration'] for t in timings.values())
    chars = sum(len(' '.join(spoken_words(s['narration']))) for s in scenes)
    print(f'total {total:.1f}s of voice · pace {chars / total:.1f} spoken characters per second')


if __name__ == '__main__':
    main()
