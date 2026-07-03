import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { AppHeader } from '@/components/in-app/app-header'
import { ensureBaselineEntitlement, getMockEntitlement } from '@/lib/stripe/entitlements'
import { BuyButtons } from './buy-buttons'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ checkout?: string }>
}

export const metadata = { title: 'Exam simulations & practice' }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isPracticeTemplate(t: any): boolean {
  return (t?.selection_criteria as any)?.kind === 'mock'
}

export default async function MockLaunchPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { checkout } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/courses/${slug}/mock`)

  const admin = createAdminClient()

  const { data: course } = await admin
    .from('courses')
    .select('id, slug, name, short_name')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  if (!course) notFound()

  // Simulation attempts are entitlement-gated (1 free taste, then purchased /
  // course-included). Practice mocks are free + unlimited, but only for owners.
  await ensureBaselineEntitlement(user.id, course.id)
  const entitlement = await getMockEntitlement(user.id, course.id)
  const remaining = entitlement.remaining
  const onFreeTaste = entitlement.purchasedTotal === 0 && entitlement.includedTotal <= 1

  const { data: enrollment } = await admin
    .from('enrollments')
    .select('id')
    .eq('student_id', user.id)
    .eq('course_id', course.id)
    .eq('status', 'active')
    .maybeSingle()
  const isEnrolled = !!enrollment

  const { data: templates } = await admin
    .from('mock_exam_templates')
    .select('id, name, question_count, time_limit_minutes, pass_score_percent, selection_criteria')
    .eq('course_id', course.id)
    .eq('is_published', true)
    .order('sort_order')

  const all = templates ?? []
  const simulations = all.filter((t) => !isPracticeTemplate(t))
  const practiceMocks = all.filter((t) => isPracticeTemplate(t))
  const sim = simulations[0]
  const simHours = sim ? (Number(sim.time_limit_minutes) / 60).toFixed(1) : null

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader context={course.short_name} />

      <main className="flex-1 mx-auto max-w-4xl px-6 py-12 w-full">
        <Link
          href={`/courses/${course.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> {course.name}
        </Link>

        <div className="mt-6 mb-8">
          <span className="text-2xs font-semibold uppercase tracking-wider text-accent font-mono">
            {course.short_name}
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900">
            Exam simulation &amp; practice
          </h1>
          <p className="mt-3 max-w-2xl text-neutral-600 leading-relaxed">
            The <strong className="text-neutral-900">full exam simulation</strong> recreates the real{' '}
            {course.short_name} exam exactly
            {sim ? `: ${sim.question_count} questions, ${simHours} hours,` : ','} the same domain
            weighting and conditions. The{' '}
            <strong className="text-neutral-900">practice mock</strong> is a short, free warm-up.
          </p>
        </div>

        {checkout === 'success' && (
          <div className="mb-8 rounded-lg border border-primary/30 bg-primary-light/40 p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-neutral-900">Payment received.</p>
              <p className="text-sm text-neutral-600 mt-0.5">
                Your simulation attempts are updated below. If they have not appeared yet, refresh in
                a moment.
              </p>
            </div>
          </div>
        )}
        {checkout === 'cancel' && (
          <div className="mb-8 rounded-lg border border-neutral-200 bg-white p-4">
            <p className="text-sm text-neutral-600">
              Checkout cancelled. No payment was made; you can pick up where you left off whenever
              you are ready.
            </p>
          </div>
        )}

        <div className="mb-6 rounded-lg border border-neutral-200 bg-white p-6">
          <h2 className="text-2xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
            Before you start a simulation
          </h2>
          <ul className="mt-3 text-sm text-neutral-600 leading-relaxed space-y-1.5 list-disc pl-5">
            <li>
              The timer starts immediately and{' '}
              <strong className="text-neutral-900">does not pause</strong>. When it reaches zero, the
              exam submits automatically.
            </li>
            <li>Tab-away events are tracked. Stay on the page; switching away is recorded with your attempt.</li>
            <li>You can flag questions for review and navigate freely until you submit.</li>
            <li>Set aside the full time without interruption before you begin.</li>
          </ul>
        </div>

        {/* ---- Full exam simulation (entitlement-gated) ---- */}
        <section className="mb-10">
          <div className="mb-4 rounded-lg border border-neutral-200 bg-white p-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
                Simulation attempts
              </h2>
              <p className="mt-2 text-2xl font-bold font-mono text-neutral-900">
                {remaining} <span className="text-base font-medium text-neutral-500">remaining</span>
              </p>
            </div>
            {remaining > 0 && onFreeTaste && (
              <p className="text-sm text-neutral-500 max-w-xs text-right">
                You have a free attempt to try the full simulation.
              </p>
            )}
          </div>

          {simulations.length === 0 ? (
            <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
              <p className="text-neutral-500">No exam simulation is available yet.</p>
            </div>
          ) : remaining > 0 ? (
            <div className="space-y-4">
              {simulations.map((t) => (
                <div
                  key={t.id}
                  className="rounded-lg border border-neutral-200 bg-white p-6 flex items-center justify-between gap-4 transition-all hover:shadow-md"
                >
                  <div>
                    <h3 className="font-bold text-neutral-900">{t.name}</h3>
                    <p className="mt-1 text-2xs font-mono text-neutral-500 uppercase tracking-wider">
                      {t.question_count} questions &middot; {t.time_limit_minutes} min &middot;{' '}
                      {Number(t.pass_score_percent)}% readiness target
                    </p>
                  </div>
                  <Link
                    href={`/courses/${course.slug}/mock/${t.id}/take`}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors shrink-0"
                  >
                    Start simulation
                  </Link>
                </div>
              ))}
              <p className="text-2xs font-mono text-neutral-400 uppercase tracking-wider pt-1">
                Each start uses one simulation attempt.
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-6 rounded-lg border border-accent/30 bg-accent-light/40 p-4">
                <p className="text-sm text-neutral-700">
                  You have used all of your simulation attempts. Buy another single simulation, or get
                  full course access (5 simulations + unlimited practice included) to keep going.
                </p>
              </div>
              <BuyButtons courseSlug={course.slug} />
            </div>
          )}
        </section>

        {/* ---- Free practice mock (enrolled only, unlimited) ---- */}
        {practiceMocks.length > 0 && (
          <section>
            <h2 className="text-2xs font-bold uppercase tracking-wider text-neutral-400 font-mono mb-4">
              Practice: free &amp; unlimited
            </h2>
            {isEnrolled ? (
              <div className="space-y-4">
                {practiceMocks.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-lg border border-neutral-200 bg-white p-6 flex items-center justify-between gap-4 transition-all hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-neutral-900">{t.name}</h3>
                        <span className="rounded-full bg-primary-light px-2 py-0.5 text-2xs font-bold uppercase tracking-wider text-primary">
                          Free
                        </span>
                      </div>
                      <p className="mt-1 text-2xs font-mono text-neutral-500 uppercase tracking-wider">
                        {t.question_count} questions &middot; {t.time_limit_minutes} min &middot; take as often as you like
                      </p>
                    </div>
                    <Link
                      href={`/courses/${course.slug}/mock/${t.id}/take`}
                      className="inline-flex h-10 items-center justify-center rounded-md border border-primary px-5 text-sm font-semibold text-primary hover:bg-primary-light transition-colors shrink-0"
                    >
                      Start practice
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-neutral-200 bg-white p-6">
                <p className="text-sm text-neutral-600">
                  Unlimited free practice mocks are included with{' '}
                  <Link href={`/courses/${course.slug}`} className="font-semibold text-primary hover:underline">
                    full course access
                  </Link>
                  .
                </p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}
