# ADR 0017: Content Pipeline v1

**Date:** 2026-05-22
**Status:** Accepted

## Context

The launch gate is real course content. The course-generation methodology was committed (ADR 0015) and the scene model settled (ADR 0016). This ADR records the pipeline that turns the methodology into a generated course.

## Decision

- `lib/ai/generator/` — a staged Claude Opus pipeline. `docs/COURSE-GENERATION-PROMPT.md` is loaded verbatim as the Opus system prompt; each stage appends a structured-output instruction.
- **Three stages:** (1) **outline** — course metadata, the primary-source list, and the module/lesson breakdown; (2) **per-lesson scenes** — emits the `lib/lesson/scenes.ts` contract; (3) **per-module assessment** — `question_bank` questions and `glossary` terms.
- Output is strict JSON, parsed defensively (`parse.ts`). Each stage persists a JSON artifact under `generated/<slug>/` (gitignored) **before** any database write — making runs resumable and reviewable.
- `scripts/generate-course.ts` — the operator CLI (`outline` / `lesson` / `assessment` / `full` / `write`). `full` is resumable (it skips lessons/modules that already have an artifact) and requires a pre-existing, reviewed outline. `write` is always a separate, deliberate step.
- `writer.ts` writes the course as a **draft** (`course_status = 'draft'`) — unpublished and not enrollable (`/courses` filters `status = 'published'`). The methodology mandates SME review before publishing; publishing is out of scope here.
- **CAMS is the first course** (IP-clean — abundant free primary sources; the methodology's own worked example). The course slug is normalised to `cams`.
- Generation uses Claude Opus 4.7 via OpenRouter (`callOpus`). Cost is tracked per call (`logAiCall`, purpose `generation`) and recorded on the `course_versions` row.

## What this prompt did NOT do

It did not run the full course generation (hours; ~$hundreds–thousands). It built the pipeline and validated it with a **trial**: the CAMS outline (9 modules / 40 lessons — $2.55) plus one lesson's 11 scenes ($0.97) — **$3.52 total**. The trial content was written as a CAMS draft and verified to render in the scene player. The full run is an operator-supervised act — see `docs/RUNBOOK-course-generation.md`.

## Alternatives considered

- **An admin HTTP endpoint instead of a CLI script** — rejected; a full generation runs for hours, past any serverless timeout. A resumable local script is the right tool for an offline one-time job.
- **One-shot whole-course generation** — rejected; per-stage artifacts make a ~$-thousands run resumable and let a human review content before it becomes a course.
- **Generating directly into a published state** — rejected; the methodology mandates SME review. Generated = draft.
- **No source-document retrieval (RAG) in v1** — Opus generates from its training knowledge, disciplined by the methodology; SME review is the accuracy backstop. Source-grounded retrieval is a possible v2.

## Consequences

- + The launch gate has a tool: a real course can be generated from primary sources, on contract, as a draft.
- + The trial proved the whole path — outline → scenes → database → renders — for ~$3.50.
- + Resumability makes the expensive full run safe to operate.
- − The full CAMS generation plus SME review remains to be done — operator work, not engineering.
- − Stage 3 (`question_bank`) was built but not exercised by the trial; its first real run should verify the question format against the mock engine (`lib/mock/`).
- − No RAG: generation quality rests on Opus's training knowledge, the methodology, and SME review.
