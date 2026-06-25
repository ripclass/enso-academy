import Image from 'next/image'

interface LogoProps {
  className?: string
  /** `full` (default) is the mark plus the wordmark; `mark-only` is just the e. */
  variant?: 'mark-only' | 'full'
  /** Accepted for backward compatibility; ignored. */
  size?: number | string
}

/**
 * The Enso Academy logo. `full` (default) is the e mark plus the ensoacademy.ai
 * wordmark; `mark-only` is just the e mark. Source PNGs (cream background removed,
 * mark and wordmark split out) live in /public/brand. Every placement sits on a
 * light surface, so the charcoal wordmark stays legible.
 */
export function Logo({ className, variant = 'full' }: LogoProps) {
  const markOnly = variant === 'mark-only'
  return (
    <Image
      src={markOnly ? '/brand/enso-mark.png' : '/brand/enso-logo.png'}
      alt="Enso Academy"
      width={markOnly ? 249 : 1499}
      height={240}
      className={`w-auto select-none ${markOnly ? 'h-8' : 'h-7'} ${className ?? ''}`}
    />
  )
}
