---
name: new-episode
description: Produce the next YouTube episode end-to-end for the business channel «غرفة الفرص» in channel/ — pick the next lesson from the tracker, research and verify real stories, statistics and quotes, write the script draft in the current video framework (Saudi dialect, told as a story) for the owner's approval, then episode.json, sources.md and publish.md, preview frames, prepare the owner's recording, link the voice and render, update the tracker. Use when the owner says "new episode", "next episode", "make EP00N" or "/new-episode".
---

# /new-episode

Follow `CLAUDE.md` (repo root) rules exactly, and the **current version** of the video framework,
`channel/01-plan/11-video-framework.md` (the parts, their order, the techniques and the checklist). Work in `channel/`.

## 1. Pick the lesson
- If the owner named a lesson/episode, use it. Otherwise take the **first row with `status=todo`** in `channel/02-lessons/lessons.csv`
  (the row order is the plan; a timely lesson may have been moved up: framework §0).
- Episode number = the next free one in publication order (`EP006`, `EP007`…), whatever the lesson id. Write it in the
  tracker's `episode` column. Folder: `channel/03-episodes/EP00N/`.
- Read the row (`title_ar`, `idea`, `business_angle`, `small_move`, `story_lead`). Optional, only if the private
  folder exists (it's git-ignored and may be missing): the private map in `channel/02-lessons/sources/business/`
  points to the source rows for nuance. Never copy sentences, examples or numbered lists from private material, and
  never write trainer names, course names or refs into any committed file.

## 2. Research (WebSearch)
- **Hook story:** one short true story with a striking number that makes people stop scrolling (a twist works best:
  rejected → bought, tiny team → huge result, small move → big deal).
- **The problem in numbers:** 2–3 statistics from reputable sources (surveys, official data, research, major outlets).
- **Stories for the tools part:** as many as the topic needs (no fixed count), varied countries and industries, an
  Arab/Gulf example when a verified one exists. Prefer stories that show leverage, scaling, comparisons that reveal
  opportunities, connections that paid off years later, or the 1% a day.
- **Every name** (person, company, organisation): what it is and 1–2 achievements with numbers (framework §3.4).
- **Quotes:** only with a traceable source, plus the person's achievements in numbers (framework §3.6).
- **Touchable comparisons** for every big number, with the arithmetic (framework §3.3).
- **Traps:** a real case for each, told in the five steps of framework §3.7.
- **The puzzle:** one exact answer that needs details from the episode (framework §3.11). No prizes.
- **Company examples** don't have to be famous brands: the world's largest companies (Forbes Global 2000, Fortune
  Global 500) work too, introduced with their rank or one number (framework §3.4).
- **Search words:** what our viewers type for this topic (framework §3.13), for the titles and descriptions.
- Check `channel/02-lessons/story-bank.csv`: don't reuse a story used in the last 20 episodes (a 1–2 sentence
  callback is fine).
- Note every disagreement between sources; use the safer wording.

## 3. Write the draft, then wait for approval
- Write `03-episodes/EP00N/script-draft.md` exactly as the framework says: its header lines, one `## N · part`
  heading per part, numbers as plain digits, `[مثال توضيحي]` on illustrations. Write `sources.md` with links, the
  arithmetic behind every touchable number, and "Disputed" notes.
- Narration: simple Saudi white dialect, told as a story to people in front of you, with conviction; short
  sentences; no fluff, no hype, no promises of money. Each point ends in a business result, with one "small move,
  big impact". Every step has a first move that costs nothing.
- Write the publish kit with the draft (framework §3.13): `publish.md` (3 titles, 2 descriptions, tags, the pinned
  comment with the puzzle) and `thumbs.json`; run `npm run thumbs -- EP00N` in `04-studio` and look at the 3 images.
- Run `python3 06-tools/draft_length.py EP00N` (it warns below the framework's minimum) and the framework checklist (§5).
- Send the draft to the owner and **wait for approval**. When the format or the look changes, the owner records
  part A (the first ~2 minutes) first and you render only that for approval.

## 4. After approval: `episode.json` and `publish.md`
- The draft is now frozen. Build `episode.json` from it, one scene per part (scene types: framework §5 and
  `04-studio/src/types.ts`). If a part has no scene type yet, add it in `src/scenes/BizScenes.tsx` (cues,
  silhouettes, our palette), list it in framework §5, and type-check.
- Numbers: `{display|spoken}` e.g. `{2009|ألفين وتسعة}`, `{55|خمسة وخمسين}`, `{10%|عشرة بالمية}`.
- Finish the publish kit: real chapter times from `out/chapters.txt`, 3 Shorts, an X thread, a WhatsApp card.
  Altered content: **No** (the owner's real voice).

## 5. Build and check
```bash
cd channel/04-studio && (test -d node_modules || npm install)
export REMOTION_BROWSER=${REMOTION_BROWSER:-$(find /opt/pw-browsers -name headless_shell -type f 2>/dev/null | head -1)}
npm run script -- EP00N
npm run preview -- EP00N      # then LOOK at 3–4 frames: the hook cards, the comparison, a stats scene, the thumbnail
```
Fix any overflow/wrapping by shortening text (not by shrinking fonts).

## 6. The owner's voice
- Put the episode's parts into the Recording Booth (one part per scene) and tell the owner it's ready.
- When the recording arrives: `python3 06-tools/clean_recording.py EP00N <file>`. It splits the parts at the
  Booth's pauses, drops retakes, repeats and stutters, tightens long pauses, cleans and levels the sound (-16 LUFS)
  and writes word marks so cues and subtitles land on the word. Read its report, then `npm run render -- EP00N`.

## 7. Bookkeeping
- `lessons.csv`: `status` → `draft` (sent for approval) / `scripted` (episode.json built) / `voiced` / `rendered`,
  `episode` → `EP00N`, `notes` → anything to review.
- `story-bank.csv`: append new stories (id SBxxx, sources, lessons it can teach) and update `used_in`.
- `python3 channel/06-tools/build_catalog.py` (checks the tracker and refreshes `LESSONS.md`).
- Commit: `EP00N: <Arabic title> (script draft, sources)` or `(episode, publish kit)`, and push to the working branch.

## 8. Report to the owner (short)
Title, length, the hook story and the key numbers, anything disputed or uncertain, and their next action
(approve the draft, record in the Booth, review, or upload).
