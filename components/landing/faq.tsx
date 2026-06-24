'use client'

import React, { useState } from 'react'
import { Plus } from 'lucide-react'

const faqs = [
  {
    question: 'What is Enso Academy?',
    answer:
      'An AI classroom for compliance and finance exam prep. You learn from the primary regulations themselves, not third-party study guides.',
  },
  {
    question: 'How is it different from other exam-prep courses?',
    answer:
      'It adapts to what you don’t know yet instead of replaying a fixed script, and it remembers you between sessions. It tells you you’re ready only when your mock scores clear a bar set stricter than the real exam.',
  },
  {
    question: 'What does it cost?',
    answer:
      'Pricing is set per course, and you’ll see it on each course’s page. Anyone can also sit a single exam simulation for $14.99, and the first one is free.',
  },
  {
    question: 'Which certifications do you cover?',
    answer: 'CAMS is available now. CDCS and CCAS are in development.',
  },
  {
    question: 'Where does the content come from?',
    answer:
      'From the primary regulations and public enforcement records, not third-party study guides. You learn the reasoning behind the rules, not only what they say.',
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="bg-background border-b border-foreground">
      <div className="mx-auto max-w-3xl px-6 py-20 md:px-8 md:py-28">
        <span className="block text-2xs font-bold uppercase tracking-[0.22em] text-foreground/50">
          FAQ
        </span>
        <h2 className="mt-3 text-2xl font-extrabold uppercase leading-tight tracking-tight text-foreground md:text-4xl">
          Frequently asked questions.
        </h2>

        <div className="mt-10 border-t border-foreground">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div key={faq.question} className="border-b border-foreground">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 py-5 text-left"
                >
                  <span className="text-base font-bold text-foreground md:text-lg">
                    {faq.question}
                  </span>
                  <Plus
                    className={`h-5 w-5 shrink-0 text-foreground transition-transform duration-300 ${
                      isOpen ? 'rotate-45' : ''
                    }`}
                  />
                </button>
                <div
                  className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="min-h-0">
                    <p className="max-w-2xl pb-6 text-sm leading-relaxed text-foreground/70">
                      {faq.answer}
                    </p>
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
