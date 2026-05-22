# ADR 0013: Lecturer Memory v1

**Date:** 2026-05-22
**Status:** Accepted

## Context

`docs/FRAMEWORK.md` capability three — the AI lecturer remembers the student across sessions — is the 5.0 spine. `student_memory` existed as a schema table since the Prompt 3 build, but nothing wrote or read it; the lecturer started from zero every session. Prompt 10 makes it live, building on the student knowledge model (ADR 0012). This is the second prompt of the re-sequenced roadmap.

## Decision

- `student_memory` is an **editorial layer**: each row is a durable, relationship-meaningful fact — a stated goal, career context, a narrative observation of what the student found hard, a tone/pace preference. It is **not** a transcript and **not** concept mastery (that is `student_knowledge_state` / ADR 0012). The two are distinct layers, read together by the lecturer.
- `student_memory` already had the right shape (`memory_type`, `content`, `course_id`, `importance`, `metadata`, …) — no migration needed.
- **Writer:** a Claude Sonnet summarization job. At lesson completion (`completeLesson`), it reads the session's `question_asked` events, distils 0-3 facts (strict-JSON output, parsed defensively), and inserts `student_memory` rows. It is scheduled via Next.js 16's **`after()`** so it runs after the response is sent — "Complete lesson" stays fast and the student never waits for their own memory to be written.
- **Readers, two surfaces:**
  - `askLecturer` injects a memory preamble (`getMemoryPreamble`) into the system prompt, alongside the Prompt 9 mastery preamble.
  - `getLecturerOpening` generates a 1-2 sentence continuity greeting via Claude Haiku from recent memory; the lesson player shows it as the opening lecturer message in the Q&A panel.
- The dashboard shows "Welcome back" for students the lecturer has memory of.
- `lib/student-model/memory.ts` sits beside `knowledge.ts` — the `student-model` directory now holds both the cognitive model (what the student knows) and the relational model (who the student is).

## Alternatives considered

- **Logging the full conversation as memory** — rejected; memory is editorial, not a transcript. A chat log is noise the lecturer would have to re-summarize on every read.
- **Synchronous summarization inside `completeLesson`** — rejected; a ~3s Sonnet call would make the "Complete lesson" button hang. `after()` runs it post-response.
- **A template-assembled greeting (no LLM)** — rejected; the continuity moment needs natural, specific phrasing. Haiku is cheap.

## Consequences

- + The lecturer greets returning students with genuine continuity — the retention mechanic the framework calls "the difference between an AI tool and an AI relationship."
- + Combined with the student model, the lecturer now knows what the student **knows** (ADR 0012) and **who they are** (this ADR) — the full input the classmate (Prompt 11) needs to detect blind spots.
- + Verified live: a session with goal- and struggle-revealing questions distilled 3 correctly-typed facts (goal / struggle / preference); the next lesson opened with a greeting that referenced them specifically.
- − **No re-summarization / compaction in v1.** Memory rows accumulate; the reader caps at the recent ~10. A periodic compaction job (re-summarizing old facts into fewer, denser ones) is a v2 refinement — unnecessary until a student has dozens of sessions.
- − Memory is **course-scoped** (`student_memory.course_id` is set). Cross-course memory of a student is a possible v2.
- − A small LLM cost per lesson open (the Haiku greeting, only when memory exists) and per lesson completion (the Sonnet summary). Both are cheap and tracked via `logAiCall` with the `lecturer_greeting` and `memory_summary` purposes.
