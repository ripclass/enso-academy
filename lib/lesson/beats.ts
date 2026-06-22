// Shared reading-beat segmentation.
//
// A "beat" is one viewport-sized chunk of a reading scene. The beat RENDERER
// (components/lesson/classroom/beat-pager.tsx) and the player's per-beat AUDIO
// queue both segment the body the same way here — so the on-screen beat and the
// narration clip that plays for it are always the exact same unit of text, and
// sync is exact by construction (no estimating audio position from progress).

/** Character budget per reading beat — ~3-5 sentences, fits the stage. */
export const READING_BUDGET = 620

/** Group markdown blocks (split on blank lines) into beats under a char budget. */
export function readingBeats(body: string): string[] {
  const blocks = body
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)
  if (blocks.length === 0) return body.trim() ? [body.trim()] : []
  const beats: string[] = []
  let cur = ''
  for (const block of blocks) {
    const candidate = cur ? `${cur}\n\n${block}` : block
    // A single block longer than the budget gets its own beat.
    if (cur && candidate.length > READING_BUDGET) {
      beats.push(cur)
      cur = block
    } else {
      cur = candidate
    }
  }
  if (cur) beats.push(cur)
  return beats
}
