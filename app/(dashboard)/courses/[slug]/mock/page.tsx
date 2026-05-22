import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AppHeader } from '@/components/in-app/app-header'

type Props = { params: Promise<{ slug: string }> }

export const metadata = { title: 'Mock exams' }

export default async function MockLaunchPage({ params }: Props) {
  const { slug } = await params
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

  const { data: enrollment } = await admin
    .from('enrollments')
    .select('id, status')
    .eq('student_id', user.id)
    .eq('course_id', course.id)
    .single()
  if (!enrollment || enrollment.status !== 'active') redirect('/courses')

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
        ) : (
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
          </div>
        )}
      </main>
    </div>
  )
}
