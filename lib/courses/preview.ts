// Free preview lessons per course.
//
// These lessons are playable by ANY signed-in user without enrollment, so a
// prospect can experience the real classroom (voice, beats, interactives,
// office hours) before buying. Signup is the gate — anonymous visitors are sent
// to sign up first (lead capture for a high-ticket purchase).
//
// Kept as a small code config (not a DB flag) while only one course has a
// preview; promote to a `lessons.is_preview` column if multiple courses need
// editable previews.

export const PREVIEW_LESSON_IDS: Record<string, string[]> = {
  cams: [
    'ae8e5e46-b890-429d-b1a2-fab04fe611ed', // M1.1 — What Money Laundering Actually Is (the opener; has an interactive)
    'f458962a-99a7-4fca-821e-f1c5ef161820', // M6.2 — Correspondent Banking Risk (flow-trace + office hours showcase)
  ],
}

/** The preview lesson ids for a course slug (empty if none). */
export function previewLessonIds(courseSlug: string): string[] {
  return PREVIEW_LESSON_IDS[courseSlug] ?? []
}

/** Whether a lesson is a free preview for any course — used by the lesson gate. */
export function isPreviewLessonId(lessonId: string): boolean {
  return Object.values(PREVIEW_LESSON_IDS).some((ids) => ids.includes(lessonId))
}
