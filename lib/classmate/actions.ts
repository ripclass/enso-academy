'use server'

// lib/classmate/actions.ts
// The classmate — a consistent character in every lesson who raises a hand and
// asks the question the student should be asking but isn't. Gap detection is
// grounded in the student knowledge model (knowledge.ts / ADR 0012): the
// classmate fires ONLY on an evidenced gap. See ADR 0014.

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { callSonnet, callHaiku } from '@/lib/ai/routing'
import { embed } from '@/lib/ai/embeddings'
import { logAiCall } from '@/lib/ai/cost-tracking'
import { stripEmDashes } from '@/lib/ai/prose'

// Hard cap per session (server-authoritative). The player paces fires with a
// cooldown + an ambient-question chance; this is the ceiling so a long lesson
// never turns into a chorus. Tune as classmate calibration settles.
const MAX_INTERVENTIONS_PER_SESSION = 4
// A concept counts as an evidenced gap below this mastery, given observations.
const WEAK_THRESHOLD = 0.45

const CLASSMATE_NAMES = ['Priya', 'Marcus', 'Aisha', 'Daniel', 'Lena', 'Omar', 'Sofia', 'Rahul']
const CLASSMATE_PERSONA =
  'a diligent fellow student in the same certification cohort who asks honest, clarifying questions when something is glossed over, occasionally unsure of themselves, and never showing off'

const titleize = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

type CheckResult = {
  fired: boolean
  classmateName?: string
  question?: string
  answer?: string
}

type Gap = { conceptTag: string; mastery: number; observations: number }

/**
 * The classmate is a per-course character. Returns the course's classmate,
 * creating it on first need.
 */
async function getOrCreateClassmate(
  courseId: string,
  admin: ReturnType<typeof createAdminClient>,
): Promise<{ id: string; name: string } | null> {
  const { data: existing } = await admin
    .from('classmates')
    .select('id, name')
    .eq('course_id', courseId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (existing) return existing

  const name = CLASSMATE_NAMES[Math.floor(Math.random() * CLASSMATE_NAMES.length)]
  const { data: created } = await admin
    .from('classmates')
    .insert({ course_id: courseId, name, persona_description: CLASSMATE_PERSONA })
    .select('id, name')
    .single()
  return created ?? null
}

/**
 * Find the single weakest EVIDENCED gap among the concepts a lesson element
 * just taught — a concept with mastery below the weak threshold AND at least
 * one observation. Returns null if there is no evidenced gap.
 */
async function detectGap(
  studentId: string,
  courseId: string,
  taughtConceptTags: string[],
  admin: ReturnType<typeof createAdminClient>,
): Promise<Gap | null> {
  const tags = [...new Set(taughtConceptTags.filter(Boolean))]
  if (tags.length === 0) return null

  const { data } = await admin
    .from('student_knowledge_state')
    .select('concept_tag, mastery_probability, observation_count')
    .eq('student_id', studentId)
    .eq('course_id', courseId)
    .in('concept_tag', tags)

  const weak = ((data ?? []) as { concept_tag: string; mastery_probability: number; observation_count: number }[])
    .filter((r) => r.observation_count > 0 && Number(r.mastery_probability) < WEAK_THRESHOLD)
    .sort((a, b) => Number(a.mastery_probability) - Number(b.mastery_probability))

  if (weak.length === 0) return null
  const w = weak[0]
  return { conceptTag: w.concept_tag, mastery: Number(w.mastery_probability), observations: w.observation_count }
}

/**
 * Called when the student advances past a lesson element. If the element just
 * taught a concept the student is evidenced-weak on, the classmate raises a
 * hand: it generates a question, the lecturer answers, the exchange is logged
 * and seeds the Q&A cache (tagged classmate_asked — framework moat 4).
 * Never throws to the client — on any failure returns { fired: false }.
 */
export async function checkClassmateGap(opts: {
  sessionId: string
  lessonId: string
  courseId: string
  taughtConceptTags: string[]
  lessonContext: string
  askedQuestions: string[]
  /** When no evidenced gap exists, allow an ambient on-topic question anyway. */
  allowAmbient?: boolean
  /**
   * End-of-lesson "office hours": the lecturer has asked the class for closing
   * questions. Bypasses the in-lesson cap (so the wrap-up reliably fires) and
   * asks a synthesis/closing question rather than a per-scene gap question.
   */
  wrapUp?: boolean
  /**
   * Concepts the student answered WRONG in this very session (the player
   * tracks them live). They outrank the model's global weakest concept for
   * the wrap-up focus: the classmate should ask about what the student missed
   * today, not what they missed last month.
   */
  sessionMissedConcepts?: string[]
}): Promise<CheckResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { fired: false }

    const admin = createAdminClient()

    // Cap: classmate interventions per lesson session (server-authoritative).
    // The end-of-lesson wrap-up is exempt so it always gets to happen.
    if (!opts.wrapUp) {
      const { count } = await admin
        .from('classmate_interventions')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', opts.sessionId)
      if ((count ?? 0) >= MAX_INTERVENTIONS_PER_SESSION) return { fired: false }
    }

    // Priority 1: a grounded gap (the moat). Priority 2: an ambient on-topic
    // question to keep the room alive — only when the player allows it. The
    // wrap-up always proceeds (a closing question, gap-biased when one exists).
    // A concept missed IN THIS SESSION outranks the model's global weakest:
    // today's confusion is the most useful thing to surface in office hours.
    let gap = await detectGap(user.id, opts.courseId, opts.taughtConceptTags, admin)
    const sessionMiss = (opts.sessionMissedConcepts ?? []).find(
      (c) => c && opts.taughtConceptTags.includes(c),
    )
    if (opts.wrapUp && sessionMiss) {
      gap = { conceptTag: sessionMiss, mastery: gap?.mastery ?? 0, observations: gap?.observations ?? 1 }
    }
    if (!gap && !opts.allowAmbient && !opts.wrapUp) return { fired: false }

    const classmate = await getOrCreateClassmate(opts.courseId, admin)
    if (!classmate) return { fired: false }

    const concept = gap ? titleize(gap.conceptTag) : null

    // Generate the classmate's question (Sonnet, in character). Wrap-up → a
    // closing/synthesis question (gap-biased when one exists); otherwise a
    // gap-clarifying question when there's an evidenced weakness, else a curious
    // on-topic one.
    const wrapUpFocus = concept
      ? `The other student has seemed a little unsure about "${concept}", so a closing question that touches on it would help.`
      : ''
    const questionSystem = opts.wrapUp
      ? `You are ${classmate.name}, ${CLASSMATE_PERSONA}. A professional certification lesson has just finished and the lecturer has asked the class if anyone has any final questions.

Raise your hand and ask ONE genuine closing question about the lesson: synthesising what was covered, connecting it to real practice, or clarifying something that is still fuzzy now that you have seen the whole picture. ${wrapUpFocus}

Rules:
- First person, natural, conversational, like a real student wrapping up, not a teacher.
- ONE question, one or two sentences. Do not preface it with "I have a question".
- Range over the lesson as a whole, not just the last point. Never show off.
- Do not ask anything already asked (listed below).
- Output only the question itself.`
      : concept
      ? `You are ${classmate.name}, ${CLASSMATE_PERSONA}. You are sitting in a professional certification lesson alongside another student.

The lesson just covered the material below. The other student has shown weakness on the concept "${concept}" but has not asked about it. Raise your hand and ask ONE question, the question a slightly-unsure student genuinely would ask to get clarity on ${concept}.

Rules:
- First person, natural, conversational, like a real student, not a teacher.
- ONE question, one or two sentences. Do not preface it with "I have a question".
- It is fine to sound a little unsure. Never show off.
- Do not ask anything already asked (listed below).
- Output only the question itself.`
      : `You are ${classmate.name}, ${CLASSMATE_PERSONA}. You are sitting in a professional certification lesson alongside another student.

The lesson just covered the material below. Raise your hand and ask ONE genuine, on-topic question that a curious, engaged student would naturally ask here, to clarify a nuance, connect it to real practice, or probe a "what about…". Make it specific to this material, not generic.

Rules:
- First person, natural, conversational, like a real student, not a teacher.
- ONE question, one or two sentences. Do not preface it with "I have a question".
- Stay on the lesson's topic. Never show off.
- Do not ask anything already asked (listed below).
- Output only the question itself.`
    const questionUser = `LESSON MATERIAL:\n${opts.lessonContext}\n\nThe student has already asked:\n${
      opts.askedQuestions.length ? opts.askedQuestions.map((q) => `- ${q}`).join('\n') : '(nothing yet)'
    }`

    const qStart = Date.now()
    const qResult = await callSonnet({
      system: questionSystem,
      messages: [{ role: 'user', content: questionUser }],
      maxTokens: 160,
      temperature: 0.8,
    })
    await logAiCall({
      context: { studentId: user.id, courseId: opts.courseId, sessionId: opts.sessionId, purpose: 'classmate_gap' },
      model: 'sonnet',
      inputTokens: qResult.inputTokens,
      outputTokens: qResult.outputTokens,
      costCents: qResult.costCents,
      latencyMs: Date.now() - qStart,
    })
    const question = stripEmDashes(qResult.text.trim())
    if (!question) return { fired: false }

    // Generate the lecturer's answer to the classmate's question (Haiku, grounded).
    const answerSystem = `You are the AI lecturer for Enso Academy. A student in the class just asked the question below. Answer it grounded in the lesson content. Be concise, 2-3 paragraphs at most. Write in plain prose and do not use em-dashes; use commas, colons, or periods.

LESSON CONTENT:
${opts.lessonContext}`
    const aStart = Date.now()
    const aResult = await callHaiku({
      system: answerSystem,
      messages: [{ role: 'user', content: question }],
      maxTokens: 500,
      temperature: 0.7,
    })
    await logAiCall({
      context: {
        studentId: user.id,
        courseId: opts.courseId,
        sessionId: opts.sessionId,
        lessonId: opts.lessonId,
        purpose: 'classmate_gap',
      },
      model: 'haiku',
      inputTokens: aResult.inputTokens,
      outputTokens: aResult.outputTokens,
      costCents: aResult.costCents,
      latencyMs: Date.now() - aStart,
    })
    const answer = stripEmDashes(aResult.text.trim())

    // Seed the Q&A cache, tagged classmate_asked (framework moat 4 — the
    // classmate-discovered blind-spot dataset).
    let cachedQaId: string | null = null
    try {
      const embedding = await embed(question)
      const { data: cached } = await admin
        .from('cached_qa')
        .insert({
          course_id: opts.courseId,
          lesson_id: opts.lessonId,
          question_text: question,
          answer_text: answer,
          origin: 'classmate_asked',
          concept_tags: gap
            ? [gap.conceptTag]
            : [...new Set(opts.taughtConceptTags.filter(Boolean))].slice(0, 3),
          answered_by_model: 'haiku',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          embedding: embedding.vector as any,
        })
        .select('id')
        .single()
      cachedQaId = cached?.id ?? null
    } catch (err) {
      console.error('classmate cached_qa seed failed:', err)
    }

    // Log the intervention.
    await admin.from('classmate_interventions').insert({
      student_id: user.id,
      course_id: opts.courseId,
      session_id: opts.sessionId,
      lesson_id: opts.lessonId,
      classmate_id: classmate.id,
      triggering_concept: gap ? gap.conceptTag : opts.taughtConceptTags.filter(Boolean)[0] ?? null,
      gap_evidence: gap
        ? { mastery: gap.mastery, observations: gap.observations, weak_threshold: WEAK_THRESHOLD }
        : { mode: opts.wrapUp ? 'wrap_up' : 'ambient' },
      question_asked: question,
      lecturer_response: answer,
      cached_qa_id: cachedQaId,
      suppressed: false,
    })

    return { fired: true, classmateName: classmate.name, question, answer }
  } catch (err) {
    console.error('checkClassmateGap failed:', err)
    return { fired: false }
  }
}
