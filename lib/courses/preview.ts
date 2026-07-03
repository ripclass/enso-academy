// Free preview lessons per course.
//
// These lessons are playable by ANY signed-in user without enrollment, so a
// prospect can experience the real classroom (voice, beats, interactives,
// office hours) before buying. Signup is the gate — anonymous visitors are sent
// to sign up first (lead capture for a high-ticket purchase).
//
// Keyed by SLUG, not lesson id: a course re-promote wipes and re-creates
// content with new ids (which silently broke the id-keyed version of this
// config on 2026-06-28 — the sales page hid its preview grid and old preview
// links 404ed), while slugs are stable across promotes.
//
// Kept as a small code config (not a DB flag) while only one course has a
// preview; promote to a `lessons.is_preview` column if multiple courses need
// editable previews.

export const PREVIEW_LESSON_SLUGS: Record<string, string[]> = {
  cams: [
    'what-money-laundering-actually-is', // M1.1 — the opener; has an interactive
    'correspondent-banking-risk', // M6.2 — flow-trace + office hours showcase
  ],
  ccas: [
    'what-cryptoassets-are', // M1.1 — the opener
    'conducting-an-on-chain-investigation', // M3 — the strongest showcase lesson
  ],
}

/** The preview lesson slugs for a course slug (empty if none). */
export function previewLessonSlugs(courseSlug: string): string[] {
  return PREVIEW_LESSON_SLUGS[courseSlug] ?? []
}

/** Whether a lesson is a free preview for any course — used by the lesson gate. */
export function isPreviewLessonSlug(lessonSlug: string): boolean {
  return Object.values(PREVIEW_LESSON_SLUGS).some((slugs) => slugs.includes(lessonSlug))
}
