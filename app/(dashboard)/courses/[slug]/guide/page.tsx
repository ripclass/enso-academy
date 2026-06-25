import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { Logo } from '@/components/brand/logo'
import { BlueprintCoverage } from '@/components/courses/blueprint-coverage'
import { PrintButton } from '@/components/courses/print-button'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  return { title: `${slug.toUpperCase()} Study Guide` }
}

// Curated, durable exam-day discipline. No current-list facts, no em-dashes.
const EXAM_CHECKLIST = [
  'Block out the full exam time without interruption when you sit a full simulation. The clock does not pause.',
  'Read each scenario question twice. The exam tests judgment, so the best answer is usually a close call between two plausible options.',
  'When two answers look right, pick the one that reflects the risk-based approach and the institution’s actual obligation, not the harshest or most literal reading.',
  'Keep clear which source recommends (FATF) and which one requires (national law). The exam separates the global standard from the local statute.',
  'Be able to place every control in the customer lifecycle: onboarding, due diligence, ongoing monitoring, screening, and reporting.',
  'Review the glossary the night before. Most wrong answers come from a term used loosely, not from a gap in reasoning.',
  'Run at least one full simulation under real conditions, and reach the readiness signoff, before exam day.',
]

type GlossaryRow = { term: string; definition: string; short_definition: string | null }
type LessonRow = { id: string; name: string; description: string | null; sort_order: number }
type ModuleRow = {
  id: string
  name: string
  description: string | null
  sort_order: number
  lessons: LessonRow[]
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params
  const admin = createAdminClient()

  const { data: course } = await admin
    .from('courses')
    .select('id, name, short_name, certifying_body, status')
    .eq('slug', slug)
    .single()
  if (!course || course.status !== 'published') notFound()

  const { data: modulesRaw } = await admin
    .from('modules')
    .select(
      'id, name, description, sort_order, lessons (id, name, description, sort_order)',
    )
    .eq('course_id', course.id)
    .order('sort_order')

  const { data: glossaryRaw } = await admin
    .from('glossary')
    .select('term, definition, short_definition')
    .eq('course_id', course.id)
    .order('term')

  const modules = ((modulesRaw as ModuleRow[] | null) ?? []).map((m) => ({
    ...m,
    lessons: [...(m.lessons ?? [])].sort((a, b) => a.sort_order - b.sort_order),
  }))
  const glossary = (glossaryRaw as GlossaryRow[] | null) ?? []
  const totalLessons = modules.reduce((n, m) => n + m.lessons.length, 0)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Site bar (hidden when printing) */}
      <header className="sticky top-0 z-40 border-b border-foreground bg-background/90 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-3">
          <Link href="/" aria-label="Enso Academy home">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <PrintButton className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-foreground/20 bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:border-foreground" />
            <Link
              href={`/courses/${slug}`}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-xs font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Start the course
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12 print:px-0 print:py-0">
        {/* Cover */}
        <section>
          <Link
            href={`/courses/${slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 transition-colors hover:text-primary print:hidden"
          >
            <ArrowLeft className="h-3 w-3" /> Back to course
          </Link>
          <span className="mt-6 block text-2xs font-semibold uppercase tracking-widest text-accent font-mono">
            {course.short_name} Study Guide
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{course.name}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600">
            The map of the exam: every domain it tests, the syllabus in order, and the vocabulary
            you are expected to use precisely. Built from the primary sources the exam itself is
            based on, FATF, the regulators, and real enforcement actions. Read it to see the whole
            shape of the exam; learn each topic in the interactive classroom.
          </p>
          <p className="mt-4 text-2xs font-mono uppercase tracking-wider text-neutral-400">
            Certifying body: {course.certifying_body} &middot; {modules.length} modules &middot;{' '}
            {totalLessons} lessons &middot; {glossary.length} terms
          </p>
          <div className="mt-6 print:hidden">
            <PrintButton />
          </div>
        </section>

        {/* The exam at a glance */}
        <section className="mt-14 border-t border-neutral-200 pt-10 print:mt-8 print:break-before-page">
          <BlueprintCoverage eyebrow="Part 1 · The exam at a glance" title="What the exam tests" />
        </section>

        {/* The syllabus */}
        <section className="mt-14 border-t border-neutral-200 pt-10 print:mt-8 print:break-before-page">
          <span className="text-2xs font-semibold uppercase tracking-widest text-accent font-mono">
            Part 2 &middot; The syllabus
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Every topic, in order</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600">
            The full path through the course. Work it top to bottom, or jump to the area you need.
          </p>

          <div className="mt-8 space-y-8">
            {modules.map((mod, mi) => (
              <div key={mod.id} className="break-inside-avoid">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-2xs font-bold uppercase tracking-wider text-neutral-400">
                    Module {mi + 1}
                  </span>
                  <h3 className="text-lg font-bold">{mod.name}</h3>
                </div>
                {mod.description && (
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-neutral-500">
                    {mod.description}
                  </p>
                )}
                <ol className="mt-3 space-y-2 border-l border-neutral-200 pl-4">
                  {mod.lessons.map((l, li) => (
                    <li key={l.id} className="flex gap-3">
                      <span className="mt-0.5 shrink-0 font-mono text-2xs tabular-nums text-neutral-400">
                        {(li + 1).toString().padStart(2, '0')}
                      </span>
                      <span className="min-w-0">
                        <span className="text-sm font-semibold text-neutral-800">{l.name}</span>
                        {l.description && (
                          <span className="mt-0.5 block text-xs leading-relaxed text-neutral-500">
                            {l.description}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        {/* Glossary */}
        {glossary.length > 0 && (
          <section className="mt-14 border-t border-neutral-200 pt-10 print:mt-8 print:break-before-page">
            <span className="text-2xs font-semibold uppercase tracking-widest text-accent font-mono">
              Part 3 &middot; Glossary
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              The vocabulary, defined
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600">
              The terms the exam expects you to use precisely. Review them the night before.
            </p>
            <dl className="mt-8 gap-x-10 sm:columns-2 [&>div]:break-inside-avoid">
              {glossary.map((g) => (
                <div key={g.term} className="mb-4">
                  <dt className="text-sm font-bold text-foreground">{g.term}</dt>
                  <dd className="mt-0.5 text-xs leading-relaxed text-neutral-600">
                    {g.short_definition || g.definition}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* Before exam day */}
        <section className="mt-14 border-t border-neutral-200 pt-10 print:mt-8 print:break-before-page">
          <span className="text-2xs font-semibold uppercase tracking-widest text-accent font-mono">
            Part 4 &middot; Before exam day
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">How to pass, not just cram</h2>
          <ul className="mt-8 space-y-3">
            {EXAM_CHECKLIST.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm leading-relaxed text-neutral-700">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA (hidden when printing) */}
        <section className="mt-14 rounded-2xl border-2 border-foreground bg-white p-8 text-center print:hidden">
          <h2 className="text-xl font-bold">This is the map. The course is the classroom.</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-neutral-600">
            This guide shows you the whole exam. The course teaches every lesson interactively, with
            a lecturer that adapts to what you know and a faithful simulation that tells you when you
            are ready.
          </p>
          <Link
            href={`/courses/${slug}`}
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            Start the course <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <p className="mt-10 text-2xs leading-relaxed text-neutral-400">
          Enso Academy is independent and is not affiliated with, authorised by, or endorsed by the
          certifying body. This guide is original material built from primary and public sources.
        </p>
      </main>
    </div>
  )
}
