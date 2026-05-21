// lib/ai/embeddings.ts
// Embeddings via OpenRouter (OpenAI text-embedding-3-small, 1536 dims, matching
// the pgvector vector(1536) columns). Used by the cached_qa similarity search
// and student_memory. See docs/decisions/0005-llm-access-via-openrouter.md.

import { openrouter, EMBEDDING_MODEL, EMBEDDING_DIM } from './client'

export type EmbeddingResult = {
  vector: number[]
  tokens: number
  costCents: number
}

// text-embedding-3-small pricing: $0.02 per 1M tokens (provider list price).
const EMBEDDING_PRICE_PER_M_TOKENS = 0.02

export async function embed(text: string): Promise<EmbeddingResult> {
  if (!text || text.trim().length === 0) {
    throw new Error('embed() called with empty text')
  }
  const response = await openrouter.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  })
  const vector = response.data[0].embedding
  if (vector.length !== EMBEDDING_DIM) {
    throw new Error(`Embedding dim mismatch: expected ${EMBEDDING_DIM}, got ${vector.length}`)
  }
  const tokens = response.usage?.total_tokens ?? 0
  const costCents =
    Math.round((tokens / 1_000_000) * EMBEDDING_PRICE_PER_M_TOKENS * 100 * 10000) / 10000
  return { vector, tokens, costCents }
}

// Batch embedding for cost efficiency. Use when generating cache entries during course generation.
export async function embedBatch(texts: string[]): Promise<EmbeddingResult[]> {
  if (texts.length === 0) return []
  const response = await openrouter.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  })
  const tokens = response.usage?.total_tokens ?? 0
  const totalCostCents =
    Math.round((tokens / 1_000_000) * EMBEDDING_PRICE_PER_M_TOKENS * 100 * 10000) / 10000
  // Distribute cost proportionally (rough; for analytics only)
  const costPerItem = totalCostCents / texts.length
  return response.data.map((item) => ({
    vector: item.embedding,
    tokens: Math.round(tokens / texts.length),
    costCents: costPerItem,
  }))
}
