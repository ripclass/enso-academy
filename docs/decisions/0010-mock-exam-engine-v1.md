# ADR 0010: Mock Exam Engine v1

**Date:** 2026-05-21
**Status:** Accepted

## Context

The v1 mock engine implements ARCHITECTURE.md commitments 6 (mocks mimic real exams) and 7 (signoff is real). Scope was deliberately bounded for the first iteration.

## Decision

- 20-question standalone MCQ format (scaled down from CDCS's real 90-question exam)
- 40-minute time limit, no pause, auto-submit at zero
- `question_bank` → `mock_exam_templates` → `mock_exam_attempts` data flow
- Server Actions: `startMockExam`, `submitMockExam`, `getAttemptResults` (with a private `updateReadiness` helper)
- Readiness evaluator: 4-criterion check (attempts count, average, minimum, weakest-domain score), three statuses (not_ready / approaching / ready)
- `signoff_events` as an immutable transition log
- Focus/blur tracking included; full lockdown (paste prevention, right-click block) deferred

## Alternatives considered

- Case-study format from v1: deferred until Opus-generated content exists
- Static question selection (no shuffle): rejected; predictable mocks lose practice value
- Full lockdown UI: deferred; focus/blur events catch most cheating signals for v1

## Consequences

- + Students get an immediate score and readiness update
- + Signoff infrastructure is ready; status transitions are tracked
- + Per-question review with explanations is the highest-value differentiator vs paperback prep
- − Needs 5 attempts to reach 'ready'; testing the full flow requires cycling through mocks
- − No real-exam-outcome capture UI yet; the signoff calibration loop has a missing piece
- − The 32-question bank is small; one mock uses ~two-thirds of it; more questions or Opus generation needed
