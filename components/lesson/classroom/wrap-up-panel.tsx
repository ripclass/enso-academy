'use client'

import Link from 'next/link'
import { MessageSquare, Check, ArrowRight, Swords } from 'lucide-react'
import { LecturerAvatar, type LecturerVariant } from './lecturer-presence'

const CLOSING_QUESTIONS = [
  'Summarize the key takeaways',
  'How is this tested on the exam?',
  'Where do people go wrong here?',
]

/**
 * End-of-lesson "office hours". The lecturer opens the floor; classmates raise
 * hands (rendered by the ClassmateMoment overlay on top of this panel); then the
 * lecturer turns to the student (`user-turn`) — who can type or speak a question
 * — and finally moves on (`closing`). "Complete lesson" is the clear terminal
 * action and advances into the next lesson when there is one.
 */
export function WrapUpPanel({
  lecturerVariant,
  prompt,
  stage,
  speaking,
  hasNext,
  onAsk,
  onComplete,
  completing,
  caseHref,
  missedPrompts = [],
}: {
  lecturerVariant: LecturerVariant
  prompt: string
  stage: 'asking' | 'user-turn' | 'closing'
  speaking: boolean
  hasNext: boolean
  /** Open the Ask panel; with a question, pre-submit it. */
  onAsk: (question?: string) => void
  onComplete: () => void
  completing: boolean
  /** Deep-case lessons: a link to work this same case in Case Mode. */
  caseHref?: string
  /** Personal chips built from the concepts THIS session got wrong — shown
   *  ahead of the generic closers so the student's own gaps lead. */
  missedPrompts?: string[]
}) {
  const isUserTurn = stage === 'user-turn'
  const completeLabel = completing
    ? 'Saving…'
    : hasNext
      ? 'Complete & continue'
      : 'Complete lesson'

  return (
    <div className="flex h-full flex-col items-center justify-center text-center animate-in fade-in duration-500">
      <div className="font-mono text-2xs font-semibold uppercase tracking-widest text-neutral-400">
        Office hours
      </div>

      <div className="mt-5 flex flex-col items-center gap-3">
        <LecturerAvatar size={56} variant={lecturerVariant} speaking={speaking} />
        <p className="max-w-md text-balance text-lg font-medium leading-relaxed text-neutral-800">
          {prompt || 'Any questions before you go?'}
        </p>
      </div>

      {/* Ask — type or speak (the Ask panel carries the mic). Emphasised when
          it's explicitly the student's turn. */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => onAsk()}
          className={`inline-flex h-9 items-center gap-1.5 rounded-md px-3.5 text-sm font-semibold transition-colors ${
            isUserTurn
              ? 'bg-accent text-white hover:bg-accent/90'
              : 'border border-neutral-300 text-neutral-700 hover:border-primary hover:text-primary'
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          {isUserTurn ? 'Ask the lecturer' : 'Ask a question'}
        </button>
        {missedPrompts.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onAsk(q)}
            className="rounded-full border border-accent/40 bg-accent-light/60 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
          >
            {q}
          </button>
        ))}
        {CLOSING_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onAsk(q)}
            className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-600 transition-colors hover:border-primary hover:text-primary"
          >
            {q}
          </button>
        ))}
      </div>

      {isUserTurn && (
        <p className="mt-3 font-mono text-2xs text-accent">
          Your turn. Type or use the mic, and I’ll move on if you’re all set.
        </p>
      )}

      {/* Deep-case lessons: go work the same case you just studied. */}
      {caseHref && (
        <Link
          href={caseHref}
          className="mt-8 inline-flex h-11 items-center gap-2 rounded-lg border-2 border-primary bg-primary-light px-6 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
        >
          <Swords className="h-4 w-4" /> Now work this case in Case Mode
        </Link>
      )}

      {/* Terminal action */}
      <button
        type="button"
        onClick={onComplete}
        disabled={completing}
        className="mt-9 inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-7 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover disabled:opacity-60"
      >
        {hasNext ? <ArrowRight className="h-4 w-4" /> : <Check className="h-4 w-4" />}
        {completeLabel}
      </button>
      <p className="mt-3 font-mono text-2xs text-neutral-400">
        {hasNext
          ? 'Ask as many questions as you like, then continue to the next lesson.'
          : 'Ask as many questions as you like, then complete the lesson.'}
      </p>
    </div>
  )
}
