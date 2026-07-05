import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { startDeskMix } from '@/lib/practice/desk-mix'
import { DeskMixSession } from '@/components/practice/desk-mix-session'
import { WorkspaceChrome } from '@/components/courses/workspace-chrome'

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

  const admin = createAdminClient()
  const { data: course } = await admin
    .from('courses')
    .select('name, short_name')
    .eq('slug', slug)
    .maybeSingle()

  const mix = await startDeskMix(slug)

  return (
    <WorkspaceChrome
      slug={slug}
      shortName={course?.short_name ?? slug.toUpperCase()}
      courseName={course?.name ?? ''}
      activeKey="desk-mix"
    >
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
    </WorkspaceChrome>
  )
}
