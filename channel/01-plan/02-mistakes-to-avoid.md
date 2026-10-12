# 02 · Mistakes to avoid (lessons from established YouTubers)

Each item: **the mistake**, **who learned it the hard way or teaches it**, **why we avoid it**, and **how our
system already prevents it**. When we skip one of these in a real episode, Claude must say so and explain why.

---

## A. Strategy

**1. No clear niche.** Cooking one day, gaming the next.
- *Lesson from:* nearly every growth strategist (Paddy Galloway, vidIQ, Think Media) puts this first.
- *Why we avoid it:* YouTube recommends you to people who liked your *last* video. Mixed topics confuse that signal.
- *Our system:* one niche (social & emotional intelligence), 330 lessons pre-planned in `02-lessons/`.

**2. Chasing every trend.** Jumping on viral topics outside your niche.
- *Why:* trend spikes bring viewers who never come back; your returning-viewer rate drops.
- *Our system:* we ride trends *through our lesson* (e.g. a World Cup moment as a story), never instead of it.

**3. Only Shorts, or no Shorts.**
- *Why:* Shorts views don't count toward the watch-hour path to monetization, but Shorts are the cheapest discovery.
- *Our system:* long videos are the product; 3 Shorts per episode are the funnel (`03-viral-playbook.md` §5).

**4. Quitting in the "valley" (months 2–6).** Most channels stop before video 30.
- *Lesson from:* MrBeast has said he uploaded for years with tiny views. Ali Abdaal grew slowly for his first year.
- *Why:* the algorithm needs data, and you need reps. Early videos are your training ground.
- *Our system:* a 90-day plan with process goals (videos shipped) as well as results goals, in `08-coaching-roadmap.md`.

**5. Measuring the wrong things.** Obsessing over subscribers and views.
- *Lesson from:* MrBeast's leaked production guide says the team lives by **CTR, AVD (average view duration) and AVP (average % viewed)**.
- *Our system:* the weekly review tracks CTR, AVD, retention at 0:30 and returning viewers.

## B. Packaging (title + thumbnail)

**6. Making the video first and the title last.**
- *Lesson from:* MrBeast and Paddy Galloway both teach "packaging first": if you can't write a title people want to click, don't make the video.
- *Our system:* `publish.md` (3 title options + thumbnail text) is written **with** the script, before rendering.

**7. Descriptive titles instead of curious ones.** "الكاريزما والرحمة" vs "ليش نحب بعض الناس من أول لقاء؟"
- *Why:* titles must create a question the viewer wants answered.
- *Our system:* title formula in the playbook + 3 options for YouTube's Test & Compare.

**8. Busy, unreadable thumbnails.** Too much text, small faces, five colors.
- *Why:* most views come from phones; a thumbnail is seen at ~5 cm wide.
- *Our system:* one number or ≤5 words, one visual, same layout every episode (`npm run render` makes it).

**9. Clickbait that doesn't deliver.**
- *Lesson from:* Veritasium (Derek Muller) argues strong packaging is fine *if the video pays it off*. Broken promises lower viewer satisfaction, which YouTube measures through surveys and watch behavior.
- *Our system:* the first 25 s of the video show exactly what the thumbnail promised (EP001: "0.1 second").

**10. Never testing.**
- *Why:* even pros can't predict the winning thumbnail.
- *Our system:* every upload uses YouTube **Test & Compare** (up to 3 thumbnails and 3 titles; the winner is chosen by watch time).

## C. Content and retention

**11. Long intros.** "Welcome back to the channel, before we start…"
- *Why:* the first 30 seconds lose the most viewers.
- *Our system:* the hook starts at frame 0 with a number. The logo appears only in the title card.

**12. No re-engagement.**
- *Lesson from:* the MrBeast guide describes adding fresh peaks around minutes 3 and 6.
- *Our system:* every story is a new peak: new country, new color, globe flight, numbers counting up.

**13. Talking *about* a lesson without showing it.**
- *Our system:* 5–10 concrete stories per lesson, each with numbers.

**14. Facts that turn out wrong.**
- *Lesson from:* Kurzgesagt publicly reviewed old videos, removed some and published sources after finding errors. Trust is the asset of an education channel.
- *Our system:* `sources.md` for every episode; disputed details softened or removed; sources linked in the description.

**15. Bad audio.**
- *Why:* viewers forgive average visuals, not bad sound.
- *Our system:* `npm run voice` trims silence and normalizes loudness to −16 LUFS; music ducks under the voice.

**16. Inconsistent quality between videos.**
- *Our system:* one template + the quality checklist in `01-channel-blueprint.md` §8.

## D. Trust, policy and money

**17. Mass-produced AI content.**
- *What happened:* YouTube renamed "repetitious content" to **"inauthentic content"** (July 2025). Reports say a January 2026 enforcement wave terminated 16 faceless channels that together had 4.7 billion views, all built on synthetic voices, templated scripts and volume.
- *Our system:* original research and scripts, a human owner who reviews every episode, a real (or cloned own) voice, a distinct teaching format and an exercise, rather than a slideshow of reused text.

**18. Copying other creators or the source courses.**
- *Why:* reused-content rules and copyright strikes. Three strikes means the channel is deleted.
- *Our system:* the courses are a syllabus only; scripts are original; stories come from public facts.

**19. Copyrighted music.**
- *Why:* Content ID claims send your ad money to the music owner, or block the video.
- *Our system:* `npm run music` generates our own music. Use the YouTube Audio Library if you want more.

**20. Wrong "made for kids" setting.**
- *Why:* "Made for kids" disables comments, notifications and personalized ads.
- *Our system:* the audience is adults and teens (simple language ≠ kids' content), so choose "not made for kids".

**21. Not disclosing realistic AI content.**
- *Our system:* we never fake real people or events. If the narration is an AI or cloned voice, tick YouTube's "altered or synthetic content" box; the rules are in `06-monetization-policy-legal.md` §3.

**22. Buying views, subscribers or "sub4sub".**
- *Why:* fake engagement violates policy, and fake viewers never watch, which destroys your metrics.
- *Our system:* growth comes only from content, Shorts, collaborations and communities.

**23. Taking sponsorship money without the license.**
- *Why:* paid ads on social media in Saudi Arabia need the **Mawthooq** license.
- *Our system:* see `06-monetization-policy-legal.md` §5 before accepting any paid deal.

## E. Operations

**24. Posting randomly.**
- *Our system:* fixed days (Mon & Thu) and a 2-week buffer of finished episodes.

**25. Burnout.**
- *Lesson from:* several big creators, including Lilly Singh in 2018, publicly paused because of burnout.
- *Our system:* batching, templates and automation keep your time near 3 hours a week. Pausing for a week is allowed; a buffer covers it.

**26. Ignoring comments.**
- *Why:* early replies build community and give signals to YouTube; comments are also your best idea source.
- *Our system:* 10 minutes of replies in the first hour after publishing; pin a question (in `publish.md`).

**27. No playlists, end screens or series.**
- *Our system:* one playlist per season, an end screen to the next lesson, and the "next lesson" teaser in every video.

**28. Weak account security.** Channel hacks are common, often via fake sponsorship emails with malware.
- *Our system:* 2-step verification on, a separate brand account, never open "sponsor" attachments (`07-things-you-forgot.md`).

## F. Mindset

**29. Perfectionism.**
- *Why:* your 50th video will be better than your 1st no matter what. Shipping teaches faster than planning.
- *Our system:* the test render exists so we improve from real data, not opinions.

**30. Comparing to big channels.**
- *Why:* compare with yourself 30 days ago. The weekly review tracks your own trend lines.
