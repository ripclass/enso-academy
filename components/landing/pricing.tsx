import React from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'

export function Pricing() {
  return (
    <section id="pricing" className="py-24 md:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-accent mb-4">
            Pricing
          </h2>
          <p className="text-3xl font-bold tracking-tight text-neutral-900 md:text-5xl">
            Flexible options built for your career.
          </p>
          <p className="mt-4 text-lg text-neutral-600">
            Choose the plan that fits your study timeline.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-2">
          {/* Option 1: Per Course */}
          <div className="flex flex-col justify-between rounded-lg border border-neutral-200 bg-white p-8 md:p-10 hover:border-primary/40 hover:shadow-md transition-all">
            <div>
              <h3 className="text-xl font-bold text-neutral-900">Single course access</h3>
              <p className="mt-2 text-sm text-neutral-500">Focus on one certification.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-neutral-900">$199</span>
                <span className="text-sm font-semibold text-neutral-500">/ one-time</span>
              </div>
              <p className="mt-2 text-xs text-neutral-400">Includes 6 months of full access</p>

              <ul className="mt-8 space-y-4 text-sm text-neutral-600">
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Full access to your chosen certification prep</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Personalized AI lecturer with long-term memory</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Full mock exam engine with detailed reviews</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Calibrated readiness signoff</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-100">
              <Link
                href="/signup"
                className="inline-flex w-full items-center justify-center rounded-md bg-neutral-900 py-3 px-4 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors shadow-sm"
              >
                Get started with a single course
              </Link>
            </div>
          </div>

          {/* Option 2: All Access */}
          <div className="relative flex flex-col justify-between rounded-lg border-2 border-primary bg-white p-8 md:p-10 shadow-md">
            <div className="absolute top-0 right-6 -translate-y-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
              Most flexible
            </div>

            <div>
              <h3 className="text-xl font-bold text-neutral-900">All-access subscription</h3>
              <p className="mt-2 text-sm text-neutral-500">Every certification, all the time.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-neutral-900">$39</span>
                <span className="text-sm font-semibold text-neutral-500">/ month</span>
              </div>
              <p className="mt-2 text-xs text-neutral-400">Monthly billing &mdash; cancel anytime</p>

              <ul className="mt-8 space-y-4 text-sm text-neutral-600">
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-semibold text-neutral-900">All courses included (CDCS, CAMS, CCAS)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Personalized AI lecturer with long-term memory</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Unlimited mock exams and updates</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Calibrated readiness signoff for every certification</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-100">
              <Link
                href="/signup"
                className="inline-flex w-full items-center justify-center rounded-md bg-primary py-3 px-4 text-sm font-semibold text-white hover:bg-primary-hover transition-colors shadow-sm"
              >
                Get started with all-access
              </Link>
            </div>
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-neutral-400">
          Pricing shown for planning. Checkout opens at launch.
        </p>
      </div>
    </section>
  )
}
