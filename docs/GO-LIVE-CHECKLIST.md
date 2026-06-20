# Enso Academy — Go-Live Checklist (CAMS)

**Drafted:** 2026-06-20. Ordered by dependency. `[x]` = done in code/this session · `[ ]` = operator action.
The product is functionally complete end-to-end (marketing → signup → course $299 / freemium mock → faithful exam → readiness). What remains below is operator setup, verification, and launch.

---

## Phase 0 — Pre-flight (state of play)
- [x] 40 CAMS lessons generated + cross-checked (cleared/cleared-with-fix).
- [x] Question bank: 502 high-distinctness questions (A131/B101/C184/D86; 30 multiple-response), all 11 modules assessment-cross-checked.
- [x] Mock engine: multi-select, faithful template config, readiness model v2, guaranteed multi-response %.
- [x] Payments + freemium-mock surface built (Stripe **test** mode).
- [x] Course purchase CTA wired (landing + course page); Terms + Privacy real pages.

---

## Phase 1 — Database & schema ✅ DONE (2026-06-20)
- [x] Applied pending migrations to remote (yffwnyuodulbfjjobhmf) via `supabase db push`: `path2_lesson_review_events`, `mock_entitlements`. Verified: 3 new tables + `consume_mock_attempt` RPC + 4 RLS policies exist.
- [x] Regenerated `lib/supabase/database.types.ts` (`supabase gen types`); `tsc --noEmit` clean.
- [x] Removed the narrowly-scoped `any` casts (`entitlements.ts` + webhook mock branch); `tsc --noEmit` clean.
- [x] Security advisors run. **Caught + fixed a real bug**: `consume_mock_attempt` (SECURITY DEFINER) was still PUBLIC-executable (the original revoke missed PUBLIC), so anon/authenticated could call the RPC with an arbitrary `p_student` and burn another user's mock attempts. Fixed by migration `20260620130000_secure_consume_mock_attempt.sql` (REVOKE FROM PUBLIC/anon/authenticated; GRANT to service_role). Re-run: function WARNs cleared.
- [x] Backfilled 393 Path-2 review events into `lesson_review_events`.
- [ ] **(Carried to Phase 6)** 2 pre-existing advisor WARNs, not from these migrations: (a) `lesson-audio` public bucket allows listing — tighten the SELECT policy or accept (audio URLs are already public); (b) Auth "leaked password protection" disabled — enable in the Supabase dashboard (one click).

## Phase 2 — Content: promote ✅ DONE (2026-06-20) · publish DEFERRED to Phase 10
- [x] Promoted to the `cams` DRAFT via `generate-course.ts write`. DB-verified: status `draft`, 11 modules / 49 lessons / 499 scenes / **502 questions** (30 multiple-response, all mock-eligible) / 313 glossary; domain split A131/B101/C184/D86 (writer de-duped glossary 333→313 on UNIQUE(course_id,term)).
- [x] Spot-review: structure verified + every lesson & all 502 questions already passed the cross-check spine; sampled live questions (multi-response screening, scenario override, placement typology) render correctly.
- [x] **10.1 Google/Facebook flag → KEEP as-is.** Widely-reported, company-acknowledged public fact; lesson cites the public reporting; methodology lane already AGREE. No edit.
- [ ] **Publish → DEFERRED to Phase 10 (the LAST flip).** Publishing now would make the course live-but-broken/free because auto-enroll, the Stripe webhook, and the mock seed weren't yet closed. Content is promoted + verified; it stays a draft until the payment + access gates are done. Flip `status` → `published` (SQL/dashboard) as the final go-live step.

## Phase 3 — Mock simulation ✅ DONE (2026-06-20)
- [x] Seeded both templates (`seed-cams-mock.ts`). DB-verified: **CAMS Full Exam Simulation** (120q / 210min / pass 75% / `by_domain` A36-B24-C36-D24, `multi_response_count` 12 ≈10%) + **CAMS Diagnostic** (60q / 105min / 75% / 6 multi-resp), both `is_published=true`.
- [ ] **(Operator) Confirm vs the current ACAMS candidate handbook**: the scaled pass mark and the multiple-response proportion (seeded at `pass_score_percent=75`, ~10% multi-response — sensible defaults). Adjust `scripts/seed-cams-mock.ts` + re-run if the handbook differs.

## Phase 4 — Payments (Stripe) ✅ DONE (2026-06-20, TEST mode)
- [x] Created the production webhook endpoint via the Stripe API → `https://www.ensoacademy.ai/api/stripe/webhook`, event `checkout.session.completed`. Active endpoint: **`we_1TkR6VBG8gnvAJXarecH5LRn`** (account `acct_1T4IAtBG8gnvAJXa`, "Enso Intelligence Labs, Inc.", Test). Set `STRIPE_WEBHOOK_SECRET` in Vercel Production (sensitive).
- [x] Set `STRIPE_SECRET_KEY` (sensitive) + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in Vercel Production (TEST keys). **CLI gotcha:** `vercel env add` ignores piped stdin in agent mode — use `--value "<v>" --force --yes`; sensitive vars don't read back via `vercel env pull` (verify functionally).
- [ ] **When Stripe Atlas is approved (only thing left for REAL money):** swap to LIVE `sk_live_`/`pk_live_` keys in Vercel, create a LIVE webhook endpoint + LIVE `whsec_`, redeploy, re-test one live purchase + refund.
- [ ] **DECISION — Adaptive Pricing:** Stripe is auto-presenting **BDT** (≈38,072) as the default currency for BD-locale buyers, with USD as an option (account-level "Adaptive Pricing"). Decide: keep multi-currency presentment, or disable it for USD-only. (Dashboard → Settings → Payments.)

## Phase 5 — Environment & config ✅ DONE (2026-06-20, Production)
- [x] `NEXT_PUBLIC_APP_URL` was **empty** in Vercel production (would have broken checkout return URLs) — fixed to `https://www.ensoacademy.ai`. Verified functionally: Stripe success/cancel URLs resolved correctly during the live purchase.
- [x] All required prod env present: Supabase URL/anon/service-role, `OPENROUTER_API_KEY`, `GOOGLE_APPLICATION_CREDENTIALS_JSON`, the three Stripe vars, `NEXT_PUBLIC_APP_URL`. (Preview not populated with Stripe — production-only for launch.)
- [ ] (Nice-to-have) Confirm Supabase Auth Site URL + redirect URLs include the prod domain — login worked in the smoke test, so this is effectively fine.

## Phase 6 — Access-control / dev-mode cleanup ✅ DONE (2026-06-20)
- [x] **Disabled dev auto-enrollment.** Removed the auto-enroll block from `app/(dashboard)/courses/page.tsx`; access now comes ONLY from a completed purchase (the Stripe webhook creates the enrollment). Grep-verified the only two enrollment-insert paths are the (now-removed) dev block and `webhook/route.ts`. Added an "Available courses" buy-catalog section so a logged-in non-owner isn't dead-ended.
- [x] **Hardened the smoke-test endpoint** `/api/ai/smoke-test`: kept the service-role bearer guard (Phase 9 needs it) but it now **fails closed** if `SUPABASE_SERVICE_ROLE_KEY` is unset/short, so the literal `Bearer undefined` can never authorize.
- [x] Mock gating confirmed entitlement-based: `startMockExam` → `consumeMockAttempt` (atomic RPC) → throws `MOCK_PAYWALL` when none remain. No bypass path. `tsc --noEmit` clean after all Phase 6 edits.

## Phase 7 — Legal & compliance
- [ ] Counsel review of `/terms` and `/privacy` (especially refund terms, governing law, and the final operating entity).
- [ ] Confirm the operating entity + address used in Terms/Privacy match Stripe Atlas / Delaware filing.
- [ ] Set up the support/privacy mailboxes referenced (`support@ensoacademy.ai`, `privacy@ensoacademy.ai`).

## Phase 8 — Content accuracy final checks
- [ ] (Maintenance) Facts-pack TODO: enumerate the revised INR.16 ¶8-9 VA Travel-Rule data elements in `lib/ai/generator/facts_pack.ts` (bump `FACTS_PACK_AS_OF`) if any VA-travel-rule content is re-touched.

## Phase 9 — Verification / smoke tests ✅ PASSED (2026-06-20, live site, Playwright)
- [x] Production health: `/api/health/supabase` ok; home 200; landing shows CAMS available / others "Coming soon".
- [x] Login (test user) → dashboard.
- [x] **Free mock**: course page showed the $299 purchase view to the non-owner; `/courses/cams/mock` granted **1 free attempt**; started the **CAMS Full Exam Simulation** → faithful **120q / 210-min countdown / Q1-of-120** with a real scenario + 4 options + navigator. (Did not submit — results-page scoring not separately live-tested.)
- [x] **Paywall**: after the free attempt, the mock page showed **0 remaining** + both buy options ($14.99 / $299).
- [x] **Course purchase ($299, test card 4242…)** → Stripe Checkout → payment → redirect `?checkout=success` → **webhook created the enrollment → full course content unlocked**. DB-verified: `course_purchases=1`, entitlement `included_total` raised **1→5** (used 1 → 4 remaining), `mock_purchases=0`.
- [x] Enrollment de-dup confirmed (UNIQUE(student_id,course_id); webhook upsert correct).
- [ ] Not separately tested (share the verified webhook path / by design): pay-per-mock $14.99, webhook idempotency re-send (idempotent by the unique purchase anchor), readiness after multiple mocks, results-page scoring.

## Phase 10 — Launch ✅ LIVE in TEST mode (2026-06-20)
- [x] `main` deploys green (after fixing two build-breakers: `'use server'` non-async exports in `lib/mock/actions.ts`, and `new Stripe()` at module load → lazy `getStripe()`). Course **published** + enrollable; full purchase flow works.
- [ ] **Real-money launch (pending Stripe Atlas):** switch to LIVE keys + LIVE webhook, one real low-risk transaction + refund. Until then the site is live and accepts **test** payments only.
- [ ] Announce (after Atlas / real-money is on).

## Phase 11 — Post-launch / known follow-ups
- [ ] **Webhook fulfilment hardening** (known edge): a grant step failing *after* the purchase insert returns 200 (no retry) → rare paid-but-under-granted, recoverable from the audit row. Harden with a fulfilment-status flag + retry-safe re-grant.
- [ ] Monitor: Stripe payments/disputes, Supabase logs/advisors, AI (OpenRouter) spend, mock completion + pass rates.
- [ ] Gather 5–10 real candidate runs (the trust/proof flywheel) → testimonials → consider raising CAMS $299 → $399.
- [ ] Deferred product items (post-launch): concept node-graph visualizer, portfolio/evidence hub, reactive mascot states; additional certs (CDCS/CCAS + the BD track) each need their own bank + faithful-mock config + BDT pricing.

---

### Quick command sequence (happy path, once env + Stripe webhook are set)
```
supabase db push
supabase gen types typescript --project-id yffwnyuodulbfjjobhmf > lib/supabase/database.types.ts
pnpm tsx scripts/generate-course.ts write      # promote content + 502 questions
pnpm tsx scripts/seed-cams-mock.ts             # create the faithful mock template
# then: publish the cams course (status -> published), disable dev auto-enroll, smoke-test
```
