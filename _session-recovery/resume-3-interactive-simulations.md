# RESUME PROMPT — Session 3: interactive simulations / "Apply it" challenge
Paste everything below the line into a fresh Claude Code session opened in the enso-academy repo.

---

Resume the **interactive-simulations workstream** (the interactive scene widgets + the "Apply it" challenge system). Read `CLAUDE.md`, `docs/HANDOFF.md`, and `_session-recovery/SESSION-STATUS-2026-06-29.md` first.

> NOTE: of the three crashed sessions, this one left the least Jun-29 trace (last file edits were Jun 28 evening: `lib/cases/scenarios-rollout.ts` ~20:19, `lib/cases/scenario-bank.ts` ~19:56). Confirm exactly where you stopped before assuming the "next step" below — adjust if it was mid-something specific.

**What this workstream has built (state, all live or committed):**
- **Interactive scene widgets** in `components/lesson/scenes/interactives/`: `risk-classify`, `red-flag-spot`, `flow-trace` (transaction-network "follow the money"), `screening-match` (sanctions/PEP adjudication). Plus the **PBL project scene** (`pbl/project-scene.tsx`) with Sonnet grading (`gradeProjectSubmission`).
- **Conceptual challenge mechanics** in `components/lesson/challenge/conceptual/`: `sequence-order`, `match-pairs`, `sort-buckets` (tap-based, mobile-friendly, internally shuffled).
- **"Apply it" end-of-lesson challenge rolled to all 49 CAMS lessons** (144 scenarios; 39 in `lib/cases/scenario-bank.ts`, 105 in `lib/cases/scenarios-rollout.ts`).
- **DB-backed scenario bank**: `challenge_scenarios` table (migration `20260628120000`, applied live). `getLessonChallenge` unions DB rows OVER the in-code bank (DB wins by id), so scenarios can be added/edited via SQL with **no deploy**; the in-code bank is the typed seed + a runtime floor. Seed via `scripts/seed-challenge-scenarios.ts`.
- The generator pipeline (`lib/ai/generator/lesson.ts`) folds an interactive/PBL application scene into newly-generated lessons; `validate_gates.ts` validates the specs; `writer.ts` promotes them. 21 lessons currently carry a hands-on scene.

**Likely open items (the workstream's backlog — pick up the one you were on):**
- **Interactive flashcards** (flip + spaced repetition) — Tier 2, not yet built.
- **Richer inline quizzes** — the formative quiz scene is still bare single-select; make it richer.
- **Seed interactives/challenge into more lessons**, and **bring the "Apply it" challenge to the CCAS course** (currently CAMS-only).
- Tier 3: progress/mastery viz ("X concepts mastered"), whiteboard mode, PPTX/offline export.
- If the task was literally "rebuild ALL interactive simulations" (a quality pass on the existing widgets/scenarios), confirm the target bar and sweep the widgets + the 144 scenarios for correctness, distractor plausibility, and the integrity rules below.

**Gotchas / rules:**
- **Quiz/challenge integrity bar (Codex standard):** shuffle option/answer positions so "pick first / pick longest" can't score; the challenge dispatcher already shuffles decision options, red-flags, and screening alerts centrally — keep new content to that bar (one correct per decision, plausible competing distractors, length parity).
- **Do NOT run `scripts/shuffle-assessment-positions.js` on multi-select (`multiple_choice`) items** — it corrupts `correctOptionIds`.
- Scenario edits: DB rows in `challenge_scenarios` win by id and take effect with no deploy; the in-code bank is the floor (removals still need an in-code change). Code changes ship by Vercel deploy; **always check `vercel ls` after a push** (tsc-clean can still fail the Turbopack prod build).
- **Em-dash (—) is banned in all user-facing copy** (Ripon's #1 AI tell). 0 em-dashes in any scenario/copy.
- Regenerate `database.types.ts` after any migration; `'use server'` files may only export async functions.

**Lane coordination:** you own `components/lesson/challenge`, `components/lesson/scenes/interactives`, `lib/cases`, and the challenge/interactive DB tables. Don't edit lesson *content* (`generated/`) — the CCAS-build and marquee sessions own that.

Start by confirming where you stopped (git status / recent edits to `lib/cases` + `components/lesson/challenge`), then continue that item.
