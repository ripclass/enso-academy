# ADR 0008: Lesson Player Architecture (v1)

**Date:** 2026-05-21
**Status:** Accepted

## Context

The lesson player is the heart of Enso Academy. It must support: sequential navigation through modular content elements (commitment #3 — lessons are not linear, but the v1 player presents them in a default order; modularity comes in v2 with the path generator), AI lecturer Q&A grounded in the current lesson context (commitment #2 — student model exposed), cache-first cost control (three-tier architecture), and session tracking for analytics and the eventual student knowledge state update loop.

## Decision

v1 lesson player is a Server-Component shell with a Client-Component player that:

1. Loads all content elements for the lesson up front (Server Component)
2. Renders elements one at a time with prev/next navigation (Client Component state)
3. Hosts a side-panel chat that calls a Server Action (askLecturer) on every student question
4. Server Action: embeds the question via OpenAI, queries match_cached_qa RPC, returns the cached answer on hit or calls Haiku with lesson grounding on miss, caches the new Q&A for future students
5. Logs every event to session_events
6. Lesson completion writes an ended_at to the session and logs a lesson_completed event

Deferred to future prompts: streaming token-by-token render of lecturer responses, TTS audio narration, whiteboard rendering, classmate gap-detection, multi-modality switching, inline knowledge checks, the student knowledge state update loop, the path generator that personalizes element sequencing.

## Alternatives considered

- Full client-side player with direct Supabase queries. Rejected per ADR 0004 (content reads go through service role on the server).
- Server-side streaming of element-by-element narration via SSE. Deferred to v2 — adds complexity without changing the experience meaningfully for v1.

## Consequences

- +simple, debuggable v1 architecture
- +cache layer exercised from day one, accumulating real Q&A data
- +session tracking captures everything we need for later cache hit rate / cost analysis
- -no streaming UI yet (lecturer response appears all at once); will feel less responsive than the eventual streaming version
- -element ordering is hand-set in metadata; the path generator's personalization is not yet alive
