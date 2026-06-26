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

/** Date this facts pack was last verified against primary sources. Bump on every edit.
 *  2026-06-22: added the CRYPTOASSETS / VASPs (CCAS) section; the AML/CFT sections
 *  above it remain as verified 2026-06-19. */
export const FACTS_PACK_AS_OF = '2026-06-25'

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
- **R.12 PEP scope (recurring fidelity point):** for **foreign PEPs** the enhanced measures are **automatic** — senior-management approval to establish/continue the relationship, take reasonable measures to establish source of wealth and source of funds, and enhanced ongoing monitoring. For **domestic PEPs** and persons entrusted with a prominent function by an **international organisation**, the institution first takes reasonable measures to determine PEP status, and the enhanced measures (R.12 paragraphs (b)–(d)) apply only where the **business relationship is higher-risk**. Do NOT present the full PEP package as applying automatically to all PEP relationships generally. Family members and known close associates are covered for all PEP types.
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
- **FATCA vs CRS (recurring fidelity point):** **FATCA** (U.S. Foreign Account Tax Compliance Act, 2010) requires foreign financial institutions to identify and report **U.S. accounts / U.S. persons** (and certain foreign entities with substantial U.S. owners) to the IRS, enforced by a 30% withholding; it is U.S.-person-focused and largely one-directional toward the United States. **CRS** (OECD Common Reporting Standard; first exchanges 2017) is the multilateral regime under which institutions determine account holders' **tax residence(s)** and entities' **controlling persons** and report to each relevant jurisdiction. Do NOT describe FATCA as a general "tax-residence" reporting regime — tax-residence determination is the CRS mechanism. The **United States operates FATCA and does not participate in CRS**.
- **Bangladesh / APG:** Bangladesh's most recent FATF-methodology **Mutual Evaluation Report was adopted September 2016**. The November 2020 APG document is the **4th Follow-Up Report** (a follow-up to the 2016 MER) — it is NOT a new MER, and not a "3rd" report. Cite it as APG's 4th Follow-Up Report on Bangladesh, not as a Mutual Evaluation Report.
- **Bangladesh Anti-Terrorism Act 2009:** the **terrorist-financing offence and its punishment sit in section 7**. **Section 15 concerns BFIU / reporting-agency powers** (freezing, supervision, directions, reporting). Do NOT label section 15 as the TF offence/penalty provision.

## Selected enforcement-matter facts (use exactly if the lesson teaches these)
- **Danske Bank Estonia (resolved 13 December 2022):** *United States v. Danske Bank A/S* (D. Conn.) — guilty plea; ~**USD 2 billion** DOJ resolution. The **SEC civil penalty was USD 178.6 million**; the **total SEC settlement was ~USD 413 million** (including disgorgement + prejudgment interest) — do NOT call the USD 413 million figure a "civil penalty." The 2018 **Bruun & Hjejle report is bank-commissioned** — use as secondary context only, never as the scene's substantive authority. The 2014 supervisory report in the public record was the **Estonian** FSA draft; the **Danish** FSA's public Estonia decision is 2018 and its explanatory supervision report 2019. Bruun & Hjejle distinguish ~10,000 customers in the Non-Resident Portfolio from ~15,000 total customers under investigation — do not collapse these into "~15,000 non-resident customers."
- **Westpac (AUSTRAC; Federal Court civil penalty order 21 October 2020):** *CEO of AUSTRAC v Westpac Banking Corporation* [2020] FCA 1538; ~**AUD 1.3 billion** civil penalty for ~23 million admitted contraventions. Cite the **Federal Court civil penalty order** and the **AUSTRAC Statement of Agreed Facts and Admissions** as SEPARATE documents — do not blend them into one "Statement of Agreed Facts and Civil Penalty Order" title. **IFTI strand:** **19,502,841** contraventions of **section 45(2)** for failing to give IFTI reports **within the required reporting time** (>AUD 11 billion in payments) — frame as failures to report on time, NOT a clean "never reported"/"unreported" count. **Child-exploitation monitoring strand:** Westpac DID monitor its **LitePay** low-value remittance channel for the child-exploitation typology — automated detection scenario coverage from LitePay's **August 2016** launch that did not adequately address the typology, then made an **appropriate** LitePay scenario in **June 2018**. The longer-running failure was on the bank's **non-LitePay** channels: no appropriate detection scenario for that typology from late 2016 until **October 2019**. Frame the coverage gap as primarily the **non-LitePay** channels (until October 2019); do NOT frame LitePay as wholly uncovered or as the principal uncovered channel. **Customer strand:** ongoing-CDD failures under **section 36(1)** — agreed facts develop an initial **12-customer** subset; the court's declarations extend the population to **262** customers. **Accountability:** senior leadership departures in **November 2019** (before the penalty).

# CRYPTOASSETS / VASPs — CCAS FACTS (added & verified 2026-06-22)

These cover the cryptoasset financial-crime build (CCAS). Same rule: where a statement here conflicts with your recollection, THIS WINS. Where a fact is marked **VERIFY AT GENERATION**, do not assert a specific figure/date from memory — confirm it against the cited primary release when you write that lesson.

## FATF virtual-asset standard (R.15 / INR.15)
- **Virtual asset (FATF Glossary):** a digital representation of value that can be digitally traded or transferred and used for payment or investment. It EXCLUDES digital representations of fiat currencies, securities, and other financial assets already covered elsewhere in the Recommendations. Consequence: a **CBDC is digital fiat — NOT a "virtual asset"** for FATF purposes; tokenised securities fall under the existing securities provisions.
- **VASP (FATF Glossary):** any natural or legal person who, as a business, conducts one or more of the following for or on behalf of another person: (i) exchange between virtual assets and fiat currencies; (ii) exchange between one or more forms of virtual assets; (iii) transfer of virtual assets; (iv) safekeeping and/or administration of virtual assets or instruments enabling control over virtual assets; (v) participation in and provision of financial services related to an issuer's offer and/or sale of a virtual asset.
- FATF brought VAs/VASPs into scope by amending **Recommendation 15** and adopting its **Interpretive Note (INR.15)** in 2019. VASPs must be **licensed or registered**, supervised for AML/CFT, apply full preventive measures (CDD, recordkeeping, suspicious-transaction reporting), and comply with the **Travel Rule**. VA/VASP regulation and supervision sits under **R.15 / INR.15** — NOT R.26–R.28.
- **DeFi:** a genuinely decentralised application is not itself a VASP, but FATF's position (2021 Updated VA Guidance) is that creators, owners, operators, or others who **maintain control or sufficient influence** over a DeFi arrangement may be VASPs even where it appears decentralised. Do not state flatly that "DeFi has no obliged entity."
- **Unhosted / self-hosted wallets** (user holds own keys) are not VASPs; obligations attach at the VASP transacting with them, on a risk-based basis.

## Travel Rule (R.16 / INR.16, applied to VAs via INR.15)
- The Travel Rule is **Recommendation 16**, extended to virtual-asset transfers by **INR.15**. **R.16 was revised June 2025** (payment-transparency package; revised R.16 assessment methodology Annex IV adopted October 2025).
- **VERIFY AT GENERATION** — do NOT assert the pre-2025 VA field list as current. When teaching the required originator/beneficiary data elements, confirm the exact set against the **current FATF INR.16 text**. General shape only: the **originating VASP** obtains, holds, and transmits required originator + beneficiary information to the beneficiary VASP; the **beneficiary VASP** obtains/holds required information and screens; de-minimis thresholds and specific unhosted-wallet treatment apply.
- **Sunrise problem:** uneven cross-jurisdiction adoption of the Travel Rule means compliant VASPs transact with counterparties where the rule has not yet taken effect — a real, named implementation gap (see FATF targeted-update reports).

## EU crypto regime — get instrument numbers EXACT
- **MiCA = Regulation (EU) 2023/1114** (Markets in Crypto-Assets): market/prudential regulation of crypto-asset service providers (CASPs) and of asset-referenced tokens (ARTs) and e-money tokens (EMTs/stablecoins). In force 29 June 2023; **ART/EMT (stablecoin) rules apply from 30 June 2024; the rest, incl. CASP authorisation, from 30 December 2024.** MiCA is market regulation, distinct from the AML regime.
- **EU crypto Travel Rule = Regulation (EU) 2023/1113** (recast Transfer of Funds Regulation): originator/beneficiary information requirements for crypto-asset transfers, **applying from 30 December 2024**; covers transfers involving self-hosted wallets above thresholds.
- **EU AML package — do NOT confuse the numbers:** **AMLR (the AML Regulation / single rulebook) = Regulation (EU) 2024/1624**; **AMLA (the Anti-Money Laundering Authority) is established by Regulation (EU) 2024/1620**; **AMLD6 = Directive (EU) 2024/1640**. AMLA is established by **2024/1620** — never attribute AMLA to 2024/1624.

## US crypto regime
- **FinCEN FIN-2013-G001 (2013):** administrators and exchangers of **convertible virtual currency (CVC)** are money transmitters (a type of MSB) under the BSA, with AML-program, recordkeeping, and SAR obligations; mere users are not MSBs.
- **FinCEN FIN-2019-G001 (2019):** applies the money-transmission framework to specific CVC business models (P2P exchangers, certain wallet providers, certain mixers/anonymising services, CVC kiosks, etc.).
- **OFAC Sanctions Compliance Guidance for the Virtual Currency Industry (October 2021):** sanctions obligations (strict liability) apply to the virtual-currency industry; OFAC adds **virtual-currency addresses to the SDN List**.
- **Asset characterisation:** the **SEC** treats many tokens as securities under the **Howey** test; the **CFTC** treats **Bitcoin and Ether as commodities**. Characterisation decides which regulator/rules apply.
- **NY BitLicense = 23 NYCRR Part 200** (NYDFS, 2015) — the leading US state virtual-currency regime.

## UK crypto regime
- **Cryptoasset exchange providers and custodian wallet providers** must register with the **FCA** for AML supervision under the **Money Laundering Regulations 2017** (regime live since January 2020); the FCA applies a strict standard (many applications refused/withdrawn).
- **UK Travel Rule:** implemented via amendments to the MLRs 2017, **in force 1 September 2023**, mirroring the FATF data requirements.
- **POCA 2002** (ss 327–329; the SARs / DAML regime) applies to crypto proceeds as to any other property.

## Crypto enforcement matters — VERIFY exact amounts/dates against the primary release at the case lesson
- **Tornado Cash:** OFAC designated the mixer **8 August 2022** (use by the Lazarus Group and others). **Van Loon v. Department of the Treasury (5th Cir., November 2024)** held immutable smart contracts are not "property" blockable under IEEPA; OFAC **delisted Tornado Cash on 21 March 2025**. Separately, **DOJ indicted founders Roman Storm and Roman Semenov (August 2023)** for money-laundering and sanctions conspiracies — the sanctions action and the criminal prosecution are DISTINCT.
- **Binance (21 November 2023):** combined **~USD 4.3 billion** resolution with DOJ, FinCEN, OFAC, and CFTC; Binance pleaded guilty (operating as an unregistered MSB serving US users; AML-program and sanctions failures); founder **Changpeng Zhao (CZ) pleaded guilty personally**. VERIFY the component figures/breakdown.
- **BitMEX (HDR Global Trading):** CFTC + FinCEN civil resolution (**August 2021, ~USD 100 million combined**); DOJ BSA charges against founders **Arthur Hayes, Benjamin Delo, Samuel Reed** (guilty pleas 2022). Ran a derivatives platform serving US customers without registration or an adequate AML program / KYC. VERIFY figures/dispositions.
- **Bitfinex hack proceeds — US v. Lichtenstein & Morgan:** DOJ **February 2022** seizure of ~**94,000 BTC** traced from the **2016 Bitfinex hack**; Ilya Lichtenstein and Heather Morgan later pleaded guilty (2023). VERIFY amounts.
- **Lazarus / DPRK:** OFAC attributed the **Ronin Bridge (Axie Infinity) hack (~March 2022, ~USD 620 million)** to the Lazarus Group and **designated the laundering address (April 2022)**. The **2016 Bangladesh Bank heist (~USD 81 million** via fraudulent SWIFT messages, routed via the Philippines) is an earlier DPRK-linked example (DOJ Park Jin Hyok complaint, 2018) — use as ONE example among several; keep the framing global, not Bangladesh-centric.
- **UK — the world's largest cryptoasset seizure (R v Jian Wen; R v Zhimin Qian) — verified 2026-06-25:** the Metropolitan Police seized **~61,000 BTC** (worth ~**£4.8 billion** at 2025 sentencing — this is the *seized bitcoin's* value, NOT the fraud loss). **Zhimin Qian (aka Yadi Zhang)** ran a Chinese investment fraud **2014–2017** (**128,000+ victims**, **~£600 million** in losses), converted the proceeds to bitcoin and fled to the UK; **Jian Wen** was her UK money-launderer. Jian Wen was convicted of money laundering and sentenced **May 2024 to 6 years 8 months** (Crown Court at Southwark). Qian was arrested April 2024, pleaded guilty **September 2025**, and was sentenced **11 November 2025 to 11 years 8 months** at Southwark Crown Court (co-defendant **Seng Hok Ling**; case titled *R v Zhimin Qian and Seng Ling*). **Offence labels — anchor to the court record:** Met/CPS public releases describe Qian's counts as *acquiring / possessing* criminal property, while the **Courts & Tribunals Judiciary sentencing remarks** (the authoritative record) state *possession of criminal property* and *transferring criminal property*; when teaching the exact counts, cite the sentencing remarks, not the looser press-release wording. **POCA 2002 ss 327–329** is the offence backbone. Primary sources: Metropolitan Police and CPS public releases; Courts & Tribunals Judiciary sentencing remarks (R v Jian Wen, May 2024; R v Zhimin Qian and Seng Ling, 11 November 2025).`
