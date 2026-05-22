# Runbook — Course Generation

How to generate a course with the content pipeline (Prompt 13 / ADR 0017).

## What you are doing

Generating a course from primary sources via Claude Opus, as a **draft**.
Generation costs real money (Opus via OpenRouter); a full run takes hours.
It is resumable — a failure does not waste completed work.

## Prerequisites

- `OPENROUTER_API_KEY` in `.env.local`, with credit available on OpenRouter.
- `docs/COURSE-GENERATION-PROMPT.md` present (the methodology — the Opus system prompt).
- The course brief set in `scripts/generate-course.ts` (the `COURSE` constant).

## Procedure

**1. Generate the outline.**
```
pnpm tsx scripts/generate-course.ts outline
```
Writes `generated/<slug>/outline.json`. Cost: a few dollars.

**2. Review the outline.** Open `generated/<slug>/outline.json`. Check the
modules, the lessons, and the source list. The whole course is generated
against this — fix it before continuing (edit the JSON directly, or re-run).

**3. Generate all lessons and assessments.**
```
pnpm tsx scripts/generate-course.ts full
```
Loops every lesson (Stage 2) and every module's assessment (Stage 3).
Resumable — re-run after a failure and it skips completed artifacts. This is
the expensive part: budget hours and ~$hundreds. The run prints a per-lesson
cost line and a running total. (Or generate piecemeal: `lesson <m> <l>` and
`assessment <m>`.)

**4. Review the artifacts.** `generated/<slug>/lessons/*.json` and
`generated/<slug>/assessment/*.json`. Spot-check citation discipline and
accuracy.

**5. Write to the database.**
```
pnpm tsx scripts/generate-course.ts write
```
Writes the course as a **draft** — unpublished, not enrollable.

**6. SME review.** A credentialed subject-matter expert reviews the draft for
factual accuracy and hallucinated citations (a methodology QA requirement).
This is mandatory and is not automated.

**7. Publish.** Only after SME review: set `courses.status` to `published`
and `courses.published_at`. (A publishing workflow is a future prompt.)

## Cost control

- Run the **trial** first on any new course — `outline` then one `lesson`.
  The CAMS trial cost ~$3.50.
- `full` is resumable: a failure does not waste completed work.
- Every Opus call is logged (`audit_log`, purpose `generation`); the
  `course_versions` row records the run.

## Re-running

`write` on an existing **draft** course clears and rewrites its content; it
refuses to overwrite a published course. To force regeneration, delete or edit
the artifact files under `generated/<slug>/`.
