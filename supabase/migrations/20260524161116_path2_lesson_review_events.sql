-- ============================================================================
-- PATH 2 — lesson_review_events (audit trail for the M13-style course pipeline)
-- ============================================================================
-- The append-only audit trail of generate / cross-check / review state
-- transitions for each generated lesson. Matches the field shape of the
-- per-course `generated/<course-slug>/review_events.jsonl` file produced by
-- the Path-1 inline workflow 1:1 — the 18-event Path-1 JSONL migrates into
-- this table without translation via scripts/backfill-review-events.ts.
--
-- The table is intentionally schemaless on the status/decision/reviewer-role
-- fields (plain text, not enums). The M13 discipline depends on adding new
-- state transitions without migrations as the workflow grows — the
-- application layer (codex_dispatch / validate-lesson / future review UI)
-- enforces vocabulary. See ADR 0019.
--
-- Events are immutable: no updated_at, no UPDATE policy. Inserts only.
-- ============================================================================

create table public.lesson_review_events (
  event_id            uuid primary key,
  course_slug         text not null,
  lesson_slug         text not null,
  from_status         text,
  to_status           text not null,
  reviewer            text not null,
  reviewer_role       text not null,
  decision            text not null,
  notes               text not null default '',
  methodology_version text not null,
  outline_hash        text not null,
  artifact_hash       text not null,
  created_at          timestamptz not null default now()
);

comment on table public.lesson_review_events is
  'Append-only audit trail of generate / cross-check / review state transitions for the M13-style course pipeline. Field shape matches the per-course review_events.jsonl produced by Path 1 inline workflow.';

-- Timeline-per-lesson is the hot query path (review UI, orchestrator state machine).
create index lesson_review_events_lesson_timeline_idx
  on public.lesson_review_events (course_slug, lesson_slug, created_at desc);

-- Content-addressable lookup: "which events touched this artifact hash?" — used
-- by the orchestrator to decide whether a fresh cross-check is needed.
create index lesson_review_events_artifact_hash_idx
  on public.lesson_review_events (artifact_hash);

-- ----------------------------------------------------------------------------
-- RLS — service-role full access, authenticated read-only. No update / delete:
-- events are immutable. Anon has no access (content-pipeline state is
-- internal until the SME review surface is built).
-- ----------------------------------------------------------------------------
alter table public.lesson_review_events enable row level security;

-- Service-role policies are belt-and-suspenders (rolbypassrls = true) but
-- scoped to service_role per the advisor-hardening convention.
create policy "Service role full lesson_review_events"
  on public.lesson_review_events
  to service_role
  using (true)
  with check (true);

-- Authenticated reviewers can read the audit trail (forward-looking — when the
-- SME review surface is built, reviewers will browse this). No insert from
-- authenticated; the orchestrator writes via service-role only.
create policy "Authenticated read lesson_review_events"
  on public.lesson_review_events
  for select
  to authenticated
  using (true);
