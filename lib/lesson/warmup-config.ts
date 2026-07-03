// Pure config for the session warm-up (see lib/lesson/warmup.ts). A lesson
// listed here opens with a short retrieval round assembled at render from the
// student model: the student's weakest previously-observed concepts, quizzed
// from the course question bank before the day's new material.
//
// The four simulator-format free-preview lessons (Wave 1); expand deliberately.
export const WARMUP_LESSON_SLUGS = new Set<string>([
  'conducting-an-on-chain-investigation',
  'what-cryptoassets-are',
  'what-money-laundering-actually-is',
  'correspondent-banking-risk',
])

export function lessonHasWarmup(lessonSlug: string): boolean {
  return WARMUP_LESSON_SLUGS.has(lessonSlug)
}
