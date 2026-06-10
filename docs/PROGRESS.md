# Enso Academy Progress Log

## 2026-06-10 — Module 1 complete via the inline-generation pipeline (8/40 CAMS lessons cross-cleared)

Generated all four Module 1 lessons inline (Claude session, no API) through the established rhythm — generate → deterministic gates (7/7) → Codex cross-check → fix fidelity → AGREE → review:
- `structure-of-the-40-recommendations` — deep case Standard Chartered 2012; AGREE after 1 fidelity-fix round.
- `risk-based-approach-as-operating-principle` — deep case Westpac/AUSTRAC 2020; AGREE after 2 rounds.
- `enterprise-wide-risk-assessment` — deep case ING Bank N.V./Dutch OM 2018; AGREE after 1 round.
- `customer-risk-rating-models` — deep case Commerzbank London/FCA 2020; AGREE after 1 round.

Pattern observations: methodology cross-check AGREE'd on the FIRST pass for every lesson (the citation-mechanics recalibration + facts pack hold); the fidelity pass caught a real, specific error on every lesson (entity names, R-number scope, statutory section pins, regulatory dates, current FATF wording) — 100% hit rate, which is the case for keeping it. Tooling added: `scripts/crosscheck-lesson.ts` (standalone Codex cross-check for inline lessons) + the `dispatchCodex` retry (recovered a transient flake in practice). Global framing applied per Ripon (deep cases span US/UK/Australia/Netherlands/Germany; Bangladesh as one worked example, not the centre). Codex usage quota hit twice and topped up — it is the binding throughput constraint for the remaining ~32 lessons.

## 2026-06-10 - Latest factual-fidelity re-audit of `customer-risk-rating-models` now clears publication

Re-reviewed the current user-supplied JSON for `customer-risk-rating-models` against the current FATF Recommendations page/PDF and Recommendation 12 text, the FCA Commerzbank AG Final Notice dated 17 June 2020, and the operator-maintained current facts reference.

- Verdict: `AGREE`.
- The earlier same-day blockers are fixed in the current artifact. `The risk factors in detail` now states the FATF Recommendation 12 foreign-vs-domestic / international-organisation distinction correctly, and `Deep case: Commerzbank London and the FCA (2020)` now uses the Final Notice's exact Relevant Period of `23 October 2012 to 29 September 2017`.
- No new hard blocker surfaced in this pass. The Commerzbank entity / penalty / date bundle remains correct (`Commerzbank AG (London Branch)`; `£37,805,400`; Final Notice dated `17 June 2020`), and the lesson's FATF / EBA framing is acceptable for publication on factual fidelity.

## 2026-06-10 - Factual-fidelity audit of `customer-risk-rating-models` does not yet clear publication

Reviewed the current user-supplied JSON for `customer-risk-rating-models` against the current FATF Recommendations page/PDF and Recommendation 12 text, the FCA Commerzbank AG Final Notice dated 17 June 2020, and the operator-maintained current facts reference.

- Verdict: `DISAGREE`.
- Blocking issue 1: `The risk factors in detail` overstates FATF Recommendation 12 by saying a customer or beneficial owner who is a PEP or close associate is, as such, engaging Recommendation 12's enhanced measures. FATF R.12 distinguishes foreign PEPs from domestic PEPs / persons entrusted with a prominent function by an international organisation; for the domestic / international-organisation category, measures (b) to (d) apply only in higher-risk business relationships, and that qualification also carries through to family members and close associates.
- Blocking issue 2: `Deep case: Commerzbank London and the FCA (2020)` misstates the enforcement-period chronology by describing the failings as running from `October 2012 to October 2017`. The FCA Final Notice defines the Relevant Period as **23 October 2012 to 29 September 2017**.
- No broader hard blocker surfaced in this pass. The Commerzbank entity / penalty bundle is otherwise right (`Commerzbank AG, London Branch`; `£37,805,400`; Final Notice dated `17 June 2020`), and the lesson's FATF / EBA framing is broadly sound if those two precision defects are corrected.

## 2026-06-10 - Methodology audit of `customer-risk-rating-models` clears under the narrowed v1.1 brief

Reviewed the current user-supplied JSON for `customer-risk-rating-models` against `docs/COURSE-GENERATION-PROMPT.md` v1.1 using the narrowed methodology scope already recorded in project memory.

- Verdict: `AGREE`.
- No new methodology blocker surfaced. The artifact stays within allowed/public source types for this audit, every reading scene carries a `citations[]` array, `Deep case: Commerzbank London and the FCA (2020)` satisfies the named public-enforcement deep-case requirement, the scene `teachesConcepts` remain substantively distinct, the recalibration quiz stays scenario-based rather than certification-format mimicry, and the register remains adult-professional.

## 2026-05-30 - Latest factual-fidelity re-audit of `enterprise-wide-risk-assessment` now clears publication

Re-reviewed the current user-supplied JSON for `enterprise-wide-risk-assessment` against the current FATF Recommendations page/PDF, the EBA ML/TF Risk Factors Guidelines, Basel's AML/CFT risk-management guidance, the Dutch OM ING settlement/public-facts record, and official/public Bangladesh Bank/BFIU materials.

- Verdict: `AGREE`.
- The earlier same-day blockers are fixed in the current artifact. `Deep case: ING and the Dutch settlement (2018) — when the enterprise risk picture fails` now correctly names **ING Bank N.V.** as the settling bank, and `Worked example: scoring a mid-tier commercial bank` no longer overstates the Bangladesh source with unsupported `board-approved` wording.
- No new factual-fidelity blocker surfaced in this pass. Preserve the current FATF R.1 / EBA/GL/2021/02 / Basel framing, the ING amount/date/entity bundle (`4 September 2018`, `€775 million = €675 million fine + €100 million disgorgement`), and the narrower Bangladesh Circular 26 risk-assessment wording if the artifact is revised again.

## 2026-05-30 - Repeat methodology audit of `enterprise-wide-risk-assessment` reconfirms the narrowed-v1.1 `AGREE` verdict

Re-reviewed the current user-supplied JSON for `enterprise-wide-risk-assessment` against `docs/COURSE-GENERATION-PROMPT.md` v1.1 under the same narrowed methodology boundary already recorded in project memory.

- Verdict: `AGREE`.
- No new methodology blocker surfaced. The artifact still stays within allowed/public source types for this audit, every reading scene still carries a `citations[]` array, the ING 2018 scene still satisfies the required named public-enforcement deep-case requirement, the scene `teachesConcepts` remain substantively distinct, the quiz remains scenario-based, and the register remains adult-professional.

## 2026-05-30 - Factual-fidelity audit of `enterprise-wide-risk-assessment` does not yet clear publication

Reviewed the current user-supplied JSON for `enterprise-wide-risk-assessment` against the current FATF Recommendations page/PDF, the EBA ML/TF Risk Factors Guidelines, Basel's AML/CFT risk-management guidance, the Dutch OM ING settlement/public-facts record, and available Bangladesh Bank/BFIU public materials.

- Verdict: `DISAGREE`.
- Blocking issue 1: `Deep case: ING and the Dutch settlement (2018) — when the enterprise risk picture fails` names the wrong legal entity. The Dutch OM settlement statement, transaction agreement, and `Feitenrelaas onderzoek Houston` public record identify **ING Bank N.V.** / `ING NL` as the settling bank; the lesson says **ING Groep N.V.** agreed the settlement.
- Blocking issue 2: `Worked example: scoring a mid-tier commercial bank` overstates the Bangladesh rulebook by saying **BFIU Master Circular No. 26** requires a `documented, board-approved risk assessment`. The accessible cited public materials support the bank risk-assessment requirement, but this pass could not substantiate the added `board-approved` formulation from the cited source.

## 2026-05-30 - Methodology audit of `enterprise-wide-risk-assessment` clears under the narrowed v1.1 brief

Reviewed the current user-supplied JSON for `enterprise-wide-risk-assessment` against `docs/COURSE-GENERATION-PROMPT.md` v1.1 using the narrowed methodology scope now recorded in project memory.

- Verdict: `AGREE` on methodology.
- Why: with citation mechanics explicitly left to `citation_bind`, the lesson clears the remaining methodology dimensions. It stays on allowed source types (FATF/Basel/EBA/BFIU materials, public enforcement actions, and original analysis), every reading scene carries a `citations[]` array, `Deep case: ING and the Dutch settlement (2018) — when the enterprise risk picture fails` is a valid named public-enforcement deep case, the scene `teachesConcepts` are substantively distinct, the quiz is scenario-based rather than certification-format mimicry, and the tone remains adult-professional.

## 2026-05-30 - Latest factual-fidelity re-audit of `risk-based-approach-as-operating-principle` now clears publication

Re-reviewed the current user-supplied JSON for `risk-based-approach-as-operating-principle` against the current FATF Recommendations page/PDF, the FATF banking-sector RBA guidance page, current eCFR Title 31 CTR provisions, AUSTRAC's current IFTI guidance, and the AUSTRAC/Federal Court Westpac public record.

- Verdict: `AGREE`.
- The earlier same-day blockers are resolved in the current artifact. `Deep case: Westpac and AUSTRAC (2020)` now correctly distinguishes suspicious-transaction reporting from Australia's amount-independent IFTI reporting regime, `Risk-based versus rule-based, concretely` now pins CTR aggregation and bank exempt-person relief to `31 CFR §§ 1010.313` and `1020.315` rather than overloading `§ 1010.311`, and `Where the RBA comes from: Recommendation 1 and its Interpretive Note` now uses the current FATF `proportionate` wording.
- No new factual-fidelity blocker surfaced in this pass; preserve the current Westpac / CTR / R.1 wording if the artifact is revised again.

## 2026-05-30 - Codex cross-check methodology audit of `risk-based-approach-as-operating-principle` again clears under v1.1

Re-audited the current user-supplied JSON for `risk-based-approach-as-operating-principle` against `docs/COURSE-GENERATION-PROMPT.md` v1.1 under the narrowed methodology boundary already adopted in project memory.

- Verdict: `AGREE`.
- No new methodology blocker surfaced. The artifact stays within allowed/public source types for this audit, every reading scene carries a `citations[]` array, `Deep case: Westpac and AUSTRAC (2020)` remains a valid named public-enforcement deep case, the scene `teachesConcepts` remain substantively distinct, the quiz stays scenario-based rather than certification-format mimicry, and the register remains adult-professional.
- Preserve the review boundary: do not relitigate citation-mechanics issues here, because `citation_bind` owns granularity and lesson-pool locatability checks.

## 2026-05-30 - Latest factual-fidelity re-audit of `risk-based-approach-as-operating-principle` finds a different blocker set than the earlier same-day note

Re-reviewed the current user-supplied JSON for `risk-based-approach-as-operating-principle` against the current FATF Recommendations text, eCFR Title 31, and AUSTRAC's current IFTI guidance.

- Verdict: `DISAGREE`.
- Confirmed fixed in this pass: the earlier same-day `Westpac/R.20` blocker no longer appears in the current artifact. The scene now correctly distinguishes suspicious-transaction reporting from Australia's IFTI reporting regime.
- Current blocking issue 1: `Deep case: Westpac and AUSTRAC (2020) — risk not assessed, controls not defensible` now introduces a different legal-description error by calling Australia's IFTI regime `a national threshold-reporting obligation`. AUSTRAC's own guidance requires IFTI reporting regardless of amount, and its public examples include transfers of A$5,000 and A$2,000.
- Current blocking issue 2: `Risk-based versus rule-based, concretely` is still not section-precise on the U.S. CTR rule. The scene attributes the aggregation and exemption mechanics to `31 CFR § 1010.311`, but aggregation is in `31 CFR § 1010.313` and bank exempt-person relief is in `31 CFR § 1020.315`.
- Current precision issue 3: `Where the RBA comes from: Recommendation 1 and its Interpretive Note` uses the superseded `commensurate` wording for R.1. The current FATF text, as amended in February 2025 and consolidated in the October 2025 edition, says measures should be `proportionate` to the risks identified.

## 2026-05-30 - Repeat methodology cross-check of `risk-based-approach-as-operating-principle` reconfirms the narrowed-v1.1 `AGREE` verdict

Re-audited the current user-supplied JSON for `risk-based-approach-as-operating-principle` against `docs/COURSE-GENERATION-PROMPT.md` v1.1 under the narrowed methodology scope already set in project memory.

- Verdict: `AGREE` on methodology again.
- No new methodology blocker surfaced. The artifact still stays on allowed/public source types, every reading scene carries a `citations[]` array, `Deep case: Westpac and AUSTRAC (2020)` remains a valid named public-enforcement deep case, the scene `teachesConcepts` remain substantively distinct, the quiz remains scenario-based, and the register remains adult-professional.
- The open publication issues remain factual-fidelity issues rather than methodology issues; do not relitigate citation mechanics in this pass.

## 2026-05-30 - Factual-fidelity audit of `risk-based-approach-as-operating-principle` does not yet clear publication

Reviewed the current user-supplied JSON for `risk-based-approach-as-operating-principle` against current FATF, FFIEC/FinCEN, and AUSTRAC/Federal Court public-source materials.

- Verdict: `DISAGREE`.
- Blocking issue 1: `Deep case: Westpac and AUSTRAC (2020) — risk not assessed, controls not defensible` misstates the FATF mapping by saying `Recommendation 20 required timely reporting of the transactions to the FIU`, and the quiz explanation repeats that `late reporting separately engages Recommendation 20`. FATF Recommendation 20 is the suspicious-transaction reporting rule; Westpac's 19.5 million IFTI failures were Australian statutory international-funds-transfer reporting breaches, not FATF R.20 as such.
- Blocking issue 2: `Risk-based versus rule-based, concretely` overstates `31 CFR § 1010.311` by saying a financial institution must file a CTR for `any cash transaction exceeding US$10,000`. The rule is narrower and more conditional: it covers specified transactions in currency, includes aggregation mechanics, and operates with exceptions/exemptions. As written, the lesson's scope summary is too broad for publication.

## 2026-05-30 - Methodology audit of `risk-based-approach-as-operating-principle` clears under the narrowed v1.1 brief

Reviewed the current user-supplied JSON for `risk-based-approach-as-operating-principle` against `docs/COURSE-GENERATION-PROMPT.md` v1.1 using the narrowed methodology scope now recorded in project memory.

- Verdict: `AGREE` on methodology.
- Why: with citation mechanics explicitly left to `citation_bind`, the lesson clears the remaining methodology dimensions. It stays on allowed source types (FATF/EBA/Basel/statutes/public enforcement actions plus original analysis), every reading scene carries a `citations[]` array, `Deep case: Westpac and AUSTRAC (2020)` is a valid named public-enforcement deep case, the scene `teachesConcepts` are substantively distinct, the quiz is scenario-based rather than certification-format mimicry, and the tone remains adult-professional.

## 2026-05-30 - Latest factual-fidelity re-audit of `structure-of-the-40-recommendations` now clears publication

Re-reviewed the current user-supplied JSON for `structure-of-the-40-recommendations` against the operator-maintained facts pack plus current FATF and Standard Chartered public-source materials.

- Verdict: `AGREE`.
- Why: the earlier blockers recorded the same day are resolved in the current artifact. `Section D: preventive measures (R.9-23)` now correctly says not every Recommendation in that block has an Interpretive Note, the unsupported `perhaps a third of the standard` claim is gone from `Where the rule actually lives`, and the Standard Chartered deep-case now correctly distinguishes broader OFAC country-sanctions programs from FATF Recommendations 6 and 7.
- No new factual-fidelity blocker surfaced in this pass; the lesson is acceptable for publication on this dimension.

## 2026-05-30 - Repeat methodology cross-check of `structure-of-the-40-recommendations` reconfirms the narrowed-v1.1 `AGREE` verdict

Re-audited the current user-supplied JSON for `structure-of-the-40-recommendations` against `docs/COURSE-GENERATION-PROMPT.md` v1.1 under the current review boundary.

- Verdict: `AGREE` on methodology again.
- Why: no new methodology blocker surfaced beyond what is already captured in project memory. The lesson still stays within allowed source types, every reading scene still carries `citations[]`, the Standard Chartered 2012 scene still satisfies the deep-case requirement, the scene `teachesConcepts` remain distinct, the quiz remains scenario-based, and the tone remains adult-professional.

## 2026-05-30 - Factual-fidelity audit of `structure-of-the-40-recommendations` does not yet clear publication

Reviewed the current user-supplied JSON for `structure-of-the-40-recommendations` against the operator-maintained facts pack plus current FATF and U.S. enforcement materials.

- Verdict: `DISAGREE`.
- Blocking issue 1: `Section D: preventive measures (R.9-23)` inaccurately says each Recommendation in R.9-23 has an Interpretive Note carrying the operational detail. FATF's current Recommendations do not include INRs for every Recommendation in that block; the published text, for example, jumps from INR.8 to INR.10 and from INR.18 to INR.20.
- Blocking issue 2: `Where the rule actually lives` uses an unanchored numeric claim by saying a bank that reads only the Recommendations has read `perhaps a third of the standard`. That proportion is not tied to any cited source and should be removed or sourced.
- Additional precision issue: `Deep case: Standard Chartered and the architecture of competent authorities (2012)` over-reads the FATF mapping by characterising OFAC's role in this resolution as the U.S. system's `R.6/R.7` targeted-financial-sanctions function, even though the 2012 matter concerned broader OFAC country-sanctions programs involving Iran, Sudan, Libya, and Burma.

## 2026-05-30 - Methodology audit of `structure-of-the-40-recommendations` clears under the narrowed v1.1 brief

Reviewed the current user-supplied JSON for `structure-of-the-40-recommendations` against `docs/COURSE-GENERATION-PROMPT.md` v1.1 using the narrowed methodology scope now recorded in project memory.

- Verdict: `AGREE` on methodology.
- Why: with citation mechanics explicitly delegated to `citation_bind`, the lesson clears the remaining methodology dimensions. It stays on allowed source types (FATF/BFIU/public enforcement actions plus original analysis), every reading scene carries a `citations[]` array, the Standard Chartered 2012 scene is a valid named public-enforcement deep case, the scene `teachesConcepts` are substantively distinct, the quiz is scenario-based rather than certification-format mimicry, and the tone remains adult-professional.

## 2026-05-30 - Current factual-fidelity audit of the Danske deep-case global-architecture lesson is now mostly clear, with only soft residual precision issues

Reviewed the current user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against the operator-maintained facts pack plus current FATF, APG, and Egmont public materials.

- Verdict: `SPLIT`.
- Confirmed fixed in this pass: the earlier FATF-listing, MONEYVAL-scope, FinCEN-establishment, and duplicate-FSRB defects are resolved in the current artifact.
- Residual issue 1: `Why an Architecture, Not a Single Rulebook` overstates the 2022 FATF Methodology as the sole basis for both mutual evaluations and public listing. FATF's own 2022 Procedures page says the ICRG/listing process runs under the Procedures read with the Methodology and Universal Procedures.
- Residual issue 2: `Synthesis: What the Architecture Asks of You` says a BFIU circular `implements an Immediate Outcome`, which collapses standards and assessment benchmarks. Immediate Outcomes are FATF effectiveness-assessment measures, not domestic legal rules to implement.
- Residual issue 3: `Deep Case: The Danske Bank Estonia Branch (2007-2015) and Its 2022 Resolution` uses the Bruun & Hjejle-derived scene-setting numerics (`EUR 200 billion`, `~10,000`, `~15,000`) without citing that report in the scene citation array, so those numbers do not currently trace to a cited source.

## 2026-05-30 - Current methodology audit of the Danske deep-case global-architecture lesson clears under the narrowed v1.1 brief

Reviewed the current user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against `docs/COURSE-GENERATION-PROMPT.md` v1.1 using the narrowed methodology scope now recorded in project memory.

- Verdict: `AGREE` on methodology.
- Why: with citation mechanics explicitly deferred to the deterministic `citation_bind` gate, the remaining methodology dimensions clear. The lesson stays on allowed source types (FATF/APG/Egmont/statutes/public enforcement actions plus original analysis), every reading scene carries a `citations[]` array, the Danske Bank Estonia scene is a valid real public-enforcement deep case, the scene `teachesConcepts` are substantively distinct, the quiz is scenario-based rather than certification-format mimicry, and the tone remains adult-professional.

## 2026-05-30 - Current factual-fidelity audit of the Bangladesh-trajectory global-architecture lesson still does not clear publication

Reviewed the current user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against the operator-maintained facts pack plus current FATF, MONEYVAL, FinCEN, and Egmont public materials.

- Verdict: `DISAGREE`; still not publishable on factual fidelity.
- Confirmed fixed in this pass: the earlier FATF/APG chronology, Bangladesh MER-rating, and U.S./UK supervisory-split issues now look corrected in the current artifact.
- Current blocking issue 1: `Technical Compliance vs. Effectiveness` overstates FATF listing mechanics by saying effectiveness ratings, not technical-compliance scores, drive jurisdictions onto the grey/black lists. FATF's increased-monitoring materials say ICRG considers strategic deficiencies in both technical compliance and effectiveness.
- Current blocking issue 2: `FATF and the FSRBs: Standard-Setting and Peer Review` still overstates MONEYVAL's scope by describing it as covering Council of Europe states generally. FATF's MONEYVAL page says 19 Council of Europe member states are evaluated by FATF and 27 by MONEYVAL.
- Current blocking issue 3: `Financial Intelligence Units and the Egmont Group` misstates FinCEN's legal basis by saying it was established under the BSA / 31 CFR Chapter X. FinCEN as a Treasury bureau is established by 31 U.S.C. § 310; the BSA framework is administered under delegated Treasury authority.
- Additional precision issue: `The Four Layers of the AML/CFT Architecture` repeats `GAFILAT` in the FSRB list while claiming to name nine FSRBs.

## 2026-05-30 - Methodology audit boundary confirmed: current global-architecture lesson clears v1.1 once citation mechanics stay with `citation_bind`

Re-audited the current user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against `docs/COURSE-GENERATION-PROMPT.md` v1.1 using the narrowed methodology scope now recorded in project memory.

- Verdict: `AGREE` on methodology.
- Why: once citation granularity and lesson-pool locatability stay delegated to the deterministic gate, the current lesson is acceptable on the remaining methodology dimensions: allowed-source discipline, no commercial-prep / ICC-text leakage, a valid specific-public-matter deep case (Bangladesh APG trajectory), distinct scene `teachesConcepts`, scenario-based formative quiz design, and adult-professional register.

## 2026-05-29 — Spine hardened (citation overfitting fixed, 32k cap, dispatch retry); content track now blocked on Codex quota

Ran lesson 0.3 through the spine five times; each surfaced a different real issue, each fixed:
1. Capped on citation discipline → measured all four lessons through the project's own gates: the rejected 0.3 is at/above the AGREE'd baseline (PASSES pedagogy where gold-standard 1.1 FLAGs; citation_bind 2/21 unbound vs 1.2's 39/72 which Codex AGREE'd). **Codex was overfitting on citation mechanics.** Fix: the Codex methodology brief now DEFERS citation granularity/pool-locatability to the deterministic citation_bind gate; Codex keeps source-discipline/IP/deep-case/register + citation *accuracy* in the fidelity pass (commit d0db878).
2. JSON truncation → the citation-pooling requirement pushed a lesson past the 16k output cap; raised to 32k + stopReason guard (b005ce0).
3. Two genuine fidelity errors (US "FinCEN examines MSBs"; UK "FCA supervises DNFBPs") → added correct US/UK supervisory structure to the facts pack (f844ec6).
4. Codex dispatch flake → added a bounded retry on empty-output/spawn-error (6a5f2a8).
5. Persistent no-output → diagnosed: **Codex (gpt-5.4) hit its OpenAI usage quota** (resets ~May 30 01:06, or top up credits). Not content. The retry can't beat a hard quota.

Net: the pipeline is materially hardened and all fixes are committed (d53ef8b, b005ce0, d0db878, f844ec6, 6a5f2a8). Lesson 0.3 is at/above baseline by the gates; its automated cross-check validation is blocked only by the Codex quota. KEY operational finding: Codex is the content track's binding constraint — the 36-lesson `full` run needs a credit budget or it will quota-stall.

## 2026-05-29 - Latest factual-fidelity audit of the Bangladesh-trajectory variant: old methodology/Bangladesh-rating defects fixed, but supervisory-map scope still blocks publication

Reviewed the current user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against the operator-maintained facts pack plus current public-source supervisory materials. Verdict stayed `DISAGREE`.

- Confirmed fixed in this pass: the earlier FATF Methodology paragraph-pin / IO-mapping defects are corrected, and the Bangladesh deep-case now uses the right 2016 MER ratings (`R.6 = Compliant`, `IO.4 = Low`).
- Current blocking issue 1: `National supervisors and FATF Recommendations 26-28` and the slide `Three jurisdictions, three supervisory maps` still overstate FinCEN as the direct U.S. AML examiner/supervisor of MSBs and other non-bank financial institutions. FinCEN states that it does not itself examine financial institutions, and IRS holds delegated examination authority for certain institutions including MSBs.
- Current blocking issue 2: the same scene pair also collapses the UK AML supervisory perimeter into the FCA by saying the FCA supervises financial institutions and major DNFBPs under the MLRs 2017. The MLR regime is split across the FCA, HMRC, the Gambling Commission, and professional body supervisors; the current wording misstates who actually supervises much of the DNFBP sector.

## 2026-05-29 - Latest methodology re-audit of the current global-architecture JSON: disagreement still not resolved

Reviewed the current user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against `docs/COURSE-GENERATION-PROMPT.md` v1.1 again. Verdict stayed `DISAGREE`.

- Confirmed fixed/non-blocking in this pass: the mutual-evaluation scene and the Bangladesh-trajectory deep-case now look materially improved, and no new methodology blocker class surfaced.
- Current blocking issue 1: `Why a global architecture exists at all` and `The Financial Action Task Force: origin, mandate, composition` still miss the reading-scene citation bar. The opening scene introduces Egmont / FIU / supervisor architecture claims without scene-local support, and the FATF scene still leaves Global Network / APG-evaluation / public-listing cadence claims without clean name+section citations.
- Current blocking issue 2: `The Egmont Group: secure FIU-to-FIU information exchange` still does not cleanly pin the membership / ESW-access / suspension consequences. The citations remain page/document-level and rely on generic `documents/` links rather than locatable Charter / Principles provisions.
- Current blocking issue 3: Bangladesh authority-mapping locatability is still incomplete. `Mapping a question to the right authority - Bangladesh` introduces a BFIU master-circular reference that is not cited anywhere in the lesson pool, and `National supervisors and FATF Recommendations 26-28` still relies on generic BFIU / BSEC / IDRA pages instead of pinpoint statutory or official-functional citations.

## 2026-05-29 - Latest factual-fidelity audit of the Bangladesh-trajectory variant: prior authority-mapping issues are resolved, but methodology pin-cites and Bangladesh MER ratings still block publication

Reviewed the current user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against current FATF/APG materials again. Verdict stayed `DISAGREE`.

- Confirmed fixed in this pass: the earlier APG/FATF `jurisdictions not institutions` problem, the `MLA is Recommendations 37-39 not R.40` problem, and the `FinCEN does not directly examine MSBs` problem no longer appear in the artifact.
- Current blocking issue 1: `The mutual evaluation process: technical compliance and effectiveness` and the companion slide `Two questions every mutual evaluation asks` now carry citation-precision defects. They assign technical-compliance and effectiveness material to FATF Methodology paragraphs `6-13` and `14-43`, but in the 2022 Methodology the technical-compliance section/rating scale begins at paragraphs `39-45` and the effectiveness-rating discussion sits later (`68-72`).
- Current blocking issue 2: the same mutual-evaluation reading scene uses an outdated Immediate Outcome mapping by saying `IO.4` covers whether financial institutions and DNFBPs apply preventive measures proportionate to risk. Under the 2022 Methodology, `IO.3` is the financial sector / virtual-asset supervision-and-preventive-measures chapter, while `IO.4` is the non-financial sector chapter.
- Current blocking issue 3: `Deep case: Bangladesh's mutual evaluation trajectory (2016 MER and 2020 4th Follow-Up Report)` misstates the 2016 Bangladesh MER's actual ratings. The APG MER table shows `R.6 = Compliant`, not below `Largely Compliant`, and `IO.4 = Low`, not `Moderate`.

## 2026-05-29 - Latest methodology re-audit of the Bangladesh-trajectory variant: disagreement not resolved, but now narrower than the earlier citation bundle

Reviewed the current user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against `docs/COURSE-GENERATION-PROMPT.md` v1.1.

- Verdict: `DISAGREE`; still not publishable under methodology v1.1.
- Confirmed fixed or non-blocking in this pass: the Bangladesh mutual-evaluation scene and the Bangladesh deep-case scene look materially improved versus the prior citation complaints; no new deep-case, IP, quiz-format, or repeated-`teachesConcepts` blocker appeared.
- Current blocking issue 1: `The Financial Action Task Force: origin, mandate, composition` still relies on broad website/document labels and leaves the FSRB/global-network, mutual-evaluation, and FATF-public-listing assertions without clean name+section support in its own citations array.
- Current blocking issue 2: `The Egmont Group: secure FIU-to-FIU information exchange` still leaves Egmont-membership / ESW-access consequences under-anchored; the lesson citation pool does not cleanly locate the BFIU / FinCEN / UK FIU / AUSTRAC membership examples.
- Current blocking issue 3: `Mapping a question to the right authority — Bangladesh` and the Bangladesh rows in `National supervisors — three jurisdictions compared` still introduce BFIU master-circular / Bangladesh institutional-routing references without full lesson-pool citation anchors.
- No new blocker class surfaced; the current methodology failure remains citation discipline.

## 2026-05-29 - Factual-fidelity audit of the Bangladesh-trajectory variant: still blocked on evaluation scope and authority mapping

Reviewed the current user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against FATF, APG, MONEYVAL, FinCEN/FFIEC, and Bangladesh public-source materials.

- Verdict: `DISAGREE`; still not publishable.
- Confirmed fixed in this variant: the earlier FATF-membership, FATF-listing, APG chronology, Egmont-dating, and Bangladesh ATA section-mapping bundle appears corrected.
- Current blocking issue 1: `FATF-Style Regional Bodies` says APG/FATF mutual evaluations apply to Bangladeshi and French `institutions`, but mutual evaluations assess jurisdictions, not private institutions.
- Current blocking issue 2: `Mapping a question to the right authority — Bangladesh` misstates FATF Recommendation 40 as the channel for mutual legal assistance usable in court. MLA belongs to Recommendations 37-39; Recommendation 40 covers other forms of international cooperation. The same item also muddles a private correspondent-bank request with official FIU/supervisor channels.
- Current blocking issue 3: `National supervisors and Recommendations 26–28` overstates FinCEN's direct supervisory role over U.S. money services businesses. FinCEN states that it does not itself examine financial institutions; IRS holds delegated examination authority for certain financial institutions including MSBs.

## 2026-05-29 - Methodology audit of the Bangladesh-trajectory variant: still blocked, but now specifically on citation discipline

Reviewed the current user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against `docs/COURSE-GENERATION-PROMPT.md` v1.1.

- Verdict: `DISAGREE`; still not publishable under methodology v1.1.
- Confirmed non-blockers in this variant: no commercial-study-guide leakage or ICC-text problem was visible; the lesson stayed in an adult-professional register; and the scene `teachesConcepts` were substantively distinct even though topical `conceptTags` recur.
- Current blocking issue 1: reading-scene citation discipline is still below the name+section bar. `The Financial Action Task Force`, `The mutual evaluation process: technical compliance and effectiveness`, and `Deep case: Bangladesh's mutual evaluation trajectory (2016 MER and 2020 4th Follow-Up Report)` all make claim-heavy assertions with document-level rather than pinpoint citation support.
- Current blocking issue 2: slide-level lesson-pool locatability is incomplete. `FATF-Style Regional Bodies`, `Consequences of FATF listing`, `The Egmont Group`, `Mapping a question to the right authority — Bangladesh`, and `Synthesis — the layered architecture` introduce structured references that are not fully anchored elsewhere in the lesson citation pool.

## 2026-05-29 - Current factual-fidelity audit: earlier Myanmar / SEC / OPA / R.10-R.12 issues are fixed, but a different source-level bundle still blocks publication

Reviewed the current user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against current FATF, APG, BFIU / ATA, DOJ, and SEC primary/public materials.

- Verdict: `DISAGREE`; still not publishable.
- Confirmed fixed in this draft: the earlier `Myanmar` omission from the FATF call-for-action list is resolved; the SEC disposition now correctly separates the `USD 178.6 million` civil penalty from the approximately `USD 413 million` total SEC settlement; DOJ OPA release `22-1342` is now correctly cited; and the deep-case body no longer misapplies FATF Recommendation 12 to the general high-risk-customer point.
- Current blocking issue 1: `Mutual Evaluations: Technical Compliance and Effectiveness` cites the FATF 2022 methodology as an `October 2025 edition`, but FATF's official methodology page now says the 2022 methodology is `as amended in December 2025`.
- Current blocking issue 2: the same scene's APG citation date is wrong. The Bangladesh `4th Enhanced Follow-Up Report` PDF is dated `November 2020` (updated September 2021), not `October 2020`.
- Current blocking issue 3: `National Supervisors Across Three Jurisdictions` misstates Bangladesh ATA 2009 sections `7` and `8` as `financing offences and reporting`. The official Act shows section `7` is the terrorist-financing offence/punishment provision, while section `8` concerns membership of a proscribed organisation.
- Current blocking issue 4: `Deep Case - Danske Bank Estonia (2007-2015, resolved 2022)` misstates the U.S. case metadata. The official Information is in the Southern District of New York, not `D. Conn.`, and charges conspiracy to commit bank fraud under `18 U.S.C. § 1349` with object bank fraud under `18 U.S.C. § 1344(2)`, not `§ 371 / § 1344`.
- Current blocking issue 5: the same Danske scene attributes the DOJ's approximately `USD 160 billion` figure to the wrong period. The cited Statement of Facts says the transactions for NRP customers through U.S. banks ran between `2007 and 2016`, not `2008 and 2015`.
- Current blocking issue 6: `Architecture in Practice` repeats the wrong Danske statutory framing in the final quiz explanation by using `18 U.S.C. § 371` instead of the actual `18 U.S.C. § 1349` conspiracy charge.

## 2026-05-29 - Current methodology audit says the disagreement is not resolved

Reviewed the latest user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against `docs/COURSE-GENERATION-PROMPT.md` v1.1.

- Verdict: `DISAGREE`; still not publishable under methodology v1.1.
- Confirmed fixed in this draft: the deep-case scene still clears the real-enforcement requirement, the Egmont Charter citation is now pinned to Article 4, and the old Danske R.10/R.12 / 2014-reference issue no longer appears in the artifact.
- Current blocking issue 1: `Why an Architecture, Not Just a Rule` is still below the reading-scene name+section bar. Its FATF-structure claims remain partly page/document-level, and its closing Bangladesh/APG/BFIU chain introduces structured references not anchored in the scene citation array.
- Current blocking issue 2: slide-level citation-pool locatability is still incomplete. `The Four Layers of the Architecture` introduces APG / MONEYVAL / GAFILAT coverage claims without locatable support in the lesson pool, and `Navigation: Which Authority, Which Law?` adds unpooled structured references including Bank Company Act 1991, MLPA sections 9 and 24, ATA sections 20A-20B, and APG procedures.
- Current blocking issue 3: `Financial Intelligence Units and the Egmont Group` and `Deep Case — Danske Bank Estonia (2007-2015, resolved 2022)` still fall short of full claim-traceability. The FIU-form examples / Egmont-founding claim and several supervisory-FIU-evaluation assertions in the Danske scene are not matched by claim-level citation entries.
- Current blocking issue 4: the distinct-concepts-per-scene rule is not cleared after all. Scene-level `conceptTags` are reused across the lesson, including `fatf`, `fsrb`, `fiu`, `mutual_evaluation`, and `egmont_group`.
- No new methodology blocker class surfaced; the lesson is still blocked by the same citation-discipline / distinct-scene-concepts bundle.

## 2026-05-29 - Latest factual-fidelity audit: earlier MONEYVAL and old Danske timeline/count defects are fixed, but the lesson still does not clear publication

Reviewed the current user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against current FATF, APG, SEC, DOJ, and FATF-Recommendations materials.

- Verdict: `DISAGREE`; still not publishable.
- Confirmed fixed in this draft: the earlier MONEYVAL overstatement is gone, and the old Danske defects about a supposed 2014 Danish FSA report and `15,000 non-resident customers` no longer appear.
- Current blocking issue 1: `Mutual Evaluations: Technical Compliance and Effectiveness` says only DPRK and Iran are currently subject to a FATF Call for Action, but FATF's 13 February 2026 public list still includes Myanmar.
- Current blocking issue 2: the same scene's APG citation is still numerically wrong. The 2020 Bangladesh document is APG's `4th Follow-Up Report`, not the `3rd Enhanced Follow-Up Report`.
- Current blocking issue 3: `Deep Case - Danske Bank Estonia (2007-2015, resolved 2022)` misstates the SEC resolution by calling USD 413 million a civil penalty. The SEC says the civil penalty was USD 178.6 million; the ~USD 413 million figure is the total settlement amount.
- Current blocking issue 4: the same Danske scene misapplies FATF Recommendation 12 to high-risk non-resident customers. Recommendation 12 is the PEP standard; the general high-risk-customer/CDD point belongs under Recommendation 10.

## 2026-05-29 - Latest methodology audit narrows the global-architecture lesson blockers again, but still does not clear them

Reviewed the latest user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against `docs/COURSE-GENERATION-PROMPT.md` v1.1.

- Verdict: `DISAGREE`; still not publishable under methodology v1.1.
- Confirmed fixed in this draft: the lesson now has a valid real-enforcement deep case, the scene-level `conceptTags` are distinct across scenes, and the earlier Bruun & Hjejle source-discipline issue no longer appears in the artifact.
- Remaining blocking issue 1: `Why an Architecture, Not Just a Rule` is still below the name+section bar. Its 1989 / FATF-membership / FSRB-network / 2025-update claims are still cited at page or document level rather than with clean pinpoint support in the citations array.
- Remaining blocking issue 2: slide-level citation-pool locatability is still incomplete. `The Four Layers of the Architecture` and `National Supervisors Across Three Jurisdictions` introduce structured references (for example the FATF Mandate, FATF Recommendations 26-29, BSA / 31 CFR / 12 U.S.C. § 1818(s), IEEPA, POCA, Terrorism Act 2000, MLR 2017, MLPA 2012, ATA 2009, and BFIU Circular No. 26) that are not locatable in the lesson citation pool.
- Remaining blocking issue 3: `Financial Intelligence Units and the Egmont Group` and `Deep Case — Danske Bank Estonia (2007–2015, resolved 2022)` still do not fully meet the reading-scene claim-traceability bar. The Egmont Charter membership point is still document-level rather than section-specific, and the Danske scene introduces specific structured references/claims (notably FATF Recommendations 10 and 12, plus the 2014 Estonian-supervisory-work reference) without matched claim-level citation entries.
- No new methodology blocker class surfaced in this pass; the disagreement is now a narrower citation-discipline failure.

## 2026-05-29 - Latest factual-fidelity audit still blocks the current global-architecture lesson on narrower source-level issues

Reviewed the current user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against current FATF/MONEYVAL materials and the public Danske Estonia source set (DOJ, Danish FSA, Bruun & Hjejle).

- Verdict: `DISAGREE`; still not publishable.
- Confirmed fixed in this draft: the earlier stale FATF recommendations dating, VASP/R.15 scoping, FATF call-for-action overstatement, and Egmont-dating/channel issues do not appear in the current JSON.
- Current blocking issue 1: `The Four Layers of the Architecture` still overstates MONEYVAL by saying it covers Council of Europe states/members as such. MONEYVAL evaluates a defined subset of Council of Europe jurisdictions, not every Council of Europe member state.
- Current blocking issue 2: `Deep Case — Danske Bank Estonia (2007–2015, resolved 2022)` says the Danish FSA produced a 2014 report. The 2014 supervisory report in the public record was the Estonian FSA draft report, alongside internal-audit / consultancy work; the Danish FSA's public Estonia-case decision came in 2018 and its explanatory supervision report in 2019.
- Current blocking issue 3: the same Danske scene misstates the customer count. The Bruun & Hjejle report distinguishes roughly 10,000 customers in the Non-Resident Portfolio from roughly 15,000 total customers subject to investigation, but the lesson turns that into `roughly 15,000 non-resident customers`.

## 2026-05-29 - Methodology audit of the current user-supplied global-architecture lesson still returns DISAGREE

Reviewed the current user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against `docs/COURSE-GENERATION-PROMPT.md` v1.1.

- Verdict: `DISAGREE`; still not publishable under methodology v1.1.
- Confirmed fixed in this draft: the lesson now includes a real public-enforcement deep case (`Deep Case — Danske Bank Estonia (2007–2015, resolved 2022)`), so the missing-deep-case blocker is no longer the issue.
- Remaining blocking issue 1: citation discipline is still below the v1.1 bar. `Why an Architecture, Not Just a Rule`, `Financial Intelligence Units and the Egmont Group`, and the synthesis/supervisor-mapping content still make multiple factual assertions without clean name+section support for each claim.
- Remaining blocking issue 2: slide-level citation-pool locatability is still incomplete. `The Four Layers of the Architecture` and `National Supervisors Across Three Jurisdictions` introduce structured references and jurisdiction mappings that are not fully anchored in the lesson citation pool.
- Remaining blocking issue 3: the distinct-concepts-per-scene rule is still not met; core scene-level concept tags still repeat across the lesson (`fatf`, `mutual_evaluation`, `fiu`, `fsrb`, `egmont_group`).
- Remaining blocking issue 4: the Danske scene still leans substantively on the public-but-bank-commissioned Bruun & Hjejle report, which is outside the methodology's allowed source categories unless recast as secondary context rather than substantive support.

## 2026-05-29 — Lesson 0.3 re-run capped; currency facts-pack + generation tuning shipped (gates left alone)

Re-ran CAMS lesson 0.3 through the integrated spine; it capped at 3× Codex DISAGREE (run paused). The feedback loop converged substance — added an ABLV Bank 2018 deep-case, fixed the APG/methodology/ATA defects — but capped on currency/FATF-structure fidelity errors plus two methodology rules (distinct-concepts-per-scene, citation granularity).

Proposed promoting those two rules to deterministic gate FAILs, then measured the Path-1 fixtures and abandoned it: gold-standard 1.1 reuses one concept tag across 10/11 scenes (7 identical-set duplicate scenes) and its Danske deep-case has no enforcement-disposition vocabulary, yet Codex AGREEd — so a tag-count / keyword gate would block the gold standard. Those rules stay Codex's substantive judgment; the fix is at generation.

Shipped (typecheck clean): `lib/ai/generator/facts_pack.ts` (`CURRENT_FACTS_PACK`, primary-source-verified this session, injected into the generation system prompt + both Codex briefs); two generation-prompt reinforcements in `lesson.ts` (substantively-distinct per-scene concepts; deep-case = a specific named matter, not a process walkthrough); and rejected-artifact persistence in `generate-course.ts` (`<slug>.rejected.json` at both caps). Deterministic gates unchanged. Re-running lesson 0.3 to validate before considering `full`.

## 2026-05-29 - Latest methodology re-audit narrows the global-architecture lesson blockers, but still does not clear them

Reviewed the latest re-generated user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against `docs/COURSE-GENERATION-PROMPT.md` v1.1.

- Verdict: `DISAGREE`; still not publishable under methodology v1.1.
- Confirmed fixed in this draft: the missing deep-case blocker is now resolved by the ABLV Bank 2018 scene, which is a real public enforcement matter with year + substantive analysis.
- Remaining blocking issue 1: citation discipline is still below the v1.1 bar. `Why architecture matters before doctrine` and `Synthesis: holding the architecture in mind` remain claim-heavy without clean name+section support for every factual assertion.
- Remaining blocking issue 2: slide-level citation locatability is still incomplete. `The Egmont Group: how FIUs actually share` and `Supervisors and the national mapping: three jurisdictions` introduce structured references that are not fully locatable in the lesson citation pool.
- Remaining blocking issue 3: the distinct-concepts-per-scene rule is still not met; scene-level concept tags are still reused across content scenes, including `mutual_evaluation` and `fiu`.
- No new methodology blocker class surfaced in this pass.

## 2026-05-29 - Latest factual-fidelity re-audit narrows the global-architecture lesson blockers again, but does not clear them

Reviewed the latest user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against current APG, FATF, Bangladesh Bank/BFIU, NCA, FinCEN, and Egmont public/primary materials.

- Verdict: `DISAGREE`; still not publishable.
- Confirmed fixed in this draft: the earlier FATF Recommendation 26 defect, the overstatement of FATF call-for-action consequences, the Toronto/Ottawa Egmont error, and the stale FATF Recommendations / Egmont-Principles dating issues.
- Remaining blocking issue 1: `The mutual evaluation: technical compliance and effectiveness` and the related synthesis citation still treat Bangladesh's 2020 APG document as the country's third-round Mutual Evaluation Report. APG's third-round MER for Bangladesh was adopted in 2016; the 2020 document is a follow-up report.
- Remaining blocking issue 2: the methodology citation is still citation-imprecise. The lesson labels the 2013 FATF methodology as amended in December 2025, but FATF's current methodology page says the 2013 methodology was last updated in June 2023 and the December 2025 amendment applies to the 2022 methodology.
- Remaining blocking issue 3: `Supervisors and the national mapping: three jurisdictions` misstates Bangladesh Anti-Terrorism Act 2009 section 15 as the terrorist-financing offence/penalty provision. Bangladesh Bank/BFIU guidance treats section 15 as BFIU/reporting-agency powers; the terrorist-financing offence and punishment sit in section 7.

## 2026-05-29 - Re-generated global-architecture lesson still fails methodology v1.1

Reviewed the latest user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against `docs/COURSE-GENERATION-PROMPT.md` v1.1.

- Verdict: `DISAGREE`; the earlier methodology disagreement is not resolved.
- Confirmed blocker 1: the lesson still has no deep-case scene grounded in a named public enforcement action with year + substantive analysis.
- Confirmed blocker 2: citation discipline is still below the v1.1 bar. The opening architecture reading, the supervisor-mapping slide, and the synthesis reading still rely on broad or unpooled references rather than claim-traceable name+section citations and lesson-pool locatability.
- Confirmed blocker 3: the duplicate-tag problem is reduced but not eliminated; `aml_architecture` is still reused across the opening reading and the follow-on architecture slide.
- No new methodology blocker class surfaced in this pass.

## 2026-05-29 - Fresh factual-fidelity re-audit still blocks the user-supplied global-architecture lesson

Reviewed the current user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against current FATF, APG, Egmont, BFIU, NCA, and FinCEN primary/public materials.

- Verdict: `DISAGREE`; still not publishable.
- Confirmed blocking issue 1: `FATF and the Forty Recommendations` misstates FATF Recommendation 26 by giving it Recommendation 27's inspection / compel-information / sanction powers.
- Confirmed blocking issue 2: `The mutual evaluation: technical compliance and effectiveness` overstates the FATF "black list" consequences; FATF's current call-for-action statement applies enhanced due diligence to all listed high-risk jurisdictions and countermeasures only in the most serious cases.
- Confirmed blocking issue 3: `Financial intelligence units and the Egmont Group` says the Egmont Group is headquartered in Toronto, while current Egmont Secretariat documents place it in Ottawa.
- Confirmed blocking issue 4: several citation labels are stale, including the FATF Recommendations ("updated 2023"), the FATF methodology ("updated 2022"), and the Egmont Principles ("2013") despite current official versions now being later.

## 2026-05-29 - Re-audit confirms methodology blockers still stand on the user-supplied global-architecture lesson

Reviewed the user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against methodology v1.1 again.

- Verdict: `DISAGREE`; still not publishable.
- Confirmed no new methodology defect class: the same three blockers from the 2026-05-25 methodology audit remain open.
- Blocking issue 1: still no deep-case scene grounded in a real public enforcement action with named entity + year + substantive analysis.
- Blocking issue 2: citation discipline is still below the name+section bar; several reading/jurisdiction scenes rely on free-text or non-granular citation labels for claim-heavy passages.
- Blocking issue 3: duplicate core concept tags still recur across scenes, so the lesson still violates the distinct-concepts-per-scene rule.

## 2026-05-29 — Path 2 follow-up: AI verification spine integrated into the generation flow (closes What's-next item 2)

Wired the deterministic gates + parallel Codex cross-check directly into `scripts/generate-course.ts`. Every lesson (`lesson` and `full` modes) now runs through `generateLessonWithFullSpine`:

- Inner deterministic-gate loop (`MAX_GATE_VALIDATION_ATTEMPTS = 3`): generate → `runGates` → write `.validation.json` → emit a `gate_runner` review event. PASS/FLAG proceeds to Codex; FAIL regenerates with `summarizeFailures` feedback; exhausting the cap throws `GateValidationCapExceededError` and pauses the run.
- Outer Codex cross-check loop (`MAX_CODEX_REVIEW_ITERATIONS = 3`): `runCodexCrossCheck` dispatches the methodology + factual-fidelity briefs in parallel, writes `.codex.<n>.txt`, emits a `codex`/`cross_check` event. AGREE/SPLIT saves the lesson `.json`; DISAGREE regenerates with merged methodology+fidelity feedback; exhausting the cap throws `CodexIterationCapExceededError`.
- The lesson artifact is written ONLY on Codex AGREE/SPLIT — never on a DISAGREE. `full` mode catches cap-exceeded errors to pause; all other per-lesson errors log + continue (resumability preserved).

New modules: `lib/ai/generator/generate_with_gates.ts` and `codex_review.ts` (exported via `index.ts`). Also closed the two remaining gate follow-ups: `citation_bind` expands comma+range FATF Recommendation lists; gate 6b normalises equivalent reference forms (UNSCR ↔ UN Security Council Resolution; Recommendation N ↔ R.N; § ↔ Section) through an alias table before item↔narration comparison. `methodology.ts` → v1.1; `runGates` defaults to v1.1; `codex_dispatch.ts` gained OS-aware `codex.cmd` resolution + a 20-min timeout for Windows. Typecheck clean.

First live full-spine run (CAMS lesson 0.3 `the-global-architecture-fatf-fius-supervisors`) was interrupted at Codex iteration 2/3 (both DISAGREE; no saved artifact). The deep-case + R.19/US-FSRB/investment-adviser defects were corrected across iterations, but the residual blockers are CURRENCY errors (FATF "40 + 2" vs 40 total = 38+2; "updated November 2023" vs the Oct-2025 Recommendations; R.6 terrorism / R.7 proliferation; Standard Chartered NYDFS chronology) — the residual-gap ADR 0020 names. Re-running `lesson 0 3` cold to test whether the spine's own feedback loop converges currency-sensitive content before committing Opus to the remaining ~36 lessons. Also consolidated the prior two-session (consultant + doer) workflow into a single session; the Codex cross-check is the independent reviewer the "consultant" role duplicated.

## 2026-05-25 — Fresh factual-fidelity audit narrows but does not clear the global-architecture lesson blockers

Reviewed the latest user-supplied JSON draft of `the-global-architecture-fatf-fius-supervisors` against current FATF, APG, FinCEN, NYDFS, DOJ, Federal Reserve, OFAC, and FCA primary/public materials.

- Verdict: `DISAGREE` — still not publishable.
- Confirmed fixed in this draft: the earlier FATF Recommendation 19 / grey-list scope defect; the false "United States — FSRB: none" claim; and the stale present-tense treatment of U.S. investment advisers after FinCEN's 31 Dec 2025 delay to 1 Jan 2028.
- New/remaining blocking issue 1: `FSRBs and Bangladesh's place in the peer-review system` says FATF has "40 members and two regional-organisation members." FATF's own membership materials say FATF has 40 members total: 38 jurisdictions and 2 regional organisations.
- New/remaining blocking issue 2: multiple citation labels still say the FATF Recommendations / related standards were "updated November 2023," which is stale against FATF's current October 2025 Recommendations edition.
- New/remaining blocking issue 3: the Standard Chartered deep-case scene misstates the 2012 NYDFS chronology and citation. The $340 million NYDFS settlement was announced in August 2012 and memorialised by a 21 Sep 2012 consent order, not entered in December 2012; the current citation label also conflates the August order with the later consent order.
- New/remaining blocking issue 4: the same deep-case scene misdescribes FATF Recommendation 6 as covering "terrorism and proliferation." FATF's October 2025 Recommendations state R.6 is targeted financial sanctions related to terrorism and terrorist financing; proliferation is Recommendation 7.

## 2026-05-25 — Supplemental factual-fidelity audit blocks CAMS lesson "The Global Architecture: FATF, FIUs, and Supervisors"

Ran a fresh source-level factual-fidelity audit of the user-supplied lesson JSON against current FATF, APG, BFIU, NCA, FCA/HMRC, and FinCEN public materials.

- Verdict: `DISAGREE` — still not publishable.
- Confirmed again: the lesson overstates FATF Recommendation 19 by implying that FATF listing status generally maps to mandatory enhanced due diligence; FATF’s own increased-monitoring statements say the grey list does not call for EDD.
- New blocking issue 1: the slide "`Three jurisdictions, one framework`" says the United States has no FSRB. APG’s official member page says the United States is a founding APG member (1997) as well as a FATF member.
- New blocking issue 2: the US-supervision scene/slide treats investment advisers as current AML/CFT-supervised entities under the BSA. FinCEN delayed the investment-adviser AML rule’s effective date from 1 January 2026 to 1 January 2028 on 31 December 2025, so that present-tense framing is stale.
- New blocking issue 3: the methodology citation is stale. FATF now publishes the Recommendations as last updated in October 2025, and the methodology page now distinguishes the 2022 methodology (amended December 2025) from the 2013 methodology (last updated June 2023).

## 2026-05-25 — Factual-fidelity audit blocks CAMS lesson "The Global Architecture: FATF, FIUs, and Supervisors"

Ran a source-level factual-fidelity audit of the generated CAMS lesson artifact `the-global-architecture-fatf-fius-supervisors` against FATF, APG, BFIU, and Egmont primary/public materials.

- Verdict: `DISAGREE` — not publishable yet.
- Publish-blocking issue 1: the lesson repeatedly says APG adopted Bangladesh’s “most recent Mutual Evaluation Report” in October 2020. APG’s Bangladesh page and Bangladesh’s 4th Follow-Up Report say the MER was adopted in September 2016; the 2020 document is a Follow-Up Report, not a new MER.
- Publish-blocking issue 2: the lesson overstates FATF Recommendation 19 by implying that FATF grey-listing (`Jurisdictions under Increased Monitoring`) triggers mandatory enhanced due diligence by counterparties globally. FATF’s own increased-monitoring statements expressly say FATF does not call for EDD on grey-listed jurisdictions; the mandatory R.19 call is tied to high-risk/call-for-action treatment.
- Additional fidelity issue: the lesson’s FATF document dating is stale. It repeatedly cites the Recommendations as “updated November 2023” and the Methodology as “updated 2023,” but FATF now publishes a February 2025 Recommendations edition and a current 2022/2013 methodology page updated in 2026.

## 2026-05-25 — Methodology audit blocks CAMS lesson "The Global Architecture: FATF, FIUs, and Supervisors"

Reviewed the generated CAMS lesson artifact `the-global-architecture-fatf-fius-supervisors` against methodology v1.1.

- Verdict: `DISAGREE` — not publishable yet.
- Publish-blocking issue 1: no deep-case scene grounded in a real public enforcement action; the Bangladesh/APG worked example is a mutual-evaluation walkthrough, not an enforcement case.
- Publish-blocking issue 2: citation discipline is below v1.1. Reading scenes use free-text citation labels rather than name+section traceability, and the jurisdictional scenes/slides introduce legal authorities and institutional splits without consistently section-anchored support in the lesson citation pool.
- Publish-blocking issue 3: the lesson reuses the same core FATF / FSRB / FIU concept tags across multiple scenes, breaking the methodology's distinct-concepts-per-scene rule.
- Soft pass areas: obvious IP hygiene and adult-professional register were acceptable on review.

## 2026-05-24 — Path 2 infrastructure (ADR 0019): deterministic gates + Codex orchestration shipped

Built the five Path-2 components per the priority order Ripon set after the Launch Quality Bar evaluation. All five cycles implemented and tested against the Path-1 fixtures.

- **Cycle 1 — `scripts/validate-lesson.ts`**: CLI runner for `validate_gates.ts` (the gate runner was committed pre-this-ADR as a seed). `pnpm tsx scripts/validate-lesson.ts <course-slug> [--all | <lesson-slug>]`. Writes `<lesson-slug>.validation.json` sibling, exits 0/1/2 for pass/flag/fail. Wired into `lib/ai/generator/index.ts` exports.
- **Cycle 2 — `lib/ai/generator/citation_bind.ts`**: substring-verified bind for structured factual references (statutes / cases / EOs / named publications) with lesson-wide candidate scope, multi-bindKey alias expansion (UK/BD abbreviations, FATF R variations, UNSCR forms), and range / `et seq.` expansion in candidate labels. Integrated as gate 7 in `runGates`. Catches real gaps in the Path-1 fixtures (1.2 UNSCR 1373 / FATF R.5 unanchored; 1.3 scene 6 BD ATA 2009 / MLPA 2012 unanchored) that Codex's per-artifact rounds missed.
- **Cycle 3 — `supabase/migrations/20260524161116_path2_lesson_review_events.sql`**: append-only `lesson_review_events` table matching the 18-event Path-1 JSONL shape 1:1. RLS-enabled, service-role writes, authenticated read. Indexes for timeline-per-lesson and content-addressable lookup. `scripts/backfill-review-events.ts <course-slug>` ingests the JSONL. Migration NOT applied — Ripon runs `supabase db push` when ready.
- **Cycle 4 — `lib/ai/generator/codex_dispatch.ts`**: `dispatchCodex({ brief })` always pipes via file-to-stdin (closes the self-attribution failure mode); `parseVerdict(raw)` line-based parser robust across Codex's line-break variations; `parallelCrossCheck` dispatches methodology + factual-fidelity in parallel (collapses two iterations to one per the LQB lesson); `makeReviewEvent` / `appendReviewEvent` persist to JSONL always + DB best-effort.
- **Cycle 5 — source-registry semantics + iteration cap**: `outline.sources[]` is now ADVISORY (citation gate is informational; only the all-disjoint case FLAGs — likely wrong outline). `MAX_CODEX_ITERATIONS_PER_LESSON = 3` + `countPriorCrossChecks(courseSlug, lessonSlug)`. Validated against Path-1 history: 1.1 = 0 events (calibration), 1.2 = 3 (at cap — final AGREE on round 3), 1.3 = 6 (over cap — vindicates the 3-iteration threshold as the right operational signal).

All seven gates pass type-checking (`pnpm tsc --noEmit`). The CLI runner validates all three CAMS lessons end-to-end. The `parseVerdict` smoke-test confirms parsing across SPLIT-inline-bullets / AGREE-empty / SPLIT-multi-line-bullets shapes from real Path-1 Codex outputs.

## 2026-05-24 — CAMS lesson 1.3 sixth cross-check clears the last round-5 residual

Ran a narrow verification pass on `generated/cams/lessons/why-states-regulate-financial-institutions.json` focused on the single scene-6 narration residual left by round 5.

- Verdict: `AGREE`.
- Verified fixed: the unsupported entity-count phrasing (`"despite representing a small fraction of the regulated population by entity count"`) is gone from the artifact.
- Verified fixed: scene 6 narration now matches item 5's supported formulation — FinCEN's public `SAR Stats` dataset documenting depository institutions filing the substantial majority of US SAR submissions annually.
- No regressions found on the round-5-confirmed items: scene 8's substantive base, HSBC docket / Judge I. Leo Glasser / no Cherkasky, Travel Rule scope, AMLA characterisation, scene 5 VASP definition, and scene 4 DNFBPs.

## 2026-05-24 — Independent comparative scoring of CAMS lessons 1.2 and 1.3 vs calibration lesson 1.1

Read the three generated lesson artifacts from disk and scored CAMS lesson 1.2 (`what-terrorist-financing-actually-is.json`) and lesson 1.3 (`why-states-regulate-financial-institutions.json`) against calibration lesson 1.1 (`what-money-laundering-actually-is.json`) on the eight-part launch-quality bar.

- Lesson 1.2 scored `PASS`: it matches or exceeds lesson 1.1 on scene structure, source coverage, deep-case treatment, quiz quality, and overall methodology discipline.
- Lesson 1.3 scored `FAIL`: the earlier HSBC judge/monitor, DNFBP/Travel-Rule, and AMLA direct-supervision defects are fixed, but two approval-blocking source-discipline issues remain:
  - scene 6 carries unsupported quantitative burden claims (FinCEN SAR Stats / industry-cost assertions) without primary-source support in the scene or adjacent reading scenes;
  - scene 8 relies on the FinCEN Files investigative reporting as substantive lesson source material, which falls below the primary-source-only methodology bar.

Path-2 recommendation from the review: do not build yet. Bring lesson 1.3 up to the lesson 1.1 calibration bar first.

## 2026-05-24 — CAMS lesson 1.3 revised cross-check (still approval-blocking)

Re-reviewed the revised CAMS lesson artifact `generated/cams/lessons/why-states-regulate-financial-institutions.json` (hash `e1a51dbb0abad6aa62efb9f89d39bf81d8bc7522f55296bc976411c40bcd664a`) against the four previously flagged issues and the cited primary materials.

- Verified fixed: HSBC scene now correctly ties the 11 Dec 2012 filing to docket `1:12-cr-00763-ILG` / Judge I. Leo Glasser, with Judge John Gleeson limited to the later 1 July 2013 memorandum and order.
- Verified fixed: the unsourced Michael Cherkasky name is gone; the scene now stays at the supported claim that HSBC accepted a five-year independent compliance monitor.
- Verified fixed: the comparison slide text now correctly states that FATF R.16 / the Travel Rule applies to financial institutions and is extended by INR.15 to VASPs, not to DNFBPs under R.22/R.23.
- Verified fixed: the DNFBP scene now correctly states that AMLA direct supervision is for selected cross-border credit/financial institutions, not DNFBPs, with the first wave from 2028.
- Verdict remains `SPLIT`, because scene 6 still contains approval-blocking residual wording in its narration: it says FATF Recommendations 10, 11, 16, 20, and 21 are “the same words on the page” for a bank, DNFBP, and VASP, which reintroduces the Travel Rule error the slide text just corrected.

This lesson should still not be handed off as reviewer-ready until scene 6 narration is aligned with FATF R.22/R.23 and INR.15.

## 2026-05-24 — CAMS lesson 1.3 second-opinion review (approval blocker)

Reviewed the generated CAMS lesson artifact `generated/cams/lessons/why-states-regulate-financial-institutions.json` as an independent second-opinion reviewer before approval.

- Verdict: `SPLIT` — scene structure and IP cleanliness were acceptable on review, but citation fidelity was not yet approval-ready.
- Concrete issues found in the artifact:
  - HSBC deep-case scene says the 11 Dec 2012 DPA was filed before Judge John Gleeson; the filed 12/11/12 docket documents are captioned `1:12-cr-00763-ILG` (Judge I. Leo Glasser). Judge Gleeson appears on the later 1 July 2013 memorandum and order.
  - HSBC deep-case scene names Michael Cherkasky as the five-year monitor, but the scene's cited 11 Dec 2012 sources (DPA / Statement of Facts / DOJ press release / OCC / Federal Reserve) do not themselves identify him.
  - Comparison slide wrongly says banks, DNFBPs, and VASPs all apply the Travel Rule; FATF R.16 applies to financial institutions, and INR.15 extends the travel-rule equivalent to VASPs, but FATF R.22/R.23 do not extend R.16 to DNFBPs.
  - DNFBP scene says AMLA will directly supervise the largest cross-border DNFBPs from 2025 onward; the EU AMLA framework provides direct supervision for selected credit/financial institutions, not DNFBPs, and AMLA was not directly supervising DNFBPs from 2025.

This review should block approval of lesson 1.3 until the artifact is corrected.

Append-only log of milestones completed. Newest entries at top.

## 2026-05-22 — Visual Layout Refinement (Reference Matching)

Completed a visual overhaul of the landing page to exactly match the design reference.

- **Theme & Typeface**: Replaced Bricolage display font with Outfit display font in root layout and CSS. Set light cream paper background (`#FAF7F2`) and charcoal (`#1E1E1E`) as primary colors. Fixed page.tsx background override bug.
- **Header & Navigation**: Styled primary actions as hollow outline pill buttons, aligning with the reference's minimalist posture.
- **Hero Grid**: Aligned layout with reference image grid, showcasing the tracking-tight, uppercase headline on the left (col-span-8), supporting paragraph pairs on the right (col-span-4), and the grayscale study environment image underneath.
- **Capabilities list ("HOW WE WORK")**: Stacked elements flush using a shared border overlap (`mt-[-1px]`) and tight padding (`py-4`) so headers sit closely together without overlapping text. Implemented click-driven accordion behavior (clicking a tab expands it and collapses others; flat bottom border without bottom rounded corners for the last item).
- **Course Lineup**: Styled all cards straight by default. Added hover triggers so mouseover on any card transitions it into the layered collage layout (grayscale workspace image fading in with the text card tilting left `rotate-[-3.5deg]` and sliding downwards `translate-y-28` to overlap the bottom edge while maintaining its fixed height `h-[420px]` so it never shrinks).
- **Validation**: Compiled successfully under Turbopack (`pnpm run build`), TypeScript clean, zero errors.

---

## 2026-05-22 — UX/UI + branding pass: public landing page + brand identity v2 (Prompt 14)

The product gets a public face and one coherent design language, before commerce.

**Brand identity v2 (ADR 0018, supersedes ADR 0007)** — the "Auditable Editorial / Cold Fidelity" design language, documented in docs/BRAND.md. Teal/coral retained; `Outfit` becomes the display typeface, `Geist Mono` carries all data (stats, concepts, timers). A real ensō `<Logo>` replaces the text wordmark; a `<Mascot>` — the "Enso Guide" — is introduced (calm, mature, ensō-derived; built from separable SVG paths to animate later). This reverses FRAMEWORK.md's "no cartoon mascots" — FRAMEWORK.md amended to record the decision.

**Public landing page at `/`** — hero, the "it sells readiness" pitch, the six capabilities, course lineup, pricing preview, FAQ, footer. SEO + OG metadata, a branded favicon (app/icon.svg), `/terms` + `/privacy` stubs (real legal pages land with payments).

**The in-app journey re-skinned** — dashboard, /courses, course detail, the lesson player (Socratic Q&A panel anchored by the Mascot), the mock taker ("Cold Fidelity" — a deliberate sterile slate theme), mock results — all in the new language via a shared `AppHeader` + `ui-kit` (components/in-app/). All spine wiring preserved untouched.

**Workflow** — built by integrating a Gemini-assisted first cut: Gemini produced presentational components from a reference design + the framework; this session reviewed, fixed, and integrated. Honesty fixes applied to the Gemini copy — no "guaranteed to pass", no "registered trademark" claim, the signoff is not called a certificate. Relay artifacts committed under docs/prompts/.

Deferred to post-launch (captured, not built): an interactive concept node-graph visualizer, a portfolio/evidence hub, reactive/animated mascot states.

Verified: `pnpm build` clean (18 routes, TypeScript clean); the landing page renders desktop + mobile with zero console errors; the auth pages render with the new Logo. The in-app re-skin is build-verified — visual review happens post-deploy.

Next: Prompt 15 — Stripe / payments.

---

## 2026-05-22 — Content pipeline built and trial-validated (the launch gate)

The pipeline that turns the committed methodology into a generated course.

- lib/ai/generator/ — a staged Claude Opus pipeline: outline → per-lesson scenes → per-module assessment. The methodology (docs/COURSE-GENERATION-PROMPT.md) is the verbatim Opus system prompt; output is strict JSON parsed defensively; each stage persists a gitignored artifact under generated/ so runs are resumable and reviewable.
- scripts/generate-course.ts — the operator CLI (outline / lesson / assessment / full / write). `full` is resumable; `write` is always a deliberate separate step.
- writer.ts writes the course as a DRAFT (course_status 'draft' — hidden from /courses, not enrollable). The methodology mandates SME review before publishing.
- ADR 0017 records the design; docs/RUNBOOK-course-generation.md is the operator procedure for the full run.

Trial-validated for $3.52 (real Opus spend): generated the CAMS course outline (9 modules, 40 lessons, 37 primary sources — $2.55) and one full lesson's 11 scenes ($0.97); wrote a CAMS draft course; verified the generated content renders in the scene-based lesson player. The generated content is methodology-compliant — primary-source citations (US BSA, UK POCA, Bangladesh MLPA), public enforcement cases (Danske Bank), nominative course naming, no competitor materials.

This prompt did NOT run the full course generation — that is hours of operator-supervised work, ~$hundreds, followed by SME review. The pipeline is the launch-gate tool; running it + SME review is what remains.

Next: the full CAMS generation + SME review (content track), then Prompt 14 — payments.

---

## 2026-05-22 — Scene-based lesson delivery (lesson player v2)

A lesson is now an ordered list of typed SCENES, not a wall of text. Decided after reviewing OpenMAIC's delivery layer; lands before the content pipeline so Opus generation targets the right output shape.

- Migration: `content_library_elements` gained `scene_type` (enum: reading/slide/quiz/interactive/pbl) + `scene_data` jsonb. Existing rows default to reading/{} — backward compatible.
- lib/lesson/scenes.ts — the canonical scene-data contract (discriminated Scene union + parseScene). Consumed by the renderers AND the output contract the content pipeline will hand to Opus.
- components/lesson/scenes/ — renderers: ReadingScene (markdown + citations), SlideScene (4 templates: key-points / definition / comparison / callout), QuizScene (inline formative MC with feedback), PlaceholderScene (interactive/pbl), SceneRenderer.
- Lesson player v2: renders scenes via SceneRenderer; the spine carries over untouched (Q&A panel, continuity greeting, classmate gap-check on advance, completion + memory, Listen-mode TTS). New: quiz scenes feed the student knowledge model via recordQuizEvidence.
- CDCS lesson 1 re-seeded into scene format (slide ×4 templates, reading, quiz); lessons 2-3 render as reading scenes via backward compatibility.
- ADR 0016 records the design and what was deliberately cut (whiteboard, playback director, canvas renderer, PPTX export — a later bet, not a launch dependency).

Verified locally: all scene types render; a quiz answer fed the knowledge model (independence_principle 0.30→0.457 from a correct answer, issuing_bank registered an incorrect); the classmate still fired on scene advance; completion ran; un-migrated lesson 2 rendered as reading scenes.

Next: Prompt 13 — the content pipeline, emitting scene-based CAMS content against this contract.

---

## 2026-05-22 — Course generation methodology committed (v1.0)

- docs/COURSE-GENERATION-PROMPT.md placeholder replaced with the real v1.0 methodology (~29.7KB), authored by the project owner.
- Defines the IP-defensible, primary-source-only approach: the allowed source hierarchy (primary regulatory texts, standard-setter publications, public enforcement actions, open-access academic work, news as pointer-only, original analysis, RulHub) and the prohibited sources — ACAMS/ACFE/GARP study guides, Wiley/Kaplan/Schweser/ICA commercial prep, and copyrighted ICC rule text (UCP 600 etc.) as substantive content.
- Specifies the construction method (map the discipline from primary sources, not a certification's published syllabus), citation discipline, quiz design, nominative-fair-use course naming + disclaimers, QA requirements, and a prose description of generation output.
- ADR 0015 records it as canonical v1.0.
- Delivered via an adapted PROMPT-08.5 — the original prompt predated the roadmap re-sequencing (it referenced "Prompt 9 = content pipeline" and "ADR 0012", both stale); corrected to ADR 0015 with no stale Prompt-9 references.
- Concern recorded: the methodology prohibits building lessons from ICC rule text, but the hand-seeded CDCS dev course teaches from UCP 600 articles — a placeholder to be replaced. CAMS is the cleaner first real course.

The content-generation pipeline (a later prompt) will be designed around this methodology.

---

## 2026-05-22 — The classmate live (the 6.0 moat) — pedagogical spine complete

Third prompt of the re-sequenced roadmap, and the one the re-sequencing existed for. The classmate raises a hand and asks the question the student should be asking but isn't.

- lib/classmate/actions.ts: checkClassmateGap — runs when the student advances past a lesson element.
- Model-grounded gap detection: fires only on an evidenced gap — a concept the element taught with student_knowledge_state mastery < 0.45 AND observation_count > 0. No model evidence → no fire.
- The classmate is a per-course character (classmates table; getOrCreateClassmate). Fires at most once per lesson session (MAX_INTERVENTIONS_PER_SESSION = 1, tunable).
- On a gap: Sonnet generates an in-character question, Haiku generates the lecturer's grounded answer; both render in the lesson Q&A panel (a 'classmate' message + a 'lecturer' message).
- Logged to classmate_interventions with gap_evidence; seeds cached_qa with origin 'classmate_asked' — framework moat 4, the classmate-discovered blind-spot dataset.
- classmate_interventions / classmates already had the right shape — no migration. The qa_origin enum already had 'classmate_asked'.
- ADR 0014 records the design (model-grounded, conservative firing, per-course character, the moat-4 tag).

Verified locally: the classmate "Lena" fired on independence_principle (the demo account's weakest concept, mastery 0.30) with a natural, in-character question — "Oh, sorry — can I just ask… does that mean the bank is never allowed to look into the shipment, or just not required to?" — followed by the lecturer's answer. Fired exactly once across four element transitions. classmate_interventions + a classmate_asked cached_qa row written.

The 6.0 pedagogical spine is complete: the lecturer knows what the student knows (Prompt 9), who they are (Prompt 10), and what they're missing (Prompt 11). What remains before launch is content and commerce.

---

## 2026-05-22 — Lecturer memory live (the 5.0 spine)

Second prompt of the re-sequenced roadmap. The lecturer now remembers who the student is across sessions.

- lib/student-model/memory.ts: summarizeSessionToMemory (writer), getMemoryPreamble + getLecturerOpening (readers).
- student_memory already had the right shape — no migration. It is an editorial layer of durable relational facts (goal / context / struggle / preference) — not a transcript, not concept mastery.
- Writer: a Claude Sonnet summarization at lesson completion, scheduled via Next.js `after()` so it runs post-response — "Complete lesson" stays fast.
- Readers: askLecturer injects a memory preamble alongside the Prompt 9 mastery preamble; getLecturerOpening generates a Haiku continuity greeting shown as the opening lecturer message in the lesson Q&A panel.
- Dashboard shows "Welcome back" for returning students.
- ADR 0013 records the design (editorial layer, after()-scheduled writer, no v1 compaction).

Verified locally: a study session with goal- and struggle-revealing questions distilled 3 correctly-typed facts; the next lesson opened with the lecturer greeting — "Welcome back! …this will help clarify the relationships behind those banking day counts we've been working through. Let's take it step by step as always." — referencing the remembered struggle and pace preference.

The lecturer now knows what the student knows (Prompt 9) and who they are (Prompt 10). Next: Prompt 11 — the classmate.

---

## 2026-05-22 — Student knowledge model live (the 4.0 spine)

First prompt of the re-sequenced roadmap (docs/ROADMAP.md). The student model — framework capability one, "the foundation" — was empty schema; this makes it live.

- lib/student-model/knowledge.ts: recordEvidence (writer) + getMasterySummary (reader). v1 update rule — lr = 1/(observation_count+4), targets correct 1.0 / incorrect 0.0 / lesson_completed 0.7, new concept seeds 0.5. Bayesian-flavored, not full BKT.
- student_knowledge_state already had the right shape (concept_tag, mastery_probability, observation_count, correct/incorrect counts) — no migration needed.
- Writers wired: submitMockExam records one observation per answered question; completeLesson records mild-positive evidence for the lesson's taught concepts.
- Reader wired: askLecturer injects a natural-language mastery preamble into the Haiku system prompt (cache-miss path); the lesson player passes the in-context concept tags.
- "Your knowledge" card on the course detail page — strong / to-review concepts.
- ADR 0012 records the update rule and the cache/personalization tradeoff.

Verified locally: a 20-question CDCS mock populated 30 concept rows with a correct spread (update math matches the rule exactly); the lecturer answers through the new reader path; the "Your knowledge" card renders.

The AI lecturer now knows what the student knows. Next: Prompt 10 — lecturer memory.

---

## 2026-05-22 — TTS audio narration live (Listen mode)

- Google Cloud Text-to-Speech wired via service account (en-US-Wavenet-D Wavenet voice)
- GCP project enso-academy created, Text-to-Speech API enabled, service account enso-academy-tts — setup driven live through the GCP Console via Playwright (Ripon logged in; Claude clicked through project / API / service account / key)
- Credentials: .secrets/gcp-tts-service-account.json locally (gitignored), GOOGLE_APPLICATION_CREDENTIALS_JSON inline JSON in Vercel
- lib/audio/tts.ts: synthesizeSpeech / synthesizeStreaming wrappers (file-path or inline-JSON credentials)
- lib/audio/pregenerate.ts: pre-generation pipeline for course content_library_elements
- Supabase Storage bucket 'lesson-audio' created (public read / service-role write)
- Schema: added audio_url, audio_generated_at, audio_duration_seconds to content_library_elements
- /api/admin/pregenerate-audio endpoint (service-role gated)
- Pre-generated 16 MP3s for the full CDCS dev course (cost ~$0.23)
- Lesson player: Listen mode toggle, auto-queue audio between content elements, status indicator
- Listen mode preference persists to student_preferences.preferred_modality
- Real-time TTS for AI lecturer Q&A responses when Listen mode is on
- scripts/setup-gcp-tts.ts: reproducible GCP service account setup utility
- ADR 0011: TTS architecture

The product now has voice. Multi-modality commitment partially fulfilled (audio mode live; dialogue and drill modes deferred to v2).

---

## 2026-05-21 — Mock exam engine live

- Seeded 32 CDCS questions across 4 domains (parties_to_credit 8, ucp_600_articles 14, standby_vs_commercial 5, trade_finance_compliance 5)
- Seeded CDCS Mock 1 template: 20 questions, 40 minutes, 75% pass threshold
- lib/mock/actions.ts: startMockExam, submitMockExam, updateReadiness, getAttemptResults
- Mock launch page at /courses/[slug]/mock
- Full mock-taking UI: no-pause timer (auto-submit at zero), 20-question grid navigation, flag-for-review, focus/blur tracking, beforeunload guard, two-step submit confirmation
- Results page: score, by-domain breakdown, per-question review with explanations and correct/incorrect markings
- student_readiness populated on every submission; signoff_events logged on status transitions
- Course page shows a readiness indicator and Take Mock CTA
- ADR 0010: mock exam engine v1

Verified locally end-to-end (Playwright): started a mock, answered all 20, two-step submit, results rendered (15%, by-domain, per-question review); student_readiness upserted (not_ready, 1 mock, avg 15), signoff_event written.

Product is structurally complete: study (lesson player) + assess (mock engine).

---

## 2026-05-21 — Fix: render markdown in AI lecturer answers

The lecturer's answers contain markdown (bold, lists, paragraphs); the Q&A panel rendered them as plain text, so `**bold**` showed literally. Added react-markdown — lecturer messages now render as proper markdown; student messages stay plain text. Verified locally + in production.

---

## 2026-05-21 — First working product surface: lesson player live

- Seeded CDCS dev course in Supabase: 1 course, 1 module, 3 lessons, 16 content elements (hand-drafted placeholder, not Opus-generated)
- /courses listing page with auto-enrollment for authenticated users (dev mode)
- /courses/[slug] course detail page with module + lesson navigation
- /lessons/[id] full lesson player:
  - Sequential navigation through content elements (prev/next)
  - Side panel for student questions to the AI lecturer
  - Cache-first lookup via the match_cached_qa RPC (0.85 similarity threshold)
  - Haiku fallback for cache misses, answer cached for future students
  - Session tracking via sessions + session_events
  - Lesson completion logging
- lib/lesson/actions.ts: server actions — startLessonSession, getLessonContent, askLecturer, completeLesson
- Dashboard updated to direct users to /courses
- ADR 0008: lesson player architecture v1

Verified locally end-to-end (Playwright): login -> /courses (auto-enrolled in CDCS) -> /courses/cdcs -> lesson player -> asked the lecturer a grounded question (Haiku) -> re-asked, got the cached answer with the "cached" badge. DB confirmed: cached_qa 1, lesson session 1, session_events 3.

This is the inflection point: infrastructure -> product.

---

## 2026-05-21 — Auth UI shipped: design system v1

- Installed shadcn/ui (Base UI variant — the current CLI's default preset; not classic Radix)
- shadcn components: button, input, label, card, separator, alert, sonner
- Design system v1: Geist typography, deep teal primary (#0F3D3E), warm coral accent (#E07856), light mode only, generous spacing — tokens in app/globals.css (ADR 0007)
- Wordmark component (text-only "Enso Academy")
- Landing page refreshed with the new design language
- Auth route group app/(auth)/ with shared layout: /login, /signup, /reset-password
- /auth/update-password page (landed on from the reset email link)
- Protected app/(dashboard)/dashboard/ — redirects unauthenticated users to /login?next=/dashboard; sign-out wired
- Google sign-in button is a placeholder (toast); real OAuth deferred
- Supabase Auth configured as code in supabase/config.toml (email signup + confirmations, Site URL https://www.ensoacademy.ai, 4 redirect URLs) and applied via `supabase config push`
- ADR 0007: design system v1

Deviations from Prompt 5: the shadcn CLI changed — it installed Base UI components, not classic Radix (one `asChild` usage adapted to `buttonVariants()`); `<LoginForm/>` wrapped in `<Suspense>` for Next.js's useSearchParams requirement; a `@layer base` rule added to globals.css so shadcn borders render correctly. All auth routes build clean and were verified locally with Playwright screenshots; production smoke test runs post-deploy.

---

## 2026-05-21 — Production live at www.ensoacademy.ai

- Vercel project enso-academy created (manual setup via dashboard import from GitHub)
- Custom domain ensoacademy.ai configured via Hostinger DNS -> Vercel; www.ensoacademy.ai is the canonical primary domain (the apex 308-redirects to www)
- SSL auto-provisioned
- Env vars synced to Vercel Production and Preview environments
- Auto-deploy from main branch active
- /api/health/supabase health check endpoint added
- Production smoke tests passing:
  - Landing page: HTTP 200 at https://www.ensoacademy.ai
  - Supabase: https://www.ensoacademy.ai/api/health/supabase returns ok:true (courses_count 0)
  - AI client (OpenRouter): /api/ai/smoke-test returns ok:true with Haiku + Sonnet + embeddings (~0.02 cents)
- No env-var mismatches between Vercel and the code
- Working pattern shifted: every prompt's smoke test from now on runs against production (ADR 0006)

---

## 2026-05-21 — Claude client wrapper (three-tier routing, via OpenRouter)

- Installed the `openai` SDK (used as the OpenRouter client); `@anthropic-ai/sdk` removed
- lib/ai/client.ts: OpenRouter client (OpenAI-protocol), model tier constants, cost estimation
- lib/ai/completions.ts: complete() and completeStreaming() helpers
- lib/ai/routing.ts: tier-specific callOpus / callHaiku / callSonnet (+ streaming variants)
- lib/ai/embeddings.ts: text-embedding-3-small via OpenRouter (1536-dim, matches pgvector schema)
- lib/ai/prompts/: prompt management system with three v0.1 prompts (lecturer system, classmate gap question, escalation classifier)
- lib/ai/cost-tracking.ts: logAiCall() writing to escalations or audit_log
- app/api/ai/smoke-test/route.ts: protected endpoint — smoke test confirms Haiku, Sonnet, and embeddings all alive via OpenRouter (total ~0.02 cents)
- ADR 0004: server-side content fetching via service role
- ADR 0005: LLM access via the OpenRouter gateway

Deviation from Prompt 4: it assumed the direct Anthropic SDK. Direct Anthropic/OpenAI API billing is not workable from Bangladesh, so all LLM + embedding traffic goes through OpenRouter (OpenAI-protocol, single OPENROUTER_API_KEY); the wrapper uses the `openai` SDK with a custom base URL. ARCHITECTURE.md updated accordingly. Known consequence: OpenRouter does not expose the Anthropic Batch API, so Layer 1 course generation will cost ~2x the architecture estimate — see ADR 0005 open questions.

---

## 2026-05-20 — Database advisor hardening

Ran `supabase db advisors` on the v1 schema (after upgrading the Supabase CLI to v2.100.1) and remediated every WARN-level finding via two migrations — 20260520174114_advisor_hardening and 20260520174501_fix_subscriptions_rls_initplan:

- Security: pinned `search_path` on `set_updated_at` and `create_student_profile_on_signup`; revoked EXECUTE on both trigger functions so they are off the REST surface.
- Performance: wrapped `auth.uid()` in `(select ...)` across 19 student RLS policies (auth_rls_initplan); scoped 31 service-role policies `TO service_role` (multiple_permissive_policies); added 24 covering indexes for unindexed foreign keys.

Advisor result: 4 security + 71 performance WARNs -> 0 WARN/ERROR. Remaining findings are INFO only (unused_index — expected on an empty database — and one connection-config note). RLS posture unchanged in effect: service_role has rolbypassrls = true, so service-role policies are belt-and-suspenders. Convention recorded in CLAUDE.md gotchas.

---

## 2026-05-20 — Full v1 database schema applied

Six migrations applied to Singapore Supabase project (yffwnyuodulbfjjobhmf):
- content_schema: courses, modules, lessons, content_library_elements, primary_source_citations, question_bank, glossary, case_studies, course_versions
- students_schema: student_profiles, enrollments, sessions, student_knowledge_state, student_memory, student_preferences, modality_state, session_events, portfolio_artifacts
- mocks_schema: mock_exam_templates, mock_exam_attempts, student_readiness, signoff_events, real_exam_outcomes
- intelligence_schema: cached_qa (with match_cached_qa RPC), escalations, classmates, classmate_interventions
- bangladesh_schema: examiners, examiner_graded_papers, grading_rubrics, ai_grader_evaluations, examiner_review_passes, real_exam_papers, ocr_extractions
- commercial_schema: stripe_customers, course_purchases, subscriptions, sme_reviewers, content_reviews, audit_log

All tables have RLS enabled with appropriate policies. Updated_at triggers in place. pgvector indexes (ivfflat) on all embedding columns. Auto-creation trigger for student_profiles + student_preferences on auth.users insert.

TypeScript types regenerated in lib/supabase/database.types.ts (183 -> 2766 lines).

Note: first push failed because the `vector` type lives in the `extensions` schema (not on the apply-time search_path). Fixed by adding `SET search_path = public, extensions` to the three vector-using migrations (content, students, intelligence) and to the match_cached_qa function. See docs/decisions/0003-schema-design-principles.md.

---

## 2026-05-20 — Supabase wiring and auth foundation

- Installed @supabase/supabase-js and @supabase/ssr
- Created the four-client pattern in lib/supabase/: browser (client.ts), server (server.ts), session-refresh helper (middleware.ts), service-role admin (admin.ts)
- Wired request interception via root proxy.ts (Next.js 16 successor to the deprecated middleware.ts) for session refresh
- Enabled the pgvector extension via the first migration (20260520160138_enable_pgvector), pushed to the Singapore project
- Generated initial Supabase TypeScript types in lib/supabase/database.types.ts
- Created /auth/callback route handler for OAuth flows
- Created /auth/auth-error page
- Documented Google OAuth manual setup in docs/SETUP-google-oauth.md
- Updated AGENTS.md to a thin pointer to CLAUDE.md
- ADR 0002 records the Supabase auth + proxy session-refresh pattern

Infrastructure decisions captured in CLAUDE.md gotchas: Vercel for hosting, Inngest/Trigger.dev for background jobs (deferred), Upstash Redis (deferred), Render not in scope for v1.

---

## 2026-05-20 — Foundation scaffold

- Next.js 16 + React 19 + TypeScript + Tailwind initialized
- Folder structure matching docs/ARCHITECTURE.md created
- CLAUDE.md memory system established
- Minimal landing page at /
- .env.example documenting all required credentials
- Architecture document committed as canonical design source
- Initial commit pushed to github.com/ripclass/enso-academy

Stack confirmed: Next.js 16, React 19, TypeScript strict, Tailwind v4, pnpm.
Decision: clean-room implementation (no OpenMAIC fork) due to AGPL-3.0 incompatibility with commercial IP. See docs/decisions/0001-clean-room-no-openmaic-fork.md.
## 2026-05-25 — Factual-fidelity audit blocks CAMS lesson "The Global Architecture: FATF, FIUs, and Supervisors"

Ran a source-level factual-fidelity audit of the generated CAMS lesson artifact `the-global-architecture-fatf-fius-supervisors` against FATF, APG, BFIU, and Egmont primary/public materials.

- Verdict: `DISAGREE` — not publishable yet.
- Publish-blocking issue 1: the lesson repeatedly says APG adopted Bangladesh’s “most recent Mutual Evaluation Report” in October 2020. APG’s Bangladesh page and Bangladesh’s 4th Follow-Up Report say the MER was adopted in September 2016; the 2020 document is a Follow-Up Report, not a new MER.
- Publish-blocking issue 2: the lesson overstates FATF Recommendation 19 by implying that FATF grey-listing (`Jurisdictions under Increased Monitoring`) triggers mandatory enhanced due diligence by counterparties globally. FATF’s own increased-monitoring statements expressly say FATF does not call for EDD on grey-listed jurisdictions; the mandatory R.19 call is tied to high-risk/call-for-action treatment.
- Additional fidelity issue: the lesson’s FATF document dating is stale. It repeatedly cites the Recommendations as “updated November 2023” and the Methodology as “updated 2023,” but FATF now publishes a February 2025 Recommendations edition and a current 2022/2013 methodology page updated in 2026.
## 2026-05-29 - Current factual-fidelity audit clears the earlier APG/methodology/ATA bundle but finds new source-level blockers

Reviewed the latest user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against current FATF, APG, Egmont, MONEYVAL, ECB, and BFIU/Bangladesh Bank public materials.

- Verdict: `DISAGREE`; still not publishable.
- Confirmed fixed in this draft: the earlier Bangladesh APG chronology defect (2016 MER / 2020 follow-up), the FATF methodology-labeling defect (2013 methodology last updated June 2023), and the Bangladesh ATA section-15 offence/penalty misdescription.
- New/current blocking issue 1: the opening architecture reading and companion slide still use stale FATF Recommendations dating (`updated November 2023`) even though FATF's Recommendations page now says the text was last updated in October 2025.
- New/current blocking issue 2: those same scenes misattribute VASP supervision to FATF Recommendations 26-28; FATF places VASP regulation/supervision under Recommendation 15 and INR.15.
- New/current blocking issue 3: `The mutual evaluation: technical compliance and effectiveness` still overstates the FATF call-for-action list by treating black-listing as a countermeasures consequence as such; FATF's current statement applies enhanced due diligence to all high-risk jurisdictions and countermeasures only in the most serious cases.
- New/current blocking issue 4: `The Egmont Group: how FIUs actually share` wrongly says INR.40 expressly directs FIUs to use Egmont channels and also cites the Egmont Principles with stale 2013 dating despite the current revision.
- New/current blocking issue 5: the lesson still characterises MONEYVAL as essentially the body for "Europe outside the EU," which is inaccurate because MONEYVAL evaluates numerous EU member states as well.
