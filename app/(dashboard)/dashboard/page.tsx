import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SignOutButton } from './sign-out-button'
import { Wordmark } from '@/components/brand/wordmark'

export const metadata = {
  title: 'Dashboard — Enso Academy',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Wordmark />
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-medium tracking-tight">Welcome to Enso Academy</h1>
            <p className="text-muted-foreground mt-2">
              Your dashboard. Courses, lessons, and mock exams will appear here as you enroll.
            </p>
          </div>

          <div className="border border-border rounded-md p-8 bg-muted">
            <p className="text-sm text-muted-foreground">
              The course catalog is being prepared. Check back soon — we're building something good.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
