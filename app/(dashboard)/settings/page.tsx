import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppHeader } from '@/components/in-app/app-header'
import { AvatarPicker } from '@/components/settings/avatar-picker'
import { getAvatarChoice } from '@/lib/settings'

export const metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/settings')

  const avatarChoice = await getAvatarChoice()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader email={user.email} />

      <main className="flex-1 mx-auto max-w-2xl px-6 py-12 w-full space-y-8">
        <div>
          <span className="text-2xs font-semibold uppercase tracking-wider text-accent">Settings</span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900">Your account</h1>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h2 className="text-sm font-bold text-neutral-900">Account</h2>
          <p className="mt-1 text-sm text-neutral-500">Signed in as {user.email}</p>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6">
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
