'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type AvatarChoice = 'male' | 'female'

/** The student's avatar choice (defaults to female). */
export async function getAvatarChoice(): Promise<AvatarChoice> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'female'
  const admin = createAdminClient()
  const { data } = await admin
    .from('student_preferences')
    .select('avatar_choice')
    .eq('student_id', user.id)
    .maybeSingle()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const choice = (data as any)?.avatar_choice
  return choice === 'male' ? 'male' : 'female'
}

/** Persist the student's avatar choice. */
export async function setAvatarChoice(choice: AvatarChoice): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const admin = createAdminClient()
  await admin
    .from('student_preferences')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .upsert({ student_id: user.id, avatar_choice: choice } as any, { onConflict: 'student_id' })
}
