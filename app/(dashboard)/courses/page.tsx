import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { AppHeader } from '@/components/in-app/app-header'

export const metadata = { title: 'Your courses' }

export default async function CoursesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/courses')

  const admin = createAdminClient()

  // Find published courses
  const { data: publishedCourses } = await admin
    .from('courses')
    .select('id, slug, name, short_name, description, tier, estimated_study_hours')
    .eq('status', 'published')
    .order('created_at', { ascending: true })

  // Auto-enroll the user in any published course they're not yet enrolled in (dev mode only)
  if (publishedCourses && publishedCourses.length > 0) {
    const { data: existingEnrollments } = await admin
      .from('enrollments')
      .select('course_id')
      .eq('student_id', user.id)

    const enrolledIds = new Set((existingEnrollments ?? []).map(e => e.course_id))
    const toEnroll = publishedCourses.filter(c => !enrolledIds.has(c.id))

    if (toEnroll.length > 0) {
      await admin.from('enrollments').insert(
        toEnroll.map(c => ({
          student_id: user.id,
          course_id: c.id,
          status: 'active' as const,
          metadata: { auto_enrolled: true, reason: 'dev_mode' },
        }))
      )
    }
  }

  // Now fetch enrollments with course info
  const { data: enrollments } = await admin
    .from('enrollments')
    .select(`
      id, status, enrolled_at, progress_percent,
      course:courses (id, slug, name, short_name, description, tier, estimated_study_hours)
    `)
    .eq('student_id', user.id)
    .eq('status', 'active')

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <AppHeader />

      <main className="flex-1 mx-auto max-w-6xl px-6 py-12 w-full">
        <div className="mb-10">
          <span className="text-2xs font-semibold uppercase tracking-wider text-accent">Your library</span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900">Your courses</h1>
          <p className="mt-2 text-neutral-600">Continue where you left off, or start a new lesson.</p>
        </div>

        {!enrollments || enrollments.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-white p-12 text-center">
            <p className="text-neutral-500">No active enrollments yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {enrollments.map(enr => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const course = enr.course as any
              if (!course) return null
              const progress =
                typeof enr.progress_percent === 'number' ? Math.round(enr.progress_percent) : null
              return (
                <div
                  key={enr.id}
                  className="flex flex-col justify-between rounded-lg border border-neutral-200 bg-white p-6 transition-all hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xs font-semibold uppercase tracking-widest text-neutral-400 font-mono">
                        {course.short_name}
                      </span>
                      {progress !== null && (
                        <span className="text-2xs font-mono text-neutral-400">{progress}% complete</span>
                      )}
                    </div>
                    <h2 className="mt-3 text-xl font-bold text-neutral-900">{course.name}</h2>
                    <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{course.description}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-2xs font-mono text-neutral-400">
                      {course.estimated_study_hours}h estimated
                    </span>
                    <Link
                      href={`/courses/${course.slug}`}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
                    >
                      Continue <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
