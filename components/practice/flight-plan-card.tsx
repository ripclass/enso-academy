'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, Plane } from 'lucide-react'
import { setExamDate } from '@/lib/practice/flight-plan'

/**
 * The study flight plan: everything works backward from the exam date. Three
 * regimes by distance: steady build (lessons + mixes + a weekly mock), the
 * consolidation window (finish content, simulate twice a week, autopsy each),
 * and EXAM WEEK, a stabilization protocol with an explicit stop rule against
 * panic-mocking. High-stakes adult learners self-sabotage late; the plan's
 * job in the final week is to prevent exactly that.
 */
export function FlightPlanCard({
  courseSlug,
  examDate,
  lessonsRemaining,
  readinessStatus,
}: {
  courseSlug: string
  examDate: string | null
  lessonsRemaining: number
  readinessStatus: string | null
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [dateInput, setDateInput] = useState(examDate ?? '')
  const [pending, startTransition] = useTransition()

  function save() {
    if (!dateInput) return
    startTransition(async () => {
      try {
        await setExamDate(courseSlug, dateInput)
        setEditing(false)
        router.refresh()
      } catch {
        /* leave the editor open */
      }
    })
  }

  const days = examDate
    ? Math.ceil((new Date(examDate + 'T00:00:00').getTime() - Date.now()) / 86_400_000)
    : null

  return (
    <div className="rounded-lg border-2 border-neutral-900 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Plane className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-neutral-900">Your flight plan</h2>
        </div>
        {examDate && !editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 font-mono text-2xs font-semibold uppercase tracking-widest text-neutral-400 transition-colors hover:text-primary"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            Exam: {examDate}
            {days !== null && days >= 0 && ` · ${days} day${days === 1 ? '' : 's'}`}
          </button>
        )}
      </div>

      {!examDate || editing ? (
        <div className="mt-3">
          <p className="text-sm leading-relaxed text-neutral-600">
            {examDate
              ? 'Update your exam date and the plan re-works itself backward from it.'
              : 'Set your exam date (booked or target) and the plan works backward from it: what to do this week, and what to stop doing in the last one.'}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="h-10 rounded-md border border-neutral-300 px-3 text-sm text-neutral-800"
            />
            <button
              type="button"
              onClick={save}
              disabled={pending || !dateInput}
              className="inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-40"
            >
              {pending ? 'Saving…' : 'Set the date'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-sm font-medium text-neutral-500 hover:text-primary"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      ) : days !== null && days < 0 ? (
        <p className="mt-3 text-sm leading-relaxed text-neutral-600">
          Your exam date has passed. If you sat it, congratulations; tell us how it went. If it
          moved, update the date above and the plan resumes.
        </p>
      ) : days !== null && days <= 7 ? (
        <ExamWeek days={days} readinessStatus={readinessStatus} />
      ) : days !== null && days <= 21 ? (
        <Plan
          intro={`Consolidation window: ${days} days out.`}
          items={[
            lessonsRemaining > 0
              ? `Finish the remaining ${lessonsRemaining} lesson${lessonsRemaining === 1 ? '' : 's'} in the next ${Math.max(1, days - 10)} days; nothing new after that.`
              : 'Content is done; everything now is retrieval and simulation.',
            'One Desk Mix every day (ten minutes; it chases your error ledger).',
            'Two full simulations a week, each followed by its autopsy before the next.',
            'A Sprint or Pace check on non-simulation days to keep timing automatic.',
          ]}
          readinessStatus={readinessStatus}
        />
      ) : (
        <Plan
          intro={`Steady build: ${days} days out.`}
          items={[
            lessonsRemaining > 0
              ? `${Math.max(2, Math.ceil(lessonsRemaining / Math.max(1, Math.floor((days! - 14) / 7))))} lessons a week finishes the course with two weeks to spare (${lessonsRemaining} remaining).`
              : 'Content is done early; shift the weight to mixed practice and simulations.',
            'Two Desk Mixes a week, minimum; they keep old ground warm while you learn new ground.',
            'One practice mock a week; from the halfway point, make it a full simulation with its autopsy.',
            'Watch the calibration line at office hours; certain-but-wrong is the first thing to fix.',
          ]}
          readinessStatus={readinessStatus}
        />
      )}
    </div>
  )
}

function Plan({
  intro,
  items,
  readinessStatus,
}: {
  intro: string
  items: string[]
  readinessStatus: string | null
}) {
  return (
    <div className="mt-3">
      <p className="text-sm font-semibold text-neutral-800">{intro}</p>
      <ul className="mt-2.5 space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-neutral-700">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            {it}
          </li>
        ))}
      </ul>
      {readinessStatus === 'ready' && (
        <p className="mt-3 font-mono text-2xs uppercase tracking-widest text-primary">
          Readiness signoff: ready. Hold the routine; do not overtrain.
        </p>
      )}
    </div>
  )
}

function ExamWeek({ days, readinessStatus }: { days: number; readinessStatus: string | null }) {
  return (
    <div className="mt-3">
      <p className="text-sm font-semibold text-accent">
        Exam week: {days === 0 ? 'today is the day.' : `${days} day${days === 1 ? '' : 's'} to go.`}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-neutral-600">
        The goal this week is stabilization, not improvement. New material now costs more than it
        gives.
      </p>
      <ul className="mt-2.5 space-y-1.5">
        {[
          'One Desk Mix a day: light retrieval, nothing new.',
          days > 3
            ? 'One final full simulation, no later than three days out, with its autopsy.'
            : 'No more full simulations. The stop rule is the plan: a panic mock costs more than it tells.',
          'One Sprint midweek to keep pacing warm; that is the only clock you need.',
          'The night before: one Desk Mix at most, then stop. Sleep beats cramming, every time.',
        ].map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-neutral-700">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            {it}
          </li>
        ))}
      </ul>
      {readinessStatus && readinessStatus !== 'ready' && (
        <p className="mt-3 font-mono text-2xs uppercase tracking-widest text-neutral-500">
          The signoff has not called you ready; if the exam can move, consider moving it.
        </p>
      )}
    </div>
  )
}
