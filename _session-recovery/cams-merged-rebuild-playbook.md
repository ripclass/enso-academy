# CAMS MERGED REBUILD — EXECUTION PLAYBOOK (v2, 2026-07-07)

v1 distilled by Fable from 5 signed-off lessons (fai 9/10, dstr 9/10, fip 9/10, mrs 9.3/10, ssm 9.0/10).
v2 folds in 4 more (sev 9.2, spg 9.3, usf 9.2, ukf 9.3) and REPLACES the Fable checkpoints with
conservative defaults (§8): Fable access ends 2026-07-07; the loop is now fully Opus-executable.
This file + the DONE blocks in `_session-recovery/cams-merged-rebuild-progress.md` + the pre-written
blueprints/sketches (`scripts/_blueprint-euf.md`, `scripts/_blueprint-bdf.md`,
`scripts/_blueprint-sketches-queueb.md`) are the complete method.

## 1. Lane rules (unchanged, non-negotiable)
- CAMS only (slug `cams`). NEVER touch `generated/ccas/**` (parallel session owns it).
- Edit lesson JSONs via builder scripts only. No deploys, no lib/components/app code, no CLAUDE.md / PROGRESS / SESSION-NOTES writes.
- Log ONLY to `_session-recovery/cams-merged-rebuild-progress.md`.
- NEVER re-run `_build-pilot-wml.js` / `_build-pilot-cbr.js` (live lessons). Never overwrite an existing `.bak`.
- Em-dashes: ZERO in all content (`grep -c "—"` must return 0). En-dashes too.

## 2. Model mix (new operating model)
- **Opus 4.8 (lead session):** runs the loop, authors blueprints, triages routine codex items via §6, writes logs.
- **Sonnet 5 (subagents):** source verification (one compact table) + builder-script drafting from the blueprint. Never trust the summary; line-review the actual file.
- **codex gpt-5.5 (external gate):** audits every lesson; iterate until a pass surfaces no new objective item. It is sometimes wrong: verify its claims before editing (§6).
- **Fable (checkpoints only):** §8.

## 3. THE LOOP (one lesson per turn; wait for "go ahead" between lessons; ONE LESSON PER SESSION for token economy — fresh context each lesson)
0. COLLISION CHECK before creating any file: `ls scripts/_*-<abbr>*` and `ls scripts/_*<abbr>*`. The two lanes share scripts/; a CAMS builder once overwrote a CCAS script (both lessons abbreviated "usf"). On any hit, pick a longer abbreviation. CCAS now namespaces as `ccas-<abbr>`.
1. Read the artifact + `cp -n` backup to `<slug>.json.pre-convert.bak`. Grep the artifact for already-fixed catalog defect classes (§5) BEFORE blueprinting.
2. Write the BLUEPRINT (see §4) — or, for the lessons already blueprinted/sketched by Fable, load `scripts/_blueprint-<abbr>.md` / the sketches file and only fill artifact-exact strings. Save to `scripts/_blueprint-<abbr>.md`. THEN RUN THE BLUEPRINT SELF-CHECKS before dispatching the builder:
   - grep the blueprint for `[Oo]ption [abcd]` (explanations must use content labels, never letters; cost a codex round once);
   - scan every evidence.observed draft for constructed actors ("the CFO fears", "the board asks", "the GC briefs") — evidence cards claim the RECORD ONLY; constructed desk pressure lives in decision prompts (cost a round twice);
   - evidence cards must state documented CONDUCT, never a party's "position" or "defence" unless the record shows the party took it; voice misconceptions as "the argument heard across the sector";
   - the cold-open scene TITLE must not telegraph the key (sidebar-visible);
   - predict-step distractors each bend EXACTLY ONE entry, all options equally fact-rich, evidence card neutral;
   - plan citations per-provision AT BLUEPRINT TIME (§6 granularity rule);
   - case intro formula when prompts are constructed frames: "Every evidence card and reveal is from the public record of the resolution documents; the decision prompts are the desk you are placed at."
3. Dispatch BOTH agents in parallel:
   - Verification agent (Sonnet): claims + URLs table. Prompt pattern: see the ssm dispatch in the progress file. Rules: curl with browser UA + `-L`, check `url_effective` not just the code (a 200 can be a soft-redirect to a homepage), one compact table, ≤5 notes.
   - Builder agent (Sonnet): writes `scripts/_convert-<abbr>.js` from the blueprint, following `scripts/_convert-ssm.js` / `_convert-mrs.js` exactly (BAK-first, addUrl/replaceOnce throwing helpers, quiz split by prompt-prefix with assertions, verbatim new scenes, full assertion suite, exact scene count, pretty-print + scene list). Builder must NOT copy text from other convert scripts (cross-contamination happened once).
4. LINE-REVIEW the builder file in full. Diff every option/stem/explanation against the blueprint. #1 fidelity risk: mens-rea/scope overstatement (strict liability = US CIVIL only; "apparent violations" is OFAC's framing; FCA notices ≠ completed violations).
5. Run: `node scripts/_convert-<abbr>.js` → `node scripts/_integrity-check-convert.js <slug> [allowed-urlless-substrings]` → `pnpm tsx scripts/validate-lesson.ts cams <slug>` (all 7 gates must PASS) → `grep -c "—"` = 0. Every CHANGED retained scene in the integrity output must map to a sanctioned edit in the blueprint.
6. Codex round 1: write `scripts/_audit-<abbr>.txt` from the template (§7), dispatch:
   `codex.cmd exec --skip-git-repo-check --model gpt-5.5 --output-last-message <scratchpad>/out-<abbr>-1.txt < scripts/_audit-<abbr>.txt` (run_in_background, timeout 600000).
7. Triage the verdict (§6). Apply fixes as CHECKED REPLACES in the builder (python patch file written via the Write tool — bash heredocs keep breaking on quoting), rebuild, re-gate, dispatch round N+1 with a "NOTE FOR ROUND N" appended (copy prior audit file, append note listing each fix + "re-check ONLY for NEW objective blockers").
8. Iterate until a round surfaces NO new objective factual/legal/sourcing item (only documented holds). Scores have run 3-6 rounds; sanctions lessons budget ~2x.
9. SIGN OFF: write the DONE block in the progress file (follow existing format: rounds, fixes, citations count, held items, recipe notes), add slug to "CONVERTED — PENDING DEPLOY + WARMUP FLAG", update NEXT.

## 4. Blueprint requirements (the SPEC section-2 arc, 18-scene shape)
cover ("You are on the desk", reuses opener citations) → cold open (NEW quiz, blind, the lesson's signature judgment, 50-70% expected wrongness, distractors = NAMED practitioner misconceptions) → decision standard (callout slide + narration) → retained teaching VERBATIM (opener gets a 1-sentence connective prepend) → mid-decisions (redeploy final-check questions verbatim after the scene that teaches them) → case-file interactive ("Work the file"; spec.kind='case-file'; 3 steps × {evidence{observed,source,inference,confidence}, decision{prompt, 4 options, correctOptionId, explanation}, reveal}; caseTitle, intro, debrief; step 3 = predict-the-resolution with a pattern-match distractor from an adjacent case) → "The file, on the record" reading (carries ALL case citations with URLs; body ≥1500 chars + year + named entity for the pedagogy deep-case heuristic) → failure-modes slide (retained) → classmate quiz (named classmate defends a plausible-wrong position; redeploy a final-check question with prompt replaced; INTRO carries the scenario — carry EVERY jurisdictional/scoping anchor from the original stem) → trimmed final check (1 exam-like question) → synthesis (retained).
- Budget: 8 authored decisions + Apply-it = 9. Difficulty arc: hard cold open → easier mids → harder case file → exam-like close. Linked final-check pairs (a question referencing "the previous question") stay in ONE scene, which shifts the budget: one mid + classmate takes the other standalone question (spg precedent).
- Classmates used so far: Daniel (wml, usf), Priya (fai, ukf), Marcus (dstr), Aisha (fip), Lena (mrs), Omar (ssm), Sofia (sev), Nadia (spg). Rotation is fine at this distance; next in rotation order: Marcus, Aisha, Lena, Omar.
- Superlatives quoted at the release's own scope only ("first FCA criminal prosecution under the MLR" — never widened to "the track lay dormant for two decades"). Numeric coincidences (NatWest fine ≈ cash figure) stated as "numerically close but not set by it", never causal.
- Case facts VERBATIM from cleared text; evidence sources = "The public record of the resolution documents." (interactives carry no citations by contract).
- Quality sweep lands WITH the conversion: label-only citations get verified primary URLs; objective factual/legal/currency fixes to retained text are sanctioned (each one checked-replace + logged); style preferences are NOT.
- Quiz integrity: correct option must not be the clear longest; ledger/predict steps need ALL options equally fact-rich with the evidence card neutralized; explanations letter-agnostic (no "Option A").

## 5. Pre-audit grep list (already-fixed catalog defect classes — check EVERY un-swept lesson)
- "client screening" / "screening tool" near Commerzbank → the FCA notice's automated tool was TRANSACTION-MONITORING within broader AML control failings (recast in hre/spg/ssm).
- Westpac: LitePay monitored from Aug 2016, appropriate scenario Jun 2018, no-appropriate-scenario gap = NON-LitePay until Oct 2019; 19,502,841 = late-reported, never "unreported".
- Unqualified "strict liability" / "unforgiving of intent" → qualify "US civil enforcement".
- "national FIU channel" as universal freeze-report recipient → "designated competent authority (in many jurisdictions the FIU)" (UK=OFSI, US=OFAC).
- FCA SCB 2019 = DECISION Notice (no final-notice PDF exists); SCB 2019 OFAC conduct straddles the 2012 DPA (Jun 2009-Jun 2014).
- "FCA Final Notice" claims generally: verify which instrument actually published.
- BNPP = GUILTY PLEA (never DPA); HSBC 2012 = DPA (joint parties HSBC Holdings plc AND HSBC Bank USA N.A.).
- DOJ press URLs: check /archives/ (many non-archive paths 301 there now).
- R.6 = terrorism, R.7 = proliferation (never blended); 50% Rule = aggregate, one-or-more, direct-or-indirect.
- FOURTH-WALL PROCESS LEAKS in student-facing text: "the brief demands", "paid a fidelity round", "the cross-check rejected", "learned the hard way in Module N" → recast without pipeline references (found in spg + usf).
- "Extended repeatedly" for the SCB DOJ DPA is NOT primary-anchored (only the 2019 amendment+extension is document-confirmed; the NYDFS Monitor extensions are a different instrument) → "still in force when the 2019 resolution amended and extended it".
- "Whistleblower" appears in NO official document of the SCB 2019 matter → OFAC's exact "did not voluntarily self-disclose".
- SCB-2019-specific penalty comparisons use BASE PENALTY language ($2,715,100,479 computed vs $639,023,750 settled), not "statutory ceilings"; the Appendix-A matrix teaching keeps its correct statutory-maximum wording for the VSD-egregious row.
- Letter references in explanations ("Option b is the trap") → content labels; grep `[Oo]ption [abcd]` (note "option a" false-positives on "option accepts").
- The 2016 CDD Rule "fifth pillar" is scoped to the financial institutions the Rule covers, not "every covered institution".
- HSBC 2012 aggregates: USD 1.92B / 1.921B are cross-agency DERIVED totals corroborated by Treasury's "more than $1.9 billion"; never demand single-document verbatim. NatWest: fine £264,772,619.95; pleas 7 Oct 2021 Westminster; sentenced 13 Dec 2021 Southwark; counts on MLR-2007 regs 8(1)/8(3)/14 via reg 45(1); "No individuals are being charged" is verbatim FCA text.

## 6. Codex triage: fix vs hold (precedents)
FIX (objective): wrong dates/amounts/instruments; chronology implications ("The following June"); scope overstatements (mens-rea, universal-FIU, absolute rules); missing jurisdictional anchors in MY reframes; length tells; cueable predict-steps (all options must be equally fact-rich); stale URLs (VERIFY with url_effective first); label/URL mismatches; missing primary citation for a specific claim (DPA amendment → DOJ release).
HOLD with evidence (documented classes, auditor has accepted all):
- Label-only citations where no honest official URL exists (generic national-CTF statutes class; BSP Annual Report 2016 — pdf-searched, no RCBC mention; AMLC 2016 404).
- Bot-walled-but-live official URLs (legislation.gov.uk 202-WAF, consilium 403, officialgazette.gov.ph 403, MAS intermittent): keep, note "serves 403/202 to automated agents; page is live".
- Date-neutral FATF citations (project posture).
- Volatile UN snapback pinpoints (handled durably in prose).
- Cleared-text rhetoric that survived prior fidelity passes (style, not fact).
CODEX IS SOMETIMES WRONG: verify before editing (it once suggested Cornell LII over eCFR — catalog policy is eCFR /current/ shortcuts, which curl-200 with browser UA). Its suggested SOURCE can be wrong even when its objection is right: the sev auditor proposed the Oct-2023 Price Cap Coalition advisory for an attestation claim; the PDF was downloaded and had ZERO attestation hits — the sentence was recast to the verified record instead of cited to the wrong document. Always confirm a suggested document carries the claim before citing it. When a precision fix changes a formulation, GREP THE WHOLE ARTIFACT for the old formulation in the same pass (explanations + citation labels are where stragglers hide), AND grep the same case-file step's REVEAL and the debrief (the usf round-3 echo was a round-1 fix restated in the reveal).
CITATION GRANULARITY (auditors now enforce): a label naming a provision the URL does not cover is a flagged defect (§5322 under the §5318 permalink; §1957 under §1956). Rules: (a) act/SI-ROOT URLs are honest for bundled-section labels because the root instrument contains every named section (POCA ukpga/2002/29 for a "sections 327 to 329" label); (b) a SECTION-specific URL covers only that section — split one-per-section (dstr POCA precedent; usf rounds 3-4); (c) named prior-case back-references in READING scenes get compact primary anchors; SLIDE/QUIZ mentions are declared course-internal pointers (scene contract bars citations there) — auditors accept this posture when the same matters carry URLs in the lesson's readings.

## 7. Audit prompt template
Best exemplar: `scripts/_audit-ssm.txt`. Structure: (1) senior-CAMS-examiner role, read-only, verify against primary sources, "flag for operator rather than asserting" instruction; (2) artifact path; (3) one-paragraph simulator-format explanation incl. "interactives cannot carry citations; that is why the record reading exists"; (4) VERIFIED REFERENCE SPINE — the case facts as verified THIS session (auditors enforce this, so it must be correct; update it when verification corrects something); (5) adversarial instruction on NEW decision content + scope-claims warning + difficulty-arc check; (6) output contract: score/10, ranked blockers with scene+exact fix, strengths. Round N+1: copy file, append "NOTE FOR ROUND N" listing fixes + known holds.

## 8. OPUS EXECUTION ADDENDUM (replaces the Fable checkpoints; Fable access ended 2026-07-07)
- CHECKPOINT A is replaced by the §3 step-2 blueprint self-checks, plus the pre-written material: `scripts/_blueprint-euf.md` and `scripts/_blueprint-bdf.md` are FULL Fable-authored blueprints (execute as-is, filling only artifact-exact strings where marked); `scripts/_blueprint-sketches-queueb.md` carries Fable's design skeletons (cold-open concept, case-step arc, misconception sets, known holds) for every remaining Queue-B lesson — build each full blueprint FROM its sketch, do not redesign.
- CHECKPOINT B is replaced by CONSERVATIVE DEFAULTS: (a) when unsure fix-vs-hold on RETAINED text, HOLD and log "flag for Ripon" in the DONE block — never creative-rewrite cleared prose; (b) mens-rea/scope items in retained text: apply the documented minimal-anchor pattern (qualify, never restructure: "in the US civil context", "alongside records of who was actually using the platform") or HOLD; (c) new prose in fixes stays minimal and greppable; (d) NEVER introduce a fact absent from the cleared artifact or a verification table; (e) if an auditor claim contradicts §5/§6 precedent, the precedent wins — reply in the round-N note citing it; (f) if two consecutive rounds flag the SAME retained-text framing after a documented hold, accept cleared-with-flag per the catalog's asymptote rule and sign off with the flag, rather than iterating past round 6.
- Queue ORDER for token economy: Queue A (convert-only, ~2 rounds each, no sweep) can be run before the remaining Queue-B merged lessons to build rhythm cheaply; the EU/BD blueprints are ready whenever Queue B resumes. One lesson per session; let Sonnet agents do ALL file-heavy work; codex (ChatGPT plan) is the quality floor — never skip it.

## 9. Verified URL bank (reusable; all curl-200 unless noted)
FATF (date-neutral): https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Fatf-recommendations.html
OFAC Framework PDF: https://ofac.treasury.gov/media/16331/download?inline (the old home.treasury.gov/system/files/126 path soft-redirects to the OFAC homepage — do not use)
OFAC 50% Rule PDF: https://ofac.treasury.gov/media/6186/download?inline=
OFAC SDN page: https://ofac.treasury.gov/specially-designated-nationals-and-blocked-persons-list-sdn-human-readable-lists
OFAC SCB 2019: https://ofac.treasury.gov/recent-actions/20190409 · Treasury PR: https://home.treasury.gov/news/press-releases/sm647
DOJ SCB 2019: https://www.justice.gov/archives/opa/pr/standard-chartered-bank-admits-illegally-processing-transactions-violation-iranian-sanctions
DOJ BNPP: https://www.justice.gov/opa/pr/bnp-paribas-agrees-plead-guilty-and-pay-89-billion-illegally-processing-financial
DOJ HSBC: https://www.justice.gov/archives/opa/pr/hsbc-holdings-plc-and-hsbc-bank-usa-na-admit-anti-money-laundering-and-sanctions-violations
NYDFS BNPP order: https://www.dfs.ny.gov/system/files/documents/2020/04/ea140630_bnp_paribas.pdf · NYDFS SCB 2012: .../ea120806_standard_chartered.pdf
FCA SCB 2019 Decision Notice: https://www.fca.org.uk/publication/decision-notices/standard-chartered-bank-2019.pdf
FCA Commerzbank 2020: https://www.fca.org.uk/publication/final-notices/commerzbank-ag-2020.pdf
UN: Charter https://www.un.org/en/about-us/un-charter/full-text · List https://main.un.org/securitycouncil/en/content/un-sc-consolidated-list · Resolutions https://main.un.org/securitycouncil/en/content/resolutions
OFSI guidance: https://www.gov.uk/government/publications/financial-sanctions-general-guidance/uk-financial-sanctions-general-guidance
SAMLA: https://www.legislation.gov.uk/ukpga/2018/13 (202-WAF to curl, live)
EUR-Lex (ELI pattern works): 2271/96, 2018/1100, Bank Melli C-124/20 https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:62020CJ0124
govinfo uscode permalinks: https://www.govinfo.gov/link/uscode/50/1701 (IEEPA), /50/4301 (TWEA), /31/5318
eCFR /current/ shortcuts curl-200 with browser UA (e.g. 31 CFR 560.215, 1020.320, 1010.520/540; 12 CFR 21.11). CFR labels need the § symbol for citation_bind.
Egmont Principles PDF: https://egmontgroup.org/wp-content/uploads/2022/07/EG-Principles-for-Information-Exchange-Revised-July-2025.pdf
FinCEN Capital One: release + Assessment_CONA_508_0.pdf (see dstr DONE block).
— v2 additions (all verified 2026-07-06) —
OFAC May-2020 shipping guidance PDF: https://ofac.treasury.gov/media/37751/download?inline (old home.treasury.gov path soft-redirects)
FATF PF guidance 2021: https://www.fatf-gafi.org/en/publications/Financingofproliferation/Proliferation-financing-risk-assessment-mitigation.html
UN Panel of Experts (DPRK) reports: https://main.un.org/securitycouncil/en/sanctions/1718/panel_experts/reports
DOJ Binance: https://www.justice.gov/archives/opa/pr/binance-and-ceo-plead-guilty-federal-charges-4b-resolution · OFAC Binance: https://ofac.treasury.gov/recent-actions/20231121 · FinCEN Binance order: https://www.fincen.gov/system/files/enforcement_action/2023-11-21/FinCEN_Consent_Order_2023-04_FINAL508.pdf
OFAC FAQ 594: https://ofac.treasury.gov/faqs/594 · OFAC price-cap alert Apr-2023: https://ofac.treasury.gov/media/931641/download?inline
Fed SCB 2012 C&D: https://www.federalreserve.gov/newsevents/pressreleases/enforcement20121210a.htm · NYDFS SCB Sept-2012 consent: .../ea120921_standard_chartered.pdf · NYDFS SCB 2014: .../ea140819_standard_chartered.pdf (dfs.ny.gov/system/files/documents/2020/04/)
DOJ SCB Dec-2012 (CDX-verified): https://www.justice.gov/archives/opa/pr/standard-chartered-bank-agrees-forfeit-227-million-illegal-transactions-iran-sudan-libya-and
eCFR Appendix A to 31 CFR Part 501: https://www.ecfr.gov/current/title-31/subtitle-B/chapter-V/part-501/appendix-Appendix%20A%20to%20Part%20501 (encoded space REQUIRED)
HSBC 2012 five-agency set: OCC https://www.occ.gov/news-issuances/news-releases/2012/nr-occ-2012-173.html · Fed https://www.federalreserve.gov/newsevents/pressreleases/enforcement20121211b.htm (the "a" variant is a DIFFERENT bank) · FinCEN Assessment 2012-02 https://www.fincen.gov/system/files?file=enforcement_action/20121211.pdf · Treasury tg1799 https://home.treasury.gov/news/press-releases/tg1799
FinCEN LCB s.311 finding: https://www.fincen.gov/resources/statutes-regulations/federal-register-notices/finding-lebanese-canadian-bank-sal · NPRM: .../usa-patriot-act/lebanese-canadian-bank-sal-0
FinCEN Priorities PDF: https://www.fincen.gov/system/files/shared/AML_CFT%20Priorities%20(June%2030,%202021).pdf · FinCEN BOI page: https://www.fincen.gov/boi
govinfo: /link/uscode/<title>/<sec> pattern (5311/5318/5322/5324/310/5336, 18/1956/1957/981) · PLAW pages: /app/details/PLAW-107publ56 (PATRIOT), /app/details/PLAW-116publ283 (NDAA FY2021 w/ AMLA+CTA)
eCFR /current/title-31/section-<n> shortcuts re-confirmed (1010.311/.313/.230/.610/.620, 1020.220/.320)
DOJ/SDNY U.S. Bancorp: https://www.justice.gov/usao-sdny/pr/manhattan-us-attorney-announces-criminal-charges-against-us-bancorp-violations-bank
FCA NatWest: sentencing https://www.fca.org.uk/news/press-releases/natwest-fined-264.8million-anti-money-laundering-failures · plea https://www.fca.org.uk/news/press-releases/natwest-plc-pleads-guilty-criminal-proceedings · Agreed SOF https://www.fca.org.uk/publication/corporate/agreed-statement-facts-fca-national-westminster-bank.pdf
Da Silva: https://caselaw.nationalarchives.gov.uk/ewca/crim/2006/1654 (BAILII is Anubis-walled) · JMLSG: https://www.jmlsg.org.uk/guidance/current-guidance/ (PLAIN-UA only; 403 to browser UA)
NCA UKFIU DAML Ch.3 PDF: https://www.nationalcrimeagency.gov.uk/who-we-are/publications/776-ukfiu-chapter-3-understanding-damls-and-datfs/file
legislation.gov.uk per-section pattern: /ukpga/2002/29/section/<n>, /uksi/2017/692/regulation/<n>, /uksi/2007/2157/regulation/45, /ukpga/2017/22, /ukpga/2000/11 (all 202-WAF)

## 10. Gotchas
- Builder cross-contamination: diff every option against the blueprint (dstr imported an fai option once).
- Bash-heredoc python generating JS breaks on apostrophes/quotes: write patch .py files to the scratchpad with the Write tool, run `python <file>`.
- Pedagogy gate deep-case heuristic: reading with year + named entity + ≥1500 chars. If FLAG deepCaseCount 0, extend the record scene with the replaced deep-case reading's own cleared sentences.
- citation_bind: binds structured refs to READING-scene citations (same scene + adjacent); interactives carry none.
- codex exec can hang/return empty on transient errors: re-dispatch once before diagnosing; exit codes 0/1/2 = AGREE-ish/SPLIT/DISAGREE lanes in older tooling, but read the output file, not the code.
- A compound background command chains build → gates → codex; if codex output exists, the build passed (the && chain).
- Classifier outages (rare): read-only tools still work; wait and retry.
