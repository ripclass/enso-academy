'use client'

/**
 * The confidence step of a committed decision: after picking an answer and
 * BEFORE the reveal, the student states how sure they are. Calibration is
 * metacognition the exam silently tests — a student who is "certain" and
 * wrong needs different repair than one who guessed right — so every
 * committed decision in the simulator carries this step.
 */
export type Confidence = 'low' | 'med' | 'high'

const CHIPS: { value: Confidence; label: string }[] = [
  { value: 'low', label: 'Not sure' },
  { value: 'med', label: 'Fairly sure' },
  { value: 'high', label: 'Certain' },
]

export function ConfidenceChips({ onPick }: { onPick: (c: Confidence) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2 animate-in fade-in duration-300">
      <span className="font-mono text-2xs uppercase tracking-widest text-neutral-400">
        Lock it in. How sure?
      </span>
      {CHIPS.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => onPick(c.value)}
          className="rounded-full border border-neutral-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:border-primary hover:text-primary"
        >
          {c.label}
        </button>
      ))}
    </div>
  )
}
