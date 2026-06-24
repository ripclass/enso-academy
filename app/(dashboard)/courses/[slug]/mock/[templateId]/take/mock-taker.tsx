'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Flag, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import { submitMockExam } from '@/lib/mock/actions'
import { type MockQuestion } from '@/lib/mock/types'
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
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

export function MockTaker({ attemptId, templateName, questions, timeLimitMinutes, courseSlug }: Props) {
  const router = useRouter()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
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
  const isMulti = current?.question_type === 'multiple_choice'

  // An answer counts only if it's a non-empty string or a non-empty array.
  const isAnswered = (qid: string): boolean => {
    const a = answers[qid]
    if (a === undefined || a === null) return false
    if (Array.isArray(a)) return a.length > 0
    return a !== ''
  }
  const answeredCount = questions.reduce((n, q) => (isAnswered(q.id) ? n + 1 : n), 0)

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
      toast.info('Time is up. Submitting your mock.')
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
  // Single-answer: store the chosen option id.
  function selectAnswer(optionId: string) {
    if (!current) return
    setAnswers((prev) => ({ ...prev, [current.id]: optionId }))
  }

  // Multi-select: add/remove the option id from the question's id array.
  function toggleAnswer(optionId: string) {
    if (!current) return
    setAnswers((prev) => {
      const existing = prev[current.id]
      const arr = Array.isArray(existing) ? existing : []
      const next = arr.includes(optionId)
        ? arr.filter((id) => id !== optionId)
        : [...arr, optionId]
      return { ...prev, [current.id]: next }
    })
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

  // "Cold Fidelity" — a sterile testing-centre palette, deliberately
  // off-brand from the editorial surfaces.
  const timerColor =
    secondsRemaining < 300
      ? 'text-red-400'
      : secondsRemaining < 600
        ? 'text-amber-400'
        : 'text-slate-100'

  const flaggedCurrent = !!current && flagged.has(current.id)
  const unansweredCount = total - answeredCount

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F2F5] text-slate-800 select-none">
      {/* Sterile exam header */}
      <header className="sticky top-0 z-10 bg-[#1E293B] border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div>
            <span className="text-2xs font-semibold uppercase tracking-widest text-slate-400 font-mono">
              Enso Academy &middot; Mock exam engine
            </span>
            <h1 className="text-sm font-bold text-slate-100">{templateName}</h1>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-right">
              <span className="block text-2xs font-mono uppercase tracking-wider text-slate-400">
                Time remaining
              </span>
              <span className={`text-lg font-bold font-mono tracking-wider tabular-nums ${timerColor}`}>
                {formatTime(secondsRemaining)}
              </span>
            </div>
            <button
              type="button"
              onClick={handleSubmitClick}
              disabled={submitting}
              className="rounded border border-red-800 bg-red-700 px-5 py-2.5 text-xs font-bold uppercase tracking-wider font-mono text-white hover:bg-red-600 transition-colors disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : confirmSubmit ? 'Confirm submit' : 'Submit mock'}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Question area */}
        <div className="space-y-5">
          {confirmSubmit && !submitting && (
            <div className="flex items-start gap-3 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-xs font-mono text-amber-800">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                {answeredCount} of {total} answered
                {unansweredCount > 0 && `; ${unansweredCount} unanswered question(s) will be graded as incorrect`}
                . Click <strong>Confirm submit</strong> in the header to finalise. This cannot be undone.
              </span>
            </div>
          )}

          <div className="rounded border border-slate-300 bg-white p-8 shadow-sm">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <span className="text-2xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                Question {currentIndex + 1} of {total}
              </span>
              <button
                type="button"
                onClick={toggleFlag}
                className={`inline-flex items-center gap-1.5 rounded border px-3 py-1.5 text-2xs font-semibold uppercase tracking-wider font-mono transition-colors ${
                  flaggedCurrent
                    ? 'border-amber-400 bg-amber-50 text-amber-800'
                    : 'border-slate-200 bg-white text-slate-500 hover:text-slate-700'
                }`}
              >
                <Flag className="h-3.5 w-3.5" />
                {flaggedCurrent ? 'Flagged' : 'Flag'}
              </button>
            </div>

            <h2 className="mt-5 text-base font-semibold leading-relaxed text-slate-800">
              {current?.question_text}
            </h2>

            {isMulti && (
              <p className="mt-3 text-2xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
                {current?.select_count && current.select_count > 1
                  ? `Select ${current.select_count}.`
                  : 'Select all that apply.'}
              </p>
            )}

            <div className="mt-5 space-y-2.5">
              {current?.options.map((opt) => {
                const currentAnswer = answers[current.id]
                const selected = isMulti
                  ? Array.isArray(currentAnswer) && currentAnswer.includes(opt.id)
                  : currentAnswer === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => (isMulti ? toggleAnswer(opt.id) : selectAnswer(opt.id))}
                    className={`w-full text-left text-sm rounded border px-4 py-3 transition-colors flex items-start gap-3 ${
                      selected
                        ? 'border-slate-600 bg-slate-100 text-slate-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center border text-2xs font-bold ${
                        isMulti ? 'rounded-[3px]' : 'rounded-full'
                      } ${selected ? 'border-slate-700 bg-slate-700 text-white' : 'border-slate-300 bg-white'}`}
                    >
                      {selected ? (isMulti ? '✓' : '●') : ''}
                    </span>
                    <span>{opt.text}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => goTo(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="inline-flex h-9 items-center gap-1 rounded border border-slate-300 bg-white px-4 text-xs font-semibold font-mono text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <button
              type="button"
              onClick={() => goTo(currentIndex + 1)}
              disabled={currentIndex === total - 1}
              className="inline-flex h-9 items-center gap-1 rounded border border-slate-300 bg-white px-4 text-xs font-semibold font-mono text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Question navigator */}
        <div className="lg:sticky lg:top-20 self-start">
          <div className="rounded border border-slate-300 bg-white p-4">
            <h2 className="text-2xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3">
              Question navigator
            </h2>
            <div className="grid grid-cols-6 gap-1.5">
              {questions.map((q, i) => {
                const answered = isAnswered(q.id)
                const isFlagged = flagged.has(q.id)
                const isCurrent = i === currentIndex
                let cls = 'bg-slate-50 border-slate-200 text-slate-600'
                if (isCurrent) cls = 'bg-blue-900 border-blue-900 text-white'
                else if (isFlagged) cls = 'bg-amber-100 border-amber-300 text-amber-800'
                else if (answered) cls = 'bg-slate-200 border-slate-300 text-slate-800'
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => goTo(i)}
                    className={`relative h-9 rounded border text-xs font-bold font-mono tabular-nums transition-colors ${cls}`}
                  >
                    {i + 1}
                    {isFlagged && (
                      <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
                    )}
                  </button>
                )
              })}
            </div>
            <div className="mt-4 space-y-1.5 border-t border-slate-200 pt-3 text-2xs font-mono text-slate-500">
              <div className="flex justify-between">
                <span>ANSWERED</span>
                <span className="font-bold text-slate-700">{answeredCount}</span>
              </div>
              <div className="flex justify-between">
                <span>UNANSWERED</span>
                <span className="font-bold text-slate-700">{unansweredCount}</span>
              </div>
              <div className="flex justify-between">
                <span>FLAGGED</span>
                <span className="font-bold text-amber-700">{flagged.size}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
