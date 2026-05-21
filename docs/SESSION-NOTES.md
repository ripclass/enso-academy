# Session Notes

Running notes between Claude Code sessions. Append observations, partial work, things to remember next time. Cleared and archived periodically by the owner.

Format: ## [YYYY-MM-DD HH:MM] — short title

---

## [2026-05-20] — Initial session

Foundation scaffold completed. Memory system established. Ready for Prompt 2 (Supabase setup).

No partial work. No open threads.

---

## [2026-05-20 22:15] — Supabase + auth done, schema next

Supabase wiring complete. pgvector enabled on the Singapore project. Note: Prompt 2 specified `middleware.ts` but Next.js 16 deprecated that convention — migrated to `proxy.ts` (Ripon approved); ADR 0002 reflects this. Google OAuth credentials still need to be created in Google Cloud Console (see docs/SETUP-google-oauth.md). Database is empty of user tables — Prompt 3 will write the full schema (courses, modules, lessons, students, enrollments, mock exams, student knowledge state, classmate interventions, examiner data, commercial tables). No partial work or open threads from this prompt.

---

## [2026-05-20 22:45] — Schema applied, ready for Anthropic SDK

Six migrations applied cleanly. ~40 tables across six domains. RLS policies in place. pgvector cache table (cached_qa) ready with similarity-search RPC. One hiccup: the first `db push` failed because the `vector` type sits in the `extensions` schema and was not on the apply-time search_path — fixed with `SET search_path = public, extensions` in the three vector-using migrations + the match_cached_qa function, then re-pushed cleanly (ADR 0003 records the pattern). Next: wire Anthropic SDK and Claude client (Prompt 4). No partial work, no open threads.

---

## [2026-05-20 23:00] — Schema hardened against Supabase advisors

Ran the Supabase advisor lint (via the /supabase:supabase skill). Upgraded the Supabase CLI 2.53.6 -> 2.100.1 (scoop) to get `db advisors`. Two follow-up migrations (advisor_hardening + fix_subscriptions_rls_initplan) cleared all 4 security + 71 performance WARNs; advisors now report 0 WARN/ERROR. Effective access is unchanged (service_role bypasses RLS) — policies were just scoped and rewritten for performance. The enrollment-gated content-read RLS policies were resolved by ADR 0004 (content stays service-role-only; reads go through the admin client) rather than added as policies. Next: wire Anthropic SDK and Claude client (Prompt 4).

---

## [2026-05-21 00:30] — AI plumbing done (via OpenRouter); auth UI next

Claude client wrapper complete. Smoke test confirms Haiku ("Haiku alive"), Sonnet ("Sonnet alive"), and embeddings (1536-dim) all alive through OpenRouter — total ~0.02 cents. Major deviation: Prompt 4 was written for the direct Anthropic SDK, but Bangladeshi cards cannot fund Anthropic/OpenAI API billing — so the wrapper was reworked onto OpenRouter (OpenAI-protocol; `openai` SDK + custom baseURL; ADR 0005), and `@anthropic-ai/sdk` was removed. ARCHITECTURE.md was updated to match. Prompts are placeholder v0.1. Open items: OpenRouter has no Batch API, so Layer 1 course-generation cost is ~2x the estimate (ADR 0005 open questions); Whisper ASR needs a separate provider path. No partial work. Next: auth UI (Prompt 5).

---

## [2026-05-21 11:00] — Production live; auth UI next

www.ensoacademy.ai is the canonical production URL from now on (the apex ensoacademy.ai 308-redirects to www — Ripon's choice; Vercel set up manually). Every commit to main auto-deploys via Vercel. Localhost stays the iteration environment but smoke tests run against production (ADR 0006). Added /api/health/supabase. Both production smoke tests green: Supabase health (ok:true, 0 courses) and AI/OpenRouter (Haiku + Sonnet + 1536-dim embedding, ~0.02 cents). No env-var mismatches between Vercel and the code. Next: Prompt 5 — auth UI with Google OAuth (Playwright-driven GCP Console setup).
