import React from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Single course access',
    blurb: 'Focus on one certification.',
    price: '$199',
    cadence: '/ one-time',
    features: [
      'Full access to your chosen certification prep (6 months)',
      'Personalized Socratic AI lecturer with long-term memory',
      'Full mock exam engine with detailed review',
      'Calibrated readiness signoff',
    ],
  },
  {
    name: 'All-access subscription',
    blurb: 'Every certification, all the time.',
    price: '$39',
    cadence: '/ month',
    features: [
      'All courses included (CDCS, CAMS, CCAS)',
      'Personalized Socratic AI lecturer with long-term memory',
      'Unlimited mock exams and updates',
      'Calibrated readiness signoff for every certification',
    ],
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="bg-background border-b border-foreground">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28">
        <div className="text-center">
          <span className="block text-2xs font-bold uppercase tracking-[0.22em] text-foreground/50">
            Pricing
          </span>
          <h2 className="mt-3 text-2xl font-extrabold uppercase leading-tight tracking-tight text-foreground md:text-4xl">
            Choose your path to readiness.
          </h2>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-8 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="flex flex-col justify-between rounded-2xl border border-foreground bg-background p-8 transition-colors hover:bg-muted"
            >
              <div>
                <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                <p className="mt-1 text-xs text-foreground/55">{plan.blurb}</p>
                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="font-mono text-4xl font-extrabold text-foreground">{plan.price}</span>
                  <span className="text-2xs font-bold uppercase tracking-wider text-foreground/45 font-mono">
                    {plan.cadence}
                  </span>
                </div>
                <ul className="mt-8 space-y-3.5 text-sm text-foreground/75">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-foreground/15">
                <Link
                  href="/signup"
                  className="inline-flex w-full items-center justify-center rounded-full border border-foreground bg-foreground py-3 px-4 text-2xs font-bold uppercase tracking-[0.18em] text-background hover:bg-background hover:text-foreground transition-all"
                >
                  Get started
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-2xs text-foreground/40">
          Pricing shown for planning. Checkout opens at launch.
        </p>
      </div>
    </section>
  )
}
