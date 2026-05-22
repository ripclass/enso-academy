import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { startMockExam } from '@/lib/mock/actions'
import { MockTaker } from './mock-taker'

type Props = { params: Promise<{ slug: string; templateId: string }> }

export const metadata = { title: 'Mock exam' }

export default async function MockTakePage({ params }: Props) {
  const { slug, templateId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/courses/${slug}/mock/${templateId}/take`)

  // Creates the attempt and returns the question set for this sitting.
  const { attemptId, templateName, questions, timeLimitMinutes } = await startMockExam(templateId)

  return (
    <MockTaker
      attemptId={attemptId}
      templateName={templateName}
      questions={questions}
      timeLimitMinutes={timeLimitMinutes}
      courseSlug={slug}
    />
  )
}
