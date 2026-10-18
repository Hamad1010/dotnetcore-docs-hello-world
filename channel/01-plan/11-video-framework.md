# 11 · Video framework: how every long video is built

**Current version: v2** (18 Oct 2026). This file is the only place where the structure of a long video is defined.
`CLAUDE.md`, the `/new-episode` skill and the blueprint point here instead of repeating it, so a change made here
reaches everything at once.

## How the framework changes (without conflicts)

1. The owner asks for a change. Claude edits **only this file**: a new version number and one line in the changelog (§6).
2. Every script says which version it follows (`Framework v2` in its header). Approved scripts keep their version
   unless the owner asks to upgrade them. New scripts always use the newest version.
3. If a change needs a new kind of scene in the video, it is built in `04-studio/src/scenes/` and listed in §5.
4. When the look or the format changes, the first 30 seconds are rendered for approval before a full episode
   (`CLAUDE.md` rule 9).

## 1. The parts, in order (v2)

| # | Part | id | Time | What it does |
|---|---|---|---|---|
| 1 | القصة · the stop-scrolling story | `hook` | 0:00–0:45 | A short true story told in steps, with questions to the viewer. The striking number lands by 0:30 |
| 2 | الجسر + الحلقة المفتوحة · bridge and opening loop | `bridge` | ~30 s | The comparison that names the topic, what's coming, then the opening loop (§2.4) |
| 3 | المشكلة بالأرقام · the problem in numbers | `problem` | ~50 s | How big the problem is: 2–3 statistics, each made touchable (§2.3) |
| 4 | اختبر نفسك · self-check | `check` | ~50 s | 6–10 yes/no questions, then a simple score ("3 yes or more…") |
| 5 | الأدوات خطوة خطوة · tools, step by step | `tools` | 2–3 min | 3–5 numbered steps. Each says what to do, shows a real story or example, and how to start with no money |
| 6 | المخاطر وكيف تتجنبها · risks and how to avoid them | `risks` | ~50 s | 2–3 risks, each with a small real example and one clear way to avoid it. Skip it if the topic has none |
| 7 | تمارين يومية · daily exercises | `practice` | ~40 s | 2–3 exercises for everyday life |
| 8 | الخلاصة · the summary that sticks | `recap` | ~15 s | One sentence people remember and repeat |
| 9 | 3 خطوات + التعليقات · actions | `actions` | ~25 s | At most 3 actions (today / this week / this month), then ask for results in the comments |
| 10 | الحلقة المقفلة · closing loop | `close` | ~25 s | Pay off the opening loop (if not done yet), then a teaser for the next episode |

**Length:** minimum 5:00, target 6–8 min, about 5,200–6,200 spoken characters. Check a draft with
`python3 channel/06-tools/draft_length.py EP00N`.

## 2. Techniques used in every part

### 2.1 Tell it as a story, step by step (not direct)
- Tell it the way you would to people sitting in front of you: time words ("ذاك اليوم…", "بعدها بشهور…"),
  short sentences, pauses (…).
- Ask before you reveal: "تتوقعون كم دفعت؟" → pause → the number. "ايش صار؟" before every turn in the story.
- One idea per sentence. Keep the twist for last.
- The model is the owner's own rewrite of EP001's opening: "فيه شي شدّني ذاك اليوم… كان في أغسطس 2009…"

### 2.2 Steps anyone can follow
- Many viewers have a small salary or no job. Every tool must work with no money, a phone and this week.
- Name the step, give a concrete example from Saudi daily life (a home cook, a barber, a student, a phone
  repairer…), then say exactly what to do first.
- No jargon. If a word is needed, explain it at once with an everyday picture (leverage = the long wrench that
  loosens a stuck wheel nut).

### 2.3 Numbers you can touch (Dale Carnegie, *Public Speaking* · «فن الخطابة»)
- Every big number gets one everyday comparison: time ("لو تعدّها ريال كل ثانية… تحتاج أكثر من 2000 سنة"),
  people ("تقريبًا ربع سكان السعودية"), riyals, everyday things ("13 موظف: فريق كورة واثنين احتياط"),
  per-day rates ("أكثر من 2000 إنسان كل يوم"), simple fractions ("2 من كل 10").
- Vary the kind of comparison between episodes. The arithmetic goes in `sources.md` so anyone can check it.
  Round down safely ("أكثر من…", "تقريبًا…").

### 2.4 Opening and closing loops
- **Opening loop** (end of part 2, inside the first minute): one specific promise that makes people stay
  ("وفي آخر الحلقة… بقولك وش السؤال اللي كان أبوها يسألها على العشا"). Specific, honest, and always paid off.
- **Closing loop** (part 10): pay it off if it wasn't already, then open the next episode with a story teaser.
  The teaser is written last, once the next episode is confirmed in the tracker, and must not spoil its twist.

### 2.5 Quotes with credentials (when a quote fits)
- Before the quote, say who the person is: name and 1–2 achievements with numbers, so viewers know this is not
  an ordinary person ("ستيف جوبز… شارك في تأسيس أبل في كراج سنة 1976… وصارت أول شركة أمريكية قيمتها تريليون دولار").
- Only quotes with a traceable source: a speech transcript, the person's own book or post, a major outlet. Many
  famous quotes are misattributed; when in doubt, drop it. Translate faithfully, with no "improvements".
- At most 1–2 per video.

### 2.6 Risks and mitigations (part 6)
- A small real example for each risk (a news story, a study, a company) in 1–3 sentences, then one clear mitigation.
- Money: never present debt, trading or investing as a lever (`CLAUDE.md` rule 6).

### 2.7 Kept from v1
- One lesson per video, tied to business results; one "small move, big impact" detail; the owner's angles
  (leverage 10x/25x, scaling and alignment, comparisons that reveal opportunities, connections that pay off years
  later, the 1% a day). Stories depend on the topic; vary countries; an Arab/Gulf example when a verified one exists.
- No subscribe/like requests, no money promises, a gentle "talk to a specialist" line when stress comes up.
- **Callbacks:** a story from an earlier episode may come back in 1–2 sentences ("فاكرين براين أكتون؟"), never as
  the main story. It rewards returning viewers.
- A near-real example is marked **[مثال توضيحي]** in the script and labelled on screen.

## 3. From draft to video

1. Claude writes `03-episodes/EP00N/script-draft.md` (this framework, numbers as plain digits) and `sources.md`.
   Draft header: title, `Framework vN`, the hook in one line, where the opening loop is paid off, the small move,
   the teaser.
2. The owner reads the draft and approves it or says what to change.
3. After approval the draft is frozen. Claude builds `episode.json` from it (numbers become `{display|spoken}`),
   `npm run script` prints `script.md` (the recording copy) and the Recording Booth gets the text. From then on,
   `episode.json` is the source: later changes go there.
4. The owner records, then voice, preview and render (commands in `CLAUDE.md`).

## 4. Checklist before a draft goes to the owner

- [ ] All 10 parts are there (or a note says why part 6 is skipped), and the length check passes.
- [ ] The hook's twist lands by 0:30, with at least one question to the viewer.
- [ ] Every big number has a touchable comparison; every number and its arithmetic is in `sources.md`.
- [ ] Every quote has the person's name, numbers and a source.
- [ ] The opening loop is paid off; the teaser matches the next row of the tracker.
- [ ] Every tool step has a first move that costs nothing.
- [ ] A small move with big impact; every point ends in a business result.
- [ ] No subscribe/like, no promises, no investing tips; the specialist line if stress comes up.
- [ ] Nothing from private sources (`CLAUDE.md` rule 2).

## 5. Parts → video scenes (for the studio)

| Part | Scene type in `04-studio/src/types.ts` |
|---|---|
| `hook` | `storyhook` (built) |
| `bridge` | `overview` (built) |
| `problem` | to build: `stats` |
| `check` | to build: `selfcheck` |
| `tools` | `story` per step (from the earlier format, to restyle), or to build: `steps` |
| `risks` | to build: `risks` |
| `practice` | `practice` (earlier format, to restyle) |
| `recap` | `recap` (earlier format, to restyle) |
| `actions` | to build: `actions` |
| `close` | `outro` (earlier format, to restyle) |

## 6. Changelog

- **v2 · 18 Oct 2026.** From the owner's feedback on EP001's first 30 seconds: the story is told step by step with
  questions to the viewer; steps anyone can follow with no money; touchable numbers (Carnegie); quotes with
  credentials; opening and closing loops; new part 6, risks and mitigations; hook up to 45 s; callbacks; the
  draft → approval → `episode.json` flow.
- **v1 · 17 Oct 2026.** The owner's 8 parts for the business channel: story, smart transition, the problem in
  numbers, self-check, tools, exercises, summary, at most 3 actions.
