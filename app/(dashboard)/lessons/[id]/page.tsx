import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect, notFound } from 'next/navigation'
import { LessonPlayer } from './lesson-player'
import { startLessonSession, getLessonContent } from '@/lib/lesson/actions'
import { getLecturerOpening } from '@/lib/student-model/memory'
import { getAvatarChoice } from '@/lib/settings'
import { isPreviewLessonId } from '@/lib/courses/preview'
import { parseScene, type ContentRow } from '@/lib/lesson/scenes'

type Props = { params: Promise<{ id: string }> }

export default async function LessonPage({ params }: Props) {
  const { id } = await params
  const isPreview = isPreviewLessonId(id)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // Preview lessons are signup-gated (send anonymous prospects to sign up, which
  // captures the lead); other lessons use the normal login redirect.
  if (!user) redirect(`/${isPreview ? 'signup' : 'login'}?next=/lessons/${id}`)

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

  // Confirm enrollment — except for free preview lessons, which any signed-in
  // user may play (the buy gate is on the rest of the course).
  const { data: enrollment } = await admin
    .from('enrollments')
    .select('id')
    .eq('student_id', user.id)
    .eq('course_id', courseId)
    .eq('status', 'active')
    .single()

  if (!enrollment && !isPreview) redirect(`/courses/${courseSlug}`)

  // Fetch content elements and parse them into typed scenes
  const elements = await getLessonContent(id)
  const scenes = elements.map((row) => parseScene(row as unknown as ContentRow))

  // Start session
  const sessionId = await startLessonSession(id)

  // Continuity greeting from the lecturer's memory of this student (null if none)
  const lecturerOpening = await getLecturerOpening(user.id, courseId, (lesson as any).name)
  const userAvatar = await getAvatarChoice()

  // The student's first name, for the lecturer to address them in office hours.
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>
  const fullName =
    (typeof meta.full_name === 'string' && meta.full_name) ||
    (typeof meta.name === 'string' && meta.name) ||
    (typeof meta.given_name === 'string' && meta.given_name) ||
    ''
  const userName = fullName.trim().split(/\s+/)[0] || null

  // The next lesson in course order (module sort_order, then lesson sort_order),
  // so "Complete lesson" can advance straight into it. Null on the last lesson.
  type NavModule = { sort_order: number | null; lessons: { id: string; sort_order: number | null }[] }
  const { data: navModules } = await admin
    .from('modules')
    .select('sort_order, lessons(id, sort_order)')
    .eq('course_id', courseId)
    .order('sort_order')
  const orderedLessonIds = ((navModules ?? []) as NavModule[]).flatMap((m) =>
    [...(m.lessons ?? [])]
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((l) => l.id),
  )
  const curIdx = orderedLessonIds.indexOf(id)
  const nextLessonId =
    curIdx >= 0 && curIdx < orderedLessonIds.length - 1 ? orderedLessonIds[curIdx + 1] : null

  return (
    <LessonPlayer
      sessionId={sessionId}
      lesson={lesson as any}
      scenes={scenes}
      courseId={courseId}
      courseSlug={courseSlug}
      lecturerOpening={lecturerOpening}
      userAvatar={userAvatar}
      userName={userName}
      nextLessonId={nextLessonId}
    />
  )
}
