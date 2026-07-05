# THE CASE BANK

**Set 2026-07-04.** The shared library of real, source-verified, interactive case files that powers every course. This is the program that turns "a couple hundred verified cases" from a plan into an asset. Read with `docs/PLAYBOOK-next-courses.md` (the case-bank program section) and `docs/SPEC-simulator-lesson-format.md` (the case-file scene spec).

## What a bank case is

One fully-authored, fully-verified `CaseFileCase` (the exact shape in `lib/lesson/scenes.ts`): 3 evidence-decision-reveal steps plus an intro and a debrief, built ONLY from facts already verified against primary sources. A bank case is course-agnostic content with metadata that says where it can serve. Lessons consume bank cases as case-file rotation alternates, so every lesson visit can draw a different real matter.

## Where it lives

- **Bank entries:** `generated/case-bank/cases/<id>.json` (gitignored content, like lessons). One file per case.
- **Tooling (tracked):** `scripts/_case-bank-audit.mjs` (deterministic gate), `scripts/_gate-case-brief.mjs` (builds the Codex brief per case).
- **Entry schema** (wrapper around the renderer's `CaseFileCase`):

```json
{
  "id": "wachovia-2010",
  "status": "draft | gated",
  "matter": "Wachovia Bank N.A. deferred prosecution agreement, March 2010",
  "jurisdictions": ["US"],
  "caseType": "correspondent_banking",
  "courses": ["cams", "cgss", "cfcs"],
  "conceptTags": ["correspondent_banking", "respondent_dd"],
  "sources": [{ "title": "...", "url": "https://..." }],
  "factBasis": "generated/cams/lessons/<slug>.json :: <scene title>",
  "verifiedAt": "2026-07-04",
  "gate": { "verdict": "AGREE", "model": "gpt-5.5", "date": "..." },
  "case": { "caseTitle": "The Wachovia file, 2010", "intro": "...", "steps": [...], "debrief": "..." }
}
```

## Supply lanes, in priority order

1. **Lane A, conversion (fastest, zero research risk):** the ~87 deep-case scenes already living in cleared CAMS/CCAS lessons. Facts are already primary-source-verified and Codex-cleared; the soldier extracts them VERBATIM from the named lesson JSON and only authors the interactive layer. Roughly 40+ distinct matters available.
2. **Lane B, fresh research:** new matters from the public archives (OFAC enforcement actions, DOJ releases and filings, FinCEN assessments, FCA final notices, AUSTRAC, SEC/CFTC, NYDFS, court judgments for CDCS). Requires a research soldier producing a quoted fact sheet with URLs BEFORE authoring. Used once Lane A thins or a course needs coverage Lane A lacks (CGSS will need OFAC-archive depth; CFE needs DOJ fraud depth).
3. **CDCS exception:** court judgments get the verified treatment; practice document sets are clearly labeled constructed exercises (see PLAYBOOK).

## The factory (per batch)

1. **SELECT (orchestrator):** pick matters against coverage needs (course, module concepts, jurisdiction spread), dedupe against the bank.
2. **AUTHOR (Opus/Sonnet soldier, one per 2-3 cases):** facts only from the named factBasis (Lane A) or fact sheet (Lane B); never invent an amount, date, count, or disposition; allegation-vs-admitted discipline (DOJ complaints allege, pleas admit, consent orders find). Match the register of the golden example (`generated/case-bank/cases/wachovia-2010.json`).
3. **DETERMINISTIC AUDIT (script):** schema, step shape, option integrity, decision length-tell, em-dashes, sources. Must pass before Codex is spent.
4. **CODEX GATE (gpt-5.5):** one dispatch per case, combined brief: factual fidelity (every specific claim in the case must be supported by the included fact basis) + decision quality (one clearly-best answer, plausible competing actions, no second defensible correct). AGREE or SPLIT-soft = gated; DISAGREE = fix and re-gate. `status: "gated"` + the verdict recorded in the entry.
5. **WIRE (script/coordination):** gated cases join lesson rotations. Two paths: (a) append to an existing case-file scene's `alternates` via its lesson builder + redeploy; (b) new lesson conversions (the teaching-method roll) pull from the bank instead of authoring inline. The bank is the shared interface between this program and the lesson-format roll; wiring into pilot lessons must go through the lesson BUILDERS (scripts/_build-pilot-*.js), never DB-only patches, because builders rebuild scene_data wholesale.

## The decision-quality standard (non-negotiable)

- Every step: evidence card (observed / source / inference / confidence) then a committed decision then the reveal. The confidence field states High/Medium and why.
- 4 options per decision, one clearly best; distractors are PLAUSIBLE COMPETING ACTIONS a real practitioner might take (the over-correction, the deferral, the mis-scoped responsibility), never strawmen.
- No length tell: the correct option may be the strictly longest in at most one decision per case.
- Correct option ids spread across a-d within a case; explanations refer to options by content, never letter.
- Zero em-dashes. Adult practitioner register. Reveals carry the real disposition with exact figures from the fact basis.

## Batch cadence and targets

- A batch = 9-12 cases (3-4 soldiers x 3 cases), one orchestrated session including gating. Lane A supports ~4-5 batches.
- Program target: 100+ gated cases before the CGSS build starts (CGSS lessons are born in format v1.2 and consume the bank), 200+ across the six-course catalog.
- Every batch ends with the audit summary + gate verdicts recorded in this doc's ledger below.

## Factory learnings (bake into every batch)

- **Feed the gate the WHOLE scene payload.** The first gate round produced ~40 false "unsupported" flags because the lesson excerpt omitted citation labels (which carry dates and dockets), slide items, and interactive scene content. Fixed in `_gate-case.mjs`; do not regress.
- **Scenario framing is not a fact claim.** Decision prompts construct hypothetical seats and distractors are wrong by design; the gate brief now says to hold evidence cards and reveals to strict record support, but not to flag scenario/distractor framing. Two pilot cases (tether, wachovia) were accepted cleared-with-flag on exactly this residue after 4 rounds (the asymptote rule).
- **Authors must copy citation metadata, never construct it.** The genuine round-1/2 catches were largely invented citation specifics (SDNY attributions, exact dates, case captions) and vivid-writing inflation ("nine-figure" for a ~USD 20m flow, allegation stated as fact, "most liquid" nobody sourced). The soldiers' briefs already say facts-verbatim; emphasize that CITATION TITLES AND DATES are facts too.
- **Backfilled/legacy entries need machine-readable factBasis paths** (generated/...json) or the gate reads no source and rejects everything.

## Ledger

| Date | Batch | Cases | Gated | Notes |
|---|---|---|---|---|
| 2026-07-03 | Pilot (pre-bank) | 8 | 8 | Authored during the lesson-format pilot; backfilled into the bank 2026-07-04 (HSBC, Wachovia, Danske, BTC-e, Bitfinex, Colonial, Terra, Tether) |
| 2026-07-05 | Batch 1 (Lane A) | 12 new + 3 pilot repairs | 20/20 total | New: SCB 2012-2019, Westpac, 1MDB, BNPP 2014, Tornado Cash, Binance 2023, Welcome to Video, Silk Road/Zhong, Liberty Reserve, QuadrigaCX, FTX, NatWest/Fowler Oldfield. 4 gate rounds; 18 clean AGREE, 2 cleared-with-flag (tether, wachovia; scenario-framing residue). Pilot length tells fixed (terra/tether/wachovia). Bank pools per future course: CGSS 5, CFE 3, CFCS 8. |
