'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { callHaikuStreaming, callSonnet } from '@/lib/ai/routing'
import { embed } from '@/lib/ai/embeddings'
import { logAiCall } from '@/lib/ai/cost-tracking'
import { getMasterySummary, recordEvidence } from '@/lib/student-model/knowledge'
import { getMemoryPreamble, summarizeSessionToMemory, getLecturerOpening } from '@/lib/student-model/memory'
import { lecturerVariantFor } from '@/lib/lesson/scenes'
import { after } from 'next/server'

type AskQuestionResult = {
  answer: string
  fromCache: boolean
  cachedQaId?: string
  sessionEventId?: string
  audioUrl?: string // present if listen mode requested and TTS succeeded
}

/**
 * The lecturer's continuity greeting for a returning student. Fetched from the
 * client after the lesson renders, so this LLM call never blocks first paint.
 * Returns null if the student has no memory yet.
 */
export async function fetchLecturerOpening(
  courseId: string,
  lessonName: string,
): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return getLecturerOpening(user.id, courseId, lessonName)
}

/**
 * Record the scene the student is currently on, so they resume there next time
 * (cross-device). Fire-and-forget from the player on scene change. Stored on the
 * current session's metadata, so no schema change and no row growth.
 */
export async function recordSceneProgress(sessionId: string, sceneIndex: number): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const admin = createAdminClient()
  await admin
    .from('sessions')
    .update({ metadata: { last_scene_index: sceneIndex } })
    .eq('id', sessionId)
    .eq('student_id', user.id)
}

/**
 * The scene index to resume a lesson at: the furthest-recorded scene from the
 * student's most recent prior session on this lesson, or 0 if none. The session
 * just created for this visit has no recorded index yet, so it is skipped.
 */
export async function getResumeSceneIndex(lessonId: string): Promise<number> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0
  const admin = createAdminClient()
  const { data } = await admin
    .from('sessions')
    .select('id, metadata, started_at')
    .eq('student_id', user.id)
    .eq('lesson_id', lessonId)
    .order('started_at', { ascending: false })
    .limit(20)
  for (const s of data ?? []) {
    const idx = (s.metadata as { last_scene_index?: number } | null)?.last_scene_index
    if (typeof idx === 'number' && idx > 0) return idx
  }
  return 0
}

/**
 * Start a lesson session. Creates a sessions row and returns the session ID.
 */
export async function startLessonSession(lessonId: string): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const admin = createAdminClient()

  // Find the lesson and its course
  const { data: lesson } = await admin
    .from('lessons')
    .select('id, module:modules!inner (course_id)')
    .eq('id', lessonId)
    .single()

  if (!lesson) throw new Error('Lesson not found')

  const courseId = (lesson.module as any).course_id

  // Find the enrollment
  const { data: enrollment } = await admin
    .from('enrollments')
    .select('id')
    .eq('student_id', user.id)
    .eq('course_id', courseId)
    .eq('status', 'active')
    .single()

  if (!enrollment) throw new Error('Not enrolled in this course')

  const { data: session, error } = await admin
    .from('sessions')
    .insert({
      student_id: user.id,
      course_id: courseId,
      enrollment_id: enrollment.id,
      session_type: 'lesson',
      modality: 'standard',
      lesson_id: lessonId,
    })
    .select('id')
    .single()

  if (error || !session) throw new Error('Failed to create session: ' + (error?.message ?? 'unknown'))

  // Log a session_started event
  await admin.from('session_events').insert({
    session_id: session.id,
    student_id: user.id,
    event_type: 'lesson_started',
    payload: { lesson_id: lessonId },
  })

  return session.id
}

/**
 * Fetch the lesson content elements in order for a given lesson.
 */
export async function getLessonContent(lessonId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const admin = createAdminClient()

  const { data: elements, error } = await admin
    .from('content_library_elements')
    .select('id, element_type, scene_type, scene_data, title, body, body_format, estimated_seconds, concept_tags, teaches_concepts, difficulty, audio_url, audio_duration_seconds, metadata')
    .eq('lesson_id', lessonId)
    .order('created_at', { ascending: true })

  if (error) throw new Error('Failed to fetch lesson content: ' + error.message)

  // Sort by metadata.order if present
  const sorted = (elements ?? []).sort((a, b) => {
    const ao = (a.metadata as any)?.order ?? 999
    const bo = (b.metadata as any)?.order ?? 999
    return ao - bo
  })

  return sorted
}

/**
 * Resolve narration audio for a single scene (content element), synthesizing it
 * on first request and caching it to Storage + the row. Returns the public URL,
 * or null when there is nothing to narrate / synthesis fails. The narration text
 * is computed server-side from the scene payload (never trusted from the client).
 *
 * This lets the whole course speak without a giant pre-generation batch — the
 * cache fills as students play, and a later batch pass can warm it.
 */
export async function getSceneAudio(elementId: string): Promise<{ url: string | null }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { url: null }

    const admin = createAdminClient()
    const { data: row } = await admin
      .from('content_library_elements')
      .select('id, course_id, lesson_id, scene_type, scene_data, body, audio_url')
      .eq('id', elementId)
      .single()
    if (!row) return { url: null }
    if (row.audio_url) return { url: row.audio_url }

    // The spoken script for this scene, by type (mirrors sceneNarration()).
    const type = row.scene_type ?? 'reading'
    const data = (row.scene_data && typeof row.scene_data === 'object'
      ? (row.scene_data as Record<string, unknown>)
      : {})
    let raw = ''
    if (type === 'slide' && typeof data.narration === 'string') raw = data.narration
    else if (type === 'quiz' && typeof data.intro === 'string') raw = data.intro
    else if ((type === 'interactive' || type === 'pbl') && typeof data.summary === 'string') raw = data.summary
    else raw = row.body ?? ''

    const { synthesizeSpeech, textToSpeechReady, LECTURER_VOICES } = await import('@/lib/audio/tts')
    const cleanText = textToSpeechReady(raw)
    if (!cleanText) return { url: null }

    // Match the voice to the lesson's lecturer (avatar alternates per chapter).
    const variant = lecturerVariantFor((row.lesson_id as string | null) ?? '')
    const { audioBuffer } = await synthesizeSpeech({ text: cleanText, voiceName: LECTURER_VOICES[variant] })

    // Voice in the path → a voice change yields a NEW url, so the browser/CDN
    // never serves a stale recording from the old (same-path) cache.
    const fileName = `${row.course_id}/${row.id}-${variant}.mp3`
    const { error: uploadError } = await admin.storage
      .from('lesson-audio')
      .upload(fileName, audioBuffer, { contentType: 'audio/mpeg', upsert: true })
    if (uploadError) return { url: null }

    const { data: pub } = admin.storage.from('lesson-audio').getPublicUrl(fileName)
    const url = pub.publicUrl
    const wordCount = cleanText.split(/\s+/).length
    await admin
      .from('content_library_elements')
      .update({
        audio_url: url,
        audio_generated_at: new Date().toISOString(),
        audio_duration_seconds: Math.round((wordCount / 150) * 60),
      })
      .eq('id', row.id)

    return { url }
  } catch (err) {
    console.error('getSceneAudio failed:', err)
    return { url: null }
  }
}

/**
 * Synthesize arbitrary lecturer text to speech (used for the on-stage classmate
 * moment, where the lecturer answers aloud). Caches by content hash so the same
 * line is only synthesized once. Returns null on failure (audio is optional).
 */
export async function synthesizeText(
  text: string,
  variant: 'male' | 'female' = 'male',
): Promise<{ url: string | null }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { url: null }

    const { synthesizeSpeech, textToSpeechReady, LECTURER_VOICES, textClipFileName } = await import('@/lib/audio/tts')
    const clean = textToSpeechReady(text)
    if (!clean) return { url: null }

    const fileName = textClipFileName(clean, variant)

    const admin = createAdminClient()
    // Cache hit: same text+voice already synthesized — return its URL, no re-synth.
    // Keeps replayed beats instant and avoids paying TTS for repeated lines.
    const { data: existing } = await admin.storage
      .from('lesson-audio')
      .list('qa-audio/text', { search: fileName.split('/').pop(), limit: 1 })
    if (existing && existing.length > 0) {
      const { data: hit } = admin.storage.from('lesson-audio').getPublicUrl(fileName)
      return { url: hit.publicUrl }
    }

    const { audioBuffer } = await synthesizeSpeech({ text: clean, voiceName: LECTURER_VOICES[variant] })
    const { error } = await admin.storage
      .from('lesson-audio')
      .upload(fileName, audioBuffer, { contentType: 'audio/mpeg', upsert: true })
    if (error) return { url: null }

    const { data: pub } = admin.storage.from('lesson-audio').getPublicUrl(fileName)
    return { url: pub.publicUrl }
  } catch (err) {
    console.error('synthesizeText failed:', err)
    return { url: null }
  }
}

/**
 * Grade a PBL project submission as an AML/CFT examiner would — against the
 * brief + rubric, with constructive feedback. Uses Sonnet (the written-answer
 * tier). Returns a band + feedback, and feeds the student knowledge model.
 */
export async function gradeProjectSubmission(opts: {
  courseId: string
  lessonId: string
  sessionId: string
  brief: string
  task: string
  deliverable?: string
  rubric: string[]
  submission: string
  conceptTags?: string[]
}): Promise<{ band: string; feedback: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const system = `You are an experienced AML/CFT examiner grading a trainee's submission against a project brief and rubric. Be rigorous but constructive and concise.

Reply in exactly this shape:
BAND: <Strong | Developing | Needs work>
then 2-4 short paragraphs of feedback — what they did well, what is missing or wrong, and the one or two things a strong answer must include. Grade only against the rubric and the brief. Do NOT rewrite their submission for them, and never invent facts that were not in the brief.`

  const rubricBlock = opts.rubric.map((r) => `- ${r}`).join('\n')
  const userMsg = `PROJECT BRIEF:\n${opts.brief}\n\nTASK:\n${opts.task}\n${
    opts.deliverable ? `\nDELIVERABLE:\n${opts.deliverable}\n` : ''
  }\nRUBRIC (what a strong answer meets):\n${rubricBlock}\n\nTRAINEE SUBMISSION:\n${opts.submission}`

  const start = Date.now()
  const result = await callSonnet({
    system,
    messages: [{ role: 'user', content: userMsg }],
    maxTokens: 700,
    temperature: 0.3,
  })
  await logAiCall({
    context: {
      studentId: user.id,
      courseId: opts.courseId,
      sessionId: opts.sessionId,
      lessonId: opts.lessonId,
      purpose: 'grading',
    },
    model: 'sonnet',
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    costCents: result.costCents,
    latencyMs: Date.now() - start,
  })

  const text = result.text.trim()
  const m = text.match(/^BAND:\s*(Strong|Developing|Needs work)/i)
  const band = m ? m[1] : 'Reviewed'
  const feedback = m ? text.replace(/^BAND:.*(\r?\n)?/i, '').trim() : text

  if (opts.conceptTags && opts.conceptTags.length > 0) {
    await recordEvidence({
      studentId: user.id,
      courseId: opts.courseId,
      conceptTags: opts.conceptTags,
      evidence: /strong|developing/i.test(band) ? 'correct' : 'incorrect',
    }).catch(() => {})
  }

  return { band, feedback }
}

/**
 * Ask a question of the AI lecturer. Cache-first; falls back to Haiku.
 */
export async function askLecturer(opts: {
  sessionId: string
  lessonId: string
  courseId: string
  question: string
  lessonContext: string  // condensed lesson content for grounding
  listenMode?: boolean   // when true, synthesize TTS audio for the answer
  conceptTags?: string[] // concepts in the current lesson context, for the student model
}): Promise<AskQuestionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const admin = createAdminClient()

  // Step 1: Embed the question
  const embedding = await embed(opts.question)

  // Step 2: Try cache hit via the match_cached_qa RPC
  const { data: matches } = await admin.rpc('match_cached_qa', {
    p_course_id: opts.courseId,
    p_query_embedding: embedding.vector as any,
    p_match_threshold: 0.85,
    p_match_count: 1,
  })

  if (matches && matches.length > 0) {
    const hit = matches[0]
    // Increment hit count
    await admin
      .from('cached_qa')
      .update({
        hit_count: (hit.hit_count ?? 0) + 1,
        last_hit_at: new Date().toISOString(),
      })
      .eq('id', hit.id)

    // Log the cache-hit event
    await admin.from('session_events').insert({
      session_id: opts.sessionId,
      student_id: user.id,
      event_type: 'question_asked',
      payload: {
        question: opts.question,
        from_cache: true,
        cached_qa_id: hit.id,
        similarity: hit.similarity,
      },
    })

    return {
      answer: hit.answer_text,
      fromCache: true,
      cachedQaId: hit.id,
      audioUrl: await synthesizeQaAudio(hit.answer_text, opts.sessionId, opts.listenMode, admin),
    }
  }

  // Step 3: Cache miss — call Haiku with grounding + the student knowledge model.
  // The mastery preamble lightly shapes the answer; the cache lookup above is
  // course-level (shared across students), so cached answers stay generic —
  // an accepted v1 tradeoff (see docs/decisions/0012-student-knowledge-model-v1.md).
  const mastery = await getMasterySummary(user.id, opts.courseId, opts.conceptTags ?? [])
  const memoryPreamble = await getMemoryPreamble(user.id, opts.courseId)
  const masteryBlock = mastery.preamble
    ? `\n${mastery.preamble}\nUse this to shape your answer — explain weak concepts more thoroughly and don't over-explain strong ones. Never mention or recite the knowledge model to the student; it shapes the answer, it is not part of it.\n`
    : ''
  const memoryBlock = memoryPreamble ? `\n${memoryPreamble}\n` : ''
  const system = `You are the AI lecturer for Enso Academy. The student is studying the following lesson content. Answer their question grounded in this content. If the question is outside the lesson's scope, say so clearly and briefly. Be concise — 2-4 paragraphs at most.
${memoryBlock}${masteryBlock}
LESSON CONTENT:
${opts.lessonContext}`

  const startMs = Date.now()
  const result = await callHaikuStreaming({
    system,
    messages: [{ role: 'user', content: opts.question }],
    maxTokens: 600,
    temperature: 0.7,
  })
  const latencyMs = Date.now() - startMs

  // Cache the answer
  const { data: cached } = await admin
    .from('cached_qa')
    .insert({
      course_id: opts.courseId,
      lesson_id: opts.lessonId,
      question_text: opts.question,
      answer_text: result.text,
      origin: 'student_asked',
      answered_by_model: 'haiku',
      embedding: embedding.vector as any,
      hit_count: 1,
      last_hit_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  // Log the cache-miss event
  await admin.from('session_events').insert({
    session_id: opts.sessionId,
    student_id: user.id,
    event_type: 'question_asked',
    payload: {
      question: opts.question,
      from_cache: false,
      cached_qa_id: cached?.id,
      cost_cents: result.costCents,
      latency_ms: latencyMs,
    },
  })

  // Log the cost
  await logAiCall({
    context: {
      studentId: user.id,
      courseId: opts.courseId,
      sessionId: opts.sessionId,
      lessonId: opts.lessonId,
      purpose: 'lecturer',
    },
    model: 'haiku',
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    costCents: result.costCents,
    latencyMs,
  })

  return {
    answer: result.text,
    fromCache: false,
    cachedQaId: cached?.id,
    audioUrl: await synthesizeQaAudio(result.text, opts.sessionId, opts.listenMode, admin),
  }
}

/**
 * Record a formative quiz-scene answer as evidence for the student knowledge
 * model. Inline lesson quizzes feed the same model as the mock engine.
 * Resilient — a failed write never blocks the lesson UI.
 */
export async function recordQuizEvidence(opts: {
  courseId: string
  conceptTags: string[]
  correct: boolean
}): Promise<void> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    if (opts.conceptTags.length === 0) return
    await recordEvidence({
      studentId: user.id,
      courseId: opts.courseId,
      conceptTags: opts.conceptTags,
      evidence: opts.correct ? 'correct' : 'incorrect',
    })
  } catch (err) {
    console.error('recordQuizEvidence failed:', err)
  }
}

/**
 * Mark a lesson as complete for the student. Updates session and logs event.
 */
export async function completeLesson(sessionId: string, lessonId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const admin = createAdminClient()

  await admin
    .from('sessions')
    .update({
      ended_at: new Date().toISOString(),
      summary: 'Lesson completed',
    })
    .eq('id', sessionId)

  await admin.from('session_events').insert({
    session_id: sessionId,
    student_id: user.id,
    event_type: 'lesson_completed',
    payload: { lesson_id: lessonId },
  })

  // Feed the student knowledge model: completing a lesson is mild positive
  // evidence for the concepts its content elements teach.
  const { data: elements } = await admin
    .from('content_library_elements')
    .select('course_id, teaches_concepts')
    .eq('lesson_id', lessonId)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const elementRows = (elements ?? []) as any[]
  if (elementRows.length > 0) {
    const courseId = elementRows[0].course_id
    const conceptTags = [
      ...new Set(elementRows.flatMap((r) => (r.teaches_concepts as string[]) ?? [])),
    ]
    await recordEvidence({
      studentId: user.id,
      courseId,
      conceptTags,
      evidence: 'lesson_completed',
    })

    // Lecturer memory: distil this session into durable facts. Scheduled via
    // after() so it runs post-response and "Complete lesson" stays fast.
    const { data: lessonRow } = await admin
      .from('lessons')
      .select('name')
      .eq('id', lessonId)
      .single()
    const lessonName = lessonRow?.name ?? 'this lesson'
    after(async () => {
      await summarizeSessionToMemory({ studentId: user.id, courseId, sessionId, lessonName })
    })
  }
}

/**
 * Persist the student's Listen-mode preference to student_preferences.
 * Non-critical — callers swallow failures.
 */
export async function updateListenModePreference(enabled: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const admin = createAdminClient()

  await admin
    .from('student_preferences')
    .upsert(
      { student_id: user.id, preferred_modality: enabled ? 'audio' : 'standard' },
      { onConflict: 'student_id' },
    )
}

/**
 * Synthesize TTS audio for a Q&A answer and upload it to Supabase Storage.
 * Returns the public URL, or undefined if listen mode is off or TTS fails.
 * Audio is an enhancement — this never throws.
 */
async function synthesizeQaAudio(
  text: string,
  sessionId: string,
  listenMode: boolean | undefined,
  admin: ReturnType<typeof createAdminClient>,
): Promise<string | undefined> {
  if (!listenMode) return undefined
  try {
    const { synthesizeSpeech } = await import('@/lib/audio/tts')
    const { audioBuffer } = await synthesizeSpeech({ text })
    const fileName = `qa-audio/${sessionId}-${Date.now()}.mp3`
    const { error: uploadError } = await admin.storage
      .from('lesson-audio')
      .upload(fileName, audioBuffer, { contentType: 'audio/mpeg', upsert: true })
    if (uploadError) return undefined
    const { data: pub } = admin.storage.from('lesson-audio').getPublicUrl(fileName)
    return pub.publicUrl
  } catch (err) {
    console.error('Q&A TTS failed:', err)
    return undefined
  }
}
