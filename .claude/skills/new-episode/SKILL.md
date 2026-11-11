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
- **No puzzle** (framework v5.2 §3.11): part 9 ends with one question the viewer answers from their own life.
- **Company examples** don't have to be famous brands: the world's largest companies (Forbes Global 2000, Fortune
  Global 500) work too, introduced with their rank or one number (framework §3.4).
- **Search words:** what our viewers type for this topic (framework §3.13), for the titles and descriptions.
- Check `channel/02-lessons/story-bank.csv`: don't reuse a story used in the last 20 episodes (a 1–2 sentence
  callback is fine).
- Note every disagreement between sources; use the safer wording.

## 2b. The YouTube agent, from the script to the publish (the owner's rule, Nov 2026)
The `youtube-agent` plugin (project settings; its skills are `/yt-*`; read each SKILL.md before using it) runs at
every stage of every episode. Its voice file is `channel/01-plan/14-youtube-voice.md`: copy it to
`~/.claude/youtube/voice.md` before the first `/yt-*` skill of a session. Its rules sit under CLAUDE.md and the
framework: our facts, our dialect, our structure win where they differ.
- **Before the script:** `/yt-script`: five hooks for part 1 off its 21 formulas, scored with `hookscore.py`. The
  tool reads English words only, so score a faithful English rendering of each Arabic hook and show both; show the
  owner the top two with their panels and the formula each uses. Mark `[ON SCREEN: …]` on every beat of the draft.
- **Titles:** `/yt-package`: ten titles run through `title.py` (the 60/40-character cuts), the top three shown.
  The thumbnail half is skipped while thumbnails are paused.
- **After the recording:** `/yt-edit`: `deadair.py` on the cleaned scenes' transcript as a second check on dead air,
  fillers and retakes the cleaner missed.
- **Before the upload:** `/yt-chapters` (its three rules on our chapter list) and `/yt-seo` (the description's first
  two lines, honest tags, the three queries the video must win).
- **After the upload:** `/yt-comment` (the first replies, the pin), `/yt-retention` when the owner sends the
  retention export, `/yt-audit` once a month. `/yt-shorts` waits with the Shorts.

## 3. Write the draft, then wait for approval
- Write `03-episodes/EP00N/script-draft.md` exactly as the framework says: its header lines, one `## N · part`
  heading per part, numbers as plain digits, `[مثال توضيحي]` on illustrations. Write `sources.md` with links, the
  arithmetic behind every touchable number, and "Disputed" notes.
- Narration: simple Saudi white dialect, told as a story to people in front of you, with conviction; short
  sentences; no fluff, no hype, no promises of money. Each point ends in a business result, with one "small move,
  big impact". Every step has a first move that costs nothing.
- Write the publish kit with the draft (framework §3.13): `publish.md` (titles told as stories, every word true, run
  through `/yt-package`; 2–3 descriptions; tags; the pinned comment with the episode's question). **No thumbnails and
  no Shorts until the owner decides** (their rule, Nov 2026): no `thumbs.json`, no `npm run thumbs`, no `--shorts`.
- Framework v5 parts to remember: Saudi stories and numbers first (none that hurts anyone, none a later episode plans),
  the «وقفة» before the close (Quran and Sahih al-Bukhari / Muslim only, exact texts checked twice, §3.15), and a close
  with a 10–15 s bridge for the «فيه مشهد في النهاية» pop-up, then the teaser on a dark screen (§3.16).
- The owner's own style (v5.1, §3.1): never skip the middle of a story (every event in order, cause then effect),
  plain explicit wording, their warm asides, and talking to the person in the story. Dialogues for conversation skills are
  always our own or real and documented, never copied from a course (§3.18). The Booth gets one sentence per line.
- v5.2: no puzzle and no answer to an earlier one; the journey map's shape is set per episode (`"map"` in `episode.json`:
  `mountain` or `stairs`; EP001–EP002 keep the winding road), and case names use «سر» or «قصة», never «لغز».
  v5.4: the mountain for every episode until the owner says otherwise.
- **Like talking to a friend (v5.4, the owner's rule):** before the draft goes out, run the `humanizer` skill
  (`.claude/skills/humanizer`) over the narration: cut slogans, «مو كذا… كذا» contrasts that add nothing, closing lines that
  repeat the story, inflated words. Wording only: every fact, number, quote and story stays, and so do the owner's phrases.
  A loop is paid off by telling it: never «اللي وعدتك فيها»، «زي ما وعدتكم» or «مثل ما قلت لكم».
- Run `python3 06-tools/draft_length.py EP00N` (it warns below the framework's minimum) and the framework checklist (§5).
- Send the draft to the owner and **wait for approval**. When the format or the look changes, the owner records
  part A (the first ~2 minutes) first and you render only that for approval.

## 4. After approval: `episode.json` and `publish.md`
- The draft is now frozen. Build `episode.json` from it (`"look": "aquarelle"`, `"motion": "rich"`, `"map": "mountain"`
  from EP005, framework v5.5; a foreign name gets its English form (`en`, `whoEn`); a few public-domain photos as `photo`
  moments, never of a woman; the sounds and the background level come from `channel.json`), one scene per part (scene types: framework §6 and
  `04-studio/src/types.ts`). If a part has no scene type yet, add it in `src/scenes/BizScenes.tsx` (cues,
  silhouettes, our palette), list it in framework §6, and type-check.
- Give every scene its `moments` (framework §3.14): a visual on the word for each name, date, number, quote,
  comparison, list, question or hidden thing, so nothing sits still for more than ~4 seconds. After the voice is
  synced, check that every cue lands on its word (use `phrase@2` for a repeated phrase) and look at stills taken on
  those words.
- Numbers: `{display|spoken}` e.g. `{2009|ألفين وتسعة}`, `{55|خمسة وخمسين}`, `{10%|عشرة بالمية}`.
- Finish the publish kit: real chapter times from `out/chapters.txt` (checked with `/yt-chapters`), the description
  through `/yt-seo`, an X thread, a WhatsApp card. No Shorts or thumbnails until the owner decides. Altered content:
  **No** (the owner's real voice).

## 5. Build and check
```bash
cd channel/04-studio && (test -d node_modules || npm install)
export REMOTION_BROWSER=${REMOTION_BROWSER:-$(find /opt/pw-browsers -name headless_shell -type f 2>/dev/null | head -1)}
npm run script -- EP00N
npm run preview -- EP00N      # then LOOK at 3–4 frames: the hook cards, the comparison, a stats scene
```
Fix any overflow/wrapping by shortening text (not by shrinking fonts).

## 6. The owner's voice
- Put the episode's parts into the Recording Booth (one part per scene) and tell the owner it's ready.
- When the recording arrives: `python3 06-tools/clean_recording.py EP00N <file>`. It splits the parts at the
  Booth's pauses (or by the script when the owner reads straight through), drops retakes, repeats and stutters,
  tightens long pauses, cleans and levels the sound (-16 LUFS) and writes word marks so cues and subtitles land on
  the word. The sound is the podcast voice (the owner's request, Nov 2026): the `audio-cleanup` skill's podcast preset
  (`.claude/skills/audio-cleanup`) inside the cleaner; `--voice=studio` gives EP001–EP003's sound. Read its report,
  run `/yt-edit` on the scenes' transcript, then `npm run render -- EP00N`.

## 7. Bookkeeping
- `lessons.csv`: `status` → `draft` (sent for approval) / `scripted` (episode.json built) / `voiced` / `rendered`,
  `episode` → `EP00N`, `notes` → anything to review.
- `story-bank.csv`: append new stories (id SBxxx, sources, lessons it can teach) and update `used_in`.
- `python3 channel/06-tools/build_catalog.py` (checks the tracker and refreshes `LESSONS.md`).
- Commit: `EP00N: <Arabic title> (script draft, sources)` or `(episode, publish kit)`, and push to the working branch.

## 8. Report to the owner (short)
Title, length, the hook story and the key numbers, anything disputed or uncertain, and their next action
(approve the draft, record in the Booth, review, or upload).
