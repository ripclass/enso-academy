'use client'

import { useMemo } from 'react'
import { createAvatar } from '@dicebear/core'
import { personas } from '@dicebear/collection'

/**
 * A deterministic character avatar (DiceBear "personas" — clean, diverse,
 * offline, free). Same `seed` always yields the same face, so the lecturer,
 * each classmate, and the student get a stable identity. When Higgsfield
 * portraits are unparked, this is the single place to swap the source.
 */
export function Avatar({
  seed,
  size = 40,
  bg,
  className,
}: {
  seed: string
  size?: number
  /** Optional fixed background hex(es) (no '#'); defaults to a pastel set. */
  bg?: string[]
  className?: string
}) {
  const uri = useMemo(
    () =>
      createAvatar(personas, {
        seed,
        size,
        radius: 50,
        backgroundColor: bg ?? ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf', 'c7f9cc'],
      }).toDataUri(),
    [seed, size, bg],
  )
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={uri} width={size} height={size} alt="" aria-hidden className={className} />
  )
}
