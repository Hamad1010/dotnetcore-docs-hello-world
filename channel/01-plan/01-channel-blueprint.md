# 01 · Channel blueprint

## 1. Mission and promise

**Mission:** make social and emotional intelligence simple, practical and memorable for Arabic speakers.

**The viewer's promise (say it in every video):** *one lesson, real stories, numbers that prove it, and one small
exercise you can do today.*

Why this works:
- **Stories + numbers** are the two things memory keeps best. A lesson repeated through 5–10 different
  stories is spaced repetition: the idea is learned, not just heard.
- **Global stories in Saudi dialect** is rare. Most Arabic self-development content is either a talking head
  lecture or a long podcast. Fast, visual, verified lessons with a world map fill a real gap.
- **One lesson per video** makes every video searchable ("كيف أتعامل مع الشخص الحساس") and every video a
  self-contained gift someone can share in a WhatsApp group.

## 2. Name, handle, tagline

Current placeholder: **سوالف ذكية** (*Smart Sawalif*). Change it in one place: `03-episodes/channel.json`.

| Option | Why it's good | Risk |
|---|---|---|
| **سوالف ذكية** ✅ recommended | "سوالف" is Saudi for stories/conversations: says *Saudi + stories* in two words, friendly, easy to say and search | Check the handle is free |
| ذكاء القلوب | Clear emotional-intelligence meaning | Sounds formal; harder to own in search |
| فن الناس | Short, broad ("the art of people") | Generic; likely taken |
| عُشر ثانية | Memorable, tied to first impressions | Too narrow for 330 lessons |
| قلب وعقل | Balance of EI and reason | Generic |

**Before deciding (10 minutes):** search the name on YouTube, TikTok, Snapchat, Instagram and X; check the
handle (e.g. `@sawalifthakiya`) is free everywhere. Same handle everywhere = easier to find you.

**Tagline:** دروس الذكاء الاجتماعي والعاطفي… بقصص حقيقية

## 3. Audience

| Segment | Who | What they want | Where they are |
|---|---|---|---|
| Core | Saudi & Gulf, 16–35, students and young employees | Confidence, how to deal with people, presence, smart replies | YouTube, Snapchat, TikTok, X |
| Second | Arab world (Egypt, Levant, Maghreb) | Same topics; they understand white Saudi dialect | YouTube, TikTok, Facebook |
| Third | Parents, managers, HR/trainers | EI for parenting and leadership, content to share with teams | YouTube, LinkedIn, WhatsApp |

**Language level:** a 12-year-old must understand every sentence. The *audience* is adults: in YouTube Studio
always set **"No, it's not made for kids"** (made-for-kids videos lose comments, notifications and personalized
ads; see `06-monetization-policy-legal.md`).

## 4. The episode format (fixed template = speed + recognizable brand)

| Part | Length | Purpose |
|---|---|---|
| Hook | ≤25 s | A surprising number or study + the promise ("8 real stories"). The first 30 s decide if people stay |
| Title card | 4 s | Lesson number + title (builds the "series" habit) |
| The lesson | 30–40 s | Plain-words explanation + 1 scientific anchor shown as a citation chip |
| Stories ×5–10 | 30–40 s each | Globe flies to the country → situation → action → **numbers** → takeaway (the lesson restated) |
| Recap | 15–20 s | All names on one screen + the lesson in one line |
| Today's exercise | 10–15 s | One small action + "tell us in the comments" (drives comments) |
| Next lesson | 10 s | Open loop: a question the next video answers |

Target **6–8 minutes**, never under 5:00. Every story uses a different country, topic and accent color. The
progress dots at the top ("story 3 of 8") make people stay to finish the set.

## 5. The voice: decide this first

| Option | Quality | Cost | Speed | Monetization safety | Verdict |
|---|---|---|---|---|---|
| **Your own voice** (phone + quiet room) | Most authentic, real Saudi dialect | Free | +20 min/episode | Best: human presence | ✅ Best long-term |
| **Your cloned voice** (ElevenLabs Professional Voice Clone) | Very close to you | ~$22/mo (Creator plan) | Fastest | Good: it's your voice, you wrote the script | ✅ Best for a busy owner |
| Library AI voice (ElevenLabs Saudi/Khaleeji voice) | Good | $5–22/mo | Fastest | Medium: many channels use the same voices | OK for testing |
| Amazon Polly "Zayd"/"Hala" (Gulf Arabic neural) | Decent, slightly robotic | Pennies | Fastest | Medium | Backup |
| Free Microsoft "Hamed" voice (edge-tts) | MSA accent, robotic in dialect | Free | Fastest | Weak | Testing only |

**Recommendation:** record the first 3 episodes with your own voice (it sets the personality and costs nothing),
then clone your voice and switch to the clone so you only *review* scripts. The studio supports all options
with one flag (`--provider=recorded|elevenlabs|polly|google|edge`).

## 6. Story rules

1. **Real and verified:** ≥1 reputable source per story in `sources.md`. Disputed detail → softer wording or drop it.
2. **Numbers in every story:** year + at least one striking figure (money, time, distance, people).
3. **Mix:** ≥5 countries, ≥4 topics, ≥3 continents per episode; include an Arab/Muslim-world story when a verified one exists.
4. **The takeaway repeats the lesson** in new words, so the viewer hears the lesson 8–10 times without boredom.
5. **Fairness:** no mocking cultures, no politics, no sectarian angles, no unverified "inspirational" viral posts.

## 7. Visual identity

- **Palette:** our own blue `#3B7DF6`, red `#EB5545`, yellow `#F5B724`, green `#2EA866` on soft white `#F5F7FB`.
  It's similar in spirit to Google's Material look but not their exact colors, logo shapes or Google Sans.
- **Font:** Readex Pro (Arabic + Latin, free under the Open Font License).
- **Signature elements:** the 3D globe that flies between countries, white story cards with loading skeletons
  that "fill in", animated numbers, progress dots, the speech-bubble-heart logo.
- **Thumbnails:** one big number or 3–5 words, one visual, yellow badge, lesson number. Same layout every time.

## 8. Quality bar (every video must pass)

- [ ] Hook states a number and a promise in ≤25 s
- [ ] Every story has a source, a year and a number; takeaway restates the lesson
- [ ] Narration readable by a 12-year-old; no sentence over ~20 words
- [ ] ≥5:00 long; no dead air; captions correct
- [ ] Thumbnail readable on a phone (look at it at 20% size)
- [ ] Title ≤60 characters with the main keyword early
- [ ] `sources.md` and `publish.md` complete; tracker updated

## 9. Series (seasons)

Season 1 is **the 20 strongest lessons across all topics**. It tests which themes the audience loves, then we
double down. Seasons 2–11 go deep by theme (charisma, emotional intelligence, self-worth, social intelligence,
presence, persuasion, mindset, work, parenting, bonus). Full list: [`../02-lessons/LESSONS.md`](../02-lessons/LESSONS.md).

## 10. Cadence

- **Start:** 2 long videos/week (Mon & Thu, ~8 pm KSA) + 1 Short/day.
- **After 12 weeks:** 3 long videos/week if quality holds and the review shows that topic demand supports it.
- Consistency beats volume: never drop quality to hit a schedule. Batch-produce two weeks ahead.
