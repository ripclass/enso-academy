import React from 'react'
import { UserCheck, Clock, HelpCircle, FileText, CheckCircle2, Bookmark } from 'lucide-react'

const capabilities = [
  {
    icon: UserCheck,
    title: 'A tutor that actually knows you',
    description:
      'Enso builds a live model of what you know, concept by concept, from every question you answer — and the AI lecturer adapts to your gaps instead of replaying a script.',
  },
  {
    icon: Clock,
    title: 'It remembers you',
    description:
      'Come back after a week and the lecturer picks up where you left off — your goal, what you struggled with, the pace that worked.',
  },
  {
    icon: HelpCircle,
    title: 'A classmate that catches your blind spots',
    description:
      'A consistent AI study companion raises its hand and asks the question you didn’t know you needed answered.',
  },
  {
    icon: FileText,
    title: 'Mock exams that feel like the real thing',
    description:
      'Same question count, same time limit, same pressure. The timer doesn’t pause — you learn to manage the clock before exam day, not during it.',
  },
  {
    icon: CheckCircle2,
    title: 'A signoff you can trust',
    description:
      'Enso tells you when you’re genuinely ready, on a bar set deliberately stricter than the real exam. It would rather tell you to study one more week than let you walk in and fail.',
  },
  {
    icon: Bookmark,
    title: 'Built from the source',
    description:
      'Every lesson is generated from primary regulatory material — FATF, Basel, Wolfsberg, OFAC — never from competitor study guides. You learn the actual reasoning.',
  },
]

export function HowItWorks() {
  return (
    <section id="features" className="py-24 md:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="max-w-3xl">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-accent mb-4">
            How it works
          </h2>
          <p className="text-3xl font-bold tracking-tight text-neutral-900 md:text-5xl">
            Built for professionals who cannot afford to waste time.
          </p>
          <p className="mt-4 text-lg text-neutral-600">
            A study platform engineered around active retrieval, precision feedback, and empirical readiness.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="group relative rounded-lg border border-neutral-200 bg-white p-8 transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-neutral-100 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-neutral-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
