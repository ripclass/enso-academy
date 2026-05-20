# CLAUDE.md — Enso Academy Project Memory

**Last updated:** 2026-05-20
**Current milestone:** Foundation scaffold
**Status:** In progress

## Read this first, every session

Before doing ANY work on this project, read in this order:

1. This file (CLAUDE.md) — current state and active priorities
2. docs/ARCHITECTURE.md — canonical design document, do not deviate
3. docs/PROGRESS.md — what's been done, milestone by milestone
4. docs/SESSION-NOTES.md — running notes from previous sessions, partial work, observations
5. docs/decisions/ — ADRs for significant architectural decisions
6. docs/COURSE-GENERATION-PROMPT.md (when working on lib/ai/generator/)

Then ask the user what they want to work on. Do not assume from prior context that may be stale.

## Project identity

Enso Academy is a professional certification preparation platform owned by Enso Intelligence Inc. It teaches certifications (CAMS, CDCS, CCAS, JAIBB, DAIBB, IBB Specialist Diplomas) via AI-rendered interactive classrooms with a real-time student model, faithful mock exams, and a signoff system declaring exam-readiness.

Two adjacent products: Enso Academy Global (international certs, USD pricing) and Enso Academy Bangladesh (BD certs, BDT pricing, examiner-trained AI grader).

## Current state

- Foundation scaffold + Supabase wiring + full v1 database schema complete
- Next.js 16 + React 19 + TypeScript + Tailwind (shadcn/ui still pending install)
- Supabase wired: lib/supabase/ has browser (client.ts), server (server.ts), session-refresh helper (middleware.ts), and service-role admin (admin.ts) clients
- Root proxy.ts (Next.js 16 successor to the deprecated middleware.ts) refreshes the auth session on every request
- Full v1 schema applied to the Singapore project (enso-academy-dev / yffwnyuodulbfjjobhmf) — seven migrations: pgvector + six domain migrations (content, students, mocks, intelligence, Bangladesh, commercial), ~40 tables, all RLS-enabled
- TypeScript types in lib/supabase/database.types.ts reflect the full schema
- OAuth callback route at /auth/callback; auth-error page at /auth/auth-error
- Google OAuth pending Google Cloud Console setup (see docs/SETUP-google-oauth.md)
- No application UI beyond the placeholder landing page; no payments wired
- Folder structure matches docs/ARCHITECTURE.md
- GitHub repo at github.com/ripclass/enso-academy (public during dev, private at launch)

## What's next (priority order)

1. Add Anthropic SDK and Claude client wrapper with three-tier model routing (Prompt 4)
2. Build authentication flow / UI (Prompt 5)
3. Build lesson player skeleton (Prompt 6)
4. Wire Stripe (Prompt 7)
5. Build mock exam engine (Prompt 8)

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

- Anthropic account is personal (rc.thesnapper@gmail.com) until migrated to company workspace
- Stripe account is pending Stripe Atlas approval — use test keys until live keys are issued
- Supabase project is named "enso-academy-dev" for development; production project TBD. Project ref yffwnyuodulbfjjobhmf, Singapore region. Linked locally; migrations live in supabase/migrations/ and are applied with `supabase db push`.
- Domain enso.academy is owned but not pointed to Vercel yet
- Repo is public during development for MCP tool access; will be made private before launch
- Next.js 16 deprecated the `middleware.ts` file convention — request interception uses `proxy.ts` at the project root (see ADR 0002). The Supabase session-refresh helper keeps the name lib/supabase/middleware.ts (a plain module, not a convention file).
- Infrastructure stack (decided between Prompt 1 and Prompt 2): Vercel hosts the Next.js app (frontend, API routes, Server Actions); durable background jobs will use Inngest or Trigger.dev (choice deferred to Prompt 5) for Opus batch course generation, TTS pre-generation, mock grading, and OCR pipelines; cache + rate limiting will use Upstash Redis (added in Prompt 5 or 6 when the lesson player needs it); dedicated worker hosts (Render, Railway) are deferred — Inngest + Vercel + Upstash cover v1 needs.
- Google OAuth setup pending — see docs/SETUP-google-oauth.md for the manual steps Ripon needs to complete in Google Cloud Console.
- Process hygiene: when stopping a backgrounded pnpm dev, kill by port (not by process group) to ensure the detached next dev child also dies. Stale dev servers on port 3000 will silently serve stale code.
- pgvector is installed in the `extensions` schema, not `public`. Any migration that references the `vector` type or `vector_cosine_ops` must `SET search_path = public, extensions;` at the top; functions using the `<=>` operator need the same as a function attribute. See migrations 20260520163212 / ...163214 / ...163217 for the pattern.

## Who is Ripon

Founder, Enso Intelligence Inc. Builder of TRDR Hub, RulHub, RulGPT, Kestrel, ICE LLM, KestrelIntel LLM, KhaM Labs, Lamppost, Murmur, Glyph. Bangladeshi, based in Dhaka. Economics graduate, builds products solo with a network of contractors on call. Has built 12+ products. Prefers concise, direct communication. Values: shipping over planning, honest pushback over polite agreement, primary sources over secondary, conservative claims over hype.

When in doubt about how to approach something, ask. He'd rather answer a clarifying question than fix bad work.
