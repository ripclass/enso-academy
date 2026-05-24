import React from 'react'

interface LogoProps {
  className?: string
  /** Accepted for backward compatibility; the wordmark is the only mark. */
  variant?: 'mark-only' | 'full'
  size?: number | string
}

/**
 * The Enso Academy wordmark — a minimalist lowercase text mark.
 * Brand identity v2 (ADR 0018).
 */
export function Logo({ className }: LogoProps) {
  return (
    <span
      className={`font-sans text-base font-bold lowercase tracking-[0.18em] text-foreground select-none ${className ?? ''}`}
    >
      enso academy
    </span>
  )
}
