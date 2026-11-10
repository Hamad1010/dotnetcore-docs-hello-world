# 11 · Video framework: how every long video is built

**Current version: v6** (10 Nov 2026): season 2 (EP006 on) is built as in §2b; season 1 (EP001–EP005) keeps v5.5.
This file is the only place where the structure of a long video is defined.
`CLAUDE.md`, the `/new-episode` skill and the blueprint point here instead of repeating it, so a change made here
reaches everything at once.

## 0. Things that keep changing (and how we stay out of conflicts)

**The framework changes over time.**
1. The owner asks for a change. Claude edits **only this file**: a new version number and one line in the changelog (§7).
2. Every script says which version it follows (`Framework v3` in its header). Approved scripts keep their version
   unless the owner asks to upgrade them. New scripts always use the newest version.
3. If a change needs a new kind of scene in the video, it is built in `04-studio/src/scenes/` and listed in §6.
4. When the look or the format changes, the opening is rendered for approval before the full episode
   (`CLAUDE.md` rule 9). For v3 that is "part A": the first ~2 minutes (parts 1–2).

**The lesson order changes too.** An important lesson can move ahead of the plan when it is timely (news, a season
such as Ramadan or back to school, an event). To keep that safe:
- A lesson keeps its id (`L0xx`) forever. The episode number (`EP0xx`, «الملف 06») is given when the episode is
  produced, in publication order. The tracker's row order is the plan; moving a lesson means moving its row.
- Teasers and callbacks are written at production time, after the order is confirmed.
- If a timely episode jumps in after a teaser promised something else, it opens with one honest line ("قبل ما نكمل
  الملف اللي وعدتكم فيه… فيه شي صار هالأسبوع ما يتأجل"), and the promised episode comes right after it.

## 1. Every video is a journey on a map

The viewer starts at **"أنت هنا"** (where they are now: the problem, in their own words), passes **stations** (the
parts below), and arrives at a **destination** (what they can do after the video). Each episode picks its own start
and destination; the station names are plain words, not part numbers.
- The whole map appears in part 2: start, stations, destination, the marker at "أنت هنا".
- At every new part the marker moves on and the narration says it ("وصلنا للمحطة الثانية…", "باقي محطتين").
- In part 8 the marker reaches the destination and the narration looks back at the road travelled.
- **The map's shape (v5.2, the owner asked for a new one after EP002):** a trail that climbs a mountain to the flag on its
  summit, or a staircase whose top step is the destination; EP001–EP002 keep their winding road. `episode.json` →
  `"map": "mountain" | "stairs" | "wave"`; Shorts always use the winding road. **v5.4: the mountain, every episode,
  until the owner says otherwise** (their choice, 4 Nov 2026).
- **Season 2 (v6): a corridor of doors** (the owner's choice, 10 Nov 2026). The viewer walks down a corridor; every
  story is a door that opens as it starts, and the last door opens onto the room the episode promised («غرفة الفرص»).
  `"map": "doors"`; the stations are the stories.

## 2. The parts, in order (v3, part 10 added in v5)

| # | Part | id | Time | What it does |
|---|---|---|---|---|
| 1 | القصة · the stop-scrolling story | `hook` | 0:00–1:00 | A true story told in steps, with questions to the viewer. A twist in the first 30 s, the big number by ~0:45. Every name introduced (§3.4) |
| 2 | الجسر + الخريطة · bridge, map, opening loop | `bridge` | ~1:10 | The comparison that names the topic, the case file («الملف 01»), the journey map, the opening loop. No puzzle answer (v5.2) |
| 3 | محطة: المشكلة بالأرقام | `problem` | ~1:10 | How big the problem is: 2–3 statistics, each made touchable, and what it costs the viewer |
| 4 | محطة: اختبر نفسك | `check` | ~1:10 | 6–8 questions anyone understands (§3.8), a way to count, 3 result bands with what to do |
| 5 | محطة: الأدوات خطوة خطوة | `tools` | 3–3:30 | 3–5 steps. Each: what to do, why, a real story or example, and how to start with no money |
| 6 | محطة: فخاخ الطريق | `risks` | ~2:00 | 2–3 traps, each told as a mini-story (§3.7). Skip only if the topic has none |
| 7 | محطة: تمارين | `practice` | ~30 s | 2–3 exercises for everyday life |
| 8 | الوصول · the destination | `recap` | ~20 s | Look back at the road, then one sentence people remember and repeat |
| 9 | 3 خطوات | `actions` | ~30 s | At most 3 actions (today / this week / this month), then one question the viewer answers in the comments from their own life (§3.11) |
| 10 | وقفة · the faith pause (v5) | `faith` | 45–75 s | One verse and/or authentic hadith tied to the lesson, what it means, the link to the lesson and its effect on how we work, and a real story from the same sources when one fits (§3.15) |
| 11 | الحلقة المقفلة · closing loop | `close` | ~35 s | A 10–15 s bridge (a question that leads to the next file) with the «فيه مشهد في النهاية» pop-up, then the cliffhanger teaser on a dark screen (§3.16) |

## 2b. Season 2: the conversations that open doors (v6)

Season 2 (EP006–EP010) keeps everything the viewer knows from season 1: the owner's voice, the `aquarelle` look, the
techniques of §3 (a story told step by step, touchable numbers, every name introduced and shown in Arabic and English,
quotes with credentials, every sentence seen), the «وقفة», the dark teaser, no hype and no promises. **What changes is
the structure:** each episode is one kind of conversation, told through 4 to 8 stories.

**Who it is for:** teachers, content creators, technicians, book authors and coordinators (of projects or anything
else), who start with almost no network and no money. Every episode gives each of the five at least one story or
example that is theirs (real or a labelled illustration), and says their names in part 2.

**The five episodes:** EP006 «السؤال» (asking the right question, asking for advice) · EP007 «الانطباع» (the first
minutes with someone above you) · EP008 «التفاوض» (the conversation that makes the deal) · EP009 «الوصل» (introducing
people, being the bridge) · EP010 «الطلب الكبير» (asking for the position, the partnership, the investment).

| # | Part | id | Time | What it does |
|---|---|---|---|---|
| 1 | الباب الأول · the hook | `hook` | ~0:40 | The most surprising moment of the strongest story, told as a scene, stopping on a question |
| 2 | الممر · door, map, loop | `bridge` | ~0:50 | The callback to the last episode's question; what this episode opens and for whom (the five audiences by name); the case file («الملف 06»); the corridor of doors; the opening loop |
| 3 | القصص · stories 1…N | `story1`…`storyN` | 10–13 min | 4–8 stories, each behind its own door, each in the six beats below; at least half real and documented |
| 4 | النمط · the pattern | `pattern` | ~1:00 | The one principle under all the stories, in a sentence people repeat, and when it does not work |
| 5 | جرّبها · practice | `practice` | 1–2 min | Two scenarios to try this week, each with its «وش لو…؟» fork |
| 6 | 3 خطوات + سؤال الحلقة | `actions` | ~0:40 | Today / this week / this month, then one question for the comments from the viewer's own life |
| 7 | الدليل · the guide | `guide` | ~0:20 | One honest sentence on what the PDF guide adds and where it is; no pressure, no countdown, no "limited" |
| 8 | وقفة | `faith` | 45–75 s | As §3.15 |
| 9 | الحلقة المقفلة | `close` | ~0:40 | As §3.16: a bridge with the pop-up, then the dark teaser of the next file |

**Length:** 14–18 minutes, about 9,500–12,200 spoken characters (`draft_length.py`). Never pad: a short draft gets
another story, not filler.

**Every story in six beats:**
1. **الشخص · the person:** who, and what they lacked (no network, no money, a normal job), in one line the viewer
   recognises themselves in.
2. **اللحظة · the moment:** the one conversation (a meeting, a call, a message, a chance encounter) told as a scene:
   when, where, what was at stake, with dialogue (§3.18).
3. **«وش لو…؟» · what if:** a pause before the move: what most people would say there, played out to what it costs (a
   "no", silence, a deal lost). It must be what a reasonable person would really do, never a straw man. On screen: the
   fork's red path.
4. **الحركة الصح · the right move:** what was actually said or done, step by step (the fork's green path).
5. **ليش تشتغل · why it works:** the psychology in plain words, one idea per story.
6. **الدليل · the evidence:** right after the story, one or two studies, surveys or statistics, each with who did it,
   where, when, how many people and one touchable number (the evidence card), and the business result: a position, a
   deal, a partner, a customer.

**Real and imagined:** a real story uses only documented facts, and a real person's words only when they are on record
(otherwise «سأله… وش تشتغل؟ وكيف؟» as a paraphrase); an imagined story is built from the research, labelled «مثال
توضيحي» on screen, and its person has a first name, a job and a Saudi city. Between the stories, the corridor moves to
the next door («الباب الثاني…»). Vary countries and industries, and put an Arab or Gulf story in when a verified one exists.

**Length: at least 8:00**, target 9–12 min, about 6,100–8,100 spoken characters at the owner's real pace (11.3
characters per second including pauses, measured on the second take of EP001's part A; the first take was 9.6).
The owner may keep a video longer when the content earns it (EP001's full script stays at ~9,200 characters, about
13–16 minutes depending on the pace). YouTube allows mid-roll ads only
on videos of 8 minutes or more. `python3 channel/06-tools/draft_length.py EP00N` warns below 8:00. Never pad: when a
draft is short, add a story, an example or a clearer explanation, not filler.

## 3. Techniques used in every part

### 3.1 Tell it as a story, step by step (not direct)
- Tell it the way you would to people sitting in front of you: time words ("ذاك اليوم…", "بعدها بشهور…"), short
  sentences, pauses (…).
- Ask before you reveal: "تتوقعون كم دفعت؟" → pause → the number. "ايش صار؟" before every turn in the story.
- One idea per sentence. Keep the twist for last. The model is the owner's own rewrite of EP001's opening.
- **The middle is never skipped (v5.1, the owner's rule).** Every event comes in order, cause then effect, so nobody
  wonders how we got here: «وجرّبت تحل المشكلة بنفسها. وانحلت بالفعل… وهنا جاتها الشرارة.» Before a draft goes out,
  read each story as a numbered list of events and check that none is missing between two lines.
- **Plain and explicit beats clever.** Say the thing outright: «يرفضونها» rather than a bare «لا»; «الشركة الصغيرة اللي تو
  فتحوها بتفلس» rather than «الصغير بينتهي»; a teaser that ends on a full question («ايش السر اللي سووه عشان يخلون العملاق
  الأمريكي يدفع هالمبلغ؟») rather than «وش سوّوا؟».
- **Like talking to a friend (v5.4, the owner's rule).** Every draft goes through the `humanizer` skill
  (`.claude/skills/humanizer`) before the owner sees it: fewer slogans and «مو كذا… كذا» contrasts, no closing line that
  repeats what the story just showed, no inflated words; every sentence adds something new. It changes the wording only:
  every fact, number, quote and story stays, and the owner's own phrases and asides stay.
- **The owner's warm asides.** Short spoken asides that make it a conversation, one or two per part, never forced:
  «لا تنسى»، «لا طبعًا»، «يا حبيبي»، «على طبق من ذهب»، «وعلى الطاري»، «أكيد يدور في بالك»، «بوضح لكم أكثر، ولا
  يهمكم»، «فيه فرق بين الاثنين».
- **Talk to the person in the story (the owner's favourite).** Comment to them as if they were in front of you, on what
  they don't see: «طيب… لو أي أحد يسويها… ليش يتصلون فيها هي بالذات؟»; «يا سارة… سبع سنين تسمعين «لا»… وما
  انتبهتي إنك كنتي تتدربين؟». At least once in every story.
- **Labels the viewer doesn't need go.** No «وقفة قصيرة» announcing a pause, no «قال المفسرون» when the meaning can simply
  follow («يعني…»); the source stays in `sources.md`.

### 3.2 Steps anyone can follow
- Many viewers have a small salary or no job. Every tool must work with no money, a phone and this week.
- Name the step, give a concrete example from Saudi daily life (a home cook, a barber, an AC technician, a
  student…), then say exactly what to do first.
- No jargon. If a word is needed, explain it at once with an everyday picture.

### 3.3 Numbers you can touch (Dale Carnegie, *Public Speaking* · «فن الخطابة»)
- Every big number gets one everyday comparison: time ("لو تعدّها ريال كل ثانية… أكثر من 2000 سنة"), people
  ("ربع سكان السعودية"), riyals, everyday things ("فريق كورة واثنين احتياط"), per-day rates, simple fractions
  ("من كل 4… راح 3").
- Vary the kind of comparison. The arithmetic goes in `sources.md`. Round down safely ("أكثر من…", "تقريبًا…").

### 3.4 Introduce every name (new in v3)
- Our viewers may never have heard of a person, a company or an organisation. The first time a name appears, say
  what it is in plain words and give 1–2 achievements with numbers ("فيسبوك… اللي كان يستخدمها وقتها أكثر من 250
  مليون إنسان"; "ياهو… من أشهر مواقع الإنترنت وقتها").
- Fewer names, introduced well, beat many names said in passing.
- **On screen, a foreign name is in Arabic and English (v5.5, the owner's rule).** A person, company or place whose
  name isn't Arabic is written in Arabic with its English form under it («وارن بافيت» / Warren Buffett): `en` on a
  profile, globe or photo moment, `whoEn` on a quote. The script and the narration stay Arabic only.
- Company examples don't have to be famous brands. Any well-documented company works, including the world's largest
  (Forbes Global 2000, Fortune Global 500): introduce it with its rank or one big number ("مايكروسوفت… من أكبر 10
  شركات في قائمة فوربس لأكبر 2000 شركة في العالم").

### 3.5 Opening and closing loops
- **Opening loop** (part 2): one specific promise that makes people stay. Specific, honest, always paid off.
- **Pay it off by telling it, never by pointing back at it (v5.4, the owner's rule):** no «اللي وعدتك فيها»، «زي ما
  وعدتكم»، «مثل ما قلت لكم» when the loop comes back. The story or the move simply arrives: «وهنا الحركة الصغيرة: …»،
  «وهنا قصة البنك: …». The same goes for every callback: one plain question («تذكر الـ62%؟») at most.
- **Closing loop** (part 11 since v5): pay it off if it wasn't already, then a cliffhanger about the next file: a question
  or a half-told story, without spoiling its twist. Written last, once the next episode is confirmed. It opens with a
  10–15 s bridge (a question that leads to the next file) for the «فيه مشهد في النهاية» pop-up, and the teaser itself
  plays on a dark screen (§3.16).

### 3.6 Quotes with credentials (when a quote fits)
- Name and 1–2 achievements with numbers before the quote (§3.4). Only quotes with a traceable source; translate
  faithfully; at most 1–2 per video.

### 3.7 Traps told as mini-stories (part 6, new in v3)
Each trap goes through five steps, so it is clear and not just a warning:
1. **What happened:** a real case, told in steps with the names introduced (date, place, what was done).
2. **Why it happened:** the cause in one plain sentence.
3. **What it cost:** the numbers, made touchable.
4. **The same trap in your life:** an everyday example ([مثال توضيحي]).
5. **How to avoid it:** 2–3 concrete moves ("أول شي… ثاني شي… ثالث شي").
- Money: never present debt, trading or investing as a lever (`CLAUDE.md` rule 6).

### 3.8 A self-check anyone understands (new in v3)
- Start with how to count: "خذ ورقة… أو عدّ على أصابعك. كل «نعم»… إصبع."
- 6–8 questions. Each is one short question plus a one-line everyday example ("مثل: كم السعر؟ وين موقعكم؟").
- End with 3 bands (0–2, 3–5, 6+), each saying what to do now and which step of the video is for them.

### 3.9 The series is a detective show (new in v3)
- Each episode is a case file: «الملف 03 · سر الـ3.1 مليار». The lesson is the clue that solves the case. From v5.2 a
  case is named with «سر» or «قصة», never «لغز», so nobody waits for a puzzle.
- **Callbacks:** at least one small detail from an earlier file (a number, a name), with a YouTube card to it at that
  moment. New viewers get curious and watch the older files; that adds watch hours.
- **Cliffhanger** at the end + an end screen to the next file; one playlist per season, in order ("ابدأ من الملف 01").

### 3.10 What keeps people watching (the healthy kind of "dopamine triggers")
- A small question that is answered within the minute, many times; one big loop to the end.
- Progress you can see: the marker on the map, "باقي محطتين".
- A surprising fact every 60–90 seconds, at a moment they don't expect.
- Something changes on screen every few seconds (a card, a number, a silhouette, the map); a sound at each station.
- Personal stakes (their self-check score), quick wins (an exercise that works today), and the owner's replies in the
  comments.
- **Never:** a promise that isn't paid off, fake urgency, fear, misleading titles or thumbnails, or prizes that work
  like gambling. They break trust (our whole brand) and YouTube's policies.

### 3.11 No puzzle (v5.2; the puzzle of v3–v5.1 is retired)
- The owner saw no value in the episode's puzzle: from EP003 there is none, and the next file never gives an answer
  (EP002's puzzle stays unanswered on purpose).
- Part 9 ends instead with one question the viewer answers in the comments from their own life, tied to the lesson
  (EP002: «وش الشي اللي الناس دايم يطلبونه منك؟»). No prizes, no winners.

### 3.12 Kept from earlier versions
- One lesson per video, tied to business results; one "small move, big impact" detail; the owner's angles
  (leverage 10x/25x, scaling and alignment, comparisons that reveal opportunities, connections that pay off years
  later, the 1% a day). Stories depend on the topic; vary countries; an Arab/Gulf example when a verified one exists.
- **Saudi first (v5):** wherever it fits, the real stories, numbers and use cases come from Saudi Arabia: a verified Saudi
  founder or company, a Saudi statistic (GASTAT, the ministries, Gallup's Saudi data), a Saudi tool (the freelance
  document, Monsha'at), and Saudi daily life in every [مثال توضيحي] (Riyadh, Jeddah, Dammam, a كشتة, a family occasion).
  Two limits: nothing that hurts, mocks or embarrasses a person, family, tribe, region or group (no living private
  person's failure, no gossip), and never a story the tracker plans for a later episode (check `lessons.csv` →
  `story_lead` and `story-bank.csv` before using it).
- No subscribe/like requests, no money promises, a gentle "talk to a specialist" line when stress comes up.
- A near-real example is marked **[مثال توضيحي]** in the script and labelled on screen.

### 3.13 The publish kit (new in v4)
**v5.3: no thumbnails and no Shorts until the owner decides** (their rule, Nov 2026). The kit is `publish.md`: titles
(through `/yt-package`), descriptions (through `/yt-seo`), tags, chapters (through `/yt-chapters`), the pinned comment.
What follows about thumbnails waits until then.
Every full script comes with `publish.md` and three thumbnail images, so the owner judges the whole package:
- **3 video titles, told as a story (v5):** the owner's model is the Saudi storytelling title: a person, what happened
  to them, the turn, and what it leaves open («…وبعد سبع سنين صار اللي ما توقعه أحد»), so the viewer wants to know what
  happened. Every word is true and happens in the video (best in the first 30 s); the turn the title promises is the one
  the video shows; no drama the story doesn't have (tears, prison, a death, «صدمة»). The hook and the main words sit in
  the first ~60 characters (phones cut there), the whole title in 100 (YouTube's limit). Searched words go in where they
  fit naturally (موهبة، مشروع، دخل، من البيت). Never a verse or a hadith as a hook. EP002 has 20 titles.
- **3 thumbnails (text + image):** at most 4 words, one big number or one strong word, one silhouette visual, high
  contrast, the file badge. Each matches a title and what the viewer sees in the first 30 seconds. The texts live in
  `thumbs.json`; `npm run thumbs -- EP00N` renders `out/thumb-1.png` … `thumb-3.png`. (`"layout": "design"` picks one of the ten designs in
  `04-studio/src/ThumbDesigns.tsx` or the sixteen story designs in `ThumbStories.tsx`; the text of a headline is fitted to its
  column automatically.) The owner can ask for more: EP001 has 10 titles,
  10 thumbnails and 5 descriptions.
- **2–3 descriptions:** the first two lines carry the hook and the main search words (they show before "more"); then
  what the viewer will learn, the chapters, the sources, and at most 3 hashtags.
- **The words people search:** before publishing, check YouTube Studio → Analytics → Research (searches across
  YouTube) and Google Trends for Saudi Arabia. Prefer phrases our viewers type (مشروع، فكرة مشروع، دخل إضافي، بدون
  رأس مال، من الجوال، الذكاء الاصطناعي) when the video really covers them.
- **Never:** words the video doesn't deliver, money promises ("اربح…"), fake urgency, other brands' logos. YouTube
  treats misleading titles and thumbnails as spam, and they cost trust.

### 3.14 Every sentence is seen: explainer moments and sound (new in v4.2)
The owner's rule after part A: the screen must move with the voice. Nothing may sit still while a story is told.
- **A moment on the word.** Whenever the narration brings in a name, a date, a number, a quote, a comparison, a list,
  a question or something hidden, a visual appears on that word: the scene's `moments` in `episode.json`
  (`04-studio/src/components/Moments.tsx` and `MomentKinds.tsx`). Kinds: `date` (a calendar, years flipping),
  `profile` (who or what, filled in field by field as it is said), `stamp` («مرفوض»), `quote` (typed word by word as
  it is read, with the original line), `count`, `question` (a pause to guess), `share` (a map of dots filling: a
  quarter of Saudi Arabia, a third of the Earth), `chips` (a short list, crossed out), `people`, `tally` ("count it one
  riyal a second…"), `send` (an item travelling from one card to another), `mystery` (a hand holding something hidden:
  an opening loop), `headline` (a station's title or a punchline), `wrench` (same force, longer handle), `clock` (the
  24 hours everyone has), `times` (15 × Saudi Arabia, 7 doors that say «لا»), `quiz` (the self-check), `versus` (two
  things side by side), `chat` (a phone, messages on their words), `math` (a sum built term by term), `steps`, `alert` (a phone's emergency alert), `button`, `globe` (flying from Riyadh to the place),
  `search` (a query and a rising trend), `file` (the next case file), `scripture` (a verse or a hadith, its words lit as
  they are read, v5), `endscene` (the «فيه مشهد في النهاية» pop-up, v5), and for season 2 (v6) `whatif` (the «وش لو…؟»
  fork: the usual move down a red path to its cost, the right move down a green path to its result, each on its word)
  and `evidence` (the study card: who, in Arabic and English, the year, the question, then the number counted on its
  word).
- **The second half waits for its word:** a headline's sub line, a step's detail, a comparison's note or a profile's
  field appears when it is said (`subCue`, `noteCue`, `labelCue`, a field's `cue`), so long sentences build in beats.
  A made-up example carries `illustration: true` (the «مثال توضيحي» chip) and a number its `source` line.
- **Never still for more than ~4 seconds,** and never empty placeholders while the story is told. One idea per
  shot: at most 2–3 moments on screen; each leaves when the next takes its place (or on its `until` word).
- **A sound for each moment,** short and never melodic (pop, tick, typing, swish, stamp, coin, paper, a rising hiss
  into the big reveal, then an impact); a whoosh between scenes. They sit well under the voice
  (`04-studio/src/components/Sfx.tsx`). **v5.4: the «foley» set** (the owner asked for new sounds): a card laid down, a
  chip, a card slid or fanned, a book placed or flipped, a riffle before a reveal, coins, a leather drop, a wooden knock,
  from Kenney's CC0 packs (public domain), matched to the old loudness (`06-tools/sfx_foley.py` → `_assets/sfx-foley/`).
  `channel.json` `"sfx": "foley"`; EP001–EP003 keep `"synth"` (`npm run music -- sfx`).
- **The channel's avatar at the top right (v5.4, the owner's request):** the avatar from the channel's YouTube page
  (`03-episodes/_assets/brand/avatar.png`) in the top bar of every scene and in the intro and end lockups.
- **Photos (v5.5):** only public domain or CC0, never a face we have no right to, each with its page in `sources.md`.
  Found on Wikimedia Commons (its API, slowly: it rate-limits this session; files from upload.wikimedia.org at a standard
  thumbnail width such as 500, 960 or 1280 px) or Openverse. The `photo` moment lays one on the page as a watercolor
  print (softened colours, the paper's grain, torn edges, a slow push in) with its caption in Arabic and English and its
  credit line; a few per episode, on a place or a thing the narration names, about 3 seconds each. **Never a photo of a
  woman (the owner's rule, Nov 2026):** a woman in a story gets the watercolor avatar (the profile card's painted
  portrait); each photo is looked at before it is used (no women, no logos, no one we have no right to show).
- **The background: soft hums, no instruments, never sad.** Its job is that the voice is never alone: quiet, curious,
  good for analysis, and since v5.3 a bit noticeable (the owner asked for it 5 dB louder). The owner chooses it by ear (their "Detective
  Backgrounds" hums, or beds made with `06-tools/ambient_bed.py` or `humming_bed.py`; screen each with
  `06-tools/listen_check.py`). `channel.json` → `"background"` (a file in `_assets/music/`, at -18 LUFS) and
  `"backgroundLevel"` (how many dB under the voice: 15 from v5.3, 20 in EP002–EP003, 25 in EP001); it rises 4 dB in the pauses between scenes
  and fades out for the «وقفة» (§3.15).
- **Cues are spoken words,** checked against the recording's word marks; `phrase@2` picks a phrase's second
  occurrence when the first one is elsewhere (e.g. «ألفين» in 2009 and in 2000 years).

### 3.15 The «وقفة»: a verse and a hadith before the end (new in v5)
The owner's request after EP001: a short religious pause, tied to the lesson, before the teaser.
- **Where and how long:** part 10, after the 3 steps and before the close. 45–75 seconds, calm.
- **What it holds:** one verse and/or one or two hadiths that truly relate to the lesson; what they mean, from a known
  tafsir or sharh (al-Muyassar, Ibn Kathir, al-Sa'di, al-Tabari; Fath al-Bari, al-Nawawi, HadeethEnc or Dorar for a hadith);
  the link to the lesson in plain words, said as ours after the explanation, never as tafsir (the meaning can follow
  the verse directly with «يعني…», without naming the tafsir aloud); the effect on how we
  work («والأثر؟…»); and a real story from the Quran or the authentic Sunnah when one fits (EP002: the prophets herded sheep).
- **Only these sources:** the Quran, as written in the Madinah mushaf (Uthmani script, with tashkeel), with surah and
  ayah; hadith only from Sahih al-Bukhari or Sahih Muslim, with book and number, in their exact wording (quoting part
  of one is fine). Never from memory: every text is checked against two references (Quran.com or the King Fahd Complex;
  Dorar or Sunnah.com) and listed in `sources.md` with the tafsir used. Well-known sayings that are not in the two
  Sahihs (e.g. «إن الله يحب إذا عمل أحدكم عملًا أن يتقنه») are not used here. When a word's meaning is disputed, the
  narration doesn't explain it.
- **Tone:** mainstream meaning only; nothing sectarian, no fiqh rulings, no promises ("do this and you'll get rich").
  Never used as a title, a thumbnail or a Short hook.
- **On screen:** the verse and the hadith appear as they are read, in a Quran-appropriate font, with their reference;
  a long verse breaks its line at a pause mark; a hadith told in pieces, with the narration between them, stays one card
  with each piece on its own line, lit when it is said (EP003); no sound effects, and the background hum fades out for
  the whole part. Never a picture of the Prophet ﷺ, any prophet or companion: only text, nature, sheep, landscapes.
- **The owner** reads the verse exactly as written, with its tashkeel, and says «صلى الله عليه وسلم» in full.

### 3.16 The ending: «فيه مشهد في النهاية» and the dark teaser (new in v5)
Like a TV show or an anime that keeps a scene after the credits:
- **The pop-up:** about 10 seconds before the teaser, during the close's opening bridge (never over a verse or a hadith),
  a small card slides in: «فيه مشهد في النهاية», with one soft sound. It leaves when the teaser starts. The bridge
  sentence must last 10–15 s so the pop-up has its time.
- **The dark screen:** on the teaser's first word the whole screen turns from light to dark in about a second (dark
  navy, a soft spotlight, light text, cards that glow), and the next file's end card stays dark.
- **Honest:** the promised scene really comes and is worth waiting for: a real cliffhanger about the next file.

### 3.17 A clear, close voice (new in v5)
After EP001 the owner asked for a voice that sounds like a studio, not a room. Most of it is won while recording; the
cleaning does the rest.
- **Recording:** a small room full of soft things (a closet of clothes is ideal), never a bathroom, kitchen or empty room;
  no AC or fan; the phone in airplane mode, 15–20 cm from the mouth and slightly to the side, on a stand so the distance
  never changes; speak a bit closer and softer rather than loud and far; record 5 seconds of silence first. iPhone:
  Settings → Apps → Voice Memos → Audio Quality → Lossless. Details: `10-voice-guide.md` §5.
- **Cleaning** (`06-tools/clean_recording.py`): retakes, stutters and long pauses removed; then noise learnt from the
  quiet parts and removed, room echo shortened, the voice's low rumble and boom cut, presence and air brought up,
  sibilants softened, gentle compression, and loudness to -16 LUFS. **Breaths go too** (from EP003, the owner's request):
  between two words the inhalations, lip clicks and room are silenced. Each word keeps its own sound: its voice, a
  final س or ف or ه as long as it goes on, a stop's release (a hissed final ت), and the س ش ص or ف ح خ ه that leads into
  the next word. A sound classifier checks that no silenced stretch is speech. Lines of a few seconds get the same
  loudness as the rest (a gain and a peak limiter). A word said wrong can be replaced by the same word said right
  elsewhere in the recording (`audio/cuts.json`). Each finished scene is transcribed again, and the report lists any word
  that can't be heard any more.
- **A podcast voice (v5.3, the owner's request):** from EP004 the sound the viewer hears is the `audio-cleanup` skill's
  podcast preset (`.claude/skills/audio-cleanup`) on the noise-cleaned voice: more body at 200 Hz, presence at 3 kHz,
  the hiss above 14 kHz cut, a gentle 3:1 compressor. The cuts, pauses and breaths are still decided as above, so
  nothing else changes; `--voice=studio` gives the v5 sound.
- **A clearer voice (v5.5; the owner compared it on 10 Nov 2026 and kept the podcast voice, sample A):** measured on EP004's recording, the voice stopped at
  about 11 kHz and its low-mids sat ~15 dB over the middle, which is what sounds like an old recorder, and the podcast
  preset made the boom heavier still. `--voice=clear` takes the boom down about 9 dB, lifts presence a little and puts
  air back above 8 kHz (an exciter makes it from the voice's own 5–9 kHz, a shelf lifts it, the de-esser keeps س and ش
  soft). It can't bring back what was never recorded: the real fix is the recorder's best setting (iPhone: Settings →
  Apps → Voice Memos → Audio Quality → Lossless; Samsung Voice Recorder: Settings → Recording quality → High) and
  sending the original file, never through WhatsApp.

### 3.18 Dialogues (new in v5.1)
When the episode's skill happens in a conversation (asking people, offering, pricing, answering a customer, negotiating),
show it as a short dialogue of 2–6 lines: two voices, Saudi names and places, what is said, and what changes because of it.
- **Written by us, always.** Every dialogue is ours, built from the skill's idea. The trainers' courses, the dialogue course
  the owner named included, are a syllabus only: no dialogue, example, sentence or list is copied from them, and no trainer or
  course is named in anything public (`CLAUDE.md` rule 2). Using a trainer's own dialogue needs that trainer's written
  permission first.
- **Or real and documented.** A real conversation of a known master (a founder, a negotiator, a leader) with a traceable
  source, introduced with credentials (§3.4, §3.6).
- A made-up dialogue carries [مثال توضيحي]; on screen it plays as a `chat` moment, each bubble on its words. The owner reads
  both voices.

## 4. From draft to video

1. Claude runs `/yt-script` (five hooks for part 1, scored) and writes `03-episodes/EP00N/script-draft.md` (this
   framework, numbers as plain digits), `sources.md` and the publish kit (§3.13): `publish.md` (no thumbnails while
   they are paused).
   Draft header: title, case file, `Framework vN`, the journey (start → stations → destination), where the opening
   loop is paid off, the small move, the map's shape, the teaser, and where part A ends.
2. The owner reads the draft and approves it or says what to change.
3. After approval the draft is frozen. Claude builds `episode.json` from it (numbers become `{display|spoken}`),
   `npm run script` prints `script.md`, and the Recording Booth gets the text: one numbered sentence per line, each
   ending at a red stop, so the owner knows where a sentence ends and retakes only that sentence (v5.1). From then on, `episode.json` is the
   source: later changes go there. After the recording is synced, Claude adds the scenes' `moments` (§3.14),
   checks that every cue lands on its word, and looks at stills taken on those words before rendering.
4. When the format is new, the owner records part A first and Claude renders it for approval; then the rest.

## 5. Checklist before a draft goes to the owner

- [ ] All 11 parts (or a note saying why part 6 is skipped); `draft_length.py` shows at least 8:00.
- [ ] The journey: start, stations and destination named in part 2; every part opens with its station.
- [ ] Every person, company and organisation is introduced with numbers the first time it appears.
- [ ] The hook: a twist in the first 30 s; at least one question to the viewer.
- [ ] Every big number is touchable; every number and its arithmetic is in `sources.md`.
- [ ] Every trap follows the five steps; every tool step has a first move that costs nothing.
- [ ] The self-check says how to count and ends with 3 bands.
- [ ] Opening loop paid off by telling it, with no «وعدتك» line (v5.4); a callback (from EP002 on); no puzzle and no puzzle
  answer (v5.2); the teaser matches the tracker.
- [ ] The `humanizer` pass done: it reads like talking to a friend, and no fact, number or quote changed (v5.4).
- [ ] The hook: five options scored with `/yt-script`; the owner sees the top two.
- [ ] The publish kit: 3 titles (through `/yt-package`), 2 descriptions (§3.13); no thumbnails or Shorts (v5.3).
- [ ] A small move with big impact; every point ends in a business result.
- [ ] No subscribe/like, no promises, no investing tips; the specialist line if stress comes up.
- [ ] Saudi stories, numbers and examples wherever they fit; nothing that hurts anyone; no story a later episode plans.
- [ ] The «وقفة»: exact texts (surah and ayah; al-Bukhari or Muslim with its number), the tafsir or sharh named in
  `sources.md`, the link and the effect in plain words, 45–75 s (§3.15).
- [ ] The close: a 10–15 s bridge for the pop-up, then the teaser marked for the dark screen (§3.16).
- [ ] Titles in the story style, every word true and shown in the video (§3.13).
- [ ] Every story read as a list of events: nothing missing in the middle (§3.1); the person in the story is spoken to
  at least once; a dialogue where the skill is a conversation (§3.18).
- [ ] Nothing from private sources (`CLAUDE.md` rule 2).

- [ ] Season 2 (v6): every story in the six beats; at least half real; every «وش لو…؟» fair; every study checked
  (authors, year, where, how many people) and on an evidence card; the five audiences each have a story; the guide line
  honest (§2b).

## 6. Parts → video scenes (for the studio)

| Part | Scene type in `04-studio/src/types.ts` |
|---|---|
| `hook` | `storyhook` (built) |
| `bridge` | `overview` (comparison, topic, case file) + `journey` (the map) (built) |
| every station start | `journey` with `at` = the station (built); the episode's `map` picks the shape (`wave`, `mountain`, `stairs`) |
| `problem`, `check`, `tools`, `risks`, `practice`, `actions`, `close` | `stage` (built): an empty stage with the station chip, filled by its `moments` (the self-check is a `quiz`) |
| `recap` | `journey` at the destination (built): the road lights up from `glowCue` to `glowEndCue`, then fades at `focusCue` for its moments |
| season 2 (v6) | `"map": "doors"`: the corridor of doors at the bridge and at the start of every story (`journey` with `at` = the door); each story is a `stage` scene with a `whatif` moment (the fork) and an `evidence` moment (the study card) |
| `faith` | `stage` with `quiet: true` (no sound effects, the background fades out) and `scripture` moments: the verse or hadith typed as it is read, with its reference |
| `close` | `stage` with an `endscene` moment (the «فيه مشهد في النهاية» pop-up, from the bridge's first word `until` the teaser's) and `darkCue` = the teaser's first word |
| end card | `stage` with no narration (built): the next `file` from second 0 (`at: 0`), moved up to leave room for YouTube's end-screen elements; `dark: true` after a dark teaser |
| every scene | `moments` on the narrator's words, each with its sound (§3.14) |
| the episode | from EP005 (v5.5): `"look": "aquarelle"`, `"motion": "rich"`, `"map": "mountain"` (EP004 keeps `"watercolor"`); the sounds and the background level come from `channel.json` |

## 7. Changelog

- **v6 · 10 Nov 2026.** Season 2's structure (§2b), approved by the owner with the corridor of doors as its map (§1)
  and the «وش لو…؟» fork on screen: 4–8 stories in six beats, the evidence after each story, the five audiences, the
  guide line. Season 1 keeps v5.5. The owner approved the `aquarelle` look and kept the podcast voice (sample A) over
  the clearer chain (§3.17).
- **v5.5 · 10 Nov 2026.** From the owner after EP004: the whole video in watercolor with minimal anime, the
  `"aquarelle"` look from EP005 (§6): cards of torn paper lifted off the page, some taped down with washi tape, pigment
  blooming behind the big reveals in place of impact lines, sparkles and focus lines, painted avatars and badges, a
  soft pencil line in place of the ink outline, soft clouds; the motion stays rich. Foreign names on screen in Arabic and
  English (§3.4). Photos back (public domain or CC0, as a `photo` moment) and never a photo of a woman (§3.14). A clearer
  voice proposed for the owner's ear (§3.17). Tested on EP004's first 48 seconds (rule 9).
- **v5.4 · 4 Nov 2026.** From the owner after EP004's draft: every script goes through the `humanizer` skill so it reads
  like talking to a friend, and a loop is paid off by telling it, never with «اللي وعدتك فيها» (§3.1, §3.5, §5); the
  mountain map for every episode until they say otherwise (§1); new sound effects, the «foley» set from Kenney's CC0
  packs (§3.14); the channel's avatar at the top right of every video (§3.14); photos only when public domain or CC0,
  none while the network blocks the photo libraries (§3.14). The v5.3 trial is approved: the podcast voice, the
  background at 15 dB and the rich motion are the standard from EP004 (`"motion": "rich"`).

- **v5.3 · 3 Nov 2026.** From the owner after EP003: no thumbnails and no Shorts until they decide (§3.13); the
  `youtube-agent` skills at every stage, from the script (`/yt-script` scores five hooks) to the publish
  (`/yt-package`, `/yt-edit`, `/yt-chapters`, `/yt-seo`, `/yt-comment`, `/yt-retention`; CLAUDE.md rule 12); a podcast
  voice from the `audio-cleanup` skill (§3.17); the background 5 dB louder, 15 dB under the voice (§3.14). On trial
  with a 60-second test from EP003: richer motion on the watercolor-anime look (`episode.json` `"motion": "rich"`:
  brushes wiping between scenes, headlines landing word by word on a painted underline, an impact when a number lands,
  cards that bounce in, ink thrown by stamps, sun rays and motes on the paper); the owner decides whether it stays.

- **v5.2 · 28 Oct 2026.** From the owner after EP002: no more puzzles, and EP002's puzzle gets no answer; part 9 ends with
  one question the viewer answers from their own life (§2, §3.11); case names use «سر» or «قصة», never «لغز» (§3.9). A new
  shape for the journey map: a mountain trail or a staircase, chosen per episode (§1, §6). From the owner's EP003
  recording: the cleaning removes breaths and can patch a wrong word with the same word said elsewhere (§3.17).
  An experiment the owner asked for on EP003: a look between watercolor and anime (`episode.json` `"look": "watercolor"`:
  paper and pigment washes, an ink line and a cel shadow on every card, an anime sky over the map). The layouts and this
  framework don't change; the owner decides after the 30-second test whether it stays. On screen in the «وقفة»: a hadith
  told in pieces is one card, each piece lit on its own word (§3.15).

- **v5.1 · 25 Oct 2026.** From the owner's revision of EP002: the middle of a story is never skipped; plain, explicit
  wording; the owner's warm asides; talking to the person in the story; no labels the viewer doesn't need (§3.1, §3.15).
  Dialogues for conversation skills, always our own or real and documented, never copied from a course (§3.18). The
  Recording Booth shows one sentence per line with a stop at its end (§4).

- **v5 · 24 Oct 2026.** From the owner's notes after publishing EP001: titles told as stories, in the style of Saudi
  storytelling channels, every word true (§3.13); a new part 10, the «وقفة», with a verse and a hadith from al-Bukhari or
  Muslim tied to the lesson (§3.15); a «فيه مشهد في النهاية» pop-up about 10 s before the teaser, and the teaser on a
  dark screen (§3.16); Saudi stories, numbers and examples first wherever they fit, without hurting anyone or using a
  later episode's story (§3.12); the background 20 dB under the voice (§3.14); a clearer voice: recording rules and a
  stronger cleaning chain (§3.17). The close becomes part 11.

- **v4.4 · 21 Oct 2026.** Studio side only, no change for scripts: every part after the bridge is a `stage` scene
  filled with moments (§6); 14 new moment kinds and cues for a sentence's second half (§3.14), built for the full
  EP001. Publish kit tooling (§3.13): ten thumbnail designs, and `npm run launchkit` for the channel's avatars and banners
  (`01-plan/14-brand-kit.md`).

- **v4.3 · 21 Oct 2026.** The background: soft hums with no instruments, never sad, quiet under the voice (the
  owner's "Detective Backgrounds" style), picked by ear from options compared at three levels; `channel.json` names
  the file and its level.

- **v4.2 · 21 Oct 2026.** From the owner's feedback on part A: every sentence is seen (§3.14: explainer moments on
  the narrator's words, a sound for each, a whoosh between scenes, never still for more than ~4 s); the background is
  men humming with no instruments; the owner's pace on the second take is 11.3 characters per second, so the
  character targets become 6,100–8,100; EP001 keeps its full script (the owner chose the longer video).

- **v4.1 · 20 Oct 2026.** Calibration, no structural change: the owner's measured pace (9.6 characters per second,
  pauses included) replaces the 13.5 estimate, so the character targets drop to 5,200–6,900.
- **v4 · 20 Oct 2026.** From the owner's feedback on EP001 v3: the puzzle stays, with no prizes or winners (the owner
  answers it in the next file); company examples can come from the world's largest companies (Forbes Global 2000,
  Fortune Global 500), introduced with rank or numbers; every full script comes with a publish kit (3 titles, 3
  thumbnails with images, 2 descriptions) built on the words people search.
- **v3 · 20 Oct 2026.** From the owner's feedback on the five v2 drafts: at least 8 minutes (mid-roll ads); every
  video is a journey on a map; every name introduced with numbers; traps told as five-step mini-stories; a clearer
  self-check (how to count, examples, 3 bands); the series as a detective show (case files, callbacks, the previous
  puzzle's answer, a season mystery, cliffhangers); healthy keep-watching techniques; the episode's puzzle; part A
  (first 2 minutes) recorded and rendered first; the lesson order can change (lesson id vs episode number).
- **v2 · 18 Oct 2026.** From the owner's feedback on EP001's first 30 seconds: the story is told step by step with
  questions to the viewer; steps anyone can follow with no money; touchable numbers (Carnegie); quotes with
  credentials; opening and closing loops; new part 6, risks and mitigations; hook up to 45 s; callbacks; the
  draft → approval → `episode.json` flow.
- **v1 · 17 Oct 2026.** The owner's 8 parts for the business channel: story, smart transition, the problem in
  numbers, self-check, tools, exercises, summary, at most 3 actions.
