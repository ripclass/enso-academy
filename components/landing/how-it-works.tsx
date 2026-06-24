'use client'

import React, { useState } from 'react'
import { Plus } from 'lucide-react'

const capabilities = [
  {
    num: '01',
    word: 'MODELING',
    description:
      'Every question you answer updates a model of what you know, concept by concept. The lecturer teaches to your weak spots instead of reading from a fixed script.',
  },
  {
    num: '02',
    word: 'MEMORY',
    description:
      'Come back after a week and the lecturer picks up where you left off — your goal, what you struggled with, the pace that worked.',
  },
  {
    num: '03',
    word: 'GAPS',
    description:
      'An AI classmate sits in and asks the questions you’d have skipped, so a gap turns up here instead of on the exam.',
  },
  {
    num: '04',
    word: 'MOCKS',
    description:
      'Same question count, same time limit, same pressure. The timer doesn’t pause, so you learn to manage the clock before you sit the real thing.',
  },
  {
    num: '05',
    word: 'SIGNOFF',
    description:
      'Enso tells you when you’re ready, on a bar set stricter than the real exam. It would rather send you back for one more week than let you walk in and fail.',
  },
  {
    num: '06',
    word: 'SOURCES',
    description:
      'Every lesson comes from primary regulatory material — FATF, Basel, Wolfsberg, OFAC — not competitor study guides. You learn the reasoning behind the rules, not only what they say.',
  },
]

export function HowItWorks() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  return (
    <section id="features" className="bg-background border-b border-foreground">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28">
        
        {/* Section Header */}
        <span className="mb-10 block text-xs font-bold uppercase tracking-[0.2em] text-foreground/60 font-sans">
          HOW WE WORK
        </span>

        {/* Stacked Cards (Matches reference folder-tab layout exactly) */}
        <div className="flex flex-col select-none">
          {capabilities.map((item, idx) => {
            const isExpanded = activeIdx === idx
            return (
              <div
                key={item.num}
                onClick={() => setActiveIdx(activeIdx === idx ? null : idx)}
                aria-expanded={isExpanded}
                style={{
                  marginTop: idx > 0 ? '-1px' : '0px',
                  zIndex: idx + 10,
                }}
                className="border-t border-x border-foreground last:border-b rounded-t-[32px] last:rounded-b-[32px] bg-background relative transition-all duration-300 ease-out cursor-pointer"
              >
                <div className="px-6 md:px-8 pt-4 pb-4">
                  {/* Header row (the click target) */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-baseline gap-4 md:gap-6">
                      <span className="font-mono text-xs font-bold text-accent shrink-0">
                        {item.num}.
                      </span>
                      <span className="text-4xl md:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-foreground font-sans leading-none">
                        {item.word}
                      </span>
                    </div>
                    <Plus
                      className={`h-6 w-6 shrink-0 text-foreground/55 transition-transform duration-300 ${
                        isExpanded ? 'rotate-45' : ''
                      }`}
                    />
                  </div>

                  {/* Drawer: full-width paragraph, opens below the title */}
                  <div
                    className={`grid transition-all duration-500 ease-in-out ${
                      isExpanded ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-3xl pb-1 text-sm md:text-base leading-relaxed text-foreground/75 font-sans">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}


