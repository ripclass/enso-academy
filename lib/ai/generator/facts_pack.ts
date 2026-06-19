// lib/ai/generator/facts_pack.ts
//
// Operator-maintained CURRENT-FACTS reference for AML/CFT course generation.
//
// Why this exists (ADR 0020 names "currency" as the one residual gap the AI
// verification spine does not close): the generator's training knowledge has a
// cutoff, so it emits stale or imperfectly-scoped regulatory facts the
// fidelity cross-check then rejects — and re-prompting cannot supply a fact
// the model never had. The Path-2 first live run on lesson 0.3 capped on
// exactly this: FATF member-count wording, stale "updated November 2023"
// citation dating, R.6-vs-R.7 scope, VASP-supervision-under-R.26-28, INR.40 /
// Egmont misattribution, stale Egmont Principles dating, MONEYVAL scope.
//
// This block is injected (a) into the GENERATION system prompt and (b) into
// both Codex CROSS-CHECK briefs, so generator and reviewer share one current
// ground truth. Every fact below was verified against primary / authoritative
// public sources on the as-of date — keep that discipline on every revision.
//
// NOT a substitute for the planned currency-tracking layer (post-launch, ADR
// 0020); it is the lightweight stopgap that unblocks the CAMS run.
//
// Server-only by convention (lib/ai/* — see CLAUDE.md gotchas).

/** Date this facts pack was last verified against primary sources. Bump on every edit. */
export const FACTS_PACK_AS_OF = '2026-06-19'

/** Verified current AML/CFT facts. Injected into the generation system prompt
 *  and the cross-check briefs so both sides reason from the same ground truth. */
export const CURRENT_FACTS_PACK = `# CURRENT AML/CFT FACTS REFERENCE (operator-maintained, verified ${FACTS_PACK_AS_OF})

These facts were checked against primary / authoritative public sources more
recently than your training cutoff. Where any statement here conflicts with
your own recollection, THESE FACTS WIN — use them as written, and do NOT
"correct" them from memory. They cover the regulatory points most prone to
training-staleness; getting them exactly right is mandatory.

## FATF — the institution
- FATF has **40 members**, comprising **38 member jurisdictions and 2 regional organisations** (the European Commission and the Gulf Cooperation Council). The two regional organisations are PART OF the 40 — never write "40 members and two regional organisations" as if they were additional.
- Beyond the 40, the Global Network covers 200+ jurisdictions through FATF plus 9 FATF-Style Regional Bodies (FSRBs).

## FATF Recommendations — current edition & how to cite them
- Cite the standards as: *FATF, International Standards on Combating Money Laundering and the Financing of Terrorism & Proliferation — The FATF Recommendations*, current consolidated edition, **last updated October 2025**. Do NOT cite "updated November 2023" or any earlier year as the current edition.
- 2025 amendments not to contradict: Recommendation 1 + related Interpretive Notes (financial inclusion, Feb 2025); Recommendation 16 / the "Travel Rule" payment-transparency revisions (June 2025); assessment-methodology Annex IV for the revised R.16 (October 2025).
- Mutual evaluations run on the **2022 assessment methodology (as amended)** — do not present the older 2013 methodology as current.

## FATF Recommendation scoping — exact mappings (top source of fidelity errors)
- **R.6** = targeted financial sanctions related to **terrorism and terrorist financing**. **R.7** = targeted financial sanctions related to **proliferation financing**. NEVER say R.6 covers "terrorism and proliferation."
- **R.10** = customer due diligence (CDD). **R.12** = politically exposed persons. **R.16** = wire transfers / the Travel Rule (extended to virtual-asset transfers via INR.15).
- **R.15 + INR.15** = new technologies, **virtual assets and VASPs**. VASP AML/CFT regulation and supervision sits under **R.15 / INR.15** — NOT under R.26–R.28.
- **R.19** = higher-risk countries. Grey-listing ("Jurisdictions under Increased Monitoring") does NOT itself call for enhanced due diligence. EDD by all members applies to "High-Risk Jurisdictions subject to a Call for Action" (the black list), which as of the FATF public statement of 13 February 2026 lists **DPRK, Iran, and Myanmar**. FATF calls for **counter-measures** against DPRK and Iran, and for **enhanced due diligence** (not full counter-measures) for Myanmar. Do NOT say only DPRK and Iran are on the Call-for-Action list.
- **R.26** = regulation & supervision of financial institutions; **R.27** = powers of supervisors; **R.28** = regulation & supervision of DNFBPs. **R.29** = financial intelligence units (FIUs).
- **R.40** = other forms of international cooperation. INR.40 addresses cooperation among FIUs, supervisors and law-enforcement generally; it does NOT direct FIUs to exchange specifically "through Egmont channels." FIU-to-FIU information-exchange principles belong to the Egmont Group, not to the text of INR.40.

## FIUs / the Egmont Group
- The **Egmont Group Principles for Information Exchange between FIUs** were **revised July 2025**; the Egmont Charter was revised November 2025. Do NOT cite "July 2013" as the current Principles edition.
- Ground FIU-cooperation claims in Egmont materials and FATF R.29 / R.40 — cite the correct instrument for each claim rather than attributing Egmont practice to an INR.

## FSRBs / regional review bodies
- **MONEYVAL** is the Council of Europe's FATF-style regional body. It evaluates Council of Europe member states **including a number of EU member states** — it is NOT "the body for Europe outside the EU."
- The **APG** (Asia/Pacific Group on Money Laundering) is an FSRB. The **United States is a founding APG member (1997)** and a FATF member — do not state "FSRB: none" for the US.

## Selected jurisdiction notes
- **US AML/CFT supervisory structure:** FinCEN administers the BSA but does NOT itself examine financial institutions. BSA examination authority is delegated: the federal banking agencies (OCC, FDIC, Federal Reserve, NCUA) examine banks (12 U.S.C. § 1818(s)); the **IRS (SB/SE) has delegated BSA examination authority for money services businesses (MSBs) and other non-bank financial institutions without a federal functional regulator**; the SEC/FINRA cover broker-dealers and the CFTC/NFA cover futures firms. Do NOT say "FinCEN directly examines MSBs."
- **FinCEN's establishment basis:** FinCEN is a Treasury bureau **established by 31 U.S.C. § 310**; it administers the BSA (31 U.S.C. § 5311 et seq. / 31 CFR Chapter X) under authority delegated by the Secretary of the Treasury. Do NOT say FinCEN was "established under the Bank Secrecy Act" — the BSA is what it administers, not its establishing statute.
- **UK AML/CFT supervisory structure:** under the Money Laundering Regulations 2017 (regulation 7), AML supervision is **split** across the **FCA** (credit and financial institutions), **HMRC** (MSBs, high-value dealers, most trust/company service providers, estate/letting agents, art-market participants), the **Gambling Commission** (casinos), and the **professional body supervisors (PBSs)** for the legal and accountancy sectors (overseen by OPBAS). The FCA does NOT supervise "major DNFBPs" — DNFBP AML supervision is spread across HMRC, the Gambling Commission, and the PBSs.
- **US investment advisers:** FinCEN's investment-adviser AML rule had its effective date delayed to **1 January 2028** (announced 31 December 2025). Do NOT describe investment advisers as currently BSA-supervised AML/CFT entities in the present tense.
- **Bangladesh / APG:** Bangladesh's most recent FATF-methodology **Mutual Evaluation Report was adopted September 2016**. The November 2020 APG document is the **4th Follow-Up Report** (a follow-up to the 2016 MER) — it is NOT a new MER, and not a "3rd" report. Cite it as APG's 4th Follow-Up Report on Bangladesh, not as a Mutual Evaluation Report.
- **Bangladesh Anti-Terrorism Act 2009:** the **terrorist-financing offence and its punishment sit in section 7**. **Section 15 concerns BFIU / reporting-agency powers** (freezing, supervision, directions, reporting). Do NOT label section 15 as the TF offence/penalty provision.

## Selected enforcement-matter facts (use exactly if the lesson teaches these)
- **Danske Bank Estonia (resolved 13 December 2022):** *United States v. Danske Bank A/S* (D. Conn.) — guilty plea; ~**USD 2 billion** DOJ resolution. The **SEC civil penalty was USD 178.6 million**; the **total SEC settlement was ~USD 413 million** (including disgorgement + prejudgment interest) — do NOT call the USD 413 million figure a "civil penalty." The 2018 **Bruun & Hjejle report is bank-commissioned** — use as secondary context only, never as the scene's substantive authority. The 2014 supervisory report in the public record was the **Estonian** FSA draft; the **Danish** FSA's public Estonia decision is 2018 and its explanatory supervision report 2019. Bruun & Hjejle distinguish ~10,000 customers in the Non-Resident Portfolio from ~15,000 total customers under investigation — do not collapse these into "~15,000 non-resident customers."
- **Westpac (AUSTRAC; Federal Court civil penalty order 21 October 2020):** *CEO of AUSTRAC v Westpac Banking Corporation* [2020] FCA 1538; ~**AUD 1.3 billion** civil penalty for ~23 million admitted contraventions. Cite the **Federal Court civil penalty order** and the **AUSTRAC Statement of Agreed Facts and Admissions** as SEPARATE documents — do not blend them into one "Statement of Agreed Facts and Civil Penalty Order" title. **IFTI strand:** **19,502,841** contraventions of **section 45(2)** for failing to give IFTI reports **within the required reporting time** (>AUD 11 billion in payments) — frame as failures to report on time, NOT a clean "never reported"/"unreported" count. **Child-exploitation monitoring strand:** Westpac DID monitor its **LitePay** low-value remittance channel for the child-exploitation typology — automated detection scenario coverage from LitePay's **August 2016** launch that did not adequately address the typology, then made an **appropriate** LitePay scenario in **June 2018**. The longer-running failure was on the bank's **non-LitePay** channels: no appropriate detection scenario for that typology from late 2016 until **October 2019**. Frame the coverage gap as primarily the **non-LitePay** channels (until October 2019); do NOT frame LitePay as wholly uncovered or as the principal uncovered channel. **Customer strand:** ongoing-CDD failures under **section 36(1)** — agreed facts develop an initial **12-customer** subset; the court's declarations extend the population to **262** customers. **Accountability:** senior leadership departures in **November 2019** (before the penalty).`
