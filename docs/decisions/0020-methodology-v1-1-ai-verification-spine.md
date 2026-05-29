# ADR 0020: Methodology v1.1 — AI verification spine supersedes SME mandate

**Date:** 2026-05-24
**Status:** Accepted

## Context

`docs/COURSE-GENERATION-PROMPT.md` v1.0 (ADR 0015) mandated subject-matter expert (SME) review as the second layer of accuracy assurance: "a credentialed practitioner on retainer or contract; never the AI orchestrator alone." That mandate reflected the single-model verification posture of the platform at the time v1.0 was committed — Opus generation alone could not be trusted as the substantive-accuracy ceiling, so a credentialed human had to backstop it.

Three things have changed since v1.0:

1. **Path 2 ships multi-layer verification.** ADR 0019 added the deterministic gate runner (`validate_gates.ts`, seven gates), substring-verified citation binding (`citation_bind.ts`, the anti-fabrication anchor), parallel Codex cross-check (`codex_dispatch.ts`, methodology + factual-fidelity dispatched together), and the `MAX_CODEX_ITERATIONS_PER_LESSON = 3` cap. The Path-1 inline-generation experience showed the gates would catch the failure modes that took Codex 2–6 iterations to surface (1.2's UNSCR 1373 / FATF R.5 unanchored references, 1.3's BD ATA 2009 / MLPA 2012 unanchored references in scene 6, the propagation-failure pattern that recurred twice on 1.3). The spine is not the same product the v1.0 SME mandate was written against.

2. **The first-cohort feedback loop is the operational-ground-truth closer.** Whether a student who masters the material passes the exam — the question the SME mandate ultimately tries to answer — is unverifiable at generation time regardless of whether the reviewer is human or AI. It closes post-launch through first-cohort exam-pass rates and per-lesson error reports, structured by the student feedback channel (QA item 6). A pre-launch SME pass cannot pre-empt this signal; it can only attest to source discipline, which the spine attests to deterministically.

3. **Bangladesh professional-services market context.** The pool of credentialed AML / CFCS / CCAS examiners willing to do per-lesson SME audits at predictable cost and quality is thin. Cost varies 5–10× across providers; expertise varies more (a CAMS-credentialed practitioner is not necessarily a subject-matter expert on EU AMLA implementation or BD ATA scope). The expected lift from a mid-tier SME pass over the AI spine, on the failure modes the SME mandate was designed to catch, is below the signal threshold that justifies the cost and the launch delay. Ripon's autonomy thesis: build an AI-native platform that does not require a credentialed human in the loop to ship pedagogically and factually defensible content.

## Decision

`docs/COURSE-GENERATION-PROMPT.md` revised to v1.1. The SME-review mandate (v1.0 QA item 4) is retracted and replaced by an AI verification spine subsection with five components:

(a) **Deterministic gates** — the seven gates in `validate_gates.ts`. Hard gates (`schema`, `ip`) FAIL on violation, blocking the artifact from being written. Soft gates FLAG. The gates operationalize the methodology's source-attribution and prohibited-source obligations (v1.1 QA items 1 and 2) at machine precision.

(b) **Parallel cross-check** — methodology audit + factual-fidelity audit dispatched in parallel via `codex_dispatch.ts:parallelCrossCheck`. Two-in-series was the Path-1 cost of iteration; parallel dispatch collapses one iteration into two.

(c) **Citation binding as the anti-fabrication anchor** — `citation_bind.ts` substring-matches every structured factual reference (statute, case, executive order, named publication) against the lesson-wide citation pool. The failure mode an LLM cannot reliably self-detect is caught here because the claim must appear verbatim in the citation set.

(d) **Iteration cap as a generator-quality signal** — `MAX_CODEX_ITERATIONS_PER_LESSON = 3`. A lesson reaching the cap is surfaced to the operator, not silently re-iterated.

(e) **First-cohort feedback loop** — operational ground truth closes post-launch through the student feedback channel (QA item 6), exam-pass rates, and per-lesson error reports.

A new "Residual gaps" subsection names what the spine does not close: **currency** (training-cutoff staleness, addressed by a planned currency-tracking layer outside v1.1 scope) and **operational ground truth** (closed by first-cohort signal).

A new guardrail in the IP/scope section codifies that **RulHub's rule registry, when integrated as a citation source, is a citation target only — never a lesson scaffold.** Rules are operationally framed; lessons are pedagogically framed. Mechanical transformation of rules into scenes produces bad pedagogy and distorts the rules. RulHub contributes verified primary-source citations; the lesson teaches from the primary source, as it would for any item in the methodology's source hierarchy.

All other v1.0 rules are unchanged: the prohibited-source list, the primary-source-only rule, the deep-case-scene-per-lesson rule, the news-as-pointer-not-substance rule, the citation discipline, the nominative-fair-use naming rules, and the standard disclaimer language.

## Alternatives considered

- **Keep the blanket SME mandate.** Rejected. The mandate's signal threshold is below the cost and launch-delay it imposes given the BD professional-services market, and the spine catches the source-discipline failures the SME mandate was designed to catch. Path-1 LQB experience confirms the gates would have surfaced both of the substantive issues a human SME flagged on 1.3 (news-as-substance in scene 8; unsourced quantitatives in scene 6).
- **Sample SME audits (1 in 4 lessons reviewed by SME).** Rejected. Introduces the same cost / variance problem at fractional scale without confidence that the sampled lessons are representative. The lessons most likely to need SME attention are the ones the gates already flag, not a random sample.
- **SME post-launch only on flagged content.** Rejected as a structural commitment, but de facto retained as a discretionary lever: a flagged lesson the operator cannot resolve through reprompting can be sent to an SME on a per-case basis. This is not a methodology obligation; it is an escape hatch. The structural commitment is the spine.
- **Pin the spine to a single cross-check engine (Codex only, or a single Anthropic-model audit only).** Rejected at ADR 0019 already; preserved here. Parallel dispatch with two independent audit lenses (methodology, factual fidelity) is the calibrated configuration; reducing to one re-introduces the propagation-failure blind spot Path-1 surfaced.

## Consequences

- **+** Launch is no longer gated on SME availability or cost. The 40-lesson CAMS run can proceed to draft without a parallel SME track.
- **+** Brand position is consistently AI-native. The platform's claim is "deterministic gates + parallel cross-check + substring-verified citation binding," not "AI generation backstopped by a credentialed examiner." This is honest framing for what the spine actually does and what it does not do.
- **+** Cost is predictable. No per-lesson variable SME expense; the spine's cost is the Opus and cross-check spend already budgeted at generation time.
- **+** Subsequent revisions of the methodology, the spine, or the gates are versioned in code and ADR, not in an offline reviewer's notes. Auditability improves.
- **−** First-cohort tail risk on factual errors that pass all seven gates and both cross-checks. Mitigations: the citation_bind anti-fabrication anchor (catches fabricated references — the dominant failure mode); the iteration cap surfacing generator-quality issues; the first-cohort feedback channel as the operational closer. The platform's stance to a regulator or institutional buyer asking "who reviewed this?" is the spine's audit trail (`lesson_review_events`, the per-lesson `<slug>.validation.json`), not a named human reviewer.
- **−** Currency is acknowledged as an open gap. A lesson generated against the model's training-cutoff knowledge can be stale against a primary source amended after the cutoff. The currency-tracking layer is the planned closer; it is out of scope for v1.1 and is a post-launch build.
- **−** Marketing copy that asserts "credentialed examiner review" is now out of policy. Existing landing-page or course-description language must be reviewed against this ADR before launch.
- **−** `docs/RUNBOOK-course-generation.md` step 6 ("SME review") is now inconsistent with v1.1 and is updated in the same commit as this ADR.
