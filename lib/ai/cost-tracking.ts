// lib/ai/cost-tracking.ts
// Logs AI calls to the database for cost accounting and analytics.
// Most calls land in the escalations table; offline generation lands in course_versions metadata.

import { createAdminClient } from '@/lib/supabase/admin'
import type { ModelString } from './client'

export type LoggedCallContext = {
  studentId?: string
  courseId?: string
  sessionId?: string
  lessonId?: string
  purpose: 'lecturer' | 'escalation' | 'grading' | 'classmate_gap' | 'classifier' | 'generation' | 'embedding' | 'memory_summary' | 'lecturer_greeting' | 'other'
}

export async function logAiCall(opts: {
  context: LoggedCallContext
  model: ModelString | string
  inputTokens: number
  outputTokens: number
  costCents: number
  latencyMs?: number
  questionText?: string
  finalAnswer?: string
  metadata?: Record<string, unknown>
}): Promise<void> {
  const supabase = createAdminClient()

  // For escalations, log to the escalations table
  if (opts.context.purpose === 'escalation' && opts.context.studentId && opts.context.courseId) {
    await supabase.from('escalations').insert({
      student_id: opts.context.studentId,
      course_id: opts.context.courseId,
      session_id: opts.context.sessionId ?? null,
      lesson_id: opts.context.lessonId ?? null,
      question_text: opts.questionText ?? '',
      reason: 'novel_question',
      resolved_by_model: opts.model,
      final_answer: opts.finalAnswer ?? null,
      latency_ms: opts.latencyMs ?? null,
      tokens_used: opts.inputTokens + opts.outputTokens,
      cost_cents: opts.costCents,
      metadata: opts.metadata ?? {},
      resolved_at: new Date().toISOString(),
    })
    return
  }

  // For other call types, we'll add more specific tables in later prompts.
  // For now, write to audit_log as a catch-all.
  await supabase.from('audit_log').insert({
    actor_user_id: opts.context.studentId ?? null,
    action: `ai_call:${opts.context.purpose}`,
    target_table: 'ai_calls',
    payload: {
      model: opts.model,
      input_tokens: opts.inputTokens,
      output_tokens: opts.outputTokens,
      cost_cents: opts.costCents,
      latency_ms: opts.latencyMs ?? null,
      course_id: opts.context.courseId ?? null,
      ...(opts.metadata ?? {}),
    },
  })
}
