// lib/ai/generator/index.ts
// The course-generation pipeline (Prompt 13 / ADR 0017). Server-only; invoked
// by scripts/generate-course.ts. Generates a course from primary sources via
// Claude Opus, against the methodology (ADR 0015) and the scene contract
// (ADR 0016), and writes it as a draft.

export { generateOutline } from './outline'
export { generateLessonScenes } from './lesson'
export { generateAssessment } from './assessment'
export { writeCourse, type WriteResult } from './writer'
export { saveArtifact, loadArtifact, artifactExists, listArtifacts } from './artifacts'
export { METHODOLOGY_VERSION } from './methodology'
export type {
  OutlineArtifact,
  OutlineModule,
  OutlineLesson,
  LessonArtifact,
  GeneratedScene,
  AssessmentArtifact,
  GeneratedQuestion,
  GeneratedGlossaryTerm,
} from './types'
