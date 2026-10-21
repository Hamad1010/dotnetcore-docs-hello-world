# Start here

**The channel:** «غرفة الفرص» (Opportunity Room): business lessons in simple **Saudi dialect** for anyone who wants
to find their talent, start a business and scale it. Each video teaches **one idea** with a true story, real
numbers, a quick self-test, tools, exercises and at most three actions. Emotional intelligence and social skills are
always tied to business results.

**The system:** you pick a lesson from the tracker, Claude writes and fact-checks the script, you record it in the
Recording Booth, and the studio links your voice and renders the video, thumbnail, subtitles and chapters.

---

## Your next 3 actions

1. **Watch part A again** (take 2, with the moving explanations, sound effects and the humming background) and
   approve it or say what to change; pick humming A or B by ear.
2. **Record the rest of EP001** (parts 3–10 of `03-episodes/EP001/script-draft.md`, framework v4.2) in the Recording
   Booth (https://claude.ai/artifact/6ygwHYvcEr24DeRoZysEgt) once part A is approved. One file is fine; you can read
   straight through.
3. **Pick a logo direction** (`03-episodes/_brand/out/logo-sheet.png`, render with `npm run brandkit`) and the handle.

Then follow the week-by-week coaching plan: [`01-plan/08-coaching-roadmap.md`](01-plan/08-coaching-roadmap.md).

---

## Map

| # | Folder / file | Use it when |
|---|---|---|
| 01 | [`01-plan/01-channel-blueprint.md`](01-plan/01-channel-blueprint.md) | You want the *why*: audience, positioning, name, format, quality bar |
| 01 | [`01-plan/02-mistakes-to-avoid.md`](01-plan/02-mistakes-to-avoid.md) | Lessons from established YouTubers: 30 mistakes, why we avoid each, and how the system prevents it |
| 01 | [`01-plan/03-viral-playbook.md`](01-plan/03-viral-playbook.md) | Titles, thumbnails, hooks, Shorts, 2026 platform features, Saudi seasons |
| 01 | [`01-plan/04-growth-and-scaling.md`](01-plan/04-growth-and-scaling.md) | Phases, targets, the 2027 monetization rule change, how we scale |
| 01 | [`01-plan/05-marketing-plan.md`](01-plan/05-marketing-plan.md) | Where we promote, weekly routine, budget, collaborations |
| 01 | [`01-plan/06-monetization-policy-legal.md`](01-plan/06-monetization-policy-legal.md) | YouTube rules, AI disclosure, copyright, Mawthooq license, US tax |
| 01 | [`01-plan/07-things-you-forgot.md`](01-plan/07-things-you-forgot.md) | Extra ideas that make the channel stronger |
| 01 | [`01-plan/08-coaching-roadmap.md`](01-plan/08-coaching-roadmap.md) | Step-by-step plan for the first 90 days |
| 01 | [`01-plan/09-setup-guide.md`](01-plan/09-setup-guide.md) | Installing on your Mac/PC, the private repo, the background-sound switch |
| 01 | [`01-plan/10-voice-guide.md`](01-plan/10-voice-guide.md) | Your voice vs your clone vs Polly, the AI label, how to record, the trial Short |
| 01 | [`01-plan/11-video-framework.md`](01-plan/11-video-framework.md) | How every long video is built (versioned): the parts, storytelling, touchable numbers, loops, quotes, risks |
| 02 | [`02-lessons/LESSONS.md`](02-lessons/LESSONS.md) | The business lesson catalog in publishing order (the earlier catalog is in `02-lessons/_archive-ei/`) |
| 02 | [`02-lessons/lessons.csv`](02-lessons/lessons.csv) | The tracker (open in Excel/Google Sheets) |
| 03 | [`03-episodes/EP001/`](03-episodes/EP001/) … `EP005/` | Lessons 1–5: `script-draft.md` (for your approval) and `sources.md`; EP001 also has the 30-second test |
| 04 | [`04-studio/`](04-studio/) | The video engine (Remotion). You rarely need to open it |
| 05 | [`05-templates/`](05-templates/) | Checklists + episode template |

## The weekly rhythm

| Day | Who | What | Time |
|---|---|---|---|
| Sat | Claude | Draft next 2 episodes (script + sources + publish kit) | — |
| Sat | You | Review the 2 scripts (approve / change) | 20 min |
| Sun | You or Claude | Voice + render + check preview frames | 20 min |
| Mon & Thu | You | Publish long video (Studio: upload, subtitles, chapters, thumbnail A/B test) | 10 min each |
| Daily | You | Post 1 Short; answer comments for 10 min | 15 min/day |
| Fri | You + Claude | Weekly review (`05-templates/weekly-review.md`): numbers, what to keep or change | 20 min |

## How to work with Claude on this

- **New video:** "Run `/new-episode`" (or "make the next episode"). Claude picks the next `todo` lesson from the tracker.
- **Change the format:** "Add … to the framework" → Claude updates `01-plan/11-video-framework.md` (new version, changelog).
- **Change something:** "In EP002 make story 3 shorter", "Switch the background to humming", "Thumbnail line should say …".
- **Weekly review:** paste your YouTube Studio numbers and say "run `/weekly-review`".
- The rules Claude follows are in [`../CLAUDE.md`](../CLAUDE.md).
