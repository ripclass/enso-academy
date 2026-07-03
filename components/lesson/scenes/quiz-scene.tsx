'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import type { QuizSceneData, QuizQuestion } from '@/lib/lesson/scenes'
import { useShuffled } from './use-shuffled'

/**
 * `quiz` scene — an inline, formative knowledge check. NOT the faithful mock
 * exam (that is the mock engine). On answer it reveals correctness + the
 * explanation, and reports the result so the player can feed the knowledge
 * model (recordEvidence).
 *
 * Each question's options are shuffled per mount (useShuffled), so the correct
 * answer does not sit in its authored slot and is not memorisable by position
 * on a retake. Scoring keys on the option id, never its position.
 *
 * Once every question is answered, an in-flow Continue button advances the
 * lesson (when the player provides `onContinue`) — without it, the only way
 * forward was the transport bar's next arrow, which students did not find.
 */
export function QuizScene({
  data,
  onAnswer,
  onContinue,
}: {
  data: QuizSceneData
  onAnswer?: (question: QuizQuestion, selectedOptionId: string, correct: boolean) => void
  /** Advance the lesson — rendered as a Continue button after all questions are answered. */
  onContinue?: () => void
}) {
  const [answeredCount, setAnsweredCount] = useState(0)
  const allAnswered = answeredCount >= data.questions.length

  function handleAnswer(question: QuizQuestion, selectedOptionId: string, correct: boolean) {
    setAnsweredCount((n) => n + 1)
    onAnswer?.(question, selectedOptionId, correct)
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          Knowledge check
        </div>
        {data.intro && <p className="text-sm text-muted-foreground">{data.intro}</p>}
      </div>

      {data.questions.map((question, qi) => (
        <QuizQuestionCard key={qi} index={qi} question={question} onAnswer={handleAnswer} />
      ))}

      {allAnswered && onContinue && (
        <div className="flex justify-end animate-in fade-in duration-500">
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

function QuizQuestionCard({
  index,
  question,
  onAnswer,
}: {
  index: number
  question: QuizQuestion
  onAnswer?: (question: QuizQuestion, selectedOptionId: string, correct: boolean) => void
}) {
  // Selected option id, once answered (locked after the first pick).
  const [answered, setAnswered] = useState<string | null>(null)
  const options = useShuffled(question.options)

  function choose(optionId: string) {
    if (answered) return // already answered — locked
    setAnswered(optionId)
    onAnswer?.(question, optionId, optionId === question.correctOptionId)
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="font-medium">
        <span className="text-muted-foreground mr-1.5">{index + 1}.</span>
        {question.prompt}
      </div>
      <div className="space-y-2">
        {options.map((opt) => {
          const isSelected = answered === opt.id
          const isCorrect = opt.id === question.correctOptionId
          let cls = 'w-full text-left rounded-md border px-3 py-2 text-sm transition-colors'
          if (!answered) {
            cls += ' border-border hover:border-primary/50 hover:bg-muted cursor-pointer'
          } else if (isCorrect) {
            cls += ' border-primary/50 bg-primary-light text-primary'
          } else if (isSelected) {
            cls += ' border-destructive/50 bg-destructive/10 text-destructive'
          } else {
            cls += ' border-border opacity-60'
          }
          return (
            <button
              key={opt.id}
              type="button"
              disabled={!!answered}
              onClick={() => choose(opt.id)}
              className={cls}
            >
              {opt.text}
            </button>
          )
        })}
      </div>
      {answered && (
        <div
          className={`rounded-md px-3 py-2 text-sm ${
            answered === question.correctOptionId
              ? 'bg-primary-light text-foreground'
              : 'bg-muted text-foreground'
          }`}
        >
          <span className="font-semibold">
            {answered === question.correctOptionId ? 'Correct. ' : 'Not quite. '}
          </span>
          {question.explanation}
        </div>
      )}
    </div>
  )
}
