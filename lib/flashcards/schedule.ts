// Pure Leitner scheduler for the flashcard deck. No I/O, so it is unit tested
// directly (schedule.test.ts). A card has a box (1..5); the box sets the next
// interval. Rating moves the box: again resets to 1, good climbs one, easy two.
// A new card (no prior box) is treated as box 1 for its first rating.

export type Rating = 'again' | 'good' | 'easy'
export const RATINGS: readonly Rating[] = ['again', 'good', 'easy']

/** A card is "learned" once it reaches this box (>= 7-day interval). */
export const LEARNED_BOX = 4
const MAX_BOX = 5
const DAY_MS = 86_400_000

/** Interval, in days, applied when a card lands in each box. Box 1 is due now. */
const INTERVAL_DAYS: Record<number, number> = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 21 }

function resolveBox(prevBox: number | null, rating: Rating): number {
  const base = prevBox ?? 1 // new card enters at box 1
  if (rating === 'again') return 1
  if (rating === 'good') return Math.min(base + 1, MAX_BOX)
  return Math.min(base + 2, MAX_BOX) // easy
}

/** The card's next box + due time after a rating. */
export function nextState(
  prevBox: number | null,
  rating: Rating,
  now: Date,
): { box: number; dueAt: Date } {
  const box = resolveBox(prevBox, rating)
  const days = INTERVAL_DAYS[box] ?? 0
  return { box, dueAt: new Date(now.getTime() + days * DAY_MS) }
}

/** Short label for the interval a given rating would produce (for the buttons). */
export function intervalHint(prevBox: number | null, rating: Rating): string {
  if (rating === 'again') return '<1d'
  const days = INTERVAL_DAYS[resolveBox(prevBox, rating)] ?? 0
  return days === 0 ? '<1d' : `+${days}d`
}
