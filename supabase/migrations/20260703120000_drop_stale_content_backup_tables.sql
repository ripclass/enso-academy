-- The zz_* tables were ad-hoc backups taken during the catalog-wide em-dash /
-- arrow prose fixes (verified live 2026-06-28). They duplicated full course
-- content (including the 502-question bank with answers) and were briefly
-- exposed via the public API until RLS was enabled on 2026-07-03. The fixes
-- have long been promoted and verified, so the backups are dropped.
-- Applied to the remote project via MCP on 2026-07-03; kept here for the
-- repo's migration record. Idempotent (IF EXISTS) so a re-apply is harmless.
drop table if exists public.zz_arrow_bak_cle;
drop table if exists public.zz_emdash_bak_cle;
drop table if exists public.zz_emdash_bak_glossary;
drop table if exists public.zz_emdash_bak_lessons;
drop table if exists public.zz_emdash_bak_modules;
drop table if exists public.zz_emdash_bak_qbank;
