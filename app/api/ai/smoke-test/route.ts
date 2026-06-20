// app/api/ai/smoke-test/route.ts
// Smoke test for the AI client wrapper. GET this endpoint to verify Claude + OpenAI connectivity.
// SECURITY: bearer-guarded by SUPABASE_SERVICE_ROLE_KEY (never exposed client-side).
// Kept post-launch only as an operator health check (Phase 9). It triggers paid AI
// calls, so it must stay non-public. If the key is ever unset, the endpoint fails
// closed rather than accepting the literal "Bearer undefined".

import { NextResponse } from 'next/server'
import { callHaiku, callSonnet } from '@/lib/ai/routing'
import { embed } from '@/lib/ai/embeddings'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  // Bearer-token guard so this endpoint isn't world-callable. Fail closed if the
  // service-role key is missing/short so "Bearer undefined" can never authorize.
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey || serviceKey.length < 20) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const authHeader = request.headers.get('authorization')
  if (!authHeader || authHeader !== `Bearer ${serviceKey}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const results: Record<string, unknown> = {}

  try {
    // Test Haiku
    const haikuResult = await callHaiku({
      messages: [{ role: 'user', content: 'Reply with exactly: "Haiku alive"' }],
      maxTokens: 50,
    })
    results.haiku = {
      text: haikuResult.text,
      tokens: haikuResult.inputTokens + haikuResult.outputTokens,
      costCents: haikuResult.costCents,
    }

    // Test Sonnet
    const sonnetResult = await callSonnet({
      messages: [{ role: 'user', content: 'Reply with exactly: "Sonnet alive"' }],
      maxTokens: 50,
    })
    results.sonnet = {
      text: sonnetResult.text,
      tokens: sonnetResult.inputTokens + sonnetResult.outputTokens,
      costCents: sonnetResult.costCents,
    }

    // Test embeddings
    const embedResult = await embed('Enso Academy test embedding')
    results.embedding = {
      dim: embedResult.vector.length,
      tokens: embedResult.tokens,
      costCents: embedResult.costCents,
    }

    // Intentionally NOT testing Opus — too expensive for a smoke test. Tested when needed.
    results.opus = { skipped: 'Not tested in smoke check (cost)' }

    return NextResponse.json({ ok: true, results })
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : 'unknown',
      partialResults: results,
    }, { status: 500 })
  }
}
