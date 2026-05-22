# ADR 0014: The Classmate v1

**Date:** 2026-05-22
**Status:** Accepted

## Context

`docs/FRAMEWORK.md` capability four — a classmate in every lesson who asks the question the student should be asking but isn't — is the pedagogical moat. `classmates` and `classmate_interventions` existed as schema since the Prompt 3 build; nothing used them. The re-sequenced roadmap deliberately put the student model (Prompt 9) and lecturer memory (Prompt 10) before this prompt, because the classmate's gap detection is a *function of the student model*. A classmate without one is a script — exactly what the framework rejects.

## Decision

- **Model-grounded.** `checkClassmateGap` (`lib/classmate/actions.ts`) runs when the student advances past a lesson element. Gap detection compares the concepts that element taught against `student_knowledge_state`; it fires only on an **evidenced gap** — `mastery_probability` < 0.45 (`WEAK_THRESHOLD`) **and** `observation_count` > 0. No model evidence → no fire.
- **A never-assessed student rarely sees the classmate, by design.** You cannot detect a blind spot you have no evidence of. The classmate appears once the model has signal (after a mock or graded activity).
- **The classmate is a per-course character.** `classmates` has `course_id` and no `student_id` — one shared classmate (name from a curated pool, e.g. "Lena"; a fixed v1 persona) per course, like a real cohort. `getOrCreateClassmate` creates it on first need.
- **Fires conservatively.** `MAX_INTERVENTIONS_PER_SESSION = 1`, a tunable named constant — server-authoritative (counts the session's `classmate_interventions`) plus a client-side ref guard.
- **The exchange.** On a gap: Claude Sonnet generates an in-character question (a slightly-unsure fellow student, first person, never showing off, avoiding what the student already asked); Claude Haiku generates the lecturer's grounded answer. Both render in the lesson Q&A panel — a `classmate` message and a `lecturer` message.
- **Moat 4 — the tag.** Every classmate exchange is logged to `classmate_interventions` (with `gap_evidence`) and seeded into `cached_qa` with `origin = 'classmate_asked'` — distinct from `'student_asked'`. This is the classmate-discovered blind-spot dataset; the tag must be applied from day one.

## Alternatives considered

- **Firing on unassessed concepts** (no model evidence) — rejected; that is the scripted classmate the framework explicitly rejects.
- **A per-(student, course) classmate** — rejected; `classmates` has no `student_id`, and a per-course character matches "a consistent character across the course" and how a real cohort works.
- **Firing on every element / multiple times per lesson** — rejected for v1; calibration (rate, tone, difficulty) is an open question, and one well-placed intervention beats constant interruption.

## Consequences

- + The 6.0 pedagogical spine is complete: the lecturer knows what the student knows (Prompt 9) and who they are (Prompt 10); the classmate surfaces what they are missing (this).
- + Verified live: on the demo account the classmate "Lena" fired on `independence_principle` (the weakest concept, mastery 0.30) with a natural in-character question; it fired exactly once across four element transitions.
- + `cached_qa` accumulates a `classmate_asked`-tagged dataset from day one (framework moat 4).
- − Classmate calibration — firing rate, tone, question difficulty — is unvalidated. v1 is deliberately quiet (1/session) and tunable; it needs iteration with real students.
- − Each fire is a Sonnet + Haiku + embedding call (~5-8s); it runs async so it does not block navigation — the exchange appears in the Q&A panel a few seconds after the student advances. The gap *check* on each advance is DB-only (cheap) until it fires.
- − v1 triggers only on forward element advance (`goNext`). Sufficient — the lesson player is linear.
