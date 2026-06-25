// lib/ai/client.ts
// Server-only. Do not import from Client Components.
// OpenRouter client (OpenAI-protocol) with three-tier model routing and cost
// estimation. OpenRouter is used because direct Anthropic/OpenAI API billing is
// not workable from Bangladesh — see docs/decisions/0005-llm-access-via-openrouter.md.

import OpenAI from 'openai'

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY is required')
}

// OpenRouter speaks the OpenAI protocol. One key, one client for chat + embeddings.
export const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  maxRetries: 3,
  defaultHeaders: {
    // Optional OpenRouter attribution headers (shown on the OpenRouter dashboard).
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    'X-Title': 'Enso Academy',
  },
})

// Model tier constants — OpenRouter model slugs.
// See docs/ARCHITECTURE.md "Three-tier model architecture".
export const MODELS = {
  // Layer 1: Offline course generation
  OPUS: 'anthropic/claude-opus-4.7',
  // Layer 2: Real-time student interaction. Routed to GLM 5.2 on OpenRouter,
  // which is cheaper than and at least as capable as Haiku/Sonnet for these
  // real-time tasks. The two tiers now point at the same model.
  HAIKU: 'z-ai/glm-5.2',
  // Layer 2/3: Escalation, grading, classmate gap-question generation
  SONNET: 'z-ai/glm-5.2',
} as const

export type ModelTier = keyof typeof MODELS
export type ModelString = (typeof MODELS)[ModelTier]

// Embedding model — OpenAI text-embedding-3-small via OpenRouter.
// 1536 dimensions, matching the pgvector vector(1536) columns in the schema.
export const EMBEDDING_MODEL = 'openai/text-embedding-3-small'
export const EMBEDDING_DIM = 1536

// Cost estimates per 1M tokens (input/output), in USD. Used for cost tracking.
// These are provider list prices. OpenRouter passes provider per-token pricing
// through and takes its margin as a ~5-5.5% fee on credit top-ups (not per token),
// so these are slight underestimates of true spend. Update when pricing changes.
export const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  [MODELS.OPUS]: { input: 15.0, output: 75.0 },
  // HAIKU and SONNET both resolve to GLM 5.2, so a single entry covers both.
  // GLM 5.2 on OpenRouter: $0.95 / 1M input, $3.00 / 1M output.
  [MODELS.HAIKU]: { input: 0.95, output: 3.0 },
}

export function estimateCostCents(
  model: ModelString,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = MODEL_PRICING[model]
  if (!pricing) return 0
  const inputCost = (inputTokens / 1_000_000) * pricing.input
  const outputCost = (outputTokens / 1_000_000) * pricing.output
  return Math.round((inputCost + outputCost) * 100 * 10000) / 10000
}
