// lib/ai/completions.ts
// High-level completion helpers wrapping the OpenRouter (OpenAI-protocol) client.
// Routes to the right model tier, handles streaming, estimates cost.

import { openrouter, estimateCostCents, type ModelString } from './client'
import type OpenAI from 'openai'

export type CompletionOptions = {
  model: ModelString
  system?: string
  messages: OpenAI.Chat.ChatCompletionMessageParam[]
  maxTokens?: number
  temperature?: number
  stopSequences?: string[]
}

export type CompletionResult = {
  text: string
  inputTokens: number
  outputTokens: number
  costCents: number
  stopReason: string | null
  rawResponse: OpenAI.Chat.ChatCompletion
}

// Prepend the system prompt as a system-role message (OpenAI protocol).
function buildMessages(opts: CompletionOptions): OpenAI.Chat.ChatCompletionMessageParam[] {
  return opts.system
    ? [{ role: 'system', content: opts.system }, ...opts.messages]
    : opts.messages
}

export async function complete(opts: CompletionOptions): Promise<CompletionResult> {
  const response = await openrouter.chat.completions.create({
    model: opts.model,
    messages: buildMessages(opts),
    max_tokens: opts.maxTokens ?? 4096,
    temperature: opts.temperature ?? 1.0,
    stop: opts.stopSequences,
    // GLM and other reasoning models otherwise run a hidden reasoning pass on
    // every call: added latency, and it starves our small token caps (an answer
    // can come back empty). Disable it for those models. Anthropic Opus
    // (offline course generation) is left untouched.
    ...(opts.model.startsWith('z-ai/') && { reasoning: { enabled: false } }),
  } as OpenAI.Chat.ChatCompletionCreateParamsNonStreaming)

  const choice = response.choices[0]
  const text = choice?.message?.content ?? ''
  const inputTokens = response.usage?.prompt_tokens ?? 0
  const outputTokens = response.usage?.completion_tokens ?? 0
  const costCents = estimateCostCents(opts.model, inputTokens, outputTokens)

  return {
    text,
    inputTokens,
    outputTokens,
    costCents,
    stopReason: choice?.finish_reason ?? null,
    rawResponse: response,
  }
}

export type StreamingCompletionOptions = CompletionOptions & {
  onTextDelta?: (delta: string) => void
  onComplete?: (result: CompletionResult) => void
}

// Streaming completion. Returns the final result after the stream completes.
// onTextDelta fires for each chunk of text as it arrives.
export async function completeStreaming(
  opts: StreamingCompletionOptions
): Promise<CompletionResult> {
  const stream = openrouter.chat.completions.stream({
    model: opts.model,
    messages: buildMessages(opts),
    max_tokens: opts.maxTokens ?? 4096,
    temperature: opts.temperature ?? 1.0,
    stop: opts.stopSequences,
    // See complete(): disable the hidden reasoning pass for GLM-class models.
    ...(opts.model.startsWith('z-ai/') && { reasoning: { enabled: false } }),
  } as Parameters<typeof openrouter.chat.completions.stream>[0])

  if (opts.onTextDelta) {
    stream.on('content', (delta: string) => opts.onTextDelta!(delta))
  }

  const finalCompletion = await stream.finalChatCompletion()
  const choice = finalCompletion.choices[0]
  const inputTokens = finalCompletion.usage?.prompt_tokens ?? 0
  const outputTokens = finalCompletion.usage?.completion_tokens ?? 0
  const costCents = estimateCostCents(opts.model, inputTokens, outputTokens)

  const result: CompletionResult = {
    text: choice?.message?.content ?? '',
    inputTokens,
    outputTokens,
    costCents,
    stopReason: choice?.finish_reason ?? null,
    rawResponse: finalCompletion,
  }

  opts.onComplete?.(result)
  return result
}
