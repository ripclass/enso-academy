# Session Notes

## [2026-06-11] - Module 3 progress halted by the third Codex quota wall; state banked

- **Quota wall #3** (after the two on 2026-05-29/2026-06-10): `codex exec` returns `You've hit your usage limit ... try again at 11:54 PM` — confirmed via the trivial-dispatch diagnostic from the CLAUDE.md gotcha. The `from-alert-to-investigation` iteration-2 dispatch died mid-run (exit 3, no verdict, no `.codex.2.txt`); STR-drafting and FIU-lesson iteration-1 cross-checks are queued and undispatchable until top-up or reset.
- **Module 3 state at the stall:** all 4 lessons GENERATED and 7/7 gate-PASS. Verdicts: `transaction-monitoring-systems-and-rules` AGREE/AGREE (iteration 1); `from-alert-to-investigation` methodology-AGREE / fidelity-DISAGREE at iteration 1, all three fidelity issues FIXED in the artifact (Egmont citation replaced with the real `FIUs in Action: 100 Cases from the Egmont Group` compilation; `31 U.S.C. § 5318(g)(2)` scope stated precisely in the quiz explanation and synthesis), iteration 2 pending re-dispatch; `drafting-the-suspicious-transaction-report` and `the-life-of-a-financial-intelligence-product` awaiting iteration 1 (both received the Egmont-label and § 5318(g)(2) fixes proactively).
- **Resume procedure:** after top-up/reset, run in order — `pnpm tsx scripts/crosscheck-lesson.ts cams from-alert-to-investigation 2`, then `... drafting-the-suspicious-transaction-report 1`, then `... the-life-of-a-financial-intelligence-product 1`; then docs+commit for the Module 3 verdicts.
- **Outline issue to surface to Ripon (locked file — not edited):** the module source name `Egmont Group Public Bulletin on Financial Intelligence Unit Operational Typologies` is not a real publication title — Codex correctly rejected it as a citation label. Lessons now cite the real Egmont compilation; the outline entry should be corrected at the next outline revision.
- **Two more recurring generation rules confirmed this round:** (1) gate 6c flags digit amounts AND magnitude phrases (`hundreds of millions`) in slides with no adjacent reading citations — synthesis slides must stay number-free; (2) gate 2b's advisory outline-resolution flags only at 0% — keep at least one citation label carrying a full official source title that matches the outline registry.

## [2026-06-11] - Session notes: restart recovery, Module 2 closure decisions, Module 3 start

- **Restart recovery procedure (worked, reusable):** the prior session died mid-crosscheck on `reliance-on-third-parties-and-introduced-business` — the methodology AGREE had reached the docs but no `.codex.1.txt` or JSONL cross-check event existed (the script persists both only when the parallel pair completes). Recovery = re-run the full iteration via `crosscheck-lesson.ts`; the duplicate methodology dispatch is the price of a coherent audit bundle, and the script's extra `auto_generated` JSONL row is harmless (precedent: `ongoing-monitoring` has three).
- **Observation:** the per-verdict review entries in CLAUDE.md / PROGRESS.md / SESSION-NOTES.md are written by the Codex dispatch itself during the cross-check run (reviewer voice; encoding artifacts matching the `.codex.N.txt` files; entries for one half of the pair can land before the other half returns — which is how the orphaned reliance methodology note existed at session start). The Claude session should write only milestone/session-level entries and must expect mid-run mtime changes to these files while a dispatch is in flight (Edit-tool conflicts: re-read and retry).
- **CDD clear-with-flag decision (2026-06-11):** iteration 3 returned methodology AGREE / fidelity SPLIT, but the residual is recursive — the reviewer cites the renamed bank-scoped scenes and instructs `keep this framed expressly as the U.S. bank rendering`, which the artifact already does (title, scoping paragraph, slide label, narration). At the 3-iteration cap, per the session brief (`SPLIT` with no hard issues meets the bar; soft disagreements go to Ripon), the lesson clears with the flag. Do not re-dispatch on this point unless the artifact changes substantively.
- **Recurring generation rule (hit twice today):** gate 6b flags a synthesis callout whose item text names a specific instrument (FATF Recommendation 10; Article 39) that the narration does not also name. Rule for future inline generation: every distinctive instrument named in a callout item must be named in its narration too.
- **Deep-case selection for `from-alert-to-investigation`:** the outline sceneBrief points at the FinCEN Files, which is investigative reporting and cannot satisfy the deep-case rule (named public enforcement matter). Used U.S. Bancorp (SDNY deferred prosecution agreement, 15 February 2018, USD 453M forfeiture; FinCEN USD 185M CMP — alert caps tied to analyst staffing, discontinued below-threshold testing, concealment from the OCC), which is on-point for alert governance and chains back to the transaction-monitoring lesson's calibration-by-staffing warning. FinCEN Files retained as pointer-framed context in the opening scene per the standing discipline note.
- **Dispatch discipline held:** cross-checks ran sequentially, one lesson-pair at a time (reliance it.2 → cdd it.3 → edd it.4 → transaction-monitoring it.1 → from-alert-to-investigation it.1 queued), to avoid contention on the metered Codex account.

## [2026-06-11] - Methodology audit of `from-alert-to-investigation`: verdict `AGREE` under the narrowed v1.1 brief

Reviewed the current user-supplied JSON for `from-alert-to-investigation` against methodology v1.1 with citation mechanics left to the deterministic `citation_bind` gate, per the current review boundary.

What this pass confirmed:
- Verdict: `AGREE` on methodology.
- The artifact stays within allowed source types for this pass: FATF materials, primary U.S. / UK / EU / Bangladesh legal and regulatory texts, the U.S. Bancorp / FinCEN public-enforcement record, Egmont typology material, and original analysis. The FinCEN Files reference stays explicitly pointer-framed context rather than the substantive base of the lesson, so no news-as-substance blocker surfaced.
- Every reading scene carries a `citations[]` array, which is the only structural citation check left to this audit after the v1.1 narrowing.
- `Deep case: U.S. Bancorp (2018) - managing the queue instead of working it` satisfies the required deep-case scene because it is grounded in a named public enforcement matter with substantive analysis.
- The scene `teachesConcepts` remain substantively distinct, the quiz remains scenario-based and practical, and the register stays adult-professional.
- Repeat same-day re-audits of the unchanged artifact, including under the explicit reviewer-prompt framing, surfaced no new methodology issue class and kept the verdict at `AGREE`.

## [2026-06-11] - Factual-fidelity audit of `from-alert-to-investigation`: verdict `DISAGREE`

Reviewed the current user-supplied JSON for `from-alert-to-investigation` under the explicit factual-fidelity reviewer framing used in the current prompt, against the operator-maintained current facts reference, the current EUR-Lex text of Directive `(EU) 2015/849` Article `39`, the current text of `31 U.S.C. § 5318(g)(2)`, the UK `POCA 2002` tipping-off framework, and the already-used public U.S. Bancorp / FinCEN enforcement bundle reflected elsewhere in project memory.

What this pass confirmed:
- The core alert-investigation / U.S. Bancorp teaching arc is broadly intact. No new amount/date/entity contradiction surfaced in the deep-case scene on the reviewed bundle, and the UK / EU / Bangladesh framing remained materially aligned with the already-verified project facts.
- The first live blocker is citation precision. `Worked investigation: the exporter and the new corridor` cites `Egmont Group Public Bulletin on Financial Intelligence Unit Operational Typologies` as if it were a precise named publication, but this title could not be substantiated as stated in the reviewed public source set. Treat it as an unverified source label and replace it with a verifiable public typology source before re-dispatch.
- The second live blocker is U.S. scope precision. The quiz explanation in `Disposition and documentation` and the synthesis slide both compress the three regimes too aggressively by treating `31 U.S.C. § 5318(g)(2)` as if it named a generic `disclosed investigation` offence. The statute specifically prohibits notifying a person involved that a transaction has been reported, or otherwise revealing that it has been reported; it should not be paraphrased as the U.S. equivalent of the broader UK/EU investigation-disclosure prohibitions.
- Follow-up instruction: do not spend the next fix cycle relitigating the U.S. Bancorp amounts or the RFI scene's UK/EU anchors. Replace the Egmont cite with a verifiable public source and narrow the U.S. shorthand everywhere it appears (`Disposition and documentation` explanation plus `What to carry forward`).

## [2026-06-11] - Methodology audit of `transaction-monitoring-systems-and-rules`: verdict `AGREE` under the narrowed v1.1 brief

Reviewed the current user-supplied JSON for `transaction-monitoring-systems-and-rules` against methodology v1.1 with citation mechanics left to the deterministic `citation_bind` gate, per the current review boundary.

What this pass confirmed:
- Verdict: `AGREE` on methodology.
- The artifact stays within allowed source types for this pass: FATF materials, primary U.S. / UK / EU / Bangladesh legal and regulatory texts, the AUSTRAC / Federal Court Westpac public-enforcement record, Egmont typology material, and original analysis. No commercial-prep or ICC-text issue surfaced.
- Every reading scene carries a `citations[]` array, which is the only structural citation check left to this audit after the v1.1 narrowing.
- `Deep case: Westpac and AUSTRAC (2020) - the channel the scenarios never reached` satisfies the required deep-case scene because it is grounded in a named public enforcement matter with substantive analysis.
- The scene `teachesConcepts` remain substantively distinct, the quiz remains scenario-based and practical, and the register stays adult-professional.
- The lesson also keeps Bangladesh as one peer implementation example inside an international-first frame rather than the centre of gravity.

## [2026-06-11] - Factual-fidelity audit of `transaction-monitoring-systems-and-rules`: verdict `AGREE`

Reviewed the current user-supplied JSON for `transaction-monitoring-systems-and-rules` under the explicit factual-fidelity reviewer framing used in the current prompt, against the operator-maintained current facts reference, the FATF Recommendations PDF (October 2025 edition), the Federal Register text of FinCEN's 2016 CDD rule, and the already-verified Federal Court / AUSTRAC Westpac public-record bundle used in the current module.

What this pass confirmed:
- No hard blocker surfaced in the lesson's core regulatory teaching. The Recommendation `10` monitoring-duty framing, the explicitly bank-scoped `31 CFR § 1020.210` discussion with the parallel covered-institution caveat, the UK / EU renderings, and the Bangladesh `MLPA 2012` / Transaction Profile monitoring arc are materially sound on the reviewed sources.
- The Westpac scene stays inside the public record on the points it teaches here: the `21 October 2020` penalty order, the `24 September 2020` agreed-facts document, the initial `12`-customer subset versus the `262`-customer section-`36(1)` declaration, and the LitePay / section-`45` monitoring-coverage framing did not surface a publication-blocking contradiction.
- Result: `AGREE`. If the lesson is revised again, preserve the current U.S. bank-rendering caveat and the present Westpac amount/date/customer/channel bundle.

## [2026-06-11] - Repeat factual-fidelity re-audit of `enhanced-due-diligence-when-and-how`: verdict now moves to `AGREE`

Re-reviewed the same current user-supplied JSON for `enhanced-due-diligence-when-and-how` under the explicit factual-fidelity reviewer framing used in the current prompt, against the operator-maintained current facts reference, the FATF Recommendations page plus the 13 February 2026 call-for-action statement, `31 U.S.C. § 5318(i)`, `31 CFR §§ 1010.620` / `1010.610`, the current EUR-Lex text of Directive `(EU) 2015/849`, and the DOJ's 13 December 2022 Danske press release.

What this pass confirmed:
- The earlier same-day `SPLIT` residual does not survive the literal current JSON. `How four rulebooks render EDD` now states the section-312 split accurately: correspondent accounts in the United States for foreign financial institutions, and private banking accounts in the United States for non-U.S. persons.
- The softer shorthand concern also does not justify holding the lesson below publication on this artifact. Where the lesson uses PEP-trigger shorthand, the surrounding text still immediately preserves Recommendation `12`'s foreign-vs-domestic / international-organisation distinction.
- Result: `AGREE`. If the lesson is revised again, preserve the now-cleared section-312 phrasing, the FATF Recommendation `12` qualification, and the Danske 2022 DOJ / SEC amount-date wording.

## [2026-06-11] - Repeat methodology re-audit of `enhanced-due-diligence-when-and-how`: verdict still `AGREE`

Re-reviewed the same current user-supplied JSON for `enhanced-due-diligence-when-and-how` against methodology v1.1 under the explicit cross-check reviewer framing used in the current prompt.

What this pass reconfirmed:
- No new methodology blocker surfaced.
- The artifact still stays within allowed/public source types for this pass, every reading scene still carries a `citations[]` array, `Deep case: Danske Bank Estonia - EDD failure as an operating model` still satisfies the required named public-enforcement deep case, the scene `teachesConcepts` remain substantively distinct, the quiz remains scenario-based and practical, and the register stays adult-professional.
- The live issue on this lesson remains the separate factual-fidelity residual already recorded today, not methodology: the U.S. section-312 citation/wraparound phrasing and the softer Recommendation 12 shorthand issue.

## [2026-06-11] - Repeat factual-fidelity re-audit of `cdd-fundamentals-identifying-the-customer`: verdict still `SPLIT`

Re-reviewed the same current user-supplied JSON for `cdd-fundamentals-identifying-the-customer` under the explicit factual-fidelity reviewer framing used in the current prompt.

What this pass reconfirmed:
- No new hard blocker surfaced.
- The FATF Recommendation `10` architecture, the UK / EU trigger-and-measures mapping, the Bangladesh `MLPA 2012` section `25` / `BFIU Master Circular No. 26` teaching arc, and the NatWest / Fowler Oldfield amount-date-customer bundle remain materially sound on the reviewed source set.
- The only live issue remains the earlier soft U.S.-scope precision point: `The US bank implementation: CIP plus the CDD Rule` and `One standard, four rulebooks` still lean on bank-specific `31 CFR §§ 1020.220` and `1020.210` as the U.S. rendering a little too generally, even though other covered institution types use parallel provisions elsewhere in `31 CFR Chapter X`.

## [2026-06-11] - Repeat methodology re-audit of `cdd-fundamentals-identifying-the-customer`: verdict still `AGREE`

Re-reviewed the same current user-supplied JSON for `cdd-fundamentals-identifying-the-customer` against methodology v1.1 under the explicit cross-check reviewer framing used in the current prompt.

What this pass reconfirmed:
- No new methodology blocker surfaced.
- The artifact still stays within allowed/public source types for this pass, every reading scene still carries a `citations[]` array, `Deep case: NatWest and Fowler Oldfield (2021)` still satisfies the required named public-enforcement deep case, the scene `teachesConcepts` remain substantively distinct, the quiz remains scenario-based and practical, and the register stays adult-professional.
- The live issue on this lesson remains the separate factual-fidelity residual already recorded today, not methodology: the U.S. scenes still use bank-specific `31 CFR §§ 1020.220` and `1020.210` a little too generically.

## [2026-06-11] - Latest factual-fidelity re-audit of `reliance-on-third-parties-and-introduced-business`: verdict now moves to `AGREE`

Re-reviewed the current user-supplied JSON for `reliance-on-third-parties-and-introduced-business` against the FATF October 2025 Recommendations text, the consolidated EUR-Lex text of Directive `(EU) 2015/849` Articles `25` to `29`, the UK `MLR 2017` text for regulation `39`, the FFIEC CIP manual's rendering of `31 CFR § 1020.220(a)(6)`, the Federal Register text of FinCEN's 2016 beneficial-ownership reliance rule at `31 CFR § 1010.230(j)`, and the already-reviewed Standard Chartered public-enforcement bundle reflected in project memory.

What this pass confirmed:
- The earlier same-day blocker no longer appears in the current artifact. `National renderings: UK, EU, US` now correctly states the EU split: Article `27(1)` requires the obliged entity to obtain the necessary CDD information, while Article `27(2)` is the provision that requires relevant copies of identification and verification data and other relevant documentation to be provided **immediately, upon request**.
- No new hard contradiction surfaced in this pass. The FATF Recommendation `17` conditions, the outsourcing exclusion under INR.17 and Article `29`, the UK reliance rendering in regulation `39`, the U.S. bank CIP reliance conditions, the parallel covered-financial-institution beneficial-ownership reliance mechanism, and the Standard Chartered 2012 amount/date bundle remain materially sound on the reviewed source set.
- Result: `AGREE`. If the lesson is revised again, preserve the current FATF / UK / EU / U.S. / Standard Chartered teaching arc and avoid regressing the now-correct EU Article `27` wording.

## [2026-06-11] - Factual-fidelity audit of `reliance-on-third-parties-and-introduced-business`: verdict `DISAGREE`

Reviewed the current user-supplied JSON for `reliance-on-third-parties-and-introduced-business` against the FATF October 2025 Recommendations text, the current EUR-Lex text of Directive `(EU) 2015/849` Articles `25` to `29`, the current eCFR text of `31 CFR § 1020.220`, and the Federal Register / eCFR text of FinCEN's 2016 beneficial-ownership reliance rule at `31 CFR § 1010.230(j)`.

What this pass confirmed:
- The lesson is close on its main teaching arc. The FATF Recommendation `17` conditions, the outsourcing exclusion under INR.17 and Article `29`, the U.S. bank CIP reliance conditions, the parallel covered-financial-institution beneficial-ownership reliance mechanism, and the Standard Chartered 2012 amount/date bundle are materially sound on the reviewed source set.
- The live blocker is in `National renderings: UK, EU, US`. The lesson says Directive `(EU) 2015/849` Article `27` carries `the two timing duties (information immediately; copies on request)`, but the current directive text is narrower: Article `27(1)` requires the obliged entity to obtain the necessary information concerning the Article `13(1)(a)` to `(c)` CDD requirements, while Article `27(2)` is the clause that requires the third party to provide relevant copies of identification and verification data and other relevant documentation **immediately, upon request**.
- Because that scene builds a comparative takeaway on the overstated Article `27` reading, the artifact should not clear publication yet on factual fidelity. Tighten the EU timing-language rather than the broader FATF / U.S. / deep-case structure.

## [2026-06-11] - Methodology audit of `reliance-on-third-parties-and-introduced-business`: verdict `AGREE` under the narrowed v1.1 brief, with repeat same-day re-audits continuing to reconfirm it on the same current artifact

Reviewed the current user-supplied JSON for `reliance-on-third-parties-and-introduced-business` against methodology v1.1 with citation mechanics left to the deterministic `citation_bind` gate, per the current review boundary.

What this pass confirmed:
- Verdict: `AGREE` on methodology.
- The artifact stays within allowed source types for this pass: FATF materials, primary UK/EU/U.S. regulatory texts, the Standard Chartered public-enforcement record, and original analysis. No commercial-prep or ICC-text issue surfaced.
- Every reading scene carries a `citations[]` array, which is the only structural citation check left to this audit after the v1.1 narrowing.
- `Deep case: Standard Chartered (2012) - when the group is the control failure` satisfies the required deep-case scene because it is grounded in a named public enforcement matter with substantive analysis.
- Repeat same-day re-audits of the same current artifact, including under the explicit v1.1 methodology-audit prompt, kept returning the same result and surfaced no new methodology defect class.
- The scene `teachesConcepts` remain substantively distinct, the quiz remains scenario-based and practical, the register stays adult-professional, and the lesson keeps an international-first frame rather than a Bangladesh-centred one.

## [2026-06-11] - Latest factual-fidelity re-audit of `ongoing-monitoring-and-cdd-refresh`: verdict now moves to `AGREE`

Re-reviewed the current user-supplied JSON for `ongoing-monitoring-and-cdd-refresh` against the operator-maintained current facts reference, the FATF Recommendations page/PDF (October 2025 edition), the Federal Register text of FinCEN's 2016 CDD rule, Directive `(EU) 2015/849` Article `13`, and the already-verified Federal Court / AUSTRAC Westpac public-record bundle used in the earlier same-day pass.

What this pass confirmed:
- The earlier same-day blockers no longer appear in the current artifact. `Deep case: Westpac and AUSTRAC (2020) - the known risk nobody wired in` now says the agreed facts develop an initial **12-customer** subset before extending to the court-declared **262-customer** ongoing-customer-due-diligence failure population, which matches the issue previously identified rather than repeating it.
- The U.S. scope-compression issue is also resolved in the current wording. `The obligation across rulebooks` now explicitly frames `31 CFR § 1020.210` as the U.S. **bank** rendering and separately notes the parallel 2016 CDD-rule amendments for the other covered institution types, so it no longer presents the bank rule as if it were the entire U.S. regime without caveat.
- No new hard contradiction surfaced on this pass. The FATF Recommendation `10` framing, the EU Article `13` rendering, the U.S. ongoing-monitoring wording, the Bangladesh monitoring / Transaction Profile framing, and the Westpac amount-date-customer bundle are now acceptable for publication on factual fidelity in the current prompt artifact.

## [2026-06-11] - Repeat methodology audit of `ongoing-monitoring-and-cdd-refresh`: verdict still `AGREE`

Re-reviewed the same current user-supplied JSON for `ongoing-monitoring-and-cdd-refresh` against methodology v1.1 under the explicit narrowed brief used by the Codex cross-check reviewer prompt.

What this pass reconfirmed:
- No new methodology blocker surfaced.
- The artifact still stays within allowed/public source types for this pass, every reading scene still carries a `citations[]` array, `Deep case: Westpac and AUSTRAC (2020) - the known risk nobody wired in` still satisfies the required named public-enforcement deep case, the scene `teachesConcepts` remain substantively distinct, the quiz remains scenario-based and practical, and the register stays adult-professional.
- The live blocker for this lesson remains the separate factual-fidelity issue already recorded in today's notes, not methodology.

## [2026-06-11] - Factual-fidelity audit of `ongoing-monitoring-and-cdd-refresh`: verdict `DISAGREE`

Reviewed the current user-supplied JSON for `ongoing-monitoring-and-cdd-refresh` against the operator-maintained current facts reference, the FATF Recommendations page (October 2025 edition marker), the Federal Register text of FinCEN's 2016 CDD rule, Directive `(EU) 2015/849` Article `13`, the Federal Court of Australia's Westpac penalty order dated `21 October 2020`, and AUSTRAC's lodged Statement of Agreed Facts and Admissions dated `24 September 2020`.

What this pass confirmed:
- The lesson is close on its core teaching arc. The FATF Recommendation `10` framing, the EU Article `13` rendering, and the Bangladesh monitoring / Transaction Profile framing are broadly sound on the reviewed source set.
- The deep-case scene has a real case-fidelity defect that should block publication. `Deep case: Westpac and AUSTRAC (2020) - the known risk nobody wired in` says `twelve customers in the agreed facts`, but the Federal Court order declares Westpac's section `36(1)` ongoing-customer-due-diligence contraventions in relation to **262 customers**. Customers `1-12` are only the first named subset in the agreed-facts document; the scene should not present that `12`-customer subset as the agreed-facts universe.
- There is also a smaller U.S. scope-compression issue. `The obligation across rulebooks` uses bank-specific `31 CFR § 1020.210` as the U.S. rendering generally, even though FinCEN's 2016 CDD rule amended the AML-program rules for all covered financial institutions. If revised, either relabel that passage as the U.S. bank implementation or widen the citation set and wording to the parallel covered-institution rules.

## [2026-06-11] - Methodology audit of `ongoing-monitoring-and-cdd-refresh`: verdict `AGREE` under the narrowed v1.1 brief

Reviewed the current user-supplied JSON for `ongoing-monitoring-and-cdd-refresh` against methodology v1.1 with citation mechanics left to the deterministic `citation_bind` gate, per the current review boundary.

What this pass confirmed:
- Verdict: `AGREE` on methodology.
- The artifact stays within allowed source types for this pass: FATF materials, primary U.S./UK/EU/Bangladesh regulatory texts, the AUSTRAC / Federal Court Westpac public-enforcement record, and original analysis. No commercial-prep or ICC-text issue surfaced.
- Every reading scene carries a `citations[]` array, which is the only structural citation check left to this audit after the v1.1 narrowing.
- `Deep case: Westpac and AUSTRAC (2020) - the known risk nobody wired in` satisfies the required deep-case scene because it is grounded in a named public enforcement matter with substantive analysis.
- The scene `teachesConcepts` remain substantively distinct, the quiz remains scenario-based and practical, the register stays adult-professional, and the lesson keeps Bangladesh as one peer implementation example inside an international-first frame rather than the centre of gravity.

## [2026-06-11] - Factual-fidelity audit of `beneficial-ownership-investigation`: verdict `AGREE`

Reviewed the current user-supplied JSON for `beneficial-ownership-investigation` against the operator-maintained current facts reference and the reviewed public U.S./UK/EU/DOJ source bundle used in this pass.

What this pass confirmed:
- The lesson is publication-ready on factual fidelity. The FATF Recommendation `24` / `25` / `10` teaching arc, the `31 U.S.C. § 5336` / UK PSC / EU beneficial-ownership-register framing, and the 1MDB / Goldman Sachs 2020 amount-date-entity bundle are materially accurate on the reviewed sources.
- The deep-case scene is the main strength of the artifact on this dimension. The Good Star control point, the Aabar lookalike-company device, and the Goldman Sachs 22 October 2020 resolution language all track the DOJ public record closely enough for publication.
- No new hard contradiction surfaced against the current-facts reference. If the lesson is revised again, preserve the current March-2025 CTA scope wording, the PSC five-condition structure, and the DOJ-grounded 1MDB wording.

## [2026-06-11] - Methodology audit of `beneficial-ownership-investigation`: verdict `AGREE` under the narrowed v1.1 brief

Reviewed the current user-supplied JSON for `beneficial-ownership-investigation` against methodology v1.1 with citation mechanics left to the deterministic `citation_bind` gate, per the current review boundary.

What this pass confirmed:
- Verdict: `AGREE` on methodology.
- The artifact stays within allowed source types for this pass: FATF materials, primary U.S./UK/EU/Bangladesh legal and regulatory texts, the DOJ public record on 1MDB and the Goldman Sachs 2020 resolution, and original analysis. No commercial-prep or ICC-text issue surfaced.
- Every reading scene carries a `citations[]` array, which is the only structural citation check left to this audit after the v1.1 narrowing.
- `Deep case: 1MDB - concealment at sovereign scale` satisfies the required deep-case scene because it is grounded in a named public matter with substantive analysis and public enforcement record support.
- The scene `teachesConcepts` remain substantively distinct, the quiz remains scenario-based and practical, the register stays adult-professional, and the lesson keeps Bangladesh as one peer implementation example inside an international-first frame rather than the centre of gravity.

## [2026-06-11] - Re-confirmation audit of `enhanced-due-diligence-when-and-how`: verdict still `SPLIT`

Re-reviewed the same current user-supplied JSON for `enhanced-due-diligence-when-and-how` against the operator-maintained current facts reference and the already-verified source bundle reflected in project memory.

What this pass confirmed:
- No new hard blocker surfaced beyond the residual issues already recorded earlier the same day.
- The U.S. section-312 point is best described more narrowly than the earlier shorthand suggested. In the current artifact, the core body sentence in `How four rulebooks render EDD` correctly distinguishes correspondent accounts for foreign financial institutions from private banking accounts for non-U.S. persons; the remaining precision defect sits chiefly in the scene's `31 U.S.C. § 5318(i)` citation label / wraparound phrasing.
- The smaller Recommendation 12 shorthand issue remains real but soft: some wraparound phrasing still says `PEP status` / `PEP relationships` generically even though the substantive teaching correctly states the foreign-vs-domestic / international-organisation split.

## [2026-06-11] - Re-audit of `enhanced-due-diligence-when-and-how`: verdict moves from `DISAGREE` to `SPLIT`

Re-reviewed the current user-supplied JSON for `enhanced-due-diligence-when-and-how` against the operator-maintained current facts reference, the FATF Recommendations page and October 2025 consolidated Recommendations PDF, and the same U.S./UK/EU/Danske primary/public source bundle used earlier the same day.

What this pass confirmed:
- The earlier hard FATF Recommendation 12 issue does not appear in the current artifact body. The opening reading, trigger slide, and toolkit scene now all preserve the foreign-vs-domestic / international-organisation split correctly, so the prior `DISAGREE` note was tied to an earlier wording state rather than the present text.
- The lesson is still not a clean `AGREE`. `How four rulebooks render EDD` compresses `31 U.S.C. § 5318(i)` too loosely by speaking of section 312 as if it were one general U.S. EDD rendering for `correspondent accounts and private banking accounts maintained for non-US persons`; the statute is more specific about whom each branch of the rule applies to.
- There is also a smaller precision issue in the wraparound phrasing. The opening citation label and the closing synthesis still use broad `PEP relationships` / `PEP status` shorthand without restating the Recommendation 12 qualifier, which is softer than the earlier blocker but still worth surfacing at module rollup.

## [2026-06-11] - Factual-fidelity audit of `enhanced-due-diligence-when-and-how`: verdict `DISAGREE`

Reviewed the current user-supplied JSON for `enhanced-due-diligence-when-and-how` against the operator-maintained current facts reference, the FATF Recommendations page and October 2025 consolidated Recommendations PDF, `31 U.S.C. § 5318(i)`, `31 CFR §§ 1010.620, 1010.610, 1010.605`, the UK `MLR 2017` text for regulations `33` and `35`, and the current EUR-Lex text of Directive `(EU) 2015/849` plus Directive `(EU) 2018/843`.

What this pass confirmed:
- The main blocker is a real FATF Recommendation 12 scope error, not a citation-mechanics issue. `More of the same is not a control` and `What triggers EDD` both teach PEP status too generally as an automatic / standing EDD trigger. FATF R.12 makes the full enhanced package automatic for **foreign PEPs**; for **domestic PEPs** and persons entrusted with a prominent public function by an international organisation, and their family members / close associates, the senior-management / source-of-wealth / source-of-funds / enhanced-monitoring package applies only where the relationship is assessed as higher-risk.
- The lesson partially self-corrects later in `The EDD toolkit under Recommendations 10 and 12`, which states the foreign-vs-domestic distinction correctly. That means the current artifact is internally inconsistent on a core scope point rather than wholly wrong throughout, but the opening and trigger-map scenes are too central to leave that inconsistency in place.
- No additional hard blocker surfaced in this pass. The reviewed US / UK / EU rulebook mapping holds (`31 U.S.C. § 5318(i)`; `31 CFR §§ 1010.620, 1010.610`; `MLR 2017` regs `33` / `35`; `Directive (EU) 2015/849` / `Directive (EU) 2018/843` Article `18a`), and the Danske scene's December 2022 amount/date/SEC-split bundle is acceptable against the current facts reference.

## [2026-06-11] - Methodology audit of `enhanced-due-diligence-when-and-how`: verdict `AGREE` under the narrowed v1.1 brief

Reviewed the current user-supplied JSON for `enhanced-due-diligence-when-and-how` against methodology v1.1 with citation mechanics left to the deterministic `citation_bind` gate, per the current review boundary.

What this pass confirmed:
- Verdict: `AGREE` on methodology.
- The artifact stays within allowed source types for this pass: FATF/Wolfsberg materials, primary U.S./UK/EU/Bangladesh regulatory texts, the DOJ/SEC/Danish-FSA/Estonian-supervisory public record on Danske Bank Estonia, and original analysis. No commercial-prep or ICC-text issue surfaced.
- Every reading scene carries a `citations[]` array, which is the only structural citation check left to this audit after the v1.1 narrowing.
- `Deep case: Danske Bank Estonia — EDD failure as an operating model` satisfies the required deep-case scene because it is grounded in a named public enforcement matter with substantive analysis.
- The scene `teachesConcepts` remain substantively distinct, the quiz remains scenario-based and practical, the register stays adult-professional, and the lesson keeps the module's cross-jurisdiction framing international-first rather than Bangladesh-centred.

## [2026-06-11] - Factual-fidelity audit of `cdd-fundamentals-identifying-the-customer`: verdict `SPLIT`

Reviewed the current user-supplied JSON for `cdd-fundamentals-identifying-the-customer` against the operator-maintained current facts reference, the NatWest / Fowler Oldfield public record, the current EU directive text, the FATF October 2025 Recommendations text, the eCFR text of 31 CFR Parts 1020 and 1010, and primary/public UK/Bangladesh materials.

What this pass confirmed:
- The lesson is mostly sound on factual fidelity. The FATF Recommendation 10 four-pillar architecture holds; the UK/EU trigger-and-measures discussion is materially right; the Bangladesh section 25 / Transaction Profile teaching arc is acceptable on the sources reviewed; and the NatWest amount/date/customer bundle is right.
- The residual issue is U.S. scope compression rather than a hard contradiction. `The US implementation: CIP plus the CDD Rule` and the cross-jurisdiction synthesis slide still present `31 CFR §§ 1020.220` and `1020.210` too generically even though those are Part 1020 bank rules and the scenes contain bank-rule caveats. Other covered U.S. financial institutions have parallel CIP and AML-program provisions in other parts, so the current wording should either say `U.S. banks` or widen the citation set if it wants to speak for the national regime generally.
- Result: `SPLIT`, not `AGREE`. If the lesson is revised again, keep the FATF / UK / EU / Bangladesh / NatWest substance and tighten only the U.S. scope phrasing.

## [2026-06-11] - Methodology audit of `cdd-fundamentals-identifying-the-customer`: verdict `AGREE` under the narrowed v1.1 brief

Reviewed the current user-supplied JSON for `cdd-fundamentals-identifying-the-customer` against methodology v1.1 with citation mechanics left to the deterministic `citation_bind` gate, per the current review boundary.

What this pass confirmed:
- Verdict: `AGREE` on methodology.
- The artifact stays within allowed source types for this pass: FATF materials, primary U.S./UK/EU/Bangladesh regulatory texts, the FCA/NatWest public enforcement matter, and original analysis. No commercial-prep or ICC-text issue surfaced.
- Every reading scene carries a `citations[]` array, which is the only structural citation check left to this audit after the v1.1 narrowing.
- `Deep case: NatWest and Fowler Oldfield (2021)` satisfies the required deep-case scene because it is grounded in a named public enforcement matter with substantive analysis.
- The scene `teachesConcepts` remain substantively distinct, the quiz remains scenario-based and practical, the register stays adult-professional, and the lesson keeps Bangladesh as one peer implementation example inside an international-first frame rather than the centre of gravity.

## [2026-06-10] - Latest factual-fidelity re-audit of `customer-risk-rating-models`: verdict now moves to `AGREE`

Re-reviewed the current user-supplied JSON for `customer-risk-rating-models` against the current FATF Recommendations page/PDF and Recommendation 12 text, the FCA Commerzbank AG Final Notice dated 17 June 2020, and the operator-maintained current facts reference.

What this pass confirmed:
- The verdict has moved from `DISAGREE` to `AGREE` on factual fidelity for the current artifact.
- The earlier same-day blockers are resolved in the version reviewed here. `The risk factors in detail` now preserves FATF Recommendation 12's foreign-vs-domestic / international-organisation distinction correctly, and `Deep case: Commerzbank London and the FCA (2020)` now uses the Final Notice's exact Relevant Period of `23 October 2012 to 29 September 2017`.
- No new factual-fidelity blocker surfaced in this pass; preserve the current FATF / EBA framing, the Bangladesh examples as currently worded, and the Commerzbank amount/entity/date bundle if the lesson is revised again.

## [2026-06-10] - Factual-fidelity audit of `customer-risk-rating-models`: verdict `DISAGREE`

Reviewed the current user-supplied JSON for `customer-risk-rating-models` against the current FATF Recommendations page/PDF and Recommendation 12 text, the FCA Commerzbank AG Final Notice dated 17 June 2020, and the operator-maintained current facts reference.

What this pass confirmed:
- The lesson is mostly disciplined on its sources and examples, but it is not yet publishable on factual fidelity.
- `The risk factors in detail` contains the clearest regulatory-scope defect. Its wording implies that a customer or beneficial owner who is a PEP or close associate thereby engages Recommendation 12's enhanced-measures bundle generally, but FATF R.12 distinguishes foreign PEPs from domestic PEPs / persons entrusted with a prominent function by an international organisation. For the domestic / international-organisation category, the senior-management / source-of-wealth / enhanced-monitoring measures apply only in higher-risk business relationships, and that qualification also carries through to family members and close associates.
- `Deep case: Commerzbank London and the FCA (2020)` contains a narrower but still blocking case-fidelity defect. The scene says the failings ran from `October 2012 to October 2017`, but the FCA Final Notice defines the Relevant Period exactly as **23 October 2012 to 29 September 2017**.
- No broader source-level blocker surfaced in this pass. The Commerzbank entity / amount / date bundle is otherwise correct, and the lesson's FATF / EBA framing is broadly solid if those two points are tightened.

## [2026-06-10] - Methodology audit of `customer-risk-rating-models`: verdict `AGREE` under the narrowed v1.1 brief

Reviewed the current user-supplied JSON for `customer-risk-rating-models` against methodology v1.1 with citation mechanics left to the deterministic `citation_bind` gate, per the current review boundary.

What this pass confirmed:
- Verdict: `AGREE` on methodology.
- The artifact stays within allowed source types for this pass: FATF/EBA/Basel/BFIU materials, public enforcement actions, and original analysis. No commercial-prep or ICC-text issue surfaced.
- Every reading scene carries a `citations[]` array, which is the only structural citation check left to this audit after the v1.1 narrowing.
- `Deep case: Commerzbank London and the FCA (2020)` satisfies the required deep-case scene because it is grounded in a named public enforcement matter with substantive analysis.
- The scene `teachesConcepts` remain substantively distinct, the quiz remains scenario-based and practical, and the register stays adult-professional.

## [2026-05-30] - Latest factual-fidelity re-audit of `enterprise-wide-risk-assessment`: verdict now moves to `AGREE`

Re-reviewed the current user-supplied JSON for `enterprise-wide-risk-assessment` against the current FATF Recommendations page/PDF, the EBA ML/TF Risk Factors Guidelines, Basel's AML/CFT risk-management guidance, the Dutch OM ING settlement/public-facts record, and official/public Bangladesh Bank/BFIU materials.

What this pass confirmed:
- The verdict has moved from `DISAGREE` to `AGREE` on factual fidelity for the current artifact.
- The earlier same-day blockers are resolved in the version reviewed here. `Deep case: ING and the Dutch settlement (2018) — when the enterprise risk picture fails` now correctly names **ING Bank N.V.** as the settling bank, and `Worked example: scoring a mid-tier commercial bank` no longer overstates the Bangladesh source with unsupported `board-approved` wording.
- No new factual-fidelity blocker surfaced in this pass; preserve the current FATF/Basel/EBA structure, the ING amount/date/entity bundle, and the narrower Bangladesh Circular 26 risk-assessment wording if the lesson is revised again.

## [2026-05-30] - Repeat methodology audit of `enterprise-wide-risk-assessment`: verdict still `AGREE`

Re-reviewed the current user-supplied JSON for `enterprise-wide-risk-assessment` against methodology v1.1 with citation mechanics still left to the deterministic `citation_bind` gate.

What this pass reconfirmed:
- No new methodology blocker surfaced.
- The artifact remains inside the allowed-source perimeter for this audit: FATF/Basel/EBA/BFIU materials, public enforcement actions, and original analysis.
- Every reading scene still carries a `citations[]` array, `Deep case: ING and the Dutch settlement (2018) — when the enterprise risk picture fails` still satisfies the required named public-matter deep case, the scene `teachesConcepts` remain substantively distinct, the quiz remains scenario-based, and the register stays adult-professional.
- The open publication issues remain in the separate factual-fidelity pass; this methodology pass should not drift back into citation-mechanics relitigation.

## [2026-05-30] - Factual-fidelity audit of `enterprise-wide-risk-assessment`: verdict `DISAGREE`

Reviewed the current user-supplied JSON for `enterprise-wide-risk-assessment` against the current FATF Recommendations page/PDF, the EBA ML/TF Risk Factors Guidelines, Basel's AML/CFT risk-management guidance, the Dutch OM ING settlement/public-facts record, and available Bangladesh Bank/BFIU public materials.

What this pass confirmed:
- The lesson remains broadly sound on the EWRA teaching arc: FATF Recommendation 1 is the right anchor, EBA/GL/2021/02 is the right guideline identifier, the inherent/control/residual structure is defensible, and the ING amount/date bundle (`€775 million`, `€675 million` fine + `€100 million` disgorgement, 4 September 2018) is right.
- `Deep case: ING and the Dutch settlement (2018) — when the enterprise risk picture fails` contains the clearest publish-blocking error. The Dutch OM settlement statement and Houston public-facts record identify **ING Bank N.V.** / `ING NL` as the legal entity that accepted the settlement, but the lesson says **ING Groep N.V.** agreed it.
- `Worked example: scoring a mid-tier commercial bank` also overstates the Bangladesh rulebook by saying **BFIU Master Circular No. 26** requires a `documented, board-approved risk assessment`. The public materials reviewed in this pass support the risk-assessment requirement, but not the added `board-approved` wording.
- If the artifact is revised again, preserve the core EWRA structure and the correct ING amount/date bundle; tighten only the ING-entity naming and the BFIU-circular formulation.

## [2026-05-30] - Methodology audit of `enterprise-wide-risk-assessment`: verdict `AGREE` under the narrowed v1.1 brief

Reviewed the current user-supplied JSON for `enterprise-wide-risk-assessment` against methodology v1.1 with citation mechanics left to the deterministic `citation_bind` gate, per the current review boundary.

What this pass confirmed:
- Verdict: `AGREE` on methodology.
- The artifact stays within allowed source types for this pass: FATF/Basel/EBA/BFIU materials, public enforcement actions, and original analysis. No commercial-prep or ICC-text issue surfaced.
- Every reading scene carries a `citations[]` array, which is the only structural citation check left to this audit after the v1.1 narrowing.
- `Deep case: ING and the Dutch settlement (2018) — when the enterprise risk picture fails` satisfies the required deep-case scene because it is grounded in a named public enforcement matter with substantive analysis.
- The scene `teachesConcepts` remain substantively distinct, the quiz remains scenario-based and practical, and the register stays adult-professional.

## [2026-05-30] - Latest factual-fidelity re-audit of `risk-based-approach-as-operating-principle`: verdict now moves to `AGREE`

Re-reviewed the current user-supplied JSON for `risk-based-approach-as-operating-principle` against the current FATF Recommendations page/PDF, the FATF banking-sector RBA guidance page, current eCFR Title 31 CTR provisions, AUSTRAC's current IFTI guidance, and the AUSTRAC/Federal Court Westpac public record.

What this pass confirmed:
- The verdict has moved from `DISAGREE` to `AGREE` on factual fidelity for the current artifact.
- The earlier same-day blockers are resolved in the version reviewed here. `Deep case: Westpac and AUSTRAC (2020)` now correctly distinguishes suspicious-transaction reporting from Australia's amount-independent IFTI regime, `Risk-based versus rule-based, concretely` now pins CTR aggregation and bank exempt-person relief to the right CFR sections, and `Where the RBA comes from: Recommendation 1 and its Interpretive Note` now uses the current FATF `proportionate` wording.
- No new factual-fidelity blocker surfaced in this pass; preserve the current Westpac / CTR / R.1 wording if the lesson is revised again.

## [2026-05-30] - Codex cross-check methodology audit of `risk-based-approach-as-operating-principle`: verdict remains `AGREE`

Re-audited the current user-supplied JSON for `risk-based-approach-as-operating-principle` against methodology v1.1 with citation mechanics still left to the deterministic `citation_bind` gate.

What this pass confirmed:
- No new methodology blocker surfaced.
- The artifact remains inside the allowed-source perimeter for this audit: FATF/EBA/Basel materials, statutes/regulations, public enforcement actions, and original analysis.
- Every reading scene still carries a `citations[]` array, `Deep case: Westpac and AUSTRAC (2020)` still satisfies the required named public-matter deep case, the scene `teachesConcepts` remain substantively distinct, the quiz remains scenario-based, and the register stays adult-professional.
- The lesson's open publication issues remain in the separate factual-fidelity pass; this methodology pass should not drift back into citation-mechanics relitigation.

## [2026-05-30] - Latest factual-fidelity re-audit of `risk-based-approach-as-operating-principle`: prior `R.20` blocker is fixed, but the lesson still does not clear publication

Re-reviewed the current user-supplied JSON for `risk-based-approach-as-operating-principle` against the current FATF Recommendations text, eCFR Title 31, and AUSTRAC's current IFTI guidance. Verdict stayed `DISAGREE`.

What this pass confirmed:
- The earlier same-day Westpac/R.20 problem is gone in the current artifact. The scene now correctly says the 19.5 million filing failures were Australia's statutory transfer-reporting breaches rather than FATF Recommendation 20.
- A different Westpac-scene defect now blocks publication. `Deep case: Westpac and AUSTRAC (2020) — risk not assessed, controls not defensible` calls the Australian IFTI regime `a national threshold-reporting obligation`, but AUSTRAC's guidance requires IFTI reporting regardless of amount and gives public examples at A$5,000 and A$2,000.
- `Risk-based versus rule-based, concretely` is also still not section-precise on the U.S. CTR rule. The scene makes `31 CFR § 1010.311` carry the aggregation and exemption mechanics even though aggregation is in `31 CFR § 1010.313` and the bank exempt-person rule sits in `31 CFR § 1020.315`.
- A smaller but real currency issue remains in `Where the RBA comes from: Recommendation 1 and its Interpretive Note`: the scene paraphrases R.1 using the superseded `commensurate` wording, while the current FATF Recommendation 1 text uses `proportionate` after the February 2025 amendments.
- If this artifact is revised again, preserve the parts that already clear: the Westpac amount/date/court bundle, the corrected R.20 distinction, the R.1 teaching arc, the scenario-based quiz shape, and the methodology-cleared deep-case scene. Tighten only the IFTI-regime description, the CTR section pins, and the one-word R.1 currency update.

## [2026-05-30] - Repeat methodology cross-check of `risk-based-approach-as-operating-principle`: verdict still `AGREE`

Re-reviewed the current user-supplied JSON for `risk-based-approach-as-operating-principle` against methodology v1.1 with citation mechanics still left to the deterministic `citation_bind` gate.

What this pass reconfirmed:
- No new methodology blocker surfaced.
- The artifact remains inside the allowed-source perimeter for this audit (FATF/EBA/Basel materials, statutes/regulations, public enforcement actions, and original analysis).
- Every reading scene still carries a `citations[]` array, `Deep case: Westpac and AUSTRAC (2020)` still satisfies the required named public-matter deep case, the scene `teachesConcepts` remain substantively distinct, the quiz remains scenario-based, and the register stays adult-professional.
- The lesson's open issues remain in the separate factual-fidelity pass; this methodology pass should not drift back into citation-mechanics relitigation.

## [2026-05-30] - Factual-fidelity audit of `risk-based-approach-as-operating-principle`: methodology still clears, but publication should wait for two legal-scope fixes

Reviewed the current user-supplied JSON for `risk-based-approach-as-operating-principle` against current FATF, FFIEC/FinCEN, and AUSTRAC/Federal Court materials. Verdict: `DISAGREE`.

What this pass confirmed:
- The lesson remains broadly sound on the core RBA teaching arc: FATF Recommendation 1 is correctly used as the anchor, the Westpac penalty amount and court outcome are right, and no new problem surfaced on the FATF/EBA/Basel citation identifiers.
- `Deep case: Westpac and AUSTRAC (2020) — risk not assessed, controls not defensible` contains the clearest publish-blocking error. Its framework paragraph says `Recommendation 20 required timely reporting of the transactions to the FIU`, and the quiz explanation repeats that `late reporting separately engages Recommendation 20`. FATF R.20 is the suspicious-transaction reporting rule; Westpac's 19.5 million IFTI failures were Australian Act reporting contraventions, not FATF R.20 as such.
- `Risk-based versus rule-based, concretely` also overstates the U.S. CTR rule. `31 CFR § 1010.311` is not simply `any cash transaction exceeding US$10,000`; it is drafted around specified transactions in currency and sits with aggregation and exception/exemption mechanics. The scene works pedagogically, but its legal-scope paraphrase is too broad.
- If the artifact is revised again, preserve the parts that already clear: the Westpac amount/date/court bundle, the risk-based-vs-rule-based teaching structure, the scenario-based quiz shape, and the methodology-cleared deep-case scene. Tighten only the R.20 mapping and the CTR-rule wording.

## [2026-05-30] - Methodology audit of `risk-based-approach-as-operating-principle` clears under the narrowed v1.1 brief

Reviewed the current user-supplied JSON for `risk-based-approach-as-operating-principle` against methodology v1.1 with citation mechanics left to the deterministic `citation_bind` gate, per the current review boundary.

What this pass confirmed:
- Verdict: `AGREE` on methodology.
- The artifact stays within allowed source types for this pass: FATF/EBA/Basel publications, statutes/regulations, public enforcement actions, and original analysis. No commercial-prep or ICC-text issue surfaced.
- Every reading scene carries a `citations[]` array, which is the only structural citation check left to this audit after the v1.1 narrowing.
- `Deep case: Westpac and AUSTRAC (2020) — risk not assessed, controls not defensible` satisfies the required deep-case scene because it is grounded in a named public enforcement matter with substantive analysis.
- The scene `teachesConcepts` are substantively distinct even where topical tags recur, the quiz remains scenario-based and practical, and the register stays adult-professional.

## [2026-05-30] - Latest factual-fidelity re-audit of `structure-of-the-40-recommendations`: verdict now moves to `AGREE`

Re-reviewed the current user-supplied JSON for `structure-of-the-40-recommendations` against the operator-maintained facts pack plus current FATF and Standard Chartered public-source materials.

What this pass confirmed:
- The verdict has moved from `DISAGREE` to `AGREE` on factual fidelity for the current artifact.
- The earlier same-day blockers are resolved in the version reviewed here. `Section D: preventive measures (R.9-23)` now correctly says not every Recommendation in that block has an Interpretive Note, the unsupported `perhaps a third of the standard` numeric claim is gone from `Where the rule actually lives`, and the Standard Chartered deep-case now correctly distinguishes OFAC's 2012 country-sanctions role from FATF Recommendations 6 and 7.
- No new factual-fidelity blocker surfaced in this pass; the artifact is acceptable for publication on this dimension.

## [2026-05-30] - Repeat methodology cross-check of `structure-of-the-40-recommendations`: verdict remains `AGREE`

Re-audited the current user-supplied JSON for `structure-of-the-40-recommendations` against methodology v1.1 with citation mechanics still left to the deterministic `citation_bind` gate.

What this pass confirmed:
- The verdict is unchanged: `AGREE` on methodology.
- No new methodology blocker surfaced beyond the already-recorded factual-fidelity issues. The artifact still uses allowed source types, every reading scene still carries a `citations[]` array, the Standard Chartered 2012 scene still qualifies as the required deep case, the scene `teachesConcepts` remain substantively distinct, the quiz remains scenario-based, and the register remains adult-professional.

## [2026-05-30] - Factual-fidelity audit of `structure-of-the-40-recommendations`: methodology still clears, but publication should wait for two factual fixes

Reviewed the current user-supplied JSON for `structure-of-the-40-recommendations` against the operator-maintained facts pack plus current FATF and Standard Chartered public-source materials. Verdict: `DISAGREE`.

What this pass confirmed:
- The lesson is broadly aligned with the current facts pack on the big recurring failure modes: no stale FATF edition date, no R.6/R.7 reversal, no VASP-to-R.26-28 drift, and no R.40/Egmont-channel misstatement surfaced in this artifact.
- `Section D: preventive measures (R.9-23)` contains the clearest publish-blocking error. It says each Recommendation in that block has an Interpretive Note carrying the operational detail, but FATF's current Recommendations do not include INRs for every Recommendation in R.9-23; the published text skips, for example, from INR.8 to INR.10 and from INR.18 to INR.20.
- `Where the rule actually lives` also includes an unsupported numeric claim by saying a bank that reads only the Recommendations has read `perhaps a third of the standard`. That proportion is not anchored to a cited source, so it should be removed or replaced with sourced wording.
- `Deep case: Standard Chartered and the architecture of competent authorities (2012)` is still usable as the lesson's public-enforcement deep case, but one framing line should be tightened if the lesson is revised again: OFAC's role in the 2012 resolution should not be pitched as a clean `R.6/R.7` targeted-financial-sanctions example because the matter concerned broader OFAC country-sanctions programs involving Iran, Sudan, Libya, and Burma.

## [2026-05-30] - Methodology audit of `structure-of-the-40-recommendations` clears under the narrowed v1.1 brief

Reviewed the current user-supplied JSON for `structure-of-the-40-recommendations` against methodology v1.1 with citation mechanics left to the deterministic `citation_bind` gate, per the current review boundary.

What this pass confirmed:
- Verdict: `AGREE` on methodology.
- The artifact stays within allowed source types for this pass: FATF materials, BFIU regulatory material, public enforcement actions, and original analysis. No commercial-prep or ICC-text issue surfaced.
- Every reading scene carries a `citations[]` array, which is the only structural citation check left to this audit after the v1.1 narrowing.
- `Deep case: Standard Chartered and the architecture of competent authorities (2012)` satisfies the required deep-case scene because it is grounded in a named public enforcement matter with substantive analysis.
- The scene `teachesConcepts` are substantively distinct even where topical tags recur, the quiz remains scenario-based and practical, and the register stays adult-professional.

## [2026-05-30] - Current factual-fidelity audit of the Danske deep-case global-architecture lesson: prior blockers are fixed, but a soft residual bundle remains

Re-audited the current user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against the operator-maintained facts pack plus current FATF/APG/Egmont materials. Verdict moved to `SPLIT`.

What this pass confirmed:
- The earlier hard blockers appear resolved in this draft. The lesson no longer carries the prior FATF-listing-mechanics overstatement, the MONEYVAL scope problem, the FinCEN-establishment mistake, or the duplicate-FSRB list defect.
- `Why an Architecture, Not a Single Rulebook` still over-compresses the FATF assessment architecture by saying public mutual evaluations and public listing are both administered against the `2022 assessment methodology`. FATF's own 2022 Procedures page says the ICRG/listing process runs under the Procedures read with the Methodology and Universal Procedures.
- `Synthesis: What the Architecture Asks of You` now carries the clearest conceptual-fidelity slip in the artifact. A BFIU circular can address deficiencies reflected in an Immediate Outcome or implement measures aligned to a Recommendation, but it does not literally `implement an Immediate Outcome`, because Immediate Outcomes are effectiveness benchmarks rather than domestic legal rules.
- `Deep Case: The Danske Bank Estonia Branch (2007-2015) and Its 2022 Resolution` still has a traceability issue even though its numbers align with the current facts pack. The scene uses the Bruun & Hjejle-derived context numerics (`EUR 200 billion`, `~10,000`, `~15,000`) but the report itself is not in the scene citation array, so the key numeric claims are not presently traced to a cited source.
- If the lesson is revised again, preserve the now-fixed FATF/MONEYVAL/FinCEN/FSRB corrections and tighten only this softer residual bundle.

## [2026-05-30] - Current methodology audit of the Danske deep-case global-architecture lesson now clears under the narrowed v1.1 brief

Re-audited the current user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against methodology v1.1 with citation mechanics left to the deterministic `citation_bind` gate, per the current review boundary.

What this pass confirmed:
- Verdict: `AGREE` on methodology.
- The artifact remains within allowed source types for this pass: FATF/APG/Egmont publications, statutes/regulations, public enforcement actions, and original analysis. No commercial-prep or ICC-text issue surfaced.
- Every reading scene carries a `citations[]` array, which is the only structural citation check left to this audit after the v1.1 narrowing.
- `Deep Case: The Danske Bank Estonia Branch (2007-2015) and Its 2022 Resolution` satisfies the required deep-case scene because it is grounded in a named public enforcement matter with substantive analysis.
- The scene `teachesConcepts` are substantively distinct even where topical tags recur, the quiz remains scenario-based and practical, and the register stays adult-professional.

## [2026-05-30] - Current factual-fidelity audit of the Bangladesh-trajectory global-architecture lesson: narrower defects remain, but it is still not publishable

Re-audited the current user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against the operator-maintained facts pack plus current FATF, MONEYVAL, FinCEN, and Egmont materials. Verdict stayed `DISAGREE`.

What this pass confirmed:
- The earlier APG/Bangladesh chronology, FATF-methodology / Bangladesh-rating, and U.S./UK supervisory-map defects now look corrected in the current artifact.
- `Technical Compliance vs. Effectiveness` now carries the highest-value substantive error. Its narration says effectiveness ratings, not technical-compliance scores, drive jurisdictions onto the FATF grey/black lists, but FATF's increased-monitoring materials say the ICRG considers strategic deficiencies in both technical compliance and effectiveness.
- `FATF and the FSRBs: Standard-Setting and Peer Review` still overstates MONEYVAL's perimeter by describing it as covering Council of Europe states generally. FATF's own MONEYVAL page distinguishes between Council of Europe member states evaluated by FATF and those evaluated by MONEYVAL.
- `Financial Intelligence Units and the Egmont Group` misstates FinCEN's legal basis by saying the bureau was established under the BSA / 31 CFR Chapter X. FinCEN as a Treasury bureau is established by 31 U.S.C. § 310; the BSA regime is administered under delegated Treasury authority.
- `The Four Layers of the AML/CFT Architecture` also has a simpler precision defect: the assessment-layer list repeats `GAFILAT` while claiming to enumerate nine FSRBs.

## [2026-05-30] - Current methodology audit of the Bangladesh-trajectory global-architecture lesson now clears under the narrowed v1.1 brief

Re-audited the current user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against methodology v1.1 with the now-set division of labor: citation mechanics belong to the deterministic `citation_bind` gate and are not re-litigated in the methodology pass.

What this pass confirmed:
- Verdict: `AGREE` on methodology.
- Source discipline is acceptable. The lesson stays on FATF/APG/Egmont/statute materials and does not lean on news reporting or commercial-prep content.
- The Bangladesh APG trajectory scene is sufficient as the required deep case because it is a specific, named, well-documented public matter with substantive analysis rather than a generic peer-review walkthrough.
- The scene `teachesConcepts` are substantively distinct even though topical `conceptTags` recur, which is allowed under the baseline-calibrated rule.
- The quiz remains scenario-based and practical, not certification-format mimicry.
- Tone remains adult-professional; no marketing-register or made-up-statistics issue surfaced.

## [2026-05-29] - KEY FINDING: Codex was overfitting on citation mechanics; fixed the division of labor

After the recalibration runs kept capping lesson 0.3 on "citation discipline," ran the project's OWN deterministic gates on all four lessons (gold standard included). Decisive result:

| lesson | overall | pedagogy | citation_bind unbound |
|---|---|---|---|
| 1.1 GOLD (AGREE'd) | flag | FLAG (dup tags) | 1/12 |
| 1.2 (AGREE'd) | flag | pass | **39/72** |
| 1.3 (AGREE'd) | flag | FLAG (dup tags) | 2/68 |
| 0.3 REJECTED | flag | **PASS** | 2/21 |

The rejected 0.3 is at/above the AGREE'd baseline on every deterministic axis — it PASSES pedagogy where 1.1 FLAGs, and its citation_bind (2/21) is far cleaner than 1.2's (39/72), which Codex AGREE'd. So Codex never held the baseline to the citation-granularity bar it kept imposing on 0.3 three runs running. **Overfitting confirmed by data.**

Fix (committed): the Codex methodology brief now DEFERS citation mechanics (granularity, lesson-pool locatability) to the deterministic citation_bind gate, which is calibrated against the fixtures. Codex keeps source-discipline, IP, prohibited-sources, deep-case, register — and citation FACTUAL ACCURACY stays in the fidelity pass (anti-fabrication preserved). This unblocks breadth/overview lessons that legitimately reference many instruments.

BUT the cap wasn't all phantom: the fidelity pass also caught two GENUINE supervisory-scope errors (US: "FinCEN directly examines MSBs" — it's the IRS; UK: "FCA supervises major DNFBPs" — MLR 2017 reg 7 splits it across FCA/HMRC/Gambling Commission/PBSs). Both added to the facts pack as generic facts.

Also fixed this session: lesson generation output cap 16k→32k (the new citation-pooling requirement pushed a methodology-compliant lesson past 16k and truncated the JSON mid-string; added a stopReason==='length' guard). Commits this session: d53ef8b (recalibration), b005ce0 (32k cap), d0db878 (citation division of labor), f844ec6 (US/UK supervisor facts).

Validation re-run of lesson 0.3 in flight with all fixes — outcome TBD (this is the genuine test of whether the systemic fixes converge the lesson, not a blind re-run).

## [2026-05-29] - Latest factual-fidelity audit of the current Bangladesh-trajectory JSON: prior methodology/Bangladesh-rating fixes hold, but the supervisor map is still wrong

Re-audited the current user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` with the operator-maintained facts pack and current public-source supervisory materials. Verdict stayed `DISAGREE`.

What this pass confirmed:
- The specific disagreement from the immediately prior factual-fidelity review is resolved. `The mutual evaluation process: technical compliance and effectiveness` now uses the corrected 2022 FATF Methodology paragraph pins (`39-45`, `68-72`) and the corrected IO.3/IO.4 mapping, while `Deep case: Bangladesh's mutual evaluation trajectory (2016 MER and 2020 4th Follow-Up Report)` now uses the right 2016 MER ratings (`R.6 = Compliant`, `IO.4 = Low`).
- The current blocker has shifted to supervisory-scope accuracy. `National supervisors and FATF Recommendations 26-28` and `Three jurisdictions, three supervisory maps` still say `MSBs and other non-bank financial institutions: FinCEN directly`, but FinCEN says it does not itself examine financial institutions and IRS has delegated BSA examination authority for certain institutions including MSBs.
- The same pair also still overstates the UK FCA's AML perimeter by saying the FCA supervises financial institutions and major DNFBPs under the MLRs 2017. The statutory MLR supervisory map is split across the FCA, HMRC, the Gambling Commission, and professional body supervisors; the current wording collapses that structure and is materially inaccurate on DNFBP scope.
- If the lesson is revised again, preserve the now-fixed FATF/APG/methodology/Bangladesh-rating bundle and rewrite only the U.S./UK supervisory mapping language.

## [2026-05-29] - Latest methodology re-audit of the current global-architecture JSON: still blocked on citation discipline, but no new blocker class

Reviewed the current user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against methodology v1.1 again. Verdict stayed `DISAGREE`.

What this pass confirmed:
- The prior disagreement is still not resolved, but it is still the same class of problem rather than a new one. The mutual-evaluation scene and the Bangladesh-trajectory deep-case now look materially improved; no fresh deep-case, IP, quiz-format, or distinct-`teachesConcepts` blocker appeared.
- `Why a global architecture exists at all` is now one of the clearest reading-scene citation gaps. It introduces Egmont / FIU / supervisor architecture claims, but its citation array only covers FATF / FSRB materials and does not anchor those claims scene-locally.
- `The Financial Action Task Force: origin, mandate, composition` still leaves the Global Network / APG-evaluation / listing-cadence bundle under-anchored. The scene cites FATF history, members, mandate, and list pages, but not a clean name+section source for the Global Network / methodology / cadence assertions it makes.
- `The Egmont Group: secure FIU-to-FIU information exchange` still does not cleanly pin the membership / ESW-access consequences. The page/document-level labels and generic `documents/` links are not enough for the non-member / suspension / access points.
- Bangladesh authority-mapping locatability is still incomplete. `Mapping a question to the right authority - Bangladesh` introduces a `relevant BFIU master circular` with no matching lesson-pool citation, and `National supervisors and FATF Recommendations 26-28` still leans on generic BFIU / BSEC / IDRA pages instead of pinpoint statutory or official-functional citations.
- If this lesson is revised again, preserve the now-improved mutual-evaluation / Bangladesh-deep-case work and fix the citation layer directly rather than reopening the deep-case or quiz structure.

## [2026-05-29] - Latest factual-fidelity audit of the Bangladesh-trajectory variant: the old authority-mapping bundle is fixed, but the lesson still fails on FATF-methodology pin-cites and Bangladesh MER ratings

Re-audited the current user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against FATF and APG primary/public materials. Verdict stayed `DISAGREE`.

What this pass confirmed:
- The earlier concrete disagreement is resolved in this variant. The lesson no longer treats APG/FATF mutual evaluations as reviews of private institutions, no longer routes MLA through Recommendation 40, and no longer overstates FinCEN as the direct examiner of U.S. MSBs.
- `The mutual evaluation process: technical compliance and effectiveness` now has a different high-value accuracy problem. Its paragraph pins for the 2022 FATF Methodology are wrong: technical compliance / compliance ratings are not in paragraphs `6-13`, and effectiveness / effectiveness ratings are not in paragraphs `14-43`. In the 2022 Methodology, the technical-compliance section and rating scale begin at paragraphs `39-45`, while the effectiveness-rating discussion sits later (`68-72`).
- The same mutual-evaluation reading scene also uses an outdated Immediate Outcome mapping by saying `IO.4` covers whether financial institutions and DNFBPs apply preventive measures proportionate to risk. Under the 2022 Methodology, `IO.3` is the financial-sector / VASP supervision-and-preventive-measures chapter and `IO.4` is the non-financial-sector chapter.
- `Deep case: Bangladesh's mutual evaluation trajectory (2016 MER and 2020 4th Follow-Up Report)` misstates the 2016 MER's ratings. The APG ratings table shows Bangladesh had `R.6 = Compliant` and `IO.4 = Low`; the lesson says R.6 was below `Largely Compliant` and that `IO.4` was `Moderate`.
- If this lesson is revised again, preserve the now-fixed FATF/APG/R.40/FinCEN bundle and correct the methodology pin-cites plus the Bangladesh MER rating descriptions directly.

## [2026-05-29] - Latest methodology re-audit of the Bangladesh-trajectory variant: still blocked, but the remaining issue is narrower than before

Reviewed the current user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against methodology v1.1 again. Verdict stayed `DISAGREE`.

What this pass confirmed:
- The earlier mutual-evaluation and Bangladesh-deep-case citation complaints now look materially improved. In this variant, the disagreement is no longer about missing deep case, quiz format, or repeated `teachesConcepts`.
- `The Financial Action Task Force: origin, mandate, composition` is still below the reading-scene name+section bar. Its FATF-structure / mutual-evaluation / public-listing assertions still lean on broad website/document labels rather than clean pinpoint support in the scene citation array.
- `The Egmont Group: secure FIU-to-FIU information exchange` still leaves the Egmont-membership / ESW-access point under-anchored. The lesson citation pool does not clearly locate the BFIU / FinCEN / UK FIU / AUSTRAC membership examples the scene uses.
- `Mapping a question to the right authority — Bangladesh` and the Bangladesh rows in `National supervisors — three jurisdictions compared` still introduce BFIU master-circular / Bangladesh institutional-routing references without full lesson-pool citation anchors.
- No new blocker class surfaced. If this lesson is revised again, keep the now-cleared deep-case / distinct-scene-teaching / non-IP strengths and fix the citation layer directly.

## [2026-05-29] - Factual-fidelity audit of the Bangladesh-trajectory variant: narrower than earlier rounds, but still blocked on who evaluates whom and which authority does what

Re-audited the current user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against FATF, APG, MONEYVAL, FinCEN/FFIEC, and Bangladesh public materials. Verdict stayed `DISAGREE`.

What this pass confirmed:
- The earlier correction bundle appears to be holding in this variant. The lesson now keeps the FATF 40-members framing straight, uses the corrected Bangladesh 2016 MER / 2020 follow-up chronology, keeps the R.6/R.7 and R.15/R.16 scoping fixes, and no longer mislabels ATA section 15 as the terrorist-financing offence provision.
- `FATF-Style Regional Bodies` now has a cleaner but still material architecture error: the narration says a Bangladeshi or French `institution` is what APG/FATF evaluates. Mutual evaluations are of jurisdictions, not private institutions, so the object of review is wrong.
- `Mapping a question to the right authority — Bangladesh` now carries the highest-value recommendation-number defect in the artifact. It says mutual legal assistance for evidence usable in court flows through separate channels under FATF Recommendation 40, but MLA belongs to Recommendations 37-39; R.40 is the `other forms of international cooperation` bucket. The same item also blurs a foreign correspondent-bank query with official FIU-to-FIU or supervisor-to-supervisor cooperation.
- `National supervisors and Recommendations 26–28` is still too loose on the U.S. perimeter. FinCEN's own materials say it does not itself examine financial institutions, and that IRS has delegated examination authority over certain financial institutions including money services businesses, so the lesson should not say FinCEN itself supervises MSBs in a direct-examination sense.
- If this lesson is revised again, preserve the now-correct FATF/APG/Egmont/Bangladesh-ATA bundle and tighten the authority-mapping language instead of reopening already-fixed currency points.

## [2026-05-29] - Methodology audit of the Bangladesh-trajectory variant: citation discipline is still the blocker

Reviewed the current user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against methodology v1.1. Verdict stayed `DISAGREE`.

What this pass confirmed:
- This variant is not failing on the broad source/IP/register categories. No commercial-prep leakage stood out, no ICC-rule-text issue appeared, the quiz stayed scenario-based, and the tone remained adult-professional.
- The repeated topical `conceptTags` are not the right blocker in this artifact. Judged by `teachesConcepts`, the scenes are making distinct substantive teaching moves; do not carry forward an auto-fail theory based only on shared topic tags.
- The real remaining problem is citation discipline. `The Financial Action Task Force`, `The mutual evaluation process: technical compliance and effectiveness`, and `Deep case: Bangladesh's mutual evaluation trajectory (2016 MER and 2020 4th Follow-Up Report)` are still claim-heavy with document-level citations instead of name+section support.
- The slide pool is still under-anchored. `FATF-Style Regional Bodies`, `Consequences of FATF listing`, `The Egmont Group`, `Mapping a question to the right authority — Bangladesh`, and `Synthesis — the layered architecture` all introduce structured references that are not fully locatable in the lesson citation pool.
- If this lesson is revised again, keep the non-citation strengths and fix the citation layer directly rather than reworking concept tags or the quiz format.

## [2026-05-29] - Current factual-fidelity audit: prior disagreement narrowed again, but the lesson still fails on methodology date / Bangladesh ATA / Danske metadata

Re-audited the current user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against FATF, APG, BFIU / the Anti-Terrorism Act 2009, DOJ, and SEC materials. Verdict stayed `DISAGREE`.

What this pass confirmed:
- Several earlier defects from the prior disagreement are actually fixed in this revision. The lesson now correctly includes `Myanmar` in the FATF call-for-action set, correctly separates the SEC `USD 178.6 million` civil penalty from the approximately `USD 413 million` total SEC settlement, correctly uses DOJ OPA press release `22-1342`, and no longer uses Recommendation 12 for the general high-risk-customer point in the deep-case body.
- `Mutual Evaluations: Technical Compliance and Effectiveness` now carries two different citation-precision defects instead. FATF's official methodology page says the 2022 methodology is `as amended in December 2025`, so the lesson's `October 2025 edition` wording is stale; and the Bangladesh APG `4th Enhanced Follow-Up Report` PDF is dated `November 2020`, not `October 2020`.
- `National Supervisors Across Three Jurisdictions` has a concrete Bangladesh statute-mapping error. The official ATA 2009 text shows section `7` is the terrorist-financing offence / punishment provision, while section `8` is about membership of a proscribed organisation, so the lesson's `sections 7 and 8 (financing offences and reporting)` wording is wrong.
- The Danske case now has a different, higher-value fidelity problem than the earlier SEC/R.12 bundle: the first DOJ case citation misidentifies the court and charge. The official Information is in the Southern District of New York, not `D. Conn.`, and the conspiracy charge is `18 U.S.C. § 1349` with object bank fraud under `§ 1344(2)`, not `§ 371 / § 1344`.
- The same Danske paragraph also attributes the DOJ's approximately `USD 160 billion` figure to the wrong period. The cited Statement of Facts says the transactions for NRP customers through U.S. banks ran between `2007 and 2016`, not `2008 and 2015`.
- The final quiz explanation repeats the same wrong statutory framing (`§ 371`) as the deep-case scene, so fixing the deep-case text alone would not clear the artifact.

## [2026-05-29] - Current methodology audit: disagreement not resolved; citation discipline still fails and duplicate scene tags are back in the artifact

Reviewed the latest user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against methodology v1.1. Verdict stayed `DISAGREE`.

What this pass confirmed:
- The deep-case fix is holding. `Deep Case — Danske Bank Estonia (2007-2015, resolved 2022)` remains a valid public-enforcement scene, and the earlier Egmont Charter pinpoint / Danske R.10-R.12 / 2014-reference defects appear fixed in this revision.
- `Why an Architecture, Not Just a Rule` still does not meet the reading-scene name+section bar. The FATF-history / membership / update claims are partly page-level, and the closing Bangladesh/APG/BFIU chain introduces structured references that are not anchored in the scene citation array.
- `The Four Layers of the Architecture` and `Navigation: Which Authority, Which Law?` still fail lesson-pool locatability. The new Navigation slide is the biggest fresh concrete gap here: it introduces Bank Company Act 1991, MLPA sections 9 and 24, ATA sections 20A-20B, BFIU implementation circulars, and APG procedures without corresponding lesson-pool citation entries.
- `Financial Intelligence Units and the Egmont Group` and `Deep Case — Danske Bank Estonia (2007-2015, resolved 2022)` still fall short of full claim-traceability. The FIU-form examples / Egmont-founding claim and the Danske scene's supervisory/FIU-evaluation assertions are still not matched by claim-level citations.
- The distinct-concepts-per-scene issue is visibly back in the artifact. Scene-level `conceptTags` are reused across multiple scenes (`fatf`, `fsrb`, `fiu`, `mutual_evaluation`, `egmont_group`), so the earlier "tags now distinct" conclusion should not be carried forward.
- No new methodology blocker class emerged. The disagreement is still the citation-discipline + distinct-scene-concepts bundle, not a new source-discipline / IP / deep-case failure.

## [2026-05-29] - Latest factual-fidelity audit: prior MONEYVAL / old Danske defects are fixed, but a narrower current-source bundle still blocks publication

Re-audited the current user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against current FATF, APG, SEC, DOJ, and FATF-Recommendations materials. Verdict stayed `DISAGREE`.

What this pass confirmed:
- The earlier MONEYVAL overstatement is fixed. The lesson now describes MONEYVAL as evaluating a defined set of jurisdictions and including several EU member states, rather than treating it as a body for non-EU Europe.
- The old Danske defects from the prior disagreement are also fixed. The draft no longer says the Danish FSA produced the 2014 report, and it no longer converts the Bruun & Hjejle `~15,000 customers under investigation` figure into `~15,000 non-resident customers`.
- `Mutual Evaluations: Technical Compliance and Effectiveness` now has a fresher current-list defect instead: it says only DPRK and Iran are currently subject to a Call for Action, but FATF's 13 February 2026 public list still includes Myanmar.
- The same scene's APG citation label is still numerically wrong. The November 2020 Bangladesh document is APG's `4th Follow-Up Report`, not the `3rd Enhanced Follow-Up Report`.
- `Deep Case - Danske Bank Estonia (2007-2015, resolved 2022)` misstates the SEC resolution amount/type. The SEC says Danske agreed to pay about USD 413 million in total, of which the civil penalty was USD 178.6 million; the lesson turns the total into the civil penalty.
- The same Danske scene also misapplies FATF Recommendation 12. Recommendation 12 is the PEP rule, so the lesson should not describe high-risk non-resident customers generally as being `within the meaning of Recommendations 10 and 12`.

## [2026-05-29] - Latest methodology audit: deep case, distinct scene tags, and Bruun/Hjejle cleanup now hold, but citation discipline still blocks publication

Reviewed the latest user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against methodology v1.1. Verdict stayed `DISAGREE`.

What this pass confirmed:
- The earlier methodology bundle narrowed materially in this revision. `Deep Case — Danske Bank Estonia (2007–2015, resolved 2022)` now satisfies the real-enforcement deep-case requirement, the scene-level `conceptTags` are distinct across the lesson, and the artifact no longer leans on Bruun & Hjejle as a substantive source.
- `Why an Architecture, Not Just a Rule` is still below the reading-scene name+section bar. The FATF-history / membership / FSRB-network / October-2025-update claims are still cited at page or document level rather than with clean pinpoint support in the lesson citation array.
- `The Four Layers of the Architecture` and `National Supervisors Across Three Jurisdictions` still fail lesson-pool citation locatability. They introduce structured references such as the FATF Mandate, FATF Recommendations 26-29, BSA / 31 CFR / 12 U.S.C. § 1818(s), IEEPA, POCA, the Terrorism Act 2000, MLR 2017, MLPA 2012, ATA 2009, and BFIU Circular No. 26 without corresponding locatable citation entries elsewhere in the lesson pool.
- `Financial Intelligence Units and the Egmont Group` and `Deep Case — Danske Bank Estonia (2007–2015, resolved 2022)` still fall short of full claim-traceability. The Egmont Charter membership point is still document-level rather than section-specific, and the Danske scene introduces structured references/claims (especially FATF Recommendations 10 and 12 and the 2014 Estonian-supervisory-work reference) without matched claim-level citation entries.
- No new methodology blocker class emerged. The disagreement is now a narrower citation-discipline failure, not a renewed deep-case / duplicate-tag / prohibited-source problem.

## [2026-05-29] - Latest factual-fidelity audit: earlier FATF/Egmont fixes hold, but three narrower defects still block publication

Re-audited the current user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against current FATF/MONEYVAL materials and the public Danske Estonia source set. Verdict stayed `DISAGREE`.

What this pass confirmed:
- The earlier stale-FATF / VASP-scope / call-for-action / Egmont-dating bundle appears fixed in this revision.
- `The Four Layers of the Architecture` still overstates MONEYVAL by saying it covers Council of Europe states or members as such. MONEYVAL's own jurisdiction pages say it evaluates a defined subset of Council of Europe jurisdictions, plus a small number of other jurisdictions/territories, not every Council of Europe member state.
- `Deep Case — Danske Bank Estonia (2007–2015, resolved 2022)` misidentifies which authority produced the 2014 report. The public supervisory record points to a 2014 Estonian FSA draft report alongside internal audit / consultancy work; the Danish FSA's public Estonia-case decision is 2018 and its explanatory supervision report is 2019.
- The same Danske scene also misstates the customer count. Bruun & Hjejle distinguish roughly 10,000 customers in the Non-Resident Portfolio from roughly 15,000 total customers subject to investigation; the lesson collapses that into `roughly 15,000 non-resident customers`.

## [2026-05-29] - Methodology audit of the current user-supplied JSON: deep case now passes, but the lesson still fails v1.1

Reviewed the current user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against methodology v1.1. Verdict stayed `DISAGREE`.

What this pass confirmed:
- The missing deep-case blocker is now resolved in this draft. `Deep Case — Danske Bank Estonia (2007–2015, resolved 2022)` is a real named public enforcement matter with year and substantive analysis.
- Citation discipline is still below the v1.1 bar. `Why an Architecture, Not Just a Rule`, `Financial Intelligence Units and the Egmont Group`, and the synthesis/supervisor-mapping content still rely on broad document labels rather than clean name+section support for each factual assertion.
- Slide-level citation-pool locatability is still incomplete. `The Four Layers of the Architecture` and `National Supervisors Across Three Jurisdictions` introduce structured references and jurisdiction mappings that are not fully anchored in the lesson citation pool.
- The duplicate-tag blocker remains explicit in this revision: core scene-level concept tags are still reused across the lesson, including `fatf`, `mutual_evaluation`, `fiu`, `fsrb`, and `egmont_group`.
- The Danske scene carries one source-discipline issue of its own: it leans substantively on the bank-commissioned Bruun & Hjejle report, which is not one of the methodology's allowed source categories unless reframed as secondary context rather than substantive authority.

## [2026-05-29] - Lesson 0.3 re-run capped; pivot to facts-pack + generation tuning (gates left alone)

Re-ran `lesson 0 3` through the integrated spine. It **capped** (3× Codex DISAGREE → `CodexIterationCapExceededError`, run paused, exit 1), but the loop made real progress: by iter 3 it had added an **ABLV Bank 2018** enforcement deep-case and fixed the APG-chronology / FATF-methodology-label / BD-ATA-§15 fidelity defects. It still capped on (a) currency + FATF-structure fidelity errors and (b) two methodology rules — distinct-concepts-per-scene and citation granularity.

Proposed to harden those two methodology rules into deterministic gates (cheaper than the Codex loop) — then **measured the Path-1 fixtures first and the data killed it:**
- Gold-standard 1.1 tags `money_laundering_definition` on **10 of 11 scenes** and has **7 identical-set duplicate scenes**; 1.2 reuses its top tag across 9. All are the AGREE baseline. → a tag-count FAIL blocks the gold standard.
- 1.1's Danske deep-case is a **typology narrative with zero enforcement-disposition vocabulary**, yet Codex called it gold. → an enforcement-keyword FAIL blocks the gold standard.
- Conclusion: "distinct concepts" and "real enforcement deep-case" are substantive Codex judgments, not mechanically reducible without false-positiving the baseline. Surfaced this to Ripon; he green-lit the pivot.

Shipped instead (typecheck clean):
- `lib/ai/generator/facts_pack.ts` — `CURRENT_FACTS_PACK`, verified against primary sources this session (FATF 40 = 38+2; Recommendations Oct-2025; R.6 terror/R.7 prolif; R.15/INR.15 VASPs not R.26-28; R.26-28 supervision; R.29 FIUs; R.40/INR.40 ≠ Egmont channels; Egmont Principles July-2025; MONEYVAL incl. EU states; US IA delay to 1 Jan 2028; BD MER-2016/2020-FUR). Injected into the generation system prompt AND both Codex briefs, framed to override training knowledge.
- `lesson.ts` — two generation reinforcements: substantively-distinct per-scene concepts; deep-case must be a specific named matter (enforcement action / prosecution / documented scandal), never a process walkthrough.
- `generate-course.ts` — `<slug>.rejected.json` persisted at both caps so a near-miss survives for hand-finishing (the prior cap lost a close iter-3 draft).
- Deterministic gates deliberately UNCHANGED.

Re-running `lesson 0 3` now to validate whether these close the gap before touching `full`.

## [2026-05-29] - Latest methodology re-audit: deep case fixed, but the lesson still fails v1.1

Re-audited the latest re-generated user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against methodology v1.1. Verdict stayed `DISAGREE`.

What this pass confirmed:
- The missing deep-case blocker is now fixed. The ABLV Bank 2018 scene is a real public enforcement matter with named entity, year, and substantive analysis.
- Citation discipline is still below the v1.1 bar. `Why architecture matters before doctrine` and `Synthesis: holding the architecture in mind` still make multiple factual assertions without a clean name+section trail for each one.
- Slide-level citation-pool locatability is still incomplete. `The Egmont Group: how FIUs actually share` and `Supervisors and the national mapping: three jurisdictions` introduce structured references that are not fully anchored in the lesson citation pool.
- The duplicate-tag blocker narrowed but did not clear. `aml_architecture` is no longer duplicated, but scene-level concepts still repeat across content scenes, including `mutual_evaluation` and `fiu`.
- No new methodology blocker class emerged; this is still a citation-discipline + distinct-concepts-per-scene failure, not a new type of defect.

If lesson 0.3 is regenerated again, preserve the now-cleared deep-case fix and reprompt specifically against the remaining citation-discipline and duplicate-tag bundle.

## [2026-05-29] - Latest factual-fidelity re-audit: earlier fixes stuck, but three residual source-level blockers remain

Re-audited the latest user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against current FATF, APG, Egmont, BFIU/Bangladesh Bank, NCA, and FinCEN materials. Verdict stayed `DISAGREE`.

What this pass confirmed:
- The earlier 2026-05-29 blocker bundle appears fixed in the current draft: FATF Recommendation 26 is now separated from Recommendation 27 powers; the call-for-action consequences are now framed at the correct EDD/countermeasure level; Ottawa replaces Toronto for the Egmont Secretariat; and the FATF Recommendations / Egmont Principles dating is now current.
- The Bangladesh APG chronology defect is still present in a narrower form: the lesson still treats Bangladesh's 2020 APG document as the third-round MER, but APG's Bangladesh MER was adopted in 2016 and the 2020 document is a follow-up report.
- The methodology citation is still not citation-precise: the lesson says the 2013 FATF methodology is amended most recently in December 2025, but FATF's current methodology page says the 2013 methodology was last updated in June 2023 and the December 2025 amendment belongs to the 2022 methodology.
- The Bangladesh comparison slide now carries the highest-value new scope defect: it says ATA 2009 sections 7 and 15 are the "offence and penalty" provisions for terrorist financing, but Bangladesh Bank/BFIU guidance uses section 15 for BFIU/reporting-agency powers (freezing, supervision, directions, reporting support). Section 7 carries the TF offence/punishment.

If lesson 0.3 is regenerated again, preserve the now-fixed earlier bundle and reprompt specifically against this residual set, otherwise the lesson risks regressing on issues already cleared.

## [2026-05-29] - Re-generated methodology audit: disagreement still not resolved

Re-audited the latest user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against methodology v1.1. Verdict stayed `DISAGREE`.

What this pass confirmed:
- No new methodology blocker class emerged; this is still the same repair bundle as the earlier 2026-05-29 methodology note.
- The lesson still has no deep-case scene grounded in a real public enforcement action with named entity + year + substantive analysis.
- Citation discipline is still short of the name+section / lesson-pool-locatability standard. The opening architecture reading, the supervisor-mapping slide, and the synthesis reading still depend on broad or unpooled references.
- The duplicate-tag problem narrowed but did not clear: `aml_architecture` is still reused across `Why architecture matters before doctrine` and `The four layers of AML/CFT architecture`.

If lesson 0.3 is regenerated again, keep this methodology bundle explicitly in the reprompt; the artifact is not just waiting on currency-sensitive factual cleanup.

## [2026-05-29] - Factual-fidelity re-audit: current user-supplied global-architecture lesson still blocked

Re-checked the current user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against live FATF, APG, Egmont, BFIU, NCA, and FinCEN materials. Verdict stayed `DISAGREE`.

What this pass newly/independently confirmed:
- `FATF and the Forty Recommendations` misstates Recommendation 26 by assigning it the supervisor powers that belong to Recommendation 27.
- `The mutual evaluation: technical compliance and effectiveness` still overstates the FATF call-for-action list by saying the "black list" signals countermeasures. FATF's current statement applies enhanced due diligence to all listed high-risk jurisdictions and countermeasures only in the most serious cases.
- `Financial intelligence units and the Egmont Group` says the Egmont Group is headquartered in Toronto, but current Egmont Secretariat documents place it in Ottawa.
- Several citation labels are stale again: FATF Recommendations are currently updated October 2025; the FATF methodology page now distinguishes the 2022 methodology (amended December 2025) from the 2013 methodology (last updated June 2023); and the Egmont Principles citation should not still be pegged to 2013.

Keep these fixes bundled with the still-open methodology defects (deep-case absence, citation-discipline/name+section granularity, duplicate core concept tags) before any new re-review.

## [2026-05-29] - Methodology re-audit: user-supplied global-architecture lesson still blocked

Re-reviewed the user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against methodology v1.1. Verdict stayed `DISAGREE`.

What this re-check confirmed:
- No new methodology blocker surfaced; this is not a different failure mode from the 2026-05-25 methodology audit.
- The lesson still lacks a real enforcement deep-case scene; the APG/Bangladesh material is institutional/process analysis, not a named public enforcement action.
- Citation discipline is still below the v1.1 bar. Multiple reading scenes use broad citation labels rather than claim-traceable name+section references, and the jurisdictional/scaffold slides depend on legal/institutional references that are not cleanly section-anchored in the lesson pool.
- Duplicate core concept tags still recur across scenes, so the lesson still fails the distinct-concepts-per-scene rule.

Reminder for the next lesson-0.3 regeneration pass: the currency-sensitive factual blockers are not the whole story. Keep the methodology repair bundle (deep case + citation granularity + duplicate-tag cleanup) in scope too.

## [2026-05-29] - Resumed the interrupted doer session; spine integration committed; consolidated to one session

Picked up the interrupted "doer" session (it had been running in parallel with a "consultant" audit session on 05-25). Reconstructed state: the doer had built the Path-2 follow-up (spine wired into `generate-course.ts`, two new modules, gate refinements), left it type-clean but uncommitted, and a first live full-spine run on CAMS lesson 0.3 (`the-global-architecture-fatf-fius-supervisors`) was interrupted at Codex iteration 2/3 — both DISAGREE, no saved artifact.

Decisions this session:
- Committed the spine-integration code + the consultant session's ADR 0020 / methodology v1.1 / doc edits as one milestone (they're one story — v1.1 decided the spine, the code implements it).
- Consolidated to a single session going forward. The dual-session setup was a footgun: both sessions wrote the same memory files + working tree and audited/generated the same lesson with no lock. The "consultant" review role is largely subsumed by the Codex cross-check (the spine's independent factual-fidelity + methodology reviewer — the whole premise of ADR 0020).
- Re-running lesson 0.3 cold through the integrated spine to test the currency question. The residual DISAGREE blockers are currency errors (stale FATF facts the model can't self-correct). If the spine's own Codex-feedback loop can't converge it within the cap, the next move is a lightweight current-facts injection into the generation system prompt + cross-check briefs BEFORE the full 36-lesson run — not a full currency-tracking layer (that stays post-launch per ADR 0020).

Gotcha for the re-run: a fresh `lesson 0 3` run starts cold (no carried-over feedback from the dead run's JSONL — the orchestrator's loop counter is in-memory, not JSONL-derived), and it overwrites `.codex.1.txt`/`.codex.2.txt`. The prior run's verdicts survive in `review_events.jsonl`, so the audit trail is preserved.

## [2026-05-25 10:30] - Supplemental factual-fidelity audit: global-architecture lesson still blocked

Reviewed the user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` directly against current FATF, APG, BFIU, NCA, FCA/HMRC, and FinCEN public materials. Verdict remained `DISAGREE`.

What newly/independently blocks publication in this revision:
- The slide "`Three jurisdictions, one framework`" says the United States has no FSRB. APG’s official member page says the United States is a founding APG member (1997) and also a FATF member.
- The US-jurisdiction scene/slide uses present-tense AML-supervisory framing for investment advisers. FinCEN delayed the investment-adviser AML rule to 1 January 2028 on 31 December 2025, so the lesson currently overstates the BSA perimeter.
- The FATF methodology citation is stale again. FATF now publishes the Recommendations as last updated in October 2025 and splits the methodology page into the 2022 methodology (amended December 2025) and the 2013 methodology (last updated June 2023).
- The Recommendation 19 / grey-list scope problem remains. FATF’s increased-monitoring statements expressly say the grey list does not call for enhanced due diligence measures.

One nuance to preserve: this user-supplied revision no longer appears to repeat the older "Bangladesh FUR 2020 = MER" wording that an earlier audit caught. If the working-copy artifact is edited from an older branch or stale generated file, re-check that APG chronology point before re-review.

## [2026-05-25 09:25] - Latest draft fixed the earlier US/R19 issues but is still blocked

Fresh primary-source re-check of the latest user-supplied lesson JSON narrowed the blocker set but did not clear it.

What appears fixed in this draft:
- FATF Recommendation 19 / grey-list scope is now framed correctly: grey-listing is not itself an R.19 EDD trigger.
- The comparative slide now correctly reflects the United States as an APG founding member.
- The U.S. supervisory-perimeter scene now correctly notes FinCEN's 31 Dec 2025 delay of the investment-adviser AML rule to 1 Jan 2028.

What still blocks publication:
- `FSRBs and Bangladesh's place in the peer-review system` says FATF has "40 members and two regional-organisation members." FATF says it has 40 members total: 38 jurisdictions and 2 regional organisations.
- Multiple FATF citation labels still use stale "updated November 2023" dating even though the Recommendations are currently updated October 2025.
- `Deep case: Standard Chartered Bank and the multi-supervisor enforcement architecture` misstates the 2012 NYDFS chronology: the $340 million DFS settlement was announced in August 2012 and formalised by a 21 Sep 2012 consent order, not entered in December 2012.
- The same deep-case scene misdescribes FATF Recommendation 6 as covering "terrorism and proliferation." Per the current FATF Recommendations, proliferation is Recommendation 7.

## [2026-05-25 08:47] - Methodology audit: global-architecture lesson blocked

Reviewed the CAMS lesson artifact `the-global-architecture-fatf-fius-supervisors` against methodology v1.1 and returned `DISAGREE`.

What blocks publication:
- No deep-case scene grounded in a real public enforcement action. The lesson has a Bangladesh/APG worked example, but that is a mutual-evaluation walkthrough, not a named enforcement matter with year + substantive analysis.
- Citation discipline is below the v1.1 bar. Multiple reading scenes use free-text citation labels instead of claim-traceable name + section citations, and the jurisdictional scenes/slides rely on legal references and institutional splits that are not consistently section-anchored in the lesson citation pool.
- The lesson also violates the "distinct concepts per scene" expectation by repeating the same core FATF / FSRB / FIU concept sets across multiple scenes.

Soft-pass notes:
- No obvious prohibited-source / commercial-guide contamination was detected from the artifact itself.
- Tone is adult-professional and mostly free of marketing register.

## [2026-05-24 EOD] - Path 2 build complete; SME track started in parallel

Built all five Path 2 cycles in priority order (ADR 0019). Summary:

- Cycle 1 (CLI runner for the gate seed): `scripts/validate-lesson.ts <course-slug> [--all | <lesson-slug>]`. Exit codes 0/1/2/3 = pass/flag/fail/invocation-error. Validates each of the three CAMS fixtures end-to-end.
- Cycle 2 (`citation_bind.ts`): substring-verified bind for structured factual references with lesson-wide candidate scope (calibration decision against Path-1 fixtures), multi-bindKey alias expansion (UK/BD statute abbreviations, FATF R variations, UNSCR forms), and range / `et seq.` expansion in candidate labels. Integrated as gate 7 in `runGates`. Catches real gaps in the Path-1 artifacts that the prior Codex per-artifact rounds missed (1.2's UNSCR 1373 / FATF R.5 unanchored, 1.3's BD ATA 2009 / MLPA 2012 unanchored in scene 6, 1.1's § 5324 unanchored in quiz).
- Cycle 3 (`lesson_review_events` migration + backfill script): table matches the Path-1 JSONL 1:1; service-role writes, authenticated reads; indexes for timeline-per-lesson and content-addressable lookup. Migration **NOT yet applied** — Ripon runs `supabase db push` when ready, then `pnpm tsx scripts/backfill-review-events.ts cams` to ingest the 18 Path-1 events.
- Cycle 4 (`codex_dispatch.ts`): `dispatchCodex` always pipes brief via temp file + stdin (closes the codex-rescue self-attribution failure mode at the infrastructure level); `parseVerdict` is line-based (robust across Codex's line-break variations); `parallelCrossCheck` runs methodology + factual-fidelity in parallel (collapses two iterations into one per the LQB lesson). `appendReviewEvent` writes JSONL always + DB best-effort.
- Cycle 5 (source registry semantics + iteration cap): `outline.sources[]` is ADVISORY per Ripon's instinct; the citation gate's outline-resolution rate is informational, the only FAIL condition is total disjoint (likely wrong outline). `MAX_CODEX_ITERATIONS_PER_LESSON = 3` validated against Path-1 history: 1.1 = 0 events (calibration), 1.2 = 3 (at cap), 1.3 = 6 (over cap — vindicates the 3-iteration threshold as the right operational signal). `countPriorCrossChecks` reads the JSONL so the cap works without the DB.

Key Path 2 gotchas to preserve:

- The validate_gates.ts and the new modules type-check cleanly (`pnpm tsc --noEmit` exits 0). Treat the 7 gates as the contract; don't tighten thresholds without re-validating against the Path-1 fixtures.
- The methodology gate 6b (item↔narration ref consistency) is over-sensitive on equivalent reference forms (e.g. `UNSCR 1373` in item vs `UN Security Council Resolution 1373` in narration). It produces FLAG, not FAIL. A refinement to normalise reference forms is in the follow-up backlog.
- The citation_bind regex for FATF Recommendations doesn't yet handle comma-separated lists ("Recommendations 20, 26–29" — matches "20" but misses "26–29"). One outstanding unbound claim in 1.3 (`FATF R.26`) traces to this. Refinement in the follow-up backlog.
- `codex-rescue` subagent has a one-time-observed self-attribution failure mode (claimed shell-arg-size limits, produced Claude-written verdict). For new code, use `dispatchCodex` directly — that's the whole point of cycle 4. Treat the subagent as a last-resort fallback if `codex_dispatch` can't be invoked for some reason.
- Per-course `review_events.jsonl` remains the source of truth even after the DB migration is applied. `appendReviewEvent` writes JSONL synchronously (no fallback path) and the DB best-effort. If the DB write fails (table missing, env missing, network), the JSONL append still succeeds and the workflow continues. This is graceful by design.

## [2026-05-24 22:35] - CAMS lesson 1.3 sixth cross-check: scene 6 narration residual cleared

Ran a narrow verification on `generated/cams/lessons/why-states-regulate-financial-institutions.json` against the user-reported fix. The prior round-5 residual is actually gone: the scene-6 narration no longer contains the unsupported entity-count inference and now uses the same FinCEN `SAR Stats` wording as item 5 ("depository institutions filing the substantial majority of total US SAR submissions annually").

Also re-checked the items the user said round 5 had already cleared and found no regressions: HSBC still correctly uses docket `1:12-cr-00763-ILG` / Judge I. Leo Glasser and does not name Cherkasky; the Travel Rule scope still distinguishes financial institutions / VASPs from DNFBPs; the AMLA sentence still limits direct supervision to selected cross-border credit/financial institutions from 2028; scene 5 still defines VASPs by activity including unlicensed operators; scene 4 still states the DNFBP perimeter correctly; scene 8 still frames the FinCEN Files as named public-record context with the regulatory substance carried by FATF / AMLA / EU primary materials.

## [2026-05-24 22:10] - Comparative launch-bar scoring: CAMS 1.2 passes, CAMS 1.3 still blocked

Read all three lesson artifacts directly from disk and scored lesson 1.2 and lesson 1.3 against lesson 1.1 as the calibration artifact.

Result:
- Lesson 1.2 (`what-terrorist-financing-actually-is.json`) clears the calibration bar. Structure, deep-case treatment, quiz design, and source discipline are at or above lesson 1.1.
- Lesson 1.3 (`why-states-regulate-financial-institutions.json`) still does not clear the bar. The old scene-6 Travel-Rule error is fixed, but two new approval blockers remain:
  1. Scene 6 ("Same architecture, asymmetric burden") makes quantitative burden claims (`FinCEN SAR Stats`, "tens of billions", "hundreds of dollars per customer") without primary-source support in the scene or adjacent reading scenes.
  2. Scene 8 ("The structural critique: the FinCEN Files") uses ICIJ/BuzzFeed investigative reporting as substantive lesson source material instead of pointer-only context, which falls below the committed primary-source-only methodology.

If lesson 1.3 is revised again, re-check scene 6 for unsupported quantitative burden language and rebuild scene 8 from primary/public-source materials (for example statutory/reform texts and public official materials) rather than journalistic reporting as the scene's core authority.

## [2026-05-24 21:30] - CAMS lesson 1.3 revised artifact still blocked on scene 6 narration

Ran the second cross-check on the revised `generated/cams/lessons/why-states-regulate-financial-institutions.json` artifact (hash `e1a51dbb0abad6aa62efb9f89d39bf81d8bc7522f55296bc976411c40bcd664a`).

What cleared:
- HSBC scene now correctly uses `1:12-cr-00763-ILG` / Judge I. Leo Glasser for the 11 Dec 2012 filing, with John Gleeson limited to the later 1 July 2013 memorandum/order.
- The scene no longer names Michael Cherkasky; it stays at the source-supported “five-year independent compliance monitor.”
- The comparison-slide bullet now correctly says R.16 / Travel Rule applies to financial institutions and is extended to VASPs by INR.15, not to DNFBPs by R.22/R.23.
- The AMLA sentence is now directionally correct: AMLA operational in mid-2025, direct supervision for selected high-risk cross-border credit/financial institutions from 2028, DNFBPs left with national supervisors plus AMLA coordination/indirect oversight.

What still blocks approval:
- Scene 6 narration still says FATF Recommendations 10, 11, 16, 20, and 21 are “the same words on the page” for a bank, DNFBP, and VASP, and explicitly includes the Travel Rule in the common obligations. That reintroduces the same substantive error the corrected bullet fixed. R.22 extends 10/11/12/15/17 to DNFBPs and R.23 extends 18/19/20/21; DNFBPs are not brought under R.16.

If this lesson is revised again, re-check both the comparison slide items and the narration/script separately; the structured bullet was fixed but the spoken narration was not.

## [2026-05-24 20:30] - CAMS lesson 1.3 review blocked approval

Independent second-opinion review of `generated/cams/lessons/why-states-regulate-financial-institutions.json` returned `SPLIT`, with approval-blocking citation/content defects concentrated in the HSBC and regulated-sector scenes. The lesson's 11-scene structure is correct and the FinCEN Files scene stays distinct from the HSBC deep case, but four specific fixes are required before approval:

1. HSBC scene: "filed before Judge John Gleeson" is wrong for the 11 Dec 2012 filing. The filed docket materials are `1:12-cr-00763-ILG` (Judge I. Leo Glasser). Gleeson appears on the later July 2013 memorandum/order.
2. HSBC scene: Michael Cherkasky is named as the five-year monitor without a supporting cited primary source in the scene's citation list.
3. Comparison slide: wrongly extends the Travel Rule to DNFBPs. FATF R.16 applies to financial institutions and INR.15 extends the equivalent obligation to VASPs; DNFBPs get R.10/11/12/15/17 via R.22 and R.18/19/20/21 via R.23, not R.16.
4. DNFBP scene: overstates the EU AMLA framework by saying AMLA will directly supervise the largest cross-border DNFBPs from 2025 onward. Direct supervision under the 2024 AMLA framework is for selected credit/financial institutions, not DNFBPs.

If the content pipeline or SME-review workflow is tightened later, add checks for: docket-judge mismatches in enforcement scenes, monitor-name sourcing, and FATF-scope comparisons that collapse FI / DNFBP / VASP obligations into a single bucket.

Running notes between Claude Code sessions. Append observations, partial work, things to remember next time. Cleared and archived periodically by the owner.

Format: ## [YYYY-MM-DD HH:MM] — short title

---

## [2026-05-20] — Initial session

Foundation scaffold completed. Memory system established. Ready for Prompt 2 (Supabase setup).

No partial work. No open threads.

---

## [2026-05-20 22:15] — Supabase + auth done, schema next

Supabase wiring complete. pgvector enabled on the Singapore project. Note: Prompt 2 specified `middleware.ts` but Next.js 16 deprecated that convention — migrated to `proxy.ts` (Ripon approved); ADR 0002 reflects this. Google OAuth credentials still need to be created in Google Cloud Console (see docs/SETUP-google-oauth.md). Database is empty of user tables — Prompt 3 will write the full schema (courses, modules, lessons, students, enrollments, mock exams, student knowledge state, classmate interventions, examiner data, commercial tables). No partial work or open threads from this prompt.

---

## [2026-05-20 22:45] — Schema applied, ready for Anthropic SDK

Six migrations applied cleanly. ~40 tables across six domains. RLS policies in place. pgvector cache table (cached_qa) ready with similarity-search RPC. One hiccup: the first `db push` failed because the `vector` type sits in the `extensions` schema and was not on the apply-time search_path — fixed with `SET search_path = public, extensions` in the three vector-using migrations + the match_cached_qa function, then re-pushed cleanly (ADR 0003 records the pattern). Next: wire Anthropic SDK and Claude client (Prompt 4). No partial work, no open threads.

---

## [2026-05-20 23:00] — Schema hardened against Supabase advisors

Ran the Supabase advisor lint (via the /supabase:supabase skill). Upgraded the Supabase CLI 2.53.6 -> 2.100.1 (scoop) to get `db advisors`. Two follow-up migrations (advisor_hardening + fix_subscriptions_rls_initplan) cleared all 4 security + 71 performance WARNs; advisors now report 0 WARN/ERROR. Effective access is unchanged (service_role bypasses RLS) — policies were just scoped and rewritten for performance. The enrollment-gated content-read RLS policies were resolved by ADR 0004 (content stays service-role-only; reads go through the admin client) rather than added as policies. Next: wire Anthropic SDK and Claude client (Prompt 4).

---

## [2026-05-21 00:30] — AI plumbing done (via OpenRouter); auth UI next

Claude client wrapper complete. Smoke test confirms Haiku ("Haiku alive"), Sonnet ("Sonnet alive"), and embeddings (1536-dim) all alive through OpenRouter — total ~0.02 cents. Major deviation: Prompt 4 was written for the direct Anthropic SDK, but Bangladeshi cards cannot fund Anthropic/OpenAI API billing — so the wrapper was reworked onto OpenRouter (OpenAI-protocol; `openai` SDK + custom baseURL; ADR 0005), and `@anthropic-ai/sdk` was removed. ARCHITECTURE.md was updated to match. Prompts are placeholder v0.1. Open items: OpenRouter has no Batch API, so Layer 1 course-generation cost is ~2x the estimate (ADR 0005 open questions); Whisper ASR needs a separate provider path. No partial work. Next: auth UI (Prompt 5).

---

## [2026-05-21 11:00] — Production live; auth UI next

www.ensoacademy.ai is the canonical production URL from now on (the apex ensoacademy.ai 308-redirects to www — Ripon's choice; Vercel set up manually). Every commit to main auto-deploys via Vercel. Localhost stays the iteration environment but smoke tests run against production (ADR 0006). Added /api/health/supabase. Both production smoke tests green: Supabase health (ok:true, 0 courses) and AI/OpenRouter (Haiku + Sonnet + 1536-dim embedding, ~0.02 cents). No env-var mismatches between Vercel and the code. Next: Prompt 5 — auth UI with Google OAuth (Playwright-driven GCP Console setup).

---

## [2026-05-21 12:00] — Auth UI live; design system v1

shadcn/ui installed — Base UI variant (the current CLI's default; not classic Radix — `render` prop, not `asChild`). Design system v1 locked: Geist, teal #0F3D3E, coral #E07856, light mode only (ADR 0007). Auth pages (/login, /signup, /reset-password, /auth/update-password) + protected /dashboard built; production build clean; Playwright screenshots of /login and / confirm the teal/Geist design renders correctly. Google OAuth button is a placeholder toast. Supabase Auth configured via `supabase config push` (config-as-code in supabase/config.toml). Gotcha learned: a piped/non-interactive `config push` applies on EOF (the `[Y/n]` defaults to Yes) — it briefly disabled MFA TOTP and changed OTP settings; caught and restored by reconciling config.toml to the remote. Next: Prompt 6 — course catalog + enrollment, or lesson player skeleton (confirm priority).

---

## [2026-05-21 13:00] — Lesson player live; the product is real now

ensoacademy.ai now has a working learning experience. Authenticated users browse /courses (auto-enrolled in the CDCS dev course), open a lesson, navigate content elements, and ask the AI lecturer questions — cache-first via match_cached_qa, Haiku on miss, answer cached. Session tracking writes sessions + session_events. Verified locally via Playwright: a grounded Haiku answer, then the same question returns the cached answer with a "cached" badge. Note: the lecturer grounds on a 3-element context window around the current element, so a question about content outside that window gets a correct "outside this section's scope" answer — expected behaviour, but for a strong demo, ask a question relevant to the element on screen. Minor cosmetic: the dev-seed content has indented continuation paragraphs (the SQL was written with indentation; whitespace-pre-wrap preserves it) — harmless, will vanish when Opus-generated content replaces the seed. Deviation: Base UI shadcn again — `<Button asChild>` in courses + dashboard adapted to buttonVariants(). Next: Prompt 7 — TTS narration, mock exam engine, or classmate gap-detection (confirm priority with Ripon).

---

## [2026-05-21 14:00] — Mock engine live; structural completeness reached

Students can now study a lesson and sit a 20-question, 40-minute CDCS mock — real score, per-domain breakdown, per-question review with explanations, readiness state. Signoff infrastructure wired (signoff_events on transitions); 'ready' needs 5 attempts. Verified locally via Playwright: full mock, two-step submit, results page (15%), student_readiness + signoff_event written. Seed hiccup: the bank ended up with 32 questions, not 30 — I drafted 14 UCP questions instead of 12; harmless, fixed the sanity-check count to 32. Deviations: ADR numbered 0010 per the prompt's explicit filename (0009 gap left for a future prompt); mock option order is not shuffled per attempt in v1 (questions are shuffled; options keep seed order). Product is now structurally complete: study + assess. Next: Prompt 8 — TTS audio narration (Google Cloud TTS).

---

## [2026-05-22 08:30] — TTS audio narration live; the product has voice

Listen mode is in the lesson player. GCP setup ran differently from the prompt's plan: instead of Ripon running the interactive scripts/setup-gcp-tts.ts, he logged into GCP Console in the Playwright browser and Claude clicked through the whole flow — created the project enso-academy, enabled the Text-to-Speech API, created the enso-academy-tts service account, downloaded the JSON key (Playwright captured the download), placed it in .secrets/. Billing was already linked. No "Cloud Text-to-Speech User" IAM role exists — TTS needs no role once the API is enabled, so the service account was created role-less. Pre-generation of all 16 CDCS content elements cost ~$0.23 (prompt estimated ~$0.40). One bug found in local verify and fixed: the audio status indicator stuck on "Loading audio…" because a discrete 'play' event was being missed — added onPlaying + an onTimeUpdate catch-all so status reliably reaches 'playing'. This mattered because the Pause/Resume control only renders when status is 'playing'/'paused', so the stuck status hid the Pause button (audio felt unstoppable). Auto-advance through all elements is by-design and stops at the last element. Vercel GOOGLE_APPLICATION_CREDENTIALS_JSON env var was set by Ripon. Next: Prompt 9 — classmate gap-detection (the moat feature).

---

## [2026-05-22 11:30] — Strategic re-plan, then the student model spine

Between Prompt 8 and Prompt 9, Ripon paused for a strategic gut-check. He shared the Lamppost codebase (the KhaM Labs K-12 product, also OpenMAIC-descended, AGPL-3.0) and the ENSO-ACADEMY-6.0-FRAMEWORK doc. Honest assessment surfaced the gap: prompts 1-8 built the platform's surfaces but skipped the 4.0/5.0 spine — the student model and lecturer memory were empty schema tables. The framework's defining capabilities were not in the runtime.

Outcome: `docs/FRAMEWORK.md` (the moved 6.0 framework) and `docs/ROADMAP.md` (a re-sequenced execution plan) are now canonical docs. CLAUDE.md "read this first" lists them. The roadmap rule: spine before surface — build the student model and memory before the classmate (the classmate's gap detection is a function of the student model and cannot be real without it). The relay sequence was re-derived: Prompt 9 student model → 10 memory → 11 classmate, with the Opus content pipeline as a parallel launch-gating track.

Then Prompt 9 executed: the student knowledge model. student_knowledge_state already had the right columns — no migration. lib/student-model/knowledge.ts (recordEvidence / getMasterySummary), wired into submitMockExam, completeLesson, and askLecturer. Verified locally — a mock populated 30 concept rows with a correct mastery spread; the lecturer answers through the new reader path. The AI lecturer now knows what the student knows. Next: Prompt 10 — lecturer memory.

---

## [2026-05-22 12:00] — Lecturer memory live; the lecturer remembers

Prompt 10 — the 5.0 spine. lib/student-model/memory.ts: a Sonnet summarization at lesson completion distils the session's questions into 0-3 durable relational facts (student_memory); the lecturer reads them as a preamble and as a continuity greeting. student_memory already had the columns — no migration. Writer scheduled via Next.js `after()` so completing a lesson stays fast. Verified locally: asked the lecturer goal- and struggle-revealing questions, completed the lesson, and the after() summary produced exactly the right three facts — a goal ("trade finance leadership role"), a struggle ("counting the five-banking-day window"), and a preference ("slow, step-by-step pace"). Re-opening a lesson, the Q&A panel opened with a lecturer greeting that referenced the struggle and the pace preference — the framework's signature continuity moment, working. The memory module sits beside knowledge.ts: the lecturer now knows what the student knows AND who they are. Next: Prompt 11 — the classmate, which finally has the full student model to detect blind spots against.

---

## [2026-05-22 12:30] — The classmate live; the 6.0 pedagogical spine is complete

Prompt 11 — the moat, and the prompt the re-sequencing existed for. lib/classmate/actions.ts: checkClassmateGap runs when the student advances past a lesson element. It is model-grounded — it fires only on an evidenced gap (a concept the element taught with student_knowledge_state mastery < 0.45 and observation_count > 0). No evidence, no fire — so a never-assessed student rarely sees it, which is correct. classmates / classmate_interventions already had the right shape and the qa_origin enum already had 'classmate_asked' — no migration. The classmate is per-course (one shared character). Fires once per session (tunable). On a gap: Sonnet generates an in-character question, Haiku answers as the lecturer, both render in the Q&A panel; logged + seeded into cached_qa tagged 'classmate_asked' (moat 4). Verified locally: the classmate "Lena" fired on independence_principle (the demo account's weakest concept at 0.30) with a genuinely natural question — slightly unsure, first person — and the lecturer answered. Fired exactly once across four element advances. The 6.0 pedagogical spine — student model, memory, classmate — is now complete. Per docs/ROADMAP.md, what remains before launch is the parallel content track (Opus pipeline + first real course) and Prompt 12 (payments). The spine is done; the rest is content and commerce.

---

## [2026-05-22 13:00] — Course-generation methodology committed

The real v1.0 course-generation methodology is now in the repo at docs/COURSE-GENERATION-PROMPT.md (it replaced the placeholder). Delivered via an adapted PROMPT-08.5 — Ripon asked for a recheck before executing. The original prompt predated the re-sequencing: it referenced "Prompt 9 = content pipeline" and "ADR 0012", both stale (Prompts 9-11 were the student-model spine; ADR 0012 is the student model). Executed adapted — ADR 0015, no stale Prompt-9 language, and the methodology file read from disk rather than pasted. One substantive concern surfaced and recorded in CLAUDE.md gotchas + ADR 0015: the methodology prohibits building lessons from copyrighted ICC rule text (UCP 600, ISBP, etc.), but the hand-seeded CDCS dev course + 32-question bank teach directly from UCP 600 articles — they are placeholders to be replaced by methodology-compliant generated content. CDCS is the methodology's hardest IP case; CAMS is the cleaner first real course (abundant free primary sources; the methodology's own worked example). Also noted: the methodology's "What you should produce" section is prose, not a machine output contract — the content-pipeline prompt must define the structured output format. Next: the content-pipeline prompt, designed around this methodology.

---

## [2026-05-22 14:30] — Scene model + lesson player v2

After driving the OpenMAIC live demo, the call was made (Claude's, delegated by Ripon — "decide as if this is your product"): lessons become typed SCENES; ship designed narrated slide/quiz/reading scenes; cut the whiteboard/playback-director engine. Prompt 12 executed it. content_library_elements gained scene_type + scene_data; lib/lesson/scenes.ts is the contract; renderers in components/lesson/scenes/; the lesson player now renders scenes. Two migrations (scene_model schema, CDCS lesson-1 re-seed). The spine carried over untouched and quiz scenes now feed the knowledge model. Verified locally end to end. Key point for the NEXT prompt: lib/lesson/scenes.ts is the structured output contract — the content pipeline (Prompt 13) tells Opus to emit exactly that shape. Numbering: content pipeline = Prompt 13, payments = Prompt 14. interactive/pbl scene types exist in the contract but render as placeholders — their runtimes are a deliberate fast-follow (no course regeneration needed when built). docs/COURSE-GENERATION-PROMPT.md should, in a future revision, reference the scene contract as its output format.

---

## [2026-05-22 16:00] — Content pipeline built and trial-validated

Prompt 13. lib/ai/generator/ — a staged Opus pipeline (outline → per-lesson scenes → per-module assessment) + scripts/generate-course.ts (the operator CLI). The methodology is the verbatim system prompt; output is the lib/lesson/scenes.ts contract; artifacts persist under generated/ (gitignored, resumable). No migration — all target tables existed; courses.status defaults to 'draft', /courses filters status='published' so a draft is auto-hidden. The script loads .env.local via dotenv then DYNAMIC-imports the generator (lib/ai/client.ts throws at module load without OPENROUTER_API_KEY). Trial run for $3.52 of real Opus: CAMS outline (9 modules / 40 lessons) + lesson 1.1 (11 scenes) → written as a 'cams' draft course → verified rendering in the scene player. The generated content is genuinely methodology-compliant (primary-source citations, public cases, nominative naming). The full CAMS generation was NOT run — it is hours of operator work + SME review (docs/RUNBOOK-course-generation.md). A CAMS draft course now exists in the DB (slug 'cams', only lesson 1.1 has content); the demo account has a verification enrollment. NEXT: the full CAMS generation + SME review is the launch gate (operator/content work); then Prompt 14 — Stripe/payments. The engineering for launch is essentially complete.

---

## [2026-05-22 16:30] — HANDOFF: next session starts with UX/UI + branding

**State of the build.** The launch engineering is essentially complete and live in production:
- The 6.0 pedagogical spine — student knowledge model (Prompt 9), lecturer memory (10), the model-grounded classmate (11).
- Scene-based lesson delivery — lessons are typed scenes (reading/slide/quiz rendered; interactive/pbl placeholdered); Prompt 12.
- The mock engine + readiness signoff (Prompts 7) — untouched and working.
- The content pipeline — lib/ai/generator/ + scripts/generate-course.ts; Prompt 13. A CAMS draft course is trial-generated (1 of 40 lessons; slug 'cams', status 'draft', hidden).

**Ripon's direction for the next session: do a UX/UI flow + proper branding pass FIRST, then payments.** The numbering shifts — UX/UI is Prompt 14, payments Prompt 15.

**START HERE next session:**
1. Read CLAUDE.md + docs (FRAMEWORK, ARCHITECTURE, ROADMAP, PROGRESS, these notes), as always.
2. Ask Ripon what specifically he wants in the UX/UI + branding pass before drafting Prompt 14. Likely candidates — a real marketing/landing page; a brand-identity/wordmark polish; an end-to-end journey audit (landing → signup → /courses → /courses/[slug] → lesson player → mock → results/signoff → dashboard). It may be all three; let him scope it.
3. Draft Prompt 14 (UX/UI + branding) per his answer; then Prompt 15 (Stripe / payments).
4. The design system is locked at v1 (ADR 0007 — Geist, teal #0F3D3E / coral #E07856, light mode only, no dark mode). "Proper branding" extends that outward to the public surface; do not silently redo the token system — if a branding change touches ADR 0007, raise it.

**Parallel, operator-run (not an engineering prompt):** the full CAMS generation + SME review — docs/RUNBOOK-course-generation.md. That is the real content launch gate.

---

## [2026-05-22 ~17:30] — Prompt 14 shipped: landing page + brand v2 + journey re-skin

Ran Prompt 14 in a continuing session (not a fresh one — the session already held the drafted prompt and the reviewed Gemini cuts, which helped). The journey audit (the original Step 2/3) was skipped by Ripon's choice — visual review happens post-deploy instead.

Brand identity v2 integrated from two Gemini first-cut artifacts (docs/prompts/gemini-output.md round 1 = brand foundation + landing page; gemini-output-2.md round 2 = in-app surfaces). Shipped as two commits: the landing milestone first (3768d18), then the journey re-skin.

Notes for next time:
- The design tokens now cascade app-wide. `--font-sans` is Outfit (both display and body); if dense in-app text ever reads poorly, splitting body back to Geist Sans is the lever.
- `tw-animate-css` was installed but never imported — globals.css now `@import`s it (needed for the `animate-in` utilities). `text-2xs` is a custom `@theme` token. `@keyframes float` lives in globals.css for the hero mascot.
- The mock taker uses a deliberate off-palette cold slate theme ("Cold Fidelity") — do NOT "fix" it to teal/coral.
- Landing CourseLineup availability: CDCS = "Available now", CAMS/CCAS = "Coming soon" — placeholder, matches the current DB (CDCS published, CAMS draft). Revisit when CAMS is generated + published.
- OG image: metadata is set but no custom OG image was generated (Higgsfield was available; deferred). Add a real OG image before launch.
- The in-app re-skin is build-verified only — there was no authenticated Playwright walk (no test credentials this session). Worth a real visual pass on production post-deploy.
- `components/brand/wordmark.tsx` and the old `app/(dashboard)/dashboard/sign-out-button.tsx` were deleted (superseded by `<Logo>` and `components/in-app/sign-out-button.tsx`).

Next: Prompt 15 — payments (and the real /terms + /privacy pages).
## [2026-05-29] - Current factual-fidelity audit: earlier APG/methodology/ATA fixes hold, but a different FATF/Egmont bundle now blocks publication

Re-audited the current user-supplied JSON for `the-global-architecture-fatf-fius-supervisors` against FATF, APG, Egmont, MONEYVAL, ECB, and BFIU/Bangladesh Bank materials. Verdict stayed `DISAGREE`.

What this pass confirmed:
- The prior Bangladesh-specific residual bundle appears fixed in this draft: Bangladesh's APG chronology is now 2016 MER plus 2020 follow-up, the FATF methodology label is back to `2013, last updated June 2023`, and ATA section 15 is no longer described as the TF offence/penalty provision.
- A different source-level bundle still blocks publication. The opening architecture reading and slide still cite the FATF Recommendations with stale `updated November 2023` dating, even though FATF's current Recommendations page says the text was last updated in October 2025.
- Those same architecture scenes still misattribute VASP supervision to FATF Recommendations 26-28. FATF's own VASP materials place AML/CFT regulation and supervision of VASPs under Recommendation 15 / INR.15.
- `The mutual evaluation: technical compliance and effectiveness` still overstates the call-for-action list by treating black-listing as a countermeasures consequence as such. FATF's current high-risk statement applies enhanced due diligence to all high-risk jurisdictions and countermeasures only in the most serious cases.
- `The Egmont Group: how FIUs actually share` introduces two fresh defects: INR.40 does not expressly direct FIUs to use Egmont channels, and the cited Egmont Principles are no longer just a 2013 document because the current Egmont revision is later.
- The lesson still teaches MONEYVAL as effectively the body for `Europe outside the EU`, which is inaccurate because MONEYVAL evaluates many EU member states as well.

If lesson 0.3 is regenerated again, preserve the now-cleared APG/methodology/ATA fixes and reprompt specifically against this FATF/Egmont/MONEYVAL bundle.
