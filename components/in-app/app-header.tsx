import Link from 'next/link'
import { Logo } from '@/components/brand/logo'
import { SignOutButton } from './sign-out-button'

/**
 * Shared in-app header — the brand mark, primary nav, and sign-out.
 * `context` renders an optional breadcrumb / location line beside the logo.
 */
export function AppHeader({
  email,
  context,
}: {
  email?: string
  context?: React.ReactNode
}) {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-5 min-w-0">
          <Link href="/dashboard" aria-label="Enso Academy">
            <Logo />
          </Link>
          {context && (
            <div className="hidden md:block text-sm text-neutral-500 truncate font-sans">
              {context}
            </div>
          )}
        </div>
        <div className="flex items-center gap-5 shrink-0">
          <Link
            href="/courses"
            className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors"
          >
            Courses
          </Link>
          <Link
            href="/dashboard"
            className="hidden sm:inline text-sm font-medium text-neutral-600 hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
          {email && (
            <span className="hidden lg:inline text-2xs font-mono text-neutral-400 truncate max-w-[180px]">
              {email}
            </span>
          )}
          <SignOutButton />
        </div>
      </div>
    </header>
  )
}
