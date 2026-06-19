# CAMS Exam Blueprint (LOCKED) — 6th Edition

**Locked:** 2026-06-19. **Source of truth:** ACAMS, *Certified Anti-Money Laundering Specialist (CAMS) 6th Edition Candidate Handbook* + the ACAMS CAMS certification page and pass-score FAQ. Retrieved 2026-06-19. This is the authoritative frame for the question bank and mock-exam assembly — do not deviate without re-verifying against the current ACAMS handbook.

> Re-verify on every ACAMS edition change. If ACAMS publishes a 7th edition, this file must be re-locked before generating to it.

## Exam format

| Property | Value |
|---|---|
| Questions | **120 multiple-choice** (theoretical knowledge + practical scenario-based) |
| Duration | **3.5 hours** (210 minutes) |
| Passing score | **75** — a **scaled** score, not a raw 75/120 (ACAMS scales; "75" is the scaled-score pass mark) |
| Delivery | Proctored (test center / online) |

> Scored vs. unscored split: the official line is "120 questions." ACAMS may include unscored pretest items within the 120; the handbook does not publish an exact scored/unscored count. We treat all 120 as the mock length. **(Confirm the scored/unscored detail from the handbook PDF when accessible — minor.)**

## The four content domains and weights

ACAMS-verbatim domain names; weights from the handbook. Domain I's weight is arithmetically forced (the other three are official ACAMS figures and sum to 74%).

| # | Domain (verbatim) | Weight | 120-q mock | 1,000-q bank target |
|---|---|---|---|---|
| **I** | **Risks and Methods of Money Laundering** | **26%** | ~31 | 260 |
| **II** | **Compliance Standards for Anti-Money Laundering (AML) and Combating the Financing of Terrorism (CFT)** | **25%** | 30 | 250 |
| **III** | **AML, CFT and Sanctions Compliance Programs** | **28%** | ~34 | 280 |
| **IV** | **Conducting and Supporting the Investigation Process** | **21%** | ~25 | 210 |

(120-q mock rounds to 31/30/34/25 = 120. Bank targets are the floor; over-generate so multiple non-overlapping faithful mocks can be assembled.)

## Mock-exam spec (what "faithful" means here)

A faithful CAMS mock = **120 questions, 3.5-hour no-pause timer, scaled-pass at 75%, drawn by the domain weights above** (31 / 30 / 34 / 25 across I/II/III/IV), with a realistic difficulty mix and scenario/recall blend. The mock engine + readiness thresholds already exist (lib/mock/); they assemble from `question_bank.domain` once every question carries one of these four domain values.

## Mapping our content to the blueprint

Questions carry a `domain` field set to **one of the four domains above** (not the older 5-bucket approximation). The 9 course modules supply the *content*; the `domain` tag drives *mock assembly*. Indicative module → domain mapping (refine against the handbook subdomains):

- **Domain I (Risks & Methods)** ← Module 0 (Foundations of ML/TF), Module 5 (High-Risk Categories & Typologies)
- **Domain II (Compliance Standards)** ← Module 1 (FATF / RBA), Module 4 (Sanctions — standards side), Module 6 (National Frameworks)
- **Domain III (Compliance Programs)** ← Module 2 (CDD/BO), Module 4 (Sanctions — program side), Module 7 (Governance, Audit, Compliance Function)
- **Domain IV (Investigation Process)** ← Module 3 (Suspicious Activity Monitoring & Reporting), Module 8 (Learning from Enforcement)

A single module can feed two domains; tag each question by the competency it actually tests, not by its source module.

## Migration of the existing 180 questions

The existing breadth-first bank (180 q, 185 glossary, position-balanced, distractor-substance done) used 5 approximate buckets. Before mock assembly, **re-map each existing question's `domain` to one of the four official domains** above (a mechanical re-tag — each question already carries a `domain` + `conceptTags`).

## Open follow-ups (for the coverage matrix, next step)

1. **Extract the subdomain / task-competency statements** under each of the four domains from the handbook PDF (currently 403-blocked on direct fetch; get via an authenticated/operator pull or firecrawl) — these drive the coverage matrix so the 1,000-q bank covers the whole blueprint, not just where questions are easy to write.
2. Confirm Domain I's printed weight = 26% and the scored/unscored split from the handbook directly (both currently inferred / partial).

## Sources

- ACAMS — CAMS Certification page: https://www.acams.org/en/certifications/cams-certification
- ACAMS — CAMS 6th Edition Candidate Handbook: http://files.acams.org/pdfs/CandidateHandbook/EN_CAMS6_Candidate_Handbook.pdf and https://www.acams.org/en/media/document/6341
- ACAMS — passing-score FAQ ("75 to pass the 6th Edition CAMS exam"): https://www.acams.org/en/node/7941
