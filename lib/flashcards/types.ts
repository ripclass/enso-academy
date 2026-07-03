// Shared flashcard types. Kept out of actions.ts because that is a 'use server'
// module, which may only export async functions (a non-async export breaks the
// production build).

export type FlashCard = {
  glossaryId: string
  term: string
  definition: string
  /** Current Leitner box, or null for a card the student has not seen yet. */
  box: number | null
}

export type StudyDeck = {
  /** Due cards first, then a capped batch of new cards. */
  cards: FlashCard[]
  counts: { due: number; learned: number; total: number }
}
