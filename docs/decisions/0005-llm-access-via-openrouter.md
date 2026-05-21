# ADR 0005: LLM Access via the OpenRouter Gateway

**Date:** 2026-05-21
**Status:** Accepted
**Decision maker:** Ripon Chowdhury

## Context

ARCHITECTURE.md specifies Anthropic Claude as the LLM (Opus / Sonnet / Haiku tiers) and OpenAI `text-embedding-3-small` for embeddings, implying direct API access to both providers. Prompt 4 accordingly built `lib/ai/` on the official `@anthropic-ai/sdk`.

Direct Anthropic and OpenAI API billing cannot be funded from Bangladesh — Bangladeshi cards are repeatedly declined by both providers' billing systems (50+ attempts). A Claude consumer subscription was eventually purchased after many retries, but that is not API credit.

OpenRouter is a gateway that resells access to Anthropic, OpenAI, and other providers behind a single OpenAI-protocol API, and accepts the payment methods available to the project.

## Decision

All LLM and embedding traffic goes through OpenRouter.

- One credential, `OPENROUTER_API_KEY`, replaces `ANTHROPIC_API_KEY` and `OPENAI_API_KEY`.
- The `lib/ai/` wrapper uses the `openai` SDK pointed at `https://openrouter.ai/api/v1`. The Anthropic SDK speaks the native Messages API and cannot talk to OpenRouter, so `@anthropic-ai/sdk` was removed.
- Model slugs: `anthropic/claude-opus-4.7`, `anthropic/claude-sonnet-4.6`, `anthropic/claude-haiku-4.5`.
- Embeddings: `openai/text-embedding-3-small` (1536-dim — matches the existing `vector(1536)` columns, no schema change).
- The three-tier model strategy from ARCHITECTURE.md is unchanged; only the transport changes.

## Alternatives considered

- Direct Anthropic + OpenAI APIs. Rejected: billing cannot be funded from Bangladesh.
- Vercel AI Gateway. Rejected for now: another billing setup with the same card risk; OpenRouter already works.
- Vercel AI SDK with the OpenRouter provider. Rejected for now: a larger rewrite of the Prompt 4 wrapper for no immediate gain. Can revisit if provider-switching becomes frequent.

## Consequences

- +unblocks all AI development immediately on a payment method that works
- +single key and single client for both chat and embeddings
- +Anthropic prompt caching still works through OpenRouter, preserving most of the Layer 2 cost model
- −OpenRouter charges a ~5–5.5% fee on credit top-ups (5% via crypto); per-token rates are provider pass-through
- −OpenRouter does NOT expose the Anthropic Batch API. ARCHITECTURE.md Layer 1 assumes Batch API (50% off) for one-time course generation; via OpenRouter that generation costs roughly 2× the $1,500–3,000/course estimate
- −OpenRouter does not proxy audio transcription, so Whisper ASR will need a separate provider path
- −cost figures are estimates: the per-token rates in `lib/ai/client.ts` are provider list prices and exclude OpenRouter's top-up fee

## Open questions

- Layer 1 course-generation cost: when the course generator is built, decide whether to (a) accept ~2× cost via OpenRouter, or (b) fund a direct Anthropic account once Enso Intelligence Inc. has a workable payment method (Stripe Atlas pending) and use the Batch API — possibly attached to OpenRouter as BYOK (5% fee).
- ASR provider path for Whisper-equivalent transcription (decided at the ASR prompt).
