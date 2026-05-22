'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'What is Enso Academy?',
    answer:
      'An AI-powered preparation platform for professional certification exams in compliance and finance.',
  },
  {
    question: 'How is it different from other exam-prep courses?',
    answer:
      'It tracks what you actually know and adapts to it, it remembers you across sessions, and it tells you — conservatively — when you’re genuinely ready for the real exam.',
  },
  {
    question: 'What does it cost?',
    answer:
      '$199 per course with six months of access, or $39 per month for all-access.',
  },
  {
    question: 'Which certifications do you cover?',
    answer: 'CAMS, CDCS, and CCAS at launch, with more in development.',
  },
  {
    question: 'Where does the content come from?',
    answer:
      'It is generated from primary regulatory sources — never from third-party study guides — so you learn the underlying reasoning.',
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-24 md:py-32 bg-neutral-50 border-t border-neutral-200">
      <div className="mx-auto max-w-4xl px-6 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-accent mb-4">
            FAQ
          </h2>
          <p className="text-3xl font-bold tracking-tight text-neutral-900 md:text-5xl">
            Frequently asked questions
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={faq.question}
                className="rounded-lg border border-neutral-200 bg-white overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between p-6 text-left font-bold text-neutral-900 hover:text-primary transition-colors focus:outline-none"
                >
                  <span className="text-lg">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-neutral-500 transition-transform duration-300 shrink-0 ${
                      isOpen ? 'rotate-180 text-primary' : ''
                    }`}
                  />
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-48 border-t border-neutral-100' : 'max-h-0'
                  } overflow-hidden`}
                >
                  <p className="p-6 text-sm text-neutral-600 leading-relaxed bg-neutral-50/50">
                    {faq.answer}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
