import React from 'react'
import Image from 'next/image'

export function Hero() {
  return (
    <section className="bg-background border-b border-foreground">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24">
        
        {/* Editorial Title & Supporting Text Block (Matches reference layout) */}
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start mb-12">
          
          {/* Big Bold All-Caps Headline */}
          <h1 className="lg:col-span-8 text-5xl font-extrabold uppercase leading-[0.9] tracking-tight text-foreground md:text-7xl lg:text-[5.5rem] xl:text-[6.5rem] font-sans">
            KNOW YOU'RE READY
            <br />
            — BEFORE EXAM DAY.
          </h1>

          {/* Two-Column Small Supporting Text */}
          <div className="lg:col-span-4 grid gap-6 sm:grid-cols-2 text-xs font-semibold text-foreground/80 leading-relaxed font-sans mt-2">
            <p>
              Enso Academy prepares compliance and finance professionals for the CAMS, CDCS, and CCAS exams.
            </p>
            <p>
              The lecturer adapts to what you know. You sit full mock exams, and we tell you when you&rsquo;re ready.
            </p>
          </div>
        </div>

        {/* Wide Grayscale Editorial Photograph */}
        <div className="relative mt-6 aspect-[21/9] w-full overflow-hidden rounded-2xl border border-foreground bg-muted shadow-sm">
          <Image
            src="/study_environment.png"
            alt="Professional study environment"
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1216px"
            className="object-cover filter grayscale hover:grayscale-0 transition-all duration-700"
          />
        </div>

      </div>
    </section>
  )
}

