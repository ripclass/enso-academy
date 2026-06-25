import Link from 'next/link'
import { Check, BookOpen } from 'lucide-react'
import { CAMS_BLUEPRINT, BLUEPRINT_TOTALS, BLUEPRINT_NOTE } from '@/lib/courses/blueprint'

/**
 * The exam-coverage map: every CAMS knowledge domain shown against the modules
 * that teach it. The candidate's "does this cover everything I'm tested on?"
 * answered visibly — mapped to the exam's own blueprint, built from primary
 * sources. `heading` lets the host page set the eyebrow/title tone.
 */
export function BlueprintCoverage({
  eyebrow = 'Exam coverage',
  title = 'Mapped to the full CAMS exam blueprint',
  guideHref,
}: {
  eyebrow?: string
  title?: string
  /** When set, shows a "read the full study guide" link below the heading. */
  guideHref?: string
}) {
  return (
    <div>
      <span className="text-2xs font-semibold uppercase tracking-widest text-accent font-mono">
        {eyebrow}
      </span>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base">
        Every domain the CAMS exam tests, taught from the primary sources the exam itself is built
        on: FATF, the regulators, and real enforcement actions. Not a rehash of a third-party study
        guide.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-2xs uppercase tracking-wider text-neutral-500">
        <span className="font-bold text-primary">{BLUEPRINT_TOTALS.domains} domains</span>
        <span aria-hidden>·</span>
        <span>{BLUEPRINT_TOTALS.modules} modules</span>
        <span aria-hidden>·</span>
        <span>{BLUEPRINT_TOTALS.lessons} lessons</span>
        <span aria-hidden>·</span>
        <span className="font-bold text-primary">100% coverage</span>
      </div>

      {guideHref && (
        <Link
          href={guideHref}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
        >
          <BookOpen className="h-4 w-4" /> Read the free study guide
        </Link>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {CAMS_BLUEPRINT.map((d) => (
          <div
            key={d.id}
            className="flex flex-col rounded-lg border border-neutral-200 bg-white p-5"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary font-mono text-sm font-bold text-white">
                {d.id}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold leading-snug text-foreground">{d.name}</h3>
                {d.weight && (
                  <span className="mt-0.5 block font-mono text-2xs uppercase tracking-wider text-neutral-400">
                    {d.weight} of the exam
                  </span>
                )}
              </div>
              <span
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-light px-2 py-0.5 font-mono text-2xs font-semibold uppercase tracking-wider text-primary"
                title="Fully covered"
              >
                <Check className="h-3 w-3" /> Covered
              </span>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-neutral-600">{d.summary}</p>

            <ul className="mt-4 space-y-1.5 border-t border-neutral-100 pt-3">
              {d.modules.map((m) => (
                <li key={m.name} className="flex items-baseline justify-between gap-3 text-xs">
                  <span className="min-w-0 text-neutral-800">{m.name}</span>
                  <span className="shrink-0 font-mono text-2xs tabular-nums text-neutral-400">
                    {m.lessons} {m.lessons === 1 ? 'lesson' : 'lessons'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-6 max-w-3xl text-2xs leading-relaxed text-neutral-400">{BLUEPRINT_NOTE}</p>
    </div>
  )
}
