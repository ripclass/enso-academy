import React from 'react'

export function Pitch() {
  return (
    <section className="bg-background border-b border-foreground">
      <div className="mx-auto max-w-5xl px-6 py-20 md:px-8 md:py-28 text-center">
        <blockquote className="text-3xl font-extrabold uppercase leading-[1.05] tracking-tight text-foreground md:text-5xl">
          You don&rsquo;t need more content.
          <br />
          You need to know you&rsquo;re <span className="italic lowercase">ready</span>.
        </blockquote>
        <p className="mx-auto mt-8 max-w-2xl text-sm leading-relaxed text-foreground/70 md:text-base">
          Most exam prep buries you in secondary guides and lecture videos, then leaves you
          guessing on exam day. Enso works the other way round: it tracks what you know, shows you
          where you&rsquo;re weak, and only calls you ready when your mock scores say so.
        </p>
      </div>
    </section>
  )
}
