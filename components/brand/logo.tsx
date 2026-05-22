import React from 'react'

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  variant?: 'mark-only' | 'full'
  size?: number | string
}

/**
 * The Enso Academy brand mark — an open single-stroke ensō ring with an
 * accent core. Brand identity v2 (ADR 0018).
 */
export function Logo({ variant = 'full', size = 32, className, ...props }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 select-none ${className || ''}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary transition-transform hover:rotate-12 duration-500 ease-out"
        aria-hidden="true"
        {...props}
      >
        {/* Modern, geometric open Enso ring */}
        <path
          d="M 50 12 C 71 12 88 29 88 50 C 88 71 71 88 50 88 C 29 88 12 71 12 50 C 12 32 25 17 42 13"
          stroke="currentColor"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray="240"
          strokeDashoffset="10"
        />
        {/* Inner core accent dot */}
        <circle cx="50" cy="50" r="6" className="fill-accent" />
      </svg>
      {variant === 'full' && (
        <span className="wordmark text-xl font-medium tracking-tight text-foreground font-sans">
          Enso<span className="text-accent font-semibold ml-0.5">.</span>Academy
        </span>
      )}
    </div>
  )
}
