Pause checklist reviewed end-to-end. Green-light Task 4. Wire Option A. Go.

  Restating crisply so you can hand it to the session cleanly:

  Decision: Option A. Wire parallelCrossCheck per-lesson into scripts/generate-course.ts. Methodology v1.1 (4b) commits to it, the iteration cap is decorative without per-lesson  
  Codex execution, and Path-1 proved Codex catches what gates miss (1.3 scene-8 news-as-substance was a Codex catch, not a gate catch). Cost is within projection.

  Codex-wiring implementation specifics:

  - Two independent retry caps. MAX_GATE_VALIDATION_ATTEMPTS = 3 (existing, structural retries with gate feedback) and MAX_CODEX_ITERATIONS_PER_LESSON = 3 (new, substantive       
  retries with Codex feedback). Different failure modes, separate counters.
  - Codex runs ONLY after gates clear (pass or flag). Don't burn Codex spend on a lesson that's going to be re-generated for a structural fail.
  - Outcome handling:
    - Codex supported → save + emit lesson_review_events JSONL row (reviewer_role: 'cross_check', decision: 'validated').
    - Codex flag / weak-supported → save + emit cross_check_flagged row. Soft signal, operator inspects at module rollup.
    - Codex unsupported → do NOT save. Retry generation with Codex's reasoning merged into the retry prompt. Increment Codex iteration count.
  - Cap-exceeded → throw CodexIterationCapExceededError (parallel to GateValidationCapExceededError). full mode catches, pauses run, surfaces lesson + audit-trail.
  - Codex artifacts preserved per round at generated/cams/lessons/<slug>.codex.<n>.txt (brief sent + Codex response). Audit-trail discipline; cheap.

  Per-module sequence approved as proposed: M1 single-lesson smoke test → M2 concept-heavy → M3 widest source list → … → M9 enforcement deep-cases. Cost projection $97–227 within 
  band.

  Scope-note consistency edits all approved — METHODOLOGY_VERSION constant bump to v1.1, runGates default to v1.1, RUNBOOK step 6 rewrite, script log line cleanup. Roll into the  
  Task 5 commit alongside the rest.

  One mid-run sanity check, not a hard pause. After M2 completes (5 lessons total — M1's 1.4 + M2's 4 lessons), one-paragraph status write-back at the next session prompt: actual 
  cost vs projected, gate flag rate, Codex iteration distribution, any cap hits. If everything looks normal, continue M3 → M9 without further check-ins until Task 5.

  Go.Pause checklist reviewed end-to-end. Green-light Task 4. Wire Option A. Go.

  Restating crisply so you can hand it to the session cleanly:

  Decision: Option A. Wire parallelCrossCheck per-lesson into scripts/generate-course.ts. Methodology v1.1 (4b) commits to it, the iteration cap is decorative without per-lesson  
  Codex execution, and Path-1 proved Codex catches what gates miss (1.3 scene-8 news-as-substance was a Codex catch, not a gate catch). Cost is within projection.

  Codex-wiring implementation specifics:

  - Two independent retry caps. MAX_GATE_VALIDATION_ATTEMPTS = 3 (existing, structural retries with gate feedback) and MAX_CODEX_ITERATIONS_PER_LESSON = 3 (new, substantive       
  retries with Codex feedback). Different failure modes, separate counters.
  - Codex runs ONLY after gates clear (pass or flag). Don't burn Codex spend on a lesson that's going to be re-generated for a structural fail.
  - Outcome handling:
    - Codex supported → save + emit lesson_review_events JSONL row (reviewer_role: 'cross_check', decision: 'validated').
    - Codex flag / weak-supported → save + emit cross_check_flagged row. Soft signal, operator inspects at module rollup.
    - Codex unsupported → do NOT save. Retry generation with Codex's reasoning merged into the retry prompt. Increment Codex iteration count.
  - Cap-exceeded → throw CodexIterationCapExceededError (parallel to GateValidationCapExceededError). full mode catches, pauses run, surfaces lesson + audit-trail.
  - Codex artifacts preserved per round at generated/cams/lessons/<slug>.codex.<n>.txt (brief sent + Codex response). Audit-trail discipline; cheap.

  Per-module sequence approved as proposed: M1 single-lesson smoke test → M2 concept-heavy → M3 widest source list → … → M9 enforcement deep-cases. Cost projection $97–227 within 
  band.

  Scope-note consistency edits all approved — METHODOLOGY_VERSION constant bump to v1.1, runGates default to v1.1, RUNBOOK step 6 rewrite, script log line cleanup. Roll into the  
  Task 5 commit alongside the rest.

  One mid-run sanity check, not a hard pause. After M2 completes (5 lessons total — M1's 1.4 + M2's 4 lessons), one-paragraph status write-back at the next session prompt: actual 
  cost vs projected, gate flag rate, Codex iteration distribution, any cap hits. If everything looks normal, continue M3 → M9 without further check-ins until Task 5.

  Go.