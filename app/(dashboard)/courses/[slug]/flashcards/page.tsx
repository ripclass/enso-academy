import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { Logo } from '@/components/brand/logo'
import { getStudyDeck } from '@/lib/flashcards/actions'
import { StudyDeck } from '@/components/flashcards/study-deck'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  return { title: `Flashcards · ${slug.toUpperCase()}` }
}

export default async function FlashcardsPage({ params }: Props) {
  const { slug } = await params
  const admin = createAdminClient()

  const { data: course } = await admin
    .from('courses')
    .select('id, name, short_name, status')
    .eq('slug', slug)
    .single()
  if (!course || course.status !== 'published') notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let enrolled = false
  if (user) {
    const { data: enr } = await admin
      .from('enrollments')
      .select('status')
      .eq('student_id', user.id)
      .eq('course_id', course.id)
      .maybeSingle()
    enrolled = enr?.status === 'active'
  }

  const deck = enrolled ? await getStudyDeck(slug) : null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-foreground bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-3">
          <Link href="/" aria-label="Enso Academy home">
            <Logo />
          </Link>
          <Link
            href={`/courses/${slug}`}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-xs font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            Back to course
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href={`/courses/${slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3 w-3" /> Back to course
        </Link>

        <span className="mt-6 block text-2xs font-semibold uppercase tracking-widest text-accent font-mono">
          {course.short_name} Flashcards
        </span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Study the vocabulary</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-neutral-600">
          Every term in the course, as a flashcard. Spaced repetition brings the ones you find hard
          back sooner and lets the ones you know drift further out, so your time goes where it counts.
        </p>

        <div className="mt-10">
          {enrolled && deck ? (
            <StudyDeck courseSlug={slug} initialDeck={deck} />
          ) : (
            <div className="rounded-lg border-2 border-neutral-900 bg-white p-6">
              <h2 className="text-lg font-bold text-neutral-900">
                {user ? 'Enrol to study the deck' : 'Sign in to study the deck'}
              </h2>
              <p className="mt-1.5 text-sm text-neutral-600">
                Flashcards are part of the course. {user ? 'Enrol' : 'Sign in and enrol'} to build your
                deck and track what you have learned.
              </p>
              <Link
                href={`/courses/${slug}`}
                className="mt-4 inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                {user ? 'See the course' : 'Sign in'}
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
