import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Wordmark } from '@/components/brand/wordmark'
import { SignOutButton } from '../dashboard/sign-out-button'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'

export const metadata = { title: 'Your courses — Enso Academy' }

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
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Wordmark />
          <div className="flex items-center gap-6">
            <Link href="/courses" className="text-sm font-medium">Courses</Link>
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Dashboard</Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-medium tracking-tight">Your courses</h1>
          <p className="text-muted-foreground">Continue where you left off, or start a new lesson.</p>
        </div>

        {!enrollments || enrollments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No active enrollments yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {enrollments.map(enr => {
              const course = enr.course as any
              if (!course) return null
              return (
                <Card key={enr.id}>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{course.short_name}</div>
                      <h2 className="text-xl font-medium">{course.name}</h2>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{course.description}</p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-muted-foreground">{course.estimated_study_hours}h estimated</span>
                      <Link
                        href={`/courses/${course.slug}`}
                        className={buttonVariants({ size: 'sm' })}
                      >
                        Continue
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
