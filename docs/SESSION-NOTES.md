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
