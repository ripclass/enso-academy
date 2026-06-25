# Spec: the Lesson Challenge ("Apply it")

**Status:** DRAFT for review. Build the pilot only after Ripon signs off on this.
**Date:** 2026-06-25

## 1. Summary

A short, scored, **adaptive applied-judgment round at the end of each lesson**,
placed **right before the "What to carry forward" synthesis scene**. It takes
what the lesson just taught, turns it into a few realistic judgments, weights
them toward the concepts *this* student wobbled on, scores them, and writes the
result back into the student model. It reuses the Case Mode engine and the
existing interactive widgets, so it is mostly glue + content, not new machinery.

It is **additive**. Quizzes, in-lesson interactives, Case Mode, and the
office-hours wrap-up all stay exactly as they are.

## 2. Goal and rationale

- A quiz tests **recall** ("what is the Travel Rule?"). The Lesson Challenge
  tests **applied judgment** ("here is a transfer, apply the rule, make the
  call"). Application immediately after teaching is where retention happens, and
  it gives each lesson a satisfying payoff.
- The differentiator is **adaptation**: because we already have a per-concept
  student model, the challenge can target the concepts *this* student fumbled in
  *this* lesson, plus occasionally re-surface a weak concept from an earlier
  lesson (spaced retrieval). Most courses cannot do this; we can.
- It closes the loop: the score feeds `student_knowledge_state`, sharpening the
  model that drives the lecturer, the "Your knowledge state" card, and readiness.

## 3. Non-goals / what we keep

- **Do not remove or replace** the formative quizzes, the in-lesson interactive
  scenes, the PBL projects, Case Mode, or the office-hours wrap-up.
- Not a leaderboard or a daily ritual: that is Case Mode's job. The Lesson
  Challenge is personal and formative.
- Not a gate: the student can proceed to synthesis whether they ace it or not.
  It is a payoff and a signal, not a barrier.

## 4. Placement (decision)

**A new `challenge` scene inserted immediately before the lesson's `synthesis`
("What to carry forward") scene.** Rationale: teach -> retrieve/apply ->
consolidate. The student wrestles with the application first; the synthesis then
ties it together (and can even acknowledge how they did). Quizzes and
interactives earlier in the lesson are untouched; the office-hours wrap-up and
"Complete lesson" remain the terminal step after synthesis.

Alternative considered (after synthesis, as a "final boss"): rejected for the
pilot because consolidating *before* applying weakens the retrieval effect, and
the wrap-up is already the clean terminal beat.

Per-lesson opt-out: a lesson can omit the challenge (config), so very short or
purely definitional lessons are not forced to carry one.

## 5. The mechanic library (match the game to the lesson)

Not every lesson is a judgment call, so the challenge picks the mechanic that
fits the lesson's concepts. We already have most of these:

- **red-flags** — spot the genuine indicators (typologies, sector risk).
- **screening-match** — clear vs escalate an alert (sanctions, PEP).
- **risk-classify** — sort scenarios into risk tiers (CRR, customer risk).
- **flow-trace** — follow the laundering route (layering, investigations).
- **decision** — the single best call (most applied lessons; reused from Case Mode).
- **match / sort / sequence** (NEW, lightweight) — for **conceptual/foundational**
  lessons: match terms to definitions, sort items into categories, order the
  stages of a process (e.g. placement -> layering -> integration; the structure
  of the 40 Recommendations). This is what makes the feature work for lessons
  that have no natural "scenario".

A lesson maps to one or two mechanics. The mechanic(s) come from the lesson's
concept tags.

## 6. Content sourcing (the real work)

The engine is easy; the **scenarios** are the work. Recommended path, cheapest
and safest first:

- **Pilot: a curated, concept-tagged scenario bank in code** (`lib/cases/
  scenario-bank.ts`), covering only the pilot lessons' concepts. No DB, instant,
  fidelity-reviewed by hand. Each scenario is `{ conceptTags, mechanic, spec,
  why }`.
- **Scale (if the pilot validates): a DB-backed concept-tagged scenario bank**,
  reused across end-of-lesson challenges, Case Mode, *and* future courses. This
  amortizes far better than authoring a one-off game per lesson.
- **Later (optional): LLM-generated scenarios** for infinite variety, behind the
  same fidelity discipline we use for lessons. Not the base layer; the per-play
  token cost and fidelity risk make it an enhancement, not the foundation.

Fidelity note: scenarios tied to **real cases or named typologies** are
fidelity-sensitive and get the same review as lesson content. **Synthetic /
generic** scenarios for the conceptual mechanics are low-risk.

## 7. Adaptive selection (the differentiator)

`getLessonChallenge(lessonId)` (server action):
1. Reads the lesson's concept tags.
2. Reads the student's mastery for those concepts from `student_knowledge_state`
   (already populated by the in-lesson quizzes/interactives).
3. Picks N scenarios from the bank, **weighted toward the lowest-mastery
   concepts of this lesson**, and optionally injects **one** scenario on a weak
   concept from an *earlier* lesson (spaced retrieval).
4. Falls back to the lesson's primary concepts, evenly, if the student has no
   model yet (first attempt, signed-out, etc.).

This is the part that makes it feel personal: "you were shaky on X in this
lesson, here is a round on X."

## 8. Architecture (reuse first)

- **Scene contract:** add `challenge` to the scene union in `lib/lesson/
  scenes.ts`. `scene_data` is thin (a config: mechanic hint, N, whether to allow
  the spaced-retrieval injection). The actual scenarios are assembled at render.
- **Server action:** `getLessonChallenge(lessonId)` assembles the challenge
  (section 7). Auth-aware; anonymous/preview gets the default non-adaptive set.
- **Client component:** `LessonChallenge` plays the assembled scenarios using the
  **existing widget components** (`RedFlagSpot`, `ScreeningMatch`, `RiskClassify`,
  `FlowTrace`) plus the decision step, in a short scored loop. This is a scoped
  cousin of `case-desk.tsx`; factor the shared loop if it pays off.
- **Write-back:** on completion, reuse the knowledge-model path
  (`recordEvidence` per concept), exactly like Case Mode.
- **Generator (scale phase only):** extend `lib/ai/generator/lesson.ts` to emit a
  `challenge` scene (and/or scenarios) where the material supports it, and
  `validate_gates.ts` / `writer.ts` to validate + promote it. Not needed for the
  pilot (pilot scenarios are hand-curated).

## 9. Scoring and UX

- Scored as a round (`X / Y` and a %), with per-step feedback (the same
  correct/incorrect + "why" pattern the widgets already render).
- A **retry** to improve (formative, no penalty). The best attempt feeds the
  model.
- On the stage, right before synthesis. The synthesis scene follows. The
  office-hours wrap-up and "Complete lesson" remain after synthesis.
- No leaderboard here (Case Mode owns that). A small "added to your knowledge
  model" confirmation, as Case Mode already shows.

## 10. The pilot

**Scope:** wire the `challenge` scene end to end and hand-author a scenario set
for ~4 lessons spanning the lesson types, to validate the format before
committing to content for 40+ lessons.

Suggested pilot lessons (CAMS):
- **Applied case study** — e.g. *Case Study: Westpac* or *Correspondent Banking
  Risk* -> decision + red-flags (reuses the Case Mode real-case content).
- **Typology** — *High-Risk Categories and Typologies* -> red-flags +
  risk-classify.
- **Sanctions** — *Sanctions Screening Mechanics* -> screening-match.
- **Foundational/conceptual** — *What Money Laundering Actually Is* or *Structure
  of the 40 Recommendations* -> the NEW match/sort/sequence mechanic.

**Success criteria:**
1. It feels like a satisfying end-of-lesson payoff, not a second quiz.
2. The adaptive weighting visibly targets the student's weak concepts (verify
   against `student_knowledge_state`).
3. The conceptual mechanic works for a non-scenario lesson.
4. No fidelity issues in the real-case/typology scenarios.
5. The score writes back to the knowledge model (DB-verified, like Case Mode).
6. Quizzes, interactives, Case Mode, and the wrap-up are all unaffected.

## 11. Rollout phases

1. **Pilot** (this spec): scene type + server action + client component + a
   hand-curated bank for ~4 lessons. Review the feel.
2. **Bank** : promote the scenario bank to a DB-backed, concept-tagged store;
   author scenarios per concept (amortized across lessons, Case Mode, courses).
3. **Coverage**: map every applicable lesson to a mechanic + concepts; opt
   conceptual/short lessons in or out deliberately.
4. **Generator fold**: have the lesson generator emit challenge scenes/scenarios
   for future courses, under the fidelity gates.
5. **Optional**: LLM-generated scenarios for variety.

## 12. Risks and open questions

- **Content cost at scale** (40+ CAMS lessons, 43 CCAS). The bank amortizes; the
  pilot exists to validate before committing.
- **Repetition** if every lesson ends the same way. Mitigated by the mechanic
  library + adaptive selection + per-lesson opt-out.
- **Fidelity** on real-case/typology scenarios. Same review discipline as lessons.
- **Open:** retry policy (unlimited vs capped), exact N per challenge (propose 3
  to 5), and whether to show the spaced-retrieval injection as "a callback to an
  earlier lesson" or silently. Resolve during the pilot.
