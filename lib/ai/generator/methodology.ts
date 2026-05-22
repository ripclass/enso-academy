// lib/ai/generator/methodology.ts
// Loads the committed v1.0 course-generation methodology — the Opus system
// prompt for every generation call. The IP discipline lives in that document;
// never paraphrase or summarise it. See ADR 0015.

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

let cached: string | null = null

/** The v1.0 course-generation methodology, verbatim — used as the Opus system prompt. */
export function loadMethodology(): string {
  if (cached) return cached
  cached = readFileSync(join(process.cwd(), 'docs', 'COURSE-GENERATION-PROMPT.md'), 'utf8')
  return cached
}

/** The methodology version, recorded on each course_versions row. */
export const METHODOLOGY_VERSION = 'v1.0'
