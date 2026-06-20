import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, FileText } from 'lucide-react'
import { AppHeader } from '@/components/in-app/app-header'
import { SectionHeader, StatusBadge, ConceptMasteryRow } from '@/components/in-app/ui-kit'
import { CoursePurchase } from './course-purchase'

type Props = { params: Promise<{ slug: string }> }

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/courses/${slug}`)

  const admin = createAdminClient()

  const { data: course } = await admin
    .from('courses')
    .select('id, slug, name, short_name, description, certifying_body, estimated_study_hours, real_exam_format, status')
    .eq('slug', slug)
    .maybeSingle()

  if (!course) notFound()

  // An unpublished course (e.g. a marketing link followed before launch) shows a
  // graceful "launching soon" view rather than a 404.
  if (course.status !== 'published') {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <AppHeader context={course.short_name} />
        <main className="flex-1 mx-auto max-w-2xl px-6 py-24 w-full text-center">
          <span className="text-2xs font-semibold uppercase tracking-widest text-accent font-mono">
            {course.short_name}
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900">{course.name}</h1>
          <p className="mt-4 text-neutral-600 leading-relaxed">
            This course is launching soon. Check back shortly — or create an account and we’ll have it
            ready for you.
          </p>
          <Link
            href="/courses"
            className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="h-3 w-3" /> Your courses
          </Link>
        </main>
      </div>
    )
  }

  // Confirm enrollment. A signed-in user who does not own the course sees the
  // purchase view (rather than being bounced) so they can buy access here.
  const { data: enrollment } = await admin
    .from('enrollments')
    .select('id, status')
    .eq('student_id', user.id)
    .eq('course_id', course.id)
    .maybeSingle()

  if (!enrollment || enrollment.status !== 'active') {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <AppHeader context={course.short_name} />
        <main className="flex-1 mx-auto max-w-3xl px-6 py-12 w-full">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Your courses
          </Link>
          <div className="mt-6 mb-8">
            <span className="text-2xs font-semibold uppercase tracking-widest text-accent font-mono">
              {course.short_name}
            </span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900">{course.name}</h1>
            <p className="mt-3 text-neutral-600 leading-relaxed">{course.description}</p>
            <p className="mt-3 text-2xs font-mono text-neutral-400 uppercase tracking-wider">
              Certifying body: {course.certifying_body}
            </p>
          </div>
          <CoursePurchase
            courseSlug={course.slug}
            included={[
              'The complete course — interactive lessons grounded in primary sources',
              'The AI lecturer that adapts to what you know, plus the classmate',
              'Exam-faithful mock exams with a calibrated readiness signoff',
              '5 full mock-exam attempts included',
            ]}
          />
        </main>
      </div>
    )
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
    .map((k) => ({ name: titleize(k.concept_tag), score: Number(k.mastery_probability) * 100 }))
  const reviewConcepts = knowledgeRows
    .filter((k) => Number(k.mastery_probability) < 0.6)
    .sort((a, b) => Number(a.mastery_probability) - Number(b.mastery_probability))
    .slice(0, 6)
    .map((k) => ({ name: titleize(k.concept_tag), score: Number(k.mastery_probability) * 100 }))
  const showKnowledge = strongConcepts.length > 0 || reviewConcepts.length > 0

  const readinessBadge =
    readiness?.status === 'ready'
      ? ('ready' as const)
      : readiness?.status === 'approaching'
        ? ('approaching' as const)
        : null

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <AppHeader context={course.short_name} />

      <main className="flex-1 mx-auto max-w-5xl px-6 py-12 w-full">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> Your courses
        </Link>

        <div className="mt-6 mb-10">
          <span className="text-2xs font-semibold uppercase tracking-widest text-accent font-mono">
            {course.short_name}
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900">{course.name}</h1>
          <p className="mt-3 text-neutral-600 leading-relaxed max-w-2xl">{course.description}</p>
          <p className="mt-3 text-2xs font-mono text-neutral-400 uppercase tracking-wider">
            Certifying body: {course.certifying_body}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left: modules */}
          <div className="lg:col-span-8 space-y-6">
            {/* Mock exams card */}
            <div className="rounded-lg border-2 border-neutral-900 bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg font-bold text-neutral-900">Mock exams</h2>
                    {readinessBadge && <StatusBadge status={readinessBadge} />}
                  </div>
                  <p className="mt-1.5 text-sm text-neutral-600">
                    {readiness
                      ? `${readiness.mock_count} mock${readiness.mock_count === 1 ? '' : 's'} completed. Average score ${Number(readiness.average_score ?? 0)}%.`
                      : 'Take a mock exam when you are ready to test your readiness.'}
                  </p>
                </div>
                <Link
                  href={`/courses/${course.slug}/mock`}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors shrink-0"
                >
                  <FileText className="h-4 w-4" /> Take a mock
                </Link>
              </div>
            </div>

            <SectionHeader title="Course modules" />

            {modules?.map((mod, modIndex) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const lessons = ((mod.lessons as any[]) ?? []).sort((a, b) => a.sort_order - b.sort_order)
              return (
                <div key={mod.id} className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
                  <div className="bg-neutral-50 border-b border-neutral-200 px-6 py-4">
                    <span className="text-2xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
                      Module {modIndex + 1}
                    </span>
                    <h3 className="mt-0.5 text-base font-bold text-neutral-900">{mod.name}</h3>
                    {mod.description && (
                      <p className="mt-1 text-sm text-neutral-500">{mod.description}</p>
                    )}
                  </div>
                  <div className="divide-y divide-neutral-100">
                    {lessons.map((lesson, idx) => (
                      <Link
                        key={lesson.id}
                        href={`/lessons/${lesson.id}`}
                        className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-neutral-50/60 transition-colors"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="text-2xs font-mono text-neutral-400 mt-1 tabular-nums">
                            {(idx + 1).toString().padStart(2, '0')}
                          </span>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-neutral-800">{lesson.name}</div>
                            {lesson.description && (
                              <div className="mt-0.5 text-xs text-neutral-500">{lesson.description}</div>
                            )}
                          </div>
                        </div>
                        <span className="text-2xs font-mono text-neutral-400 whitespace-nowrap shrink-0">
                          {lesson.estimated_minutes} min
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right: knowledge model */}
          <div className="lg:col-span-4">
            {showKnowledge ? (
              <div className="rounded-lg border border-neutral-200 bg-white p-6 lg:sticky lg:top-6">
                <h2 className="text-base font-bold text-neutral-900">Your knowledge state</h2>
                <p className="mt-1 text-xs text-neutral-400">
                  Adaptive mastery tracking across key exam concepts.
                </p>

                <div className="mt-6 space-y-6">
                  {reviewConcepts.length > 0 && (
                    <div>
                      <span className="block mb-2 text-2xs font-semibold uppercase tracking-wider text-accent font-mono">
                        Focus needed ({reviewConcepts.length})
                      </span>
                      <div>
                        {reviewConcepts.map((c) => (
                          <ConceptMasteryRow key={c.name} concept={c.name} score={c.score} />
                        ))}
                      </div>
                    </div>
                  )}
                  {strongConcepts.length > 0 && (
                    <div>
                      <span className="block mb-2 text-2xs font-semibold uppercase tracking-wider text-primary font-mono">
                        Mastered ({strongConcepts.length})
                      </span>
                      <div>
                        {strongConcepts.map((c) => (
                          <ConceptMasteryRow key={c.name} concept={c.name} score={c.score} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <p className="mt-6 text-2xs text-neutral-400 leading-relaxed">
                  Updated as you take mocks and complete lessons. Your lecturer uses this to focus its answers.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-neutral-200 bg-white p-6 lg:sticky lg:top-6">
                <h2 className="text-base font-bold text-neutral-900">Your knowledge state</h2>
                <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
                  As you complete lessons and take mocks, your per-concept mastery model builds here.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
