# ADR 0002: Supabase Auth with Next.js Proxy Session Refresh

**Date:** 2026-05-20
**Status:** Accepted

## Context

Enso Academy uses Supabase Auth for student authentication. Next.js 16 App Router with Server Components requires session refresh to happen at the request-interception layer (not at the page layer) for Server Components to have access to authenticated user data.

Next.js 16 deprecated the `middleware.ts` file convention in favour of `proxy.ts` — same capability, new name. Enso Academy uses `proxy.ts`.

## Decision

Adopt the standard Supabase + Next.js App Router pattern, on the Next.js 16 `proxy.ts` convention:

- Four client variants in `lib/supabase/`: browser (`client.ts`), server (`server.ts`), the session-refresh helper (`middleware.ts`, exporting `updateSession`), and service-role admin (`admin.ts`)
- A separate admin (service-role) client for privileged operations — server-only, bypasses RLS
- A root `proxy.ts` calls `updateSession` on every request (matcher excludes static assets)
- OAuth callbacks land at `/auth/callback` and exchange the code for a session

## Alternatives considered

- Manually pass user data through every Server Component via `getUser()` calls. Rejected: brittle, requires every page to remember to do it.
- Client-side-only auth. Rejected: defeats the point of Server Components and breaks SSR.
- Keep the deprecated `middleware.ts` convention. Rejected: it logs a deprecation warning and will be removed in a future Next.js release; `proxy.ts` is the supported path now.

## Consequences

- +proxy runs on every request, slight latency overhead (~5-10ms)
- +auth state is always fresh; no manual refresh logic needed
- +the service-role admin client is available but explicitly server-only — type system and import discipline prevent accidental client-side use
- The Supabase session-refresh helper keeps the filename `lib/supabase/middleware.ts` — it is a plain module, not a Next.js convention file. Only the root request-interception file uses the `proxy.ts` name.
