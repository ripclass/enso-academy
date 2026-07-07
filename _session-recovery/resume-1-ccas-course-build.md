# RESUME PROMPT — Session 1: CCAS course build (generation)
Paste everything below the line into a fresh Claude Code session opened in the enso-academy repo.

---

Resume **building the CCAS course** (the inline lesson-generation workstream). Read `CLAUDE.md`, `docs/HANDOFF.md`, and `_session-recovery/SESSION-STATUS-2026-06-29.md` first. We stopped mid-build after an IDE crash; nothing was lost (generated artifacts are on disk).

**Goal:** keep generating the remaining CCAS lessons to the cleared bar, one lesson per turn, stopping for Ripon's review after each.

**State (verify at start):** ~41 lesson JSONs exist under `generated/ccas/lessons/` against the `generated/ccas/outline.json`. First step: **diff the outline's lesson slugs against the lesson JSONs present, and generate the next missing lesson in outline order.** The ledger is `generated/ccas/review_events.jsonl` (last write Jun 28 ~23:00).

**The recipe (critical — read the gotchas):**
- **Generation is INLINE** (this Claude session writes the lesson), one lesson per turn. **NEVER run `scripts/generate-course.ts lesson …`** — that is the OpenRouter API path and must not be used for generation (it costs API money and is the path to avoid). The `write`/promote mode is fine when Ripon asks.
- After generating a lesson artifact: validate with `pnpm tsx scripts/validate-lesson.ts ccas <slug>` → **7/7 gates PASS** (regenerate with gate feedback if not).
- Then Codex cross-check (gpt-5.5): `pnpm tsx scripts/crosscheck-lesson.ts ccas <slug>` (parallel methodology + fidelity), or dispatch directly via `codex.cmd exec --skip-git-repo-check --model gpt-5.5 --output-last-message <out> < <brief>`. Fix fidelity issues, re-run to AGREE (or accept cleared-with-flag, see below), then stop for Ripon.
- Follow `docs/COURSE-GENERATION-PROMPT.md` v1.1 + the methodology ADRs. Primary sources only; deep case must be a specific named public matter; every reading scene carries `citations[]`; quiz is scenario-based; **CCAS quiz questions REQUIRE `conceptTags` (array) + `points` (10) per question or the schema FAILs.**

**Known patterns / gotchas:**
- ~40% of recent CCAS lessons clear **cleared-with-flag** (methodology AGREE / fidelity SPLIT) on a single recurring reviewer preference: it wants verbatim DOJ/Treasury release titles in deep-case citations. Descriptive labels match every cleared CAMS lesson, so this is declined as a fabrication risk; fix all *genuine* fidelity issues, then accept cleared-with-flag and log the open call for Ripon. Don't burn iterations chasing the citation-title preference.
- The **INR.16 / Travel Rule data fields** were a "VERIFY AT GENERATION" TODO; they have since been verified (R.16 revised June 2025) in the CCAS `the-travel-rule-r16-and-inr16` lesson — reuse those verified fields, don't re-derive.
- **Em-dash (—) is banned in all user-facing copy** (Ripon's #1 AI tell). 0 em-dashes in any lesson.
- The reading renderer has **no remark-gfm** → markdown tables don't render; use a key-points **slide** for tabular/flow content.
- CCAS is a DRAFT course (not live); CAMS is the live one. Artifacts under `generated/ccas/` are gitignored.
- **Coordinate with the other two sessions:** the **marquee** session audits/rebuilds already-generated lessons; the **interactive-simulations** session owns `components/lesson/challenge`, `components/lesson/scenes/interactives`, `lib/cases`. Don't edit their files. You own `generated/ccas/`, `lib/ai/generator/*`, and the shared docs (CLAUDE.md/PROGRESS/SESSION-NOTES) — but those shared docs currently have ~299 uncommitted lines from prior Codex dispatch; preserve them.

Start by diffing outline vs present lessons to find the next lesson, then generate → validate → cross-check it.
