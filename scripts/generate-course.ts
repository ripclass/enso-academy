// scripts/generate-course.ts
// Operator CLI for the course-generation pipeline (Prompt 13 / ADR 0017).
// Run with: pnpm tsx scripts/generate-course.ts <mode>
//
//   outline                — Stage 1: generate the course outline (review it before continuing)
//   lesson <mIdx> <lIdx>   — Stage 2: generate one lesson's scenes
//   assessment <mIdx>      — Stage 3: generate one module's questions + glossary
//   full                   — generate every lesson + every module's assessment (resumable; needs an outline)
//   write                  — write the persisted artifacts to the database as a DRAFT course
//
// Each stage persists JSON artifacts under generated/<slug>/ (gitignored) so a
// run is resumable and reviewable. `write` never runs automatically. See
// docs/RUNBOOK-course-generation.md. Generation costs real money — Claude Opus.

import { config } from 'dotenv'
config({ path: '.env.local' })

import type { OutlineArtifact, AssessmentArtifact } from '../lib/ai/generator/index'

// The first course — CAMS (AML/CFT). IP-clean: abundant free primary sources.
const COURSE = {
  slug: 'cams',
  certification: 'CAMS',
  subject: 'Anti-money-laundering and counter-financing-of-terrorism (AML/CFT) compliance',
  learnerProfile:
    'A working compliance professional or aspiring practitioner, fluent in professional English, with some banking exposure, preparing for an internationally recognised AML certification.',
}

const usd = (cents: number) => `$${(cents / 100).toFixed(4)}`

async function main() {
  const [mode, ...rest] = process.argv.slice(2)
  // Dynamic import AFTER dotenv.config() — lib/ai/client.ts reads OPENROUTER_API_KEY at load.
  const g = await import('../lib/ai/generator/index')

  if (mode === 'outline') {
    console.log(`Stage 1 — generating the course outline for ${COURSE.certification}…`)
    const { outline, costCents } = await g.generateOutline({
      certification: COURSE.certification,
      subject: COURSE.subject,
      learnerProfile: COURSE.learnerProfile,
    })
    g.saveArtifact(COURSE.slug, 'outline.json', outline)
    const lessons = outline.modules.reduce((n, m) => n + m.lessons.length, 0)
    console.log(`  ${outline.modules.length} modules, ${lessons} lessons — cost ${usd(costCents)}`)
    console.log(`  saved generated/${COURSE.slug}/outline.json — review it before generating lessons`)
    return
  }

  if (mode === 'lesson') {
    const mIdx = Number(rest[0])
    const lIdx = Number(rest[1])
    const outline = g.loadArtifact<OutlineArtifact>(COURSE.slug, 'outline.json')
    if (!outline) throw new Error('No outline.json — run `outline` first.')
    const module = outline.modules[mIdx]
    const lesson = module?.lessons[lIdx]
    if (!lesson) throw new Error(`No lesson at module ${mIdx}, lesson ${lIdx}.`)
    console.log(`Stage 2 — generating scenes for "${lesson.name}"…`)
    const { artifact, costCents } = await g.generateLessonScenes({ outline, module, lesson })
    g.saveArtifact(COURSE.slug, `lessons/${lesson.slug}.json`, artifact)
    console.log(`  ${artifact.scenes.length} scenes — cost ${usd(costCents)}`)
    console.log(`  saved generated/${COURSE.slug}/lessons/${lesson.slug}.json`)
    return
  }

  if (mode === 'assessment') {
    const mIdx = Number(rest[0])
    const outline = g.loadArtifact<OutlineArtifact>(COURSE.slug, 'outline.json')
    if (!outline) throw new Error('No outline.json — run `outline` first.')
    const module = outline.modules[mIdx]
    if (!module) throw new Error(`No module at index ${mIdx}.`)
    console.log(`Stage 3 — generating assessment for module "${module.name}"…`)
    const { artifact, costCents } = await g.generateAssessment({ outline, module })
    g.saveArtifact(COURSE.slug, `assessment/${module.slug}.json`, artifact)
    console.log(`  ${artifact.questions.length} questions, ${artifact.glossary.length} glossary terms — cost ${usd(costCents)}`)
    return
  }

  if (mode === 'full') {
    const outline = g.loadArtifact<OutlineArtifact>(COURSE.slug, 'outline.json')
    if (!outline) throw new Error('No outline.json — run `outline` first, and review it.')
    console.log('Full generation — this costs real money and takes a while. Resumable: existing artifacts are skipped.')
    let total = 0
    for (let mi = 0; mi < outline.modules.length; mi++) {
      const module = outline.modules[mi]
      for (let li = 0; li < module.lessons.length; li++) {
        const lesson = module.lessons[li]
        if (g.artifactExists(COURSE.slug, `lessons/${lesson.slug}.json`)) {
          console.log(`  [skip] ${lesson.name}`)
          continue
        }
        try {
          const { artifact, costCents } = await g.generateLessonScenes({ outline, module, lesson })
          g.saveArtifact(COURSE.slug, `lessons/${lesson.slug}.json`, artifact)
          total += costCents
          console.log(`  [ok]   ${lesson.name} — ${artifact.scenes.length} scenes — ${usd(costCents)}`)
        } catch (err) {
          console.error(`  [FAIL] ${lesson.name}:`, err instanceof Error ? err.message : err)
        }
      }
      if (!g.artifactExists(COURSE.slug, `assessment/${module.slug}.json`)) {
        try {
          const { artifact, costCents } = await g.generateAssessment({ outline, module })
          g.saveArtifact(COURSE.slug, `assessment/${module.slug}.json`, artifact)
          total += costCents
          console.log(`  [ok]   assessment: ${module.name} — ${artifact.questions.length} questions — ${usd(costCents)}`)
        } catch (err) {
          console.error(`  [FAIL] assessment ${module.name}:`, err instanceof Error ? err.message : err)
        }
      }
    }
    console.log(`Total generation cost this run: ${usd(total)}. Now review the artifacts, then run \`write\`.`)
    return
  }

  if (mode === 'write') {
    const outline = g.loadArtifact<OutlineArtifact>(COURSE.slug, 'outline.json')
    if (!outline) throw new Error('No outline.json — run `outline` first.')
    // Use the operator's clean slug for the course URL, not the model's verbose one.
    outline.course.slug = COURSE.slug
    const lessons = g
      .listArtifacts(COURSE.slug, 'lessons')
      .map((f) => g.loadArtifact<import('../lib/ai/generator/index').LessonArtifact>(COURSE.slug, f))
      .filter((x): x is NonNullable<typeof x> => x != null)
    const assessmentFiles = g.listArtifacts(COURSE.slug, 'assessment')
    let assessment: AssessmentArtifact | null = null
    if (assessmentFiles.length > 0) {
      assessment = { questions: [], glossary: [] }
      for (const f of assessmentFiles) {
        const a = g.loadArtifact<AssessmentArtifact>(COURSE.slug, f)
        if (a) {
          assessment.questions.push(...a.questions)
          assessment.glossary.push(...a.glossary)
        }
      }
    }
    console.log(`Writing "${outline.course.slug}" — ${outline.modules.length} modules, ${lessons.length} generated lesson(s)…`)
    const result = await g.writeCourse({
      outline,
      lessons,
      assessment,
      costSummary: 'Generated via the Prompt 13 content pipeline (methodology v1.0).',
    })
    console.log(`  course ${result.courseId}`)
    console.log(`  ${result.modules} modules, ${result.lessons} lessons, ${result.scenes} scenes, ${result.questions} questions`)
    console.log('  written as DRAFT — unpublished, not enrollable. SME review required before publishing.')
    return
  }

  console.error('Usage: pnpm tsx scripts/generate-course.ts <outline | lesson M L | assessment M | full | write>')
  process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
