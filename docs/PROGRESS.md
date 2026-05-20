# Enso Academy Progress Log

Append-only log of milestones completed. Newest entries at top.

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
