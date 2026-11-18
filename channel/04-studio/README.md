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
| `npm run render -- EP003 --until=30` | Only the first 30 seconds → `out/EP003-first30s.mp4` (a new look's test, CLAUDE.md rule 9) |
| `npm run render -- EP003 --from=445 --until=505` | A window anywhere in the episode → `out/EP003-445s-505s.mp4` |
| `npm run render -- EP003 --remaster` | The sound again, mastered onto the existing `out/EP003.mp4` (the picture isn't redrawn) |
| `npm run render -- EP001 --shorts` | Vertical 9:16 Shorts (scenes listed in `episode.json` → `shorts`; an entry can be `{"scenes": [...], "title": "..."}`) |
| `npm run preview -- EP001 --short=s4` | Still frames of a Short |
| `npm run studio` | Live editor in the browser (scrub, tweak, see changes instantly) |
| `npm run check` | Type-check after code changes |

## How it's built
- `src/lib/plan.js`: the timing brain. Scene length = voice length (or an estimate from the text), captions split and timed, SRT and chapters generated from the same plan.
- `src/Episode.tsx`: assembles the scenes, voice, music (ducked under the voice) and whooshes.
- `src/scenes/`: Hook, Title, Lesson, Story (globe + card), Recap, Practice, Outro.
- `src/components/Globe.tsx`: the 3D globe (d3-geo orthographic + world-atlas), camera flights, arcs and pins.
- `src/theme.ts`: colors, font, motion curves: change the look of every video here.
- `src/look.ts`: an episode's look (`episode.json` → `"look"`). `material` is the default; `watercolor` (an experiment
  from EP003) moves it between watercolor and anime: paper and pigment washes (`06-tools/watercolor_textures.py` →
  `03-episodes/_assets/look/`), an ink line and a cel shadow on every card, an anime sky over the journey map, sparkles on
  the big reveals and focus lines behind a question (`src/components/Watercolor.tsx`). `aquarelle` (from EP005, the
  owner's choice of 10 Nov 2026) is the same paper with almost no anime: cards torn from paper (`deckle.png`, a 9-slice
  mask from `06-tools/watercolor_textures.py`) lifted by a soft shadow, washi tape on the cards that name someone, pigment
  blooming behind the big reveals (`PaintBloom`), painted avatars and badges (`blot()`), a sepia pencil line instead of
  the ink (`ink()` follows the look), soft clouds, no sparkles, focus lines, squash or shake.
- Bilingual names: `en` on `profile`, `globe` and `photo` moments, `whoEn` on `quote`, shows a foreign name's English form
  under the Arabic one. The `photo` moment (`MomentKinds.tsx` → `PhotoCard`) lays a public-domain or CC0 photo
  (`src`, a file in `03-episodes`) on the page as a watercolor print, with `caption`, `en`, `credit` and `subject`
  (`place`, `object` or `man`: never a woman, the owner's rule).
- `src/components/Sfx.tsx`: the sound effects. `channel.json` `"sfx"` picks the set: `"foley"` (`03-episodes/_assets/sfx-foley/`,
  cards, paper, books, wood and coins from Kenney's CC0 packs, made by `python3 ../06-tools/sfx_foley.py <kenney assets>`,
  the channel's set from EP004) or `"synth"` (`_assets/sfx/`, `npm run music -- sfx`, kept by EP001–EP003's episode.json).
- `ChannelAvatar` (`src/components/ui.tsx`): the channel's avatar from its YouTube page, `03-episodes/_assets/brand/avatar.png`,
  at the top right of every scene (`TopBar`) and in the intro and end lockups.
- `src/components/Motion.tsx`: rich motion (`episode.json` → `"motion": "rich"`, approved by the owner on 4 Nov 2026, from EP004):
  brush strokes wiping between scenes (`stroke-<pigment>.png` from `06-tools/watercolor_textures.py`), headlines that
  land word by word on a painted underline, an impact burst when a number lands, cards that bounce in, ink thrown by
  stamps, warm sun rays and motes on the paper. Plain shapes and moving images only, so a render costs what it did.
- `src/BoxedShort.tsx`: a Short made of stage scenes, whose cards are laid out for 16:9 only: the scenes stay wide in a band
  across the vertical frame (`src/components/frame.ts` tells them their size), the Short's title above, big captions
  below, then the vertical end card.
- `src/Thumbnail.tsx`: 1280×720 thumbnail (number-ring or globe layout).

Cloud sessions: set `REMOTION_BROWSER` to the preinstalled headless shell before rendering
(`find /opt/pw-browsers -name headless_shell`).

Remotion license: free for individuals and companies with up to 3 employees.
