'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { callHaikuStreaming } from '@/lib/ai/routing'
import { embed } from '@/lib/ai/embeddings'
import { logAiCall } from '@/lib/ai/cost-tracking'
import { getMasterySummary, recordEvidence } from '@/lib/student-model/knowledge'

type AskQuestionResult = {
  answer: string
  fromCache: boolean
  cachedQaId?: string
  sessionEventId?: string
  audioUrl?: string // present if listen mode requested and TTS succeeded
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
    .select('id, element_type, title, body, body_format, estimated_seconds, concept_tags, teaches_concepts, difficulty, audio_url, audio_duration_seconds, metadata')
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
  const masteryBlock = mastery.preamble
    ? `\n${mastery.preamble}\nUse this to shape your answer — explain weak concepts more thoroughly and don't over-explain strong ones. Never mention or recite the knowledge model to the student; it shapes the answer, it is not part of it.\n`
    : ''
  const system = `You are the AI lecturer for Enso Academy. The student is studying the following lesson content. Answer their question grounded in this content. If the question is outside the lesson's scope, say so clearly and briefly. Be concise — 2-4 paragraphs at most.
${masteryBlock}
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
    const conceptTags = [
      ...new Set(elementRows.flatMap((r) => (r.teaches_concepts as string[]) ?? [])),
    ]
    await recordEvidence({
      studentId: user.id,
      courseId: elementRows[0].course_id,
      conceptTags,
      evidence: 'lesson_completed',
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
