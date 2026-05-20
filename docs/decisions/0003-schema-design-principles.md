# ADR 0003: Database Schema Design Principles

**Date:** 2026-05-20
**Status:** Accepted

## Context

The Enso Academy v1 schema needs to support all ten architectural commitments (modular content, persistent student model, lecturer memory, gap-driven classmates, mock exam fidelity, signoff, conservative grading, multi-modality, evidence of learning, primary sources) plus standard commercial concerns (payments, enrollment, admin).

## Decision

Six domain-grouped migrations rather than one mega-migration. Each domain is independently understandable in git history.

Schema conventions adopted:
- UUID primary keys (gen_random_uuid())
- TIMESTAMPTZ everywhere with auto-updating updated_at via trigger
- JSONB for flexible structured data (metadata, knowledge state snapshots, mock answers, etc.)
- pgvector embeddings for any text that needs semantic search (content_library_elements, glossary, case_studies, cached_qa, student_memory)
- ENUMs for fixed value sets (course_tier, modality, question_type, etc.)
- GIN indexes on TEXT[] columns (concept_tags)
- ivfflat indexes on vector columns
- RLS enabled on every table with explicit policies — service role bypass for server-side logic, student-scoped policies for authenticated users
- Auto-trigger creates student_profile and student_preferences on auth.users insert

## Alternatives considered

- Single mega-migration. Rejected: harder to debug, git history less informative, all-or-nothing failure.
- Defer pgvector embeddings to a later migration. Rejected: cache layer is foundational; better to have the columns in place from the start even if initially NULL.
- Skip RLS for v1 and rely on application-layer auth. Rejected: defense-in-depth matters; RLS catches application bugs.

## Consequences

- +clean separation of concerns per domain
- +schema reflects architecture commitments at the data layer
- +cache and similarity-search infrastructure ready before lib code needs it
- -migration order matters: bangladesh_schema references mock_exam_attempts from mocks_schema; must run sequentially
- -RLS policies need to be carefully maintained as new tables are added
- pgvector lives in the `extensions` schema (installed `WITH SCHEMA extensions`), which is not on the migration apply-time search_path. Any migration using the `vector` type or `vector_cosine_ops` must `SET search_path = public, extensions;` at the top; functions using the `<=>` operator need the same as a function attribute. Discovered when the first six-migration push failed on `type "vector" does not exist`.
