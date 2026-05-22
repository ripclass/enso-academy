# CLAUDE.md — Enso Academy Project Memory

**Last updated:** 2026-05-22
**Current milestone:** Content pipeline (Opus course generation) — built and trial-validated
**Status:** In progress

## Active deployments

- Production: https://www.ensoacademy.ai (canonical; the apex ensoacademy.ai 308-redirects to www). Auto-deploys from the main branch.
- GitHub: github.com/ripclass/enso-academy (public during dev)
- Supabase: project yffwnyuodulbfjjobhmf (Singapore region, Southeast Asia)
- Vercel project: enso-academy, under the "Enso intelligence" Vercel team (team_gWktEQbgrP1MAxNRDQTjZo1M)
- Domain registrar: Hostinger (ensoacademy.ai, 2-year term, renews 2028-05-21). DNS managed manually via hpanel.hostinger.com.
- Google Cloud TTS: service account enso-academy-tts in GCP project enso-academy (billing linked, Text-to-Speech API enabled). Key at .secrets/gcp-tts-service-account.json locally; GOOGLE_APPLICATION_CREDENTIALS_JSON env var in Vercel.

## Read this first, every session

Before doing ANY work on this project, read in this order:

1. This file (CLAUDE.md) — current state and active priorities
2. docs/FRAMEWORK.md — the product vision (the what and why); read before ARCHITECTURE
3. docs/ARCHITECTURE.md — canonical technical design, do not deviate
4. docs/ROADMAP.md — the execution sequence (what to build next, and in what order)
5. docs/PROGRESS.md — what's been done, milestone by milestone
6. docs/SESSION-NOTES.md — running notes from previous sessions, partial work, observations
7. docs/decisions/ — ADRs for significant architectural decisions
8. docs/COURSE-GENERATION-PROMPT.md (when working on lib/ai/generator/)

Then ask the user what they want to work on. Do not assume from prior context that may be stale.

## Project identity

Enso Academy is a professional certification preparation platform owned by Enso Intelligence Inc. It teaches certifications (CAMS, CDCS, CCAS, JAIBB, DAIBB, IBB Specialist Diplomas) via AI-rendered interactive classrooms with a real-time student model, faithful mock exams, and a signoff system declaring exam-readiness.

Two adjacent products: Enso Academy Global (international certs, USD pricing) and Enso Academy Bangladesh (BD certs, BDT pricing, examiner-trained AI grader).

## Current state

- Foundation scaffold + Supabase wiring + full v1 database schema complete
- Next.js 16 + React 19 + TypeScript + Tailwind v4 + shadcn/ui (Base UI variant — see gotchas)
- Supabase wired: lib/supabase/ has browser (client.ts), server (server.ts), session-refresh helper (middleware.ts), and service-role admin (admin.ts) clients
- Root proxy.ts (Next.js 16 successor to the deprecated middleware.ts) refreshes the auth session on every request
- Full v1 schema applied to the Singapore project (enso-academy-dev / yffwnyuodulbfjjobhmf) — nine migrations: pgvector + six domain migrations (content, students, mocks, intelligence, Bangladesh, commercial) + two advisor-hardening migrations, ~40 tables, all RLS-enabled and advisor-clean (0 WARN/ERROR)
- TypeScript types in lib/supabase/database.types.ts reflect the full schema
- OAuth callback route at /auth/callback; auth-error page at /auth/auth-error
- Google OAuth pending Google Cloud Console setup (see docs/SETUP-google-oauth.md)
- AI client wrapper in lib/ai/ — OpenRouter-backed (OpenAI-protocol; ADR 0005), three-tier routing (callOpus/callHaiku/callSonnet + streaming), embeddings (text-embedding-3-small, 1536-dim), versioned prompts, cost tracking; smoke test passing
- Production live at https://www.ensoacademy.ai — Vercel auto-deploy from main; env vars synced to Vercel Production + Preview; SSL active; both production smoke tests (/api/health/supabase, /api/ai/smoke-test) passing
- Auth UI live: design system v1 (Geist, teal #0F3D3E / coral #E07856, light mode only — ADR 0007); /login, /signup, /reset-password, /auth/update-password pages; protected /dashboard with intent-preserving redirect (?next=); sign-out wired; Google sign-in button is a placeholder (toast)
- Supabase Auth configured as code in supabase/config.toml (email signup + confirmations on, Site URL + redirect URLs), applied via `supabase config push`
- Lesson player live (v2 — scene-based): a lesson is an ordered list of typed SCENES (content_library_elements.scene_type + scene_data jsonb). v1 renders `reading`, `slide` (4 templates: key-points / definition / comparison / callout), `quiz` (inline formative MC, feeds the knowledge model); `interactive` / `pbl` are in the contract but render as a placeholder. Contract: lib/lesson/scenes.ts; renderers: components/lesson/scenes/. /courses (auto-enrollment in dev), /courses/[slug], /lessons/[id]; AI lecturer Q&A grounded in scene context (cache-first via match_cached_qa RPC, Haiku fallback); session + session_events tracking; lesson completion. CDCS lesson 1 re-seeded into scene format; lessons 2-3 render as reading scenes via backward compat
- Mock exam engine live: 32-question CDCS bank (4 domains), CDCS Mock 1 template (20 q / 40 min / 75% pass); lib/mock/actions.ts (startMockExam, submitMockExam, getAttemptResults, updateReadiness); timed mock-taker UI (no-pause timer, auto-submit, question grid, flag, focus/blur tracking, two-step submit); results page (score, by-domain, per-question review); student_readiness + signoff_events wired on submission
- TTS audio narration live: Google Cloud Text-to-Speech (en-US-Wavenet-D Wavenet voice); lib/audio/ (tts.ts wrapper, pregenerate.ts pipeline); Supabase Storage bucket 'lesson-audio' (public read, service-role write); content_library_elements.audio_url; 16 CDCS dev-course MP3s pre-generated (~$0.23); lesson player Listen mode (auto-queue narration between elements, status indicator); real-time TTS for AI lecturer Q&A; /api/admin/pregenerate-audio endpoint
- Student knowledge model live (4.0 spine): lib/student-model/knowledge.ts — per-concept mastery in student_knowledge_state, Bayesian-flavored update (lr=1/(observations+4)); written by mock submissions (per question) + lesson completion; read by askLecturer as a system-prompt preamble that shapes the answer; "Your knowledge" card on the course page (strong / to-review concepts)
- Lecturer memory live (5.0 spine): lib/student-model/memory.ts — student_memory holds durable relational facts (goal / context / struggle / preference) distilled by a Sonnet summarization job at lesson completion (scheduled via Next.js after()); read by askLecturer as a memory preamble and by getLecturerOpening, which generates a continuity greeting shown as the opening lecturer message; dashboard shows "Welcome back" for returning students
- The classmate live (6.0 moat): lib/classmate/actions.ts — checkClassmateGap runs on lesson element advance; gap detection (grounded in the student model — fires only on an evidenced weak concept the element taught) → a Sonnet-generated in-character question from the per-course classmate (classmates table) + a Haiku lecturer answer, rendered in the Q&A panel; logged to classmate_interventions; seeds cached_qa with origin 'classmate_asked' (moat 4). Fires at most once per lesson session (tunable)
- Content pipeline live (Prompt 13, ADR 0017): lib/ai/generator/ — a staged Claude Opus pipeline that generates a course from primary sources per the methodology (docs/COURSE-GENERATION-PROMPT.md, the verbatim system prompt) and emits the lib/lesson/scenes.ts scene contract. Stages: outline → per-lesson scenes → per-module assessment. Operator CLI: scripts/generate-course.ts (outline / lesson / assessment / full / write). Artifacts persist under generated/ (gitignored, resumable). The writer creates the course as a DRAFT. Trial-validated: a CAMS draft course exists (slug 'cams', 9 modules / 40 lessons, lesson 1.1 fully generated — 11 scenes — for $3.52). The full CAMS generation + SME review is pending operator work. See docs/RUNBOOK-course-generation.md
- No payments wired (auto-enrollment is dev-only); Stripe not integrated
- Folder structure matches docs/ARCHITECTURE.md
- GitHub repo at github.com/ripclass/enso-academy (public during dev, private at launch)

## What's next (priority order)

1. Run the full CAMS generation + SME review — operator/content work, not engineering. The pipeline is built; follow docs/RUNBOOK-course-generation.md. This is the launch gate.
2. Prompt 14 — Stripe / payments

The 6.0 pedagogical spine (student model + memory + classmate) is complete, lessons are scene-based (Prompt 12), and the content pipeline is built and trial-validated (Prompt 13). What remains before launch is the full content run + commerce.

See docs/ROADMAP.md for the full re-sequenced plan (launch cut, deferred items, the OpenMAIC legal stance).
Priorities shift based on Ripon's instructions. Always confirm before deviating.

## Active design commitments (non-negotiable)

From docs/ARCHITECTURE.md, the ten foundational commitments:

1. Primary sources only (no third-party prep materials)
2. The student model is real (per-student knowledge state, always exposed to lecturer)
3. Lessons are not linear (path through library, not fixed sequence)
4. The lecturer remembers (long-term per-student memory)
5. The classmate is the student's blind spot (gap-driven, not scripted)
6. Mock exams mimic the real exam (interface, timing, behavior fidelity)
7. The signoff is real (calibrated readiness threshold, conservative bias)
8. Conservative grading (BD written-answer grader scores harsher than real examiners)
9. Multi-modality (standard, audio, dialogue, drill modes)
10. Evidence of learning (portfolio of analytical work accumulates over course)

Any work that conflicts with these commitments must pause and raise the conflict.

## Three-tier model architecture (cost control)

- Layer 1: Opus, offline, one-time course generation (~$1,500-3,000 per course)
- Layer 2: Real-time student interaction — 60-70% from cache, 20-30% Haiku-class lecturer with Opus-tuned orchestration, 5-10% Sonnet escalation
- Layer 3: Mock exams — MCQ free, written-answer Sonnet with rubric prompt

Target gross margin: 95%+ at $199 per student per course.

## Conventions

- TypeScript strict mode, no `any` without comment justifying it
- Server Actions preferred over API routes where appropriate
- Tailwind classes preferred over inline styles
- shadcn/ui primitives in components/ui/
- Custom feature components in components/{lesson,mock,classroom,admin}/
- Business logic in lib/, organized by domain
- Database migrations in supabase/migrations/, timestamped, never edited after committed

## Memory system discipline

At the end of every meaningful work block (typically end of a session, or after completing a milestone):

1. Update CLAUDE.md "Current state" and "What's next" sections to reflect new reality
2. Append to docs/PROGRESS.md with a dated entry summarizing what shipped
3. If a significant architectural decision was made, write a new ADR in docs/decisions/
4. Append to docs/SESSION-NOTES.md any partial work, gotchas, or things to remember next time
5. Commit all memory updates as part of the work commit (single commit, not separate)

If asked to do work without updating memory at the end, remind the user and ask if they want to skip just this once.

## Gotchas and notes

- LLM + embeddings go through the OpenRouter gateway (ADR 0005), not direct Anthropic/OpenAI APIs — direct API billing is not workable from Bangladeshi cards. One key: OPENROUTER_API_KEY. The lib/ai/ wrapper uses the `openai` SDK against OpenRouter's base URL. A direct Anthropic account (for Batch API on Layer 1 course generation) is a future option once Enso Intelligence Inc. has a workable payment method — until then Layer 1 generation via OpenRouter costs ~2x the architecture estimate.
- Stripe account is pending Stripe Atlas approval — use test keys until live keys are issued
- Supabase project is named "enso-academy-dev" for development; production project TBD. Project ref yffwnyuodulbfjjobhmf, Singapore region. Linked locally; migrations live in supabase/migrations/ and are applied with `supabase db push`.
- Repo is public during development for MCP tool access; will be made private before launch
- Next.js 16 deprecated the `middleware.ts` file convention — request interception uses `proxy.ts` at the project root (see ADR 0002). The Supabase session-refresh helper keeps the name lib/supabase/middleware.ts (a plain module, not a convention file).
- Infrastructure stack (decided between Prompt 1 and Prompt 2): Vercel hosts the Next.js app (frontend, API routes, Server Actions); durable background jobs will use Inngest or Trigger.dev (choice deferred to Prompt 5) for Opus batch course generation, TTS pre-generation, mock grading, and OCR pipelines; cache + rate limiting will use Upstash Redis (added in Prompt 5 or 6 when the lesson player needs it); dedicated worker hosts (Render, Railway) are deferred — Inngest + Vercel + Upstash cover v1 needs.
- Google OAuth not wired yet — the "Continue with Google" buttons on /login and /signup are placeholders that toast "use email/password". Real wiring needs the GCP Console steps in docs/SETUP-google-oauth.md.
- Process hygiene: when stopping a backgrounded pnpm dev, kill by port (not by process group) to ensure the detached next dev child also dies. Stale dev servers on port 3000 will silently serve stale code.
- pgvector is installed in the `extensions` schema, not `public`. Any migration that references the `vector` type or `vector_cosine_ops` must `SET search_path = public, extensions;` at the top; functions using the `<=>` operator need the same as a function attribute. See migrations 20260520163212 / ...163214 / ...163217 for the pattern.
- RLS / function conventions enforced by `supabase db advisors` (run advisors after schema changes): wrap `auth.uid()` / `auth.role()` in a scalar subquery — `(select auth.uid())` — in policy expressions so they evaluate once per query, not per row; scope service-role policies with `TO service_role` so they are not also evaluated for authenticated/anon; add a covering index for every foreign key. Functions need a pinned `search_path`; trigger / SECURITY DEFINER functions should have EXECUTE revoked from anon/authenticated unless they are meant to be a REST RPC. See migration 20260520174114_advisor_hardening.
- The AI client (lib/ai/*) is server-only — never import it from Client Components. Call it from Server Actions or API routes.
- Smoke-test endpoint at /api/ai/smoke-test requires an `Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY` header. Remove or harden it before launch.
- All course-content reads go through Server Actions / API routes using the service-role admin client (lib/supabase/admin.ts); content tables are service-role-only by RLS. See ADR 0004.
- Production smoke tests are the canonical verification path (see ADR 0006). Localhost is for iteration/debugging only.
- Vercel env vars must stay in sync with the variable names expected by lib/supabase/* and lib/ai/*. Renaming a variable in code means renaming it in the Vercel dashboard too.
- Hostinger DNS for ensoacademy.ai is configured manually by Ripon. If DNS needs changing, do it via hpanel.hostinger.com.
- Design system v1 is locked (ADR 0007): Geist typography, teal primary #0F3D3E, coral accent #E07856, generous spacing, light mode only. Tokens live in app/globals.css. Do not add dark mode or `dark:` variants in v1.
- shadcn/ui is the Base UI variant (the current CLI's default preset), not classic Radix. Components use Base UI's `render` prop, not `asChild`; for a link styled as a button use `buttonVariants()` on the Link. globals.css needs the `@layer base { * { @apply border-border } }` rule or bare `border` classes render black.
- Supabase Auth config is code in supabase/config.toml, applied to the remote project with `supabase config push`. Caveat: `config push` pushes the entire [auth] block — keep config.toml reconciled with the remote, and note its `[Y/n]` confirm defaults to YES on EOF (a non-interactive/piped run applies, it does not just preview).
- The CDCS course is a hand-seeded dev placeholder (migration 20260521064039), not Opus-generated. The Opus course-generation pipeline (a later prompt) will regenerate or replace it.
- Auto-enrollment is active for the dev course (app/(dashboard)/courses/page.tsx) — any authenticated user is enrolled on first visit to /courses. No Stripe yet; when commerce is wired, gate enrollment behind successful payment.
- Cache hit threshold is 0.85 cosine similarity, set in lib/lesson/actions.ts askLecturer(). Tune based on observed false positives/negatives as cached_qa fills.
- Mock readiness needs 5 submitted attempts to reach 'ready' status (v1 thresholds in lib/mock/actions.ts updateReadiness: ready = count>=5/avg>=80/min>=70/weakest>=65; approaching = count>=3/avg>=70). The evaluator handles incomplete data gracefully.
- v1 mock has a no-pause timer + focus/blur tracking but no full lockdown (no copy-paste prevention, no right-click block). Add in a follow-up if needed.
- The CDCS question bank is hand-seeded placeholder content (migration 20260521073624, 32 questions). Mock option order is not shuffled per attempt in v1. Opus generation will augment/replace the bank later.
- Funding context: Ripon can fund Google Cloud, OpenAI, Vercel, Render, Supabase, Higgsfield directly via BD card. Anthropic API direct billing fails despite working everywhere else — that's why OpenRouter is the LLM proxy. The Anthropic-specific issue does NOT extend to other providers; Google Cloud TTS is funded directly via Ripon's GCP account.
- GCP service account key is at .secrets/gcp-tts-service-account.json locally (.secrets/ is gitignored — NEVER commit). Vercel uses the GOOGLE_APPLICATION_CREDENTIALS_JSON env var with the inline JSON. lib/audio/tts.ts loads whichever is present.
- Pre-generated lesson audio lives in the Supabase Storage bucket 'lesson-audio' (public read, service-role write). Element narration at {courseId}/{elementId}.mp3; Q&A audio at qa-audio/. URLs stored in content_library_elements.audio_url.
- Listen mode preference persists to student_preferences.preferred_modality ('audio' | 'standard'). Lesson player Listen mode auto-queues narration between elements; audio status is derived from media events with onTimeUpdate as the reliable catch-all for 'playing'.
- .env.local has inline `# ...` comments after some values (e.g. SUPABASE_SERVICE_ROLE_KEY). dotenv strips them for the app, but a manual `cut -d=` extraction grabs the comment too — extract the first whitespace-delimited field.
- Student knowledge model (Prompt 9, ADR 0012): a "concept" is a `concept_tag` string from content/question_bank; mastery is `student_knowledge_state.mastery_probability` in [0,1]. v1 update: lr = 1/(observation_count + 4); targets correct 1.0 / incorrect 0.0 / lesson_completed 0.7; a new concept seeds at 0.5. lib/student-model/knowledge.ts — recordEvidence (writer) + getMasterySummary (reader/preamble). It is Bayesian-flavored, not full Bayesian Knowledge Tracing.
- The Q&A cache (cached_qa) is course-level; askLecturer answers are now lightly shaped by the per-student knowledge model, so a cached answer served to a different student is slightly off — an accepted v1 tradeoff. Revisit the cache strategy after Prompts 10-11 if personalization gets strong enough that shared cached answers feel wrong.
- Lecturer memory (Prompt 10, ADR 0013): lib/student-model/memory.ts. student_memory is an editorial layer of durable relational facts (goal/context/struggle/preference) — NOT a transcript, NOT concept mastery (that's the knowledge model). Writer: a Sonnet summarization at completeLesson, scheduled via Next.js `after()` (from 'next/server') so it runs post-response and "Complete lesson" stays fast. Readers: getMemoryPreamble (askLecturer) + getLecturerOpening (the lesson-open continuity greeting, Haiku). No re-summarization/compaction in v1 — the reader caps at the recent ~10 facts.
- The classmate (Prompt 11, ADR 0014): lib/classmate/actions.ts — checkClassmateGap. It is MODEL-GROUNDED: it fires only on an evidenced gap (a concept the just-taught element covers with student_knowledge_state mastery < 0.45 AND observation_count > 0). No model evidence → no fire (so a never-assessed student rarely sees it — by design). MAX_INTERVENTIONS_PER_SESSION = 1 (tunable constant; classmate calibration is an open question). classmates is per-COURSE (one shared character, e.g. "Lena"). Every classmate Q&A seeds cached_qa with origin 'classmate_asked' — keep that tag (framework moat 4).
- docs/COURSE-GENERATION-PROMPT.md is the canonical v1.0 course-generation methodology (ADR 0015). Any change requires a versioned revision (v1.1, v1.2, …) and an ADR — do not edit it silently.
- The methodology's "What you should produce" section describes WHAT content to generate (prose), not a machine output format. The content-pipeline prompt must define the structured output contract that maps to the DB schema (content_library_elements, question_bank, glossary, case_studies, primary_source_citations, course_versions).
- The methodology PROHIBITS building lessons from copyrighted ICC rule text (UCP 600, ISBP, ISP98, URDG, URC) — reference by name/section only; teach from underlying commercial practice + public regulatory/court interpretations. The hand-seeded CDCS dev course + 32-question bank predate the methodology and teach directly from UCP 600 articles — they are placeholders to be replaced by methodology-compliant generated content.
- Scene model (Prompt 12, ADR 0016): a lesson is an ordered list of typed scenes. content_library_elements gained `scene_type` (enum: reading/slide/quiz/interactive/pbl) + `scene_data` jsonb. lib/lesson/scenes.ts is the canonical contract (the discriminated Scene union + parseScene) — it is ALSO the structured output contract the content-pipeline prompt hands to Opus; do not change it casually. Renderers in components/lesson/scenes/. v1 renders reading/slide/quiz richly; interactive/pbl render as a placeholder. A content row with empty scene_data falls back to a `reading` scene from `body` (backward compatible) — getLessonContent still orders by `metadata.order`.
- Quiz scenes are FORMATIVE and feed the student knowledge model (recordQuizEvidence → recordEvidence). They are NOT the faithful mock exam — the mock engine (lib/mock/) is separate and untouched.
- NOT built in v1 (deliberate, ADR 0016): whiteboard, multi-agent playback director, canvas slide renderer, PPTX export. A later bet, not a launch dependency.
- Content pipeline (Prompt 13, ADR 0017): lib/ai/generator/ + scripts/generate-course.ts. Run via `pnpm tsx scripts/generate-course.ts <mode>`. The script loads .env.local with dotenv then DYNAMIC-imports the generator — because lib/ai/client.ts throws at module load if OPENROUTER_API_KEY is unset. Generation costs real Opus money; the full run is hours and ~$hundreds — it is operator-supervised, never run unattended. Artifacts persist under generated/ (gitignored); runs are resumable. Generated courses are DRAFTS (course_status 'draft') — the methodology mandates SME review before publishing. See docs/RUNBOOK-course-generation.md.
- A CAMS draft course exists (slug 'cams', status 'draft') with only lesson 1.1 generated — it is a trial artifact, hidden from /courses (which filters status='published') and with no enrollments. Do not publish CAMS until the full generation + SME review is done; re-running the pipeline's `write` will overwrite this draft.

## Who is Ripon

Founder, Enso Intelligence Inc. Builder of TRDR Hub, RulHub, RulGPT, Kestrel, ICE LLM, KestrelIntel LLM, KhaM Labs, Lamppost, Murmur, Glyph. Bangladeshi, based in Dhaka. Economics graduate, builds products solo with a network of contractors on call. Has built 12+ products. Prefers concise, direct communication. Values: shipping over planning, honest pushback over polite agreement, primary sources over secondary, conservative claims over hype.

When in doubt about how to approach something, ask. He'd rather answer a clarifying question than fix bad work.
