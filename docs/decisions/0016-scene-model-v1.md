# ADR 0016: Scene Model v1 (Lesson Player v2)

**Date:** 2026-05-22
**Status:** Accepted

## Context

An Enso lesson was an ordered list of `content_library_elements` rendered as flat prose with a Q&A panel beside it. The intelligence around it — the student model, lecturer memory, the model-grounded classmate, the mock engine, the signoff — is strong, but the lesson *itself* read like a 2010s e-learning page. A review of OpenMAIC (the AGPL-licensed reference platform Enso draws ideas — never code — from) showed lessons delivered as sequences of designed, typed **scenes**: slides, quizzes, interactive simulations. `FRAMEWORK.md`'s Standard mode and the committed course-generation methodology (ADR 0015) both already call for slides, quizzes, and simulations.

This prompt had to land **before** the content pipeline: Opus course generation costs ~$1–3k per course, and the scene-data contract defined here is the structured output contract the pipeline emits.

## Decision

- A lesson is an ordered list of typed **scenes**. `content_library_elements` gained `scene_type` (enum: `reading` / `slide` / `quiz` / `interactive` / `pbl`) and `scene_data` (jsonb payload). Existing rows default to `reading` / `{}` — backward compatible.
- `lib/lesson/scenes.ts` is the canonical contract: a discriminated `Scene` union plus `parseScene`. It is consumed by the renderers **and** is the output contract the content pipeline / Opus methodology emit.
- v1 renders three scene types richly: `reading` (markdown + citations), `slide` (four bounded templates — key-points, definition, comparison, callout — narrated via the existing TTS), `quiz` (inline formative multiple-choice). `interactive` and `pbl` are defined in the contract but render as a graceful placeholder.
- Quiz scenes are **formative** and feed the student knowledge model (`recordQuizEvidence` → `recordEvidence`). They are **not** the mock exam — the mock engine (`lib/mock/`) is separate and untouched.
- The spine is preserved: the Q&A panel, the lecturer continuity greeting, the classmate gap-check on scene advance, lesson completion + memory summarization, and Listen-mode TTS all carry over.
- Slide rendering is a bounded set of templates, **not** an arbitrary-layout canvas engine.

## What was deliberately cut from v1

The whiteboard, the multi-agent playback director, the canvas slide renderer, and PPTX export — OpenMAIC's heaviest engineering. For an adult professional studying to pass a certification exam, the marginal value over a designed, narrated slide plus Enso's existing model-grounded Q&A and classmate is real but not decisive. `interactive` / `pbl` are in the contract so building them later requires no course regeneration. This is a deliberate later bet, not a launch dependency.

## Alternatives considered

- **A separate `lesson_scenes` table** — rejected; `content_library_elements` plus a discriminator and a jsonb payload is minimal and additive.
- **Overloading the `content_element_type` enum as the discriminator** — rejected; that enum is a pedagogical-category concept (explanation / analogy / definition), not a delivery concept. A dedicated `scene_type` is cleaner.
- **Building interactive simulations in v1** — deferred; the launch gate is one solid scene-based course plus payments. The contract supports `interactive` / `pbl`, so they cost no regeneration when built.

## Consequences

- + Lessons are designed, typed, narrated scenes — not a wall of text. The delivery layer no longer undercuts the intelligence spine.
- + The content-pipeline prompt now has a concrete machine output contract (`lib/lesson/scenes.ts`) to hand Opus — the expensive generation run targets the right shape the first time.
- + Quiz scenes strengthen the spine: formative lesson quizzes feed the same knowledge model as the mocks.
- + Backward compatible — pre-scene content renders as `reading` scenes; nothing is orphaned.
- − The CDCS dev course is only partially re-seeded (lesson 1); it remains a throwaway placeholder, to be replaced by generated CAMS content.
- − `interactive` / `pbl` render as placeholders until their runtimes ship.
- − `lib/lesson/scenes.ts` is now load-bearing for both the player and the pipeline; changes need care — it is effectively a public contract.
