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
  isAuthenticated = true,
}: {
  courseSlug: string
  priceLabel?: string
  included?: string[]
  /** When false (public sales page), the CTA routes to sign-up first. */
  isAuthenticated?: boolean
}) {
  const params = useSearchParams()
  const checkout = params.get('checkout')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function buy() {
    // Anonymous visitor: capture the account first, then return here to buy.
    if (!isAuthenticated) {
      window.location.href = `/signup?next=/courses/${courseSlug}`
      return
    }
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
          Payment received. We’re finalizing your access. This can take a moment;
          refresh this page if the course hasn’t unlocked yet.
        </div>
      )}
      {checkout === 'cancel' && (
        <div className="mb-4 rounded-md border border-neutral-200 bg-muted px-4 py-3 text-sm text-neutral-600">
          Checkout canceled. No charge was made; you can purchase whenever you’re ready.
        </div>
      )}

      <h2 className="text-lg font-bold text-neutral-900">Get full course access</h2>
      <p className="mt-1.5 text-sm text-neutral-600 leading-relaxed">
        One payment, lasting access.{included.length ? ' Everything below is included:' : ' The full course, the AI lecturer and classmate, 5 full exam simulations, and unlimited practice mocks.'}
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
        <span className="flex items-baseline gap-2.5">
          <span className="text-3xl font-bold font-mono text-neutral-900">{priceLabel}</span>
          <span className="text-lg font-mono text-neutral-400 line-through">$399</span>
          <span className="rounded-full bg-accent px-2 py-0.5 text-2xs font-bold uppercase tracking-wider text-white">
            $100 off · limited
          </span>
        </span>
        <button
          onClick={buy}
          disabled={pending}
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
          {pending ? 'Starting checkout…' : isAuthenticated ? 'Get full course access' : 'Sign up to enroll'}
        </button>
        <Link
          href={`/courses/${courseSlug}/mock`}
          className="text-sm font-semibold text-primary hover:underline"
        >
          or try a free simulation first →
        </Link>
      </div>

      <p className="mt-4 text-xs text-neutral-500">
        14-day money-back guarantee, before you have completed 25% of the course or started an exam
        simulation. Secure checkout by Stripe.
      </p>

      {error && <p className="mt-3 text-sm text-accent font-medium">{error}</p>}
    </div>
  )
}
