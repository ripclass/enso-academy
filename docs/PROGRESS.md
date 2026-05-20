# Enso Academy Progress Log

Append-only log of milestones completed. Newest entries at top.

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
