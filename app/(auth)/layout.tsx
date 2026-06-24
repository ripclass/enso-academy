import Link from 'next/link'
import { Logo } from '@/components/brand/logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <header className="border-b border-border bg-background">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link href="/" aria-label="Enso Academy">
            <Logo />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      <footer className="py-6">
        <div className="max-w-6xl mx-auto px-6 text-sm text-muted-foreground text-center">
          Exam preparation, built from primary sources.
        </div>
      </footer>
    </div>
  )
}
