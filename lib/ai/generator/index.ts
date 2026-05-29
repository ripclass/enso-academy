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
export {
  runGates,
  gateSchema,
  gateCitation,
  gateIp,
  gatePedagogy,
  gateQuizAlignment,
  gateMethodology,
  type GateOutcome,
  type GateResult,
  type ValidationReport,
} from './validate_gates'
export {
  gateCitationBind,
  runCitationBind,
  extractClaims,
  bindClaim,
  type ExtractedClaim,
  type BindHit,
  type ClaimKind,
  type CitationBindReport,
} from './citation_bind'
export {
  dispatchCodex,
  parseVerdict,
  parallelCrossCheck,
  dispatchCodexWithCap,
  countPriorCrossChecks,
  MAX_CODEX_ITERATIONS_PER_LESSON,
  makeReviewEvent,
  appendReviewEvent,
  type CodexVerdict,
  type CodexDecision,
  type DispatchOptions,
  type ParallelCrossCheckArgs,
  type ParallelCrossCheckResult,
  type CappedDispatchResult,
  type ReviewEvent,
  type ReviewEventInput,
} from './codex_dispatch'
export {
  validateAndPersistLesson,
  summarizeFailures,
  GateValidationCapExceededError,
  MAX_GATE_VALIDATION_ATTEMPTS,
  type ValidateAndPersistArgs,
  type ValidateAndPersistResult,
} from './generate_with_gates'
export {
  runCodexCrossCheck,
  buildMethodologyBrief,
  buildFidelityBrief,
  synthesizeCodexFeedback,
  formatVerdictFeedback,
  CodexIterationCapExceededError,
  MAX_CODEX_REVIEW_ITERATIONS,
  type CodexCrossCheckArgs,
  type CodexCrossCheckResult,
  type CrossCheckOutcome,
} from './codex_review'
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
