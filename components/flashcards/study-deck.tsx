'use client'

import { useState, useCallback } from 'react'
import { getStudyDeck } from '@/lib/flashcards/actions'
import type { StudyDeck as Deck } from '@/lib/flashcards/types'
import { DeckOverview } from './deck-overview'
import { StudySession } from './study-session'

/**
 * The flashcards surface: deck overview, and the study session when the student
 * starts. After a session it re-fetches the deck (counts + due move as cards get
 * rescheduled) and returns to the overview.
 */
export function StudyDeck({ courseSlug, initialDeck }: { courseSlug: string; initialDeck: Deck }) {
  const [deck, setDeck] = useState<Deck>(initialDeck)
  const [phase, setPhase] = useState<'overview' | 'study'>('overview')

  const finish = useCallback(async () => {
    try {
      setDeck(await getStudyDeck(courseSlug))
    } catch {
      /* keep the stale deck; the overview still renders */
    }
    setPhase('overview')
  }, [courseSlug])

  if (phase === 'study' && deck.cards.length > 0) {
    return <StudySession courseSlug={courseSlug} cards={deck.cards} onDone={finish} />
  }

  return (
    <DeckOverview
      counts={deck.counts}
      canStart={deck.cards.length > 0}
      onStart={() => deck.cards.length > 0 && setPhase('study')}
    />
  )
}
