// lib/mock/types.ts
// Plain (non-'use server') module for shared mock constants + types.
// A 'use server' file (lib/mock/actions.ts) may only export async functions,
// so the constant + types live here and are imported where needed.

/**
 * Thrown by startMockExam when the student has no mock attempts left (free taste
 * used up and no purchased credits). The UI catches this to show buy options.
 */
export const MOCK_PAYWALL = 'MOCK_PAYWALL'

// An option as rendered to the student — id is what the answer references.
export type MockOption = { id: string; text: string }

// A question as seen by the student — never includes the correct answer.
export type MockQuestion = {
  id: string
  question_text: string
  options: MockOption[]
  domain: string
  difficulty: string
  question_type: string
  /** For multiple_choice: how many options to select (>= 1). Single types: 1. */
  select_count?: number
}
