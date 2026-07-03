# PLAYBOOK: The Next Courses (Cohort 1 Expansion)

**Set 2026-07-03.** The four courses after CAMS + CCAS, in order, with the case-supply reality and the shared case-bank program. Non-Bangladesh only (BD certs are a separate track).
**Read together with:** `docs/PRICING.md` (prices), `docs/ROLLOUT-simulator-format.md` (generate CGSS natively in format v1.2), `docs/RUNBOOK-course-launch.md` (promote/publish mechanics).

---

## The order, and why

| # | Course | Body | Why this position | Content reuse from existing catalog |
|---|---|---|---|---|
| 1 | **CGSS** (Global Sanctions Specialist) | ACAMS | Highest reuse, same buyer as CAMS, zero premium competitor, hot domain | Sanctions module, OFAC/EU/UK/UN sources, BNPP $8.97B, Standard Chartered, Binance, Tornado Cash, 50% Rule, facts-pack entries |
| 2 | **CFE** (Certified Fraud Examiner) | ACFE | Biggest TAM on the list | CAMS Module 10 (fraud/bribery/tax), FTX, Rimasauskas BEC, 1MDB |
| 3 | **CDCS** (Documentary Credit Specialist) | LIBF | Founder domain authority (trade finance), scaffold exists in repo, incumbents dated | Dev CDCS placeholder exists; ICC-text IP discipline already in the methodology |
| 4 | **CFCS** (Financial Crime Specialist) | ACFCS | Rounds out the fincrime-stack brand | Nearly everything in CAMS + CFE |

**Gate between builds:** start CGSS whenever; gate CFE/CDCS/CFCS on ~25 paid enrollments across the live catalog. A six-course catalog with zero testimonials sells like a two-course one.

**Skip (and why):** FRM (quant, Schweser owns it), ICA diplomas (coursework-assessed, no mock-exam fit), CTFP (certifying body is ICC itself, the IP we must avoid), CTP/SCR/CITF/Islamic Finance (off-brand or too small for cohort 1).

## Case supply, honestly, per course

- **CAMS:** effectively unlimited (DOJ, FinCEN, OFAC, FCA final-notice archive, AUSTRAC, NYDFS, SEC). 500+ usable matters.
- **CGSS:** rich. OFAC publishes EVERY enforcement action/settlement (complete archive + 15-30/yr), DOJ evasion prosecutions, OFSI growing. 150-300 usable.
- **CFE:** richest. DOJ fraud releases + SEC litigation releases = thousands. NEVER use ACFE's own case write-ups (their IP); public records only.
- **CFCS:** the CAMS + CFE pool.
- **CDCS: the honest exception.** Not an enforcement domain; its "cases" are court judgments on documentary-credit disputes (a few dozen pedagogically clean ones). That is fine because CDCS pedagogy is document EXAMINATION: constructed document sets are legitimate and standard (the real exam's own document sets are fictional). Rule: court judgments get the verified-case treatment; practice document sets are clearly labeled constructed exercises. No fabrication problem because nothing pretends to be real.

## The case-bank program (the "100+ verified cases" plan)

Goal: rotating, verified case files so retakes see different cases, and every new course starts with ammunition.

- **One shared bank, tagged** by course(s), module concepts, jurisdiction, and case type. Cases reuse across courses (Danske: CAMS+CFCS; Bitfinex: CCAS+CAMS; BNPP: CGSS+CAMS).
- **Supply lanes:** DOJ press releases + filings, OFAC enforcement actions, FinCEN assessments, FCA final notices, AUSTRAC, SEC/CFTC, NYDFS, court judgments (CDCS).
- **Per-case cost is verification, not discovery:** every case gets the facts-pack discipline (amounts/dates/dispositions pinned to primary sources) plus pedagogical mapping (which concepts, where the 3 decision points sit). Same lane as lesson fidelity work.
- **Targets:** extract the ~20+ already-verified cases living inside existing lessons first; then 3-5 per module (~40 total) within weeks; grow toward 100+ as a rolling background program (a few per week).
- **Storage:** start as artifact JSONs matching the `case-file` spec (`CaseFileStep[]` + citations); promote to a DB table when the player needs runtime rotation.
- **Hard rule:** never generate case facts with an LLM for variety. Verified public record or clearly-labeled constructed exercise; nothing in between.

## Generation notes for the next course (CGSS first)

1. **Inline generation only** (the Claude session, one lesson per turn) — never the OpenRouter API path. Standing rule.
2. **Format v1.2 first:** revise the generation methodology (ADR + version bump) so CGSS lessons are BORN in the simulator format. See ROLLOUT doc, "The factory change".
3. **Blueprint verification before outline:** confirm the CGSS exam structure (question count, duration, domains, weights) against the ACAMS candidate handbook, the way CCAS was verified (see `generated/ccas/BLUEPRINT.md` pattern).
4. **Facts-pack additions:** sanctions currency items (current OFAC guidance editions, 50% Rule wording, UK OFSI/FCDO split, UNSCR snapback status) verified and dated before generation starts.
5. **Cross-check discipline unchanged:** 7 deterministic gates + dual-lane Codex per lesson; assessment bank per module with its own cross-check; quiz-integrity rules baked in at generation.
6. **Promote/publish:** follow `docs/RUNBOOK-course-launch.md` (the CCAS launch is the template, including its two pre-flight traps).
