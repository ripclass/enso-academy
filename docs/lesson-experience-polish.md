# Lesson experience: polish backlog

Found 2026-07-05 while running CAMS lesson 1.1 ("What Money Laundering Actually
Is") end to end on production. Four issues, ranked with root cause, the exact
files, the fix, and whether it is safe to change while other sessions are editing
lesson content / case files / the generation engine.

**Guardrail:** the "player layer" (`components/lesson/**`, the lesson page, the
course pages) is safe to touch, other sessions edit lesson JSON, the question
bank, case files, and `lib/ai/generator/**`. Anything that writes DB content or
regenerates courses must be timed around their work.

---

## 1. Density / pacing on quiz / knowledge-check scenes  — STATUS: quick fix applied

**Symptom:** scenes like "Daniel needs correcting" drop the whole case brief as
one dense block before the question.

**Root cause:** the player already has narration-synced pacing. `beat-pager.tsx`
(`components/lesson/classroom/`) splits a scene into "beats" shown one at a time,
the on-screen beat is exactly the clip being spoken. But `paginates()` only
returns true for `reading` and `slide` scenes. The dense scene is a **quiz**
scene (`components/lesson/scenes/quiz-scene.tsx`); its long case brief is the
`data.intro` field, rendered as a single small muted paragraph
(`text-sm text-muted-foreground`) above the question. So the meatiest text gets
no pacing and is typographically de-emphasised.

**Fix, two levels:**
- Quick (applied): in `quiz-scene.tsx`, render a long `intro` as a readable
  "the file" panel (normal size, paragraph spacing, subtle border) instead of one
  small muted line. Split on blank lines so it breathes.
- Fuller (deferred): extend beat pacing to quiz scenes so the scenario reveals in
  beats as the lecturer talks, then the question appears. Bigger, the pager
  assumes reading/slide and quiz has its own two-step commit logic.

**Safety:** player-layer only. No collision.

## 2. Perceived performance  — STATUS: deferred (see notes)

Two separate things.

**(a) Voice shows "Preparing / Loading narration" per scene.** Narration is
synthesised on demand the first time a scene plays (`getSceneAudio` in
`lib/lesson/actions.ts` → Google TTS → cached to Storage). First view generates;
later views are instant. Most generated CAMS/CCAS scenes were never
pre-generated, so nearly every first play waits.
- Fix: pre-generate narration for all lessons up front (`lib/audio/pregenerate.ts`
  + `/api/admin/pregenerate-audio`).
- Safety: **operator batch, time it carefully.** Pre-gen writes `audio_url` onto
  `content_library_elements` (DB content) + Storage. A course re-promote changes
  element ids and invalidates the audio. Run after content settles, not during
  re-promotes. Not a code change.

**(b) Lecturer takes ~7s to answer.** `askLecturer` (`lib/lesson/actions.ts`) is
cache-first (instant on a hit) but on a miss calls a Haiku-class model and returns
the whole answer at once, no streaming.
- Fix: stream the reply so it starts typing in ~1s. The Singapore region move
  helps the round-trip; streaming is what fixes the feel.
- Safety: touches `askLecturer` + the chat UI in `lesson-player.tsx`. Shared logic
  but not content. Moderate effort and higher risk (streaming a server action is
  finicky), do it as its own tested pass, not rushed alongside cosmetic fixes.

## 3. Blank "min" in the module list  — STATUS: fixed

**Symptom:** the Modules list shows "... min" with no number.

**Root cause:** `app/(dashboard)/courses/[slug]/page.tsx` renders
`{lesson.estimated_minutes} min`; the generated lessons have `estimated_minutes`
empty, so it prints a bare " min".

**Fix:**
- Applied: only render the label when there is a positive number.
- Better (deferred, data): populate `estimated_minutes` at generation
  (writer/engine), off-limits while sessions run.

**Safety:** trivial presentation fix in a file already owned this session.

## 4. Slides could carry more visual weight  — STATUS: renderer polish applied

**Current state:** `slide-scene.tsx` has four templates (key-points, definition,
comparison, callout) WITH progressive reveal (items build in as the lecturer
speaks, that part is good). They lean on text (label + body). Key-points supports
an `item.icon` but little else uses diagrams, stat callouts, numbering, or strong
composition, so a slide reads like a formatted list rather than a designed slide.

**Fix, two levels:**
- Presentation (applied): enrich the templates, stronger heading scale, numbered
  key-points when there is no icon, more confident spacing and accent usage,
  without touching the reveal mechanics.
- Content (deferred): for real diagrams / meaningful icons the generator must emit
  richer slide data. That is the generation engine, off-limits now.

**Safety:** renderer polish is player-layer and safe; the bigger content-driven
win needs the engine.
