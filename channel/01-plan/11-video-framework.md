# 11 · Video framework: how every long video is built

**Current version: v5.1** (25 Oct 2026). This file is the only place where the structure of a long video is defined.
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
- Teasers, callbacks and the previous puzzle's answer are written at production time, after the order is confirmed.
- If a timely episode jumps in after a teaser promised something else, it opens with one honest line ("قبل ما نكمل
  الملف اللي وعدتكم فيه… فيه شي صار هالأسبوع ما يتأجل"), and the promised episode comes right after it.

## 1. Every video is a journey on a map

The viewer starts at **"أنت هنا"** (where they are now: the problem, in their own words), passes **stations** (the
parts below), and arrives at a **destination** (what they can do after the video). Each episode picks its own start
and destination; the station names are plain words, not part numbers.
- The whole map appears in part 2: start, stations, destination, the marker at "أنت هنا".
- At every new part the marker moves on and the narration says it ("وصلنا للمحطة الثانية…", "باقي محطتين").
- In part 8 the marker reaches the destination and the narration looks back at the road travelled.

## 2. The parts, in order (v3, part 10 added in v5)

| # | Part | id | Time | What it does |
|---|---|---|---|---|
| 1 | القصة · the stop-scrolling story | `hook` | 0:00–1:00 | A true story told in steps, with questions to the viewer. A twist in the first 30 s, the big number by ~0:45. Every name introduced (§3.4) |
| 2 | الجسر + الخريطة · bridge, map, opening loop | `bridge` | ~1:10 | The comparison that names the topic, the case file («الملف 01»), the journey map, the opening loop. From EP002: the previous puzzle's answer (≤ 15 s) |
| 3 | محطة: المشكلة بالأرقام | `problem` | ~1:10 | How big the problem is: 2–3 statistics, each made touchable, and what it costs the viewer |
| 4 | محطة: اختبر نفسك | `check` | ~1:10 | 6–8 questions anyone understands (§3.8), a way to count, 3 result bands with what to do |
| 5 | محطة: الأدوات خطوة خطوة | `tools` | 3–3:30 | 3–5 steps. Each: what to do, why, a real story or example, and how to start with no money |
| 6 | محطة: فخاخ الطريق | `risks` | ~2:00 | 2–3 traps, each told as a mini-story (§3.7). Skip only if the topic has none |
| 7 | محطة: تمارين | `practice` | ~30 s | 2–3 exercises for everyday life |
| 8 | الوصول · the destination | `recap` | ~20 s | Look back at the road, then one sentence people remember and repeat |
| 9 | 3 خطوات + لغز الحلقة | `actions` | ~40 s | At most 3 actions (today / this week / this month), the episode's puzzle (§3.11), answers in the comments |
| 10 | وقفة · the faith pause (v5) | `faith` | 45–75 s | One verse and/or authentic hadith tied to the lesson, what it means, the link to the lesson and its effect on how we work, and a real story from the same sources when one fits (§3.15) |
| 11 | الحلقة المقفلة · closing loop | `close` | ~35 s | A 10–15 s bridge (a question that leads to the next file) with the «فيه مشهد في النهاية» pop-up, then the cliffhanger teaser on a dark screen (§3.16) |

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
- Company examples don't have to be famous brands. Any well-documented company works, including the world's largest
  (Forbes Global 2000, Fortune Global 500): introduce it with its rank or one big number ("مايكروسوفت… من أكبر 10
  شركات في قائمة فوربس لأكبر 2000 شركة في العالم").

### 3.5 Opening and closing loops
- **Opening loop** (part 2): one specific promise that makes people stay. Specific, honest, always paid off.
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
- Each episode is a case file: «الملف 01 · لغز الـ55». The lesson is the clue that solves the case.
- **Callbacks:** at least one small detail from an earlier file (a number, a name), with a YouTube card to it at that
  moment. New viewers get curious and watch the older files; that adds watch hours.
- **The previous puzzle's answer** opens part 2 of the next file (≤ 15 s), told by the owner.
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

### 3.11 The episode's puzzle (لغز الحلقة, new in v3)
- One puzzle tied to the lesson, with one exact answer (a number or a word) that needs details from the episode.
  Best when the answer itself means something (EP001: 168 = the hours in a week).
- Viewers answer in the comments. The owner reveals the answer at the start of the next file (part 2, ≤ 15 s) and
  can reply in the comments.
- **No prizes and no winners** (the owner's decision, v4). If prizes ever come back, read
  `06-monetization-policy-legal.md` §9 first.

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
  things side by side), `chat` (a phone, messages on their words), `math` (a sum built term by term, blanks for the
  puzzle), `steps`, `alert` (a phone's emergency alert), `button`, `globe` (flying from Riyadh to the place),
  `search` (a query and a rising trend), `file` (the next case file), `scripture` (a verse or a hadith, its words lit as
  they are read, v5) and `endscene` (the «فيه مشهد في النهاية» pop-up, v5).
- **The second half waits for its word:** a headline's sub line, a step's detail, a comparison's note or a profile's
  field appears when it is said (`subCue`, `noteCue`, `labelCue`, a field's `cue`), so long sentences build in beats.
  A made-up example carries `illustration: true` (the «مثال توضيحي» chip) and a number its `source` line.
- **Never still for more than ~4 seconds,** and never empty placeholders while the story is told. One idea per
  shot: at most 2–3 moments on screen; each leaves when the next takes its place (or on its `until` word).
- **A sound for each moment,** short and never melodic (pop, tick, typing, swish, stamp, coin, paper, a rising hiss
  into the big reveal, then an impact); a whoosh between scenes. They sit well under the voice
  (`04-studio/src/components/Sfx.tsx`, made by `npm run music -- sfx`).
- **The background: soft hums, no instruments, never sad.** Its job is that the voice is never alone, without anyone
  hearing "background music": quiet, curious, good for analysis. The owner chooses it by ear (their "Detective
  Backgrounds" hums, or beds made with `06-tools/ambient_bed.py` or `humming_bed.py`; screen each with
  `06-tools/listen_check.py`). `channel.json` → `"background"` (a file in `_assets/music/`, at -18 LUFS) and
  `"backgroundLevel"` (how many dB under the voice: 20 from v5, 25 in EP001); it rises 4 dB in the pauses between scenes
  and fades out for the «وقفة» (§3.15).
- **Cues are spoken words,** checked against the recording's word marks; `phrase@2` picks a phrase's second
  occurrence when the first one is elsewhere (e.g. «ألفين» in 2009 and in 2000 years).

### 3.15 The «وقفة»: a verse and a hadith before the end (new in v5)
The owner's request after EP001: a short religious pause, tied to the lesson, before the teaser.
- **Where and how long:** part 10, after the puzzle and before the close. 45–75 seconds, calm.
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
  no sound effects, and the background hum fades out for the whole part. Never a picture of the Prophet ﷺ, any prophet
  or companion: only text, nature, sheep, landscapes.
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
  sibilants softened, gentle compression, and loudness to -16 LUFS. Its report says what it did.

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

1. Claude writes `03-episodes/EP00N/script-draft.md` (this framework, numbers as plain digits), `sources.md` and the
   publish kit (§3.13): `publish.md`, `thumbs.json` and the three thumbnail images.
   Draft header: title, case file, `Framework vN`, the journey (start → stations → destination), where the opening
   loop is paid off, the small move, the puzzle and its answer, the teaser, and where part A ends.
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
- [ ] Opening loop paid off; a callback (from EP002 on); the puzzle has one exact answer; the teaser matches the tracker.
- [ ] The publish kit: 3 titles, 3 thumbnails (text + image), 2 descriptions (§3.13).
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

## 6. Parts → video scenes (for the studio)

| Part | Scene type in `04-studio/src/types.ts` |
|---|---|
| `hook` | `storyhook` (built) |
| `bridge` | `overview` (comparison, topic, case file) + `journey` (the map) (built) |
| every station start | `journey` with `at` = the station (built) |
| `problem`, `check`, `tools`, `risks`, `practice`, `actions`, `close` | `stage` (built): an empty stage with the station chip, filled by its `moments` (the self-check is a `quiz`, the puzzle a `math` with blanks) |
| `recap` | `journey` at the destination (built): the road lights up from `glowCue` to `glowEndCue`, then fades at `focusCue` for its moments |
| `faith` | `stage` with `quiet: true` (no sound effects, the background fades out) and `scripture` moments: the verse or hadith typed as it is read, with its reference |
| `close` | `stage` with an `endscene` moment (the «فيه مشهد في النهاية» pop-up, from the bridge's first word `until` the teaser's) and `darkCue` = the teaser's first word |
| end card | `stage` with no narration (built): the next `file` from second 0 (`at: 0`), moved up to leave room for YouTube's end-screen elements; `dark: true` after a dark teaser |
| every scene | `moments` on the narrator's words, each with its sound (§3.14) |

## 7. Changelog

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
