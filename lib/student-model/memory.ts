// lib/student-model/memory.ts
// Server-only. The lecturer's long-term memory of a student — an editorial
// layer of durable, relationship-meaningful facts (goals, context, narrative
// struggles, tone). It is NOT a transcript, and NOT concept mastery — that is
// the student knowledge model (knowledge.ts). See ADR 0013.

import { createAdminClient } from '@/lib/supabase/admin'
import { callSonnet, callHaiku } from '@/lib/ai/routing'
import { logAiCall } from '@/lib/ai/cost-tracking'
import { stripEmDashes } from '@/lib/ai/prose'

const MEMORY_TYPES = ['goal', 'context', 'struggle', 'preference'] as const
const RECENT_MEMORY_LIMIT = 10

const SUMMARIZE_SYSTEM = `You maintain the long-term memory of an AI lecturer about one student preparing for a professional certification.

Given the questions a student asked during a single study session, extract 0-3 DURABLE, relationship-meaningful facts worth remembering for future sessions:
- their stated goals or motivation (why they are studying, career context)
- what they found genuinely difficult, as a narrative observation
- their preferred tone or pace
- anything personal they volunteered

Do NOT record:
- specific concept mastery or scores (that is tracked separately)
- trivial or one-off question topics
- anything not durable across sessions

If nothing relationship-meaningful was revealed, return an empty list. Most sessions yield 0-1 facts. Quality over volume.

Respond with STRICT JSON only, no prose:
{"facts": [{"type": "goal|context|struggle|preference", "content": "<one concise sentence>"}]}`

const GREETING_SYSTEM = `You are the AI lecturer for Enso Academy, greeting a returning student at the start of a lesson.

Given what you remember about this student and the lesson they are about to begin, write a warm, brief (1-2 sentence) greeting that references something specific you remember and invites them in. Sound like a tutor who genuinely remembers them, not saccharine and not a mechanical list of facts. Write in plain prose and do not use em-dashes. Output only the greeting, nothing else.`

type DistilledFact = { type: string; content: string }

function parseFacts(text: string): DistilledFact[] {
  try {
    const match = text.match(/\{[\s\S]*\}/) // tolerate code fences / surrounding prose
    if (!match) return []
    const parsed = JSON.parse(match[0])
    const facts = Array.isArray(parsed?.facts) ? parsed.facts : []
    return facts
      .filter(
        (f: unknown): f is DistilledFact =>
          !!f &&
          typeof (f as DistilledFact).content === 'string' &&
          (f as DistilledFact).content.trim().length > 0,
      )
      .map((f: DistilledFact) => ({ type: String(f.type ?? 'context'), content: f.content.trim() }))
  } catch {
    return []
  }
}

async function fetchRecentMemory(studentId: string, courseId: string): Promise<string[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('student_memory')
    .select('content')
    .eq('student_id', studentId)
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })
    .limit(RECENT_MEMORY_LIMIT)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []) as any[]).map((r) => r.content).filter((c): c is string => typeof c === 'string' && !!c)
}

/**
 * Summarize a finished study session into 0-3 durable memory facts.
 * Scheduled via after() in completeLesson — runs after the response. Never throws.
 */
export async function summarizeSessionToMemory(opts: {
  studentId: string
  courseId: string
  sessionId: string
  lessonName: string
}): Promise<void> {
  try {
    const admin = createAdminClient()

    const { data: events } = await admin
      .from('session_events')
      .select('payload')
      .eq('session_id', opts.sessionId)
      .eq('event_type', 'question_asked')

    const questions = ((events ?? []) as { payload: { question?: string } }[])
      .map((e) => e.payload?.question)
      .filter((q): q is string => typeof q === 'string' && q.trim().length > 0)

    if (questions.length === 0) return // nothing relational to summarize

    const userContent = `Lesson: ${opts.lessonName}\n\nQuestions the student asked this session:\n${questions
      .map((q, i) => `${i + 1}. ${q}`)
      .join('\n')}`

    const startMs = Date.now()
    const result = await callSonnet({
      system: SUMMARIZE_SYSTEM,
      messages: [{ role: 'user', content: userContent }],
      maxTokens: 400,
      temperature: 0.3,
    })
    const latencyMs = Date.now() - startMs

    await logAiCall({
      context: {
        studentId: opts.studentId,
        courseId: opts.courseId,
        sessionId: opts.sessionId,
        purpose: 'memory_summary',
      },
      model: 'sonnet',
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      costCents: result.costCents,
      latencyMs,
    })

    const facts = parseFacts(result.text).slice(0, 3)
    if (facts.length === 0) return

    const rows = facts.map((f) => ({
      student_id: opts.studentId,
      course_id: opts.courseId,
      memory_type: (MEMORY_TYPES as readonly string[]).includes(f.type) ? f.type : 'context',
      content: f.content,
      importance: 0.5,
      metadata: { source_session_id: opts.sessionId, lesson: opts.lessonName },
    }))

    await admin.from('student_memory').insert(rows)
  } catch (err) {
    console.error('summarizeSessionToMemory failed:', err)
  }
}

/**
 * Recent memory facts formatted as a preamble for the AI lecturer.
 * Returns '' if the student has no memory. Never throws.
 */
export async function getMemoryPreamble(studentId: string, courseId: string): Promise<string> {
  try {
    const facts = await fetchRecentMemory(studentId, courseId)
    if (facts.length === 0) return ''
    return `LECTURER MEMORY, what you remember about this student from past sessions:\n${facts
      .map((f) => `- ${f}`)
      .join('\n')}\nReference this naturally when relevant; never recite it as a list.`
  } catch (err) {
    console.error('getMemoryPreamble failed:', err)
    return ''
  }
}

/**
 * A short continuity greeting for a returning student, generated from memory.
 * Returns null if the student has no memory yet. Never throws.
 */
export async function getLecturerOpening(
  studentId: string,
  courseId: string,
  lessonName: string,
): Promise<string | null> {
  try {
    const facts = await fetchRecentMemory(studentId, courseId)
    if (facts.length === 0) return null

    const userContent = `What you remember about this student:\n${facts
      .map((f) => `- ${f}`)
      .join('\n')}\n\nThe lesson they are about to start: ${lessonName}`

    const startMs = Date.now()
    const result = await callHaiku({
      system: GREETING_SYSTEM,
      messages: [{ role: 'user', content: userContent }],
      maxTokens: 150,
      temperature: 0.7,
    })
    const latencyMs = Date.now() - startMs

    await logAiCall({
      context: { studentId, courseId, purpose: 'lecturer_greeting' },
      model: 'haiku',
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      costCents: result.costCents,
      latencyMs,
    })

    const greeting = stripEmDashes(result.text.trim())
    return greeting.length > 0 ? greeting : null
  } catch (err) {
    console.error('getLecturerOpening failed:', err)
    return null
  }
}
