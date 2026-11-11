# 17 · The store on Gumroad: from zero to the first sale

Written 11 Nov 2026 for the five season-2 guides. Gumroad's own site could not be opened from this session (its host is not
in the cloud session's network list), so the details come from Gumroad's help-center pages as search results quote them,
and from 2026 reviews. Anything marked **(check)** could not be confirmed there: look at it on your screen as you go. Taxes
and law are marked **(ask your accountant)**: nothing here is legal or tax advice.

The words to paste (names, descriptions, refund line, emails) are in [`07-products/store/products.md`](../07-products/store/products.md)
and [`emails.md`](../07-products/store/emails.md). The files to upload (the five PDFs, covers, thumbnails, previews) are in
the zip you received: `07-products/out/` on this machine, never in the repository.

## 1. Why Gumroad, and what it does not do

**What you get:**
- **Gumroad is the merchant of record since 1 January 2025.** It sells to the buyer, collects and pays sales tax and VAT
  where it has obligations, and pays you what is left. You don't register for VAT in other countries to sell there.
- **Payouts to Saudi Arabia go to a local bank account in riyals (SAR).** Gumroad's help center lists Saudi Arabia among
  bank-payout countries; a bank payout takes about 2 to 7 business days to arrive.
- **PDF stamping:** each buyer's email is printed on the first page of their copy, which discourages sharing.
- **Discount codes** with a use limit and an end date (the launch price), **Workflows** (automatic emails after a purchase),
  **custom checkout fields** (the consent box), and a refund policy shown on the product page.

**What it does not do (or I could not confirm):**
- **Cards:** buyers pay by card, Apple Pay or Google Pay. A mada card that also carries the Visa or Mastercard logo usually
  works on international sites; a mada-only card will not **(check with your own card in the test purchase, §5)**.
- **Currency:** prices are usually in US dollars. If SAR is offered when you create a product, use it **(check)**.
- **Arabic on the page:** the product page is Gumroad's design, with its menus in English. Arabic text shows, but a
  paragraph may align left **(check in the preview before you publish)**.
- **No Tabby or Tamara**, and the buyer must have an email. If most of your buyers end up being in Saudi Arabia and pay
  with mada, a Saudi store (Salla or Zid, plan 16 §4) can be added later for them.

## 2. What it costs

Gumroad's 2026 fees: **10% + $0.50** for each sale through your own link (the video's description), **30%** for a sale that
comes from Gumroad's own marketplace, Discover. Several 2026 reviews add card processing of about **2.9% + $0.30** on top of
the 10% on direct sales **(check on the pricing page)**. No monthly fee. Sales above $20,000 in a month are reported to drop
to 5% + $0.50 **(check)**.

| One sale | Price | Gumroad (10% + $0.50) | Card (≈ 2.9% + $0.30) | You keep | In riyals (× 3.75) |
|---|---|---|---|---|---|
| A guide | $27 | $3.20 | $1.08 | **≈ $22.72** | ≈ 85 SAR |
| A guide at the launch price | $21 | $2.60 | $0.91 | **≈ $17.49** | ≈ 66 SAR |
| The bundle of five | $93 | $9.80 | $3.00 | **≈ $80.20** | ≈ 301 SAR |
| A guide found on Discover | $27 | 30% = $8.10 | included | **≈ $18.90** | ≈ 71 SAR |

Taxes Gumroad collects from the buyer (VAT in some countries) are added at checkout and are not yours. The bank or Gumroad
may take a small conversion cost from dollars to riyals on the payout **(check on the first payout)**.

## 3. Before you start: what to have ready

- [ ] The agency's **commercial registration** (CR), and its activities: check they cover selling digital content or
      e-commerce, or add the activity on the Saudi Business Center **(check)**.
- [ ] A **store email** you will keep (support@your-agency…), and its password manager entry.
- [ ] A **Saudi bank account in the agency's name**: the IBAN, in riyals.
- [ ] The **ID of the person who manages the account** (the "business representative"): Gumroad's payment processor may ask
      for an ID photo and the CR document.
- [ ] From the zip: the five PDFs, and for each guide `cover.png` (1280×720), `thumb.png` (600×600) and three `preview` pages.
- [ ] From `products.md`: the five product pages, the refund line, and the seller line with your CR number filled in.

## 4. Step by step

### Step 1 · The account (10 minutes)
1. Go to **gumroad.com** and choose **Start selling**. Sign up with the store email, not a personal one.
2. Choose your **username**: it becomes your store's address, `username.gumroad.com`. Something short in Latin letters that
   says the channel (for example `ghurfa`), and the same everywhere.
3. Confirm the email Gumroad sends you.

### Step 2 · The profile (15 minutes)
1. **Settings → Profile:** name «غرفة الفرص», the channel's avatar (`03-episodes/_assets/brand/avatar.png`), and a short bio:
   «أدلة عملية مع حلقات غرفة الفرص: المحادثات اللي تفتح الأبواب. كل رقم بمصدره.»
2. Add the YouTube channel's link.
3. Your profile page lists your products. Gumroad also lets you point your own domain (store.your-agency…) at it later
   (Settings → Advanced) **(optional)**.

### Step 3 · Getting paid (20 minutes, then a wait)
1. **Settings → Payments** (or Payouts): country **Saudi Arabia**, account type **business**.
2. Enter the business details as on the CR, then the representative's details. Gumroad's payment processor (Stripe) may ask
   for the ID and the CR document now or later, after some sales. Gumroad's staff don't see these documents.
3. Add the **bank account**: the agency's IBAN, in riyals. Gumroad pays only to a local account in the local currency.
4. Look at the **payout schedule and minimum** shown on that page, and note them here: ____ **(check: older pages say weekly,
   and a 2026 blog reports a higher minimum for unverified accounts)**.
5. If Gumroad asks for **US tax information**, a company fills the form for foreign entities (W-8BEN-E), a person the W-8BEN
   **(ask your accountant)**.

### Step 4 · The first product (30 minutes each)
1. **Products → New product → Digital product.** Name and price from `products.md` (06 first). Create.
2. **Product tab:**
   - Description: paste the block. Cover: `cover.png`, then add the three `preview` pages as more cover images (they show
     as a gallery). Thumbnail: `thumb.png`.
   - Summary (the line by the buy button) and **Additional info** (pages, format, how it arrives) from the table in
     `products.md`.
   - **URL:** a short slug in Latin letters, `ep06`, so the link is `username.gumroad.com/l/ep06`.
   - **Refund policy:** turn on the product's own policy and paste the line. If your account shows a single account-wide
     policy instead, choose the **30-day money-back guarantee** (it matches the line) **(check which one your dashboard shows)**.
3. **Content tab:** upload the PDF (`دليل-الملف-06.pdf`). Under the file, turn on **Stamp PDFs with the buyer information**.
   The PDF has no password or protection, which stamping needs.
4. **Checkout tab → Custom fields:** add a **checkbox**, not required, with the consent sentence from `products.md`, and apply
   it to all five products. (A "terms" field is always required and is a link to your terms; the consent box must stay
   optional, so use a checkbox.)
5. **Checkout tab → Discounts:** create **LAUNCH**: $6 off, for this product, **100 uses**, valid for **7 days** from the
   video's day. The link with the code is the product link plus `/LAUNCH`.
6. **Publish.** Then open the page as a visitor (a private window) and read it on your phone.

Repeat for 07–10 as each video comes out. The **bundle** is one more product with the five PDFs in its Content tab, made
after file 10.

### Step 5 · The test purchase (10 minutes, do not skip)
1. Make a discount code **TEST** for 100% off, **1 use** (if Gumroad refuses 100%, make it 99%).
2. Buy your own guide from a private window with a second email of yours, and with the card you expect most buyers to use.
3. Check: the receipt email arrives; the download works on a phone; **your email is printed on page 1**; the consent box
   shows and is optional; the Arabic reads right in the receipt.
4. Delete the TEST code. Refund the test sale from **Sales** if it cost anything.

### Step 6 · Launch day (with each video)
1. The guide's line goes in the description and the pinned comment (`products.md`, last section), with `/LAUNCH`.
2. Day 0, 3 and 7 emails go to people who agreed to them (§6). A post on the WhatsApp Channel.
3. In the video, part 11 («الدليل») is the only mention. No countdowns, no "only X left".

## 5. Discover, Gumroad's marketplace

A buyer who finds you through Gumroad's own search and recommendations costs 30% instead of 10%. You can't stop people from
finding you there, and you don't need to: most of your buyers will come from the video's link at 10%. The names in
`products.md` carry the words people search for, which helps on Discover and on Google too.

## 6. Emails and consent (PDPL)

- **Gumroad's own emails:** a buyer's receipt and product updates (a corrected version of the guide) are service messages.
  For a new guide or a new season, send marketing only to people who ticked the consent box or signed up themselves.
- **Workflows (the day-10 email to buyers):** Workflows → New → trigger: a purchase of the guide → wait 10 days → the email
  from `emails.md`. Gumroad sends Workflow emails **only after the account has earned $100 after fees and received a payout**,
  to protect its email reputation: set them up from the start, and they begin once that threshold is passed.
- **Marketing emails (days 0, 3, 7, the bundle):** from MailerLite or Brevo (plan 16 §5). Export your customers from Gumroad
  (Audience or Customers → export) with the consent column, and import only the people who ticked it. Keep the export file as
  proof of consent, with the date. Every email carries a one-click unsubscribe, and an unsubscribe is honoured at once.
- **A privacy policy** for your own list: who you are, what you keep (name and email), why (news of episodes and guides),
  for how long, and how to leave. Link it from your email tool's signup form and the channel's About page.
  **(ask your lawyer: the PDPL's implementing regulations are being amended)**

## 7. Payouts, refunds and records
- **Payouts** arrive in the agency's account on the schedule from Step 3. Keep each payout statement: it is your record of
  income for the accountant (zakat, and VAT if the agency is registered).
- **A refund:** Sales → the purchase → Refund. Answer within a day, and refund without arguing when someone writes within 30
  days: it costs less than a chargeback, which a buyer can open through their card at any time, whatever the policy says.
- **A new version of a guide:** replace the file in the Content tab. Check with the test account that the buyer's library
  shows the new file **(check)**.

## 8. The Saudi side: a checklist

| Item | What to do |
|---|---|
| Who sells | The agency, under its CR. Confirm its activities cover selling digital content or e-commerce **(check with the Saudi Business Center)**. |
| E-commerce law | The page shows who sells, how to reach you, the full price and the refund policy: the seller line in every description and the refund line do this. |
| VAT (15%) | Registration is mandatory above **SAR 375,000** of sales a year and voluntary from **SAR 187,500** (plan 16). With Gumroad as merchant of record, the agency's income is a payout from a foreign company: ask whether it is zero-rated as an export of services or taxed, and whether sales to buyers in Saudi Arabia change that **(ask your accountant)**. |
| Personal data (PDPL) | Marketing only with the separate, optional consent box; a privacy policy; one-click opt-out honoured at once; records of consent (§6). |
| Advertising | Promoting your own product on your own channel is not a paid ad for someone else. As an influencer-marketing agency, you already know the «موثوق» licence rules: confirm whether they apply here **(check)**. |
| Records | Payout statements, the consent exports, and refund emails: keep them all, by month. |

## 9. Every week: the numbers

From Gumroad's Analytics and YouTube Studio, for each guide: the video's views → clicks on the description link → visits
to the product page → sales (visits ÷ sales is the page's conversion) → refunds. Add list growth and email opens. If visits
are high and sales low, the page is the problem: change its first two lines. If visits are low, the video's line is.

## 10. What to check on Gumroad's site (this session could not open it)

- The current fees, whether card processing is on top of 10%, and the $20,000 tier.
- Whether SAR can be a product's currency.
- The payout schedule and the minimum for a Saudi business account.
- Which refund-policy setting your account shows (per product or account-wide).
- Whether Gumroad collects VAT on sales to buyers in Saudi Arabia.
- PayPal at checkout (Gumroad's PayPal Connect) and whether it is offered in your country.

## Sources
Gumroad Help Center (as quoted by search results): [Getting paid](https://gumroad.com/help/article/13-getting-paid) ·
[PDF stamping](https://gumroad.com/help/article/130-pdf-stamping) ·
[Discount codes](https://gumroad.com/help/article/128-discount-codes) ·
[Workflows](https://gumroad.com/help/article/131-using-workflows-to-send-automated-updates) ·
[Custom refund policy](https://gumroad.com/help/article/335-custom-refund-policy) ·
[Payout settings](https://gumroad.com/help/article/260-your-payout-settings-page) ·
[Buying on Gumroad](https://gumroad.com/help/article/191-a-guide-to-buying-on-gumroad) ·
[Pricing](https://gumroad.com/pricing) · [Taxes](https://gumroad.com/taxes).
Fee reviews (2026): [Swell](https://www.swell.is/content/gumroad-pricing) ·
[Checkout Page](https://checkoutpage.com/tools/gumroad-fee-calculator) · [Eden](https://eden.so/blog/gumroad-fees/).
Custom field types: [Gumroad API docs (mirror)](https://www.mintlify.com/antiwork/gumroad/api/custom-fields).
