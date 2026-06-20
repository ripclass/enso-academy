'use client'

import { useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { createCourseCheckout } from '@/lib/stripe/checkout'

/**
 * Purchase call-to-action shown to a signed-in user who does not yet own the
 * course. The button calls a server action that creates a Stripe Checkout
 * Session (amount set SERVER-SIDE) and returns its URL, then redirects to
 * Stripe. On return, ?checkout=success|cancel is reflected to the user (the
 * webhook fulfils access asynchronously, so success may need a moment).
 */
export function CoursePurchase({
  courseSlug,
  priceLabel = '$299',
  included = [],
}: {
  courseSlug: string
  priceLabel?: string
  included?: string[]
}) {
  const params = useSearchParams()
  const checkout = params.get('checkout')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function buy() {
    setError(null)
    startTransition(async () => {
      try {
        const { url } = await createCourseCheckout(courseSlug)
        window.location.href = url
      } catch {
        setError('Could not start checkout. Please try again.')
      }
    })
  }

  return (
    <div className="rounded-lg border-2 border-neutral-900 bg-white p-6">
      {checkout === 'success' && (
        <div className="mb-4 rounded-md border border-primary/30 bg-primary-light/40 px-4 py-3 text-sm text-neutral-800">
          Payment received — we’re finalizing your access. This can take a moment;
          refresh this page if the course hasn’t unlocked yet.
        </div>
      )}
      {checkout === 'cancel' && (
        <div className="mb-4 rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
          Checkout canceled — no charge was made. You can purchase whenever you’re ready.
        </div>
      )}

      <h2 className="text-lg font-bold text-neutral-900">Get full course access</h2>
      <p className="mt-1.5 text-sm text-neutral-600 leading-relaxed">
        One-time purchase. Lifetime access to the full course, the AI lecturer and classmate,
        and {included.length ? '' : '5 '}mock exam attempts included.
      </p>

      {included.length > 0 && (
        <ul className="mt-4 space-y-2">
          {included.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-neutral-700">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <span className="text-3xl font-bold font-mono text-neutral-900">{priceLabel}</span>
        <button
          onClick={buy}
          disabled={pending}
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
          {pending ? 'Starting checkout…' : 'Get full course access'}
        </button>
        <Link
          href={`/courses/${courseSlug}/mock`}
          className="text-sm font-semibold text-primary hover:underline"
        >
          or try a free mock first →
        </Link>
      </div>

      {error && <p className="mt-3 text-sm text-accent font-medium">{error}</p>}
    </div>
  )
}
