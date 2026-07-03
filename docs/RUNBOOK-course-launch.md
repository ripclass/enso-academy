# RUNBOOK: Promote + Publish a Generated Course

**Proven on the CCAS launch (2026-07-03).** Follow in order; the two pre-flight traps at the top are real (both would have broken the CCAS launch).

---

## 0. Pre-flight (catches the known traps)

Run a scan over the course's `generated/<slug>/` artifacts and verify ALL of:

1. **`outline.json` course.slug equals the app's slug key** (e.g. `ccas`). TRAP: the writer takes the DB slug from `outline.course.slug`, NOT from `COURSE_SLUG`. If the outline carries a long descriptive slug, the course lands in the DB under a slug that pricing (`lib/stripe/client.ts` PRODUCTS), mocks, previews, sales content, and URLs do not recognize.
2. **Zero em/en-dashes in outline + lessons + assessment artifacts** (including the course NAME; the writer pushes outline name/descriptions into the DB). TRAP: CCAS's outline had 150, including the name. Fix style: digit-dash-digit ranges -> hyphen; everything else -> comma; names -> clean colon form ("X: Y Exam Preparation").
3. **Outline lessons == artifact files** (count, no missing, no stray, no duplicate slugs). Non-lesson `.json` files must not live in `lessons/` (a duplicate-slug sibling shadows the real lesson at write time).
4. Assessment artifacts present per module; question counts sane.

## 1. Write to the DB (creates/reuses a DRAFT)

```
COURSE_SLUG=<slug> pnpm tsx scripts/generate-course.ts write
```
- Idempotent for drafts (wipes + rewrites children); REFUSES to overwrite a published course (unpublish first for a re-promote).
- Expect the log to say roughly 2x lesson count ("N generated lesson(s)") because it counts `.validation.json` siblings; harmless.

## 2. Verify the write (SQL, before anything else)

One query: modules / lessons / scenes / questions / glossary counts vs the artifacts; **0 em-dashes** in scene_data and question text; **distinct question domains exactly match the mock seed script's DOMAIN_ constants** (string-exact).

## 3. Seed the mock templates

```
pnpm tsx scripts/seed-<slug>-mock.ts
```
(Write one per course from `scripts/seed-ccas-mock.ts` / `seed-cams-mock.ts` as templates; verify the blueprint numbers against the certifying body's handbook FIRST and record the verification.) Confirm the log shows per-domain eligible-question pools comfortably above the per-attempt draw.

## 4. Publish

```sql
update courses set status = 'published' where slug = '<slug>';
```

## 5. Site flips (code, one commit)

- `components/landing/course-lineup.tsx`: card status -> `available`.
- `components/landing/faq-data.ts`: availability answer.
- `lib/courses/preview.ts`: add 2 free-preview lesson SLUGS (never IDs; IDs die on re-promote).
- `lib/lesson/warmup-config.ts`: add the preview slugs.
- `app/(dashboard)/courses/[slug]/page.tsx`: `SALES_CONTENT` entry (exam facts + whatYouGet).
- `lib/courses/blueprint.ts`: the course's exam blueprint + `getBlueprint` case.
- `lib/stripe/client.ts`: `PRODUCTS[slug]` pricing (see `docs/PRICING.md`).
- Typecheck, build, push (auto-deploys).

## 6. Live verification (browser, as a stranger + as a student)

- `/courses/<slug>`: hero, price copy, blueprint weights, preview grid, ACAMS/body disclaimer.
- Create an enrolled test account: `DEMO_COURSE_SLUG=<slug> pnpm tsx scripts/create-demo-account.ts <email>`.
- Open a lesson (check the format renders), start the free practice mock (check questions assemble, timer runs).
- Delete the test account when done.

## 7. Post-launch notes

- Re-promote re-creates content with NEW row IDs. Anything keyed by ID breaks; key by slug (this killed the free-preview grid once).
- Lesson audio is synthesized on demand and self-caches; no pre-generation required for launch.
- Surgical single-lesson updates after launch: `scripts/_deploy-lesson.js` (same structure, in-place) or `scripts/_deploy-lesson-replace.js` (structure changed; only while no real student progress matters).
