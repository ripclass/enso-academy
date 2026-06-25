// lib/ai/prose.ts
// Post-process for live, model-generated prose before it is shown or spoken to a
// student (lecturer answers, the greeting, classmate Q&A, grading feedback).
//
// The em-dash is our "AI tell": LLMs reach for it constantly. Static lesson
// content and copy are cleaned at authoring time; this is the runtime equivalent
// for text the model writes on the fly. A comma reads the same, so we collapse
// any em-dash (spaced or not) to a comma, mirroring the static content sweep.
// We deliberately leave the en-dash alone so numeric ranges (2008-2016) survive.
export function stripEmDashes(text: string): string {
  return text.replace(/\s*—\s*/g, ', ')
}
