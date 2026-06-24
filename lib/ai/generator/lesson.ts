// lib/ai/generator/lesson.ts
// Stage 2 — a lesson's scenes. One Opus call per lesson: the lesson brief +
// its module context → an ordered list of scenes matching the runtime scene
// contract (lib/lesson/scenes.ts).

import { callOpus } from '@/lib/ai/routing'
import { logAiCall } from '@/lib/ai/cost-tracking'
import { loadMethodology } from './methodology'
import { CURRENT_FACTS_PACK } from './facts_pack'
import { parseJson } from './parse'
import type { LessonArtifact, OutlineArtifact, OutlineModule, OutlineLesson } from './types'

const SCENE_SCHEMA = `Each scene is an object:
{
  "sceneType": "reading" | "slide" | "quiz" | "interactive" | "pbl",
  "title": "string",
  "conceptTags": ["snake_case", ...],
  "teachesConcepts": ["snake_case", ...],
  "sceneData": { ... shape depends on sceneType ... }
}

sceneData by sceneType:
- "reading": { "body": "markdown prose", "citations": [{ "label": "citation text", "url": "string?" }] }
- "slide":   { "template": "key-points"|"definition"|"comparison"|"callout",
               "heading": "string", "subheading": "string?",
               "items": [{ "icon": "emoji?", "label": "string?", "text": "string" }],
               "narration": "the spoken script for this slide" }
- "quiz":    { "intro": "string?",
               "questions": [{ "prompt": "string", "options": [{ "id": "a", "text": "string" }],
                               "correctOptionId": "a", "explanation": "string",
                               "conceptTags": ["snake_case", ...], "points": 10 }] }
- "interactive": { "title": "string", "summary": "string", "spec": <ONE interactive spec, see below> }
- "pbl":         { "title": "string", "summary": "string",
                   "spec": { "kind": "project", "brief": "the scenario (markdown)",
                             "task": "what the student must do", "deliverable": "what to produce, e.g. 'a 4-6 sentence narrative'",
                             "rubric": ["criterion a strong answer meets", ...] } }

Interactive specs (sceneData.spec for "interactive"):
- risk-classify: { "kind": "risk-classify", "prompt": "string?",
                   "items": [{ "id": "string", "label": "a customer / scenario", "tier": "low"|"medium"|"high", "why": "feedback" }] }
                   — 4-6 items, balanced across the three tiers.
- red-flags:     { "kind": "red-flags", "prompt": "string?", "scenario": "string?",
                   "items": [{ "id": "string", "label": "a statement", "flag": true|false, "why": "feedback" }] }
                   — 5-6 items, a mix of genuine flags and non-flags.
- flow-trace:    { "kind": "flow-trace", "prompt": "string?",
                   "nodes": [{ "id": "string", "label": "account/entity", "role": "source"|"intermediary"|"destination"|"decoy", "x": 0-100, "y": 0-60 }],
                   "edges": [{ "from": "id", "to": "id", "amount": "$50k?" }],
                   "path": ["source id", ...ordered..., "destination id"], "why": "what the decoy branches were" }
                   — 5-8 nodes laid out left→right (source low x, destination high x), with x roughly 12-88 and y roughly 10-50 so labels don't clip the edges; the correct laundering route plus 1-2 feeder/decoy branches. Best for layering, structuring, TBML, correspondent/nested flows.
- screening-match: { "kind": "screening-match", "prompt": "string?",
                   "alerts": [{ "id": "string",
                                "party": { "name": "inbound name", "fields": [{ "label": "DOB", "value": "1975" }, ...] },
                                "listEntry": { "name": "list name", "list": "OFAC SDN / PEP / ...", "fields": [{ "label": "DOB", "value": "1975" }, ...] },
                                "verdict": "clear"|"escalate", "why": "feedback" }] }
                   — 3-5 alerts mixing true matches (escalate) and false positives (clear): vary name spelling/transliteration, DOB, country, identifiers. Best for sanctions/PEP screening and fuzzy matching.

Slide templates:
- key-points : heading + items as point cards (icon, label, text)
- definition : heading is the term; items[0].text is the definition; further items are secondary points
- comparison : items grouped into two columns by their "label" (the column heading)
- callout    : items[0].text is a single emphasised statement`

export async function generateLessonScenes(opts: {
  outline: OutlineArtifact
  module: OutlineModule
  lesson: OutlineLesson
  /** Feedback from a prior failed validation run; injected into the prompt so the model can correct in place. */
  retryFeedback?: string
}): Promise<{ artifact: LessonArtifact; costCents: number }> {
  const { outline, module, lesson, retryFeedback } = opts
  // System = the verbatim methodology + the operator-maintained current-facts
  // reference. The facts pack overrides training-stale regulatory facts at
  // system-prompt authority (ADR 0020 currency residual-gap stopgap).
  const system = `${loadMethodology()}\n\n${CURRENT_FACTS_PACK}`
  const retryPreamble = retryFeedback
    ? `A prior attempt at this lesson failed the deterministic gate validator. Address every issue below before regenerating. Do not change content that was not flagged; only correct the cited problems.

PRIOR-RUN FAILURES:
${retryFeedback}

`
    : ''
  const user = `${retryPreamble}Generate the scenes for one lesson of the Enso Academy course "${outline.course.name}".

MODULE: ${module.name}
Module objective: ${module.objective}
Module primary sources: ${module.sourceNames.join('; ')}

LESSON: ${lesson.name}
Lesson description: ${lesson.description}
Learning objectives: ${lesson.learningObjectives.join('; ')}
Concept tags: ${lesson.conceptTags.join(', ')}
Scene brief: ${lesson.sceneBrief}

Follow the methodology above. Produce an ordered list of scenes that teach this lesson — typically an opening, the core concept(s) taught from primary sources with visible citations, one or two worked examples, a formative knowledge check, and a synthesis. Use scene types reading / slide / quiz. Every factual claim must be citable: reading scenes carry a citations array; cite primary sources by name and section. Quizzes are formative — scenario-based questions with per-question conceptTags. Professional tone for an adult practitioner; no marketing register.

HANDS-ON APPLICATION SCENE. Where the lesson's material supports applying a skill (not pure recall), include exactly ONE "interactive" or "pbl" scene, placed near the end just before the synthesis:
- "interactive" — a "risk-classify" (sort customers/scenarios into risk tiers), "red-flags" (select the genuine indicators in a scenario), "flow-trace" (trace the laundering route through a transaction-network graph), or "screening-match" (adjudicate sanctions/PEP alerts as true-match vs false-positive) widget. Best for typologies, risk-rating, sanctions, screening, fraud, CDD, and following the money through layering/TBML/correspondent flows.
- "pbl" — a "project": a realistic brief where the student writes a deliverable (a SAR narrative, an EDD or escalation memo, a build-vs-buy recommendation, an analysis), graded by an AI mentor against the rubric. Best for SAR/STR drafting, governance, enforcement analysis, decisions.
Author the spec fully (real, defensible items / a concrete brief with a clear rubric). Interactive/pbl scenes apply what the lesson already taught, so they do NOT introduce new statutes and carry no citations[]. Skip this scene entirely for purely conceptual or definitional lessons rather than forcing one.

THREE REQUIREMENTS THE CROSS-CHECK ENFORCES STRICTLY — satisfy them up front:
1. DISTINCT CONCEPTS PER SCENE. Each scene's teachesConcepts must make a substantively distinct contribution — do not produce two scenes whose teachesConcepts merely restate the same concept. (Topical conceptTags MAY recur across scenes — that is fine; it is teachesConcepts that must be distinct.) Where scenes share a topic, each must add a genuinely new facet, mechanism, edge case, or application — not re-teach the same point under a different title.
2. A REAL DEEP-CASE SCENE. Include at least one deep-case scene built on a SPECIFIC, NAMED, REAL-WORLD MATTER — a named enforcement action, prosecution, or well-documented public scandal — with a named entity, a year, and concrete facts you analyse in depth (what happened, why it matters, what the practitioner learns). A generic process description (e.g. how a mutual-evaluation, peer-review, or supervisory process works in the abstract) does NOT satisfy this: the deep case must be a particular matter, not a process walkthrough.
3. CITATION-POOL LOCATABILITY. Every structured reference you put on a SLIDE or in narration — a statute, section, regulation, FATF Recommendation/INR, circular, executive order, or case — must ALSO appear in some reading scene's citations[] array in this lesson, with name + section/paragraph granularity. Never introduce a statute or instrument on a slide that is not anchored by a pinpoint citation in one of the lesson's reading scenes. The reviewer checks every slide reference against the lesson-wide citation pool.

Output ONLY a single JSON object — no prose, no code fences:
{ "lessonSlug": "${lesson.slug}", "scenes": [ ...scenes... ] }

${SCENE_SCHEMA}`

  const result = await callOpus({
    system,
    messages: [{ role: 'user', content: user }],
    // Methodology-compliant lessons (every slide reference pooled into a
    // reading scene's citations[]) run ~16-20k output tokens; 16k truncated
    // mid-JSON. 32k is Opus 4.x's standard output ceiling and gives headroom.
    maxTokens: 32000,
    temperature: 0.7,
  })

  await logAiCall({
    context: { purpose: 'generation' },
    model: 'opus',
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    costCents: result.costCents,
    metadata: { stage: 'lesson', lessonSlug: lesson.slug },
  })

  // A 'length' stop means the model hit maxTokens and the JSON is truncated —
  // surface that clearly instead of letting parseJson throw a cryptic
  // "Unterminated string" error.
  if (result.stopReason === 'length') {
    throw new Error(
      `Lesson "${lesson.slug}" generation hit the ${32000}-token output cap (stopReason=length) — JSON is truncated. Raise maxTokens or split the lesson.`,
    )
  }

  const artifact = parseJson<LessonArtifact>(result.text)
  // Defensive: ensure the slug is right even if the model echoed something else.
  artifact.lessonSlug = lesson.slug
  return { artifact, costCents: result.costCents }
}
