// lib/ai/generator/outline.ts
// Stage 1 — the course outline. One Opus call: certification target → course
// metadata, the primary-source list, and the module/lesson breakdown.

import { callOpus } from '@/lib/ai/routing'
import { logAiCall } from '@/lib/ai/cost-tracking'
import { loadMethodology } from './methodology'
import { parseJson } from './parse'
import type { OutlineArtifact } from './types'

const OUTLINE_SCHEMA = `{
  "course": {
    "slug": "lowercase-kebab",
    "name": "full course name, e.g. \\"AML/CFT Compliance — CAMS Exam Preparation\\"",
    "shortName": "short label, e.g. \\"CAMS\\"",
    "description": "1-2 sentences",
    "certifyingBody": "the body that issues the certification",
    "estimatedStudyHours": 0,
    "learningObjectives": ["string", ...]
  },
  "sources": [
    { "sourceName": "string", "sourceOrganization": "string?", "sourceUrl": "string?", "sourceYear": 0 }
  ],
  "modules": [
    {
      "slug": "lowercase-kebab",
      "name": "string",
      "description": "string",
      "objective": "the module's learning objective",
      "sourceNames": ["names matching entries in the course-level sources list"],
      "estimatedMinutes": 0,
      "lessons": [
        {
          "slug": "lowercase-kebab",
          "name": "string",
          "description": "string",
          "conceptTags": ["snake_case_concept", ...],
          "learningObjectives": ["string", ...],
          "sceneBrief": "a full paragraph briefing a downstream generator on the scenes to produce for this lesson — what it teaches, the worked examples, the checks for understanding"
        }
      ]
    }
  ]
}`

export async function generateOutline(opts: {
  certification: string
  subject: string
  learnerProfile: string
}): Promise<{ outline: OutlineArtifact; costCents: number }> {
  const system = loadMethodology()
  const user = `Produce the complete course outline for an Enso Academy course that prepares students for the ${opts.certification} certification.

Subject discipline: ${opts.subject}
Learner profile: ${opts.learnerProfile}

Follow the methodology above exactly. Map the discipline from primary sources (do not start from the certification's published syllabus); sequence pedagogically; structure it as modules, each with lessons. Reference the certification name only nominatively in the course name.

Output ONLY a single JSON object — no prose, no code fences — matching exactly this shape:
${OUTLINE_SCHEMA}

All slugs are lowercase-kebab and unique within their scope. Every lesson must carry a substantive sceneBrief so a downstream generator can produce its scenes without re-deriving the curriculum.`

  const result = await callOpus({
    system,
    messages: [{ role: 'user', content: user }],
    maxTokens: 32000, // a full course outline is large — headroom against truncation
    temperature: 0.7,
  })

  await logAiCall({
    context: { purpose: 'generation' },
    model: 'opus',
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    costCents: result.costCents,
    metadata: { stage: 'outline', certification: opts.certification },
  })

  const outline = parseJson<OutlineArtifact>(result.text)
  return { outline, costCents: result.costCents }
}
