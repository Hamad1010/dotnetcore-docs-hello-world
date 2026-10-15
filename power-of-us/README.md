# The Power of Us — landing page and social media blueprint

Two self-contained pages: each is a single HTML file with its CSS, JavaScript, fonts and team photos embedded. There is no build step and no server code. Open a file in a browser, or upload it to any static host. Neither page makes external requests, so both work offline.

| File | What it is |
| --- | --- |
| `index.html` | The client-facing landing page, in English and Arabic (RTL). It opens in Arabic when the browser language is Arabic. Add `?lang=en` or `?lang=ar` to the address to force a language. |
| `social-media-blueprint.html` | An internal planning page: which platforms to start with, how each profile should look, a 30-day plan, guardrails and what to measure. Arabic by default, with an EN button. |
| `social-kit/` | The ready-to-upload images the blueprint refers to: avatar, LinkedIn, X and YouTube banners (EN/AR), 11 post templates and the film thumbnail. Keep this folder next to the blueprint. |

## Before `index.html` goes live

Open it in a text editor and find `const CONFIG` at the top of `<script id="app">`:

- `email` – the contact form opens the visitor's mail app addressed to this address.
- `formEndpoint` – a form-backend URL that receives the message as a JSON POST. It takes priority over `email`.
- `bookingUrl` – an optional booking link.
- `social` – LinkedIn, YouTube, Instagram, X and WhatsApp URLs. An empty entry shows as a "soon" label rather than a dead link.

While neither `email` nor `formEndpoint` is set, the form says plainly that it is not connected yet. It never pretends to send.

Team profiles and the readiness-check questions are the `TEAM` and `QUIZ` data in the same script, with English and Arabic side by side. English copy sits in the markup (`data-i18n` attributes) and the Arabic copy in `<script id="i18n-ar">`. The long base64 blocks at the end of each file are embedded fonts and images, so it is safe to scroll past them.

## Please confirm

- **Wording on the landing page**: "now opening first pilot conversations", the line that details are used only to reply, and the note that this is an independent project and not an official HEC Paris service. Change any that is not accurate.
- **Team**: photos and names need each member's consent. Alhanouf's profile shows only the tagline and "500+ media placements", because the deck repeated another member's quote and keywords in that slot. The team values are marked as drafts in the deck. The two persona quotes are labelled as composites.
- **Social handles and sizes** in the blueprint (`@powerofus.bridge` and similar) are suggestions: check availability the same day. Platform image sizes and limits change, so check each platform's help page before uploading.

## Privacy and licences

No analytics, no cookies and no third-party requests; the only request a page can ever make is the contact form's submission to the `formEndpoint` you configure. The pages store only the language choice and, in the blueprint, the setup checklist, in the visitor's own browser. Fonts are open source under the SIL Open Font License (Playfair Display, Inter, IBM Plex Sans Arabic). The dotted-Earth map is drawn from Natural Earth data (public domain).
