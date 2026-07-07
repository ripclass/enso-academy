# PLAN: Wiring the 66 Gated Cases Into Lesson Rotations

**Written 2026-07-06. This is the step that turns the case bank from a gitignored asset worth $0 into product a student pays for.** Do it before building case 67.

## The interface (verified, not guessed)

- `lib/lesson/scenes.ts`: a **case-file scene**'s `sceneData` is `({ alternates?: CaseFileCase[] } & CaseFileCase)`. It holds ONE primary `CaseFileCase` plus an `alternates[]` array. At runtime, **ONE of `[primary, ...alternates]` is selected per visit/attempt**. That is the rotation. More alternates = more distinct real matters a repeat visitor sees.
- A **bank case's `.case` field IS a `CaseFileCase`** (same `{caseTitle, intro, steps, debrief}` shape the renderer consumes). It is drop-in compatible. That was the entire design intent.
- The 4 pilot lesson builders each already define an `sCaseFile` scene with an inline `alternates: [...]` array and include it in the scene list: `scripts/_build-pilot-cbr.js`, `_build-pilot-lesson-v2.js`, `_build-pilot-wca.js`, `_build-pilot-wml.js` (all show `sCaseFile` at ~line 120-150, `alternates` at ~line 257-288, `sCaseFile` in the scene list at ~line 450-506).

So wiring = feed gated bank `.case` objects into a builder's `alternates` array, then re-run the builder to rebuild + redeploy that lesson's `scene_data`.

## Hard constraints (do not violate)

1. **Through the BUILDERS only.** Never patch the DB `scene_data` directly. Builders rebuild scene_data wholesale, so a DB-only patch is overwritten on the next build and drifts the source of truth.
2. **Only when `git status` shows the target builder/lesson files untouched.** A parallel lesson-format session shares this tree. Check first; coordinate.
3. **Redeploy and VERIFY in the live player** after each build. A wired-but-broken rotation is worse than none.

## The durable pattern (build a selector, don't hardcode)

Do not paste case objects into each builder by hand. Write one selector and have every builder call it:

`scripts/_bank-cases-for.mjs` (tracked helper):
- Input: `(course, conceptTags[])`.
- Reads `generated/case-bank/cases/*.json`, filters to `status === "gated"` AND `courses.includes(course)` AND `conceptTags` overlaps the lesson's concepts.
- Returns the matching `.case` objects (the `CaseFileCase` payloads), optionally capped (e.g. top 3-4 by tag overlap) so a lesson does not carry 20 alternates.

Then in each builder:
```js
const { bankCasesFor } = require('./_bank-cases-for.js') // or inline the read
sCaseFile.sceneData.alternates = [
  ...sCaseFile.sceneData.alternates,            // keep the existing inline ones
  ...bankCasesFor('cams', ['correspondent_banking','wire_stripping']),
]
```
Cap total alternates sensibly (3-5). Dedup by `caseTitle` so an inline case and its bank twin do not both appear.

## Matching cases to lessons

Every gated bank entry carries `courses[]` and `conceptTags[]` for exactly this. Match a lesson by: (course the lesson belongs to) + (conceptTags that overlap the lesson's topic). Examples from the current 66:
- A correspondent-banking / sanctions-stripping CAMS lesson: `hsbc-mexico-2012`, `standard-chartered-2012-2019`, `wachovia-2010`, `bnp-paribas-2014`, `societe-generale-2018`, `credit-agricole-2015`, `deutsche-bank-2015`.
- A CCAS sanctions/VASP lesson: `tornado-cash-2022-2025`, `suex-2021`, `bitzlato-2023`, `kraken-2022`, `bittrex-2022`.
- A CFE fraud lesson: `madoff-2009`, `stanford-2012`, `theranos-holmes-2022`, `enron-skilling-2006`, `worldcom-ebbers-2005`, `nikola-milton-2022`.
- An AML-program lesson: `td-bank-2024`, `us-bancorp-2018`, `ing-2018`, `danske-estonia-2022`, `westpac-litepay-2020`.

## Procedure (first target: the 4 pilot lessons that already have case-file scenes)

1. Write `scripts/_bank-cases-for.mjs` and a `.cjs` runnable twin (scratchpad .mjs cannot resolve repo deps; a pure-fs module runs anywhere).
2. Pick ONE pilot builder (start with `_build-pilot-cbr.js`, correspondent-banking, which has obvious matches). Add the selector call to spread matching gated cases into `sCaseFile.sceneData.alternates`, capped and deduped.
3. Run that builder (it rebuilds + redeploys the lesson's scene_data to the DB).
4. Open the lesson in the live player. Revisit the case-file scene several times. Confirm: (a) different real matters appear across visits (rotation works), (b) each alternate renders fully (3 steps, 4 options, reveals, debrief), (c) no case shows a broken/empty field.
5. Repeat for `_build-pilot-lesson-v2.js`, `_build-pilot-wca.js`, `_build-pilot-wml.js`.
6. Once the pattern is proven on the pilots, apply it to the broader lesson set as those lessons get case-file scenes (coordinate with the lesson-format work).

## Unknowns to resolve on first contact (read only what you need)

- Confirm how the runtime SELECTS among `[primary, ...alternates]` (random per attempt? per user? seeded?). Read the case-file renderer in `components/lesson/scenes/`. If selection is per-attempt-random, more alternates directly improves replay value; if per-user-sticky, you may want to force variety.
- Confirm the builder's redeploy target (which course/lesson row it writes) so you wire cases into the RIGHT lesson.
- Confirm whether the live CAMS/CCAS courses use these pilot builders or a different generation path (`scripts/generate-course.ts write`). If the live courses are generated by `generate-course.ts`, the durable wiring belongs in THAT writer (have it pull gated bank cases into case-file scenes), and the pilot builders are the proving ground.

## Definition of done

A repeat visitor to a wired lesson's case-file scene sees a different real, source-verified matter on different visits, every alternate renders correctly, and the wiring lives in the builder/writer (not a DB patch) so it survives the next rebuild.
