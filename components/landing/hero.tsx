import React from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle } from 'lucide-react'
import { Mascot } from '@/components/brand/mascot'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white py-20 lg:py-32">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-[-10%] h-[300px] w-[300px] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute right-[-5%] bottom-10 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl" />

      {/* Structural grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 md:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Copy & Actions */}
          <div className="text-left lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-8">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              The science of readiness
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight text-neutral-900 md:text-6xl lg:text-7xl leading-[1.1] font-sans">
              Know you&rsquo;re ready <br />
              &mdash;{' '}
              <span className="relative inline-block text-primary">
                before exam day
                <span className="absolute bottom-1 left-0 h-2 w-full bg-accent/20 -z-10 rounded-full" />
              </span>.
            </h1>

            <p className="mt-8 max-w-2xl text-lg md:text-xl text-neutral-600 leading-relaxed font-sans">
              Enso Academy prepares compliance and finance professionals for
              career-critical certifications. We build a live model of what you
              know, close your gaps, and sign off only when your mock
              performance shows you&rsquo;re ready.
            </p>

            <div className="mt-10 flex flex-col items-stretch justify-start gap-4 sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className="group inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-base font-semibold text-white transition-all hover:bg-primary-hover shadow-md hover:shadow-lg text-center"
              >
                Get started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#courses"
                className="inline-flex h-12 items-center justify-center rounded-md border border-neutral-200 bg-white px-8 text-base font-semibold text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors text-center"
              >
                Explore courses
              </Link>
            </div>

            {/* Quick value indicators */}
            <div className="mt-12 flex flex-wrap gap-x-6 gap-y-3 text-sm text-neutral-500 font-medium border-t border-neutral-100 pt-6">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" /> Calibrated readiness signoff
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" /> Primary sources only
              </span>
            </div>
          </div>

          {/* Right Column: Mascot as AI Lecturer panel (an illustrative product preview) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[400px] rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl duration-300">
              {/* Subtle top decoration */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />

              <div className="flex flex-col items-center text-center">
                {/* Mascot container with float animation */}
                <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-neutral-50 border border-neutral-100 p-2 animate-[float_6s_ease-in-out_infinite]">
                  <Mascot variant="welcoming" size={100} />
                </div>

                <h2 className="mt-6 text-lg font-bold text-neutral-900">Your AI lecturer</h2>
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Enso Guide</span>

                {/* Illustrative message preview */}
                <div className="mt-6 w-full rounded-lg bg-neutral-50 p-4 border border-neutral-100 text-left">
                  <p className="text-sm text-neutral-700 leading-relaxed font-sans">
                    &ldquo;Welcome back. Your last mock flagged sanctions
                    screening as a weak spot &mdash; let&rsquo;s close that gap
                    before we move on.&rdquo;
                  </p>
                </div>

                {/* Illustrative interface tags */}
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <span className="rounded bg-primary-light px-2 py-1 text-2xs font-semibold text-primary">Knowledge model</span>
                  <span className="rounded bg-accent-light px-2 py-1 text-2xs font-semibold text-accent">Readiness tracked</span>
                </div>

                <p className="mt-4 text-2xs text-neutral-400 uppercase tracking-wider">Illustrative preview</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
