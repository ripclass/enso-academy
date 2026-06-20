# Enso Academy — Session Handoff

**As of:** 2026-06-21 · **Status:** 🟢 **CAMS is LIVE, taking real money, exam-validated.** Next focus: the **experience/packaging phase** (make the product *feel* worth $400).

This is the single-glance handoff. Deeper detail: `CLAUDE.md` (milestone line), `docs/GO-LIVE-CHECKLIST.md`, `docs/PROGRESS.md`, `docs/SESSION-NOTES.md`.

---

## What is live right now
- **Course:** `cams` is **published** at https://www.ensoacademy.ai/courses/cams — 11 modules / 49 lessons / 499 scenes / 502 questions / 313 glossary.
- **Payments: LIVE (real Stripe keys).** `charges_enabled=true`; **payouts paused** (funds accrue until the US bank/address is sorted — accepted by Ripon). Live webhook `we_1TkSUy…`. Account `acct_1T4IAtBG8gnvAJXa` ("Enso Intelligence Labs, Inc.").
- **Product model:** paid = **Full Exam Simulation** (120q / 3.5h, entitlement-gated — $14.99/attempt or 5 with course). Free = **Practice Mock** (25q/30min, unlimited for enrolled owners, no attempt consumed).
- **Pricing:** **$399 list → $299 limited ($100 off)**; **14-day** refund; Adaptive Pricing kept (BD sees BDT).
- **Access:** purchase-only (dev auto-enroll removed). Stripe webhook → enrollment + 5 mocks on course purchase.
- **e2e tested (test mode):** login → free attempt → 120q sim → paywall → $299 purchase → webhook → unlock + 5 mocks; free practice mock → submit → results/by-domain/per-question review (incl. multi-response). All passed + DB-verified.

## ⛔ Operator action items (only Ripon can do)
1. **ROTATE the live secret key** — `sk_live_` was pasted in chat (transcript-exposed). Stripe → Developers → API keys → roll → paste me the new one → I update Vercel. *(Also delete the unused `rk_live_` he created.)*
2. **One real-card live test + refund** — buy a $14.99 simulation with a real card, confirm the attempt grants, refund from the dashboard. (Agent can't do a real charge; test card `4242` is test-mode only. Everything else on the live path is verified.)
3. **Send the voice key** — `ELEVENLABS_API_KEY` (narration) and/or `OPENAI_API_KEY` (live tutor). **Unblocks the #1 next-phase item.**
4. **Send the full write-up** of product corrections (Ripon is compiling it).
5. Deferred: counsel review of Terms/Privacy; 2 Supabase advisor WARNs (enable leaked-password protection; lesson-audio bucket listing).

## ▶ Next build phase — EXPERIENCE / PACKAGING (the priority)
Content is mature; UI/UX + interactivity are thin. Studied **OpenMAIC** (open.maic.chat) — gap is pure packaging. We already beat them on content fidelity, the exam simulation, and the student model. Adopt their *show*:

- **Tier 1 (core):** (1) **Classroom playback** — lessons play scene-by-scene like a video with the lecturer's **voice** + play/pause/speed/auto + scene nav *(voice key unblocks)*; (2) **animated slides** (reveal in sync with narration, not static text); (3) **3–4 named classmates** asking questions in-flow.
- **Tier 2:** (4) voice input (mic→STT); (5) interactive flashcards (flip + spaced repetition); (6) richer quizzes + **retake-integrity fix** *(real bug: answer options aren't shuffled per attempt → retakes are position-memorizable; fix = shuffle per attempt + pool variation)*; (7) 1–2 signature AML interactives (transaction-network map, drag-to-classify risk, screening match).
- **Tier 3:** progress/mastery viz + "X concepts mastered" depth indicators; whiteboard mode; PPTX/offline export.

## Open product decisions
- **National Frameworks re-scope** (pending Ripon's write-up): the **CAMS exam is ONE global exam — no country-specific questions.** So country deep-dives don't help anyone *pass*. Plan → global CAMS = FATF + US/EU/UK + "map it to any jurisdiction"; localized national add-ons (India/Pakistan/…) as a separate **practitioner** layer where BD is just one of many; keep BD-centric content in the **Enso Academy Bangladesh** track.
- Classmate cast size: TBD (define how many, OpenMAIC-style).

## Key facts / gotchas for next session
- **Generation is INLINE** (Claude subscription), never the OpenRouter `generate-course.ts lesson` API path.
- **`vercel env add` ignores piped stdin in agent mode** — use `--value "<v>" --force --yes` (`--sensitive` for secrets). Sensitive vars **can't be read back** via `vercel env pull` — verify functionally.
- **`'use server'` files may only export async functions** (shared consts/types go in a plain sibling — see `lib/mock/types.ts`). Don't build SDK clients at module load with `KEY!` (lazy `getStripe()`).
- **Always check `vercel ls` after a push** — tsc-clean code can still fail the Turbopack prod build.
- **Test account:** `livecheck.claude@ensoacademy.ai` / `LiveCheck-2026-Jun11!` — owns CAMS, 3 sim attempts left, unlimited practice, some past results. (Creds also in `.env.local` TEST_USER_*.)
- Stripe **test** webhook `we_1TkR6V…` still exists (test-mode only; harmless). Playwright browser is logged into Stripe (Google) + the test user.
- CAMS course id: `364842c7-393b-46dc-8924-7b9164639a22`. Supabase project `yffwnyuodulbfjjobhmf`.
