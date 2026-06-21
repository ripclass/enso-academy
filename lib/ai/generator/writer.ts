// lib/ai/generator/writer.ts
// Writes validated generation artifacts to the database. The course is written
// as a DRAFT — unpublished, not enrollable. The methodology mandates SME review
// before publication; publishing is out of scope here. Idempotent per slug: a
// re-write clears an existing draft's content; it refuses to touch a non-draft.

/* eslint-disable @typescript-eslint/no-explicit-any -- jsonb columns are typed as Json; targeted casts keep the writer readable */

import { createAdminClient } from '@/lib/supabase/admin'
import { METHODOLOGY_VERSION } from './methodology'
import type { OutlineArtifact, LessonArtifact, AssessmentArtifact, GeneratedScene } from './types'

type Admin = ReturnType<typeof createAdminClient>

type ElementType = 'quiz_question' | 'definition' | 'explanation' | 'example'

/** scene_type → content_element_type (the pedagogical-category enum). */
function elementType(scene: GeneratedScene): ElementType {
  if (scene.sceneType === 'quiz') return 'quiz_question'
  if (scene.sceneType === 'slide' && (scene.sceneData as any)?.template === 'definition') return 'definition'
  // reading, slide, interactive, pbl → the generic content category.
  return 'explanation'
}

/** A non-empty plain-text body for the content row (NOT NULL; the reading fallback). */
function sceneBody(scene: GeneratedScene): string {
  const d = scene.sceneData as any
  let body = ''
  if (scene.sceneType === 'reading') body = d?.body ?? ''
  else if (scene.sceneType === 'slide') body = d?.narration ?? ''
  else if (scene.sceneType === 'quiz') body = d?.intro ?? ''
  else body = d?.summary ?? ''
  return body && String(body).trim() ? String(body) : scene.title || 'Untitled scene'
}

export type WriteResult = {
  courseId: string
  courseSlug: string
  modules: number
  lessons: number
  scenes: number
  questions: number
  glossary: number
}

export async function writeCourse(opts: {
  outline: OutlineArtifact
  lessons: LessonArtifact[]
  assessment?: AssessmentArtifact | null
  costSummary?: string
}): Promise<WriteResult> {
  const admin = createAdminClient()
  const { outline } = opts
  const slug = outline.course.slug

  // 1. Course — reuse an existing draft; refuse to overwrite anything published.
  const { data: existing } = await admin
    .from('courses')
    .select('id, status')
    .eq('slug', slug)
    .maybeSingle()
  if (existing && existing.status !== 'draft') {
    throw new Error(
      `Course "${slug}" exists with status "${existing.status}" — refusing to overwrite a non-draft course.`,
    )
  }

  let courseId: string
  if (existing) {
    courseId = existing.id
    await clearCourseChildren(admin, courseId)
    await admin
      .from('courses')
      .update({
        name: outline.course.name,
        short_name: outline.course.shortName,
        description: outline.course.description,
        certifying_body: outline.course.certifyingBody,
        estimated_study_hours: outline.course.estimatedStudyHours,
        primary_source_count: outline.sources.length,
        metadata: { learning_objectives: outline.course.learningObjectives, generated: true } as any,
      })
      .eq('id', courseId)
  } else {
    const { data: course, error } = await admin
      .from('courses')
      .insert({
        slug,
        name: outline.course.name,
        short_name: outline.course.shortName,
        description: outline.course.description,
        tier: 'global',
        status: 'draft',
        certifying_body: outline.course.certifyingBody,
        estimated_study_hours: outline.course.estimatedStudyHours,
        primary_source_count: outline.sources.length,
        metadata: { learning_objectives: outline.course.learningObjectives, generated: true } as any,
      })
      .select('id')
      .single()
    if (error || !course) throw new Error('Failed to insert course: ' + (error?.message ?? 'unknown'))
    courseId = course.id
  }

  // 2. Modules → lessons → scenes
  let moduleCount = 0
  let lessonCount = 0
  let sceneCount = 0
  for (let mi = 0; mi < outline.modules.length; mi++) {
    const m = outline.modules[mi]
    const { data: mod, error: me } = await admin
      .from('modules')
      .insert({
        course_id: courseId,
        slug: m.slug,
        name: m.name,
        description: m.description,
        sort_order: mi + 1,
        estimated_minutes: m.estimatedMinutes,
        learning_objectives: [m.objective] as any,
      })
      .select('id')
      .single()
    if (me || !mod) throw new Error('Failed to insert module: ' + (me?.message ?? 'unknown'))
    moduleCount++

    for (let li = 0; li < m.lessons.length; li++) {
      const l = m.lessons[li]
      const { data: les, error: le } = await admin
        .from('lessons')
        .insert({
          module_id: mod.id,
          slug: l.slug,
          name: l.name,
          description: l.description,
          sort_order: li + 1,
          learning_objectives: l.learningObjectives as any,
          concept_tags: l.conceptTags,
        })
        .select('id')
        .single()
      if (le || !les) throw new Error('Failed to insert lesson: ' + (le?.message ?? 'unknown'))
      lessonCount++

      const art = opts.lessons.find((la) => la.lessonSlug === l.slug)
      if (art && art.scenes.length > 0) {
        const rows = art.scenes.map((scene, si) => ({
          course_id: courseId,
          module_id: mod.id,
          lesson_id: les.id,
          element_type: elementType(scene),
          scene_type: scene.sceneType,
          scene_data: scene.sceneData as any,
          title: scene.title,
          body: sceneBody(scene),
          concept_tags: scene.conceptTags ?? [],
          teaches_concepts: scene.teachesConcepts ?? [],
          metadata: { order: si + 1 } as any,
        }))
        const { error: ce } = await admin.from('content_library_elements').insert(rows)
        if (ce) throw new Error('Failed to insert scenes: ' + ce.message)
        sceneCount += rows.length
      }
    }
  }

  // 3. Primary-source citations (course-level)
  if (outline.sources.length > 0) {
    await admin.from('primary_source_citations').insert(
      outline.sources.map((s) => ({
        course_id: courseId,
        source_name: s.sourceName,
        source_organization: s.sourceOrganization ?? null,
        source_url: s.sourceUrl ?? null,
        source_year: s.sourceYear ?? null,
        is_primary: true,
      })),
    )
  }

  // 4. Assessment + glossary (Stage 3 — present only if it was generated)
  let questionCount = 0
  let glossaryCount = 0
  if (opts.assessment) {
    const moduleIdBySlug = new Map<string, string>()
    const { data: mods } = await admin.from('modules').select('id, slug').eq('course_id', courseId)
    for (const mm of mods ?? []) moduleIdBySlug.set(mm.slug, mm.id)

    if (opts.assessment.questions.length > 0) {
      const { error: qe } = await admin.from('question_bank').insert(
        opts.assessment.questions.map((q) => ({
          course_id: courseId,
          module_id: q.moduleSlug ? moduleIdBySlug.get(q.moduleSlug) ?? null : null,
          question_type: q.questionType,
          question_text: q.questionText,
          options: q.options as any,
          // Multi-select stores an array of correct option ids; single-answer
          // types store the one correct option id string.
          correct_answer: (q.questionType === 'multiple_choice'
            ? (q.correctOptionIds ?? [])
            : q.correctOptionId) as any,
          explanation: q.explanation,
          wrong_answer_rationales: (q.wrongAnswerRationales ?? null) as any,
          concept_tags: q.conceptTags ?? [],
          difficulty: q.difficulty,
          domain: q.domain ?? null,
          metadata: (q.selectCount ? { select_count: q.selectCount } : {}) as any,
        })),
      )
      if (qe) throw new Error('Failed to insert questions: ' + qe.message)
      questionCount = opts.assessment.questions.length
    }
    if (opts.assessment.glossary.length > 0) {
      // De-dupe by term: the table has UNIQUE(course_id, term), and a term may
      // recur across module assessment files (e.g. a statute defined in two
      // modules). A single batch insert otherwise aborts on the first duplicate.
      const seenTerms = new Set<string>()
      const glossaryRows = opts.assessment.glossary
        .filter((g) => {
          const key = g.term.trim().toLowerCase()
          if (seenTerms.has(key)) return false
          seenTerms.add(key)
          return true
        })
        .map((g) => ({
          course_id: courseId,
          term: g.term,
          definition: g.definition,
          short_definition: g.shortDefinition ?? null,
          aliases: g.aliases ?? [],
        }))
      const { error: ge } = await admin.from('glossary').insert(glossaryRows)
      if (ge) throw new Error('Failed to insert glossary: ' + ge.message)
      glossaryCount = glossaryRows.length
    }
  }

  // 5. course_versions — provenance for this generation run
  await admin.from('course_versions').insert({
    course_id: courseId,
    version_number: 1,
    generation_prompt_version: METHODOLOGY_VERSION,
    generated_by: 'claude-opus-4.7',
    notes: opts.costSummary ?? 'Generated by the content pipeline (Prompt 13).',
  })

  return {
    courseId,
    courseSlug: slug,
    modules: moduleCount,
    lessons: lessonCount,
    scenes: sceneCount,
    questions: questionCount,
    glossary: glossaryCount,
  }
}

/** Clears a draft course's generated children, in FK-dependency order, before a re-write. */
async function clearCourseChildren(admin: Admin, courseId: string): Promise<void> {
  await admin.from('content_library_elements').delete().eq('course_id', courseId)
  await admin.from('question_bank').delete().eq('course_id', courseId)
  await admin.from('glossary').delete().eq('course_id', courseId)
  await admin.from('primary_source_citations').delete().eq('course_id', courseId)
  await admin.from('course_versions').delete().eq('course_id', courseId)
  const { data: mods } = await admin.from('modules').select('id').eq('course_id', courseId)
  const moduleIds = (mods ?? []).map((m) => m.id)
  if (moduleIds.length > 0) {
    await admin.from('lessons').delete().in('module_id', moduleIds)
  }
  await admin.from('modules').delete().eq('course_id', courseId)
}
