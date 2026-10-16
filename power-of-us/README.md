# The Power of Us: website and social media plan

Two self-contained pages. Each is a single HTML file with its CSS, JavaScript, fonts and team photos embedded. There is no build step and no server code. Open a file in a browser, or upload it to any static host. Neither page makes external requests, so both work offline.

**To change anything, open [`EDITING-GUIDE.html`](EDITING-GUIDE.html).** It explains every job step by step, in plain language.

| File | What it is |
| --- | --- |
| `index.html` | The client-facing website, in English. |
| `social-media-blueprint.html` | An internal planning page: which platforms to start with, how each profile should look, a 30-day plan, guardrails and what to measure. Keep it private. |
| `social-kit/` | The 13 ready-to-upload images the plan refers to: avatar, LinkedIn, X and YouTube banners, 8 post templates and the film thumbnail. Keep this folder next to the plan. |
| `tools/photo-swapper.html` | A helper that changes a photo or picture inside a page, or adds a new person's photo, without any code. |
| `EDITING-GUIDE.html` | The guide to editing everything yourself. |

## Before `index.html` goes live

Open it in a text editor and search for `EDIT: SETTINGS`. Fill in:

- `email`: the contact form opens the visitor's mail app addressed to this address.
- `formEndpoint`: a form-backend URL that receives the message as a JSON POST. It takes priority over `email`.
- `bookingUrl`: an optional booking link.
- `social`: LinkedIn, YouTube, Instagram, X and WhatsApp URLs. An empty entry shows as a "soon" label rather than a dead link.

While neither `email` nor `formEndpoint` is set, the form says plainly that it is not connected yet. It never pretends to send.

## Please confirm

- **Wording on the website:** "now opening first pilot conversations", the line that details are used only to reply, and the note that this is an independent project and not an official HEC Paris service. Change any that is not accurate.
- **Team:** photos and names need each member's consent. **Alhanouf's quote, key words, "how to work with me" and strengths were written for her from her role and the words on her own slide**, because her slide in the deck repeated another member's text. Please replace them with her own words (search for `EDIT: TEAM PROFILES`).
- **Social handles and sizes** in the plan (`@powerofus.bridge` and similar) are suggestions: check availability the same day. Platform image sizes and limits change, so check each platform's help page before uploading.

## Privacy and licences

No analytics, no cookies and no third-party requests; the only request a page can ever make is the contact form's submission to the `formEndpoint` you configure. The pages store only the setup checklist of the plan, in the visitor's own browser. Fonts are open source under the SIL Open Font License (Playfair Display, Inter). The dotted-Earth map is drawn from Natural Earth data (public domain).
