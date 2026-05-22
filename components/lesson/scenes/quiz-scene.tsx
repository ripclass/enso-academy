'use client'

import { useState } from 'react'
import type { QuizSceneData, QuizQuestion } from '@/lib/lesson/scenes'

/**
 * `quiz` scene — an inline, formative knowledge check. NOT the faithful mock
 * exam (that is the mock engine). On answer it reveals correctness + the
 * explanation, and reports the result so the player can feed the knowledge
 * model (recordEvidence).
 */
export function QuizScene({
  data,
  onAnswer,
}: {
  data: QuizSceneData
  onAnswer?: (question: QuizQuestion, selectedOptionId: string, correct: boolean) => void
}) {
  // Per-question selected option id, once answered (locked after first pick).
  const [answers, setAnswers] = useState<Record<number, string>>({})

  function choose(qi: number, question: QuizQuestion, optionId: string) {
    if (answers[qi]) return // already answered — locked
    setAnswers((prev) => ({ ...prev, [qi]: optionId }))
    onAnswer?.(question, optionId, optionId === question.correctOptionId)
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          Knowledge check
        </div>
        {data.intro && <p className="text-sm text-muted-foreground">{data.intro}</p>}
      </div>

      {data.questions.map((question, qi) => {
        const answered = answers[qi]
        return (
          <div key={qi} className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="font-medium">
              <span className="text-muted-foreground mr-1.5">{qi + 1}.</span>
              {question.prompt}
            </div>
            <div className="space-y-2">
              {question.options.map((opt) => {
                const isSelected = answered === opt.id
                const isCorrect = opt.id === question.correctOptionId
                let cls =
                  'w-full text-left rounded-md border px-3 py-2 text-sm transition-colors'
                if (!answered) {
                  cls += ' border-border hover:border-primary/50 hover:bg-muted cursor-pointer'
                } else if (isCorrect) {
                  cls += ' border-green-600/50 bg-green-50 text-green-900'
                } else if (isSelected) {
                  cls += ' border-red-500/50 bg-red-50 text-red-900'
                } else {
                  cls += ' border-border opacity-60'
                }
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={!!answered}
                    onClick={() => choose(qi, question, opt.id)}
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
                    ? 'bg-green-50 text-green-900'
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
      })}
    </div>
  )
}
