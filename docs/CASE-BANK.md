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
- **On a DISAGREE, fix the CLASS of overclaim, not just the flagged phrase.** The gpt-5.5 gate surfaces one fidelity layer per round. In Batch 3, Rimasauskas took three rounds because each fix exposed the next latent overclaim (over-broad "everything in this file is from the enforcement record" scope, contradicted by the Google/Facebook public-reporting carve-out; scheme facts "conceded in the guilty plea" when the plea was to one wire-fraud count; "returned most of the money" inflating the record's "much"). After the first DISAGREE, grep the whole file for the same failure class (record quantifiers like "most/bulk/majority/entire", "conceded/admitted in the plea" attributions, "everything from the record" scope claims) and fix them together before re-gating, so the gate does not walk you through the class one layer at a time.

## Ledger

| Date | Batch | Cases | Gated | Notes |
|---|---|---|---|---|
| 2026-07-03 | Pilot (pre-bank) | 8 | 8 | Authored during the lesson-format pilot; backfilled into the bank 2026-07-04 (HSBC, Wachovia, Danske, BTC-e, Bitfinex, Colonial, Terra, Tether) |
| 2026-07-05 | Batch 1 (Lane A) | 12 new + 3 pilot repairs | 20/20 total | New: SCB 2012-2019, Westpac, 1MDB, BNPP 2014, Tornado Cash, Binance 2023, Welcome to Video, Silk Road/Zhong, Liberty Reserve, QuadrigaCX, FTX, NatWest/Fowler Oldfield. 4 gate rounds; 18 clean AGREE, 2 cleared-with-flag (tether, wachovia; scenario-framing residue). Pilot length tells fixed (terra/tether/wachovia). Bank pools per future course: CGSS 5, CFE 3, CFCS 8. |
| 2026-07-06 | Batch 2 (Lane A) | 12 new | 32/32 total | New: Kraken 2022, Chatex 2021, Ronin/Lazarus 2022, Coinbase 2023-24, Paxful 2025, Silvergate 2023, OKX 2025, KuCoin 2025, Bittrex 2022, Robinhood Crypto 2022, Helix 2020, Samourai 2024-25. Calibrated gate from round 1: 7 clean AGREE first pass, 5 fixed once (register slips only: apparent-violations hedge, conspiracy verb, constructed-desk elements in evidence cards), ALL 12 finished clean AGREE, zero flags. Per-course pools now: CAMS 20, CCAS 24, CGSS 8, CFCS 10, CFE 2. New learning: constructed-desk framing ("two of your customers hold exposure") belongs in decision PROMPTS, never in evidence cards, which claim the record. |
| 2026-07-06 | Batch 4 (Lane A, final cream) | 6 new | 50/50 total | New: Lafarge S.A. 2022 (first corporate section 2339B material-support plea, EDNY, USD 777.78m), Lebanese Canadian Bank 2011-2013 (Section 311 finding + same-day NPRM, used-car TBML, USD 102m settlement), Obiang 2014 (US civil forfeiture ~USD 30m + France criminal conviction final July 2021 + Riggs bank strand), Ripple Labs 2015 (FinCEN's first crypto enforcement, willful BSA violations, parallel USAO NDCal settlement), Coinbase John Doe summons 2016-2017 (civil IRS records summons, no penalty against Coinbase), De Nederlandsche Bank / Coinbase Europe Limited 2023 (EUR 3,325,000 for operating without the required registration). Deterministic audit 6/6 PASS first pass; Codex gate 5/6 clean AGREE first pass, Lafarge fixed ONCE for three objective overclaims cleared in one class-swept round (unsupported OFAC-licence specific; "DOJ intends to cite" over-attributing intent to DOJ when the source frames it as practitioner expectation; debrief attributing the Holder/knowledge-defence and conflict-zone rationalisations to the executives when the record supports only the security-cost framing). ALL 6 finished clean AGREE, zero cleared-with-flag. Both flagged-thin matters (Coinbase John Doe summons, DNB) had enough scene depth for 3 full steps and were built without padding; DNB drawn strictly from its clean deep-case scene despite its host lesson being fidelity-DISAGREE on unrelated MiCA/AMLR scenes. This closes the Lane A cream: Danske/Westpac/SCB/1MDB/Commerzbank recur across many lessons but are one-matter-one-case (already banked), and the remaining lesson worked-examples are constructed teaching exercises, not real matters. Per-course pools now: CAMS 31, CCAS 32, CGSS 10, CFCS 24, CFE 4. Bank at 50 gated (48 clean AGREE, 2 pilot-era cleared-with-flag). NEXT: (1) WIRE gated cases into lesson rotations through the builders when the lesson tree is uncontended; (2) Lane B fresh OFAC/DOJ research for CGSS (10) and CFE (4) depth before those course builds. |
| 2026-07-06 | Batch 3 (Lane A) | 12 new | 44/44 total | New: Bitzlato 2023, SUEX 2021, Coincheck 2018, Mt. Gox 2014, Ooki DAO 2022-23, ING 2018, Caesars 2015, UBS 2009, Siemens 2008, Rimasauskas 2019 (BEC vs Google/Facebook), Commerzbank 2020, Sonali (UK) 2016. Deterministic audit 12/12 PASS first pass. Codex gate: 10 clean AGREE first pass; Commerzbank fixed once (overgeneralized "each finding against the firm's own framework" narrowed to FCA principles + MLR, with own-framework only for the classification/EDD items); Rimasauskas fixed 3 rounds, each a DISTINCT objective overclaim the gate surfaced one layer at a time (see the new factory learning above). ALL 12 finished clean AGREE, zero cleared-with-flag. Register discipline held throughout: Bitzlato scope kept to "covered financial institutions" (special measure), not persons generally; SUEX kept to Treasury's published "over 40%" finding without claiming it IS the exposure method; Rimasauskas victims anonymized in evidence cards/reveals with Google/Facebook only in the debrief attributed to public reporting; Mt. Gox DOJ matter framed as pre-2014 charged conduct; UBS kept FATCA/CRS out of the 2009 conduct; Siemens parent pleaded to books-and-records while SEC alleged anti-bribery; Sonali MLRO left unnamed per the lesson. Per-course pools now: CAMS 28, CCAS 29, CGSS 9, CFCS 20, CFE 3. Bank at 44 gated (42 clean AGREE, 2 pilot-era cleared-with-flag). |
