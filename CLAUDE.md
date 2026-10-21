# CLAUDE.md: «غرفة الفرص» (Opportunity Room) YouTube production system

This repository hosts the production system for an Arabic (Saudi dialect) **business** YouTube channel. Its promise:
anyone, with a talent they know or one they haven't discovered yet, gets the mindset and the skills to start a
business and scale it, through **real stories, numbers and statistics**. Emotional intelligence and social skills
are taught as business tools: every idea ends in a business result (trust, deals, money, customers, followers).
Everything lives in [`channel/`](channel/). (The .NET sample files at the repo root are leftovers from the original
fork. Ignore them.)

Read [`channel/00-START-HERE.md`](channel/00-START-HERE.md) first. It is the map.

## Folder map (numbered = the order work flows)

| Folder | What it holds |
|---|---|
| `channel/01-plan/` | Strategy: blueprint, mistakes to avoid, viral playbook, growth, marketing, policy/legal, coaching roadmap, setup, voice, **video framework** |
| `channel/02-lessons/` | The tracker (`lessons.csv`, one row per video) and its readable catalog; `_archive-ei/` = the earlier emotional-intelligence catalog |
| `channel/03-episodes/EPxxx/` | One folder per video: `script-draft.md` (what the owner approves), then `episode.json` (the single source of truth after approval), `script.md`, `sources.md`, the publish kit (`publish.md`, `thumbs.json`), `audio/` and `out/` (both git-ignored) |
| `channel/04-studio/` | Remotion project that turns `episode.json` into the video, thumbnail, subtitles and chapters |
| `channel/05-templates/` | Templates and checklists |
| `channel/06-tools/` | Scripts: catalog builder, draft length check, transcript tools |

## Non-negotiable rules

1. **Every story and number is real and verified.** Each needs ≥1 reputable source in `sources.md` (news outlet, official site, paper, Wikipedia + its primary citation). Numbers must match the source. If a fact is disputed, use the safer wording ("أقل من خمس سنين") or drop it. Never invent people, quotes or numbers. A "near-real" example must be labeled on screen as an illustration (مثال توضيحي).
2. **Private sources stay private.** The trainers' transcripts and everything derived from them (lesson extracts, course lists, lesson maps) live only in git-ignored `channel/02-lessons/sources/` and on the owner's computer. Never commit, upload, quote or publish them. Never name the trainers or their attendees in anything public. The lesson ideas are a syllabus: our titles, order, stories, examples, exercises and wording are original. Never copy sentences, examples or numbered lists from them. No course names, ids or refs in committed files.
3. **Language and delivery:** simple Saudi white dialect a 12-year-old understands, written for the owner to say *to people in front of them* with conviction (إبهار): short punchy sentences, real questions, pauses (…), concrete numbers. No academic words without an instant simple explanation. Numbers in narration use `{display|spoken}` (e.g. `{2009|ألفين وتسعة}`) so captions show digits and the voice reads words. How to tell it (step by step, with questions to the viewer, touchable numbers): the video framework, rule 5.
4. **One lesson per video, always tied to business.** Every point ends in a business result. Include at least one "small move, big impact" detail (a word, a habit, a gesture people overlook). Where it fits, use the owner's favourite angles: leverage (10x, 25x), scaling and alignment with other people and things, comparing people or things to find golden opportunities, connections that pay off years later, and the 1% a day that compounds.
5. **Format: the video framework.** Every long video follows the current version of [`channel/01-plan/11-video-framework.md`](channel/01-plan/11-video-framework.md): the parts and their order, how to tell the story, touchable numbers, opening and closing loops, quotes with credentials, risks and mitigations. It is the only place the structure is defined (versioned, with a changelog): read it before writing a script, and change the structure only there. **Length** is set there too (at least 8:00 since v3: YouTube allows mid-roll ads from 8 minutes). The lesson order can change as well: lesson ids stay, episode numbers follow publication order (framework §0). Stories depend on the topic (no fixed count); vary countries and industries, and include an Arab/Gulf example when a verified one exists.
6. **No cringe, no fluff, no hype.** Never ask viewers to subscribe or like (the owner will say when). No guaranteed-income or get-rich promises, no investment, trading or stock tips: numbers are examples, never promises (YouTube policy and Saudi financial-promotion rules). No politics or sectarian topics. Stress/mental-health points get a gentle "if it's heavy, talk to a specialist" line.
7. **Design:** our palette and font in `04-studio/src/theme.ts`. Depth comes from our own silhouettes ("shadows") of places, people and things (`src/components/Silhouettes.tsx`): no stock photos without a license, no other brands' logos (company names as text are fine). **Every sentence is seen:** names, dates, numbers, quotes and comparisons get an explainer moment on the word that says them, each with a short non-melodic sound; nothing sits still for more than ~4 seconds (framework §3.14).
8. **Voice:** the owner records their own voice for published videos (no AI voice). Claude writes the script → the owner records it in the Recording Booth → Claude cleans it (retakes, stutters, long pauses, noise, EQ, loudness) and syncs it word by word (`python3 channel/06-tools/clean_recording.py EP00N <recording>`; it splits the parts at the Booth's pauses, or by the script when the owner reads straight through). **Background:** men's voices humming, no instruments and no women's singing (`channel.json` → `"background": "humming"`, made with `06-tools/humming_bed.py`, screened with `06-tools/listen_check.py`).
9. **Test before you build long:** when the format or style changes, render the first 30 seconds for the owner's approval before making the full episode.
10. **Keep the tracker true:** update `channel/02-lessons/lessons.csv` (`status`, `episode`, dates, results) whenever an episode changes state.
11. **Cost discipline:** no paid API calls unless the owner configured a key. Preview with `npm run preview` before a full render.

## Producing an episode (the `/new-episode` skill automates this)

```bash
cd channel/04-studio
npm install                                # first time only
# 0) write channel/03-episodes/EP00N/script-draft.md + sources.md (video framework) → the owner approves
python3 ../06-tools/draft_length.py EP00N    # length of each part
npm run thumbs -- EP00N                    # the publish kit's 3 thumbnails (from thumbs.json) → out/thumb-1..3.png
# 1) after approval: build channel/03-episodes/EP00N/episode.json from the draft (scenes: framework §6, src/types.ts)
npm run script -- EP00N                    # readable script.md for the owner to record
npm run preview -- EP00N                   # still frames in out/preview/ → look at them
# 2) owner records in the Booth and sends the file (one file for all parts is fine)
python3 ../06-tools/clean_recording.py EP00N <recording>  # cuts, cleans, levels and syncs it word by word
npm run render -- EP00N                    # mp4 + thumbnail + subtitles.ar.srt + chapters.txt
npm run render -- EP00N --shorts           # 9:16 Shorts from the scenes listed in episode.json "shorts"
```

In a cloud session set `REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`
(or whatever `find /opt/pw-browsers -name headless_shell` returns) before rendering.

## Remotion rules used here

- All animation is driven by `useCurrentFrame()` + `interpolate`/`spring`. Never CSS animations or `setTimeout`.
- Scene timing comes only from `src/lib/plan.js` (`buildPlan`). When audio exists, `audio/timings.json` drives it.
- Visuals that must land on a word use a `cue` (a word from the spoken narration) via `cueAt()` in `src/scenes/common.tsx`; `phrase@2` = its second occurrence.
- Explainer visuals are a scene's `moments` in `episode.json` (`src/components/Moments.tsx`, kinds in `src/types.ts`). Sound effects play through `<Sfx>` (`src/components/Sfx.tsx`); the files come from `npm run music -- sfx`.
- Static files are served from `channel/03-episodes` (public dir). Reference them with `staticFile('EP001/...')`.
- Layout is RTL (`direction: rtl`); wrap numbers that must read LTR in `direction: 'ltr', unicodeBidi: 'isolate'`.
- Type-check with `npm run check` after code changes.
