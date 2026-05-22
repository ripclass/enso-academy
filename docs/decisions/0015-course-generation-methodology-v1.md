# ADR 0015: Course Generation Methodology v1.0 Committed

**Date:** 2026-05-22
**Status:** Accepted

## Context

`docs/COURSE-GENERATION-PROMPT.md` was a placeholder ("the real prompt lives in the project owner's uploads"). It blocked design of the content-generation pipeline. The real methodology was authored separately by the project owner; this ADR records its commitment to the repo as the canonical v1.0 specification.

(The committing prompt — PROMPT-08.5 — predated the roadmap re-sequencing and referred to the content pipeline as "Prompt 9" and to this ADR as "0012". Both were stale: Prompts 9-11 shipped the student-model spine, and ADR 0012 is the student knowledge model. The prompt was executed in an adapted form — this ADR is 0015, and the stale "Prompt 9" references were dropped.)

## Decision

Commit the v1.0 methodology verbatim to `docs/COURSE-GENERATION-PROMPT.md`. It is the IP-defensibility commitment (ARCHITECTURE.md commitment #1 / FRAMEWORK.md moat 1) operationalized. It defines:

- The categorical prohibition on commercial study guides and on paraphrasing or restructuring certification-body publications — and, specifically, on building lessons from copyrighted **ICC rule text** (UCP 600, ISBP, ISP98, URDG, URC): these may be referenced by name and section but not reproduced or closely paraphrased.
- The hierarchy of allowed sources: primary regulatory texts; international standard-setter publications intended for public reuse; public-domain government enforcement actions; open-access academic work; news reporting as a pointer (never substance); original analysis; the RulHub knowledge graph.
- The construction method: map the discipline from primary sources, not from a certification's published syllabus.
- The lesson structure, citation discipline, language/tone rules, example sourcing, quiz design, and the nominative-fair-use course-naming and disclaimer requirements.
- A prose description ("What you should produce") of the content a generation run yields, and the quality-assurance requirements (source-attribution audit, SME review, update tracking).

## Alternatives considered

- **Author a fresh methodology for Enso's stack** — rejected; the v1.0 is internally consistent and reflects the owner's domain expertise. Re-authoring would lose intent.
- **Reference the methodology externally rather than commit it** — rejected; the methodology is the IP-defensibility moat. It belongs in the repo, versioned in git.

## Consequences

- + The IP-defensibility commitment is now operationally enforced, not aspirational.
- + The content-generation pipeline (a later prompt) can be designed against a real, committed methodology.
- + Any future change requires a deliberate versioned revision (v1.1, v1.2, …) with an ADR — no silent edits.
- − The methodology's "What you should produce" section is a **prose** description of *what* content to produce, not a machine/JSON output contract. The content-pipeline prompt must still define the structured output format that maps to the database schema.
- − The existing hand-seeded CDCS dev course and 32-question bank teach directly from UCP 600 article text — exactly what the methodology prohibits for generated content. They are dev placeholders to be replaced by methodology-compliant generated content. CDCS is the methodology's *hardest* IP case (copyrighted governing rules, thin free source base); CAMS is the cleaner first real course (abundant free primary sources, and the methodology's own worked example).
- − SME reviewers must be onboarded against this exact methodology; deviations in their work are measured against this baseline.
