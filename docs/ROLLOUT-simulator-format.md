# ROLLOUT: Simulator Format Across the Catalog

**Status as of 2026-07-03:** Wave 1 complete. Waves 2-3 pending.
**Read together with:** `docs/SPEC-simulator-lesson-format.md` (how to convert a lesson) and `docs/GTM-PLAYBOOK.md` (the founding cohort this rollout feeds).

---

## Wave 1 — DONE (2026-07-03): the four free previews

The entire surface a prospect judges before buying. All live, all gates passed, all facts verbatim from cleared artifacts.

| Lesson | Course | Case file | Signature decision |
|---|---|---|---|
| Conducting an On-Chain Investigation | CCAS | Bitfinex 2016-2022 | Work the dormant wallet, the broken trail, the key file |
| What Cryptoassets Are | CCAS | Terra/Luna, May 2022 | Classify UST by mechanism BEFORE the de-peg card |
| What Money Laundering Actually Is | CAMS | Danske Estonia | PREDICT the actual US charge (bank fraud, not s1956) |
| Correspondent Banking Risk | CAMS | HSBC Mexico 2010-2012 | SET the country-risk rating with Wachovia on the table |

## Wave 2 — the founding cohort validates the format (operator-led)

Recruit the founding cohort (see GTM-PLAYBOOK section 5 and `docs/PRICING.md`) onto the mixed catalog: four simulator lessons, the rest classic format. Watch, per format:

1. **Completion rate** per lesson (sessions reaching the synthesis scene).
2. **Cold-open wrongness** (want 50-70% wrong; below 40% = too easy, above 85% = demoralizing).
3. **Time-to-return** (days until the student's next session; the format bets on ritual).
4. **Refund rate and verbatim feedback** ("felt like training" unprompted = the win condition).

Decision gate: 2 weeks of cohort data or 15+ students through both formats, whichever first. If simulator wins or ties, proceed to Wave 3. If it loses, the four lessons revert in one command each (`.pre-pilot.bak`) and the format goes back to the lab.

Also in Wave 2 (cheap insurance, one session): a Codex fidelity pass over the NEW decision content in the four converted lessons (stems/options/explanations; the facts are reused and already cleared).

## Wave 3 — REVISED (2026-07-04): the merged sweep

The operator is already running a catalog-wide quality sweep (target >=8 per
lesson) in parallel sessions. Do NOT run quality and conversion as separate
passes; that touches every lesson twice and reviews it twice. One touch per
lesson, both goals:

**The merged pass, per lesson** (SPEC section 6 procedure + quality):
1. Quality-fix the retained readings/slides (the sweep's goal) while
   restructuring into the simulator arc (SPEC section 2).
2. Apply the v1.1 checklist as you author decisions (difficulty arc,
   named-misconception distractors, the decision-standard scene, competent
   classmates). The checklist IS quality work; a 6.5 lesson converted with it
   applied generally lands at 8+.
3. Decision budget with Apply-it now on every lesson: the challenge counts
   toward the 6-9 committed decisions and serves as the exam-like closer of
   the difficulty arc. Trim the final check accordingly; do not stack a heavy
   final check AND Apply-it AND a long case file.
4. Case file from the lesson's deep case where one exists; alternates are
   optional and never block conversion (grow the bank opportunistically).
5. Add the slug to WARMUP_LESSON_SLUGS with each converted module.
6. Gates per lesson, always. Codex: batch the fidelity lane PER MODULE (one
   dispatch carrying the module's new decision content) rather than per
   lesson; the mens-rea/scope class of error is what it catches.
7. Deploy per module with _deploy-lesson-replace (safe until real students
   have progress worth preserving; revisit the deploy tool at first cohort).

**Order:** remaining CAMS lessons in the sweep's existing order (merged from
now on) -> all of CCAS (merged from lesson one) -> the CAMS lessons already
swept in the old format get a LIGHT conversion-only pass at the end (their
content is already at bar; conversion is choreography, ~30-45 min each).

**Validation stance (explicit decision):** the original Wave 2 cohort gate
assumed live students; pre-launch there is no cohort to measure. Proceeding
on the external review (SOUND-WITH-FIXES) plus founder judgment, with the
four preview lessons as the standing canary. First-cohort metrics still get
collected (completion, cold-open wrongness, time-to-return) and can halt the
remaining roll at any point; every conversion keeps its .pre-pilot.bak revert.

**Coordination for parallel sessions:** the mock/simulation workstream must
rebase on current main before editing lib/mock/actions.ts — the flow now
stamps attempts with metadata.kind, gates simulations behind the autopsy,
and feeds readiness from simulations only plus the calibration cap.

## The factory change (do this before generating CGSS)

Do not convert forever; change what the generator emits. This requires a **methodology revision (v1.1 -> v1.2) with an ADR** per the project's standing rule (`docs/COURSE-GENERATION-PROMPT.md` may not be edited silently):

- v1.2 adds: the session shape (SPEC section 2), the case-file scene as the required deep-case FORM, cold-open + mid-decision requirements, briefing register, decision-writing rules.
- The deterministic gates already validate `case-file` scenes; the generation prompt is the only missing piece.
- **CGSS is generated natively in v1.2.** Zero conversion debt for every course after CAMS/CCAS.

## Do-not list

- Do NOT batch-convert the whole catalog before Wave 2 data exists (sample size of one founder is not validation).
- Do NOT generate case facts on the fly for variety; variety comes from the verified case bank (`docs/PLAYBOOK-next-courses.md`).
- Do NOT split multi-question applied scenarios that share an intro when trimming final checks.
- Do NOT deploy a converted artifact before its gates pass and its slug is in warmup-config.

## Wave 4 — BUILT (2026-07-04, same day as the review). Status below.

**The structural blind spot it named (accepted):** brittle transfer. The simulator trains reasoning INSIDE a well-framed lesson arc; the exam delivers concepts mixed, time-boxed, and stripped of narrative scaffolding. The risk is overtraining "follow the lesson arc" instead of "recognize the decision standard anywhere". The mocks are currently the only counterweight. The fix direction: more cross-session disorder, delayed retrieval, and calibrated uncertainty.

All seven additions are LIVE (verified on both courses 2026-07-04). What each became:

1. Flight plan: SHIPPED as the top card on the enrolled course page; exam date on enrollment metadata; three regimes by distance.
2. Desk Mix: SHIPPED at /courses/[slug]/desk-mix; weak half biased by the error ledger (miss count first).
3. Confidence calibration: SHIPPED end-to-end, INCLUDING the readiness cap (over 25% certain-but-wrong with n>=8 holds the signoff at approaching). Readiness also now reads full simulations only.
4. Error ledger: SHIPPED, derived from student_knowledge_state.incorrect_count (no new tables); course-page block + Desk Mix bias.
5. Pressure ladder: SHIPPED as free practice templates on both courses (Sprint 5q/7min, Pace check 10q/15min). Pacing analytics (time-lost breakdowns) NOT built; future polish.
6. Mock autopsy: SHIPPED; simulations gate behind the previous simulation's autopsy (attempts stamped metadata.kind; thrown before entitlement consumption; legacy attempts grandfathered).
7. Exam week protocol: SHIPPED inside the flight plan card, with the stop rule.

Still open from the review: word-level bubble sync (pre-existing deferral) and the difficulty-arc / distractor-sweep retrofit of OLD-format lessons, which the merged Wave-3 pass absorbs lesson by lesson.
