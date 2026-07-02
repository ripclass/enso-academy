'use client'

import { useEffect, useState } from 'react'
import { shuffle } from '@/components/lesson/challenge/conceptual/shuffle'

/**
 * Randomise the display order of a fixed list without a hydration mismatch.
 *
 * Unlike the challenge widgets (which mount only after an async client load, so
 * a bare `useMemo(shuffle)` is safe there), in-lesson scenes can be
 * server-rendered: the player resumes a student on their last scene via
 * `initialSceneIndex`, which may be a quiz or interactive. A shuffle during
 * render would therefore diverge between server and client.
 *
 * So this returns the list in SOURCE order for SSR and the first client paint
 * (matching HTML, no mismatch), then swaps in a fresh shuffle after mount. The
 * consumer remounts when the student navigates to the scene or retakes it, so
 * each attempt gets a new order. Scoring keys on the item id, never position,
 * so reordering the display is safe.
 */
export function useShuffled<T>(items: readonly T[]): T[] {
  const [order, setOrder] = useState<T[]>(() => items.slice())
  useEffect(() => {
    setOrder(shuffle(items))
    // Reshuffle when the underlying list identity changes (a new scene / attempt).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])
  return order
}
