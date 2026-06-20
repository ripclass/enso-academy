// lib/ai/generator/types.ts
// The structured output contract for course generation. Claude Opus emits JSON
// matching these shapes; the writer maps them onto the database schema. The
// scene shapes mirror lib/lesson/scenes.ts (the runtime scene contract).

// ── Stage 1: course outline ─────────────────────────────────────────────────

export type OutlineArtifact = {
  course: {
    slug: string
    name: string
    shortName: string
    description: string
    certifyingBody: string
    estimatedStudyHours: number
    learningObjectives: string[]
  }
  /** The primary sources the whole course draws from (methodology-allowed only). */
  sources: {
    sourceName: string
    sourceOrganization?: string
    sourceUrl?: string
    sourceYear?: number
  }[]
  modules: OutlineModule[]
}

export type OutlineModule = {
  slug: string
  name: string
  description: string
  objective: string
  sourceNames: string[]
  estimatedMinutes: number
  lessons: OutlineLesson[]
}

export type OutlineLesson = {
  slug: string
  name: string
  description: string
  conceptTags: string[]
  learningObjectives: string[]
  /** A paragraph briefing the lesson generator on the scenes to produce. */
  sceneBrief: string
}

// ── Stage 2: a lesson's scenes ──────────────────────────────────────────────

export type LessonArtifact = {
  lessonSlug: string
  scenes: GeneratedScene[]
}

/** One generated scene. `sceneData` matches the payload for its type in lib/lesson/scenes.ts. */
export type GeneratedScene = {
  sceneType: 'reading' | 'slide' | 'quiz' | 'interactive' | 'pbl'
  title: string
  conceptTags: string[]
  teachesConcepts: string[]
  sceneData: Record<string, unknown>
}

// ── Stage 3: assessment + glossary ──────────────────────────────────────────

export type AssessmentArtifact = {
  questions: GeneratedQuestion[]
  glossary: GeneratedGlossaryTerm[]
}

export type GeneratedQuestion = {
  questionText: string
  questionType: 'single_choice' | 'scenario_mcq' | 'multiple_choice'
  options: { id: string; text: string }[]
  /** The correct option id for single-answer types (single_choice / scenario_mcq). */
  correctOptionId: string
  /** The correct option ids for multiple_choice (multi-select) questions. */
  correctOptionIds?: string[]
  /** How many options a multi-select question expects the student to pick. */
  selectCount?: number
  explanation: string
  wrongAnswerRationales?: Record<string, string>
  conceptTags: string[]
  domain?: string
  difficulty: 'foundational' | 'standard' | 'advanced' | 'expert'
  moduleSlug?: string
}

export type GeneratedGlossaryTerm = {
  term: string
  definition: string
  shortDefinition?: string
  aliases?: string[]
}
