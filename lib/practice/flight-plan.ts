'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * The study flight plan's single persisted fact: the student's booked (or
 * target) exam date, stored on the enrollment's metadata. Everything else the
 * plan shows is derived at render from the student model, progress, and
 * readiness. Pass null to clear.
 */
export async function setExamDate(courseSlug: string, isoDate: string | null): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  if (isoDate && !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) throw new Error('Bad date')

  const admin = createAdminClient()
  const { data: course } = await admin.from('courses').select('id').eq('slug', courseSlug).single()
  if (!course) throw new Error('Course not found')

  const { data: enrollment } = await admin
    .from('enrollments')
    .select('id, metadata')
    .eq('student_id', user.id)
    .eq('course_id', course.id)
    .eq('status', 'active')
    .maybeSingle()
  if (!enrollment) throw new Error('Not enrolled')

  const metadata = {
    ...((enrollment.metadata ?? {}) as Record<string, unknown>),
    exam_date: isoDate,
  }
  await admin.from('enrollments').update({ metadata }).eq('id', enrollment.id)
}
