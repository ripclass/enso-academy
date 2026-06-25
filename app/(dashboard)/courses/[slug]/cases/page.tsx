import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { Logo } from '@/components/brand/logo'
import { CaseDesk } from '@/components/cases/case-desk'
import { REAL_CASE_META } from '@/lib/cases/generate'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ case?: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  return { title: `Case Mode · ${slug.toUpperCase()}` }
}

export default async function CasesPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { case: caseId } = await searchParams
  const admin = createAdminClient()

  const { data: course } = await admin
    .from('courses')
    .select('id, name, short_name, status')
    .eq('slug', slug)
    .single()
  if (!course || course.status !== 'published') notFound()

  // Enrolled owners unlock the real-case packs; everyone gets the synthetic taster.
  let unlocked = false
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    const { data: enr } = await admin
      .from('enrollments')
      .select('status')
      .eq('student_id', user.id)
      .eq('course_id', course.id)
      .maybeSingle()
    unlocked = enr?.status === 'active'
  }

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
            {unlocked ? 'Back to course' : 'The full course'}
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
          {course.short_name} Case Mode
        </span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Work the case</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-neutral-600">
          A fresh financial-crime case every time. Read the brief, spot the red flags, adjudicate the
          screening alert, then make the call. You get scored on your judgment, not your memory.{' '}
          {unlocked
            ? 'Your course unlocks the real-case packs: 1MDB, Danske Estonia, Westpac, worked the way a practitioner would.'
            : 'These are the warm-up cases. The real-case packs are part of the course.'}
        </p>

        <div className="mt-10">
          <CaseDesk
            courseSlug={slug}
            unlocked={unlocked}
            realCases={REAL_CASE_META}
            initialCaseId={caseId}
          />
        </div>
      </main>
    </div>
  )
}
