import React from 'react'

interface MascotProps extends React.SVGProps<SVGSVGElement> {
  variant?: 'default' | 'thinking' | 'welcoming'
  size?: number | string
}

/**
 * The Enso Guide — the brand mascot. The ensō ring itself, given a calm,
 * meditative gaze. Derived from the brand mark; built from simple separable
 * SVG paths so it can be animated later (breathing, blink, stroke rotation).
 * Brand identity v2 (ADR 0018). This is a brand/lecturer visual anchor — it
 * is NOT the per-course classmate character.
 */
export function Mascot({ variant = 'default', size = 120, className, ...props }: MascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-primary transition-all duration-500 ${className || ''}`}
      role="img"
      aria-label="Enso Guide"
      {...props}
    >
      {/* Outer open Enso ring (the character body) */}
      <path
        id="enso-body"
        d="M 50 12 C 71 12 88 29 88 50 C 88 71 71 88 50 88 C 29 88 12 71 12 50 C 12 32 25 17 42 13"
        stroke="currentColor"
        strokeWidth="11"
        strokeLinecap="round"
        strokeDasharray="240"
        strokeDashoffset="10"
      />

      {/* Subtle inner background space */}
      <circle cx="50" cy="50" r="30" className="fill-neutral-50/40" />

      {/* Serene Zen-like gaze (Lottie-friendly, simple path elements) */}
      <g id="gaze" className="text-accent">
        {variant === 'default' && (
          <>
            {/* Serene horizontal slits representing deep focus */}
            <path
              id="eye-left"
              d="M 37 50 L 45 50"
              stroke="currentColor"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <path
              id="eye-right"
              d="M 55 50 L 63 50"
              stroke="currentColor"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          </>
        )}
        {variant === 'thinking' && (
          <>
            {/* One slit is angled to suggest contemplation */}
            <path
              id="eye-left"
              d="M 37 48 L 45 52"
              stroke="currentColor"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <path
              id="eye-right"
              d="M 55 50 L 63 50"
              stroke="currentColor"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          </>
        )}
        {variant === 'welcoming' && (
          <>
            {/* Upward curved arcs representing a warm presence */}
            <path
              id="eye-left"
              d="M 36 51 C 36 51 40 46 44 51"
              stroke="currentColor"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              id="eye-right"
              d="M 56 51 C 56 51 60 46 64 51"
              stroke="currentColor"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
          </>
        )}
      </g>
    </svg>
  )
}
