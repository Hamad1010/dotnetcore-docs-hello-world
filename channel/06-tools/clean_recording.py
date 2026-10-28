"""Turn the owner's Recording Booth file into clean, studio-like scene audio, synced word by word.

    python3 channel/06-tools/clean_recording.py EP001 path/to/recording.m4a
    python3 channel/06-tools/clean_recording.py EP001 path/to/recording.m4a --isolate   (ElevenLabs Voice Isolator first)
    python3 channel/06-tools/clean_recording.py EP001 --marks     (only re-align the words, after a small text change)
    … --reuse-stt     a re-run after a change to the sound only: scenes of the same length keep their transcripts (no cost)

1. Listens: transcribes the recording with word times (ElevenLabs speech-to-text. In a cloud session the key is
   the environment's network secret; on a computer, set ELEVENLABS_API_KEY).
2. Cuts it into the episode's scenes at the Booth's quiet countdowns (pauses of 2.5 s or more), or, when the owner
   reads straight through, where the script says each scene starts. Drops what the
   viewer shouldn't hear: a sentence said again after a "Mistake" pause, a word said twice by accident
   ("شغل، شغل"), a stutter ("كا-كانت"). Repetitions that are in the script ("ريال ريال") stay.
3. Tightens long pauses: up to 0.7 s after a question or a full stop, 0.45 s after a comma, 0.3 s mid-sentence.
   Breaths go too (EP003, the owner's request): between two words everything is made silent (inhalations, lip clicks,
   the room) except each word's own sound: its voice and what belongs to it (a final س ف ه going on, a stop's release,
   a س ش ص or ف ح خ ه leading into the next word); YAMNet listens to each stretch first, and one that sounds like
   speech stays and is reported. `--keep-breaths` turns this off.
4. Studio sound (framework v5 §3.17, tuned on EP001's recording): a steep high-pass at 90 Hz, RNNoise noise removal,
   EQ (the boom at 110 Hz and the boxiness at 450 Hz down, presence at 3.5 kHz and air up), de-esser, compressor, a
   gate that makes the pauses silent, then loudness -16 LUFS with true peak -1.5 dB (two-pass, so the voice keeps its
   dynamics). `--isolate` first sends the recording to ElevenLabs' Voice Isolator (about 1,000 credits a minute of
   audio) for a noisy or echoing room; RNNoise is then skipped.
5. Writes audio/<sceneId>.mp3 and audio/timings.json for the studio, with `marks`: when each word of the
   narration starts, so captions, subtitles and on-screen cues land on the word.

Mistakes the rules can't see (a slip like "من نفس الشركة", a half sentence said again later) go in
audio/cuts.json after listening to the report: {"<scene id>": ["words to cut", {"find": "اشتغل في إحدى", "cut": "في"}]}.
A word said wrong is replaced by the same word said right elsewhere in the recording, crossfaded in:
{"find": "أكثر من مليون مليار", "replace": "مليون", "with": "ثلاثين", "from": "أكثر من ثلاثين مليون"}.
A word cut off mid-way ("وقب-", "سو--") is always dropped.

6. Checks: each finished scene is transcribed again; the report lists any script word that can't be heard any more
   (a clipped word, a cut too far) next to the words the owner said differently from the script.

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
LEAD, TAIL = 0.12, 0.30  # room kept before the first and after the last word of a scene
# Breaths: the speech-to-text word edges are right to about ±30–60 ms (checked on spectrograms of EP003), so a guard of
# 60 ms before a word and 80 ms after it stays untouched; the rest of a pause goes down to -40 dB with 12 ms fades.
BREATH_PRE, BREATH_POST, BREATH_FLOOR, BREATH_FADE = 0.06, 0.08, 0.01, 0.012
# The speech-to-text often stretches a word's end over the pause after it, and a breath can hide there: when the voice
# stops early inside the word, 0.18 s after it is kept (a final consonant) and the silence starts there.
BREATH_KEEP = 0.18
# What belongs to a word around its voice (EP003, checked on spectrograms): after it, a last letter that carries on
# (ف ه ة ر…) while it does, a س ش ص hissing on, a stop's release after its closure (the owner's final ت hisses for up
# to 0.15 s); before it, its س ش ص, its ف ح خ ه, its voice starting early. A hiss has its energy above 4 kHz and little
# under 2.5 kHz; a breath is the other way round (and a lip click is short, so it is not let through by a letter).
CARRY_END = set('سشصفثحخهةزذظر') | set('sfhzx')
SIBILANT = set('سشصز') | set('szx')
STOP = set('تطدضكقبجءأ') | set('tdkgbp')
BREATHY_START = set('ثفحخه') | set('fh')
RNNOISE_URL = 'https://raw.githubusercontent.com/GregorR/rnnoise-models/master/somnolent-hogwash-2018-09-01/sh.rnnn'
RNNOISE = os.path.expanduser('~/.cache/channel-studio/rnnoise-sh.rnnn')
# v5 (24 Oct 2026): measured on EP001's recording the voice had ~5 dB too much at 80–150 Hz and ~5 dB too little at
# 2.5–5 kHz, and the room was audible in the pauses; this chain fixes both (EP001 used: high-pass 75 Hz, -3 dB at 220 Hz,
# +2.5 dB at 3.2 kHz, +2 dB above 9 kHz, gate range -18 dB).
CHAIN = ('highpass=f=90:poles=2,highpass=f=90:poles=2,{denoise}'
         'equalizer=f=110:t=q:w=1.0:g=-5,equalizer=f=250:t=q:w=1.0:g=-1.5,equalizer=f=450:t=q:w=1.2:g=-2.5,'
         'equalizer=f=3500:t=q:w=1.0:g=4,highshelf=f=9500:g=2.5,deesser=i=0.45,'
         'acompressor=threshold=-24dB:ratio=3:attack=6:release=150:makeup=4dB:knee=4,'
         'agate=threshold=-42dB:ratio=4:range=-26dB:attack=4:release=180:knee=6')  # the gate makes the pauses silent
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


def number_tails(narration):
    """For each spoken word: is it the second or a later word of a number said in words («وتسعة» in {2009|ألفين وتسعة})?
    The speech-to-text writes such a number as one group of digits, so those words have nothing to match."""
    out = []
    for chunk in re.findall(r'(?:\{[^{}]*\}|[^\s{}])+', narration):
        n = len(MARK.sub(r'\2', chunk).split())
        out += [False] + [('{' in chunk)] * (n - 1)
    return out


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


def isolate(path, out):
    """The voice alone, from ElevenLabs' Voice Isolator (noise and room echo removed); an mp3 aligned with the input."""
    cmd = ['curl', '-sS', '--max-time', '1800', '-X', 'POST', 'https://api.elevenlabs.io/v1/audio-isolation',
           '-F', f'audio=@{path}', '-o', out, '-w', '%{http_code}']
    if os.environ.get('ELEVENLABS_API_KEY'):
        cmd[1:1] = ['-H', f"xi-api-key: {os.environ['ELEVENLABS_API_KEY']}"]
    code = subprocess.run(cmd, capture_output=True, text=True, check=True).stdout.strip()
    if code != '200':
        sys.exit(f'voice isolator failed ({code}): {open(out, errors="replace").read(300)}')


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


def find_words(words, phrase):
    """Index of the first word of `phrase` in a list of heard words (spelling may differ a little), or None."""
    fw = [norm(t) for t in phrase.split()]
    return next((i for i in range(len(words) - len(fw) + 1)
                 if all(same(fw[k], norm(words[i + k]['text'])) >= 0.75 for k in range(len(fw)))), None)


def plan_cuts(group, narration, x, cuts=(), heard=()):
    """Kept spans [(start, end[, crossfade])] in seconds for one scene, what was removed, and the kept words."""
    said = [norm(w) for w in spoken_words(narration)]

    def in_script(seq):  # the phrase is in the script (spelling may differ a little: وحدة / واحدة)
        return any(all(same(said[i + k], seq[k]) >= 0.75 for k in range(len(seq))) for i in range(len(said) - len(seq) + 1))

    keep, removed = list(group), []
    # A word cut off half-way ("وقب-", "سو--"): the owner stopped and said it again.
    for w in [w for w in keep if re.search(r'[-–—]+$', w['text'].rstrip('،,.؟?!:'))]:
        removed.append(('false start', w['start'], w['text']))
        keep.remove(w)
    # A word said wrong, replaced by the same word said right elsewhere (audio/cuts.json "replace"/"with"/"from").
    patches = {}
    for c in [c for c in cuts if isinstance(c, dict) and 'replace' in c]:
        at, src = find_words(keep, c['find']), find_words(heard, c['from'])
        if at is None or src is None:
            print(f"  ! patch not found: «{c['find'] if at is None else c['from']}»")
            continue
        t = keep[at + [norm(w) for w in c['find'].split()].index(norm(c['replace']))]
        s = src + [norm(w) for w in c['from'].split()].index(norm(c['with']))
        g = group.index(t)
        # cut both words at the middle of the short gaps around them, so the joins fall between words
        patches[id(t)] = {'src': ((heard[s - 1]['end'] + heard[s]['start']) / 2, (heard[s]['end'] + heard[s + 1]['start']) / 2),
                          'cuts': ((group[g - 1]['end'] + t['start']) / 2, (t['end'] + group[g + 1]['start']) / 2)}
        removed.append(('patch', t['start'], f"{t['text']} → {heard[s]['text']} from {heard[s]['start']:.1f}s"))
    cuts = [c for c in cuts if not (isinstance(c, dict) and 'replace' in c)]
    # Cuts chosen after listening (audio/cuts.json): find the words in what was heard, drop the `cut` part.
    for c in cuts:
        find, cut = (c['find'], c['cut']) if isinstance(c, dict) else (c, c)
        fw, cw = [norm(t) for t in find.split()], [norm(t) for t in cut.split()]
        off = next((o for o in range(len(fw) - len(cw) + 1) if fw[o:o + len(cw)] == cw), 0)
        at = next((i for i in range(len(keep) - len(fw) + 1) if all(same(fw[k], norm(keep[i + k]['text'])) >= 0.75 for k in range(len(fw)))), None)
        if at is None:
            print(f'  ! cut not found: «{find}»')
            continue
        removed.append(('cut', keep[at + off]['start'], ' '.join(w['text'] for w in keep[at + off:at + off + len(cw)])))
        del keep[at + off:at + off + len(cw)]
    # A word (or 2-3 words) said twice by accident, not doubled in the script: drop the first one.
    for n in (3, 2, 1):
        i = 0
        while i + 2 * n <= len(keep):
            a = [norm(w['text']) for w in keep[i:i + n]]
            if a == [norm(w['text']) for w in keep[i + n:i + 2 * n]] and not in_script(a + a):
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
        items.append({'start': start, 'end': w['end'], 'text': w['text'], 'cut': cut, **patches.get(id(w), {})})
        pending = None
    first = items[0]
    spans = [[first['start'] if first['cut'] else first['start'] - LEAD, first['end']]]
    for prev, cur in zip(items, items[1:]):
        tail = prev['text'][-1:]
        cap = PAUSE_CAP['end'] if tail in '؟?.!' else PAUSE_CAP['comma'] if tail in '،,:؛' else PAUSE_CAP['word']
        if cur.get('src'):  # the replacement word, crossfaded in, then the line goes on after the wrong word
            spans[-1][1] = max(spans[-1][0], min(cur['cuts'][0], prev['end'] + cap / 2))
            spans += [[*cur['src'], True], [cur['cuts'][1], cur['cuts'][1], True]]
            continue
        if cur['cut']:
            r0, r1 = cur['cut']
            before, after = min(cap / 2, max(0.0, r0 - prev['end'])), min(cap / 2, max(0.0, cur['start'] - r1))
            spans[-1][1] = prev['end'] + before
            spans.append([cur['start'] - after, cur['end']])
            continue
        gap = cur['start'] - prev['end']
        if gap > cap:
            spans[-1][1] = max(spans[-1][0], prev['end'] + cap / 2)
            spans.append([cur['start'] - cap / 2, cur['end']])
            removed.append(('pause', prev['end'], round(gap - cap, 2)))
        else:
            spans[-1][1] = cur['end']
    spans[-1][1] += TAIL
    return spans, removed, items


def assemble(x, spans, quiet=()):
    """The kept spans one after another. A cut sits in a pause: 8 ms fades. A span marked True joins mid-line (a
    replacement word): a 10 ms equal-power crossfade with the piece before it. `quiet`: this scene's breaths, silenced
    (only in this scene's audio: its tail may run into the next scene's first word, which must stay whole there)."""
    fade, h = int(0.008 * SR), int(0.005 * SR)
    ramp = np.linspace(0, 1, fade, dtype=np.float32)
    rise = np.sin(np.linspace(0, np.pi / 2, 2 * h, dtype=np.float32))
    y = np.zeros(0, dtype=np.float32)
    for k, (a, b, *flag) in enumerate(spans):
        join_in = bool(flag and flag[0]) and len(y) >= 2 * h
        join_out = k + 1 < len(spans) and len(spans[k + 1]) > 2 and spans[k + 1][2]
        i = max(0, int(a * SR) - (h if join_in else 0))
        seg = x[i:min(len(x), int(b * SR) + (h if join_out else 0))].copy()
        g = np.ones(len(seg), dtype=np.float32)
        for qa, qb in quiet:
            duck(g, qa, qb, i)
        seg *= g
        if len(seg) > 2 * fade and not join_in:
            seg[:fade] *= ramp
        if len(seg) > 2 * fade and not join_out:
            seg[-fade:] *= ramp[::-1]
        if join_in and len(seg) >= 2 * h:
            y[-2 * h:] = y[-2 * h:] * rise[::-1] + seg[:2 * h] * rise
            seg = seg[2 * h:]
        y = np.concatenate([y, seg])
    return y


def voicing(x, times):
    """For each time t, is the voice vibrating in the 30 ms from t (a vowel, م ن ل و ي…, not a breath or س ش ف)?
    The autocorrelation peak at a pitch of 70–400 Hz, corrected for the window, above 0.45 on a frame loud enough."""
    n, lo, hi = int(0.03 * SR), int(SR / 400), int(SR / 70)
    w = np.hanning(n).astype(np.float32)
    idx = np.clip((np.asarray(times) * SR).astype(int), 0, len(x) - n)
    frames = x[idx[:, None] + np.arange(n)] * w
    r = np.fft.irfft(np.abs(np.fft.rfft(frames, 2 * n, axis=1)) ** 2, axis=1)[:, :hi + 1]
    rw = np.fft.irfft(np.abs(np.fft.rfft(w, 2 * n)) ** 2)[:hi + 1]
    peak = ((r[:, lo:] / (r[:, :1] + 1e-12)) / (rw[lo:] / rw[0])).max(1)
    return (peak > 0.45) & (np.sqrt((frames ** 2).mean(1)) > 10 ** (-50 / 20))


def sounds(x, times):
    """For each time, in the 30 ms from it: voiced (as voicing()), loud enough to hear (-50 dB), a hiss (above)."""
    n, lo, hi = int(0.03 * SR), int(SR / 400), int(SR / 70)
    w = np.hanning(n).astype(np.float32)
    idx = np.clip((np.asarray(times) * SR).astype(int), 0, len(x) - n)
    frames = x[idx[:, None] + np.arange(n)] * w
    spec = np.abs(np.fft.rfft(frames, 2 * n, axis=1)) ** 2
    r = np.fft.irfft(spec, axis=1)[:, :hi + 1]
    rw = np.fft.irfft(np.abs(np.fft.rfft(w, 2 * n)) ** 2)[:hi + 1]
    peak = ((r[:, lo:] / (r[:, :1] + 1e-12)) / (rw[lo:] / rw[0])).max(1)
    sound = np.sqrt((frames ** 2).mean(1)) > 10 ** (-50 / 20)
    f = np.fft.rfftfreq(2 * n, 1 / SR)
    total = spec[:, (f >= 300) & (f < 12000)].sum(1) + 1e-12
    hiss = (spec[:, f >= 4000].sum(1) / total >= 0.3) & (spec[:, (f >= 300) & (f < 2500)].sum(1) / total <= 0.2)
    return (peak > 0.45) & sound, sound, hiss & sound


def steady(v, n=3):
    """Only the voiced frames in runs of n or more: a breath can have a frame or two that look voiced."""
    edges = np.diff(np.concatenate([[0], v.astype(int), [0]]))
    out = np.zeros(len(v), bool)
    for s, e in zip(np.nonzero(edges == 1)[0], np.nonzero(edges == -1)[0]):
        if e - s >= n:
            out[s:e] = True
    return out


def letter(text, last):
    t = [c for c in text if c.isalnum()]
    return t[-1 if last else 0].lower() if t else ''


def word_end(x, w):
    """(where the word's voice stops, where its own sound after it stops, whether the voice runs past the transcript's
    end), or None when it has no steady voice to go by."""
    ts = np.arange(w['start'], w['end'] + 0.25, 0.01)
    v = steady(sounds(x, ts)[0])
    k = min(len(ts) - 1, int(round((w['end'] - w['start']) / 0.01)))
    past = bool(v[k])
    if past:
        k += int(np.argmin(v[k:])) if not v[k:].all() else len(v) - k
    elif v[:k].any():
        k = int(np.nonzero(v[:k])[0][-1]) + 1
    else:
        return None
    t0 = ts[k - 1] + 0.03
    tt = t0 + np.arange(0, 0.35, 0.01)
    _, sound, hiss = sounds(x, tt)
    ch = letter(w['text'], True)
    carry, sib, stop = ch in CARRY_END, ch in SIBILANT, ch in STOP
    end, released = t0, False
    for i, t in enumerate(tt):
        if hiss[i] and (sib or stop) and t < end + 0.02:      # a final س ش ص hissing on, a stop's hissed release
            end = t + 0.03
        elif hiss[i] and stop and not released and t < t0 + 0.15:  # that release, after the stop's closure
            end, released = t + 0.03, True
        elif carry and sound[i] and t < end + 0.02:            # a last letter that carries on, while it does
            end = t + 0.03
        elif t >= end + 0.15:
            break
    return t0, end, past


def word_start(x, w, limit):
    """Where the silence before a word must end: a guard before the transcript's start or the voice just before it,
    and earlier while the word's own voice, its س ش ص or its ف ث ح خ ه lead into it unbroken (not before `limit`)."""
    v = voicing(x, w['start'] - 0.03 - np.arange(25) * 0.01)
    b = min(w['start'] - BREATH_PRE, w['start'] - 0.01 * int(np.argmin(v) if not v.all() else 25) - 0.05)
    ts = np.arange(max(limit, w['start'] - 0.45), w['end'], 0.01)
    if len(ts) < 4:
        return b
    v, sound, hiss = sounds(x, ts)
    v = steady(v)
    first = np.nonzero(v & (ts >= w['start'] - 0.1))[0]
    if not len(first):
        return b
    first = int(first[0])
    start = ts[first]
    ch = letter(w['text'], False)
    sib, breathy = ch in SIBILANT, ch in SIBILANT or ch in BREATHY_START
    for j in range(first - 1, -1, -1):
        if ts[j] + 0.03 < start - 0.02:                          # a gap: what is before it is not this word's
            break
        if sib and hiss[j] and ts[j] >= ts[first] - 0.35:
            start = ts[j]
        elif (v[j] or (breathy and sound[j])) and ts[j] >= ts[first] - 0.15:
            start = ts[j]
    return min(b, start - 0.03)


def breath_gaps(x, items, lo, hi):
    """The stretches of one scene to make silent: from where each word's own sound ends to where the next one's starts
    (and before the first word, after the last). Around a word: its voice (steady: a breath can have a voiced frame),
    then what belongs to it (word_end, word_start), and at least a guard after the transcript's end or after the voice
    when that stopped early inside the word (a breath can hide in a stretched word end)."""
    out = []
    for prev, cur in [(None, items[0]), *zip(items, items[1:]), (items[-1], None)]:
        if (prev and prev.get('src')) or (cur and cur.get('src')):
            continue  # around a replacement word the joins are crossfades: leave them alone
        a = lo if prev is None else prev['end'] + BREATH_POST
        b = hi if cur is None else word_start(x, cur, prev['end'] if prev else lo)
        if prev is not None:
            end = word_end(x, prev)
            if end is not None:
                t0, own, past = end
                if past:   # the voice goes on past the transcript's end: keep it, and what follows it
                    a = max(a, own, t0 + 0.01)
                else:      # the voice stopped inside the word: a final consonant's worth after it, or its own sound
                    a = max(min(a, max(t0 + BREATH_KEEP, prev['start'] + 0.1)), own)
        if b - a >= 0.05:
            out.append((a, b))
    return out


class SpeechCheck:
    """YAMNet (06-tools/listen_check.py): how much a stretch of the recording sounds like speech (0–1)."""

    def __init__(self, x):
        try:
            import listen_check
            self.it, labels = listen_check.model()
        except Exception as e:  # noqa: BLE001 (the check is optional: without it every pause is silenced)
            print(f'  (no speech check: {e})')
            self.it = None
            return
        self.speech = labels.index('Speech')
        self.inp, self.out = self.it.get_input_details()[0]['index'], self.it.get_output_details()[0]['index']
        self.x16 = x[::3].astype(np.float32)  # 48 → 16 kHz: enough to tell speech from breath

    def __call__(self, a, b):
        if self.it is None:
            return 0.0
        seg = self.x16[int(a * 16000):int(b * 16000)][:15600]
        pad = np.zeros(15600, dtype=np.float32)
        pad[(15600 - len(seg)) // 2:(15600 - len(seg)) // 2 + len(seg)] = seg
        self.it.set_tensor(self.inp, pad)
        self.it.invoke()
        return float(self.it.get_tensor(self.out)[0][self.speech])


def duck(g, a, b, start=0):
    """Gain down to BREATH_FLOOR between a and b seconds, with cosine fades inside the stretch; g[0] is sample `start`."""
    i, j, f = int(a * SR), int(b * SR), int(BREATH_FADE * SR)
    if j - i < 2 * f or j <= start or i >= start + len(g):
        return
    t = np.arange(max(i, start), min(j, start + len(g)))
    ramp = np.minimum(np.minimum(t - i, j - t) / f, 1.0)  # 0 at the edges of the stretch, 1 inside it
    g[t - start] = np.minimum(g[t - start], 1 - (1 - BREATH_FLOOR) * (1 - np.cos(np.pi * ramp)) / 2)


def loudnorm(src, dst):
    probe = subprocess.run(['ffmpeg', '-hide_banner', '-i', src, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=7:print_format=json',
                            '-f', 'null', '-'], capture_output=True, text=True).stderr
    m = json.loads(probe[probe.rindex('{'):probe.rindex('}') + 1])
    with wave.open(src) as w:
        short = w.getnframes() / w.getframerate() < 8
    if short:  # a line of a few seconds: loudnorm can't settle (EP003's 2.4 s walk2 stayed 3.5 dB quiet), so a gain + limiter
        af = f"volume={-16 - float(m['input_i']):.2f}dB,alimiter=limit={10 ** (-2 / 20):.4f}:attack=5:release=50:level=false:latency=true"
    else:
        af = (f"loudnorm=I=-16:TP=-1.5:LRA=7:linear=true:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
              f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}")
    ffmpeg('-i', src, '-af', af, '-ar', str(SR), '-c:a', 'libmp3lame', '-b:a', '192k', dst)


# Names the speech-to-text may write in Latin letters, so they still match the Arabic script.
LATIN = {'whatsapp': 'واتساب', 'facebook': 'فيسبوك', 'instagram': 'انستغرام', 'yahoo': 'ياهو', 'google': 'قوقل',
         'microsoft': 'مايكروسوفت', 'windows': 'ويندوز', 'uber': 'اوبر', 'twitter': 'تويتر', 'linkedin': 'لينكدان',
         'brian': 'براين', 'jan': 'يان', 'koum': 'كوم', 'forbes': 'فوربس', 'menu': 'منيو', 'kodak': 'كوداك',
         'cash': 'كاش', 'volvo': 'فولفو', 'ipad': 'ايباد', 'foodics': 'فودكس', 'plus': 'بلس', 'volkswagen': 'فولكس',
         'careem': 'كريم', 'captain': 'كابتن', 'cashier': 'كاشير', 'cafe': 'كافيه', 'café': 'كافيه', '100': 'ميه'}


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
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if len(args) == 1 and '--marks' in sys.argv:
        return remark(args[0])
    if len(args) < 2:
        sys.exit(__doc__)
    episode_id, recording = args[0], args[1]
    use_isolator = '--isolate' in sys.argv
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
    source = raw
    if use_isolator:
        source = os.path.join(work, 'isolated.mp3')
        if not os.path.exists(source):
            print('isolating the voice (ElevenLabs Voice Isolator)…')
            isolate(raw, source)
        denoise = ''
    studio = os.path.join(work, 'studio.wav')
    ffmpeg('-i', source, '-af', CHAIN.format(denoise=denoise), '-ac', '1', '-ar', str(SR), '-c:a', 'pcm_s16le', studio)
    x = read_wav(studio)
    x0 = read_wav(raw)  # the unprocessed voice: what the voicing and the speech check listen to

    timings, report = {}, []
    old_file = os.path.join(audio, 'timings.json')
    old = json.load(open(old_file)) if os.path.exists(old_file) else {}
    cuts_file = os.path.join(audio, 'cuts.json')
    cuts = json.load(open(cuts_file, encoding='utf-8')) if os.path.exists(cuts_file) else {}
    check = SpeechCheck(x0) if '--keep-breaths' not in sys.argv else None
    breaths = {}
    for scene, group in zip(scenes, split_parts(words, scenes)):
        spans, removed, items = plan_cuts(group, scene['narration'], x, cuts.get(scene['id'], []), words)
        quiet = []
        for a, b in breath_gaps(x0, items, spans[0][0], spans[-1][1]) if check else []:
            seg = x[int(a * SR):int(b * SR)]
            if len(seg) and np.sqrt(np.mean(seg ** 2)) > 10 ** (-55 / 20) and (sp := check(a, b)) >= 0.5:
                removed.append(('kept: sounds like speech', a, f'{b - a:.2f}s, speech {sp:.2f}'))
                continue
            quiet.append((a, b))
        breaths[scene['id']] = sum(1 for a, b in quiet if np.max(np.abs(x[int(a * SR):int(b * SR)]), initial=0) > 0.01)
        part = os.path.join(work, f"{scene['id']}.wav")
        write_wav(part, assemble(x, spans, quiet))
        final = os.path.join(audio, f"{scene['id']}.mp3")
        loudnorm(part, final)
        dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', final],
                                   capture_output=True, text=True).stdout)
        stt = os.path.join(work, f"{scene['id']}.stt.json")
        if '--reuse-stt' in sys.argv and os.path.exists(stt) and abs(old.get(scene['id'], {}).get('duration', -1) - dur) < 0.02:
            heard = json.load(open(stt))  # same cuts, same length (only the sound changed): the words haven't moved
        else:
            heard = transcribe(final)
            json.dump(heard, open(stt, 'w'), ensure_ascii=False)
        timings[scene['id']] = {'duration': round(dur, 3), 'file': f"{scene['id']}.mp3", 'marks': marks_for(scene['narration'], heard, dur)}
        raw_span = group[-1]['end'] - group[0]['start']
        pauses = [r for r in removed if r[0] == 'pause']
        report.append(f"{scene['id']}: {raw_span:.1f}s spoken → {dur:.1f}s · {len(pauses)} long pauses tightened "
                      f"(-{sum(r[2] for r in pauses):.1f}s) · {breaths.get(scene['id'], 0)} breaths/clicks silenced"
                      + ''.join(f" · {'removed ' if not r[0].startswith(('kept', 'patch')) else ''}{r[0]} «{r[2]}» at {r[1]:.1f}s"
                                for r in removed if r[0] != 'pause'))
        # The check: script words the finished scene no longer lets you hear (a clipped word, a cut too far)
        said, tails = spoken_words(scene['narration']), number_tails(scene['narration'])
        hit = align(said, heard, heard_forms(scene['narration']))
        lost = [said[k] for k, j in enumerate(hit) if j is None and norm(said[k]) and not tails[k]]
        if lost:
            report.append(f"  check {scene['id']}: not heard in the finished audio: " + ' · '.join(f'«{w}»' for w in lost))
    json.dump(timings, open(os.path.join(audio, 'timings.json'), 'w'), indent=2)
    print('\n'.join(report))
    total = sum(t['duration'] for t in timings.values())
    chars = sum(len(' '.join(spoken_words(s['narration']))) for s in scenes)
    print(f'total {total:.1f}s of voice · pace {chars / total:.1f} spoken characters per second')


if __name__ == '__main__':
    main()
