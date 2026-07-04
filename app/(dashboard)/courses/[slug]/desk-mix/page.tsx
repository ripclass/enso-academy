import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { startDeskMix } from '@/lib/practice/desk-mix'
import { DeskMixSession } from '@/components/practice/desk-mix-session'
import { AppHeader } from '@/components/in-app/app-header'

/**
 * Desk Mix: mixed-domain committed decisions with no lesson scaffolding —
 * the transfer bridge between lessons and full mocks. Enrolled students only.
 * Every page load assembles a fresh mix (weak-concept biased, domain-spread).
 */
export default async function DeskMixPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/courses/${slug}/desk-mix`)

  const mix = await startDeskMix(slug)

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <Link
          href={`/courses/${slug}`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to the course
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Desk Mix</h1>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-neutral-600">
            Eight decisions from across the whole course, in no order, with no lesson around
            them. You find out what ground you were on after you commit, because that is how
            the exam asks.
          </p>
        </div>

        {mix ? (
          <DeskMixSession courseSlug={slug} courseId={mix.courseId} questions={mix.questions} />
        ) : (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50/60 p-6 text-sm leading-relaxed text-neutral-600">
            Desk Mix needs an active enrollment in this course. Once you are enrolled and have
            a few lessons behind you, the mix draws on the full question bank and biases toward
            what your record says is slipping.
          </div>
        )}
      </main>
    </div>
  )
}
