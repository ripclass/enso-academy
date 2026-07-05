import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, BookOpen, FileText, Compass } from 'lucide-react'
import { AppHeader } from '@/components/in-app/app-header'
import { StatusBadge } from '@/components/in-app/ui-kit'

export const metadata = {
  title: 'Dashboard',
}

type LessonRow = { id: string; name: string; sort_order: number | null }
type ModuleRow = { course_id: string; sort_order: number | null; lessons: LessonRow[] }
type EnrollRow = {
  course_id: string
  course: { id: string; slug: string; name: string; short_name: string; status: string }
}
type ReadinessRow = {
  course_id: string
  status: string | null
  mock_count: number | null
  average_score: number | null
}

const btnPrimary =
  'inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors shrink-0'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/dashboard')

  const admin = createAdminClient()

  // First name for the greeting.
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>
  const fullName =
    (typeof meta.full_name === 'string' && meta.full_name) ||
    (typeof meta.name === 'string' && meta.name) ||
    ''
  const firstName = fullName.trim().split(/\s+/)[0] || null

  // Active enrolments → published courses.
  const { data: enrollments } = await admin
    .from('enrollments')
    .select('course_id, created_at, course:courses!inner(id, slug, name, short_name, status)')
    .eq('student_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const enrolled = ((enrollments ?? []) as unknown as EnrollRow[]).filter(
    (e) => e.course?.status === 'published',
  )
  const courseIds = enrolled.map((e) => e.course.id)

  // Per-course progress: ordered lessons, completed set (from lesson_completed
  // events), and readiness.
  const modulesByCourse: Record<string, ModuleRow[]> = {}
  const completedLessonIds = new Set<string>()
  const readinessByCourse: Record<string, ReadinessRow> = {}

  if (courseIds.length) {
    const { data: modules } = await admin
      .from('modules')
      .select('course_id, sort_order, lessons(id, name, sort_order)')
      .in('course_id', courseIds)
      .order('sort_order')
    for (const m of (modules ?? []) as unknown as ModuleRow[]) {
      ;(modulesByCourse[m.course_id] ??= []).push(m)
    }

    const { data: events } = await admin
      .from('session_events')
      .select('payload')
      .eq('student_id', user.id)
      .eq('event_type', 'lesson_completed')
    for (const e of (events ?? []) as { payload: { lesson_id?: string } | null }[]) {
      const id = e.payload?.lesson_id
      if (id) completedLessonIds.add(id)
    }

    const { data: readiness } = await admin
      .from('student_readiness')
      .select('course_id, status, mock_count, average_score')
      .eq('student_id', user.id)
      .in('course_id', courseIds)
    for (const r of (readiness ?? []) as ReadinessRow[]) {
      readinessByCourse[r.course_id] = r
    }
  }

  const cards = enrolled.map((e) => {
    const mods = (modulesByCourse[e.course.id] ?? [])
      .slice()
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    const orderedLessons = mods.flatMap((m) =>
      (m.lessons ?? []).slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    )
    const total = orderedLessons.length
    const done = orderedLessons.filter((l) => completedLessonIds.has(l.id)).length
    const next = orderedLessons.find((l) => !completedLessonIds.has(l.id)) ?? null
    const r = readinessByCourse[e.course.id]
    const badge =
      r?.status === 'ready'
        ? ('ready' as const)
        : r?.status === 'approaching'
          ? ('approaching' as const)
          : null
    return { course: e.course, total, done, next, readiness: r, badge }
  })

  // The catalog: published courses the user does not own yet, to grow into.
  const { data: publishedCourses } = await admin
    .from('courses')
    .select('id, slug, name, short_name, description')
    .eq('status', 'published')
    .order('created_at', { ascending: true })
  const availableCourses = (
    (publishedCourses ?? []) as {
      id: string
      slug: string
      name: string
      short_name: string
      description: string | null
    }[]
  ).filter((c) => !courseIds.includes(c.id))

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader email={user.email} />

      <main className="flex-1 mx-auto max-w-5xl px-6 py-12 w-full space-y-8">
        <div>
          <span className="text-2xs font-semibold uppercase tracking-wider text-accent">Dashboard</span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900">
            {firstName ? `Welcome back, ${firstName}.` : 'Welcome back.'}
          </h1>
          <p className="mt-2 text-neutral-600">
            {cards.length ? 'Pick up where you left off.' : 'Browse the catalogue to get started.'}
          </p>
        </div>

        {cards.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-white p-8">
            <h2 className="text-lg font-bold text-neutral-900">You&rsquo;re not enrolled in a course yet</h2>
            <p className="mt-2 max-w-xl text-sm text-neutral-600 leading-relaxed">
              Browse the catalogue to enrol, or sit a single exam simulation first. Your first one is
              free.
            </p>
            <Link href="#catalog" className={`mt-6 ${btnPrimary}`}>
              <Compass className="h-4 w-4" /> Browse courses <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {cards.map(({ course, total, done, next, readiness, badge }) => {
              const pct = total ? Math.round((done / total) * 100) : 0
              return (
                <div key={course.id} className="rounded-lg border-2 border-neutral-900 bg-white p-6 md:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-2xs font-semibold uppercase tracking-widest text-accent font-mono">
                        {course.short_name}
                      </span>
                      <h2 className="mt-1 text-xl font-bold text-neutral-900">{course.name}</h2>
                    </div>
                    {badge && <StatusBadge status={badge} />}
                  </div>

                  {/* Progress */}
                  <div className="mt-5">
                    <div className="flex justify-between text-2xs font-mono uppercase tracking-wider text-neutral-500">
                      <span>
                        {done} / {total} lessons
                      </span>
                      <span>{pct}%</span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  {/* Up next → Resume */}
                  <div className="mt-6 flex flex-col gap-4 rounded-lg border border-neutral-200 bg-muted p-4 sm:flex-row sm:items-center sm:justify-between">
                    {next ? (
                      <div className="min-w-0">
                        <p className="text-2xs font-mono uppercase tracking-wider text-neutral-400">Up next</p>
                        <p className="mt-0.5 truncate text-sm font-semibold text-neutral-800">{next.name}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-2xs font-mono uppercase tracking-wider text-neutral-400">Lessons</p>
                        <p className="mt-0.5 text-sm font-semibold text-neutral-800">
                          All lessons complete. Time to test yourself.
                        </p>
                      </div>
                    )}
                    {next ? (
                      <Link href={`/lessons/${next.id}`} className={btnPrimary}>
                        <BookOpen className="h-4 w-4" /> {done === 0 ? 'Start course' : 'Resume'}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <Link href={`/courses/${course.slug}/mock`} className={btnPrimary}>
                        <FileText className="h-4 w-4" /> Take a mock
                      </Link>
                    )}
                  </div>

                  {/* Readiness + links */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-neutral-600">
                      {readiness && (readiness.mock_count ?? 0) > 0
                        ? `${readiness.mock_count} mock${readiness.mock_count === 1 ? '' : 's'} taken · average ${Math.round(Number(readiness.average_score ?? 0))}%`
                        : 'No mocks yet. Take one to gauge your readiness.'}
                    </p>
                    <div className="flex gap-4 text-sm font-semibold">
                      <Link href={`/courses/${course.slug}`} className="text-primary hover:underline">
                        Course home
                      </Link>
                      <Link href={`/courses/${course.slug}/mock`} className="text-primary hover:underline">
                        Mocks
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* The catalog: more certifications to grow into */}
        {availableCourses.length > 0 && (
          <div id="catalog">
            <h2 className="text-2xs font-semibold uppercase tracking-wider text-neutral-500">
              Expand your credentials
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
              {availableCourses.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col justify-between rounded-lg border border-neutral-200 bg-white p-6 transition-all hover:shadow-md"
                >
                  <div>
                    <span className="text-2xs font-semibold uppercase tracking-widest text-neutral-400 font-mono">
                      {c.short_name}
                    </span>
                    <h3 className="mt-2 text-lg font-bold text-neutral-900">{c.name}</h3>
                    {c.description && (
                      <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{c.description}</p>
                    )}
                  </div>
                  <Link
                    href={`/courses/${c.slug}`}
                    className="mt-6 inline-flex h-9 w-fit items-center justify-center gap-1.5 rounded-md border border-primary px-4 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
                  >
                    View course <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
