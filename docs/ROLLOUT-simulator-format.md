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

## Wave 3 — the roll (after the gate passes)

**Convert module by module**, not lesson by lesson, so each module ships coherent. Suggested order (best case-file material first):

1. CAMS Module 9 "Learning from Enforcement" (every lesson IS a case; the Apply-it challenge already exists there).
2. CCAS "Learning from Enforcement and Synthesis" (same logic: Binance 2023, BitMEX, Tornado Cash, Lazarus).
3. CAMS Foundations remainder + FATF module (the other early-funnel lessons students hit first).
4. Everything else at 2-4 lessons/week alongside marketing work, using the SPEC's conversion procedure. It is choreography + decision-writing; no engineering remains.

**Cost per lesson:** roughly one focused session-hour with the recipe; the three Wave-1 builders are the templates.

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
