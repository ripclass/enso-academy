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

export const metadata = { title: 'Mock exams' }

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

  // Entitlement-gated (not enrollment-gated): seed the baseline free taste, then
  // read the balance. Anyone authenticated can reach this surface.
  await ensureBaselineEntitlement(user.id, course.id)
  const entitlement = await getMockEntitlement(user.id, course.id)
  const remaining = entitlement.remaining
  // "free" while the student is still inside the baseline included allowance
  // and has bought nothing — purely for friendlier copy.
  const onFreeTaste = entitlement.purchasedTotal === 0 && entitlement.includedTotal <= 1

  const { data: templates } = await admin
    .from('mock_exam_templates')
    .select('id, name, question_count, time_limit_minutes, pass_score_percent')
    .eq('course_id', course.id)
    .eq('is_published', true)
    .order('sort_order')

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
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
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900">Mock exams</h1>
          <p className="mt-3 max-w-2xl text-neutral-600 leading-relaxed">
            A mock exam mirrors the real test environment. Take it seriously — your results feed your
            readiness score.
          </p>
        </div>

        {checkout === 'success' && (
          <div className="mb-8 rounded-lg border border-primary/30 bg-primary-light/40 p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-neutral-900">Payment received.</p>
              <p className="text-sm text-neutral-600 mt-0.5">
                Your mock attempts are updated below. If they have not appeared yet, refresh in a
                moment.
              </p>
            </div>
          </div>
        )}
        {checkout === 'cancel' && (
          <div className="mb-8 rounded-lg border border-neutral-200 bg-white p-4">
            <p className="text-sm text-neutral-600">
              Checkout cancelled — no payment was made. You can pick up where you left off whenever
              you are ready.
            </p>
          </div>
        )}

        {/* Entitlement summary */}
        <div className="mb-8 rounded-lg border border-neutral-200 bg-white p-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
              Your mock attempts
            </h2>
            <p className="mt-2 text-2xl font-bold font-mono text-neutral-900">
              {remaining} <span className="text-base font-medium text-neutral-500">remaining</span>
            </p>
          </div>
          {remaining > 0 && onFreeTaste && (
            <p className="text-sm text-neutral-500 max-w-xs text-right">
              You have a free attempt to try the exam experience.
            </p>
          )}
        </div>

        <div className="mb-8 rounded-lg border border-neutral-200 bg-white p-6">
          <h2 className="text-2xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
            Before you start
          </h2>
          <ul className="mt-3 text-sm text-neutral-600 leading-relaxed space-y-1.5 list-disc pl-5">
            <li>
              The timer starts immediately and{' '}
              <strong className="text-neutral-900">does not pause</strong>. When it reaches zero, the
              mock submits automatically.
            </li>
            <li>Tab-away events are tracked. Stay on the page — switching away is recorded with your attempt.</li>
            <li>You can flag questions for review and navigate freely until you submit.</li>
            <li>Set aside the full time without interruption before you begin.</li>
          </ul>
        </div>

        {!templates || templates.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-white p-12 text-center">
            <p className="text-neutral-500">No mock exams are available for this course yet.</p>
          </div>
        ) : remaining > 0 ? (
          <div className="space-y-4">
            {templates.map((t) => (
              <div
                key={t.id}
                className="rounded-lg border border-neutral-200 bg-white p-6 flex items-center justify-between gap-4 transition-all hover:shadow-md"
              >
                <div>
                  <h3 className="font-bold text-neutral-900">{t.name}</h3>
                  <p className="mt-1 text-2xs font-mono text-neutral-500 uppercase tracking-wider">
                    {t.question_count} questions &middot; {t.time_limit_minutes} min &middot;{' '}
                    {Number(t.pass_score_percent)}% to pass
                  </p>
                </div>
                <Link
                  href={`/courses/${course.slug}/mock/${t.id}/take`}
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors shrink-0"
                >
                  Start mock
                </Link>
              </div>
            ))}
            <p className="text-2xs font-mono text-neutral-400 uppercase tracking-wider pt-1">
              Each start uses one attempt.
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-6 rounded-lg border border-accent/30 bg-accent-light/40 p-4">
              <p className="text-sm text-neutral-700">
                You have used all of your mock attempts. Buy another single mock, or get full course
                access (5 mocks included) to keep going.
              </p>
            </div>
            <BuyButtons courseSlug={course.slug} />
          </div>
        )}
      </main>
    </div>
  )
}
