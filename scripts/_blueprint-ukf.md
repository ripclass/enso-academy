# BLUEPRINT: `the-uk-framework` (abbrev `ukf`; collision-checked, CCAS uses `ccas-ukf`) — Queue B merged conversion

**Lesson:** CAMS `the-uk-framework` (frameworks module). 11 scenes, 0 em-dashes, previously cleared-with-fix at SPLIT (2026-06-18; NatWest Oct-2021-pleas-vs-13-Dec-2021-sentencing split IS in the text; the documented JMLSG "statutorily considered by courts and regulators" residual is ALREADY FIXED in the current text, court-vs-FCA split precise).
**Deep case:** NatWest 2021, read for the INSTRUMENT (the FCA's criminal track under the MLRs). **Classmate:** Priya (rotation; last used in fai).
**Files:** `scripts/_convert-ukf.js`, `scripts/_audit-ukf.txt`, backup `.pre-convert.bak` (created).
**Differentiation guard:** the CDD module read NatWest for its SUBSTANCE (the customer file vs reality); this case file reads it ONLY for the instrument choice: why the criminal track, why not POCA, what sentencing looked like. No step may test CDD/monitoring-design content.

## Pre-audit §5 sweep result (sanctioned fixes, each a checked replace)
1. Authorities scene body calls the SCB April 2019 instrument a Final Notice: "produced the Final Notices this course has used as case studies: Standard Chartered's April 2019 notice at **£102.2 million**, Commerzbank London's June 2020 notice at **£37,805,400**" -> "produced the penalty notices this course has used as case studies: Standard Chartered's April 2019 Decision Notice at **£102.2 million**, Commerzbank London's June 2020 Final Notice at **£37,805,400**" (§5: no SCB-2019 final notice exists; ssm/spg precedent).
2. Authorities scene citation bundles both under "Final Notice" labels -> SPLIT into two: (i) 'Financial Conduct Authority, Decision Notice in respect of Standard Chartered Bank, April 2019, £102.2 million' + FCA_SCB_URL; (ii) 'Financial Conduct Authority, Final Notice to Commerzbank AG (London branch), June 2020, £37,805,400' + FCA_COMMERZ_URL.
3. Opener body "as this course's Final Notices and one criminal conviction have shown" -> "as this course's FCA enforcement notices and one criminal conviction have shown".
4. Synthesis item "against the civil-track contrast of the Standard Chartered and Commerzbank Final Notices" -> "against the civil-track contrast of the Standard Chartered and Commerzbank notices". (Grep the whole artifact for "Final Notice" at build; the Commerzbank-specific uses may stay where instrument-accurate.)
Verified-clean posture: JMLSG court-vs-FCA split precise everywhere; NatWest chronology split in; supervision map (reg 7) precise; letter-agnostic explanations; NCA-as-FIU correct; 0 em-dashes.

## Difficulty arc
Hard cold open (the transplanted file-and-decide reflex, blind) -> easier mid 1 (Q1 offence classification, statute in hand) -> mid 2 (Q2 consent clock) -> harder case file (instrument-choice arc with a predict-the-sentence close) -> moderate classmate (Q4 supervision map) -> exam-like final (Q3 objective-limb analysis).
Budget: cold(1) + mids(2) + case steps(3) + classmate(1) + final(1) = 8 authored + Apply-it = 9.

## Target scene order (18)
1. cover `You are on the desk` (NEW reading; opener citations)
2. `Cold open: the payment in the queue` (NEW quiz; neutral title)
3. `The decision standard` (NEW slide, callout)
4. `The second map every practitioner carries` (retained opener + prepend + fix 3)
5. `The UK architecture` (retained slide)
6. `The principal offences: sections 327 to 329` (retained)
7. `The regulated sector's additional duties` (retained)
8. `The DAML: asking permission to proceed` (retained)
9. `Decision: the account you keep running` (Q1 redeployed)
10. `Consent versus file-and-decide` (retained slide)
11. `Decision: day eight` (Q2 redeployed)
12. `MLR 2017 and the JMLSG: the preventive layer, mapped` (retained)
13. `The authorities and their two enforcement tracks` (retained + fixes 1-2)
14. `Work the file` (NEW interactive, NatWest, 3 steps)
15. `The file, on the record` (NEW reading, case citations, >=1500 chars)
16. `Priya needs correcting` (Q4 redeployed, prompt replaced)
17. `POCA application` (retained quiz title; Q3 only; new intro)
18. `What to carry forward` (retained synthesis + fix 4)
Only DROPPED scene = `Deep case: NatWest, the regulations turn criminal`.

## Quiz split ('POCA application', 4 Qs; all standalone)
- Q1 ("A relationship manager at a London bank continues to operate the account...") -> mid 1 (scene 9), verbatim. Placed AFTER the DAML scene because its keyed option references the DAML defence.
- Q2 ("A bank files a DAML disclosing its intention to execute a customer's instruction...") -> mid 2 (scene 11), verbatim.
- Q4 ("Four UK businesses ask who supervises their AML compliance...") -> classmate (scene 16), prompt replaced, options/key/explanation untouched.
- Q3 ("An FCA investigation finds that a compliance analyst reviewed an alert...") -> final check (scene 17), verbatim.

---

## Scene 1 — cover `You are on the desk` (citations = opener's, after URL patching)
> Sterling's desk now. London clears, converts and finances a share of the world's transactions large enough that the UK map, like the American one, follows practitioners far beyond its borders; unlike the American one, it puts a criminal statute under every seat, including yours.
>
> The deal is unchanged: you decide first, and the teaching arrives as feedback. But the decisions on this desk carry a distinctive weight, because in this jurisdiction the preventive rulebook is criminal law, the suspicion threshold is low, and the regime answers the moment of suspicion with machinery no other major system runs.
>
> Your first file is already in the queue: a payment, a suspicion, and a desk waiting for your call.

## Scene 2 — cold open `Cold open: the payment in the queue` (NEW quiz, 1 Q, correct = b)
intro: "No teaching yet. The desk needs an answer before the payment cutoff. Commit."

prompt: "You run financial crime at a London bank. A corporate customer's GBP 2 million payment instruction is in the queue when an analyst brings you the file: the account's pattern, set against what the customer's business could plausibly generate, has just crossed from unease into genuine suspicion that the funds are criminal. The payment is due today and the customer is a significant relationship. What is the disciplined move?"

- a: "File a suspicious activity report to the NCA as soon as practicable and process the payment while the relationship is managed under the bank's risk appetite: reporting is the legal duty, and the commercial decision about the account remains the bank's own to make."
- b (KEYED): "Hold the payment and make an authorised disclosure to the NCA describing the act and the suspicion, then let the statutory clocks run: with consent, express or by default, the bank has a complete defence for the disclosed act; without it, processing is itself an offence."
- c: "Decline the instruction, return the balance and exit the relationship quietly: ending the exposure ends the offence risk, and a discreet exit spares the bank both the customer confrontation and the reporting machinery entirely."
- d: "Commission a rapid internal investigation before engaging any formal machinery, keeping the account operating normally meanwhile: a decision this consequential should rest on corroborated facts, not on an analyst's pattern-read against the customer file."

explanation: "Name what each instinct just did. Filing and processing is the American posture transplanted: in the United States the institution files and then makes its own risk decision, but this desk is in London, where executing a payment while suspecting the funds is, on the statute's face, being concerned in an arrangement facilitating another's criminal property, and an ordinary suspicious activity report carries no permission with it. The quiet exit is a trap with the same teeth: returning the balance is itself converting and transferring suspected criminal property, so the exit needs the same machinery the payment does. The investigation instinct fails on the threshold: UK law sets suspicion at a possibility that is more than fanciful, the line this file has already crossed, and corroboration is not the statutory trigger, so operating the account normally while investigating simply continues the arrangement. The disciplined move is the one mechanism no other major regime operates: pause the act, disclose it to the NCA with the suspicion, and let the consent clocks run, because consent, express or by silence, is a complete defence for the disclosed act, and its absence is the offence itself. You made this call blind; the lesson ahead builds the statute that makes it obvious, and the machinery that makes it survivable."

conceptTags: ['poca','nca']. points 10. teaches: uk_cold_open.

## Scene 3 — `The decision standard` (NEW slide, callout)
item: "All crimes, all persons, low threshold: suspicion is a possibility more than fanciful, and once it forms, the act pauses. The UK answers suspicion with permission: authorised disclosure, statutory clocks, then the act. The regulations are criminal law; the Guidance is non-binding and decisive; supervision splits by sector. London asks permission; New York files and decides."

narration: "Here is the standard behind the call you just made, and every decision in this lesson reapplies it. Start with the spine's three design choices. All crimes: any offence generates criminal property, no predicate list, no de minimis. All persons: the principal offences bind everyone in the jurisdiction, banker or not, with the regulated sector carrying extra duties on top. Low threshold: suspicion means a possibility that is more than fanciful, so the mental element arrives early, and the moment it arrives, continuing to act is exposure. Then the answer the regime gives to that exposure: permission. An authorised disclosure to the NCA before the act, statutory clocks running in the discloser's favour, and a complete defence for the disclosed act when consent arrives, expressly or by silence. Around the spine, three more fixtures: the preventive regulations are criminal law, with a conviction on the record to prove it; the Guidance is formally non-binding and practically decisive, because a court must consider it and the supervisor builds its expectations from it; and supervision splits by sector, the financial firms to the FCA, the rest across HMRC, the Gambling Commission and the professional bodies. And keep the comparison from your cold open pinned where you can see it: London asks permission, New York files and decides. Every scene ahead is one of these commitments, worked in detail."

conceptTags: ['poca','mlr_2017']. teaches: uk_decision_standard.

## Scene 4 — retained opener, prepend + fix 3
Prepend: "Hold the call you just made on that payment; by the end of this lesson the statute behind it will be yours to quote. " + [body verbatim with fix 3].

## Scene 9 — mid 1 `Decision: the account you keep running` (Q1 verbatim)
intro: "The arrangements offence and the valve you just read, applied to the desk where they collide." teaches: uk_328_applied. conceptTags: ['poca'].

## Scene 11 — mid 2 `Decision: day eight` (Q2 verbatim)
intro: "The consent clocks you just read, on day eight of a live file." teaches: uk_daml_applied. conceptTags: ['nca','poca'].

## Scene 14 — `Work the file` (NEW interactive; caseTitle "The NatWest file, 2021")
All facts verbatim from the cleared deep-case + CDD-module record. Sources = "The public record of the prosecution and sentencing." Spoiler discipline: the charging decision is step 1's reveal; the sentence and fine are step 3's reveal; step evidence carries only conduct facts. Record/frame rule: evidence cards carry record facts only; constructed desk pressure lives in the prompts.

intro: "The CDD module read this case for its substance: the customer whose declared GBP 15 million turnover became GBP 365 million of deposits, GBP 264 million of it in cash, while the monitoring that should have connected file to reality did not. This file reads the same record for its instrument, because the choice of instrument is the lesson: what a regulator does when the failure is this complete, and what that choice tells every UK-regulated institution. Every evidence card and reveal is from the public record of the prosecution and sentencing; the decision prompts are the desk you are placed at. Read each evidence card, commit to your call, then see what it cost."

### Step 1 `Evidence item 1: the instrument question` (id 'instrument', key c)
evidence.observed: "The record before the regulator: a customer whose declared turnover of GBP 15 million became GBP 365 million of deposits, GBP 264 million of it in cash; red flags that were extreme, prolonged, internally visible and unactioned; and monitoring systems that never connected the customer file to the account's reality."
evidence.source: "The public record of the prosecution and sentencing."
evidence.inference: "The failures are documented. The open question is which legal instrument fits a record like this, and the answer will define the UK enforcement map."
evidence.confidence: "High; the conduct record is the documented basis of the eventual proceedings."
decision.prompt: "Place yourself in the regulator's enforcement deliberation. Which theory takes this case forward?"
- a: "The POCA principal offences: the bank converted and transferred what proved to be criminal property for years, sections 327 and 328 fit the conduct on their face, and a laundering conviction is the strongest signal the criminal law can send to the sector."
- b: "The civil track: serious, sustained control failures resolve as negotiated penalty notices, the Standard Chartered and Commerzbank route, and no criminal instrument had ever been used against a bank under the regulations in their two-decade history."
- c (KEYED): "Criminal prosecution under the Money Laundering Regulations themselves: the regulations are criminal statutes, liability attaches to the failure of the systems rather than to knowing participation, and this record proves that failure completely."
- d: "Section 330 failure to disclose against the bank: the institution plainly had reasonable grounds to suspect its customer, and the objective limb was written for exactly the situation where suspicion should have formed and did not."
decision.explanation: "Match the theory to what the record can prove. The principal offences require the institution to know or suspect, and the prosecution's own theory was precisely that the bank's systems failed to form the suspicion its information supported, so a laundering charge would have to prove the mental element the case is about lacking. Section 330 runs against individuals in the regulated sector, with institutional liability running through other instruments. The civil track was available, and its very history is the trap: two decades in which the regulations' criminal character had never been tested against a bank made the negotiated-notice route feel like the only route. What the record actually proves, completely and to the criminal standard, is a failure of the systems the regulations themselves command, and that is the charge: the regulations are criminal law, and liability for the failure of the systems requires no proof that anyone inside the bank knowingly participated."
reveal: "The Financial Conduct Authority charged National Westminster Bank Plc with three offences under regulation 45(1) of the Money Laundering Regulations 2007, the predecessor regulations in force during the relevant period: the FCA's first criminal prosecution under the regulations, and the first criminal prosecution of a bank under them. The dog that did not bark was POCA: no laundering charge, because the theory was the failure to be capable of knowing."

### Step 2 `Evidence item 2: the gravity line` (id 'gravity', key a)
evidence.observed: "On one side of the regulator's record: Standard Chartered's April 2019 Decision Notice at GBP 102.2 million and Commerzbank London's June 2020 Final Notice at GBP 37,805,400, serious and sustained control failures, resolved as civil penalties with no conviction. On this file: a failure concentrated in a single relationship, with the red flags extreme, prolonged, internally visible and unactioned."
evidence.source: "The public record of the prosecution and sentencing."
evidence.inference: "Same regulator, serious failures in every file, two different instruments. The line between them is the thing this step asks you to find."
evidence.confidence: "High; all three outcomes and their instruments are the documented public record."
decision.prompt: "What moved this file, and not those, onto the criminal track?"
- a (KEYED): "Completeness and provability: a failure so total, in one visible relationship, that breach of the regulations themselves could be proved to the criminal standard, where diffuse control deficiencies across a large book fit the negotiated civil instruments instead."
- b: "Scale: GBP 365 million through a single customer dwarfs the conduct behind either civil notice, and beyond a certain quantum of laundered funds the criminal disposal stops being a choice and becomes the required one for the regulator."
- c: "Derivative guilt: the customer's principals faced their own proceedings for the underlying criminality, and once the predicate conduct is established on the customer side, the bank's conviction follows from it as a matter of course."
- d: "Track exhaustion: a firm with prior civil enforcement history cannot be offered the negotiated route twice, so the bank's regulatory record closed the civil track and left prosecution as the only instrument available."
decision.explanation: "The gravity line is evidentiary, not arithmetic. The criminal track demands proof to the criminal standard that the regulations themselves were breached, and what makes that provable is completeness: one relationship, extreme and prolonged red flags, internally visible and unactioned, a record a jury can hold. Diffuse deficiencies across thousands of accounts, however costly, fit the civil instruments that price control weakness without proving criminal breach. The scale answer invents a quantum threshold that exists nowhere in the regulations. The derivative answer imports a doctrine the criminal law does not run: the customer's criminality is context, and the bank's liability had to be proved against the bank on its own systems. And track exhaustion is an invented rule; the choice between tracks is the regulator's judgment on gravity, which is exactly why the choice itself is the signal every institution should read."
reveal: "The bank pleaded guilty in October 2021 at Westminster Magistrates' Court. The choice of the criminal track, and the plea, put the gravity signal on the public record: civil for deficiency, criminal for collapse."

### Step 3 `Evidence item 3: sentencing day` (id 'sentence', key b; PREDICT the outcome)
evidence.observed: "Guilty pleas to three offences under regulation 45(1) of the Money Laundering Regulations 2007, entered in October 2021 at Westminster Magistrates' Court. The matter moves to Southwark Crown Court for sentence."
evidence.source: "The public record of the prosecution and sentencing."
evidence.inference: "A convicted bank is a first for these regulations. How a criminal court prices an institution's systems failure is the open question."
evidence.confidence: "High; the plea, the venue and the sentencing record are the binding public documents."
decision.prompt: "Before the reveal: how did the sentencing resolve?"
- a: "A modest fine with the weight placed on remediation undertakings: a first-of-its-kind prosecution establishes the precedent rather than the price, and the court left the programme obligations to the supervisor's own tools."
- b (KEYED): "A fine approaching the laundered cash itself, reduced for the guilty plea: the criminal sentencing framework priced culpability and harm in the hundreds of millions, landing near GBP 265 million."
- c: "A fine plus convictions of the responsible relationship managers: the criminal track's point is individual accountability, and the sentencing hearing dealt with the bank and its officers together on the same indictment."
- d: "A suspended penalty conditional on a monitorship: the court imported the deferred-resolution architecture, holding the fine over the bank pending an independent monitor's certification of the remediation programme."
decision.explanation: "The criminal sentencing framework does what the civil track cannot: it prices culpability and harm on the criminal scale, with credit for the plea, and on this record that arithmetic reached the same order of magnitude as the cash that moved. The modest-fine reading misjudges what a first conviction is for: the precedent and the price arrived together. The individual-convictions reading confuses the two sides of the matter: the prosecution charged the bank alone, and the accountability for the underlying criminality ran through the customer side's own proceedings, not through bank officers on the indictment. And the suspended-monitorship reading imports an architecture from a different system: the UK court sentenced, it did not defer, and the supervision of the bank's remediation remained the regulator's business rather than a condition of the criminal outcome."
reveal: "On 13 December 2021, at Southwark Crown Court, National Westminster Bank Plc was fined approximately GBP 264.8 million, the fine reflecting culpability, harm and the guilty plea's credit: the FCA's first criminal prosecution under the Money Laundering Regulations, and the first criminal conviction of a bank under them. The regulations this course has taught from the UK rulebook since Module 2 are criminal statutes, and now there is a conviction that proves it."

debrief: "Read the file back with the three rules it fixes. First, the Money Laundering Regulations are criminal law: every CDD, EDD and monitoring obligation this course taught from the UK rulebook carries, at the gravity ceiling, prosecution rather than penalty, and programme investment cases inside UK institutions are made under that shadow. Second, track choice is the regulator's gravity signal: reading FCA outcomes means reading which track was chosen and why, civil for deficiency, criminal for collapse. Third, the conviction completes the UK map: NCA consent machinery on the transaction timeline, FCA supervision on the programme, civil notices for deficiency, criminal prosecution for collapse, one regime, escalating instruments, and an institution's place on the escalation ladder is set by how completely its own systems failed."

## Scene 15 — `The file, on the record` (NEW reading; >=1500 chars; carries case citations)
Body:
> Everything you just worked is on the public record, and you should know exactly where. The prosecution and its outcome are the Financial Conduct Authority's record of the matter: National Westminster Bank Plc pleaded guilty in October 2021 at Westminster Magistrates' Court to three offences under regulation 45(1) of the Money Laundering Regulations 2007, the predecessor regulations in force during the relevant period, and on 13 December 2021 was sentenced at Southwark Crown Court and fined approximately GBP 264.8 million, the FCA's first criminal prosecution under the regulations and the first criminal conviction of a bank under them, for failing to comply with the ongoing-monitoring and enhanced due diligence requirements in respect of the Fowler Oldfield relationship, the customer whose declared GBP 15 million turnover became GBP 365 million of deposits, GBP 264 million of it in cash. The regulations the charges ran under have their successor in the Money Laundering, Terrorist Financing and Transfer of Funds (Information on the Payer) Regulations 2017, which carry the same criminal enforcement architecture over the obligations this course has taught since Module 2. And the charging logic the case illustrates is written across the Proceeds of Crime Act 2002 itself: the principal offences at sections 327 to 329 police knowing involvement and require the institution to know or suspect; the regulations police the institutional duty to be capable of knowing; and section 330's objective limb polices the individuals in between. The dog that did not bark in this prosecution, no laundering charge against the bank, is that architecture working exactly as designed.
Citations (5, URLs pending verification): FCA NatWest press release / sentencing announcement, 13 December 2021; Money Laundering Regulations 2007 (regulation 45) [legislation.gov.uk uksi/2007/2157]; MLR 2017 [uksi/2017/692]; POCA ss. 327-330 charging-logic [ukpga/2002/29 Part 7 or section URLs]; the retained deep-case citation labels reused/relabelled per builder section.

## Scene 16 — classmate `Priya needs correcting` (Q4 redeployed; carries EVERY anchor)
intro: "Four UK businesses ask who supervises their AML compliance: a payments fintech authorised by the FCA; a chain of estate agents; a casino; and a solicitors' firm doing conveyancing. A consultant's engagement summary answers all four with one line: 'the FCA supervises all UK AML.' Priya, reviewing the summary with you, thinks it holds: 'One conduct regulator, one AML supervisor. That is exactly what the FCA is for, and it is simpler for everyone.'"
prompt (replaces Q4 prompt): "Priya asks what could be wrong with the one-supervisor answer. Correct the mapping."
questions: [Q4 verbatim otherwise: options a-d, key c, explanation]. Anchors carried: all four businesses ✓, the consultant's claim ✓. Priya voices option a's position.
teaches: uk_supervision_applied. conceptTags: ['fca','mlr_2017'].

## Scene 17 — final check, retained title `POCA application`, Q3 only
intro: "The last file before the desk closes, and the most exam-like: run the section 330 analysis precisely, limb by limb."
questions: [Q3 verbatim].

## Scene 18 — retained synthesis + fix 4.

---
## Builder notes for `_convert-ukf.js`
- Follow `_convert-usfr.js` / `_convert-spg.js` exactly (BAK-first, throwing helpers, PENDING guard, quiz split asserted, scene count 18, record-length assertion, pretty-print + list). NEVER copy content text from other convert scripts.
- Quiz prompt prefixes: Q1 'A relationship manager at a London bank continues to operate'; Q2 'A bank files a DAML disclosing its intention'; Q3 'An FCA investigation finds that a compliance analyst'; Q4 'Four UK businesses ask who supervises'.
- teachesConcepts new scenes: uk_desk_briefing / uk_cold_open / uk_decision_standard / uk_328_applied / uk_daml_applied / uk_case_instrument / uk_case_record / uk_supervision_applied.
- conceptTags new scenes: cover ['poca','mlr_2017']; cold ['poca','nca']; standard ['poca','mlr_2017']; mid1 ['poca']; mid2 ['nca','poca']; case ['mlr_2017','fca','poca']; record ['mlr_2017','fca','poca']; classmate ['fca','mlr_2017'].
- Blueprint letter-reference grep: CLEAN (content labels throughout). Record/frame scan: evidence cards carry record facts only; the regulator-deliberation/desk framing lives in prompts ("Place yourself in...", "What moved this file...", "Before the reveal...").
- Citation URL plan (act/SI-root URLs are honest for bundled-section labels since the root document contains every named section; section-specific URLs where a label names one section): POCA root https://www.legislation.gov.uk/ukpga/2002/29 (202-WAF class, acceptable) with per-section URLs .../section/327 etc. where labels are single-section; MLR 2017 root https://www.legislation.gov.uk/uksi/2017/692; MLR 2007 https://www.legislation.gov.uk/uksi/2007/2157 (+ /regulation/45); CFA 2017 https://www.legislation.gov.uk/ukpga/2017/22; Da Silva BAILII (verify); JMLSG guidance page (verify); FCA NatWest press release (verify); FCA_SCB Decision Notice + FCA_COMMERZ Final Notice (URL bank).

## Verification-agent TODO
1. FCA NatWest, 13 December 2021: find the live fca.org.uk press release / news URL. Confirm: guilty pleas entered October 2021 at Westminster Magistrates' Court; sentenced 13 December 2021 at Southwark Crown Court; fine approximately GBP 264.8 million (exact figure if stated); three offences under regulation 45(1) of the Money Laundering Regulations 2007; FCA's first criminal prosecution under the MLRs and first criminal conviction of a bank under them; the Fowler Oldfield figures (GBP 15m predicted turnover, ~GBP 365m deposits of which ~GBP 264m cash); and whether the record supports "no NatWest officers were charged" (the prosecution charged the bank alone; customer-side principals faced separate proceedings).
2. Da Silva: find a live primary/official URL for R v Da Silva [2006] EWCA Crim 1654 (BAILII) and confirm the "more than fanciful" formulation.
3. legislation.gov.uk URL checks (202-WAF to curl is ACCEPTABLE and expected; report the WAF code): POCA root ukpga/2002/29 + /section/327, /328, /329, /330, /335, /338, /340; MLR 2017 uksi/2017/692 + /regulation/7; MLR 2007 uksi/2007/2157 + /regulation/45; CFA 2017 ukpga/2017/22.
4. JMLSG: find the official guidance page URL on jmlsg.org.uk (bot posture?).
5. DAML clocks: confirm 7 working days notice period + 31-day moratorium (POCA s.335) and the CFA 2017 court-extension maximum (31-day increments up to a further 186 days).
6. Re-confirm URL bank: FCA SCB 2019 Decision Notice PDF; FCA Commerzbank Final Notice PDF.
7. Check whether the FCA published a NatWest Final Notice or equivalent case page in addition to the press release (for the strongest citation), and the exact fine figure (£264,772,619.95?).
Rules: curl with browser UA + -L, url_effective checks; one compact table + max 5 notes.
