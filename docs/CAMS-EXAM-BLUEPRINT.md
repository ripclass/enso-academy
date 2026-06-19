# CAMS Exam Blueprint (LOCKED) — current ACAMS handbook

**Locked:** 2026-06-19 (CORRECTED — see note). **Source of truth:** ACAMS, *Candidate Handbook for the Certified Anti-Money Laundering Specialist Examination*, scraped in full from https://www.acams.org/en/media/document/6341 (firecrawl, 2026-06-19). The handbook references **Regulation (EU) 2024/1624** and **COSMIC (Singapore)**, confirming it is the current (2024+) edition.

> **⚠️ Correction note.** An earlier draft of this file locked a STALE blueprint (4 domains "Risks and Methods of Money Laundering 26% / Compliance Standards 25% / Compliance Programs 28% / Investigation 21%") sourced from cached search snippets. That is **superseded**. The current ACAMS handbook uses the **AFC-rebranded A/B/C/D structure below**. Always lock from the handbook itself, never search snippets.

## Exam format

| Property | Value |
|---|---|
| Questions | **120** — **multiple-choice AND multiple-selection** (i.e. some "select all that apply") |
| Duration | **3.5 hours** |
| Passing score | **75** |
| Guessing | No penalty — answer everything |
| Delivery | Pearson VUE (test center / online proctored) |

> **Implication for our engine:** the question bank and mock taker must support **multi-select** questions, not only single-best-answer. (Current bank + mock engine are single-answer only — this is a build item.)

## The four domains (verbatim names + weights)

| # | Domain (verbatim) | Weight | 120-q mock | 1,000-q bank |
|---|---|---|---|---|
| **A** | **Understanding the Risks and Methods of Financial Crime** | **30%** | 36 | 300 |
| **B** | **Global AFC Frameworks, Governance, and Regulations** | **20%** | 24 | 200 |
| **C** | **Building an Anti-Financial Crime Compliance Program** | **30%** | 36 | 300 |
| **D** | **Tools and Technologies to Fight Financial Crime** | **20%** | 24 | 200 |

"AFC" = Anti-Financial Crime. The exam scope is **broader than AML/CFT** — it explicitly covers **fraud, anti-bribery & corruption (ABC), tax evasion**, and a heavy **RegTech / tooling** domain.

## Domain task statements (the coverage matrix spine — from the handbook)

**A — Understanding the Risks and Methods of Financial Crime (30%)** — 17 tasks:
definitions of AML, CFT, sanctions, fraud, ABC, tax evasion · financial-system consequences of ML and AFC-violation risks · predicate crimes · FC risks by product across the banking sector · banking of high-risk sectors · how ML/TF/sanctions/bribery/tax-evasion/fraud manifest by product, customer, jurisdiction, channel · FC risks in other financial sectors · MSBs / PSPs / ecommerce · insurance · **VASPs / cryptoassets** · gaming & gambling · real estate · gatekeepers · trusts & company service providers · accountants.

**B — Global AFC Frameworks, Governance, and Regulations (20%)** — 13 tasks:
FATF role/function/regional bodies/recommendations · UN & sanctions regimes · regulators, law enforcement, FIUs · public/private/NGO bodies · regulatory & LE/FIU cooperation incl. cross-border · leveraging regulator/FIU reports for trends & typologies · special reports from non-government bodies · national & sectoral risk assessments → RBA · US & EU AFC regulations (ML + sanctions) · awareness across jurisdictions · public-private partnerships (PPPs) · private-sector collaboration & data/intelligence sharing · other laws (data privacy, consumer protection, ESG, conduct & ethics, financial inclusion).

**C — Building an Anti-Financial Crime Compliance Program (30%)** — ~26 tasks:
core pillars of an AFC program · policies vs standards vs procedures · governing committees · **three lines of defense + BSA officer / MLRO** · risk appetite statement (RAS) · KPIs/KRIs/MI for board oversight · designing/implementing/monitoring controls (KYC, CDD, EDD, employee DD, customer risk assessment, transaction monitoring) · FC reporting requirements by jurisdiction · controls for high-risk scenarios (conflict zones, dual-use goods, PEPs, complex ownership) · employee/vendor/third-party DD & insider threat · investigating unusual transactions & gathering info · documenting investigations / escalation / **SAR** within timelines · de-risking & financial inclusion · escalation & offboarding governance · responding to court orders/subpoenas/LE requests (**FinCEN 314(a)/314(b), Regulation EU 2024/1624, COSMIC Singapore**) · customer communication, RFIs, tipping-off · staff training & awareness · FC team structure & org placement · interaction with the front office · supporting functions (data privacy, cybersecurity, other risk).

**D — Tools and Technologies to Fight Financial Crime (20%)** — 15 tasks:
tools across the customer lifecycle · customer experience & friction balance · onboarding tech (digital onboarding, E-KYC, digital identity, facial recognition, liveness, biometrics, geolocation) · external data sources (credit agencies, BO registers, adverse media, criminal records, gov ID checks) · **name/customer screening & sanctions lists** (UN, OFAC, EU, watchlists) · adverse-media screening + AI/ML · transaction/payment screening (SWIFT, blockchain) + AI/ML · batch sanctions screening, **fuzzy logic**, list management · **rules-based transaction monitoring** (segmentation, scenario coverage, threshold setting, ATL/BTL statistical testing, **model risk management**, tuning) · transition rules→AI/ML · investigation tools (open-source, automation) · **network analysis** · privacy/data-protection tech · choosing & integrating AFC tools · operational effectiveness & RBA resource prioritization.

## Coverage of our current course against this blueprint (honest assessment)

The 40-lesson course was built to an **AML/CFT** frame (FATF, statutes, enforcement, CDD, sanctions, monitoring, governance). Mapping to the *current* AFC blueprint:

| Domain | Weight | Course coverage | Gap |
|---|---|---|---|
| **A** Risks & Methods of FC | 30% | **Partial** — strong on ML/TF/sanctions risks & typologies (Modules 0, 5; VASPs, real estate, TBML, correspondent, PEPs). Thin on the broader AFC scope: **fraud, anti-bribery & corruption, tax evasion**, and some sector specifics (insurance, gaming, MSBs/PSPs/ecommerce, accountants as a distinct risk). | Add fraud / ABC / tax-evasion risk + the thin sectors. |
| **B** Global AFC Frameworks | 20% | **Strong** — FATF, UN, FIUs, regulators, national frameworks (Modules 1, 6). | Minor: PPPs, data-sharing, ESG/data-privacy/financial-inclusion framing. |
| **C** Building an AFC Program | 30% | **Strong** — CDD/EDD/KYC, three lines, MLRO/BSA officer, SAR, escalation, training, governance, audit (Modules 2, 3, 7). | Minor: RAS, KPIs/KRIs, 314(a)/(b), EU 2024/1624, COSMIC, vendor/insider DD. |
| **D** Tools & Technologies | 20% | **WEAK — the real gap.** The course teaches monitoring/screening as *concepts and regulation*, not the **RegTech/tooling** this domain demands: digital onboarding/biometrics, AI/ML screening & monitoring, fuzzy logic, list management, ATL/BTL testing, model risk management, network analysis, tool selection. | A whole content strand is missing. |

**Bottom line:** ~50% of the exam (domains B + C) is well covered; domain A (30%) is half-covered; **domain D (20%) is largely uncovered.** You cannot write fidelity-grounded questions for content the course doesn't teach — so deepening the bank to 1,000+ requires **closing the content gap first**, especially Domain D (a RegTech strand) and the broader-financial-crime parts of Domain A.

## Revised plan (supersedes the prior 5-bucket and stale-4-domain plans)

1. Blueprint locked ✅ (this file).
2. Re-tag content + questions to **A/B/C/D**, not the old AML buckets.
3. **Close the content gap** — new lessons for Domain D (Tools & Technologies) and the fraud/ABC/tax-evasion + thin-sector parts of Domain A. (This is new teaching, generated to the same lesson spine + cross-check.)
4. Then generate the question bank to 1,000+ against the **A/B/C/D** coverage matrix (300/200/300/200), **including multi-select items**, per `QUESTION-BANK-STANDARD.md`.
5. Gate + Codex-fidelity per batch; Ripon spot-checks.
6. Assemble faithful 120-q mocks at 30/20/30/20; calibrate readiness.
7. Real-candidate pilot.

## Sources

- ACAMS — Candidate Handbook (CAMS): https://www.acams.org/en/media/document/6341 (full scrape: `.firecrawl/cams-handbook` / `hb2.md`, 2026-06-19)
- ACAMS — CAMS certification page: https://www.acams.org/en/certifications/cams-certification
- ACAMS — passing-score FAQ: https://www.acams.org/en/node/7941
