// Shared beat segmentation.
//
// A "beat" is one viewport-sized chunk of a scene. The beat RENDERER
// (components/lesson/classroom/beat-pager.tsx) and the player's per-beat AUDIO
// queue both segment a scene the same way here — so the on-screen beat and the
// narration clip that plays for it are always the exact same unit, and sync is
// exact by construction (no estimating audio position from progress).
//
// - Reading scenes: the body splits into paragraph beats (each IS its narration).
// - Slide scenes: items page in groups, and the single authored narration is
//   split into one contiguous sentence-chunk per page (so each page gets its
//   own clip). Falls back to a single clip when the narration is too short.

import { splitSentences } from './scenes'

/** Character budget per reading beat — ~3-5 sentences, fits the stage. */
export const READING_BUDGET = 620

/** Items shown per slide beat (page). */
export const SLIDE_ITEMS_PER_BEAT = 4

export type SlideBeat = { from: number; to: number; narration: string }

/**
 * Page a slide's items into beats and assign each page a contiguous chunk of
 * the narration (split by sentences, proportional to the pages). Returns one
 * beat per page; `narration` is '' for a page when the script can't be split
 * that finely (the caller then falls back to a single clip).
 */
export function slideBeats(narration: string, itemCount: number): SlideBeat[] {
  const pages = Math.max(1, Math.ceil(itemCount / SLIDE_ITEMS_PER_BEAT))
  const sents = splitSentences(narration ?? '')
  const beats: SlideBeat[] = []
  for (let p = 0; p < pages; p++) {
    const from = p * SLIDE_ITEMS_PER_BEAT
    const to = Math.min(itemCount, from + SLIDE_ITEMS_PER_BEAT)
    // One narration clip for the whole slide when there's a single page.
    if (pages === 1) {
      beats.push({ from, to, narration: (narration ?? '').trim() })
      continue
    }
    const s0 = Math.floor((p * sents.length) / pages)
    const s1 = Math.floor(((p + 1) * sents.length) / pages)
    beats.push({ from, to, narration: sents.slice(s0, s1).join(' ').trim() })
  }
  return beats
}

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
