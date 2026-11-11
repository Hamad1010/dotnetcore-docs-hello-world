# 16 · Digital products: one PDF per episode, from season 2

Written 10 Nov 2026 from the owner's notes, updated 11 Nov 2026. Facts marked **(verify)** come from law-firm or vendor
summaries, not the official text: check them on the official site, or with an accountant or lawyer, before launch. Nothing
here is legal or tax advice.

> **The owner's decisions (10 Nov 2026):**
> - The five season-2 guides are made: 26–27 pages each, private, in `07-products/` (git ignores the guides and the PDFs).
> - They are sold by the owner's **influencer-marketing agency, under its commercial registration**: the channel is one of
>   the agency's products, with a strategic purpose for later.
> - The store is **Gumroad**: [17-gumroad-store.md](17-gumroad-store.md) sets it up from zero to the first sale.
> - The product pages and launch emails are in [`07-products/store/`](../07-products/store/).

## 1. The product

**«دليل الملف»**, one PDF per season-2 episode, for people who watched and want to practise. It goes where the video
can't: the episode has 4–8 stories; the PDF has the exercises.

| Section | What's in it |
|---|---|
| 1. The map | the episode's principle in a line, its doors, what you'll have tried in 14 days, how to use the guide |
| 2. What the video didn't say | the deeper rule behind each story: when it works, when it backfires, one small move; plus one part the video had no time for (how to prepare, dormant ties, the order of requests…) |
| 3. Scenarios | 15 scenarios, three for each of the five audiences, each with «وش لو…؟»: the usual move → what it costs → the right move → why it works |
| 4. Ready words | 12 templates (questions, messages, sentences) with what to change in each |
| 5. 14-day plan | one small action a day, a box to tick, a check-in on day 7 and day 14 |
| 6. Self-check | ten statements rated 1–5 before and after |
| 7. The evidence | every study and source, with authors, year, sample, number and link |

26–27 pages, A4, Arabic right to left, in the channel's watercolor look, built by `06-tools/build_guide.py`. Same rules as the
videos: every fact sourced, every imagined case labelled «مثال توضيحي», no income promises, and nothing taken from private
course material (CLAUDE.md rule 2).

## 2. The price

- **$27 a guide** on Gumroad (≈ 101 SAR at the fixed 3.75 rate; 99 SAR if Gumroad offers riyals as a currency).
- **Launch:** $21 (≈ 79 SAR) for the first 7 days or the first 100 buyers, with the code `LAUNCH`. It rewards the people who
  act on the video and gives the list a reason to open the launch email.
- **Bundle:** the five guides for **$93** (≈ 349 SAR, about 30% off), once file 10 is out.
- **A promise you can keep:** a 30-day money-back guarantee on every page ("if the guide doesn't help you, write to us").
- What one sale leaves after Gumroad's fees: [17-gumroad-store.md §2](17-gumroad-store.md).

## 3. Legal and tax in Saudi Arabia

| Item | What to do |
|---|---|
| Who sells | The agency, under its **commercial registration**. Check that its activities cover selling digital content or e-commerce **(verify)**. |
| E-commerce law | The page shows who sells, how to contact you, the full price and the refund policy: every product description ends with the seller line (name, CR number, email) **(verify the required details)**. |
| VAT (15%) | Registration is mandatory past **SAR 375,000** of sales a year and allowed from **SAR 187,500** **(verify with ZATCA)**. Gumroad is the merchant of record: ask how the agency's Gumroad payouts are treated **(ask your accountant)**. |
| Personal data (PDPL) | Marketing needs **opt-in consent**, separate from the purchase; opt-out must be free and as easy as opting in; stop within 24 hours of an opt-out; keep proof of consent; publish a privacy policy **(verify: the implementing regulations are being amended)**. |
| WhatsApp and SMS | Marketing only to people who opted in; also follow the CST anti-spam rules and WhatsApp's own policy. |
| Advertising licence | Promoting your own product on your own channel is different from paid ads for others; confirm whether the «موثوق» licence applies **(verify)**. |
| YouTube | Selling your own product is allowed; put the link in the description and the pinned comment. Paid promotion: No, since it's your own product. Links need the channel's advanced features (phone-verified). |

## 4. The store: Gumroad

Chosen by the owner on 10 Nov 2026. Why it fits, and its limits, in detail: [17-gumroad-store.md §1](17-gumroad-store.md).

- Gumroad is the **merchant of record**: it handles sales tax and VAT where it has obligations, and pays the agency in riyals
  to a Saudi bank account.
- **Protect the file:** Gumroad stamps each buyer's email on the first page of their PDF.
- Buyers pay by card, Apple Pay or Google Pay. A mada card with a Visa or Mastercard logo usually works; a mada-only card
  does not **(verify in the test purchase)**. If most buyers turn out to be in Saudi Arabia paying with mada, a Saudi store
  (Salla or Zid, which take mada, Apple Pay, STC Pay, Tabby and Tamara) can be added later for them.

## 5. Emails and mobile numbers, with permission

**At checkout** Gumroad asks for the buyer's email, which delivers the guide. No phone number: we don't need it.
**Then a separate, unticked box** (a Gumroad custom field, optional):
«أبغى توصلني رسائل عن الحلقات والأدلة الجديدة على الإيميل. أقدر ألغي الاشتراك متى ما بغيت.»
Only people who tick it go on the marketing list. Keep the date and wording of each consent (the Gumroad export does this).

**Before anyone buys:** a free two-page **«ورقة الملف»** (the episode's checklist) in exchange for an email, linked in the
video description, builds the list from season 2's first day (still to make).

**Email:** MailerLite (free up to 1,000 subscribers) or Brevo (free up to 300 emails a day) **(verify current free limits)**.
Import from Gumroad's customer export **only** the people who ticked the box. Day-10 emails to buyers go through Gumroad's
Workflows (17 §6).

**WhatsApp, in three steps:**
1. **A WhatsApp Channel** for new videos and guides: free, one-way, and followers never share their number with you. Start here.
2. **The WhatsApp Business app** for one-to-one replies to buyers who write first.
3. **The WhatsApp Business Platform** through a Saudi provider (Unifonic or Taqnyat, for example) when the list is large:
   approved message templates, opted-in numbers only, paid per message. Saudi marketing messages cost about $0.05–0.06
   each in 2026 **(verify on Meta's rate card)**.

## 6. Each episode's launch, step by step

| When | What |
|---|---|
| Video day | In the video, one honest sentence (part 11); the guide's link first in the description and in the pinned comment; the WhatsApp Channel post; the day-0 email. |
| Day 3 | The day-3 email with one free scenario from the guide (`07-products/store/emails.md`). |
| Day 7 | The launch price ends: one short reminder, and no fake countdowns. |
| Day 10 | Gumroad's Workflow asks each buyer for one sentence about what changed, to show with their permission. |
| After that | The guide stays in the store, in every later video's description, and in the season bundle. |

Numbers to watch each week: views → description clicks → visits → sales (conversion), list growth, email opens, refunds.

## 7. Who does what

**Done (10–11 Nov 2026):**
- The five guides, written from each episode and its research, fact-checked, with a `humanizer` pass, typeset in the
  watercolor look (`06-tools/build_guide.py`).
- The store's images: a cover, a square thumbnail and three preview pages per guide (`06-tools/build_store.py`).
- The product pages and the launch emails, through `/yt-seo` and `humanizer` (`07-products/store/`).
- The Gumroad guide (17).

**You do:**
- Read each guide before it goes on sale (the guides are in the zip; tell me what to change).
- Open Gumroad and the bank payout, publish the products, run the test purchase (17 §4).
- Open the email tool and the WhatsApp Channel; approve the privacy and refund policies.

**Next, when you want them:** the free «ورقة الملف» for each episode; a `/new-guide` project skill that turns an approved
episode into its guide (to write with `skill-creator`).

## 8. Timeline to season 2

| Week | You | Me |
|---|---|---|
| 1 | read the five guides; open Gumroad, the payout and the test purchase | changes to the guides you ask for; the «ورقة الملف» |
| 2 | email account; WhatsApp Channel | EP006's build once its script is approved |
| 3 | privacy and refund policies live; products 06 ready to publish | EP006's publish kit with the guide's line |
| 4 | record EP006 | render EP006, launch the guide with it |
