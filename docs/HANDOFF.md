# Enso Academy — Session Handoff

**As of:** 2026-06-22 · **Status:** 🟢 **CAMS is LIVE, taking real money, exam-validated.** Experience/packaging phase well underway. Latest session shipped classroom subtitle/resume polish **and the full global (US/UK/EU) re-scope**.

This is the single-glance handoff. Deeper detail: `CLAUDE.md` (milestone line), `docs/GO-LIVE-CHECKLIST.md`, `docs/PROGRESS.md`, `docs/SESSION-NOTES.md`.

## ⭐ Latest session (2026-06-22) — classroom polish + GLOBAL re-scope
- **Classroom player polish — DONE + LIVE** (commit `3fba58d`, deploy `dpl_4iFb…` READY):
  - **Live lecturer subtitle:** the narration bubble now advances **sentence-by-sentence with the voice** (was a stale block stuck on the first sentence), is **anchored to the lecturer with a speech-bubble tail**, and **collapses when he's not speaking** (stage breathes). Files: `components/lesson/classroom/lecturer-presence.tsx` (`NarrationBubble` now takes `text`+`speaking`), `app/(dashboard)/lessons/[id]/lesson-player.tsx` (`splitSentences`/`activeSentence`, `spokenIdx` driven off `onTimeUpdate`, footer dock regrouped lecturer+bubble left / cast right).
  - **Continue resumes the lecture:** a raised-hand moment now **saves the narration position** (`lecturePosRef`) and **Continue seeks back + resumes** (`resumeLecture()`, `dismissMoment(resume=true)`) — it used to leave the lecture stopped. The round-arrow stays "replay this scene from the top" (by design); the ▶ button resumes mid-scene.
- **GLOBAL re-scope (Bangladesh de-privileged) — DONE + LIVE in the DB.** Bangladesh was woven in as the **default example jurisdiction** across the core (~247 hits / ~30 lessons). Swept to **US / UK / EU + "map it to any jurisdiction"** across **28 lessons, 98 scenes pushed to the live `content_library_elements`** (course reads from DB, so it's live now — no deploy needed for content; generated JSON is gitignored). e.g. the opening ML lesson now teaches **US 18 USC 1956/1957 · UK POCA · EU 6AMLD** (was US/UK/Bangladesh).
  - **`the-bangladesh-framework` KEPT as the optional national-framework deep-dive** (Ripon's call).
  - **Legit BD references intentionally kept** in the global core: the *Bangladesh Bank heist* deep-case (life-of-FIU, virtual-assets), the genuine *Sonali Bank (UK) / Haider* enforcement cases (mlro-cco), and **one** explicitly-"illustrative" APG evaluation (global-architecture).
  - **`the-global-architecture` deep case was swapped** from BD-centric → **Danske Bank Estonia** (real, well-documented; €200bn NRP, DOJ Dec-2022 ~$2bn, SEC $178.6m/~$413m — matches the facts spine; Bruun & Hjejle correctly demoted to secondary context). **Worth Ripon's glance.**
  - Method (for any future sweep): captured an exact JSON-scene→live-row map by content-equality, agents reframed JSON only (generalize-first), then a diff-push to the DB cleared `audio_url` on changed scenes. **Narration for the 98 changed scenes re-voices with the new global text on next play.** Verified: 0 prose artifacts, scene counts intact, live DB clean of BD-as-default vocab.
- **⚠ Caveat:** the 10 reframing subagents hit a **server-side rate limit** mid-run (not the usage cap) and the **safety classifier was unavailable**, so their work was **verified directly** (BD-vocab counts, scene-count integrity, prose-artifact scan, spot-read of the heaviest lesson) before pushing — not trusted blind. A couple of agents briefly made things *worse* (added CAMLCO/Dhaka); those were caught and fixed by hand.

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
3. ~~Send the voice key~~ — **RESOLVED**: narration is live via **Google Chirp 3 HD** on the existing GCP account (no ElevenLabs needed). `ELEVENLABS_API_KEY` / `OPENAI_API_KEY` are now only optional upgrades (specific voices / live tutor), not blockers.
4. **Send the full write-up** of product corrections (Ripon is compiling it).
5. Deferred: counsel review of Terms/Privacy; 2 Supabase advisor WARNs (enable leaked-password protection; lesson-audio bucket listing).

## ▶ Next build phase — EXPERIENCE / PACKAGING (the priority)
Content is mature; UI/UX + interactivity were thin. Studied **OpenMAIC** (open.maic.chat) — gap is pure packaging. **Tier 1 is BUILT + DEPLOYED to production (2026-06-21)** — merged to `main`, deploy `dpl_9myw…` READY, live at ensoacademy.ai. See the 2026-06-21 SESSION-NOTES entry for the full technical map.

- **Tier 1 — DONE + LIVE:** the lesson player is now an OpenMAIC-style **classroom** — full-bleed floating stage, transport (play/pause/speed/replay), **animated slides** (reveal in sync with narration), **lecturer dock + narration bubble**, **"YOUR CLASS" 6-classmate strip**, **Ask as a push panel** (text-only Q&A — voice reserved for teaching; asking pauses the lecture). **Voice is LIVE via Google Chirp 3 HD** (existing GCP account — ElevenLabs NOT required; on-demand per-scene synthesis self-caches to Storage). Real **avatars** (DiceBear personas — placeholder until Higgsfield). Per-scene **suggested-question chips**. **Cast-on-stage** (a classmate raises a hand on the stage; the lecturer answers + voiced), now chiming in more often (cap 4 + cooldown + ambient questions).
- **Tier 1 — also shipped (2026-06-21, all live):** the **3-beat bridged classmate moment** (lecturer notices the hand → "hold on, Priya, go ahead" → question → answer; one moment at a time, never interrupts), the **chapter-tick scrubber** (jump to any scene), an **audio/slide sync fix** (pause previous narration on scene change), Q&A made **text-only**, and the **first signature interactive — drag-to-classify-risk** (`components/lesson/scenes/interactives/risk-classify.tsx`).
- **Interactive + PBL — BUILT, SEEDED ACROSS MODULES, + FOLDED INTO THE GENERATOR (2026-06-21, all live):**
  - **Interactive** (`asInteractiveSpec`, `spec.kind`): **two widgets** — `risk-classify` (drag/tap into risk tiers) and `red-flags` (multi-select spot-the-indicators) in `components/lesson/scenes/interactives/`.
  - **PBL** (`asPblSpec`, `spec.kind='project'`): `pbl/project-scene.tsx` — brief + rubric + submission; `gradeProjectSubmission` (Sonnet) grades it (band + feedback, resubmittable), feeds the knowledge model.
  - **Seeded 10 live scenes across 10 of 11 modules** (only M6 has none): risk-classify (M1), red-flags (M0/M4/M5), PBL projects (M2/M3/M7/M8/M9/M10). To add more by hand: seed a `scene_type='interactive'|'pbl'` row (model the INSERT on an existing row; `element_type='explanation'`; place with a fractional `metadata.order`).
  - **Pipeline fold (automatic going forward):** `lib/ai/generator/lesson.ts` (scene schema + prompt) now asks Opus for one interactive/PBL application scene where the material supports it; `validate_gates.ts` validates the specs (citation gates skip them); `writer.ts` promotes them. So newly-generated courses get hands-on scenes automatically.
- **Avatars — DONE (2026-06-21, live):** replaced DiceBear with **hand-drawn black-ink line-art portraits** generated via **Higgsfield** (`nano_banana_pro`, ~2 credits each) to match Ripon's reference. Stored in `public/avatars/*.webp` (6 classmates + lecturer-male/female + user-male/female). `avatar.tsx` is image-based (seed→image map for classmates; explicit `src` for lecturer/user; glyph fallback). **Lecturer alternates male/female per chapter** (`lecturerFor(lessonId)`). **User avatar male/female is selectable on the dashboard** (`components/settings/avatar-picker.tsx` → `lib/settings.ts` → `student_preferences.avatar_choice`), threaded into the player. To regenerate/add: Higgsfield `generate_image` in that line-art style, download the `_min.webp`, drop in `public/avatars/`.
- **Avatar fixes (2026-06-21):** sized avatars correctly (they were ballooning from `h-full w-full` in an unsized container); **lecturer voice now matches the avatar gender** — `lecturerVariantFor(lessonId)` (shared in `scenes.ts`) drives BOTH the avatar and the voice (`LECTURER_VOICES` = male Charon / female Kore), in `getSceneAudio` + `synthesizeText`.
- **Mock retake-integrity — FIXED (2026-06-21):** options are now shuffled per attempt in `startMockExam` (`toMock` → `shuffle(normalizeOptions(...))`); grading is id-based so scoring is unaffected; the results review shows the snapshot order the student saw.
- **Remaining (optional):** more interactive kinds (transaction-network map, screening match) — everything else on the experience list is done + live.
- **Tier 2:** voice input (mic→STT); interactive flashcards; richer quizzes + **retake-integrity fix** *(real bug: options aren't shuffled per attempt → position-memorizable; fix = shuffle per attempt + pool variation)*; the real **interactive + PBL scene renderers** (transaction-network map, drag-to-classify, screening match — the genuinely interactive content).
- **Tier 3:** progress/mastery viz; whiteboard mode; PPTX/offline export.

## Open product decisions
- **National Frameworks re-scope — DONE (2026-06-22).** Lesson content globalized to **FATF + US/UK/EU + "map it to any jurisdiction"**; `the-bangladesh-framework` kept as the optional national-framework deep-dive. **Still TODO if Ripon wants:** (a) re-scope the **question bank** the same way (the 502-q bank may still lean BD in the national-frameworks module — not yet swept); (b) decide whether BD-specific national content seeds the separate **Enso Academy Bangladesh** track.
- Classmate cast size: TBD (define how many, OpenMAIC-style).

## Key facts / gotchas for next session
- **Generation is INLINE** (Claude subscription), never the OpenRouter `generate-course.ts lesson` API path.
- **`vercel env add` ignores piped stdin in agent mode** — use `--value "<v>" --force --yes` (`--sensitive` for secrets). Sensitive vars **can't be read back** via `vercel env pull` — verify functionally.
- **`'use server'` files may only export async functions** (shared consts/types go in a plain sibling — see `lib/mock/types.ts`). Don't build SDK clients at module load with `KEY!` (lazy `getStripe()`).
- **Always check `vercel ls` after a push** — tsc-clean code can still fail the Turbopack prod build.
- **Test account:** `livecheck.claude@ensoacademy.ai` / `LiveCheck-2026-Jun11!` — owns CAMS, 3 sim attempts left, unlimited practice, some past results. (Creds also in `.env.local` TEST_USER_*.)
- Stripe **test** webhook `we_1TkR6V…` still exists (test-mode only; harmless). Playwright browser is logged into Stripe (Google) + the test user.
- CAMS course id: `364842c7-393b-46dc-8924-7b9164639a22`. Supabase project `yffwnyuodulbfjjobhmf`.
