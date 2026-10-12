# CLAUDE.md: YouTube channel production system

This repository hosts the production system for an Arabic (Saudi dialect) YouTube channel teaching
**social & emotional intelligence through real global stories**. Everything lives in [`channel/`](channel/).
(The .NET sample files at the repo root are unrelated leftovers from the original fork. Ignore them.)

Read [`channel/00-START-HERE.md`](channel/00-START-HERE.md) first. It is the map.

## Folder map (numbered = the order work flows)

| Folder | What it holds |
|---|---|
| `channel/01-plan/` | Strategy: blueprint, mistakes to avoid, viral playbook, growth, marketing, policy/legal, coaching roadmap, setup |
| `channel/02-lessons/` | The 330-lesson catalog (`LESSONS.md`) and the tracker (`lessons.csv`), one row per video |
| `channel/03-episodes/EPxxx/` | One folder per video: `episode.json` (single source of truth), `script.md`, `sources.md`, `publish.md`, `audio/`, `out/` (renders, git-ignored) |
| `channel/04-studio/` | Remotion project that turns `episode.json` into the video, thumbnail, subtitles and chapters |
| `channel/05-templates/` | Templates and checklists (episode, story research, pre-publish, weekly review) |
| `channel/06-tools/` | Scripts: catalog builder, transcript tools |

## Non-negotiable rules

1. **Every story is real and verified.** Each story needs ≥1 reputable source in `sources.md` (news outlet, official site, paper, Wikipedia + its primary citation). Numbers must match the source. If a fact is disputed, use the safer wording ("about 10 meters") or drop it. Never invent people, quotes or numbers. A "near-real" story must be labeled on screen as an illustration (مثال توضيحي).
2. **Original wording only.** The source courses are a *syllabus*, not a script. Never copy sentences from the transcripts, never name attendees from them, never commit the raw transcripts (`channel/02-lessons/sources/` is git-ignored).
3. **Language:** narration in simple **Saudi white dialect** a 12-year-old understands: short sentences, everyday words (وش، ليش، كذا، عشان، لين، يبي). No academic vocabulary without an immediate simple explanation. Numbers in narration use `{display|spoken}` (e.g. `{1987|ألف وتسعمية وسبعة وثمانين}`) so captions show digits and the voice reads words.
4. **One lesson per video, repeated through every story.** Each story ends with a `takeaway` line that restates the lesson in different words.
5. **Format:** hook (≤25 s, a surprising number) → title → lesson in plain words (+1 scientific anchor) → 5–10 stories (different countries, cultures, topics; each with numbers) → recap → today's exercise → next-lesson teaser. **Minimum 5:00, target 6–8 min.**
6. **Diversity per episode:** at least 4 continents or 5 countries, at least 4 different topics (health, sport, business, history, science, family, school, tech…), and at least one Arab/Muslim-world story when a good verified one exists.
7. **Design:** our own palette and font in `04-studio/src/theme.ts` (material-like, not Google's exact colors or logos, no Google Sans). Don't add other brands' logos.
8. **No politics, sectarian topics or medical claims.** Grief/mental-health lessons get a gentle "if it's heavy, talk to a specialist" line.
9. **Keep the tracker true:** update `channel/02-lessons/lessons.csv` (`status`, `episode`, dates, results) whenever an episode changes state.
10. **Cost discipline:** no paid API calls unless the owner configured a key in `channel/04-studio/.env`. Preview with `npm run preview` before a full render.

## Producing an episode (the `/new-episode` skill automates this)

```bash
cd channel/04-studio
npm install                                # first time only
npm run music                              # first time only: generates our own music + whoosh
# 1) write channel/03-episodes/EP00N/episode.json (copy 05-templates/episode.template.json)
npm run script -- EP00N                    # readable script.md
npm run voice -- EP00N --provider=elevenlabs   # or google | polly | edge | recorded
npm run preview -- EP00N                   # still frames in out/preview/ → look at them
npm run render -- EP00N                    # mp4 + thumbnail + subtitles.ar.srt + chapters.txt
npm run render -- EP00N --shorts           # 9:16 Shorts from the scenes listed in episode.json "shorts"
```

In a cloud session set `REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`
(or whatever `find /opt/pw-browsers -name headless_shell` returns) before rendering.

## Remotion rules used here

- All animation is driven by `useCurrentFrame()` + `interpolate`/`spring`. Never CSS animations or `setTimeout`.
- Scene timing comes only from `src/lib/plan.js` (`buildPlan`). When audio exists, `audio/timings.json` drives it.
- Static files are served from `channel/03-episodes` (public dir). Reference them with `staticFile('EP001/...')`.
- Layout is RTL (`direction: rtl`); wrap numbers that must read LTR in `direction: 'ltr', unicodeBidi: 'isolate'`.
- Type-check with `npm run check` after code changes.
