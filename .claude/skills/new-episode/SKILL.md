---
name: new-episode
description: Produce the next YouTube episode end-to-end for the channel in channel/ — pick the next lesson from the tracker, research and verify 6–8 real global stories with numbers, write episode.json in simple Saudi dialect, sources.md and publish.md, preview frames, voice/render if configured, update the tracker and story bank. Use when the owner says "new episode", "next episode", "make EP00N" or "/new-episode".
---

# /new-episode

Follow `CLAUDE.md` (repo root) rules exactly. Work in `channel/`.

## 1. Pick the lesson
- If the owner named a lesson/episode, use it. Otherwise take the **first row with `status=todo`** in `channel/02-lessons/lessons.csv`.
- Episode id = lesson number: `L007` → `EP007`. Folder: `channel/03-episodes/EP007/`.
- Read the row (`title_ar`, `idea`). Optional, only if the private folder exists (it's git-ignored and may be missing):
  find the lesson in `channel/02-lessons/sources/lesson-map.csv` (`course`, `ref`), run
  `python3 channel/06-tools/transcripts/skel2.py channel/02-lessons/sources/courses/<course>.txt 220` and read only the
  passage for this lesson (≤3,000 chars) for nuance. Never copy its sentences, examples or list structure, and never
  write course names, course ids or refs into any committed file.
- The `next` field = the following lesson in the tracker.

## 2. Research (WebSearch)
- One **hook anchor**: a study or striking number about the lesson (prefer university/peer-reviewed sources).
- **8–10 candidate stories**, keep the best **6–8** that pass `channel/05-templates/story-research.md`:
  real + sourced, has a year and ≥1 striking number, ≥5 countries, ≥3 continents, ≥4 topics, one Arab/Muslim-world story if a verified one exists.
- Check `channel/02-lessons/story-bank.csv`: don't reuse a story used in the last 20 episodes.
- Note every disagreement between sources; use the safer wording.

## 3. Write `episode.json` (copy `channel/05-templates/episode.template.json`)
- Narration: simple Saudi white dialect a 12-year-old understands; sentences ≤20 words; warm, curious tone.
- Numbers: `{display|spoken}` e.g. `{2019|ألفين وتسعطعش}`, `{51|واحد وخمسين}`, `{10%|عشرة بالمية}`.
- Hook ≤ 330 chars, opens with the number; promises the story count.
- Each story ≈ 400–480 chars: where+when → situation → action → numbers → result → takeaway sentence.
- Fit-on-screen limits: `headline` ≤ 26 chars · `beats` 3 × ≤ 36 chars · `stats` 3 × (value ≤ 6 chars, unit ≤ 8, label ≤ 28) · `takeaway` ≤ 30 · recap `name` ≤ 16.
- Globe: `isoNumeric` = ISO 3166-1 numeric as a 3-digit string (Saudi Arabia `682`, Egypt `818`, UAE `784`, USA `840`, UK `826`, Japan `392`, India `356`, Brazil `076`, Germany `276`, France `250`, Turkey `792`, Kenya `404`, China `156`). `lat`/`lon` of the city. Use `arcFrom` (origin → place) or `arcTo` (place → where the impact went) when the story travels.
- Target total narration 4,600–5,600 characters (≈6–7 min). Never under 5:00 (`npm run script` prints the length).
- `thumbnail`: `big` + `bigUnit` (a number from the hook) + `line1` (≤4 words) + `badge`.

## 4. Write `sources.md` and `publish.md`
Use EP001 as the model: sources with links per story + "Disputed" notes; publish kit with 3 titles (≤60 chars,
keyword early), 3 thumbnail variants, description (with chapters placeholder and sources), ≤8 tags, a
choice-question pinned comment, upload settings, 3 Shorts, X thread, WhatsApp card.

## 5. Build and check
```bash
cd channel/04-studio && (test -d node_modules || npm install)
test -f ../03-episodes/_assets/music/calm-pad.mp3 || npm run music
export REMOTION_BROWSER=${REMOTION_BROWSER:-$(find /opt/pw-browsers -name headless_shell -type f 2>/dev/null | head -1)}
npm run script -- EP00N
npm run preview -- EP00N      # then LOOK at 3–4 frames: the longest headline, a stats tile, recap, thumbnail
```
Fix any overflow/wrapping by shortening text (not by shrinking fonts).

## 6. Voice and render
- If `channel/04-studio/.env` has a provider → `npm run voice -- EP00N`, then `npm run render -- EP00N`.
- If not, render only when the owner asks (silent preview with captions), and tell the owner which voice step is pending.

## 7. Bookkeeping
- `lessons.csv`: `status` → `scripted` (or `rendered`/`voiced`), `episode` → `EP00N`, `notes` → anything to review.
- `story-bank.csv`: append new stories (id SBxxx, sources, lessons it can teach) and update `used_in`.
- `python3 channel/06-tools/build_catalog.py` (checks the tracker and refreshes `LESSONS.md`).
- Commit: `EP00N: <Arabic title> (script, sources, publish kit)` and push to the working branch.

## 8. Report to the owner (short)
Title, length, the stories (country · year · one-line each), anything disputed or uncertain, and their next
action (review `script.md`, record voice, or upload).
