# SPEC: The Simulator Lesson Format

**Status:** Live on all four free-preview lessons (2026-07-03). This is the canonical spec for converting existing lessons and for generating new courses natively in this format.
**Read together with:** `docs/ROLLOUT-simulator-format.md` (when to convert what) and `docs/SESSION-NOTES.md` 2026-07-03 entries (build history and gotchas).

---

## 1. The idea, in one paragraph

The old format performed a lecture *at* the student (OpenMAIC-style classroom simulation). This audience (working compliance professionals, 25-45 min sessions, pass anxiety, a reasoning-based exam) needs to be *worked on*, not presented to. The unit of the format is a **rep the student performs, with the teaching as feedback**: decisions before instruction, cases as investigations rather than narrations, and the product's memory made visible. The student should feel by minute five: "this thing is training me, not teaching me."

## 2. The session shape (scene order)

Every simulator lesson follows this arc. Runtime-injected scenes are marked (R).

1. **Cover: "You are on the desk"** (reading, 2-3 short paragraphs, briefing voice). Sets the role and the deal: you decide first, hindsight never. Carries the opener's citations.
2. **(R) Warm-up** (quiz, assembled at render). 2-3 retrieval questions on the student's weakest *observed* concepts, pulled from the course question bank by the student model. Fresh students get none; never fabricate a warm-up.
3. **Cold open** (quiz, 1 question, NEW content). A hard, realistic decision made blind, before any teaching. Expect 50-70% wrongness; that is the design (pretesting effect). The explanation names the reflex the student just used.
4. **Original teaching scenes** (readings/slides, kept verbatim). The original opener gets a 1-sentence connective prepend referencing the cold open.
5. **Mid-lesson decision(s)** (quiz, 1 question each). Either new, or a *self-contained* question redeployed from the original final check. Placed after the teaching it applies.
6. **The case file** (interactive, kind `case-file`). The lesson's deep case as 3 evidence steps: card, committed decision, reveal. See section 4.
7. **"The file, on the record"** (reading, short). Carries the deep case's citations so source discipline survives the interactive format.
8. **Classmate rep** (quiz, 1 question). A named classmate (Priya, Marcus, Aisha, Daniel, Lena, Omar) voices a plausible misconception; the student corrects them before they embarrass themselves. Usually a reframed final-check question; carry any shared scenario into the intro.
9. **Trimmed final check** (quiz). The remaining original questions. Keep multi-question applied scenarios INTACT (do not split questions that share an intro).
10. **(R) "Apply it" challenge** (existing system, only for lessons in `CHALLENGE_LESSON_SLUGS`). Injects before synthesis; coexists fine.
11. **Synthesis** (slide, kept verbatim).

Decision density target: 6-9 committed decisions per lesson, distributed, instead of one end-loaded quiz.

## 3. Writing rules (non-negotiable)

- **No new facts, ever.** Case facts, amounts, dates, dispositions are reused VERBATIM from the cleared artifact. New text = register, choreography, decision stems/options/explanations only.
- **Quiz integrity:** 4 substantive parity-length options per decision, each wrong option a *real practitioner instinct*, no length tell, positions irrelevant (player shuffles per attempt).
- **Briefing register:** senior colleague prepping you for a decision, not a professor. Short sentences. "You" as the subject.
- **No em-dashes** anywhere (the builder scripts assert this).
- **Explanations teach:** after a wrong choice, the explanation names WHY that instinct fails, not just the right answer.
- Readings must carry `citations[]` (gate-enforced). Interactives cannot carry citations, hence the on-the-record scene.

## 4. The case-file interactive (`kind: 'case-file'`)

Contract in `lib/lesson/scenes.ts` (`CaseFileStep`), widget in `components/lesson/scenes/interactives/case-file.tsx`, gate validation in `lib/ai/generator/validate_gates.ts`.

Per step: `heading`, `evidence { observed, source, inference, confidence }` (examiner's-file discipline, stated confidence with justification), `decision { prompt, options[4], correctOptionId, explanation }`, `reveal` (what investigators/the institution actually did). Plus case-level `caseTitle`, `intro`, `debrief` (the confidence recap / closing lesson).

Design patterns proven in Wave 1:
- **3 steps** per case: setup, escalation, resolution.
- **Save a predict-the-outcome for step 3** when the case supports it (Danske: predict the charge; HSBC: which field re-arms the stack). Keep spoiler facts OUT of earlier evidence cards.
- **Put the student in the chair at the time** (HSBC: set the Mexico rating in 2010 with Wachovia on the table, THEN reveal what HSBC rated).
- Results feed the student model automatically (60% threshold per widget).
- **Narration is built in:** each card is read aloud as it appears (fields in order, ending on the decision prompt), each reveal on unlock, the debrief on close. The scene's `summary` is NOT narrated (suppressed in `sceneNarration` + `getSceneAudio`). Nothing to do per lesson; it just works.

## 5. Runtime systems (already built, file map)

| System | Behavior | Files |
|---|---|---|
| Warm-up | 2-3 weakest-observed-concept questions from question_bank, injected after the cover | `lib/lesson/warmup.ts`, `lib/lesson/warmup-config.ts` (add the slug!), injection in `app/(dashboard)/lessons/[id]/page.tsx` |
| Remediation | 2 consecutive wrong quiz answers -> lecturer steps in via chat (capped 1/session) | `handleQuizAnswer` in `lesson-player.tsx` |
| Session-miss office hours | Concepts missed THIS session outrank the model's global weakest for the closing classmate question | `missedConceptsRef` in player; `sessionMissedConcepts` in `lib/classmate/actions.ts` |
| Office-hours prefetch | Next classmate Q&A generates while the current one plays (no dead air) | `wrapNextRef` / `generateWrapUpQA` in player |
| Continue buttons | Quiz scenes and the case-file debrief show in-flow Continue once complete | `quiz-scene.tsx`, `case-file.tsx`, `onQuizContinue` |
| Card narration | See section 4 | `speakWidgetText` in player, `onSpeak` thread |

## 6. Conversion procedure (per lesson, ~1 session-hour each)

1. Inspect the artifact: `node -e` dump of scenes (titles, types, body lengths, quiz questions, deep-case content). Identify: the deep case, redeployable final-check questions, shared quiz scenarios.
2. Write a builder script `scripts/_build-pilot-<abbrev>.js` following the existing three (`_build-pilot-wca.js`, `_build-pilot-wml.js`, `_build-pilot-cbr.js`). It must: read from `<artifact>.json.pre-pilot.bak` (create on first run; idempotent), reuse retained scenes byTitle, assert no em-dashes, assert citations on readings, mirror `conceptTags` from `teachesConcepts` on new scenes.
3. Run it, then gates: `pnpm tsx scripts/validate-lesson.ts <course> <slug>`. FLAG-only (duplicate-tag pedagogy flags are the accepted class); fix any FAIL.
4. Add the slug to `WARMUP_LESSON_SLUGS` in `lib/lesson/warmup-config.ts` (typecheck + commit + push; this is code).
5. Deploy the artifact: `node scripts/_deploy-lesson-replace.js <course> <slug>` (delete + fresh insert, new scene IDs; only safe while the lesson has no real student progress worth preserving).
6. Verify live: scene list shows the arc; the case file renders; answer one decision to see feedback + reveal.
7. **Revert path:** restore the `.json` from `.json.pre-pilot.bak`, redeploy with the same script.

## 7. Known gaps / deferred

- Bubble word-level sync (bubble pins the first sentence of a beat by design; word timestamps from TTS is the real fix, a session of its own).
- New decision content has NOT had a Codex fidelity pass (facts are reused, but stems/options/explanations are new). Run one before declaring the format final.
- Case variety on retake = shuffled options only. The fix is the case BANK (see `docs/PLAYBOOK-next-courses.md`), never on-the-fly generation.
