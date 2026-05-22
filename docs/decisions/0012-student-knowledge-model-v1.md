# ADR 0012: Student Knowledge Model v1

**Date:** 2026-05-22
**Status:** Accepted

## Context

`docs/FRAMEWORK.md` capability one — "the student model is real and continuously updated" — is the 4.0 spine of the product. `student_knowledge_state` existed as a schema table since the Prompt 3 build, but no runtime code read or wrote it; the AI lecturer was a context-grounded chatbot. Prompt 9 makes the table live. This is the first prompt of the re-sequenced roadmap (`docs/ROADMAP.md`).

## Decision

- A **concept** is a `concept_tag` string already present on `content_library_elements` (`concept_tags`, `teaches_concepts`) and `question_bank` (`concept_tags`). No new taxonomy was invented.
- **Mastery** is `student_knowledge_state.mastery_probability`, a value in `[0,1]`, one row per `(student_id, course_id, concept_tag)`.
- **v1 update rule** (`lib/student-model/knowledge.ts`):
  - `lr = 1 / (observation_count + K)`, with `K = 4`
  - `mastery_new = clamp(mastery_old + lr * (target - mastery_old), 0, 1)`
  - Evidence targets: `correct` 1.0, `incorrect` 0.0, `lesson_completed` 0.7
  - A concept with no row seeds at `mastery = 0.5` (genuine unknown), then the first evidence is applied.
  - `confidence` is set to `observation_count / (observation_count + K)`.
- This is **Bayesian-flavored, not Bayesian Knowledge Tracing**. Early evidence moves the estimate more; it stabilizes as observations accumulate. A full BKT model (per-concept learn / guess / slip parameters) is a defensible v2 once there is real student data to fit against.
- **Writers:** mock submission (`submitMockExam`, one observation per answered question — the load-bearing signal) and lesson completion (`completeLesson`, mild positive for the concepts the lesson's elements teach). Richer signals (lecturer re-explain detection, time-on-element) are deferred to v2.
- **Reader:** `askLecturer` calls `getMasterySummary` and injects a natural-language preamble into the Haiku system prompt on the cache-miss path, instructing the lecturer to explain weak concepts more thoroughly and not over-explain strong ones.
- A light **"Your knowledge"** card on the course detail page surfaces the model to the student (strong / to-review concepts).

## Alternatives considered

- **Full Bayesian Knowledge Tracing from v1** — rejected; needs fitted parameters and real data, premature.
- **Store raw evidence events, compute mastery on read** — rejected; the running estimate stored directly in `student_knowledge_state` is simpler and the schema was designed for it.
- **A new concept taxonomy** — rejected; the existing `concept_tag` strings are sufficient and already attached to content and questions.

## Consequences

- + The AI lecturer is no longer a context-only chatbot — it sees what the student knows and shapes its answers accordingly.
- + This is the foundation for Prompt 10 (lecturer memory) and Prompt 11 (the classmate). The classmate's gap detection is a function of this model and could not have been built before it.
- + Verified live: a 20-question CDCS mock populated 30 concept rows with a correct spread; the update math matches the rule exactly.
- − The Q&A cache (`cached_qa`) is course-level. A mastery-shaped answer that is cached and later served to a different student is slightly off. v1 accepts this — the preamble is a light nudge and the answer stays content-grounded. Revisit the cache strategy after Prompts 10-11 if personalization becomes strong enough that shared cached answers feel wrong.
- − Mock evidence is recorded per question (~20 sequential `recordEvidence` calls per submission). Acceptable for v1 — mock submit is infrequent and not latency-critical; a batched path is a possible optimization.
