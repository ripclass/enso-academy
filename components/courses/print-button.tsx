'use client'

import { Printer } from 'lucide-react'

/**
 * Prints the current page. With the guide's print styles, the browser's
 * "Save as PDF" turns the study guide into a clean downloadable PDF, no PDF
 * library needed.
 */
export function PrintButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={
        className ??
        'inline-flex h-10 items-center justify-center gap-2 rounded-md border border-foreground bg-background px-5 text-sm font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background'
      }
    >
      <Printer className="h-4 w-4" /> Print / Save as PDF
    </button>
  )
}
