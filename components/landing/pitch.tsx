import React from 'react'

export function Pitch() {
  return (
    <section className="bg-background border-b border-foreground">
      <div className="mx-auto max-w-5xl px-6 py-20 md:px-8 md:py-28 text-center">
        <blockquote className="text-3xl font-extrabold uppercase leading-[1.05] tracking-tight text-foreground md:text-5xl">
          Enso Academy doesn&rsquo;t sell content.
          <br />
          It sells <span className="italic lowercase">readiness</span>.
        </blockquote>
        <p className="mx-auto mt-8 max-w-2xl text-sm leading-relaxed text-foreground/70 md:text-base">
          Most exam prep hands you thousands of pages of secondary guides and dry
          lecture videos, then leaves you to guess whether you are prepared. Enso
          does the opposite: it models your knowledge state, surfaces your blind
          spots, and signs off only when your mock performance says you are ready.
        </p>
      </div>
    </section>
  )
}
