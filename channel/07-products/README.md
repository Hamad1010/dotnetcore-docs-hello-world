# 07 · Products: the paid guides «دليل الملف»

One PDF guide per season-2 episode, sold on Gumroad (plan [16](../01-plan/16-digital-products.md), store set-up
[17](../01-plan/17-gumroad-store.md)).

**This repository is public, so the guides never go into it.** Git ignores two folders here (`.gitignore`):

| Folder | What | In git? |
|---|---|---|
| `guides/` | each guide's source text, `EP006.md` … `EP010.md` | **no** |
| `out/` | the PDFs, page images, the store's images and the day-3 samples | **no** |
| `store/` | the product pages and launch emails (marketing text, meant to be public) | yes |

The owner keeps the sources and PDFs (the zip `out/season2-guides.zip`). In a new session, put the sources back in
`guides/` before building.

## Building

From `channel/`, after `npm install` in `04-studio/` (the fonts come from there):

```bash
python3 06-tools/build_guide.py EP006 --png   # → out/EP006-guide.pdf, and page images in out/EP006-pages/ to check it
python3 06-tools/build_store.py               # → out/store/EP00N/ cover, thumbnail, 3 previews; out/store/day3-samples.md
```

`build_guide.py` explains the source format in its docstring: a header (title, accent colour, the cover's list, the verse and
hadith of the closing page), then seven sections in a small Markdown with blocks for scenarios, ready words, the 14-day plan,
the self-check and the evidence cards. The look lives in `06-tools/guide/guide.css`. The contents page gets its page numbers
from a first print, so the PDF is printed twice.

## Writing a guide

Same rules as the videos (CLAUDE.md): every number from the episode's `sources.md` or a new source written in the guide's
evidence section; every imagined case labelled «مثال توضيحي»; no income promises; nothing from private course material; a
`humanizer` pass before the owner reads it. Five audiences, three scenarios each; twelve templates; fourteen days.
