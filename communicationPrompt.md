# Session brief — Full CAMS generation via Path 2 infrastructure

**Authorisation:** Ripon. Operator-supervised. Real Opus + Codex spend (~$125–300 estimated).
**Predecessor:** Path 2 shipped on `main` in commit `d8a0916` (Cycle 1–5 deterministic-validation + Codex orchestration). This session uses it to generate the rest of the CAMS course.
**Predecessor before that:** Path 1 produced launch-quality CAMS lessons 1.1 / 1.2 / 1.3 inline (commit `5e11862`). Those are your fixtures and quality baseline.

---

## Mandatory reading, in order

1. `CLAUDE.md` — current state. Confirm Path 2 is described as shipped before doing anything else; if it isn't, stop and surface the inconsistency.
2. `docs/decisions/0019-path2-validation-and-cross-check-infrastructure.md` — Path 2 ADR. Read end-to-end, especially the cap rationale (`MAX_CODEX_ITERATIONS_PER_LESSON = 3`) and the source-registry decision (`outline.sources[]` is advisory).
3. `docs/COURSE-GENERATION-PROMPT.md` — methodology v1.0. You are about to revise this to v1.1; read what's there first.
4. `docs/RUNBOOK-course-generation.md` — operator runbook for the pipeline. Resumability semantics, cost expectations, the `generated/<course>/` artifact layout.
5. `lib/ai/generator/validate_gates.ts` — the 7 gates. Read the gate-6 (methodology) heuristics carefully — you're patching one of them in Task 3.
6. `lib/ai/generator/citation_bind.ts` — gate 7. Read the candidate-label regex section — you're patching it in Task 3.
7. `scripts/generate-course.ts` — what you're wiring `runGates` into in Task 2.
8. `generated/cams/lessons/what-money-laundering-actually-is.json` — Path-1 lesson 1.1 (Danske, gold standard).
9. `generated/cams/lessons/what-terrorist-financing-actually-is.json` — Path-1 lesson 1.2 (Lafarge).
10. `generated/cams/lessons/why-states-regulate-financial-institutions.json` — Path-1 lesson 1.3 (HSBC). Six-round iteration history; read SESSION-NOTES entries on it before generating anything else.
11. `generated/cams/outline.json` — locked. Do NOT regenerate. You are filling out lessons against this outline.
12. `generated/cams/review_events.jsonl` — the 18 Path-1 audit events. Your runs append here.

Then check in with Ripon for any last directives before starting.

---

## Task sequence (do in order, do not parallelise)

### Task 1 — Methodology v1.0 → v1.1 ADR (~45 min, docs only)

The methodology's QA section currently mandates SME review before publication. That mandate is retracted per Ripon's autonomy thesis (decided 2026-05-24, recorded in SESSION-NOTES.md). Revise to codify what actually catches the gaps SME was meant to catch.

**Edit `docs/COURSE-GENERATION-PROMPT.md`:**

- Bump the version header to `v1.1`.
- Replace the SME-review section with an AI-verification-spine section describing: (a) the 7 deterministic gates from `validate_gates.ts`; (b) parallel Codex cross-check via `codex_dispatch.ts` (methodology + factual-fidelity dispatched together, not in series); (c) citation_bind substring verification as the anti-fabrication anchor; (d) `MAX_CODEX_ITERATIONS_PER_LESSON = 3` as a generator-quality signal; (e) the first-cohort feedback loop as the operational-ground-truth closer post-launch.
- Add a "Residual gaps" subsection naming the two things Path 2 does not yet close: **currency** (training-cutoff-bound; addressed by the planned currency-tracking layer, not in v1.1 scope) and **operational ground-truth** (closed by first-cohort signal post-launch).
- Add a one-line guardrail to the IP/scope section: **RulHub's rule registry, when integrated as a citation source, is a citation target only — never a lesson scaffold.** Rules are operationally framed (block-if-X); lessons are pedagogically framed (why, edge cases, common errors). Mechanically transforming rules into scenes produces bad pedagogy AND distorts the rules. The methodology's primary-source discipline carries over from RulHub, not the rule's literal text.
- Keep the IP rules unchanged otherwise. Keep the primary-source-only rule unchanged. Keep the "deep-case scene per lesson" rule unchanged. Keep the type-5-as-pointer rule unchanged.

**Write `docs/decisions/0020-methodology-v1-1-ai-verification-spine.md`:**

- Context: SME mandate in v1.0 reflected single-model verification assumptions; Path 2 ships multi-layer verification; Ripon's market context makes mid-tier SME signoff a noise source, not a quality gain.
- Decision: retract SME mandate; codify AI-verification spine; defer currency-tracking to a future build; rely on first-cohort signal for operational-ground-truth closure.
- Alternatives considered: keep blanket SME; sample SME audits; SME post-launch. Rejected per the autonomy thesis + cost variance in BD professional services.
- Consequences: faster launch; brand position is "AI-native" not "AI + credentialed examiner"; first-cohort tail risk on factual errors that pass all gates.

Do not touch CLAUDE.md / PROGRESS.md yet — that's Task 5.

### Task 2 — Wire `runGates` into `scripts/generate-course.ts` (~30–45 min)

Right now `runGates` exists in `lib/ai/generator/validate_gates.ts` and is invoked by the CLI runner (`scripts/validate-lesson.ts`). In-flight validation in the generate loop is the deferred follow-up the previous session named.

**Contract:**

- After Stage 2 produces a `LessonArtifact` and before `saveArtifact` writes it: call `runGates(artifact, { outline, methodologyVersion: 'v1.1' })`.
- `overall === 'fail'`:
  - Do NOT save the artifact.
  - Emit a `lesson_review_events` JSONL entry with `reviewer_role: 'validator'`, `decision: 'rejected'`, `notes` = the failing gate's `detail` + the first few items from `data.errors`.
  - Re-prompt the lesson stage with the diff as feedback. Maximum 2 retries; on third failure, surface to operator and pause the run.
- `overall === 'flag'`:
  - Save the artifact AND its `<slug>.validation.json` sibling.
  - Emit a `lesson_review_events` JSONL entry with `decision: 'flagged'`, `notes` = the flag detail.
  - Continue to next lesson — operator inspects flags at module rollup, not mid-run.
- `overall === 'pass'`:
  - Save artifact + `<slug>.validation.json`.
  - Emit a `lesson_review_events` JSONL entry with `decision: 'validated'`.

The `<slug>.validation.json` sibling and the JSONL emission both already have helpers — re-use them, don't reinvent.

Type-check: `pnpm tsc --noEmit`. Smoke test by running the validation flow against the existing Path-1 artifacts (they should all `pass` since the prior session already cleared them through citation_bind).

### Task 3 — Patch the two known calibration issues (~45 min)

Both surfaced in the prior session's closing notes.

**3a — Gate 6b reference-form normalization** (`lib/ai/generator/validate_gates.ts`):
Gate 6b checks that distinctive reference tokens in slide `items[]` appear in the narration. The current regex catches `UNSCR 1373` but not `UN Security Council Resolution 1373` — and the propagation-failure pattern shows up in either form. Normalize before comparison. Build a small alias table (UNSCR ↔ UN Security Council Resolution; § N ↔ Section N; R.N ↔ Recommendation N; INR.N ↔ Interpretive Note to Recommendation N) and fold both sides through it. Add a unit smoke test that confirms the existing Path-1 fixtures still pass after the change (no regressions).

**3b — citation_bind comma-separated FATF lists** (`lib/ai/generator/citation_bind.ts`):
The current candidate-label regex catches the range form (`Recommendations 26–29`) but misses the leading enumerated members in `Recommendations 20, 26–29`. Extend the range expander to also tokenise leading comma-separated singletons before the range. The outstanding unbound claim in CAMS 1.3 (FATF R.26) traces to this. Confirm the unbound list goes to zero on 1.3 after the patch.

Type-check + smoke-test against all three Path-1 fixtures.

### Task 4 — Generate the remaining 37 lessons + 9 module assessments (~2–4 hours wallclock, ~$125–250 spend)

The outline at `generated/cams/outline.json` is locked. 9 modules / 40 lessons total. 3 lessons already exist (1.1 / 1.2 / 1.3 in `generated/cams/lessons/`). You generate the remaining 37 lessons + the 9 module assessments.

**Command:** `pnpm tsx scripts/generate-course.ts full --course=cams`

**Operator discipline:**

- Never run unattended. You are at the keyboard; you watch each lesson complete; you decide whether to continue.
- After each lesson: read its `<slug>.validation.json`. If `flagged`, glance at the flag detail — if it's a known false-positive pattern (gate 6b alias miss, citation_bind range miss after patch), note it for follow-up and continue; if it's substantive, stop and surface to Ripon.
- After each module's 4–5 lessons complete: generate the module assessment, then move to the next module. Do not skip-ahead.
- If a lesson exceeds `MAX_CODEX_ITERATIONS_PER_LESSON = 3`: stop. Surface the lesson + the audit-trail JSONL to Ripon. Do not try to force it through. The cap is a quality signal — exceeding it means the generator needs reprompting or the outline slot needs rethinking, not "Codex doing extra work."
- Resumability: the pipeline persists each stage artifact, so if you have to stop and restart, the next run picks up from the last completed lesson. Don't re-run a completed lesson unless you intend to overwrite it.

**Cost tracking:** log Opus + Codex spend per module in your scratch notes. The previous session's per-lesson actuals were $0.50–1.00 for Opus + $2–5 for Codex cross-check; if you see a module dramatically over that band, surface it.

**Do not run the `write` stage at the end.** That is the file-to-DB on-ramp; Ripon decides when to flip published. Leave the course in `draft`.

### Task 5 — Memory + single commit

When the run is complete (or paused for operator review at any natural break):

- `CLAUDE.md`: update "Current state" (CAMS at v1 content, N lessons generated, X flagged, Y over-cap) and "What's next" (SME track is gone; next priorities are migration apply + Stripe + currency-tracking layer + RulHub clause-registry integration as a citation_bind candidate source, *conditional on* the unbound-citation rate from this run being meaningful).
- `docs/PROGRESS.md`: dated entry, milestone-style. Numbers — total lessons, total cost, gate-fail/flag/pass counts, distinctive errors caught by gates (the kind that wouldn't have been caught without Path 2).
- `docs/SESSION-NOTES.md`: any pattern findings worth carrying forward — which methodology gate flagged most often, which citation_bind aliases needed adding, any outline gaps surfaced by generation.
- One commit with everything (methodology v1.1, ADR 0020, scripts changes, generator changes, generated artifacts under `generated/` are gitignored — don't try to add them).

Commit message format:
```
feat(m13-academy): full CAMS generation via Path 2 + methodology v1.1

<summary of what shipped>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

Push to `main`.

---

## Constraints (non-negotiable)

- **IP rules unchanged.** No commercial study guides as substantive content. No verbatim ICC rule text. Inspiration from ACAMS's *public* exam blueprint is allowed; lifting their prose is not.
- **Primary sources only** for substantive content. Journalism as pointer, not base.
- **One deep-case scene per lesson, developed deep.** Lesson 1.1 (Danske) is the gold standard.
- **Methodology v1.1 supersedes v1.0** the moment Task 1 commits. Generator prompts should reference v1.1 from Task 2 onward.
- **Codex iteration cap is hard.** Exceeding 3 is a generator-quality signal, not a Codex problem.
- **Operator-supervised throughout.** No `&` , no background queues, no "I'll check back in an hour."

---

## What you do not do

- Do not generate or modify `generated/cams/outline.json`. It's locked.
- Do not publish the course. Status stays `draft`.
- Do not apply the Supabase migration (`supabase db push`) — that's Ripon's step.
- Do not run `scripts/backfill-review-events.ts` until the migration is applied — it will silently no-op or fail (depending on table state).
- Do not "improve" the methodology beyond the SME retraction + AI-verification-spine codification. v1.0 is otherwise frozen for a reason.
- Do not start the currency-tracking layer. That's a separate, post-launch build.
- Do not build the Stripe / payments wiring. Different track.

---

## Done definition

- `docs/COURSE-GENERATION-PROMPT.md` at v1.1 + ADR 0020 committed.
- `runGates` wired into `scripts/generate-course.ts` with pass/flag/fail handling per contract.
- Both calibration patches in (`validate_gates.ts` 6b normalization + `citation_bind.ts` comma-list).
- 37 new lesson artifacts under `generated/cams/lessons/` with `<slug>.validation.json` siblings.
- 9 module assessments generated.
- `generated/cams/review_events.jsonl` extended with every per-lesson event from this run.
- Single commit on `main` pushed; memory files updated.

If anything blocks before all six are true, stop and surface — don't paper over.

---

## First action

Read CLAUDE.md and ADR 0019. Confirm Path 2 is on `main` (`git log --oneline | head` should show `d8a0916`). Then check in with Ripon for any last directives before starting Task 1.
