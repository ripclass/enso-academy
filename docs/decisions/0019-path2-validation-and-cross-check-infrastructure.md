## ADR 0019: Path 2 — deterministic validation + cross-check infrastructure

**Date:** 2026-05-24
**Status:** Accepted

## Context

The CAMS Path 1 inline-generation run (ADR-less, captured in `cams-session-brief.md`) shipped two launch-quality lessons (1.2 / 1.3) plus the calibration artifact (1.1). The Launch Quality Bar evaluation surfaced concrete signal about what to build to scale the discipline to the remaining 37 lessons without the per-lesson human-orchestrated Codex loop:

1. **Methodology audit must run alongside factual-fidelity, not after it.** Three rounds of Codex per-artifact cross-check on 1.3 returned AGREE on factual fidelity; the LQB methodology audit then caught two source-discipline issues (news-as-substance; unsourced quantitative claims). Running them in series produced a wasted iteration.
2. **The propagation-failure pattern recurred twice on 1.3** (item-fix not propagated to narration; round 2 and round 6). Item↔narration consistency is a discrete check.
3. **Slide-level claims need a citation pathway.** The schema doesn't require slides to carry citations; the rule "every factual claim has a primary-source citation in the same scene or an adjacent reading scene" needs a substring-bind that walks all scene types, not only reading-scene citation counts.
4. **The codex-rescue subagent has a self-attribution failure mode** (one occurrence in the Path-1 session). Infrastructure-level fix is brief-to-file + stdin pipe, always.
5. **Outline `sources[]` is underspecified** in practice (16/36 outline-match rate on 1.3 final). The choice is to expand the outline as new sources are cited (more work, registry stays authoritative) or accept the outline as advisory and rely on the anti-fabrication gates (less work, gates do the enforcement).
6. **Codex iteration count is a quality signal.** 1.3 took 6 Codex rounds; with the gates in place, that should drop to 1–2. A cap of 3 makes "needs reprompting / rebuild" detectable.

## Decision

`lib/ai/generator/` extended with deterministic-validation + cross-check-orchestration infrastructure. Five components, each independently committed and tested against the Path-1 artifacts as fixtures.

### 1. `lib/ai/generator/validate_gates.ts` (seeded pre-this-ADR; extended here)

The deterministic gate runner. Seven gates over a `LessonArtifact`, with the `.validation.json` output shape matching what Path-1 wrote so the existing reports migrate forward.

| Gate | Hardness | What it catches |
|---|---|---|
| schema | hard | scene-shape against `lib/lesson/scenes.ts` contract |
| citation | informational | every reading scene has citations; advisory outline-resolution rate |
| ip | hard | banned commercial-guide names; ICC rule-text reproduction |
| pedagogy | soft | no duplicate `teachesConcepts`; deep-case scene present |
| quiz_alignment | soft | quiz `conceptTags ⊆ lesson`; `correctOptionId` valid; no EXCEPT format |
| methodology | soft | news-as-substance; item↔narration consistency; numerics sourced |
| citation_bind | soft | structured factual references (statute, case, EO, named publication) anchored by substring in lesson-wide citation pool |

`runGates(artifact, { outline })` → `ValidationReport` with per-gate detail + overall (`pass | flag | fail`).

### 2. `lib/ai/generator/citation_bind.ts`

Substring-verified bind for structured factual references. Scope is **lesson-wide** (not strict same-or-adjacent) — calibrated by walking the Path-1 fixtures, where the strict scope produced false positives on the "concept introduced in slide, citation lives in later reading scene" pattern that's structurally fine. The strict scope rule remains in effect for numeric claims via methodology gate 6c.

- Regex extractors for US Code, CFR, FATF Recommendations (with INR), UNSCR, UK statutes (POCA / MLR / TA / ATCSA / CTA), Bangladesh statutes (ATA / MLPA / BFIU Master Circular), EU regulations and directives, case names (`X v. Y` head), Executive Orders, and a small set of named publications.
- Multi-bindKey aliases per claim handle abbreviation/expansion pairs (e.g. `TA 2000` ↔ `Terrorism Act 2000`).
- Range and `et seq.` expansion in candidate labels: a citation "FATF Recommendations 9–23" covers individual claims `R.10`, `R.18`; "31 U.S.C. §§ 5311 et seq." covers individual §§ within a 40-section window.
- Output: `GateResult` with per-claim bind status, integrated as gate 7 in `runGates`.

### 3. `supabase/migrations/<ts>_path2_lesson_review_events.sql`

`public.lesson_review_events` — append-only audit-trail table matching the Path-1 JSONL field shape 1:1.

- Service-role-only writes; authenticated read-only (forward-looking for the review surface).
- Indexes: `(course_slug, lesson_slug, created_at desc)` for timeline lookups; `(artifact_hash)` for content-addressable queries.
- Status / decision / reviewer_role columns are plain text, not enums — the M13 discipline depends on adding new state transitions without migrations as the workflow grows.
- JSONL remains the source of truth (works offline, ships with the artifact bundle); the DB is a query-friendly mirror.
- `scripts/backfill-review-events.ts <course-slug>` ingests the per-course JSONL into the table; idempotent on `event_id` (upserts).

### 4. `lib/ai/generator/codex_dispatch.ts`

The single point of Codex invocation.

- `dispatchCodex({ brief })` writes the brief to a temp file and invokes `codex exec --skip-git-repo-check --output-last-message <out> < <brief>` — **always file-to-stdin, never command-line argument** — closing the self-attribution failure mode at the infrastructure level.
- `parseVerdict(raw)` — line-based parser, robust across Codex's slightly variable line-break behaviour. Returns `{ decision, reasoning, specificIssues, raw, exitCode }`.
- `parallelCrossCheck({ methodologyBrief, fidelityBrief })` — dispatches methodology + factual-fidelity in parallel, combines the verdicts.
- `dispatchCodexWithCap({ courseSlug, lessonSlug, brief, ... })` — refuses to dispatch when prior `cross_checked` events for the lesson have reached `MAX_CODEX_ITERATIONS_PER_LESSON = 3` (cycle 5). Returns either the Codex verdict or a synthetic `cap_exceeded` result that the orchestrator surfaces as a generator-quality flag.
- `makeReviewEvent` + `appendReviewEvent` — persists to the JSONL (always) and the DB (best-effort; falls back silently if the migration isn't applied or the env isn't available).

### 5. Source registry semantics + iteration cap

- **Source registry**: `outline.sources[]` is **advisory**, not authoritative. The bind step accepts any verifiable primary source; anti-fabrication is enforced by `gateIp` (commercial-guide ban) + `gateMethodology` (news-as-substance) + `gateCitationBind` (substring anchor). The citation gate's outline-resolution percentage is informational; the only FAIL condition is total disjoint (0% match — likely a wrong outline supplied for the lesson). Path-1 fixtures now PASS the citation gate with advisory framing (resolution 18/21/31%).
- **Codex iteration cap**: `MAX_CODEX_ITERATIONS_PER_LESSON = 3`. `countPriorCrossChecks(courseSlug, lessonSlug)` reads the JSONL. Validated against the Path-1 audit-trail history: 1.1 = 0 events, 1.2 = 3 (at cap — the final AGREE was the 3rd round), 1.3 = 6 (well over — the operational signal the cap is designed to surface).

## What this ADR did NOT do

- Did **not** apply the Supabase migration — modifying live shared schema is operator-confirmed. Ripon applies with `supabase db push`, then runs `pnpm tsx scripts/backfill-review-events.ts cams` to ingest the 18 Path-1 events, then regenerates `lib/supabase/database.types.ts`.
- Did **not** rewrite the existing inline workflow used to ship Path 1's two lessons. The Path-1 audit-trail JSONL + per-lesson `<slug>.validation.json` files remain the canonical record; this infrastructure operates over the same shapes.
- Did **not** integrate the gates into `scripts/generate-course.ts` or the Opus generation flow. The CLI runner `scripts/validate-lesson.ts` is standalone; gate integration into generation is a follow-up.
- Did **not** build a review UI for the audit-trail table. The schema is in place; the surface is a later product decision.

## Alternatives considered

- **Run methodology audit and factual-fidelity in series via two Codex calls**: rejected. The Path-1 cost-of-iteration data shows two-in-series collapses one iteration into two. Parallel dispatch (cycle 4) addresses this.
- **Strict same-or-adjacent candidate scope for `citation_bind`**: rejected. Produced false positives on the "introduced in slide, cited in later reading" pattern that's structurally fine for a coherent lesson. Lesson-wide scope catches the real failure mode (unanchored statute references) without false-flagging valid structural variation.
- **Auto-extend `outline.sources[]` as new sources are cited**: rejected (with reservation). Keeps the registry authoritative but requires re-running the outline stage with stricter source-list semantics — more work than the anti-fabrication gates already deliver. Advisory + verified-primary is the chosen path. Revisit if the gates produce more false negatives than the registry would have.
- **Hard `fail` from `citation_bind` on any unbound claim**: rejected. The bind is a soft signal — many lessons have legitimate references that don't substring-match a single citation entry. `flag` is the right hardness; the reviewer / orchestrator decides.
- **A single multi-line regex in `parseVerdict`**: rejected (a draft tried it). Codex's line-break behaviour varies enough that line-based parsing is more robust.
- **No iteration cap, treat Codex iterations as free**: rejected. The Path-1 history shows runaway iteration is itself a generator-quality signal that should surface, not be papered over with another Codex call.

## Consequences

- + Deterministic gates catch the failure modes that took Codex 2–6 iterations to surface in Path 1, before Codex is dispatched. Expected steady-state Codex iteration count per lesson drops to 1–2.
- + The methodology-compliance check operates per-artifact, not only at LQB strictness. The two LQB catches on 1.3 (news-as-substance; unsourced quantitatives) would now fire on the first local validation.
- + The audit trail migrates from per-course JSONL to a queryable DB table without rewriting the JSONL writer. JSONL stays as the source of truth.
- + The codex-rescue self-attribution failure mode is closed at infrastructure level — `dispatchCodex` always pipes via file.
- + `MAX_CODEX_ITERATIONS_PER_LESSON = 3` surfaces generator-quality concerns when reached, rather than letting the loop run six rounds invisibly.
- − The Supabase migration is unapplied until Ripon runs `db push`. Until then, `appendReviewEvent` falls back to JSONL-only (which is the actual source of truth, so this is graceful).
- − The gate calibration produces FLAG (not PASS) on the Path-1 fixtures themselves — they carry the real-signal gaps the new gates catch (the 1.2 UNSCR 1373 / FATF R.5 unanchored; the BD ATA 2009 / MLPA 2012 unanchored in 1.3 scene 6; the 1.1 § 5324 unanchored in quiz). The lessons remain launch-quality per the original bar; the new gates surface refinement opportunities the SME review can incorporate, not regressions.
- − The methodology gate 6b (item↔narration ref consistency) is over-sensitive on equivalent reference forms (e.g. `UNSCR 1373` in item vs `UN Security Council Resolution 1373` in narration). It produces FLAG, not FAIL, so the cost is manageable; a refinement to normalise reference forms is a follow-up.
- − Gate integration into `scripts/generate-course.ts` is deferred. The Opus-generated lesson flow should call `runGates` before `saveArtifact` once that wiring is added.
