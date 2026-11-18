"""Does a background track have instruments in it? The channel's rule: voices only (humming), no instruments.

    python3 channel/06-tools/listen_check.py channel/03-episodes/_assets/music/humming.mp3 [more files…]

Listens with Google's YAMNet sound classifier (Apache-2.0; 521 everyday sound classes) and prints what it hears,
how much sounds like voices and how much like instruments, and the moments that sound most like an instrument.
It is a first screen, not the final word: the owner's ears decide.

Needs: pip install ai-edge-litert (the model, ~4 MB, is downloaded to ~/.cache/channel-studio on first use).
"""
import os
import subprocess
import sys
import zipfile

import numpy as np

CACHE = os.path.expanduser('~/.cache/channel-studio')
MODEL = os.path.join(CACHE, 'yamnet.tflite')
URL = 'https://storage.googleapis.com/mediapipe-models/audio_classifier/yamnet/float32/latest/yamnet.tflite'
VOICE = ['Humming', 'Choir', 'A capella', 'Singing', 'Chant', 'Mantra', 'Vocal music', 'Child singing',
         'Synthetic singing', 'Speech', 'Narration, monologue', 'Yodeling']
INSTRUMENT = ['Musical instrument', 'Plucked string instrument', 'Guitar', 'Electric guitar', 'Bass guitar',
              'Acoustic guitar', 'Piano', 'Electric piano', 'Keyboard (musical)', 'Organ', 'Electronic organ',
              'Hammond organ', 'Synthesizer', 'Sampler', 'Percussion', 'Drum kit', 'Drum', 'Drum machine',
              'Bowed string instrument', 'String section', 'Violin, fiddle', 'Cello', 'Double bass', 'Orchestra',
              'Brass instrument', 'Wind instrument, woodwind instrument', 'Flute', 'Harp', 'Bell', 'Chime',
              'Wind chime', 'Glockenspiel', 'Marimba, xylophone', 'Vibraphone', 'Steelpan', 'Tabla', 'Accordion',
              'Harmonica', 'Saxophone', 'Trumpet', 'Sitar', 'Zither', 'Ukulele', 'Banjo', 'Mandolin', 'Tubular bells',
              'Singing bowl', 'Theremin', 'Cymbal', 'Hi-hat', 'Snare drum', 'Bass drum', 'Timpani', 'Tambourine',
              'Gong', 'Strum']


def model():
    if not os.path.exists(MODEL):
        os.makedirs(CACHE, exist_ok=True)
        subprocess.run(['curl', '-sSfL', '--max-time', '120', URL, '-o', MODEL], check=True)
    labels = zipfile.ZipFile(MODEL).read('yamnet_label_list.txt').decode().splitlines()
    from ai_edge_litert.interpreter import Interpreter
    it = Interpreter(model_path=MODEL)
    it.allocate_tensors()
    return it, labels


def listen(it, labels, path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype=np.float32)
    inp, out = it.get_input_details()[0]['index'], it.get_output_details()[0]['index']
    scores = []
    for s in range(0, max(1, len(x) - 15600), 7800):  # 0.975 s windows, every 0.4875 s
        it.set_tensor(inp, np.ascontiguousarray(x[s:s + 15600]))
        it.invoke()
        scores.append(it.get_tensor(out)[0].copy())
    S = np.array(scores)
    voice = S[:, [labels.index(c) for c in VOICE if c in labels]].max(1)
    inst_cols = [labels.index(c) for c in INSTRUMENT if c in labels]
    inst = S[:, inst_cols].max(1)
    top = np.argsort(-S.mean(0))[:8]
    print(f'\n{path}  ({len(x) / 16000:.1f} s)')
    print('  hears:', ', '.join(f'{labels[k]} {S.mean(0)[k]:.2f}' for k in top))
    print(f'  voices {voice.mean():.2f} · instruments {inst.mean():.2f} · '
          f'{(inst > 0.2).mean() * 100:.0f}% of the time something sounds like an instrument')
    for w in np.argsort(-inst)[:3]:
        if inst[w] > 0.2:
            print(f'    {w * 0.4875:.1f}s sounds like: {labels[inst_cols[int(np.argmax(S[w, inst_cols]))]]} ({inst[w]:.2f})')
    ok = inst.mean() < 0.06 and (inst > 0.2).mean() < 0.08 and voice.mean() > inst.mean()
    print('  →', 'voices only, as far as the classifier hears' if ok else 'listen to it: it may contain instruments')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    interpreter, names = model()
    for f in sys.argv[1:]:
        listen(interpreter, names, f)
