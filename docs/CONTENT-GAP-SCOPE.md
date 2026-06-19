# Content-Gap Scope — closing the CAMS coverage gap (Domain D + Domain A)

**Drafted:** 2026-06-19, for Ripon's sign-off. Closes the coverage gap found against the real (AFC-rebranded) CAMS blueprint — see `CAMS-EXAM-BLUEPRINT.md`. The current 40 lessons cover **B + C well, A partially, D barely.** This scopes the new teaching to fix that.

**Approach (recommended):** *add* content, don't re-architect. The existing 40 lessons are cleared and map cleanly to A/B/C. Add **2 new modules (~9 lessons)** + fold small enrichments into existing lessons, then **re-tag everything to the four official domains (A/B/C/D)** so questions and mocks assemble to the real blueprint. Each new lesson runs the *same* spine: scene-based, primary-source-grounded, 7 deterministic gates + Codex methodology + fidelity cross-check, inline generation — the discipline that got the 40 cleared.

---

## New Module 9 — Tools and Technologies to Fight Financial Crime (Domain D · 20% · 15 tasks)

The real gap. The course teaches monitoring/screening as *concepts and regulation*; this module teaches the **tooling**. Nice tie-in: it re-angles enforcement cases the course already teaches (Commerzbank, Westpac/LitePay, Standard Chartered) through the *technology* lens, so students meet familiar failures from a new angle.

| # | Lesson | Covers (D tasks) | Candidate deep case |
|---|---|---|---|
| 9.1 | **The AFC technology landscape & the build/buy decision** | 1, 2, 14, 15 — tool map across the customer lifecycle; friction vs control; tool selection & integration; operational effectiveness; RBA resource prioritization | a TM/vendor under-investment failure (e.g. a "the tool wasn't fit for the risk" notice) |
| 9.2 | **Identity & onboarding technology** | 3, 4 — digital onboarding, E-KYC, digital identity, biometrics/liveness/facial recognition, geolocation; external data (credit agencies, BO registers, adverse media, criminal records, gov ID) | a digital-onboarding / synthetic-identity failure |
| 9.3 | **Screening systems: sanctions, watchlists, fuzzy matching & adverse media** | 5, 6, 8 — name/customer screening, list management, fuzzy logic, match scoring, recall vs precision, adverse-media screening, AI/ML in screening | **Standard Chartered / Commerzbank** screening-tool decay (re-angled to tooling) |
| 9.4 | **Transaction-monitoring systems: rules, scenarios, thresholds & model risk** | 7, 9 — rules-based TM, segmentation, scenario coverage, threshold setting, ATL/BTL statistical testing, tuning, **model risk management**; payment screening (SWIFT, blockchain) | **Westpac / LitePay** scenario-coverage gap (re-angled to model/scenario design) |
| 9.5 | **The shift to AI/ML, network analytics & investigation tooling** | 10, 11, 12, 13 — rules→AI/ML transition, ML detection, **network/link analysis**, open-source & automation investigation tools, privacy/data-protection technology | a modern analytics deployment or a privacy-vs-screening tension |

*5 lessons. The deep-case challenge here is real — a tooling domain is harder to anchor to a named enforcement matter than a statute is — so most anchor to enforcement actions where a **tool/model failure** was the finding (the course already owns several).*

---

## New Module 10 — The Broader Financial-Crime Landscape (Domain A additions · part of the 30%)

Domain A is "**Financial** Crime," not just ML — it explicitly names fraud, bribery & corruption, and tax evasion, plus sectors we under-cover.

| # | Lesson | Covers (A tasks) | Candidate deep case |
|---|---|---|---|
| 10.1 | **Fraud and the fraud–AML nexus (FRAML)** | 1 (fraud) — fraud typologies (identity, payment, APP/authorized-push-payment, investment, BEC), fraud as predicate, fraud/AML convergence | a major APP-fraud or BEC enforcement/recovery matter |
| 10.2 | **Bribery and corruption (ABC)** | 1 (ABC) — FCPA, UK Bribery Act, corruption typologies, facilitation payments, the kleptocracy/PEP link | a clean FCPA matter (e.g. Siemens / Odebrecht / a recent settlement) |
| 10.3 | **Tax evasion and financial crime** | 1 (tax evasion) — tax evasion as predicate/FC, the AML–tax nexus, CRS/FATCA, offshore structuring | the Swiss-bank US tax cases (UBS / Credit Suisse) |
| 10.4 | **Sector risk deep-dives: insurance, gaming, MSBs/PSPs/ecommerce & accountants** | 10, 11, 13, 17 — the under-covered sectors at risk-indicator level | sector-specific enforcement (e.g. a casino AML case) |

*4 lessons. The existing course already covers VASPs, real estate, correspondent banking, TBML, PEPs, and TCSPs/gatekeepers well — this fills only the genuinely thin parts.*

---

## Fold-in enrichments (no new lessons — targeted additions to existing cleared lessons)

Small B/C items the blueprint names that we touch lightly. Add a scene or tighten existing scenes rather than new lessons:

- **Governance module (Module 7):** risk appetite statement (RAS); KPIs/KRIs/management information for board oversight.
- **Investigation/reporting (Module 3) & national frameworks (Module 6):** FinCEN **314(a)/314(b)**, **Regulation (EU) 2024/1624**, **COSMIC (Singapore)** information-sharing; vendor/insider due diligence.
- **FATF/frameworks (Module 1):** public-private partnerships (PPPs), data/intelligence sharing, and the "other laws" framing (data privacy, ESG, consumer protection, financial inclusion).

*(These touch already-cleared lessons, so each edit re-runs that lesson's gates + a Codex re-check — budget a light pass, not a regeneration.)*

---

## Also on the critical path (engineering, not content)

- **Multi-select question support.** The real exam uses multiple-*selection* items; the question bank schema + mock taker are single-answer only. Needed before mocks are faithful. (Separate from this content scope — flagging so it's sequenced.)

---

## Effort & sequence

- **~9 new lessons** (5 + 4) at the same per-lesson cost as the 40 just cleared (generate → 7 gates → Codex methodology+fidelity → fix-iterate). Smaller than the batch just finished; bounded.
- **+ light enrichment pass** on ~4 existing lessons.
- Then: re-tag all lessons + questions to A/B/C/D → build the A/B/C/D coverage matrix → deepen the question bank to 1,000+ (300/200/300/200) → mocks → real-candidate pilot.

**Recommended order:** Module 9 (Domain D — the biggest gap) first → Module 10 (Domain A) → fold-in enrichments → re-tag → question bank. Domain D first because it's the largest blind spot and the hardest content, so it sets the pace.

## Open questions for Ripon

1. **2 new modules + re-tag**, vs. a fuller re-architecture around A/B/C/D? (Recommend: add + re-tag — preserves the cleared 40.)
2. Deep cases for the RegTech lessons lean on tool-failure enforcement (some already in-course) — comfortable with that, or want net-new RegTech cases researched?
3. Multi-select support — build it now (so new questions can use it) or after the content?
