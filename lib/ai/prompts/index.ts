// lib/ai/prompts/index.ts
// Central registry of all AI prompts in the system.
// Each prompt has a name, a version, and a function that produces the prompt text.

import { LECTURER_SYSTEM_PROMPT } from './lecturer-system'
import { CLASSMATE_GAP_QUESTION_PROMPT } from './classmate-gap-question'
import { ESCALATION_CLASSIFIER_PROMPT } from './escalation-classifier'

export const PROMPTS = {
  LECTURER_SYSTEM: { version: 'v0.1', text: LECTURER_SYSTEM_PROMPT },
  CLASSMATE_GAP_QUESTION: { version: 'v0.1', text: CLASSMATE_GAP_QUESTION_PROMPT },
  ESCALATION_CLASSIFIER: { version: 'v0.1', text: ESCALATION_CLASSIFIER_PROMPT },
} as const
