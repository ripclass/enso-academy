'use client'

import { useState, useTransition } from 'react'
import { createCourseCheckout, createMockCheckout } from '@/lib/stripe/checkout'

/**
 * Buy options shown when the student has 0 mock attempts left. Each button calls
 * a server action that creates a Stripe Checkout Session (amount set SERVER-SIDE)
 * and returns its URL, then redirects the browser to Stripe.
 */
export function BuyButtons({ courseSlug }: { courseSlug: string }) {
  const [pending, startTransition] = useTransition()
  const [which, setWhich] = useState<'mock' | 'course' | null>(null)
  const [error, setError] = useState<string | null>(null)

  function go(kind: 'mock' | 'course') {
    setError(null)
    setWhich(kind)
    startTransition(async () => {
      try {
        const { url } =
          kind === 'mock'
            ? await createMockCheckout(courseSlug)
            : await createCourseCheckout(courseSlug)
        window.location.href = url
      } catch {
        setError('Could not start checkout. Please try again.')
        setWhich(null)
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-6 flex flex-col">
          <h3 className="font-bold text-neutral-900">Single exam simulation</h3>
          <p className="mt-1 text-sm text-neutral-600 leading-relaxed flex-1">
            One full 3.5-hour, 120-question exam simulation under real exam conditions. No course
            purchase required.
          </p>
          <p className="mt-3 text-2xl font-bold font-mono text-neutral-900">$14.99</p>
          <button
            onClick={() => go('mock')}
            disabled={pending}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-md border border-primary px-5 text-sm font-semibold text-primary hover:bg-primary-light transition-colors disabled:opacity-50"
          >
            {pending && which === 'mock' ? 'Starting…' : 'Buy a single simulation'}
          </button>
        </div>

        <div className="rounded-lg border border-primary/30 bg-primary-light/40 p-6 flex flex-col">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-neutral-900">Full course access</h3>
            <span className="rounded-full bg-accent px-2 py-0.5 text-2xs font-bold uppercase tracking-wider text-white">
              $100 off
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-600 leading-relaxed flex-1">
            The complete course, plus 5 full exam simulations and unlimited practice mocks. The best
            value if you are studying for the exam.
          </p>
          <p className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-neutral-900">$299</span>
            <span className="text-sm font-mono text-neutral-400 line-through">$399</span>
            <span className="text-2xs font-semibold uppercase tracking-wider text-accent">limited</span>
          </p>
          <button
            onClick={() => go('course')}
            disabled={pending}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {pending && which === 'course' ? 'Starting…' : 'Get full course access'}
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-accent font-medium">{error}</p>}
    </div>
  )
}
