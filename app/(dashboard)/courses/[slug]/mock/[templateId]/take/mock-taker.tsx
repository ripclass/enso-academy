'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Wordmark } from '@/components/brand/wordmark'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { submitMockExam, type MockQuestion } from '@/lib/mock/actions'
import { toast } from 'sonner'

type Props = {
  attemptId: string
  templateName: string
  questions: MockQuestion[]
  timeLimitMinutes: number
  courseSlug: string
}

function formatTime(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

export function MockTaker({ attemptId, templateName, questions, timeLimitMinutes, courseSlug }: Props) {
  const router = useRouter()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [flagged, setFlagged] = useState<Set<string>>(new Set())
  const [secondsRemaining, setSecondsRemaining] = useState(timeLimitMinutes * 60)
  const [submitting, setSubmitting] = useState(false)
  const [confirmSubmit, setConfirmSubmit] = useState(false)

  const startedAt = useRef(Date.now())
  const focusBlurCount = useRef(0)
  const navigationEvents = useRef<{ from: number; to: number; at: number }[]>([])
  const submittedRef = useRef(false)

  const total = questions.length
  const current = questions[currentIndex]
  const answeredCount = Object.keys(answers).length

  // --- submit ---------------------------------------------------------------
  const doSubmit = useCallback(async () => {
    if (submittedRef.current) return
    submittedRef.current = true
    setSubmitting(true)
    try {
      await submitMockExam({
        attemptId,
        answers,
        flags: Array.from(flagged),
        navigationEvents: navigationEvents.current,
        focusBlurCount: focusBlurCount.current,
        durationSeconds: Math.round((Date.now() - startedAt.current) / 1000),
      })
      router.push(`/courses/${courseSlug}/mock/results/${attemptId}`)
    } catch (err) {
      console.error(err)
      toast.error('Could not submit the mock. Try again.')
      submittedRef.current = false
      setSubmitting(false)
    }
  }, [attemptId, answers, flagged, courseSlug, router])

  // --- countdown timer (does not pause) -------------------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((s) => (s <= 1 ? 0 : s - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // auto-submit when the clock hits zero
  useEffect(() => {
    if (secondsRemaining === 0 && !submittedRef.current) {
      toast.info('Time is up — submitting your mock.')
      void doSubmit()
    }
  }, [secondsRemaining, doSubmit])

  // --- focus/blur tracking --------------------------------------------------
  useEffect(() => {
    function onBlur() {
      focusBlurCount.current += 1
    }
    window.addEventListener('blur', onBlur)
    return () => window.removeEventListener('blur', onBlur)
  }, [])

  // --- guard against accidental navigation away -----------------------------
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (Object.keys(answers).length > 0 && !submittedRef.current) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [answers])

  // --- handlers -------------------------------------------------------------
  function selectAnswer(optionText: string) {
    if (!current) return
    setAnswers((prev) => ({ ...prev, [current.id]: optionText }))
  }

  function toggleFlag() {
    if (!current) return
    setFlagged((prev) => {
      const next = new Set(prev)
      if (next.has(current.id)) next.delete(current.id)
      else next.add(current.id)
      return next
    })
  }

  function goTo(index: number) {
    if (index < 0 || index >= total || index === currentIndex) return
    navigationEvents.current.push({ from: currentIndex, to: index, at: Date.now() })
    setCurrentIndex(index)
  }

  function handleSubmitClick() {
    if (submitting) return
    if (!confirmSubmit) {
      setConfirmSubmit(true)
      return
    }
    void doSubmit()
  }

  const timerColor =
    secondsRemaining < 300
      ? 'text-destructive'
      : secondsRemaining < 600
        ? 'text-accent'
        : 'text-foreground'

  const flaggedCurrent = !!current && flagged.has(current.id)

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <header className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Wordmark />
            <span className="text-sm text-muted-foreground hidden sm:inline">{templateName}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-lg font-medium tabular-nums ${timerColor}`}>
              {formatTime(secondsRemaining)}
            </span>
            <Button size="sm" onClick={handleSubmitClick} disabled={submitting}>
              {submitting ? 'Submitting…' : confirmSubmit ? 'Confirm submit' : 'Submit mock'}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
        {/* question area */}
        <div className="space-y-6">
          {confirmSubmit && !submitting && (
            <Alert>
              <AlertDescription>
                {answeredCount} of {total} answered. Click <strong>Confirm submit</strong> in the header to
                finalise — this cannot be undone.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardContent className="p-8 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Question {currentIndex + 1} of {total}
                </div>
                <button
                  type="button"
                  onClick={toggleFlag}
                  className={`text-xs flex items-center gap-1 transition-colors ${
                    flaggedCurrent ? 'text-accent font-medium' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span aria-hidden>{flaggedCurrent ? '★' : '☆'}</span>
                  {flaggedCurrent ? 'Flagged' : 'Flag for review'}
                </button>
              </div>

              <h1 className="text-lg font-medium leading-relaxed">{current?.question_text}</h1>

              <div className="space-y-2">
                {current?.options.map((opt) => {
                  const selected = answers[current.id] === opt
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => selectAnswer(opt)}
                      className={`w-full text-left text-sm rounded-md border px-4 py-3 transition-colors ${
                        selected
                          ? 'border-primary bg-primary/5 text-foreground'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => goTo(currentIndex - 1)} disabled={currentIndex === 0}>
              Previous
            </Button>
            <Button variant="outline" onClick={() => goTo(currentIndex + 1)} disabled={currentIndex === total - 1}>
              Next
            </Button>
          </div>
        </div>

        {/* question grid panel */}
        <div className="lg:sticky lg:top-20 self-start">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                {answeredCount} of {total} answered
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {questions.map((q, i) => {
                  const isAnswered = answers[q.id] !== undefined
                  const isFlagged = flagged.has(q.id)
                  const isCurrent = i === currentIndex
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => goTo(i)}
                      className={`relative h-9 w-9 rounded-md text-xs tabular-nums transition-colors ${
                        isAnswered
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border text-muted-foreground hover:bg-muted'
                      } ${isCurrent ? 'ring-2 ring-ring ring-offset-1' : ''}`}
                    >
                      {i + 1}
                      {isFlagged && (
                        <span className="absolute -top-1.5 -right-1 text-accent text-xs leading-none" aria-hidden>
                          ★
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border pt-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm bg-primary inline-block" /> Answered
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm border border-border inline-block" /> Unanswered
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-accent">★</span> Flagged for review
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
