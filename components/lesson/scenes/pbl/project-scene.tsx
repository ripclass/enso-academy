'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { ClipboardList, Send, RefreshCw } from 'lucide-react'
import { LecturerAvatar } from '@/components/lesson/classroom/lecturer-presence'
import type { PblSpec } from '@/lib/lesson/scenes'

const BAND_STYLE: Record<string, string> = {
  Strong: 'bg-primary text-white',
  Developing: 'bg-accent text-white',
  'Needs work': 'bg-destructive text-white',
}

/**
 * A project-based learning scene: a brief + rubric, the student writes a
 * submission, and an AI mentor grades it (band + feedback). Resubmittable.
 */
export function ProjectScene({
  title,
  summary,
  spec,
  onGrade,
}: {
  title: string
  summary: string
  spec: PblSpec
  onGrade: (spec: PblSpec, submission: string) => Promise<{ band: string; feedback: string }>
}) {
  const [submission, setSubmission] = useState('')
  const [grading, setGrading] = useState(false)
  const [result, setResult] = useState<{ band: string; feedback: string } | null>(null)

  async function submit() {
    if (!submission.trim() || grading) return
    setGrading(true)
    try {
      setResult(await onGrade(spec, submission))
    } catch {
      setResult({ band: 'Reviewed', feedback: 'Could not reach the mentor just now. Please try again.' })
    } finally {
      setGrading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-primary">{title}</h2>
        {summary && <p className="text-sm text-muted-foreground">{summary}</p>}
      </div>

      {/* Brief */}
      <div className="rounded-lg border border-neutral-200 bg-neutral-50/60 p-4">
        <div className="mb-2 flex items-center gap-2 font-mono text-2xs font-bold uppercase tracking-widest text-neutral-500">
          <ClipboardList className="h-3.5 w-3.5" /> Project brief
        </div>
        <div className="text-sm leading-relaxed text-neutral-700 [&_p]:mb-2 [&_p:last-child]:mb-0">
          <ReactMarkdown>{spec.brief}</ReactMarkdown>
        </div>
        <p className="mt-3 text-sm font-semibold text-neutral-900">{spec.task}</p>
        {spec.deliverable && (
          <p className="mt-1 text-sm text-neutral-500">Deliverable: {spec.deliverable}</p>
        )}
      </div>

      {/* Rubric */}
      <div>
        <div className="mb-1.5 font-mono text-2xs font-bold uppercase tracking-widest text-neutral-400">
          What a strong answer covers
        </div>
        <ul className="space-y-1 text-sm text-neutral-600">
          {spec.rubric.map((r, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-primary">•</span>
              {r}
            </li>
          ))}
        </ul>
      </div>

      {/* Submission */}
      <div>
        <textarea
          value={submission}
          onChange={(e) => setSubmission(e.target.value)}
          disabled={grading}
          rows={6}
          placeholder="Write your response here…"
          className="w-full rounded-lg border border-neutral-200 bg-white p-3 text-sm leading-relaxed text-neutral-800 placeholder-neutral-400 focus:border-primary focus:outline-none disabled:opacity-60"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={submit}
            disabled={grading || !submission.trim()}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {grading ? (
              'Mentor is reviewing…'
            ) : result ? (
              <>
                Resubmit <RefreshCw className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                Submit for review <Send className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mentor feedback */}
      {result && (
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm animate-in fade-in slide-in-from-bottom-1 duration-300">
          <div className="flex items-center gap-3 border-b border-neutral-100 pb-3">
            <LecturerAvatar size={36} />
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-neutral-900">Mentor feedback</span>
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-2xs font-bold uppercase tracking-wider ${
                  BAND_STYLE[result.band] ?? 'bg-neutral-100 text-neutral-600'
                }`}
              >
                {result.band}
              </span>
            </div>
          </div>
          <div className="mt-3 text-sm leading-relaxed text-neutral-800 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mb-1">
            <ReactMarkdown>{result.feedback}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}
