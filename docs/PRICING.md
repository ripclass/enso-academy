# PRICING: The Canonical Sheet

**Set 2026-07-03.** Grounded in the market research in `docs/GTM-PLAYBOOK.md` (the $199-$2,000 empty slot; official packages $1,995-$2,495). The operating rule: **price at roughly 15% of the official package, never above $399, never below $199 list** (below that reads as a dumps site to this audience).

---

## Live courses — launch ladders

### CAMS (list target $399)
| Tier | Cap | Price | Trade |
|---|---|---|---|
| Founding | first 25 | $149 | Exam within ~90 days, feedback call, named testimonial, publishable readiness-vs-result |
| Early | next 50 | $199 | Written review after first full simulation |
| Launch window | until a hard public date | $299 (current) | Nothing |
| List | forever after | $399 | Guarantee attached |

### CCAS (list target $349)
| Tier | Cap | Price |
|---|---|---|
| Founding | first 15 | $149 |
| Early | next 25 | $199 |
| Launch window | same date | $299 (current) |
| List | after | $349 |

**Founder add-on:** second course +$99.

## Future courses (at each launch; each gets its own small founding ladder, e.g. first 15 at $149)

| Course | List | Anchor |
|---|---|---|
| CGSS | $299 | Official package $1,995 |
| CFE | $349 | Official prep $899-$2,124 + $480 exam; 4-section course |
| CDCS | $249 | Official all-in ~GBP 750; Asia/MEA purchasing power |
| CFCS | $249 | ~$395 exam; priced under the exam-cost line |

## Everything else

- **Exam simulations:** $14.99/attempt, first one free (THE lead magnet), 5 included with any course.
- **Practice mocks:** free unlimited for enrolled students.
- **Bundles (post-founding):** any 2 courses $449; 3-course fincrime stack $599.
- **Guarantee:** 14-day refund (existing, conditions unchanged) PLUS "ready means ready": fail after the signoff said ready -> free access extension + 5 more simulations until you pass. Access-extension, not cash; category standard (Kaplan, camsexam, Firebrand).
- **B2B (reactive only):** 5-seat team license at 4x single price, manual invoice. Do not build features for it.
- **No consumer subscription.** A $39/mo all-access cannibalizes the $299 one-time; cert buyers are one-goal buyers. (This supersedes the old FRAMEWORK.md pricing note.)

## Ladder rules (what makes it legal and effective)

1. **Price only ever goes up.** Announce it; never break it. Every tier close is a marketing event.
2. **Caps enforced in Stripe**, not in copy: promotion codes (FOUNDER149 max_redemptions=25, EARLY199 max_redemptions=50, per course). Requires `allow_promotion_codes: true` on the checkout session in `lib/stripe/checkout.ts` (one line, not yet wired) plus codes created in the Stripe dashboard.
3. **Show the honest counter** ("9 of 25 founding seats left") while seat-based; switch to date-based urgency at the launch-window tier (strangers can verify dates, not seat counts).
4. **Founding = application, not sale.** Two questions (exam date, role). The discount is payment for proof.
5. **Raise to list only after proof exists:** 10+ testimonials and 2-3 pass stories live on the sales page (CAMS first).
6. Never display a struck-through price that was never actually charged (the fake $399 anchor was removed 2026-07-03 for exactly this).

## History / context

- Launched at $299 flat (2026-06-20), with a fictitious "$399, $100 off, limited" anchor that was removed 2026-07-03 (FTC fictitious-former-price pattern). The ladder above makes the anchor REAL: $399 becomes true list once earned.
- Prices live server-side only in `lib/stripe/client.ts` (`PRODUCTS`, keyed by course slug). Change prices there; never in copy alone.
