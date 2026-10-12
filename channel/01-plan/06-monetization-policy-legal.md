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

| Narration | Tick "altered or synthetic"? |
|---|---|
| Your own recorded voice | No |
| AI clone of your voice (or anyone's) | **Yes**, to be safe (it is a realistic synthetic voice of a real person) |
| Generic AI library voice | Recommended **Yes**: costs nothing in reach, removes all risk |

Since May 2026 YouTube shows these labels more prominently and also detects undisclosed AI content itself, so
honesty is the safe route.

## 4. Copyright and permissions

| Item | Rule for us |
|---|---|
| **Source courses** (the course owner's lecture transcripts) | Ideas can't be owned, but wording and structure can be. We write original scripts with our own stories, and don't copy sentences or name attendees. **Strongly recommended:** written permission from the course owner and credit to him, ideally a collaboration. This protects you if the channel becomes big. |
| The raw transcripts | Never upload or commit them publicly (copyright + attendees' personal details). Kept in a git-ignored folder. |
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
