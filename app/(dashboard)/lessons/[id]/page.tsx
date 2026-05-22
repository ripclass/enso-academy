import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect, notFound } from 'next/navigation'
import { LessonPlayer } from './lesson-player'
import { startLessonSession, getLessonContent } from '@/lib/lesson/actions'
import { getLecturerOpening } from '@/lib/student-model/memory'

type Props = { params: Promise<{ id: string }> }

export default async function LessonPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/lessons/${id}`)

  const admin = createAdminClient()

  // Fetch lesson with course context
  const { data: lesson } = await admin
    .from('lessons')
    .select(`
      id, slug, name, description, learning_objectives, estimated_minutes,
      module:modules!inner (
        id, name, sort_order,
        course:courses!inner (id, slug, name, short_name)
      )
    `)
    .eq('id', id)
    .single()

  if (!lesson) notFound()

  const courseId = (lesson.module as any).course.id
  const courseSlug = (lesson.module as any).course.slug

  // Confirm enrollment
  const { data: enrollment } = await admin
    .from('enrollments')
    .select('id')
    .eq('student_id', user.id)
    .eq('course_id', courseId)
    .eq('status', 'active')
    .single()

  if (!enrollment) redirect('/courses')

  // Fetch content elements
  const elements = await getLessonContent(id)

  // Start session
  const sessionId = await startLessonSession(id)

  // Continuity greeting from the lecturer's memory of this student (null if none)
  const lecturerOpening = await getLecturerOpening(user.id, courseId, (lesson as any).name)

  return (
    <LessonPlayer
      sessionId={sessionId}
      lesson={lesson as any}
      elements={elements as any}
      courseId={courseId}
      courseSlug={courseSlug}
      lecturerOpening={lecturerOpening}
    />
  )
}
