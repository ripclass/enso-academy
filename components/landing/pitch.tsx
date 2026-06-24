import React from 'react'

export function Pitch() {
  return (
    <section className="bg-background border-b border-foreground">
      <div className="mx-auto max-w-5xl px-6 py-20 md:px-8 md:py-28 text-center">
        <blockquote className="text-3xl font-extrabold uppercase leading-[1.05] tracking-tight text-foreground md:text-5xl">
          Most courses end when the content does.
          <br />
          Ours ends when you&rsquo;re <span className="italic lowercase">ready</span>.
        </blockquote>
        <p className="mx-auto mt-8 max-w-2xl text-sm leading-relaxed text-foreground/70 md:text-base">
          You learn from the primary regulations and sit full mock exams under real conditions. Then
          you get a straight answer: ready to book the exam, or not yet.
        </p>
      </div>
    </section>
  )
}
