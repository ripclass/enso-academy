import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { startMockExam, MOCK_PAYWALL } from '@/lib/mock/actions'
import { MockTaker } from './mock-taker'

type Props = { params: Promise<{ slug: string; templateId: string }> }

export const metadata = { title: 'Mock exam' }

export default async function MockTakePage({ params }: Props) {
  const { slug, templateId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/courses/${slug}/mock/${templateId}/take`)

  // Creates the attempt and returns the question set for this sitting. Consuming
  // an attempt is part of startMockExam; if none remain it throws MOCK_PAYWALL,
  // in which case we send the student back to the mock surface to buy more.
  let result
  try {
    result = await startMockExam(templateId)
  } catch (err) {
    if (err instanceof Error && err.message === MOCK_PAYWALL) {
      redirect(`/courses/${slug}/mock`)
    }
    throw err
  }
  const { attemptId, templateName, questions, timeLimitMinutes } = result

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
