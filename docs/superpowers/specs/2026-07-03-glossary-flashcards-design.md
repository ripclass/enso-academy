# Glossary-backed flashcards (MVP) — design

**Date:** 2026-07-03
**Status:** Approved (design signed off; building)
**Owner lane:** interactive-simulations (components/lesson, lib/cases-adjacent, challenge/interactive DB tables)

## Goal

A per-course **Study** surface that turns each course's existing `glossary`
(term + definition, already in the DB) into a spaced-repetition flashcard deck.
No content authoring, no content regeneration. Course-agnostic, so CAMS (live)
and CCAS both get it. Directly serves the "interactivity is thin / must feel
worth the price" product priority with a study tool cert candidates expect.

## Source data

The existing `glossary` table (per course): `id`, `course_id`, `term`,
`definition`, `short_definition?`, `aliases[]`, `related_terms[]`. One card per
glossary row. Front = `term`, back = `definition` (fall back to
`short_definition` only if `definition` is empty; it is NOT NULL, so always use
`definition`). Term -> definition direction only for the MVP.

## Scheduler — simple Leitner ladder

Each (student, card) has a **box** (1..5) and a **due_at**. Box -> interval:

| box | interval after rating |
|-----|-----------------------|
| 1   | same session (re-shown; persists due now) |
| 2   | 1 day  |
| 3   | 3 days |
| 4   | 7 days |
| 5   | 21 days |

Ratings and box transitions:
- **Again** -> box 1. Re-appended to the end of the current session queue (seen
  once more now); persisted due now so it is due next session too.
- **Good** -> box = min(box + 1, 5). Removed from the session; due = now + interval(new box).
- **Easy** -> box = min(box + 2, 5). Removed from the session; due = now + interval(new box).

A **new** card (no row yet) is treated as box 1 for its first rating (the table
default), so the same rules apply: Again -> box 1, Good -> box 2, Easy -> box 3.
A row is written on that first rating.

**Learned** = box >= 4 (interval >= 7 days). Deck header counts learned vs total.

Interval hints under the buttons (as in the mockup) are the actual next interval
each rating would produce from the card's current box (e.g. Again `<1d`,
Good `+3d`, Easy `+7d`).

## Data model — one new table

`flashcard_reviews` (mirrors `daily_case_results`: student-owned, RLS on with NO
public policy; all access via server actions using the admin client):

```
id            uuid pk default gen_random_uuid()
student_id    uuid not null references auth.users(id) on delete cascade
course_id     uuid not null references public.courses(id) on delete cascade
glossary_id   uuid not null references public.glossary(id) on delete cascade
box           smallint not null default 1
due_at        timestamptz not null default now()
reps          integer not null default 0
lapses        integer not null default 0
last_reviewed_at timestamptz
created_at    timestamptz not null default now()
updated_at    timestamptz not null default now()
unique (student_id, glossary_id)
```

Indexes: `(student_id, course_id, due_at)` for the due query.
RLS enabled, no policy (service-role only), like `daily_case_results`.

Migration timestamp placed after the latest existing migration (there is a
`20260703120000` from a parallel session), additive only — no dependency on
other sessions' tables, so apply order is safe.

## Server actions (lib/flashcards/actions.ts, 'use server')

- `getStudyDeck(courseSlug, opts?)` -> `{ due: Card[], newCards: Card[], counts: {due, learned, total} }`
  - resolves course by slug; requires an authenticated **enrolled** student
    (mirror the cases desk gating); admin client reads glossary + the student's
    flashcard_reviews; computes due (due_at <= now) and new (no row), caps new
    at NEW_PER_SESSION (20); returns counts (total glossary, learned = box >= 4).
- `recordFlashcardReview(glossaryId, rating)` -> `{ box, dueAt }`
  - auth-gated; upserts the row applying the pure scheduler; writes reps/lapses/
    last_reviewed_at. Anonymous -> no-op guard (should not happen behind gating).

Pure scheduler logic lives in `lib/flashcards/schedule.ts` (no I/O) so it is unit
tested directly: `nextState(prev, rating, now) -> { box, dueAt }` and
`intervalHint(box, rating)`.

## UI

Route `app/(dashboard)/courses/[slug]/flashcards/page.tsx` (server component:
resolve course + enrollment, then render the client study surface), plus a
`Flashcards` tab in the shared course nav next to Lessons / Cases / Mock.

- **Deck overview** (`components/flashcards/deck-overview.tsx`): three stat tiles
  (Due today / Learned / In deck), a "Start studying" button, a learned-progress
  bar. Empty/all-caught-up state when nothing is due.
- **Study session** (`components/flashcards/study-session.tsx`, client): a flip
  card (term -> definition), progress rail (card i of N due), Show answer, then
  Again / Good / Easy with interval hints. Calls `recordFlashcardReview` on each
  rating; advances the in-memory queue (Again re-queued to the end). End screen
  with a short recap and a "study more / done" affordance. Brand UI kit; mobile
  friendly (tap to flip).

Gating: enrolled students only (consistent with course content). Non-enrolled /
signed-out sees an enroll/sign-in prompt, matching the cases desk.

## Deliberate MVP scope cuts (later, if wanted)

- **No knowledge-model feed** — glossary terms are not `concept_tags`; the
  mapping is fuzzy and low-value for v1. Flashcards keep their own SRS state.
- Term -> definition only (no reverse cards).
- No free non-enrolled taster.
- No cross-lesson cloze cards or missed-question decks.

## Files

New: the migration; `lib/flashcards/schedule.ts` (+ test); `lib/flashcards/actions.ts`;
`app/(dashboard)/courses/[slug]/flashcards/page.tsx`;
`components/flashcards/deck-overview.tsx`; `components/flashcards/study-session.tsx`;
regenerate `lib/supabase/database.types.ts`. Changed: the shared course nav (add the tab).

## Verification

- TDD the pure scheduler (`schedule.test.ts`): box transitions for
  new/again/good/easy, interval math, learned threshold, clamping at box 5.
- tsc + production (Turbopack) build.
- Post-deploy browser smoke on prod with a test account (deferred if the shared
  Playwright browser is locked by a parallel session).
