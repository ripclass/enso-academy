'use client'

import { UserRound } from 'lucide-react'

/**
 * A character avatar — a hand-drawn line-art portrait (generated, stored under
 * /public/avatars). Classmate seeds (the cast names) map to their portrait
 * automatically; the lecturer and the student pass an explicit `src`. Unknown
 * seeds fall back to a neutral glyph.
 */

const SEED_IMAGES: Record<string, string> = {
  priya: '/avatars/priya.webp',
  marcus: '/avatars/marcus.webp',
  aisha: '/avatars/aisha.webp',
  daniel: '/avatars/daniel.webp',
  lena: '/avatars/lena.webp',
  omar: '/avatars/omar.webp',
}

export function Avatar({
  seed,
  src,
  size = 40,
  className,
}: {
  seed?: string
  /** Explicit image path; overrides the seed lookup. */
  src?: string
  size?: number
  className?: string
}) {
  const img = src ?? (seed ? SEED_IMAGES[seed.toLowerCase()] : undefined)
  if (img) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={img}
        width={size}
        height={size}
        alt=""
        aria-hidden
        className={`h-full w-full bg-white object-cover ${className ?? ''}`}
      />
    )
  }
  return (
    <span
      className="flex items-center justify-center bg-neutral-100 text-neutral-400"
      style={{ width: size, height: size }}
    >
      <UserRound style={{ width: size * 0.55, height: size * 0.55 }} strokeWidth={1.75} />
    </span>
  )
}
