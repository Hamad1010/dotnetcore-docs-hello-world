# 12 · Launch and monetization: what to do after the render, step by step

Written 21 Oct 2026 for EP001 (the full video is `03-episodes/EP001/out/EP001.mp4`); it works for every episode. It is the **launch-week
checklist**. The long-run plan, the numbers to watch and the legal basics are in [`04-growth-and-scaling.md`](04-growth-and-scaling.md),
[`06-monetization-policy-legal.md`](06-monetization-policy-legal.md) and [`08-coaching-roadmap.md`](08-coaching-roadmap.md); this file points to them
instead of repeating them, and adds what they don't have.

**How sure is each rule?** Tags: **[confirmed]** = several independent outlets agree · **[secondary]** = one or two outlets, older, or not official ·
**[check]** = I couldn't find it. The session that wrote this could not open YouTube's, Google's or the Saudi government's own pages, so confirm
anything that costs money on the official page. This is not legal or tax advice.

## 0. The honest picture

- No trick makes a new channel's views jump in days, and the tricks that exist (bought views, sub-for-sub, bots) end channels (section 6). What
  speeds things up honestly: a title and thumbnail people want to click, a first 30 seconds that keeps them, Shorts that point to the full video, real
  people sharing it, and the next video arriving on time.
- A first video mostly reaches people who already know you. YouTube shows it to a small group, watches whether they click and stay, and widens the
  audience only if they do. So the work is in the packaging and the first minute, and EP001 has both.
- Ad money needs 1,000 subscribers **and** thousands of watch hours: months, not days (section 5). Selling your own service can come sooner.

## 1. Before you press Publish (about 45 minutes)

One time for the channel:

- [ ] **Verify the channel with your phone** (needed for custom thumbnails and long uploads **[secondary]**) and turn on **2-Step Verification** on the Google
  account (also a monetization requirement **[confirmed]**). Account safety steps: `06-monetization-policy-legal.md` §8.
- [ ] **Name, handle, avatar, banner** (Studio → Customization → Branding). Name «غرفة الفرص». Handle: 3–30 characters; Arabic letters are allowed, but Arabic
  and Latin can't be mixed in one handle (numbers at the end are fine); no separator at the start or end **[confirmed, YouTube Help]**. `channel.json` still
  has no handle; pick one that is also free on TikTok, Snapchat, Instagram and X. Avatars and banners: [`14-brand-kit.md`](14-brand-kit.md).
- [ ] **About text:** the promise in one line («قصص وأرقام حقيقية… وكل ملف فيه فكرة تبدأ فيها اليوم»), a business e-mail for brand deals, your links.
- [ ] **Upload defaults:** Education, Arabic, «not made for kids», standard license.

For the video (all the text is ready in `03-episodes/EP001/publish.md`):

- [ ] **Package:** title 1 + thumbnail 1. If **Test & compare** shows under the video, add thumbnails 3 and 5 (up to three; it runs up to about 2 weeks and
  picks by watch-time share **[secondary]**); titles 1, 4 and 7 where titles can be tested too.
- [ ] **Description 1**, pasted whole. Check the first two lines on your phone's preview. Chapters: first at 0:00, at least three, each over 10 seconds, in order **[confirmed]**.
- [ ] **Subtitles:** upload `out/subtitles.ar.srt` as Arabic captions. English subtitles later widen the audience.
- [ ] **Settings:** altered or synthetic content **No** (your own voice, `06` §3); paid promotion **No**; comments on.
- [ ] **End screen** (last 20 seconds; our end card leaves room): next video or playlist. **Cards:** one at the self-check, one at a callback to an earlier file (times in each `publish.md`).
- [ ] **Playlist:** «ابدأ من الملف 01».
- [ ] **Pinned comment:** the episode's question for viewers (text in `publish.md`; EP001–EP002 carried a puzzle, retired in v5.2).

## 2. Launch day and the first 48 hours

Your plan's launch day is **Monday 26 Oct, 8–9 pm Saudi time** (`08` and `03` §11; after four weeks, check Studio → Audience → «When your viewers are on
YouTube» and move to your best slot).

1. **First hour:** pin the comment with the episode's question, then answer every comment with a real answer, and keep answering through the first day or two.
2. **Tell people who will genuinely care**, one honest sentence and the link, where your audience already is (WhatsApp groups, X, LinkedIn, Snapchat):
   «سويت أول ملف في قناتي… قصة واتساب والرافعة. شوفوه وقولوا لي وش تقطعون منه». Real feedback beats a bigger number. Don't ask for likes or subscribes (your
   rule), and don't pay anyone to watch.
3. **The first Short** the same night, cut from the video's strongest 40 seconds (the hook: «رفضوه… ثم اشتروا شركته بـ19 مليار»). Shorts can run to 3 minutes
   since Oct 2024 **[confirmed]**, but 30–50 seconds with the hook in the first 2 seconds suits discovery (`03` §5). End by pointing to the full video
   («related video» in Studio). Your playbook also lists **Shorts series** and **Hype** (for smaller channels) as 2026 features: use them if they show in your Studio
   (`03` §6; I couldn't check availability).
4. **Day 2:** a Community post with the episode's question or a still from the video, if the tab is on your channel.
5. **Don't edit the title or thumbnail by hand in the first 48 hours** unless the click-through rate is clearly poor after about 1,000 impressions (section 4). Use Test & compare.

## 3. The first week

| Day | What |
|---|---|
| Mon 26 | Publish EP001 · pinned comment · share · Short 1 (the hook) |
| Tue 27 | Reply to every comment · Short 2 (Kodak vs Instagram: «13 موظف… مليار») |
| Wed 28 | Community post (the episode's question) |
| Thu 29 | Short 3 (quick replies: «اكتب الرد مرة») · read the numbers (section 4) |
| Fri 30 | The weekly review (`05-templates/weekly-review.md` or paste the numbers and run `/weekly-review`) |
| next week | Record and publish EP002 (the hidden talent) |

**One mismatch to decide:** the plan (`04` Phase 0) wants **four finished episodes before going public** so the cadence (Mon + Thu) never breaks, and today
only EP001 exists. Launching early gets real data sooner; waiting protects the rhythm. My suggestion: publish on the 26th as planned, write and record EP002–EP003 in
the next ten days, and if the second video can't follow within about 10–14 days, hold the channel with the Shorts and Community posts until it can. Three public
uploads in 90 days is also a monetization requirement (5.1).

I can render the Shorts with the studio (`npm run render -- EP001 --shorts`, once the clips are listed in `episode.json`) and check each one's layout before you
post. Ask when you want them.

## 4. Days 3–14: read three numbers and decide

Studio → Analytics. Don't read ten graphs; read these (the healthy ranges and the decision rules are in `04` §3):

1. **Impressions click-through rate:** of the people who saw the thumbnail, how many clicked. Below the range after about 1,000 impressions → the packaging is
   the problem: try another thumbnail or title from the kit.
2. **Retention at 0:30, and the retention graph:** where people leave. A drop in the first 30 seconds → the hook; a drop at one spot → that part is long. Fix it
   in the next video; don't re-edit a live one without a reason.
3. **Traffic sources:** Browse and Suggested (YouTube is recommending you), Search (they came with a question), Shorts (the funnel works). Do more of whatever brings the
   most watch time.

## 5. Monetization: how to earn legally

Two kinds of money with different rules: **ads YouTube shows on your videos** (the YouTube Partner Program, paid through AdSense) and **money from companies or
customers** (sponsorships, affiliate links, your own service or product).

### 5.1 The Partner Program, and the change on 1 February 2027

The thresholds, the 10 Aug 2026 change and its sources are in `06` §1 and `04` §1; in one line: today **1,000 subscribers + 4,000 public watch hours (12 months)**
or 10 million Shorts views (90 days); for new applicants from **1 Feb 2027**, **8,000 hours** or **20 million** Shorts views; the early-access tier (500 subscribers,
3 public uploads in 90 days, 3,000 hours or 3 million Shorts views) unlocks fan funding and Shopping, not ads. All **[confirmed]**; Saudi Arabia is among the countries
where the expanded program has rolled out **[secondary]**.

A feel for the size with **EP001's real length** (13 minutes; if people watch about 40%, that is about 5 minutes each): 4,000 hours = 240,000 minutes ≈ **46,000
views**; 8,000 hours ≈ **92,000 views**. From a Monday 26 Oct launch, **31 January is about 14 weeks away**. Reaching the old bar by then needs an early breakout,
so (as `04` says) treat it as a bonus and plan for the 8,000-hour bar.

### 5.2 The steps, in order

1. 2-Step Verification on; keep the channel free of strikes (section 6). Upload regularly; only public videos count.
2. When Studio → Earn says you're eligible, **apply** (or turn on its notification).
3. **AdSense:** name and address exactly as on your ID (the PIN may come by post), phone verification, a bank account. Google's help says the bank must be in the same
   country as the address in your payments settings **[secondary]**.
4. **Tax information** in AdSense (the W-8BEN form): `06` §6 has the rates (up to 24% on worldwide earnings without it; with it, 30% on US viewers' revenue, none on the rest).
5. YouTube **reviews the channel** against its policies. Yours should pass while it stays what it is: your own voice, your own scripts, real numbers with sources
   (`06` §2: the «inauthentic content» rule targets mass-produced channels and synthetic hosts giving advice on health, money or law).
6. After approval, ads go on per video; mid-roll ads need videos over 8 minutes (EP001 is 12:59).

### 5.3 The Saudi side: what to check before you earn

`06` §5–6 covers the **Mawthooq** license and the US tax. This table adds what that file doesn't. **[secondary / check]**: news and explainers, some from
2022–2023; confirm each with the authority named.

| Question | What I found | Who to ask |
|---|---|---|
| A company pays you to advertise (a sponsorship)? | **Mawthooq license first** (the General Authority for Media Regulation): mandatory for individuals who advertise on social media, including YouTube, since 1 Oct 2022; 18 or older; not transferable; reported fee **SAR 15,000 for 3 years** (check today's fee); disclose paid relationships; penalties reported up to SAR 1 million and/or a ban (sources differ). | the Authority's «موثوق» service |
| The ads YouTube itself shows (AdSense)? | `06` §5 reads them as generally not «your advertising». The sources I could reach don't address it either way, so confirm before you assume. | the same service |
| A **freelance document** (وثيقة العمل الحر) or a **commercial registration**? | The document is free, valid one Gregorian year, renewable; for Saudis aged 18–60 with an active Absher account and a bank account in their name; apply on `freelance.sa`. I couldn't confirm that «صناعة المحتوى» is on its list of activities. Signing contracts or issuing invoices as a business → a commercial registration. | `freelance.sa` · the Saudi Business Center |
| **VAT**? | Mandatory registration at annual revenue of **SAR 375,000**; voluntary between 187,500 and 375,000; the rate is 15%. How YouTube's payments are treated: not found. | ZATCA, 19993 |
| You have an **employer**? | Check your contract (private sector) or your agency's rules (government) before you monetize. | HR or your agency |

Always: keep AdSense statements, invoices and contracts; one hour with an accountant in the first year is cheap insurance.

### 5.4 Income that doesn't wait for 4,000 hours

- **Your own service or product** (consulting, a template, a workshop) once registered as above. The channel is the shop window (`04` §6 has the stages).
- **Sponsorships:** only after the Mawthooq license; tick YouTube's «includes paid promotion» box, say it aloud early in the video and write it at the top of the
  description **[secondary]**.
- **Affiliate links:** say so clearly next to the link; follow each program's rules.
- **Memberships and Super Thanks** come with the early-access tier.

What the channel never does (your rules and YouTube's): investment, trading or stock tips, guaranteed income, «get rich» promises.

## 6. What not to do

- **Buy views or subscribers, trade subs, use «view exchange» sites or bots.** YouTube's fake-engagement policy removes the fake numbers, can strike the channel, and a
  single severe case can end it without warning **[confirmed]**. Hired promoters count against you too.
- **Mislead with the packaging:** a title, thumbnail or description that promises what the video doesn't show (for example a celebrity who isn't in it). YouTube said in
  Dec 2024 it would raise enforcement against this **[secondary]**.
- **Promise money.** The spam and scams policy bans get-rich-quick content and exaggerated promises **[confirmed]**.
- **Reuse others' footage or music.** The backgrounds in `03-episodes/_assets/music/` are ours (`insight` comes from `06-tools/ambient_bed.py`); keep proof of license
  for any hummings you add from elsewhere.
- **Hide a sponsorship.**
- **Tag or mention many accounts** in comments or descriptions (spam).
- **Change the title and thumbnail every day.** One change, then wait for the data.

## 7. What I could not check, and how to check it in 10 minutes

From the build session, YouTube, Google and the Saudi government sites were blocked, so I couldn't read the official pages or pull live search data (the exact hosts
are in [`13-audience-words-and-trends.md`](13-audience-words-and-trends.md)). Before you rely on it:

1. YouTube Help → «YouTube Partner Program overview and eligibility» and YouTube's blog post of 10 Aug 2026 (the numbers and dates in 5.1).
2. YouTube Help → «Overview of the expanded YouTube Partner Program» (Saudi Arabia in the list).
3. The Authority's «موثوق» page, or call: who needs it, today's fee, whether AdSense is covered.
4. `freelance.sa`: is content creation in the list of activities.
5. Studio → Analytics → **Research**: type the words from file 13 and note the search volume (low, medium, high).

If you add those hosts to the session's allowed domains, I'll redo the research with live data and correct this file.
