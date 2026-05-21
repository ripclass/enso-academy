# Enso Academy — Architecture Document

**Status:** Foundation
**Owner:** Ripon Chowdhury
**Company:** Enso Intelligence Inc.
**Last updated:** 2026-05-21

---

## Purpose of this document

This is the source of truth for every architectural decision in Enso Academy. It exists for three audiences:

- **Future me, six months from now**, who needs to remember why a decision was made before changing it.
- **Claude Code and any AI coding assistant** working on this codebase, who must read this before generating code to ensure consistency with the design.
- **Future engineers** joining the team, who need to understand the system before contributing.

If a section of code doesn't match this document, the document is the canonical truth. Either the code is wrong, or the document needs updating — but they must be reconciled.

---

## What Enso Academy is

A professional certification preparation platform that teaches via AI-rendered interactive classrooms. Students study for high-stakes certification exams (CAMS, CDCS, CCAS, JAIBB, DAIBB, IBB Specialist Diplomas, and others) through lessons delivered by an AI lecturer with a real-time student model, mock exams that faithfully mimic the actual exam environment, and a signoff system that tells students when they're ready to sit the real exam.

Enso Academy is part of the Enso Intelligence Inc. product portfolio, alongside TRDR Hub, RulHub, RulGPT, Kestrel, and ICE LLM.

---

## What Enso Academy is not

- Not a video course platform. We don't produce video lectures.
- Not a discussion forum. No community features in v1.
- Not a general-topic learning platform. We teach certifications. Bounded curriculum.
- Not an open-source project. The code is commercial IP. The repo is public during development for tooling access but will be made private before launch.

---

## Strategic positioning

Two adjacent products with shared infrastructure:

**Enso Academy Global** — international professional certifications (CAMS, CDCS, CCAS, FRM, ICA, etc.). Multiple choice, computer-based real exams. Pricing in USD. Target: global compliance and finance professionals. Primary moat: IP-defensible content generated from primary regulatory sources, plus the tiered-model AI lecturer architecture.

**Enso Academy Bangladesh** — Bangladesh banking certifications (JAIBB, DAIBB, IBB Specialist Diplomas). Mixed multiple-choice and written-answer, paper-based real exams. Pricing in BDT or bundled with Enso Intelligence Inc. commercial deals. Target: Bangladesh bank employees. Primary moat: relationships with BIBM/BAB examiner network, calibrated AI grader trained on real exam papers, and over-time accumulation of a digital past-paper archive.

Both share the platform — lesson player, AI lecturer, content library, student model, classmate primitive, mock engine — and diverge on the grader and the mock format.

Global launches first. Bangladesh launches 8-12 weeks after, once we've collected the first 100 graded papers and onboarded the initial examiner panel.

---

## Foundational design commitments

These are the philosophical decisions that everything else flows from. They are not negotiable for the v1 product. If a feature request conflicts with these, the feature request loses.

### 1. Primary sources only

All course content is generated from primary regulatory and institutional sources (FATF, Basel, Wolfsberg, UN conventions, OFAC, national regulators, public enforcement actions, RulHub). Never from ACAMS study guides, Wiley books, Kaplan materials, ICA publications, or any other third-party prep content.

This is an IP-defensibility commitment. The course generation prompt (`docs/COURSE-GENERATION-PROMPT.md`) enforces this. SME reviewers are instructed to flag any content that appears to be paraphrased from third-party prep materials.

### 2. The student model is real

Enso Academy maintains a continuously updated per-student knowledge state. Every interaction — every quiz answer, every question asked of the lecturer, every lesson re-watched, every mock exam result — updates this model.

The student model is exposed to the AI lecturer as context in every interaction. The lecturer never starts from zero. If the student opens lesson 47, the lecturer already knows they nailed lessons 1-46 except for the sanctions section in module 4, and adjusts its teaching accordingly.

This is non-negotiable. Features that bypass the student model are not built.

### 3. Lessons are not linear

A lesson is not a fixed sequence of slides. It is a path through a library of pre-generated content elements (explanations, case studies, analogies, quizzes), selected and sequenced at runtime based on the student's state.

The library is generated once per course by Opus during course creation. Runtime intelligence (Haiku-class lecturer with Sonnet escalation) selects from the library. Same student never sees the same path twice if they revisit a topic.

### 4. The lecturer remembers

The AI lecturer maintains long-term memory across sessions. Not as a CRM record — as a relationship. It remembers what the student said in earlier sessions, what their goals are, what tone works for them, what they struggle with.

Memory is curated and summarized periodically by Sonnet, stored in `student_memory`, exposed to the lecturer as preamble context.

### 5. The classmate is the student's blind spot

Enso Academy has classmates as a pedagogical feature, but classmates are not scripted personas. A classmate exists to ask the question the student should be asking but isn't.

When the lecturer makes a teaching move, the gap-detection layer compares what was taught against what the student model says the student knows. If a critical gap exists and the student doesn't address it themselves within a window, the classmate raises their hand and asks the question that would surface the gap.

Classmate questions are generated in the moment from the student's specific gap, not pre-written. The classmate is consistent across the course (same name, same voice, same vibe) but their questions are always tailored to the current student's blind spots.

Classmate questions and their answers are cached and become part of the content library for future students. Over time, classmate-asked questions become a dataset of universal blind spots — the questions students never know to ask. This dataset is a competitive moat.

### 6. Mock exams mimic the real exam

For every certification we support, the mock exam environment faithfully reproduces the real exam: question count, time limit, question types, interface patterns, navigation behavior, flagging system, inability to backtrack after submission where applicable.

For computer-based real exams (CAMS, CDCS, CCAS, etc.), the mock is fully online. For paper-based exams (JAIBB, DAIBB, IBB Diplomas), the mock runs online under honor-system instructions, and post-exam the student is invited to photograph and upload their actual exam paper.

### 7. The signoff is real

Enso Academy declares a student "exam-ready" when they meet a defined readiness threshold across multiple full-length mocks. Criteria:

- Five full-length mocks across the topic distribution.
- Average score above a calibrated threshold (typically 80% for CAMS; threshold per course).
- No individual mock below a minimum floor.
- No domain consistently below threshold.
- Timing within bounds (no extra time, no skipped breaks).

When all criteria are met, the system declares readiness. The student receives a notification, a dashboard badge, and a recommendation to book the real exam within a window.

The signoff is calibrated to be slightly conservative — students who Enso Academy signs off should reliably pass the real exam. We track real-exam outcomes via post-exam reporting from students. The threshold is recalibrated quarterly based on this data.

Over 12-18 months, as the outcome dataset grows, the signoff transitions from internal feature ("Enso Academy says you're ready") to external credential equivalent ("Enso Academy CAMS-Ready" on LinkedIn). The product capability is identical; only the marketing claim evolves.

### 8. Conservative grading

For written-answer questions on Bangladesh paper exams, the AI grader is calibrated to score slightly harsher than a real examiner. If our grader gives 65, the real exam will likely give 68-70. If our grader gives 60, the real exam will likely give 60-65.

This is deliberate. False positives (we say ready, real exam says fail) damage the brand more than false negatives (we say not ready yet, student studies more and passes). The asymmetry favors conservative bias.

The grader is trained from:
- Approximately 100 real graded papers collected through legal disposal channels at BIBM/BAB.
- 2-3 examiner interviews to extract the implicit grading rubric.
- Few-shot calibration examples in the grader prompt.
- Quarterly review by named examiner consultants who spot-check AI grader outputs.

### 9. Multi-modality

Same content, multiple presentation modes:

- **Standard mode**: visual lesson with slides, whiteboard, voice narration.
- **Audio mode**: podcast-style narration for commute and walking.
- **Dialogue mode**: Socratic conversation, no slides, lecturer asks short questions and student types answers.
- **Drill mode**: rapid-fire flashcards, audio-only or visual, for spaced repetition.

The student switches modes based on context. The system remembers preference per context (e.g., audio mode after 9 PM, drill mode on weekends).

Content is not re-generated per modality. The renderer adapts the same lesson structure.

### 10. Evidence of learning

Beyond the credential, students accumulate a portfolio of analytical work. Real case analyses, risk assessments, written explanations to hypothetical scenarios. These artifacts are generated during normal coursework, captured, and made shareable.

By the time a student passes the real exam, they have 20+ portfolio pieces demonstrating their analytical capability. Over time, this portfolio becomes more meaningful to sophisticated employers than the certificate itself.

---

## Technical architecture

### Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js Server Actions, Edge functions where appropriate
- **Database**: Supabase (PostgreSQL 15+ with pgvector extension)
- **Authentication**: Supabase Auth (email + Google OAuth)
- **Payments**: Stripe (one-time course purchases at $199 USD, monthly subscriptions at $39 USD)
- **LLM**: Anthropic Claude, accessed via the OpenRouter gateway (OpenAI-protocol) — see ADR 0005
  - Opus (`anthropic/claude-opus-4.7`) for offline course generation (one-time per course)
  - Haiku (`anthropic/claude-haiku-4.5`) lecturer with Opus-tuned orchestration prompt for real-time student interaction
  - Sonnet (`anthropic/claude-sonnet-4.6`) for escalation on novel cases, classmate gap-question generation, and written-answer grading
- **TTS**: Google Cloud Text-to-Speech (Wavenet voices, English; Studio for premium courses)
- **ASR**: OpenAI Whisper API (for student voice input) — note: OpenRouter does not proxy audio transcription; ASR needs a separate provider path, decided at the ASR prompt
- **Embeddings**: OpenAI text-embedding-3-small via OpenRouter (1536-dim, for pgvector cache)
- **Email**: Resend (transactional emails)
- **Error tracking**: Sentry
- **Hosting**: Vercel (production) + Vercel Preview (development)

### Why this stack

- **Next.js 16 + React 19**: matches the architecture we explored in OpenMAIC reconnaissance, modern enough that Claude generates good code for it, has Server Actions which simplify backend.
- **Supabase**: pgvector for our Q&A cache and student knowledge embeddings is native, Auth is included, RLS gives us tenant isolation by default, generous free tier for dev.
- **Anthropic Claude (via OpenRouter)**: superior to alternatives for pedagogical reasoning, multi-step explanations, and structured rubric-based grading. Tiered pricing matches our cost model. Accessed through the OpenRouter gateway because direct Anthropic API billing is not workable from Bangladesh; see ADR 0005.
- **Tailwind + shadcn/ui**: fast UI development, consistent design system, no design debt.
- **Stripe**: standard for global SaaS payments, supports both one-time and subscription.

### Why this is clean-room, not forked from OpenMAIC

OpenMAIC (THU-MAIC, Tsinghua University) is licensed under AGPL-3.0. Forking would require us to release all Enso Academy source code under AGPL-3.0, which is incompatible with our commercial IP strategy.

We have read the OpenMAIC codebase for architectural understanding (two-stage generation pipeline, multi-agent orchestration, playback engine, action engine, whiteboard rendering) and we write our own implementation informed by what we learned. Every line of code in this repo is original.

We do not copy OpenMAIC source files. We do not import OpenMAIC modules. We do not vendor OpenMAIC packages. If anyone wants to verify this, the commit history shows our code being written from scratch.

### Three-tier model architecture

This is the cost-control architecture that makes the unit economics work.

**Layer 1 — Course generation (offline, Opus, one-time per course)**
- Designed to run in the Anthropic Batch API for cost efficiency (50% discount). NOTE: the OpenRouter gateway (ADR 0005) does not expose the Batch API, so generation via OpenRouter costs roughly 2x the estimate below. Revisit when the course generator is built.
- Generates the full course content library from primary sources.
- Approximately $1,500-3,000 per course at launch (Batch API pricing). One-time spend.

**Layer 2 — Real-time student interaction (always-on, tiered)**
- 60-70% of student queries served from pre-computed Q&A cache (zero new API cost).
- 20-30% served by Haiku-class lecturer with Opus-tuned orchestration prompt.
- 5-10% escalated to Sonnet for novel questions. Escalated answers cached for future students.
- Escalation rate starts at ~30% in week 1, decays to ~10% as cache matures.

**Layer 3 — Mock exams and assessment (Sonnet for grading, scheduled)**
- MCQ grading is free (no AI needed).
- Written-answer grading uses Sonnet with the rubric prompt and few-shot calibration examples.
- Optional Opus call once per student per mock for personalized study plan generation.

Per-student cost at scale: $2-5 in API spend per student per course at $199 retail = 95%+ gross margin.

### Repository structure

```
enso-academy/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Public landing pages
│   ├── (dashboard)/              # Authenticated student area
│   ├── (admin)/                  # Internal admin (course management, SME review)
│   ├── api/                      # API routes
│   └── layout.tsx
├── components/                   # React components
│   ├── ui/                       # shadcn primitives
│   ├── lesson/                   # Lesson player components
│   ├── mock/                     # Mock exam interface
│   ├── classroom/                # AI lecturer chat, whiteboard
│   └── admin/                    # Admin UI
├── lib/
│   ├── ai/                       # Claude orchestration
│   │   ├── lecturer.ts           # Real-time AI lecturer (Sonnet)
│   │   ├── generator.ts          # Course generation (Opus, batch)
│   │   ├── escalation.ts         # Escalation classifier
│   │   └── prompts/              # System prompts
│   ├── audio/                    # Google Cloud TTS wrapper
│   ├── asr/                      # Whisper API wrapper
│   ├── lesson/                   # Lesson player state machine
│   ├── whiteboard/               # SVG whiteboard primitives
│   ├── mock/                     # Mock exam engine
│   ├── grader/                   # AI grader (MCQ + written-answer)
│   ├── student-model/            # Per-student knowledge state
│   ├── classmate/                # Classmate gap-detection primitive
│   ├── cache/                    # pgvector Q&A cache
│   ├── stripe/                   # Payment flows
│   ├── sme/                      # SME review workflow
│   ├── supabase/                 # Supabase client setup
│   └── utils/                    # Shared utilities
├── supabase/
│   └── migrations/               # SQL migrations
├── docs/
│   ├── ARCHITECTURE.md           # This document
│   ├── COURSE-GENERATION-PROMPT.md
│   └── decisions/                # ADRs for significant decisions
├── public/                       # Static assets
├── .env.example                  # Environment variable template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

### Database schema overview

Full schema lives in `supabase/migrations/`. High-level organization:

**Content tables** — courses, modules, lessons, scenes, content_library_elements, primary_source_citations, question_bank, glossary, case_studies.

**Mock exam tables** — mock_exam_templates, mock_exam_questions, mock_exam_attempts, student_readiness, signoff_events, real_exam_outcomes.

**Student tables** — students, enrollments, sessions, student_knowledge_state, student_memory, student_preferences, session_events.

**Runtime intelligence tables** — cached_qa (with embeddings, tagged by origin), escalations, classmate_interventions, modality_state.

**Bangladesh-specific tables** — real_exam_papers, ocr_extractions, examiner_graded_papers, examiners, grading_rubrics, ai_grader_evaluations, examiner_review_passes.

**Commercial tables** — stripe_customers, subscriptions, course_purchases, refunds.

**SME and admin tables** — sme_reviewers, content_reviews, course_versions, audit_log.

All tables have RLS policies. Tenant isolation is by student_id. Admin access is gated by a separate role.

### Authentication and authorization

- Students authenticate via Supabase Auth (email/password, Google OAuth).
- Admin users have a separate `admin` role flag in `auth.users` metadata.
- SME reviewers have a separate `sme_reviewer` role.
- Examiners (Bangladesh) have a separate `examiner` role.
- All sensitive operations (course purchase, signoff, grader output release) are server-side only.

---

## What we will not build in v1

- Video lectures or video recording.
- Discussion forums or peer-to-peer chat.
- Group study features.
- Mobile native apps (web is responsive; PWA install is supported).
- General-topic learning (no "explain anything" mode).
- Multi-tenant white-label for institutions (consider in year 2).
- Live human tutoring marketplace.

These may be revisited in future versions. They are explicitly out of scope for v1 to keep focus and shipping velocity.

---

## Decision log

Significant architectural decisions are recorded as ADRs (Architecture Decision Records) in `docs/decisions/`. Format:

```
docs/decisions/0001-clean-room-no-openmaic-fork.md
docs/decisions/0002-anthropic-as-primary-llm.md
docs/decisions/0003-three-tier-model-architecture.md
...
```

Each ADR captures: context, decision, alternatives considered, consequences. New significant decisions add new ADRs. ADRs are immutable once committed; if a decision is reversed, a new ADR supersedes the old one but the old one stays.

---

## How to work with this codebase using AI assistants

When using Claude Code, Cursor, or similar AI coding assistants:

1. **Always read this document first.** Every prompt or session should start by loading `docs/ARCHITECTURE.md` into context.
2. **Read the relevant ADRs** for any area you're working in.
3. **Read the course generation prompt** (`docs/COURSE-GENERATION-PROMPT.md`) before touching anything in `lib/ai/generator/`.
4. **Do not deviate from the design commitments** in this document without an ADR documenting the change.
5. **Ask before destructive operations.** Any `DROP TABLE`, force push, file deletion, or schema migration that loses data must be confirmed explicitly.
6. **Match the existing code style.** TypeScript strict mode, no `any` without justification, prefer Server Actions over API routes where appropriate, prefer Tailwind classes over inline styles.

---

## Open questions

These are unresolved at the time of writing. Each will be resolved with an ADR when the time comes:

- Migration from personal Anthropic account to Enso Intelligence Inc. workspace (target: before first revenue).
- Domain configuration for `enso.academy` (target: pre-launch).
- Stripe Atlas approval timeline and live key cutover.
- First three certifications to launch (CAMS confirmed; CDCS and CCAS likely, but pending content generation cost validation).
- Examiner network onboarding (target: Bangladesh launch -8 weeks).
- Pricing for Bangladesh tier (BDT amount, discount structure for Enso Intelligence Inc. bank deal bundles).

---

## End of document

If you've read this far, you understand Enso Academy as well as the founder does. Build accordingly.
