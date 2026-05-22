import React from 'react'

export function Pitch() {
  return (
    <section className="bg-neutral-50 py-24 md:py-32 border-y border-neutral-200">
      <div className="mx-auto max-w-5xl px-6 md:px-8 text-center">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-accent mb-6">
          Our core philosophy
        </h2>

        {/* Core statement */}
        <blockquote className="text-3xl font-bold tracking-tight text-neutral-900 md:text-5xl lg:text-6xl leading-tight">
          &ldquo;Enso Academy doesn&rsquo;t sell content. <br className="hidden sm:inline" />
          It sells <span className="text-primary italic">readiness</span>.&rdquo;
        </blockquote>

        {/* Supporting statement */}
        <p className="mx-auto mt-8 max-w-3xl text-lg md:text-xl text-neutral-600 leading-relaxed">
          Most exam prep hands you thousands of pages of secondary guides and
          dry lecture videos, then leaves you to guess whether you&rsquo;re
          prepared. Enso does the opposite: it models your knowledge state,
          surfaces your blind spots, and signs off only when your mock
          performance says you are ready. You don&rsquo;t just study &mdash;
          you verify.
        </p>
      </div>
    </section>
  )
}
