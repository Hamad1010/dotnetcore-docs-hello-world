# Studio (Remotion)

Turns `../03-episodes/<EP>/episode.json` into a finished video. You edit **text**, not timelines.

| Command | What it does |
|---|---|
| `npm install` | First time only |
| `npm run music` | Generates our own background music + transition whoosh (first time only) |
| `npm run script -- EP001` | Writes the readable `script.md` with timings |
| `npm run voice -- EP001 --provider=…` | Narration per scene → `audio/*.mp3` + `audio/timings.json` (providers: `elevenlabs`, `google`, `polly`, `edge`, `recorded`) |
| `npm run preview -- EP001` | A few still frames → `out/preview/` (fast visual check) |
| `npm run render -- EP001 [--preview]` | MP4 + thumbnail + `subtitles.ar.srt` + `chapters.txt` → `out/` |
| `npm run render -- EP001 --shorts` | Vertical 9:16 Shorts (scenes listed in `episode.json` → `shorts`) |
| `npm run preview -- EP001 --short=s4` | Still frames of a Short |
| `npm run studio` | Live editor in the browser (scrub, tweak, see changes instantly) |
| `npm run check` | Type-check after code changes |

## How it's built
- `src/lib/plan.js`: the timing brain. Scene length = voice length (or an estimate from the text), captions split and timed, SRT and chapters generated from the same plan.
- `src/Episode.tsx`: assembles the scenes, voice, music (ducked under the voice) and whooshes.
- `src/scenes/`: Hook, Title, Lesson, Story (globe + card), Recap, Practice, Outro.
- `src/components/Globe.tsx`: the 3D globe (d3-geo orthographic + world-atlas), camera flights, arcs and pins.
- `src/theme.ts`: colors, font, motion curves: change the look of every video here.
- `src/Thumbnail.tsx`: 1280×720 thumbnail (number-ring or globe layout).

Cloud sessions: set `REMOTION_BROWSER` to the preinstalled headless shell before rendering
(`find /opt/pw-browsers -name headless_shell`).

Remotion license: free for individuals and companies with up to 3 employees.
