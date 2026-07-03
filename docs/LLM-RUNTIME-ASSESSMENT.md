# Runtime LLM Assessment (GLM 5.2)

**Assessed 2026-07-03, on evidence:** stored runtime outputs from real sessions (`cached_qa`, `classmate_interventions`) plus a live adversarial probe. This doc exists so the model decision is made deliberately, not inherited.

---

## Current state

`lib/ai/client.ts` MODELS: both real-time tiers (HAIKU and SONNET names) point at **`z-ai/glm-5.2`** via OpenRouter (a cost move). Everything interactive runs on it: lecturer Q&A, classmate question+answer generation, memory summarization, PBL grading. OPUS (offline generation) is separate and unaffected.

## Evidence

**Stored outputs (real sessions):** classmate questions are genuinely good, natural, in-character, occasionally sophisticated ("is there a general threshold for how strong the off-chain link needs to be before a referral is worth making versus just being noise for them?"). Lecturer answers are grounded in the lesson context, correctly hedged, substantively accurate, register-clean.

**Adversarial live probe:** asked the lecturer (a) a real statute fact NOT in the lesson context and (b) a deliberately FALSE premise ("the exact civil penalty FinCEN assessed against Bitzlato" — there was none; it was a prohibition order). Result: refused both, stated they were outside the lesson's scope, invented nothing, redirected to the lesson. **Zero hallucination under a trap.** That is the property a compliance product needs most.

**Observed weaknesses:** (1) occasional instruction leaks — a "*raises hand*" stage direction reached a stored question (sanitizer added 2026-07-03); historical em-dash leaks (output stripping now covers both paths). (2) Latency variance on OpenRouter — the multi-minute office-hours gaps (mitigated by prefetch, 2026-07-03, but the underlying variance remains). (3) A flatter, "correct" teaching voice: explains well, rarely illuminates; declined the in-scope-adjacent statute question where a stronger model would have answered with a hedge.

## Verdict

**Adequate-to-good and safe for grounded Q&A.** Roughly half the credit belongs to the harness (verified lesson text in every prompt + stay-in-scope instruction + output stripping); GLM obeys the cage reliably, which is the property that matters. It is not the ceiling: if the lecturer should feel *brilliant* rather than reliable — the thing users quote to colleagues — a stronger interactive model buys that.

## Recommendation (operator decision, one line per tier)

- Ship on GLM 5.2. It is not a launch blocker.
- When real users exist, **A/B the interactive path** (lecturer Q&A + classmate) on `claude-haiku-4-5` — pennies/day at current traffic, buys latency predictability and voice quality. Keep GLM for background jobs (memory summarization) where latency and flair are irrelevant.
- Whatever the choice: the interactive path has **no fallback model and no latency SLO**; that is the real gap. A timeout-plus-fallback in `lib/ai/routing.ts` is more valuable than any single model choice.

## How to switch

`lib/ai/client.ts` -> `MODELS.HAIKU` / `MODELS.SONNET` (OpenRouter slugs). One line each. Cost tracking (`logAiCall`) already records per-call model/cost, so an A/B is measurable from day one.
