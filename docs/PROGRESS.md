# Enso Academy Progress Log

## 2026-05-24 — Path 2 infrastructure (ADR 0019): deterministic gates + Codex orchestration shipped

Built the five Path-2 components per the priority order Ripon set after the Launch Quality Bar evaluation. All five cycles implemented and tested against the Path-1 fixtures.

- **Cycle 1 — `scripts/validate-lesson.ts`**: CLI runner for `validate_gates.ts` (the gate runner was committed pre-this-ADR as a seed). `pnpm tsx scripts/validate-lesson.ts <course-slug> [--all | <lesson-slug>]`. Writes `<lesson-slug>.validation.json` sibling, exits 0/1/2 for pass/flag/fail. Wired into `lib/ai/generator/index.ts` exports.
- **Cycle 2 — `lib/ai/generator/citation_bind.ts`**: substring-verified bind for structured factual references (statutes / cases / EOs / named publications) with lesson-wide candidate scope, multi-bindKey alias expansion (UK/BD abbreviations, FATF R variations, UNSCR forms), and range / `et seq.` expansion in candidate labels. Integrated as gate 7 in `runGates`. Catches real gaps in the Path-1 fixtures (1.2 UNSCR 1373 / FATF R.5 unanchored; 1.3 scene 6 BD ATA 2009 / MLPA 2012 unanchored) that Codex's per-artifact rounds missed.
- **Cycle 3 — `supabase/migrations/20260524161116_path2_lesson_review_events.sql`**: append-only `lesson_review_events` table matching the 18-event Path-1 JSONL shape 1:1. RLS-enabled, service-role writes, authenticated read. Indexes for timeline-per-lesson and content-addressable lookup. `scripts/backfill-review-events.ts <course-slug>` ingests the JSONL. Migration NOT applied — Ripon runs `supabase db push` when ready.
- **Cycle 4 — `lib/ai/generator/codex_dispatch.ts`**: `dispatchCodex({ brief })` always pipes via file-to-stdin (closes the self-attribution failure mode); `parseVerdict(raw)` line-based parser robust across Codex's line-break variations; `parallelCrossCheck` dispatches methodology + factual-fidelity in parallel (collapses two iterations to one per the LQB lesson); `makeReviewEvent` / `appendReviewEvent` persist to JSONL always + DB best-effort.
- **Cycle 5 — source-registry semantics + iteration cap**: `outline.sources[]` is now ADVISORY (citation gate is informational; only the all-disjoint case FLAGs — likely wrong outline). `MAX_CODEX_ITERATIONS_PER_LESSON = 3` + `countPriorCrossChecks(courseSlug, lessonSlug)`. Validated against Path-1 history: 1.1 = 0 events (calibration), 1.2 = 3 (at cap — final AGREE on round 3), 1.3 = 6 (over cap — vindicates the 3-iteration threshold as the right operational signal).

All seven gates pass type-checking (`pnpm tsc --noEmit`). The CLI runner validates all three CAMS lessons end-to-end. The `parseVerdict` smoke-test confirms parsing across SPLIT-inline-bullets / AGREE-empty / SPLIT-multi-line-bullets shapes from real Path-1 Codex outputs.

## 2026-05-24 — CAMS lesson 1.3 sixth cross-check clears the last round-5 residual

Ran a narrow verification pass on `generated/cams/lessons/why-states-regulate-financial-institutions.json` focused on the single scene-6 narration residual left by round 5.

- Verdict: `AGREE`.
- Verified fixed: the unsupported entity-count phrasing (`"despite representing a small fraction of the regulated population by entity count"`) is gone from the artifact.
- Verified fixed: scene 6 narration now matches item 5's supported formulation — FinCEN's public `SAR Stats` dataset documenting depository institutions filing the substantial majority of US SAR submissions annually.
- No regressions found on the round-5-confirmed items: scene 8's substantive base, HSBC docket / Judge I. Leo Glasser / no Cherkasky, Travel Rule scope, AMLA characterisation, scene 5 VASP definition, and scene 4 DNFBPs.

## 2026-05-24 — Independent comparative scoring of CAMS lessons 1.2 and 1.3 vs calibration lesson 1.1

Read the three generated lesson artifacts from disk and scored CAMS lesson 1.2 (`what-terrorist-financing-actually-is.json`) and lesson 1.3 (`why-states-regulate-financial-institutions.json`) against calibration lesson 1.1 (`what-money-laundering-actually-is.json`) on the eight-part launch-quality bar.

- Lesson 1.2 scored `PASS`: it matches or exceeds lesson 1.1 on scene structure, source coverage, deep-case treatment, quiz quality, and overall methodology discipline.
- Lesson 1.3 scored `FAIL`: the earlier HSBC judge/monitor, DNFBP/Travel-Rule, and AMLA direct-supervision defects are fixed, but two approval-blocking source-discipline issues remain:
  - scene 6 carries unsupported quantitative burden claims (FinCEN SAR Stats / industry-cost assertions) without primary-source support in the scene or adjacent reading scenes;
  - scene 8 relies on the FinCEN Files investigative reporting as substantive lesson source material, which falls below the primary-source-only methodology bar.

Path-2 recommendation from the review: do not build yet. Bring lesson 1.3 up to the lesson 1.1 calibration bar first.

## 2026-05-24 — CAMS lesson 1.3 revised cross-check (still approval-blocking)

Re-reviewed the revised CAMS lesson artifact `generated/cams/lessons/why-states-regulate-financial-institutions.json` (hash `e1a51dbb0abad6aa62efb9f89d39bf81d8bc7522f55296bc976411c40bcd664a`) against the four previously flagged issues and the cited primary materials.

- Verified fixed: HSBC scene now correctly ties the 11 Dec 2012 filing to docket `1:12-cr-00763-ILG` / Judge I. Leo Glasser, with Judge John Gleeson limited to the later 1 July 2013 memorandum and order.
- Verified fixed: the unsourced Michael Cherkasky name is gone; the scene now stays at the supported claim that HSBC accepted a five-year independent compliance monitor.
- Verified fixed: the comparison slide text now correctly states that FATF R.16 / the Travel Rule applies to financial institutions and is extended by INR.15 to VASPs, not to DNFBPs under R.22/R.23.
- Verified fixed: the DNFBP scene now correctly states that AMLA direct supervision is for selected cross-border credit/financial institutions, not DNFBPs, with the first wave from 2028.
- Verdict remains `SPLIT`, because scene 6 still contains approval-blocking residual wording in its narration: it says FATF Recommendations 10, 11, 16, 20, and 21 are “the same words on the page” for a bank, DNFBP, and VASP, which reintroduces the Travel Rule error the slide text just corrected.

This lesson should still not be handed off as reviewer-ready until scene 6 narration is aligned with FATF R.22/R.23 and INR.15.

## 2026-05-24 — CAMS lesson 1.3 second-opinion review (approval blocker)

Reviewed the generated CAMS lesson artifact `generated/cams/lessons/why-states-regulate-financial-institutions.json` as an independent second-opinion reviewer before approval.

- Verdict: `SPLIT` — scene structure and IP cleanliness were acceptable on review, but citation fidelity was not yet approval-ready.
- Concrete issues found in the artifact:
  - HSBC deep-case scene says the 11 Dec 2012 DPA was filed before Judge John Gleeson; the filed 12/11/12 docket documents are captioned `1:12-cr-00763-ILG` (Judge I. Leo Glasser). Judge Gleeson appears on the later 1 July 2013 memorandum and order.
  - HSBC deep-case scene names Michael Cherkasky as the five-year monitor, but the scene's cited 11 Dec 2012 sources (DPA / Statement of Facts / DOJ press release / OCC / Federal Reserve) do not themselves identify him.
  - Comparison slide wrongly says banks, DNFBPs, and VASPs all apply the Travel Rule; FATF R.16 applies to financial institutions, and INR.15 extends the travel-rule equivalent to VASPs, but FATF R.22/R.23 do not extend R.16 to DNFBPs.
  - DNFBP scene says AMLA will directly supervise the largest cross-border DNFBPs from 2025 onward; the EU AMLA framework provides direct supervision for selected credit/financial institutions, not DNFBPs, and AMLA was not directly supervising DNFBPs from 2025.

This review should block approval of lesson 1.3 until the artifact is corrected.

Append-only log of milestones completed. Newest entries at top.

## 2026-05-22 — Visual Layout Refinement (Reference Matching)

Completed a visual overhaul of the landing page to exactly match the design reference.

- **Theme & Typeface**: Replaced Bricolage display font with Outfit display font in root layout and CSS. Set light cream paper background (`#FAF7F2`) and charcoal (`#1E1E1E`) as primary colors. Fixed page.tsx background override bug.
- **Header & Navigation**: Styled primary actions as hollow outline pill buttons, aligning with the reference's minimalist posture.
- **Hero Grid**: Aligned layout with reference image grid, showcasing the tracking-tight, uppercase headline on the left (col-span-8), supporting paragraph pairs on the right (col-span-4), and the grayscale study environment image underneath.
- **Capabilities list ("HOW WE WORK")**: Stacked elements flush using a shared border overlap (`mt-[-1px]`) and tight padding (`py-4`) so headers sit closely together without overlapping text. Implemented click-driven accordion behavior (clicking a tab expands it and collapses others; flat bottom border without bottom rounded corners for the last item).
- **Course Lineup**: Styled all cards straight by default. Added hover triggers so mouseover on any card transitions it into the layered collage layout (grayscale workspace image fading in with the text card tilting left `rotate-[-3.5deg]` and sliding downwards `translate-y-28` to overlap the bottom edge while maintaining its fixed height `h-[420px]` so it never shrinks).
- **Validation**: Compiled successfully under Turbopack (`pnpm run build`), TypeScript clean, zero errors.

---

## 2026-05-22 — UX/UI + branding pass: public landing page + brand identity v2 (Prompt 14)

The product gets a public face and one coherent design language, before commerce.

**Brand identity v2 (ADR 0018, supersedes ADR 0007)** — the "Auditable Editorial / Cold Fidelity" design language, documented in docs/BRAND.md. Teal/coral retained; `Outfit` becomes the display typeface, `Geist Mono` carries all data (stats, concepts, timers). A real ensō `<Logo>` replaces the text wordmark; a `<Mascot>` — the "Enso Guide" — is introduced (calm, mature, ensō-derived; built from separable SVG paths to animate later). This reverses FRAMEWORK.md's "no cartoon mascots" — FRAMEWORK.md amended to record the decision.

**Public landing page at `/`** — hero, the "it sells readiness" pitch, the six capabilities, course lineup, pricing preview, FAQ, footer. SEO + OG metadata, a branded favicon (app/icon.svg), `/terms` + `/privacy` stubs (real legal pages land with payments).

**The in-app journey re-skinned** — dashboard, /courses, course detail, the lesson player (Socratic Q&A panel anchored by the Mascot), the mock taker ("Cold Fidelity" — a deliberate sterile slate theme), mock results — all in the new language via a shared `AppHeader` + `ui-kit` (components/in-app/). All spine wiring preserved untouched.

**Workflow** — built by integrating a Gemini-assisted first cut: Gemini produced presentational components from a reference design + the framework; this session reviewed, fixed, and integrated. Honesty fixes applied to the Gemini copy — no "guaranteed to pass", no "registered trademark" claim, the signoff is not called a certificate. Relay artifacts committed under docs/prompts/.

Deferred to post-launch (captured, not built): an interactive concept node-graph visualizer, a portfolio/evidence hub, reactive/animated mascot states.

Verified: `pnpm build` clean (18 routes, TypeScript clean); the landing page renders desktop + mobile with zero console errors; the auth pages render with the new Logo. The in-app re-skin is build-verified — visual review happens post-deploy.

Next: Prompt 15 — Stripe / payments.

---

## 2026-05-22 — Content pipeline built and trial-validated (the launch gate)

The pipeline that turns the committed methodology into a generated course.

- lib/ai/generator/ — a staged Claude Opus pipeline: outline → per-lesson scenes → per-module assessment. The methodology (docs/COURSE-GENERATION-PROMPT.md) is the verbatim Opus system prompt; output is strict JSON parsed defensively; each stage persists a gitignored artifact under generated/ so runs are resumable and reviewable.
- scripts/generate-course.ts — the operator CLI (outline / lesson / assessment / full / write). `full` is resumable; `write` is always a deliberate separate step.
- writer.ts writes the course as a DRAFT (course_status 'draft' — hidden from /courses, not enrollable). The methodology mandates SME review before publishing.
- ADR 0017 records the design; docs/RUNBOOK-course-generation.md is the operator procedure for the full run.

Trial-validated for $3.52 (real Opus spend): generated the CAMS course outline (9 modules, 40 lessons, 37 primary sources — $2.55) and one full lesson's 11 scenes ($0.97); wrote a CAMS draft course; verified the generated content renders in the scene-based lesson player. The generated content is methodology-compliant — primary-source citations (US BSA, UK POCA, Bangladesh MLPA), public enforcement cases (Danske Bank), nominative course naming, no competitor materials.

This prompt did NOT run the full course generation — that is hours of operator-supervised work, ~$hundreds, followed by SME review. The pipeline is the launch-gate tool; running it + SME review is what remains.

Next: the full CAMS generation + SME review (content track), then Prompt 14 — payments.

---

## 2026-05-22 — Scene-based lesson delivery (lesson player v2)

A lesson is now an ordered list of typed SCENES, not a wall of text. Decided after reviewing OpenMAIC's delivery layer; lands before the content pipeline so Opus generation targets the right output shape.

- Migration: `content_library_elements` gained `scene_type` (enum: reading/slide/quiz/interactive/pbl) + `scene_data` jsonb. Existing rows default to reading/{} — backward compatible.
- lib/lesson/scenes.ts — the canonical scene-data contract (discriminated Scene union + parseScene). Consumed by the renderers AND the output contract the content pipeline will hand to Opus.
- components/lesson/scenes/ — renderers: ReadingScene (markdown + citations), SlideScene (4 templates: key-points / definition / comparison / callout), QuizScene (inline formative MC with feedback), PlaceholderScene (interactive/pbl), SceneRenderer.
- Lesson player v2: renders scenes via SceneRenderer; the spine carries over untouched (Q&A panel, continuity greeting, classmate gap-check on advance, completion + memory, Listen-mode TTS). New: quiz scenes feed the student knowledge model via recordQuizEvidence.
- CDCS lesson 1 re-seeded into scene format (slide ×4 templates, reading, quiz); lessons 2-3 render as reading scenes via backward compatibility.
- ADR 0016 records the design and what was deliberately cut (whiteboard, playback director, canvas renderer, PPTX export — a later bet, not a launch dependency).

Verified locally: all scene types render; a quiz answer fed the knowledge model (independence_principle 0.30→0.457 from a correct answer, issuing_bank registered an incorrect); the classmate still fired on scene advance; completion ran; un-migrated lesson 2 rendered as reading scenes.

Next: Prompt 13 — the content pipeline, emitting scene-based CAMS content against this contract.

---

## 2026-05-22 — Course generation methodology committed (v1.0)

- docs/COURSE-GENERATION-PROMPT.md placeholder replaced with the real v1.0 methodology (~29.7KB), authored by the project owner.
- Defines the IP-defensible, primary-source-only approach: the allowed source hierarchy (primary regulatory texts, standard-setter publications, public enforcement actions, open-access academic work, news as pointer-only, original analysis, RulHub) and the prohibited sources — ACAMS/ACFE/GARP study guides, Wiley/Kaplan/Schweser/ICA commercial prep, and copyrighted ICC rule text (UCP 600 etc.) as substantive content.
- Specifies the construction method (map the discipline from primary sources, not a certification's published syllabus), citation discipline, quiz design, nominative-fair-use course naming + disclaimers, QA requirements, and a prose description of generation output.
- ADR 0015 records it as canonical v1.0.
- Delivered via an adapted PROMPT-08.5 — the original prompt predated the roadmap re-sequencing (it referenced "Prompt 9 = content pipeline" and "ADR 0012", both stale); corrected to ADR 0015 with no stale Prompt-9 references.
- Concern recorded: the methodology prohibits building lessons from ICC rule text, but the hand-seeded CDCS dev course teaches from UCP 600 articles — a placeholder to be replaced. CAMS is the cleaner first real course.

The content-generation pipeline (a later prompt) will be designed around this methodology.

---

## 2026-05-22 — The classmate live (the 6.0 moat) — pedagogical spine complete

Third prompt of the re-sequenced roadmap, and the one the re-sequencing existed for. The classmate raises a hand and asks the question the student should be asking but isn't.

- lib/classmate/actions.ts: checkClassmateGap — runs when the student advances past a lesson element.
- Model-grounded gap detection: fires only on an evidenced gap — a concept the element taught with student_knowledge_state mastery < 0.45 AND observation_count > 0. No model evidence → no fire.
- The classmate is a per-course character (classmates table; getOrCreateClassmate). Fires at most once per lesson session (MAX_INTERVENTIONS_PER_SESSION = 1, tunable).
- On a gap: Sonnet generates an in-character question, Haiku generates the lecturer's grounded answer; both render in the lesson Q&A panel (a 'classmate' message + a 'lecturer' message).
- Logged to classmate_interventions with gap_evidence; seeds cached_qa with origin 'classmate_asked' — framework moat 4, the classmate-discovered blind-spot dataset.
- classmate_interventions / classmates already had the right shape — no migration. The qa_origin enum already had 'classmate_asked'.
- ADR 0014 records the design (model-grounded, conservative firing, per-course character, the moat-4 tag).

Verified locally: the classmate "Lena" fired on independence_principle (the demo account's weakest concept, mastery 0.30) with a natural, in-character question — "Oh, sorry — can I just ask… does that mean the bank is never allowed to look into the shipment, or just not required to?" — followed by the lecturer's answer. Fired exactly once across four element transitions. classmate_interventions + a classmate_asked cached_qa row written.

The 6.0 pedagogical spine is complete: the lecturer knows what the student knows (Prompt 9), who they are (Prompt 10), and what they're missing (Prompt 11). What remains before launch is content and commerce.

---

## 2026-05-22 — Lecturer memory live (the 5.0 spine)

Second prompt of the re-sequenced roadmap. The lecturer now remembers who the student is across sessions.

- lib/student-model/memory.ts: summarizeSessionToMemory (writer), getMemoryPreamble + getLecturerOpening (readers).
- student_memory already had the right shape — no migration. It is an editorial layer of durable relational facts (goal / context / struggle / preference) — not a transcript, not concept mastery.
- Writer: a Claude Sonnet summarization at lesson completion, scheduled via Next.js `after()` so it runs post-response — "Complete lesson" stays fast.
- Readers: askLecturer injects a memory preamble alongside the Prompt 9 mastery preamble; getLecturerOpening generates a Haiku continuity greeting shown as the opening lecturer message in the lesson Q&A panel.
- Dashboard shows "Welcome back" for returning students.
- ADR 0013 records the design (editorial layer, after()-scheduled writer, no v1 compaction).

Verified locally: a study session with goal- and struggle-revealing questions distilled 3 correctly-typed facts; the next lesson opened with the lecturer greeting — "Welcome back! …this will help clarify the relationships behind those banking day counts we've been working through. Let's take it step by step as always." — referencing the remembered struggle and pace preference.

The lecturer now knows what the student knows (Prompt 9) and who they are (Prompt 10). Next: Prompt 11 — the classmate.

---

## 2026-05-22 — Student knowledge model live (the 4.0 spine)

First prompt of the re-sequenced roadmap (docs/ROADMAP.md). The student model — framework capability one, "the foundation" — was empty schema; this makes it live.

- lib/student-model/knowledge.ts: recordEvidence (writer) + getMasterySummary (reader). v1 update rule — lr = 1/(observation_count+4), targets correct 1.0 / incorrect 0.0 / lesson_completed 0.7, new concept seeds 0.5. Bayesian-flavored, not full BKT.
- student_knowledge_state already had the right shape (concept_tag, mastery_probability, observation_count, correct/incorrect counts) — no migration needed.
- Writers wired: submitMockExam records one observation per answered question; completeLesson records mild-positive evidence for the lesson's taught concepts.
- Reader wired: askLecturer injects a natural-language mastery preamble into the Haiku system prompt (cache-miss path); the lesson player passes the in-context concept tags.
- "Your knowledge" card on the course detail page — strong / to-review concepts.
- ADR 0012 records the update rule and the cache/personalization tradeoff.

Verified locally: a 20-question CDCS mock populated 30 concept rows with a correct spread (update math matches the rule exactly); the lecturer answers through the new reader path; the "Your knowledge" card renders.

The AI lecturer now knows what the student knows. Next: Prompt 10 — lecturer memory.

---

## 2026-05-22 — TTS audio narration live (Listen mode)

- Google Cloud Text-to-Speech wired via service account (en-US-Wavenet-D Wavenet voice)
- GCP project enso-academy created, Text-to-Speech API enabled, service account enso-academy-tts — setup driven live through the GCP Console via Playwright (Ripon logged in; Claude clicked through project / API / service account / key)
- Credentials: .secrets/gcp-tts-service-account.json locally (gitignored), GOOGLE_APPLICATION_CREDENTIALS_JSON inline JSON in Vercel
- lib/audio/tts.ts: synthesizeSpeech / synthesizeStreaming wrappers (file-path or inline-JSON credentials)
- lib/audio/pregenerate.ts: pre-generation pipeline for course content_library_elements
- Supabase Storage bucket 'lesson-audio' created (public read / service-role write)
- Schema: added audio_url, audio_generated_at, audio_duration_seconds to content_library_elements
- /api/admin/pregenerate-audio endpoint (service-role gated)
- Pre-generated 16 MP3s for the full CDCS dev course (cost ~$0.23)
- Lesson player: Listen mode toggle, auto-queue audio between content elements, status indicator
- Listen mode preference persists to student_preferences.preferred_modality
- Real-time TTS for AI lecturer Q&A responses when Listen mode is on
- scripts/setup-gcp-tts.ts: reproducible GCP service account setup utility
- ADR 0011: TTS architecture

The product now has voice. Multi-modality commitment partially fulfilled (audio mode live; dialogue and drill modes deferred to v2).

---

## 2026-05-21 — Mock exam engine live

- Seeded 32 CDCS questions across 4 domains (parties_to_credit 8, ucp_600_articles 14, standby_vs_commercial 5, trade_finance_compliance 5)
- Seeded CDCS Mock 1 template: 20 questions, 40 minutes, 75% pass threshold
- lib/mock/actions.ts: startMockExam, submitMockExam, updateReadiness, getAttemptResults
- Mock launch page at /courses/[slug]/mock
- Full mock-taking UI: no-pause timer (auto-submit at zero), 20-question grid navigation, flag-for-review, focus/blur tracking, beforeunload guard, two-step submit confirmation
- Results page: score, by-domain breakdown, per-question review with explanations and correct/incorrect markings
- student_readiness populated on every submission; signoff_events logged on status transitions
- Course page shows a readiness indicator and Take Mock CTA
- ADR 0010: mock exam engine v1

Verified locally end-to-end (Playwright): started a mock, answered all 20, two-step submit, results rendered (15%, by-domain, per-question review); student_readiness upserted (not_ready, 1 mock, avg 15), signoff_event written.

Product is structurally complete: study (lesson player) + assess (mock engine).

---

## 2026-05-21 — Fix: render markdown in AI lecturer answers

The lecturer's answers contain markdown (bold, lists, paragraphs); the Q&A panel rendered them as plain text, so `**bold**` showed literally. Added react-markdown — lecturer messages now render as proper markdown; student messages stay plain text. Verified locally + in production.

---

## 2026-05-21 — First working product surface: lesson player live

- Seeded CDCS dev course in Supabase: 1 course, 1 module, 3 lessons, 16 content elements (hand-drafted placeholder, not Opus-generated)
- /courses listing page with auto-enrollment for authenticated users (dev mode)
- /courses/[slug] course detail page with module + lesson navigation
- /lessons/[id] full lesson player:
  - Sequential navigation through content elements (prev/next)
  - Side panel for student questions to the AI lecturer
  - Cache-first lookup via the match_cached_qa RPC (0.85 similarity threshold)
  - Haiku fallback for cache misses, answer cached for future students
  - Session tracking via sessions + session_events
  - Lesson completion logging
- lib/lesson/actions.ts: server actions — startLessonSession, getLessonContent, askLecturer, completeLesson
- Dashboard updated to direct users to /courses
- ADR 0008: lesson player architecture v1

Verified locally end-to-end (Playwright): login -> /courses (auto-enrolled in CDCS) -> /courses/cdcs -> lesson player -> asked the lecturer a grounded question (Haiku) -> re-asked, got the cached answer with the "cached" badge. DB confirmed: cached_qa 1, lesson session 1, session_events 3.

This is the inflection point: infrastructure -> product.

---

## 2026-05-21 — Auth UI shipped: design system v1

- Installed shadcn/ui (Base UI variant — the current CLI's default preset; not classic Radix)
- shadcn components: button, input, label, card, separator, alert, sonner
- Design system v1: Geist typography, deep teal primary (#0F3D3E), warm coral accent (#E07856), light mode only, generous spacing — tokens in app/globals.css (ADR 0007)
- Wordmark component (text-only "Enso Academy")
- Landing page refreshed with the new design language
- Auth route group app/(auth)/ with shared layout: /login, /signup, /reset-password
- /auth/update-password page (landed on from the reset email link)
- Protected app/(dashboard)/dashboard/ — redirects unauthenticated users to /login?next=/dashboard; sign-out wired
- Google sign-in button is a placeholder (toast); real OAuth deferred
- Supabase Auth configured as code in supabase/config.toml (email signup + confirmations, Site URL https://www.ensoacademy.ai, 4 redirect URLs) and applied via `supabase config push`
- ADR 0007: design system v1

Deviations from Prompt 5: the shadcn CLI changed — it installed Base UI components, not classic Radix (one `asChild` usage adapted to `buttonVariants()`); `<LoginForm/>` wrapped in `<Suspense>` for Next.js's useSearchParams requirement; a `@layer base` rule added to globals.css so shadcn borders render correctly. All auth routes build clean and were verified locally with Playwright screenshots; production smoke test runs post-deploy.

---

## 2026-05-21 — Production live at www.ensoacademy.ai

- Vercel project enso-academy created (manual setup via dashboard import from GitHub)
- Custom domain ensoacademy.ai configured via Hostinger DNS -> Vercel; www.ensoacademy.ai is the canonical primary domain (the apex 308-redirects to www)
- SSL auto-provisioned
- Env vars synced to Vercel Production and Preview environments
- Auto-deploy from main branch active
- /api/health/supabase health check endpoint added
- Production smoke tests passing:
  - Landing page: HTTP 200 at https://www.ensoacademy.ai
  - Supabase: https://www.ensoacademy.ai/api/health/supabase returns ok:true (courses_count 0)
  - AI client (OpenRouter): /api/ai/smoke-test returns ok:true with Haiku + Sonnet + embeddings (~0.02 cents)
- No env-var mismatches between Vercel and the code
- Working pattern shifted: every prompt's smoke test from now on runs against production (ADR 0006)

---

## 2026-05-21 — Claude client wrapper (three-tier routing, via OpenRouter)

- Installed the `openai` SDK (used as the OpenRouter client); `@anthropic-ai/sdk` removed
- lib/ai/client.ts: OpenRouter client (OpenAI-protocol), model tier constants, cost estimation
- lib/ai/completions.ts: complete() and completeStreaming() helpers
- lib/ai/routing.ts: tier-specific callOpus / callHaiku / callSonnet (+ streaming variants)
- lib/ai/embeddings.ts: text-embedding-3-small via OpenRouter (1536-dim, matches pgvector schema)
- lib/ai/prompts/: prompt management system with three v0.1 prompts (lecturer system, classmate gap question, escalation classifier)
- lib/ai/cost-tracking.ts: logAiCall() writing to escalations or audit_log
- app/api/ai/smoke-test/route.ts: protected endpoint — smoke test confirms Haiku, Sonnet, and embeddings all alive via OpenRouter (total ~0.02 cents)
- ADR 0004: server-side content fetching via service role
- ADR 0005: LLM access via the OpenRouter gateway

Deviation from Prompt 4: it assumed the direct Anthropic SDK. Direct Anthropic/OpenAI API billing is not workable from Bangladesh, so all LLM + embedding traffic goes through OpenRouter (OpenAI-protocol, single OPENROUTER_API_KEY); the wrapper uses the `openai` SDK with a custom base URL. ARCHITECTURE.md updated accordingly. Known consequence: OpenRouter does not expose the Anthropic Batch API, so Layer 1 course generation will cost ~2x the architecture estimate — see ADR 0005 open questions.

---

## 2026-05-20 — Database advisor hardening

Ran `supabase db advisors` on the v1 schema (after upgrading the Supabase CLI to v2.100.1) and remediated every WARN-level finding via two migrations — 20260520174114_advisor_hardening and 20260520174501_fix_subscriptions_rls_initplan:

- Security: pinned `search_path` on `set_updated_at` and `create_student_profile_on_signup`; revoked EXECUTE on both trigger functions so they are off the REST surface.
- Performance: wrapped `auth.uid()` in `(select ...)` across 19 student RLS policies (auth_rls_initplan); scoped 31 service-role policies `TO service_role` (multiple_permissive_policies); added 24 covering indexes for unindexed foreign keys.

Advisor result: 4 security + 71 performance WARNs -> 0 WARN/ERROR. Remaining findings are INFO only (unused_index — expected on an empty database — and one connection-config note). RLS posture unchanged in effect: service_role has rolbypassrls = true, so service-role policies are belt-and-suspenders. Convention recorded in CLAUDE.md gotchas.

---

## 2026-05-20 — Full v1 database schema applied

Six migrations applied to Singapore Supabase project (yffwnyuodulbfjjobhmf):
- content_schema: courses, modules, lessons, content_library_elements, primary_source_citations, question_bank, glossary, case_studies, course_versions
- students_schema: student_profiles, enrollments, sessions, student_knowledge_state, student_memory, student_preferences, modality_state, session_events, portfolio_artifacts
- mocks_schema: mock_exam_templates, mock_exam_attempts, student_readiness, signoff_events, real_exam_outcomes
- intelligence_schema: cached_qa (with match_cached_qa RPC), escalations, classmates, classmate_interventions
- bangladesh_schema: examiners, examiner_graded_papers, grading_rubrics, ai_grader_evaluations, examiner_review_passes, real_exam_papers, ocr_extractions
- commercial_schema: stripe_customers, course_purchases, subscriptions, sme_reviewers, content_reviews, audit_log

All tables have RLS enabled with appropriate policies. Updated_at triggers in place. pgvector indexes (ivfflat) on all embedding columns. Auto-creation trigger for student_profiles + student_preferences on auth.users insert.

TypeScript types regenerated in lib/supabase/database.types.ts (183 -> 2766 lines).

Note: first push failed because the `vector` type lives in the `extensions` schema (not on the apply-time search_path). Fixed by adding `SET search_path = public, extensions` to the three vector-using migrations (content, students, intelligence) and to the match_cached_qa function. See docs/decisions/0003-schema-design-principles.md.

---

## 2026-05-20 — Supabase wiring and auth foundation

- Installed @supabase/supabase-js and @supabase/ssr
- Created the four-client pattern in lib/supabase/: browser (client.ts), server (server.ts), session-refresh helper (middleware.ts), service-role admin (admin.ts)
- Wired request interception via root proxy.ts (Next.js 16 successor to the deprecated middleware.ts) for session refresh
- Enabled the pgvector extension via the first migration (20260520160138_enable_pgvector), pushed to the Singapore project
- Generated initial Supabase TypeScript types in lib/supabase/database.types.ts
- Created /auth/callback route handler for OAuth flows
- Created /auth/auth-error page
- Documented Google OAuth manual setup in docs/SETUP-google-oauth.md
- Updated AGENTS.md to a thin pointer to CLAUDE.md
- ADR 0002 records the Supabase auth + proxy session-refresh pattern

Infrastructure decisions captured in CLAUDE.md gotchas: Vercel for hosting, Inngest/Trigger.dev for background jobs (deferred), Upstash Redis (deferred), Render not in scope for v1.

---

## 2026-05-20 — Foundation scaffold

- Next.js 16 + React 19 + TypeScript + Tailwind initialized
- Folder structure matching docs/ARCHITECTURE.md created
- CLAUDE.md memory system established
- Minimal landing page at /
- .env.example documenting all required credentials
- Architecture document committed as canonical design source
- Initial commit pushed to github.com/ripclass/enso-academy

Stack confirmed: Next.js 16, React 19, TypeScript strict, Tailwind v4, pnpm.
Decision: clean-room implementation (no OpenMAIC fork) due to AGPL-3.0 incompatibility with commercial IP. See docs/decisions/0001-clean-room-no-openmaic-fork.md.
