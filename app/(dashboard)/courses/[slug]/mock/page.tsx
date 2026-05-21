import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Wordmark } from '@/components/brand/wordmark'
import { SignOutButton } from '../../../dashboard/sign-out-button'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'

type Props = { params: Promise<{ slug: string }> }

export const metadata = { title: 'Mock exams — Enso Academy' }

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
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Wordmark />
          <div className="flex items-center gap-6">
            <Link href="/courses" className="text-sm text-muted-foreground hover:text-foreground">Courses</Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
        <div className="space-y-2 mb-2">
          <Link href={`/courses/${course.slug}`} className="text-sm text-muted-foreground hover:text-foreground">
            ← {course.name}
          </Link>
        </div>
        <div className="space-y-3 mb-8">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">{course.short_name}</div>
          <h1 className="text-3xl font-medium tracking-tight">Mock exams</h1>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">
            A mock exam mirrors the real test environment. Take it seriously — your results feed your readiness score.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6 space-y-3">
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Before you start</h2>
            <ul className="text-sm text-muted-foreground leading-relaxed space-y-1.5 list-disc pl-5">
              <li>The timer starts immediately and <strong className="text-foreground">does not pause</strong>. When it reaches zero, the mock submits automatically.</li>
              <li>Tab-away events are tracked. Stay on the page — switching away is recorded with your attempt.</li>
              <li>You can flag questions for review and navigate freely until you submit.</li>
              <li>Set aside the full time without interruption before you begin.</li>
            </ul>
          </CardContent>
        </Card>

        {!templates || templates.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No mock exams are available for this course yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {templates.map((t) => (
              <Card key={t.id}>
                <CardContent className="p-6 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-medium">{t.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t.question_count} questions · {t.time_limit_minutes} minutes · {Number(t.pass_score_percent)}% to pass
                    </p>
                  </div>
                  <Link
                    href={`/courses/${course.slug}/mock/${t.id}/take`}
                    className={buttonVariants()}
                  >
                    Start mock
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
