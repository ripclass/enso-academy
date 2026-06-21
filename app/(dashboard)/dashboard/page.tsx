import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { AppHeader } from '@/components/in-app/app-header'
import { AvatarPicker } from '@/components/settings/avatar-picker'
import { getAvatarChoice } from '@/lib/settings'

export const metadata = {
  title: 'Dashboard',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/dashboard')
  }

  // A returning student (one the lecturer has memory of) gets a warmer greeting.
  const admin = createAdminClient()
  const { data: recentMemory } = await admin
    .from('student_memory')
    .select('id')
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  const returning = !!recentMemory
  const avatarChoice = await getAvatarChoice()

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <AppHeader email={user.email} />

      <main className="flex-1 mx-auto max-w-5xl px-6 py-12 w-full">
        <div className="rounded-lg border border-neutral-200 bg-white p-8 md:p-12">
          <span className="text-2xs font-semibold uppercase tracking-wider text-accent">
            {returning ? 'Welcome back' : 'Welcome'}
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900">
            {returning ? 'Pick up where you left off.' : 'Welcome to Enso Academy.'}
          </h1>
          <p className="mt-3 max-w-xl text-neutral-600 leading-relaxed">
            {returning
              ? 'Your lecturer remembers where you are — your goal, what you struggled with, and the pace that worked.'
              : 'Open a course to start studying. Your knowledge model and readiness build as you go.'}
          </p>
          <Link
            href="/courses"
            className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
          >
            Go to your courses
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Avatar setting */}
        <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
          <h2 className="text-sm font-bold text-neutral-900">Your avatar</h2>
          <p className="mt-1 mb-4 text-sm text-neutral-500">
            How you appear in the classroom when you ask a question.
          </p>
          <AvatarPicker initial={avatarChoice} />
        </div>
      </main>
    </div>
  )
}
