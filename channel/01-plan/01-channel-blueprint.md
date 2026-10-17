# 01 · Channel blueprint

## 1. Mission and promise

**The channel:** «غرفة الفرص» (Opportunity Room), a business channel in Saudi dialect.

**Mission:** help anyone, whether they know their talent or haven't found it yet, get the mindset and the skills to
start a business and scale it. Emotional intelligence and social skills are taught as business tools: every idea
ends in trust, deals, customers, money or followers.

**The viewer's promise:** *one idea, a true story that stops you, the numbers that prove it, a quick test to see
where you stand, tools you can use tomorrow, and at most three actions.*

Why this works:
- **Stories + numbers** are what memory keeps and what makes people believe it is real.
- **Leverage thinking** (10x, 25x), comparisons that reveal opportunities, connections that pay off years later,
  and the 1% a day are rare in Arabic business content, which is mostly lectures or hype.
- **One idea per video** makes every video searchable and shareable in a WhatsApp group.

## 2. Name, handle, tagline

**Name (decided):** «غرفة الفرص» · English: *Opportunity Room*. Change it in one place: `03-episodes/channel.json`.

**Handle (to do, 10 minutes):** pick one handle and check that it's free on YouTube, TikTok, Snapchat, Instagram and X,
for example `@ghurfat.alforas` or `@opportunityroom.sa`. Same handle everywhere makes you easy to find. If you plan
workshops or products later, also search the Saudi trademark register (SAIP).

**Tagline:** اكتشف موهبتك… وحوّلها لمشروع يكبر، بالأرقام

## 3. Audience

| Segment | Who | What they want |
|---|---|---|
| Starters | People about to start, or just started, who don't know how to position themselves | Positioning, first customers, pricing, standing out |
| Hidden talent | People who don't know they have a talent | Find it, test it, believe it with numbers |
| Talent without a plan | People with a clear skill who don't know how to turn it into value | Turning skill into income, offers, partnerships |
| Builders | Employees and owners who want to grow or scale | Leverage, teams, systems, negotiation, networks |

Core geography: Saudi Arabia and the Gulf, then the wider Arab world (white Saudi dialect is understood widely).
**Language level:** a 12-year-old must understand every sentence. The *audience* is adults: in YouTube Studio
always set **"No, it's not made for kids"**.

## 4. The episode format (the owner's 8 parts)

| # | Part | Length | Purpose |
|---|---|---|---|
| 1 | Stop-scrolling story | ≤ 25 s | A short true story with a twist and a striking number |
| 2 | Smart transition | 10–15 s | The comparison that names the topic + what's coming |
| 3 | The problem | 45–60 s | How big it is, with statistics |
| 4 | Self-check | 45–60 s | 6–10 yes/no questions: do you have this problem? |
| 5 | Tools and strategies | 2–3 min | What works, each with a real example and numbers |
| 6 | Exercises | 30–45 s | How to practise it in daily life |
| 7 | Summary that sticks | 15–20 s | One line people remember and repeat |
| 8 | Three actions | 15–20 s | At most 3 actions + "write your result in the comments" |

Target **6–8 minutes**, never under 5:00. No "subscribe" or "like" requests. Visual depth from our silhouettes of
places, people and things. When the format changes, the first 30 seconds are rendered for approval first.

## 5. The voice: decide this first

| Option | Quality | Cost | Your time | Monetization | Verdict |
|---|---|---|---|---|---|
| **Your own voice** (phone + quiet room) | Most authentic, real Saudi dialect | Free | ~25 min per episode | Best: human presence, no AI label | ✅ Best long-term |
| **A clone of your voice** (ElevenLabs) | Close to you; better with a longer sample | ~$5–22/month | Review only | Good: your own voice; tick the AI label | ✅ Best for a busy owner |
| Amazon Polly "Zayd"/"Hala" (Gulf Arabic) | Clear but flat, a stock voice | ~$0.10 per episode | None | Allowed, weaker: anyone can use the same voice | Tests and backup |
| ElevenLabs library voice | Good | $5–22/month | None | Medium: many channels share the same voices | Tests |

**Recommendation:** record the trial Short and the first episodes with your own voice (it sets the personality
and costs nothing), then clone your voice and switch to the clone so you only *review* scripts. The studio
supports all options with one flag (`--provider=recorded|elevenlabs|polly|google|edge`). Step-by-step guide,
differences and the YouTube rules: [`10-voice-guide.md`](10-voice-guide.md).

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
double down. Seasons 2–15 go deep by theme (charisma, understanding people, smart replies, emotions,
self-worth, presence, persuasion, fear and healing, habits, mindset, work, career, family, bonus). Full list: [`../02-lessons/LESSONS.md`](../02-lessons/LESSONS.md).

## 10. Cadence

- **Start:** 2 long videos/week (Mon & Thu, ~8 pm KSA) + 1 Short/day.
- **After 12 weeks:** 3 long videos/week if quality holds and the review shows that topic demand supports it.
- Consistency beats volume: never drop quality to hit a schedule. Batch-produce two weeks ahead.
