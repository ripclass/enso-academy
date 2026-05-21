import { Wordmark } from '@/components/brand/wordmark'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Wordmark />
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className={buttonVariants({ size: 'sm' })}
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight">
            Professional certification preparation, reimagined.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Enso Academy teaches CAMS, CDCS, CCAS, and other high-stakes certifications through AI-rendered interactive classrooms. Built from primary regulatory sources. Calibrated against real exams.
          </p>
          <p className="text-sm text-muted-foreground pt-4">
            Currently in private build. Public launch soon.
          </p>
        </div>
      </main>

      <footer className="border-t border-border py-6">
        <div className="max-w-6xl mx-auto px-6 text-sm text-muted-foreground text-center">
          An Enso Intelligence Inc. product.
        </div>
      </footer>
    </div>
  )
}
