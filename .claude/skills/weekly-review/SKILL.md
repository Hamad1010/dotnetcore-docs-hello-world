---
name: weekly-review
description: Turn the owner's weekly YouTube Studio numbers into at most 3 concrete decisions for the channel in channel/. Use when the owner pastes analytics, says "weekly review", "how did we do this week" or "/weekly-review".
---

# /weekly-review

1. **Collect:** ask only for missing numbers from `channel/05-templates/weekly-review.md` (views, watch hours, subs, CTR, avg % viewed, retention at 0:30, Shorts views, comments; per-video CTR/% viewed/biggest drop). Screenshots are fine.
2. **Compare** with the targets and decision rules in `channel/01-plan/04-growth-and-scaling.md` §3 and with last week's file in `channel/05-templates/reviews/`.
3. **Diagnose** with the cheapest explanation first: packaging (CTR) → hook (0:30 retention) → structure (drops at a story) → topic (all metrics low).
4. **Decide at most 3 things:** keep / stop / one experiment. Each must be specific ("EP006 thumbnail B: change badge to …", "move the strongest story to position 1 in EP008/EP009").
5. **Monetization progress:** running totals vs 1,000 subs and 8,000 watch hours; projected month at current pace (be honest).
6. **Write** the review to `channel/05-templates/reviews/YYYY-MM-DD.md`, update `views_7d`, `ctr`, `avd` in `channel/02-lessons/lessons.csv` for published lessons, and add winners to `channel/05-templates/swipe-file.md`.
7. **If a fix belongs in the template** (same problem in 3+ videos), make it in `channel/04-studio/src/` once, run `npm run check` and `npm run preview`, and tell the owner every future episode inherits it.
8. Commit `Weekly review YYYY-MM-DD` and push. Reply to the owner in ≤10 lines.
