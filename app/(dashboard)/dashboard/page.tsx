import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SignOutButton } from './sign-out-button'
import { Wordmark } from '@/components/brand/wordmark'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'

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
              Continue studying, or browse your active courses.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/courses" className={buttonVariants()}>
              Go to your courses
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
