# THE ENSO METHOD

**The canonical document.** Everything about how Enso Academy teaches, curates, verifies, and ships a certification course, in one place: the thesis, the evidence, the external review, the systems built, the quality bars, and the exact path a NEW course follows from birth. Written 2026-07-04, after the method was designed, externally reviewed, built, and verified live on CAMS and CCAS.

**How to use it:** read this to understand WHY and WHAT. The operational HOW lives in the referenced docs (SPEC, ROLLOUT, runbooks); this document governs them. A new course (CGSS onward) follows Part 8 top to bottom.

---

## PART 1, THE THESIS

**The student is a working professional with a booked exam and pass anxiety, not a curious browser.** Sessions are 25-45 minutes. The exam (CAMS, CCAS, CGSS, CFE) is reasoning-based multiple choice: it tests recognition, discrimination, and defensible judgment under uncertainty, not recall.

**The old model performed a lecture at the student.** Watch, listen, then a quiz at the end. Adequate content delivered as a spectator experience. The audit that started everything scored those lessons "adequate, 6.5/10, not world-class paid cert-prep."

**The new model is a training simulator.** The unit of teaching is a rep the student PERFORMS, with the instruction as feedback:

- Decisions come BEFORE instruction (the cold open), so the student's untrained instinct is exposed first and the lesson repairs it.
- Cases are INVESTIGATIONS the student works (evidence card, committed decision, reveal), never narrations the student reads.
- The product's memory is VISIBLE: warm-ups target what the student's own record says is slipping; office hours chase what this session missed; the error ledger names the repeat offenders.
- Wrong answers are diagnostic, never failure. The reveal is locked behind the commitment by design: evidence first, action second, hindsight never.

**The felt-sense goal, verbatim:** by minute five the student should feel "this thing is training me, not teaching me."

**The commercial thesis this serves:** the product's core promise is the calibrated readiness signoff, deliberately conservative (framework commitment: we would rather hold a student at "approaching" than call them ready and be wrong). Every system below either trains the student or sharpens that signoff.

## PART 2, THE EVIDENCE BASE (why this works)

The format is built on the strongest replicated effects in learning science:

| Principle | Where it lives in the product |
|---|---|
| Pretesting effect (errorful generation before instruction) | The cold open, expected 50-70% wrong |
| Retrieval practice (testing beats re-reading) | Warm-ups, Desk Mix, quizzes, mocks |
| Spaced + distributed practice | Warm-ups on decaying concepts; the flight plan's cadence |
| Interleaving / desirable difficulty (Kornell & Bjork) | Desk Mix: mixed domains, tag revealed only after commit |
| Case-based learning with immediate corrective feedback | The case-file interactive |
| Metacognition / calibration (Koriat) | The confidence step on every decision; the calibration readout; the readiness cap |
| Deliberate practice (classified errors, targeted repair) | The error ledger; the mock autopsy's next-3-repairs |
| Transfer-appropriate processing / stress inoculation | The pressure ladder; full-fidelity simulations |
| Self-regulated learning / implementation intentions | The flight plan; the exam-week protocol with its stop rule |

**The structural risk the method carries (named by the external review, accepted and countered):** brittle transfer. A student can feel skilled inside a well-framed lesson and fail when concepts arrive mixed, time-boxed, and stripped of scaffolding. The counterweights are Desk Mix (disorder), the ladder (time pressure), full simulations (fidelity), and the autopsy (feedback on the transfer failures themselves).

## PART 3, THE EXTERNAL REVIEW (what an independent expert said)

Three gpt-5.5 review lanes ran on the finished format (2026-07-04):

**Lane 1, pedagogy: verdict SOUND-WITH-FIXES.** "The simulator method is well aligned to adult compliance exam prep." The cold open is "especially well suited"; the case-file rhythm "forces hypothesis discipline." Its fixes, ALL adopted as the v1.1 checklist (SPEC section 7): a difficulty arc instead of constant intensity; distractors as named misconceptions (never wrong-by-obscurity); a reusable decision standard stated once after the cold open; classmates competent-but-mistaken, never foolish; warm-ups labeled with their provenance.

**Lane 2, fidelity: verdict DISAGREE, 3 blockers, all fixed same day.** The lesson for every future author: the facts were reused verbatim and survived; the errors lived in NEW decision text (a chronology slip, an overstated claim, and a mens-rea overgeneralization: "a business built to not know = wilful blindness," which is wrong as a general rule). **Mens-rea and scope claims in explanations are the number-one fidelity risk in authored decision content.**

**Lane 3, design partner: 7 additions proposed, all 7 built and live the same day** (flight plan, Desk Mix, confidence calibration incl. the readiness cap, error ledger, pressure ladder, mock autopsy, exam-week protocol). See Part 5.

**The standing rule from this experience:** external review is cheap relative to what it catches. Every lesson gets the codex audit regardless of who drafted it; the auditor's claims are verified against primary sources before editing, because the auditor is sometimes wrong too.

## PART 4, THE LESSON (how we teach)

Canonical mechanics in `docs/SPEC-simulator-lesson-format.md`. The shape:

1. **Cover, briefing voice.** "Sit down. The file is yours." A senior colleague prepping you for a decision, not a professor. You-as-subject, short sentences.
2. **Warm-up (runtime, model-driven).** 2-3 retrieval questions on the student's weakest OBSERVED concepts. Fresh students get none: no warm-up is better than a fake one. Labeled with provenance ("your record says these slipped").
3. **Cold open.** One hard, realistic decision made blind. The explanation names the reflex the student just used.
4. **The decision standard.** One compact reusable frame ("Predicate. Proceeds. An act on the proceeds. A culpable mental state."), stated once, reapplied by every later decision.
5. **Teaching scenes** (readings and slides, primary-source built, citation-carrying), paced by beats with the lecturer's voice; slides build item-by-item as the narration walks them.
6. **A mid-lesson decision** (easier than the cold open: the difficulty arc).
7. **The case file.** The deep case as 3 evidence steps: structured card (observed / source / inference / confidence), a committed 4-option decision, then the reveal of what investigators actually did. Save a predict-the-outcome for step 3 when the case supports it (Danske: predict the charge). Put the student in the chair at the time (HSBC: set the Mexico rating in 2010 with Wachovia on the table). Cases ROTATE: retakes draw a different verified matter.
8. **"The file, on the record."** A short reading carrying every case's citations, so source discipline survives the interactive format.
9. **The classmate rep.** A named peer voices a plausible misconception; the student corrects a competent colleague.
10. **Trimmed final check**, then the **Apply-it challenge** (adaptive, DB-backed) as the exam-like closer, then **synthesis**.

**Decision budget: 6-9 committed decisions per lesson, Apply-it included.** Every committed decision runs the two-step commit: pick, state confidence (Not sure / Fairly sure / Certain), then the reveal. Confidence is worthless once the answer is visible, so nothing reveals early.

**The classroom around it:** lecturer voice (per-beat TTS, self-caching), the visible preparing state, named classmates, end-of-lesson office hours where classmate questions are biased to THIS session's misses, personal ask-chips from the student's own gaps, a remediation interjection after two consecutive wrong answers, and a session calibration line ("7 committed decisions, 2 certain-but-wrong").

## PART 5, THE TRAINING LOOP (beyond the lesson)

The systems compose into one closed loop; no piece stands alone:

lessons capture decisions and confidence -> the student model updates per concept -> the ERROR LEDGER names repeat offenders (2+ misses) on the course page -> DESK MIX re-runs those traps in fresh questions, mixed across domains, tag revealed only after commit -> the PRESSURE LADDER (Sprint 5q/7min, Pace check 10q/15min, free) makes pacing automatic -> FULL SIMULATIONS replicate the real exam (question count, duration, domain weights, scaled-band reporting) -> the MOCK AUTOPSY forces every miss to be classified (knowledge gap / misread / overthought / time pressure / sure-but-wrong) before the next simulation unlocks, outputting the next 3 repairs -> the FLIGHT PLAN sequences all of it backward from the exam date (steady build / consolidation / exam week with a stop rule against panic-mocking) -> the READINESS SIGNOFF integrates everything conservatively: 5+ simulations, a recent pass streak, average above pass+5, every domain above its floor, no sharp decline, AND calibration (over 25% certain-but-wrong caps readiness at approaching). Practice mocks and ladder drills never inflate the signoff: readiness reads full simulations only.

**The guarantee aligns with the method:** ready-means-ready. If the signoff said ready and the student fails, access extends free until they pass.

## PART 6, REAL CASES (how we curate)

**The iron rule: never generate case facts. Ever.** Every case file is built from the verified public record or it is not built.

- **Allowed sources:** primary regulatory and enforcement materials (DOJ, FinCEN, OFAC, SEC, CFTC, FCA, NYDFS, AUSTRAC, courts), standard-setters (FATF, Basel, Wolfsberg, Egmont), statutes and regulations, and original analysis. Never commercial prep material, never certifying-body content (no ACAMS materials, no ICC rule text), never bank-commissioned reports as substantive authority, never news as substance (news is a pointer only).
- **Facts are verbatim.** Amounts, dates, dispositions, entity names come from cleared, fidelity-reviewed text and are reused word-for-word. New authorship is register, choreography, and decision content only.
- **The facts pack** (`lib/ai/generator/facts_pack.ts`) is the operator-maintained currency spine: every entry verified against primary sources, dated, and injected into generation and review. Currency traps (FATF edition dating stays date-neutral; the revised INR.16 field set is verify-at-generation; DOJ links use /archives/ paths) are documented per course.
- **Citations carry URLs** to official sources (govinfo for USC, eCFR for CFR, EUR-Lex ELI for EU law, legislation.gov.uk, agency press pages), verified live before shipping.
- **The case bank** grows toward 100+ verified case files, tagged by course, concepts, jurisdiction, and type, reused across courses (Danske serves CAMS and CFCS; Bitfinex serves CCAS and CAMS). Rotation: each lesson's case-file can carry alternates; a visit-seeded draw gives retakes a different real matter. Alternates never block a lesson and are never invented. Where a domain has no enforcement record (CDCS documentary credits), court judgments get the verified treatment and practice document sets are clearly labeled constructed exercises: nothing pretends to be real.

## PART 7, ASSESSMENT (quizzes, the bank, mocks)

**Three assessment layers, three jobs:**

1. **Formative quizzes and decisions (in-lesson):** teach through feedback, feed the student model, carry confidence. Explanations name WHY the wrong instinct fails.
2. **The Apply-it challenge (per lesson):** adaptive, drawn from DB-backed scenario banks, the exam-like closer of each lesson's difficulty arc.
3. **The question bank + faithful mocks:** the exam's mirror.

**Question-bank standards (the test-integrity discipline, learned the hard way):**
- Original scenario-based items; concept-durable (no volatile current-list facts); adult-professional register.
- **No answer-position bias** (positions balanced at rest AND shuffled per attempt at runtime).
- **No length tell** (the correct option must not be reliably the longest; distractors are substantive and parity-length).
- **Distractors are named misconceptions**, each defensibly wrong, never wrong-by-obscurity.
- Multiple-response items included at roughly the real exam's share, enforced by mock assembly.
- Every question carries domain, conceptTags, difficulty, explanation, and wrong-answer rationales.
- Bank size principle: HIGH DISTINCTNESS over raw count. The target is enough for several non-repeating faithful mocks per domain (CAMS shipped 502, CCAS 505; pushing further once distinctness is exhausted is padding, not coverage). Growth continues with new distinct angles, not rephrasings.

**Faithful mocks:** question count, duration, domain weights, and pass standard verified against the certifying body's CURRENT candidate handbook BEFORE seeding (recorded per course); results reported as a scaled-readiness band, not a raw percentage; the free practice mock is unlimited for owners; the first full simulation is the lead magnet.

## PART 8, THE BIRTH PATH FOR A NEW COURSE (CGSS onward)

A new course is BORN in this method. The sequence, in order, with its gates:

1. **Market + blueprint.** Confirm the slot (docs/GTM-PLAYBOOK.md, docs/PLAYBOOK-next-courses.md). Verify the exam blueprint against the certifying body's current handbook: format, duration, domains, weights. Record the verification.
2. **Methodology v1.2.** Before generation, the course-generation methodology is revised (versioned, with an ADR: it is never edited silently) so lessons are GENERATED in the simulator arc: cold open, decision standard, case-file deep cases, classmate rep, decision budget, v1.1 checklist. Zero conversion debt.
3. **Facts pack first.** The course's currency spine (editions, dates, amounts, dispositions) verified against primary sources and added to the facts pack BEFORE the first lesson generates.
4. **Case inventory.** Pull the course's case files from the bank; identify gaps; verify new cases into the bank before the lessons that need them.
5. **Generate inline, one lesson per turn** (the session is the generator; never the API path), through the full spine: 7 deterministic gates (schema incl. case-file validation, citation, IP, pedagogy, quiz alignment, methodology, citation_bind) + the dual-lane codex cross-check (methodology AND factual fidelity) per lesson, fix-iterate to AGREE or documented cleared-with-flag.
6. **The quality bar: >=8/10** on an independent senior-examiner audit, reached by the audit-to-asymptote loop: baseline audit -> verify every auditor claim against primary sources (never trust it blind) -> objective fixes only -> re-gate -> re-audit -> stop when remaining items turn subjective. Expect real catches on pass 2-3. Zero em-dashes anywhere.
7. **Assessment bank** to the Part-7 standards, with its own codex cross-check per module. Mock templates seeded (full simulation + practice + Sprint + Pace check) only after domain strings are verified to match the bank exactly.
8. **Promote + publish** per `docs/RUNBOOK-course-launch.md` (the two pre-flight traps: outline slug must equal the app's slug key; zero em-dashes in outline and artifacts including the course NAME). Site flips: lineup, FAQ, preview SLUGS (never IDs: they die on re-promote), warm-up flags, sales content, blueprint, pricing per `docs/PRICING.md`.
9. **Previews are the storefront.** Two free preview lessons per course, always in full simulator format with a case file (rotating if an alternate exists): they are what prospects judge.
10. **Measure.** First-cohort metrics: lesson completion, cold-open wrongness (target 50-70%), time-to-return, calibration trends, refunds. Every conversion and every lesson keeps a one-command revert (.bak files); the metrics can halt a roll at any time.

## PART 9, THE QUALITY SYSTEM (summary of every gate a lesson passes)

A shipped lesson has survived, in order:
1. Verified sourcing (facts pack + primary sources + live URLs).
2. The 7 deterministic gates.
3. The dual-lane codex cross-check (methodology + fidelity) at generation, or the senior-examiner audit loop at rebuild: independent, adversarial on new decision content, claims verified before fixes.
4. The >=8 bar at the asymptote, held items documented.
5. The integrity diff: retained facts byte-verbatim, quiz integrity, em-dash zero, register.
6. Runtime integrity it inherits for free: per-attempt option shuffling, confidence capture, model updates, case rotation.
7. Live verification in the browser before it is called done, and the honest-reporting rule: what was tested, what was not, what is held.

**The division of labor that keeps this scalable:** the judgment layer (blueprints, line-review of every new decision, integrity diffs, sign-off) is separated from the legwork (source-verification sweeps and builder drafting by cheaper agents, returning compact tables). The external gate never varies with authorship.

## PART 10, DOCUMENT MAP

| Document | Governs |
|---|---|
| THIS FILE | The method: thesis, evidence, review, standards, birth path |
| docs/SPEC-simulator-lesson-format.md | Lesson mechanics: arc, case-file spec, rotation, conversion procedure, v1.1 checklist |
| docs/ROLLOUT-simulator-format.md | Sequencing: waves, merged-pass rules, Wave-4 systems status |
| docs/COURSE-GENERATION-PROMPT.md (v1.1 -> v1.2) | The generation methodology (ADR-gated revisions) |
| docs/PLAYBOOK-next-courses.md | Course order, case supply, the case-bank program |
| docs/RUNBOOK-course-launch.md | Promote + publish mechanics |
| docs/PRICING.md | The price sheet and launch ladders |
| docs/GTM-PLAYBOOK.md | Market, trust, content engine |
| lib/ai/generator/facts_pack.ts | The verified currency spine |
| lib/lesson/scenes.ts | The scene contract (code as canon) |
