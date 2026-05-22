// lib/ai/generator/assessment.ts
// Stage 3 — assessment + glossary. One Opus call per module: scenario-based
// mock-exam questions for the question_bank, plus glossary terms.

import { callOpus } from '@/lib/ai/routing'
import { logAiCall } from '@/lib/ai/cost-tracking'
import { loadMethodology } from './methodology'
import { parseJson } from './parse'
import type { AssessmentArtifact, OutlineArtifact, OutlineModule } from './types'

const ASSESSMENT_SCHEMA = `{
  "questions": [
    {
      "questionText": "a scenario-based practitioner-judgement question",
      "questionType": "single_choice" | "scenario_mcq",
      "options": [{ "id": "a", "text": "string" }],
      "correctOptionId": "a",
      "explanation": "why the correct answer is correct, grounded in a primary source",
      "wrongAnswerRationales": { "b": "why b is wrong", ... },
      "conceptTags": ["snake_case", ...],
      "domain": "the exam domain this question belongs to",
      "difficulty": "foundational" | "standard" | "advanced" | "expert"
    }
  ],
  "glossary": [
    { "term": "string", "definition": "full definition", "shortDefinition": "string?", "aliases": ["string", ...] }
  ]
}`

export async function generateAssessment(opts: {
  outline: OutlineArtifact
  module: OutlineModule
  questionCount?: number
}): Promise<{ artifact: AssessmentArtifact; costCents: number }> {
  const { outline, module } = opts
  const count = opts.questionCount ?? 12
  const system = loadMethodology()
  const user = `Generate assessment material for one module of the Enso Academy course "${outline.course.name}".

MODULE: ${module.name}
Module objective: ${module.objective}
Module primary sources: ${module.sourceNames.join('; ')}
Lessons: ${module.lessons.map((l) => l.name).join('; ')}

Follow the methodology above — especially the quiz-design rules. Produce ${count} questions that test the application of concepts to scenarios (not recitation), grounded in this module's primary sources. Do NOT mimic any certification's published question style. Also produce the glossary terms a student needs for this module, defined from primary sources.

Output ONLY a single JSON object — no prose, no code fences — matching:
${ASSESSMENT_SCHEMA}`

  const result = await callOpus({
    system,
    messages: [{ role: 'user', content: user }],
    maxTokens: 16000,
    temperature: 0.7,
  })

  await logAiCall({
    context: { purpose: 'generation' },
    model: 'opus',
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    costCents: result.costCents,
    metadata: { stage: 'assessment', moduleSlug: module.slug },
  })

  const artifact = parseJson<AssessmentArtifact>(result.text)
  for (const q of artifact.questions) q.moduleSlug = module.slug
  return { artifact, costCents: result.costCents }
}
