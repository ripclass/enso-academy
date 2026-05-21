// lib/ai/routing.ts
// Tier-specific completion helpers. Use these instead of complete() directly
// so cost categorization is consistent across the codebase.

import { complete, completeStreaming, type CompletionResult } from './completions'
import { MODELS } from './client'
import type OpenAI from 'openai'

type TierCallOptions = {
  system?: string
  messages: OpenAI.Chat.ChatCompletionMessageParam[]
  maxTokens?: number
  temperature?: number
  stopSequences?: string[]
}

type StreamingTierCallOptions = TierCallOptions & {
  onTextDelta?: (delta: string) => void
  onComplete?: (result: CompletionResult) => void
}

// Layer 1: Course generation (offline, batch-friendly)
// Use for: generating lessons, question banks, case studies, glossary entries.
// Cost-intensive but one-time per course.
export async function callOpus(opts: TierCallOptions): Promise<CompletionResult> {
  return complete({ model: MODELS.OPUS, ...opts })
}

// Layer 2: Real-time lecturer (cheap, fast, runs on every student interaction)
// Use for: lesson narration, answering routine student questions, light orchestration.
// Should be backed by an Opus-tuned orchestration prompt and grounded in lesson context.
export async function callHaiku(opts: TierCallOptions): Promise<CompletionResult> {
  return complete({ model: MODELS.HAIKU, ...opts })
}

export async function callHaikuStreaming(
  opts: StreamingTierCallOptions
): Promise<CompletionResult> {
  return completeStreaming({ model: MODELS.HAIKU, ...opts })
}

// Layer 2/3: Escalation, grading, classmate gap-question generation
// Use for: novel student questions Haiku flags as out of scope, written-answer grading,
// generating classmate gap questions, structured outputs that need careful reasoning.
export async function callSonnet(opts: TierCallOptions): Promise<CompletionResult> {
  return complete({ model: MODELS.SONNET, ...opts })
}

export async function callSonnetStreaming(
  opts: StreamingTierCallOptions
): Promise<CompletionResult> {
  return completeStreaming({ model: MODELS.SONNET, ...opts })
}
