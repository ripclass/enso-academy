'use client'

import { useState } from 'react'
import { MessageCircle, Send } from 'lucide-react'
import { toast } from 'sonner'
import { askAboutMockQuestion } from '@/lib/mock/actions'

type Exchange = { question: string; answer: string }

/**
 * Post-exam "ask the lecturer" for a single reviewed question. Collapsed by
 * default; on expand the student can ask about this question and its concepts and
 * gets a grounded debrief answer. Local state only, no persistence: the review
 * page is a read-only artifact of a finished attempt.
 */
export function QuestionQa({
  attemptId,
  questionId,
}: {
  attemptId: string
  questionId: string
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState(false)
  const [exchanges, setExchanges] = useState<Exchange[]>([])

  async function send() {
    const question = draft.trim()
    if (!question || pending) return
    setPending(true)
    try {
      const { answer } = await askAboutMockQuestion(attemptId, questionId, question)
      setExchanges((prev) => [...prev, { question, answer }])
      setDraft('')
    } catch {
      toast.error('Could not reach the lecturer. Try again.')
    } finally {
      setPending(false)
    }
  }

  if (!open) {
    return (
      <div className="mt-4 border-t border-neutral-100 pt-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-neutral-500 transition-colors hover:text-primary"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Ask the lecturer about this question
        </button>
      </div>
    )
  }

  return (
    <div className="mt-4 border-t border-neutral-100 pt-4">
      <div className="flex items-center gap-1.5 font-mono text-2xs font-semibold uppercase tracking-widest text-neutral-400">
        <MessageCircle className="h-3.5 w-3.5" />
        Ask the lecturer
      </div>

      {exchanges.length > 0 && (
        <div className="mt-3 space-y-3">
          {exchanges.map((ex, i) => (
            <div key={i} className="space-y-2">
              <p className="text-sm font-medium text-neutral-700">{ex.question}</p>
              <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm leading-relaxed text-neutral-700">
                {ex.answer}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 space-y-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') send()
          }}
          rows={2}
          maxLength={500}
          placeholder="Why is my answer wrong here?"
          disabled={pending}
          className="w-full resize-none rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-primary focus:outline-none disabled:opacity-60"
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={send}
            disabled={pending || draft.trim().length === 0}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
            {pending ? 'Asking…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
