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

## Phase 2 — Content: promote + publish
- [ ] Promote the course content to the DB (writes the `cams` DRAFT — lessons, scenes, 502 questions, glossary):
      `pnpm tsx scripts/generate-course.ts write`
      Note: the writer wipes + rewrites idempotently and refuses to overwrite a *published* course, so promote BEFORE publishing. Keep non-lesson `.json` out of `generated/cams/lessons/`.
- [ ] Spot-review the promoted course in the app (draft is viewable to you).
- [ ] Decide the **10.1 Google/Facebook cleared-with-fix flag** (victim names ride on public reporting, not the DOJ release) — accept or tweak.
- [ ] **Publish**: set the `cams` course `status` → `published` (SQL/dashboard). `/courses` and the course page only show published courses; the course page shows "launching soon" until then.

## Phase 3 — Mock simulation
- [ ] Seed the faithful mock template(s) AFTER promote:
      `pnpm tsx scripts/seed-cams-mock.ts`
      (creates "CAMS Full Exam Simulation" 120q/210min/75%/A36-B24-C36-D24 + a 60q diagnostic; prints per-domain mock-eligible coverage.)
- [ ] **Confirm vs the current ACAMS candidate handbook**: the scaled pass mark and the target multiple-response proportion (currently `pass_score_percent=75`, `multi_response_count≈10%`). Adjust `scripts/seed-cams-mock.ts` and re-run if different.

## Phase 4 — Payments (Stripe)
- [ ] In the Stripe Dashboard, add a webhook endpoint → `https://www.ensoacademy.ai/api/stripe/webhook`, event **`checkout.session.completed`**. Copy its signing secret.
- [ ] Set `STRIPE_WEBHOOK_SECRET` (Vercel Production + Preview) to that secret.
- [ ] Confirm `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` are the right keys per environment (TEST until Atlas approval).
- [ ] When **Stripe Atlas is approved**: swap to LIVE keys + create a LIVE webhook endpoint + LIVE signing secret; re-test one live purchase.
- [ ] (Local webhook testing) `stripe listen --forward-to localhost:3000/api/stripe/webhook`.

## Phase 5 — Environment & config
- [ ] Set `NEXT_PUBLIC_APP_URL` per environment (e.g. `https://www.ensoacademy.ai` in prod) — checkout success/cancel URLs use it.
- [ ] Verify all env vars synced to Vercel (Production + Preview): Supabase URL/anon/service-role, `OPENROUTER_API_KEY`, `GOOGLE_APPLICATION_CREDENTIALS_JSON`, the three Stripe vars, `NEXT_PUBLIC_APP_URL`.
- [ ] Confirm Supabase Auth config (Site URL + redirect URLs) includes the production domain (`supabase config push`).

## Phase 6 — Access-control / dev-mode cleanup (CRITICAL — do not skip)
- [ ] **Disable dev auto-enrollment.** `app/(dashboard)/courses/page.tsx` auto-enrolls any authenticated user (dev convenience). In production this would give the course away free. Gate it behind purchase (or remove it) so access comes only from a completed `course_purchase` / entitlement.
- [ ] **Remove or harden the smoke-test endpoint** `/api/ai/smoke-test` (currently bearer-protected by the service-role key) before launch.
- [ ] Re-confirm mock gating is entitlement-based (it is) and that no path bypasses it.

## Phase 7 — Legal & compliance
- [ ] Counsel review of `/terms` and `/privacy` (especially refund terms, governing law, and the final operating entity).
- [ ] Confirm the operating entity + address used in Terms/Privacy match Stripe Atlas / Delaware filing.
- [ ] Set up the support/privacy mailboxes referenced (`support@ensoacademy.ai`, `privacy@ensoacademy.ai`).

## Phase 8 — Content accuracy final checks
- [ ] (Maintenance) Facts-pack TODO: enumerate the revised INR.16 ¶8-9 VA Travel-Rule data elements in `lib/ai/generator/facts_pack.ts` (bump `FACTS_PACK_AS_OF`) if any VA-travel-rule content is re-touched.

## Phase 9 — Verification / smoke tests (end-to-end, on the deployed site)
- [ ] Production health: `GET /api/health/supabase` and `/api/ai/smoke-test` (with service-role bearer) pass.
- [ ] Sign up a fresh account → reach the dashboard.
- [ ] **Free mock**: start a mock with a new account → confirm 1 free attempt is granted and consumed, the exam is the faithful shape (count/time/domain mix incl. multiple-response), submit, see results + by-domain scoring.
- [ ] **Pay-per-mock**: exhaust the free attempt → buy a single mock with Stripe test card `4242 4242 4242 4242` → webhook fulfils → 1 credit granted → can start another mock.
- [ ] **Course purchase**: buy the course ($299, test card) → webhook creates the enrollment + grants ≥5 included mocks → course content unlocks → land back on the course page.
- [ ] Verify **idempotency**: re-send the same webhook event (Stripe Dashboard) → no double-grant.
- [ ] Verify **readiness**: take enough mocks to see the readiness status + the human-readable reason update.
- [ ] Verify the landing pricing CTAs + Terms/Privacy links resolve.

## Phase 10 — Launch
- [ ] Final deploy from `main` (Vercel auto-deploys); confirm the build is green.
- [ ] Switch Stripe to LIVE (if Atlas approved) and do one real low-risk live transaction, then refund it.
- [ ] Announce.

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
