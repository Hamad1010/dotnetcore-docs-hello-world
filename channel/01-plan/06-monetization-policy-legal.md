# 06 · Monetization, policy and legal checklist

*Not legal or tax advice. Rules change, so confirm on the official pages before big decisions. Last checked
October 2026.*

## 1. YouTube Partner Program (YPP)

| | Until 31 Jan 2027 | New applicants from 1 Feb 2027 |
|---|---|---|
| Ads revenue tier | 1,000 subs + 4,000 public watch hours (12 months) **or** 10M Shorts views (90 days) | 1,000 subs + **8,000** hours **or** **20M** Shorts views |
| Already in YPP | — | Not affected; keeping *Shorts* ad revenue needs 10M Shorts views per 90 days |
| Lower tier (fan funding, shopping) | ~500 subs + 3 uploads in 90 days + 3,000 hours or 3M Shorts views | check the YPP help page |

Also required: no active Community Guidelines strikes, 2-step verification, an AdSense for YouTube account,
and living in an eligible country (Saudi Arabia is eligible).

Sources: [Business Standard](https://www.business-standard.com/technology/tech-news/technology-tech-news-youtube-partner-program-monetisation-rules-2027-watch-hours-shorts-views-126081100708_1.html) ·
[Shacknews](https://www.shacknews.com/article/150324/youtube-partner-program-minimum-qualified-public-watch-hours-shorts-views) ·
[TechTimes](https://www.techtimes.com/articles/323954/20260811/youtube-partner-program-doubles-entry-bar-adds-monthly-shorts-earnings-gate.htm) ·
official: YouTube Help → "YouTube Partner Program overview & eligibility".

## 2. "Inauthentic content" (the AI rule that matters most)

Since **15 July 2025** YouTube calls it *inauthentic content*: **mass-produced or repetitive** videos (template
slideshows, text-to-speech over stock footage with no real value) can't earn money. AI tools are allowed; low-effort
volume isn't. Reports describe a January 2026 wave that terminated 16 faceless channels with 4.7B combined views.

How we stay safe (the reviewers look at the whole channel):
- Original research and scripts, a teaching structure, an exercise: real educational value.
- Each episode's stories are different and sourced, so no two videos are "the same video with new words".
- A human owner reviews every episode. Keep the drafts, `sources.md` and project files as proof of the process.
- Use **your own voice or your own cloned voice** for monetized videos, and keep the free test voices for testing.
- Moderate volume (2–3 long videos/week), never dozens per day.

## 3. AI disclosure

YouTube requires the "altered or synthetic content" setting when content is **realistic** and could be mistaken
for a real person, place or event. YouTube's own examples include making a real person appear to say something
they didn't, and **synthetically generating a person's voice to narrate a video**. Our animated graphics don't
need it. For the voice:

| Narration | Tick "altered or synthetic"? | Still monetized? |
|---|---|---|
| Your own recorded voice | **No** | Yes |
| A clone of **your own** voice reading a script you wrote and approved | **Yes, recommended.** Some 2026 guides say your own clone doesn't need the label, but YouTube's own examples name "synthetically generating a person's voice to narrate a video". One click removes the doubt | Yes |
| Stock AI voice (Polly, a library voice) | **Yes, recommended** | Yes, if the channel passes the "inauthentic content" review (§2) |
| A clone of **someone else's** voice | Never use one | — |

What the label does: it adds a note (usually in the description; on the player only for sensitive topics such
as news, elections, health or finance). According to YouTube's guidance as reported by 2026 creator guides, the
label itself doesn't remove ads or monetization. What gets punished is **not** disclosing when it was required:
YouTube can add the label itself, remove content, or suspend YPP. Since May 2026 YouTube shows these labels more
prominently and detects undisclosed AI content itself, so honesty is the safe route. Full voice comparison:
`10-voice-guide.md`.

## 4. Copyright and permissions

| Item | Rule for us |
|---|---|
| **Lesson ideas** (private reference courses) | Ideas and topics can't be owned; wording, examples and a course's structure can. Our lesson names, order and seasons are our own, and every script, story and exercise is original. We never copy sentences, examples or numbered lists, never name the trainer or attendees, and never present the channel as linked to anyone. If we ever quote a trainer or use one of his signature frameworks, we credit it (or ask first). |
| The raw transcripts and the private lesson map | Never upload or commit them (copyright + attendees' personal details). They stay in the git-ignored `02-lessons/sources/` folder and on your computer. |
| Stories | Facts aren't copyrighted; we retell them in our words and cite sources. No copied footage, photos or news articles. |
| Music | Self-generated (`npm run music`) or the YouTube Audio Library only. |
| Fonts | Readex Pro (Open Font License, commercial use allowed). |
| Maps | Natural Earth / world-atlas data (public domain / ISC license). |
| Remotion | Free for individuals and companies with ≤3 employees. A bigger company needs a Remotion company license (~$25/month per seat). |
| Brand look | Material-like style, but our own colors, logo and font. No Google logo shapes, "G", or the Google Sans font. |
| Quotes from people | Short quotes with attribution are fine; we paraphrase when unsure of the exact wording. |

## 5. Saudi Arabia: Mawthooq (advertising license)

- Anyone in KSA **earning from advertising on social media** (sponsored posts, paid mentions, brand deals, including on YouTube) needs the **Mawthooq** license from the media regulator (GCAM, now the General Authority for Media Regulation, GAMR). Fee reported as **SAR 15,000 for 3 years**; penalties for advertising without it are significant.
- YouTube's own AdSense ads (placed by YouTube) are generally not "your advertising". **Get the license before your first paid sponsorship**, and label all sponsored content.
- Check the current rules on the regulator's site before signing any deal.

## 6. Tax (US withholding on YouTube income)

- Submit US tax info in AdSense (form W-8BEN for individuals). Without it Google may withhold **up to 24% of your worldwide** YouTube earnings.
- Saudi Arabia has no income-tax treaty with the US, so with a valid W-8BEN, **30% of earnings from US viewers** is withheld; non-US views aren't withheld.
- In KSA: ask an accountant about registering activity once income grows (VAT registration applies above SAR 375,000 annual turnover; zakat for businesses).

## 7. Other YouTube settings and rules

- **Audience:** "No, it's not made for kids" (our audience is adults/teens; simple language is fine).
- **Sensitive topics:** grief, fear and self-worth lessons are wellbeing education, not medical advice. Say "إذا الموضوع ثقيل عليك، كلم مختص" when relevant. Never make health claims.
- **Real private people:** only public, already-reported stories. No identifiable private individuals without consent.
- **Community Guidelines:** no hate, no harassment, no politics or sectarian content (also protects the brand).

## 8. Account protection (do it day one)

1. Create the channel as a **Brand Account**, owner = you, with 2-step verification (security key or authenticator app).
2. Add a second trusted owner/manager email for recovery.
3. Never open attachments or "sponsor" files from unknown senders. This is the #1 way channels get hijacked.
4. Keep `channel/` in a **private** Git repository as the backup of all scripts, sources and settings. The repo it was created in (`dotnetcore-docs-hello-world`) is a **public fork**, and GitHub doesn't let you make a public fork private, so create a new private repo and push this branch there (`09-setup-guide.md` §6).

## 9. Puzzles and prizes (the episode puzzle, framework §3.11)

- **YouTube's contest rules** ([policy](https://support.google.com/youtube/answer/1620498)): you are fully responsible;
  follow local law; entry is free; publish official rules (who can enter, dates, how winners are chosen, the prize, a
  link to the Community Guidelines); never require subscribing, liking or any other metric; don't tie YouTube's name
  to the contest.
- **Saudi Arabia:** the Ministry of Commerce requires a licence before a prize competition is run or advertised,
  forbids requiring a purchase, and has sent businesses that ran unlicensed competitions to the public prosecution
  ([MoC](https://mc.gov.sa/ar/mediacenter/News/Pages/06-03-24-01.aspx) ·
  [MoC](https://mc.gov.sa/ar/mediacenter/News/Pages/26-03-24-01.aspx)). The media regulator asks for the Mawthooq
  licence when a competition promotes a business or product ([Alwatan](https://www.alwatan.com.sa/article/1123258)).
  Whether a skill quiz on a personal channel with a cash prize needs a licence is not spelled out in what we found:
  **ask the Ministry (or a lawyer) before announcing any cash prize.**
- **A skill game, not luck:** winners are chosen by correct answers and explanations, never by a random draw (a draw
  can count as gambling, which is banned in Saudi Arabia).
- **Season 1 plan:** non-cash rewards first: the solvers' names in the next file, a "detective of the season" title,
  a 30-minute call with the owner, the winner's project analysed in an episode (with their consent). Cash only after
  the licence question is answered.
- **Hide the answers:** Studio → Settings → Community → Blocked words. Add the answer before publishing; matching
  comments are held for review for up to 60 days ([YouTube Help](https://support.google.com/youtube/answer/9483359)).
  Approve them after the reveal.

## 10. Video length and mid-roll ads

Monetised videos of **8 minutes or more** can show mid-roll ads, the ones that play in the middle
([YouTube Help](https://support.google.com/youtube/answer/6175006); the limit was 10 minutes until 2020). Since May
2025 YouTube prefers natural breaks, so keep automatic placement on and avoid breaks mid-sentence. Shorter videos are
still monetised (other ad formats); the 8 minutes is about mid-rolls. That's why the framework's minimum is 8:00.
