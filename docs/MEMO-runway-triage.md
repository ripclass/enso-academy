# MEMO: Runway Triage (spend the remaining Opus hours here)

**Written 2026-07-06, last Fable session. An outside, unsentimental ranking of the whole project against a finite budget of remaining premium-model hours. You know the business better than I do; this is the view from the balcony.**

## The principle

Rank every possible task by **(revenue or survival impact) / (hours it costs)**. When runway is the binding constraint, the enemy is not a missing feature. The enemy is spending scarce hours on assets that are AHEAD of demand while revenue-blocking steps sit undone. Your own GTM notes already say it: the gap to revenue is **trust and distribution, not more content**. Act like you believe that.

## Tier 0: revenue-blocking and irreversible. Do these first. Mostly operator, near-zero model hours.

1. **Rotate the exposed `sk_live_` Stripe key.** It was pasted in a transcript. This is a live-money security hole, not a task. Roll it in Stripe, update Vercel. Minutes.
2. **Run ONE real-card purchase and refund on CAMS.** Everything else is verified; a live charge is not. Until a real card clears and refunds, you do not actually know the money loop works. This is the single highest-value hour in the whole project.
3. **Promote and publish CCAS.** Content is 43/43 done on disk. Promoting (`generate-course.ts write`) plus a spot review plus flipping to published gives you a SECOND sellable product at near-zero marginal cost. A finished course sitting unpublished is pure waste.

Tier 0 is almost all your hands, not the model's. Do it before you spend another premium token on anything.

## Tier 1: turn built assets into revenue. High leverage, modest hours.

4. **Wire the 66 gated cases into lessons** (see `docs/PLAN-wire-cases-into-lessons.md`). Right now the bank earns nothing. Wired, it becomes the differentiator that justifies the price. This is the payoff for the whole case-bank program; do not leave it unpicked.
5. **Live-verify the freemium mock + paywall end to end** as a non-owner: free taste, then the pay-per-mock and course paths. A broken funnel is a silent revenue leak.
6. **The trust layer** from the GTM playbook: honest pricing, the ACAMS non-affiliation disclaimer, any real social proof you can stand up, SEO/share basics. Trust converts browsers; content does not, past "good enough."

## Tier 2: conversion quality. Only the parts that move conversion or cut refunds.

7. **The classroom experience/packaging** ("$400 must not feel like nothing"). The player is built and deployed. Marginal polish here affects whether a buyer feels the price is fair, which affects refunds and word of mouth. Worth some hours, but bounded.
8. **Content quality gaps** from the codex audit ONLY where a specific weak lesson would trigger refunds or bad reviews. Do not chase "world-standard" across the catalog. "Good and honest and priced right" sells; "world-standard" is a runway trap.

## Tier 3: STOP or FREEZE. This is where the runway leaks.

- **Case bank, cases 67 to 100+.** Freeze at 66. It is a genuine moat and a real asset, but it is ahead of demand and generates $0 until Tier 1 item 4 is done. The marginal case is worth far less than one wired rotation or one real customer. If you ever resume it, run it CHEAP on Opus via `docs/RUNBOOK-case-bank-orchestrator.md`, in the background, never on premium hours.
- **Question-bank depth beyond mock-capable.** The bank already supports several non-repeating faithful mocks per domain. More questions past that is padding.
- **New course builds (CGSS, CFE, etc.).** Do not start them until CAMS and CCAS are both live and earning. A third unfinished course is negative leverage.
- **Any "make it world-class" pass** on something that already sells. Perfect is the enemy of shipped, and shipped is the enemy of dead.

## If you get only 20 more premium-model hours

- 3h: Tier 0 (rotate key, real-card test, CCAS promote/publish) with the model only where it helps.
- 8h: Wire the 66 cases into the pilot lessons and verify rotation (Tier 1 item 4). This is the case bank finally paying off.
- 5h: Trust + funnel (Tier 1 items 5-6).
- 4h: Whatever one thing most affects whether a real buyer feels $299/$399 was fair (Tier 2 item 7).
- 0h: case 67. Do not.

## The honest note on the case bank

You and I just took it 32 to 66, and it is good work, verified, gated, a real differentiator. Precisely because it is good, it is tempting to keep going. Don't. It is the most finished thing in the building and the least urgent. Freeze it, wire it, let it sell. The factory is documented and runs on models you can afford; it will still be there when demand catches up.

## The meta-risk, said plainly

The most common way a solo founder with a live product dies is not building the wrong feature. It is polishing the most impressive asset while the boring revenue steps go undone, because the asset is more fun and feels like progress. You have a live product taking real money and a second course finished on disk. The move is not more; it is FINISH and SELL what exists. Protect the runway by refusing to gold-plate.
