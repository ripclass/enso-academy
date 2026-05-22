import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Wordmark } from '@/components/brand/wordmark'
import { SignOutButton } from '../../dashboard/sign-out-button'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'

type Props = { params: Promise<{ slug: string }> }

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/courses/${slug}`)

  const admin = createAdminClient()

  const { data: course } = await admin
    .from('courses')
    .select('id, slug, name, short_name, description, certifying_body, estimated_study_hours, real_exam_format')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!course) notFound()

  // Confirm enrollment
  const { data: enrollment } = await admin
    .from('enrollments')
    .select('id, status')
    .eq('student_id', user.id)
    .eq('course_id', course.id)
    .single()

  if (!enrollment || enrollment.status !== 'active') {
    redirect('/courses')
  }

  // Fetch modules and lessons
  const { data: modules } = await admin
    .from('modules')
    .select(`
      id, slug, name, description, sort_order, estimated_minutes,
      lessons (id, slug, name, description, sort_order, estimated_minutes)
    `)
    .eq('course_id', course.id)
    .order('sort_order')

  // Fetch mock-exam readiness for this student + course
  const { data: readiness } = await admin
    .from('student_readiness')
    .select('status, mock_count, average_score')
    .eq('student_id', user.id)
    .eq('course_id', course.id)
    .maybeSingle()

  // Fetch the student knowledge model for this course
  const { data: knowledge } = await admin
    .from('student_knowledge_state')
    .select('concept_tag, mastery_probability, observation_count')
    .eq('student_id', user.id)
    .eq('course_id', course.id)

  const titleize = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const knowledgeRows = ((knowledge ?? []) as any[]).filter((k) => k.observation_count > 0)
  const strongConcepts = knowledgeRows
    .filter((k) => Number(k.mastery_probability) >= 0.75)
    .sort((a, b) => Number(b.mastery_probability) - Number(a.mastery_probability))
    .slice(0, 6)
    .map((k) => titleize(k.concept_tag))
  const reviewConcepts = knowledgeRows
    .filter((k) => Number(k.mastery_probability) < 0.6)
    .sort((a, b) => Number(a.mastery_probability) - Number(b.mastery_probability))
    .slice(0, 6)
    .map((k) => titleize(k.concept_tag))
  const showKnowledge = strongConcepts.length > 0 || reviewConcepts.length > 0

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Wordmark />
          <div className="flex items-center gap-6">
            <Link href="/courses" className="text-sm text-muted-foreground hover:text-foreground">Courses</Link>
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Dashboard</Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
        <div className="space-y-2 mb-2">
          <Link href="/courses" className="text-sm text-muted-foreground hover:text-foreground">← Your courses</Link>
        </div>
        <div className="space-y-3 mb-10">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">{course.short_name}</div>
          <h1 className="text-3xl font-medium tracking-tight">{course.name}</h1>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">{course.description}</p>
          <p className="text-sm text-muted-foreground pt-2">Certifying body: {course.certifying_body}</p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-medium">Mock exams</h2>
                {readiness?.status === 'ready' && (
                  <span className="text-xs font-medium rounded-md px-2 py-0.5 bg-success/10 text-success">
                    Exam-ready
                  </span>
                )}
                {readiness?.status === 'approaching' && (
                  <span className="text-xs font-medium rounded-md px-2 py-0.5 bg-accent/10 text-accent">
                    Approaching readiness
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {readiness
                  ? `You've completed ${readiness.mock_count} mock${readiness.mock_count === 1 ? '' : 's'}. Your average is ${Number(readiness.average_score ?? 0)}%.`
                  : "Take a mock exam when you're ready to test your readiness."}
              </p>
            </div>
            <Link href={`/courses/${course.slug}/mock`} className={buttonVariants()}>
              Take a mock
            </Link>
          </CardContent>
        </Card>

        {showKnowledge && (
          <Card className="mb-6">
            <CardContent className="p-6 space-y-3">
              <h2 className="text-lg font-medium">Your knowledge</h2>
              {strongConcepts.length > 0 && (
                <div className="flex items-start gap-3 text-sm">
                  <span className="text-success font-medium shrink-0 w-20">Strong</span>
                  <span className="text-muted-foreground">{strongConcepts.join(' · ')}</span>
                </div>
              )}
              {reviewConcepts.length > 0 && (
                <div className="flex items-start gap-3 text-sm">
                  <span className="text-accent font-medium shrink-0 w-20">To review</span>
                  <span className="text-muted-foreground">{reviewConcepts.join(' · ')}</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground pt-1">
                Updated as you take mocks and complete lessons. Your lecturer uses this to focus its answers.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {modules?.map(mod => {
            const lessons = ((mod.lessons as any[]) ?? []).sort((a, b) => a.sort_order - b.sort_order)
            return (
              <Card key={mod.id}>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h2 className="text-lg font-medium">{mod.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{mod.description}</p>
                  </div>
                  <div className="border-t border-border pt-4 space-y-2">
                    {lessons.map((lesson, idx) => (
                      <Link
                        key={lesson.id}
                        href={`/lessons/${lesson.id}`}
                        className="flex items-center justify-between py-3 px-3 -mx-3 rounded-md hover:bg-muted transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-xs text-muted-foreground tabular-nums mt-1">{(idx + 1).toString().padStart(2, '0')}</span>
                          <div>
                            <div className="text-sm font-medium">{lesson.name}</div>
                            <div className="text-xs text-muted-foreground mt-1">{lesson.description}</div>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{lesson.estimated_minutes} min</span>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
