// lib/mock/readiness-band.ts
//
// Maps a raw practice-mock percentage to an exam-readiness band anchored to the
// REAL ACAMS standard. The official candidate handbooks (verified 2026-07-04)
// state "the passing score ... is 75" without naming a unit; candidate Pearson
// VUE score reports denominate it in scaled-score units, and the team's
// scaled-to-raw estimate puts the real pass line around 62.5% raw. The bands
// below are deliberately conservative: we would rather under-call readiness
// than tell a candidate they will pass and be wrong. A bare raw percent (e.g.
// "68%") styled like the real score misleads in both directions, so the
// results page leads with the band.

export type ReadinessBandKey = 'ready' | 'on-track' | 'borderline' | 'not-ready'

export type ReadinessBand = {
  key: ReadinessBandKey
  label: string
  blurb: string
  /** Visual tone for the page: 'pass' (teal), 'warn' (neutral), 'fail' (coral). */
  tone: 'pass' | 'warn' | 'fail'
}

/** The real exam's approximate raw-equivalent pass line (75 scaled ~ 62.5% raw). */
export const REAL_PASS_RAW = 62.5

/**
 * Band a single attempt's raw percent. Cut points, relative to the ~62.5% real
 * pass line:
 *   >= 75  exam-ready (comfortable margin; also the conservative readiness target)
 *   >= 67  on track (clear of the line, thin margin)
 *   >= 60  borderline (straddling the line, could go either way)
 *   <  60  not yet ready (below the line)
 */
export function readinessBand(rawPercent: number): ReadinessBand {
  if (rawPercent >= 75) {
    return {
      key: 'ready',
      label: 'Exam-ready',
      blurb:
        'Comfortably above the real exam pass line, with margin for exam-day variance. Keep practising to hold this level.',
      tone: 'pass',
    }
  }
  if (rawPercent >= 67) {
    return {
      key: 'on-track',
      label: 'On track',
      blurb:
        'Above the real exam pass line, but without much margin. A weaker day could fall short. Lift your weak domains before you book.',
      tone: 'pass',
    }
  }
  if (rawPercent >= 60) {
    return {
      key: 'borderline',
      label: 'Borderline',
      blurb:
        'Right around the real exam pass line. This could go either way on the day. Not yet a safe place to sit the exam.',
      tone: 'warn',
    }
  }
  return {
    key: 'not-ready',
    label: 'Not yet ready',
    blurb:
      'Below the real exam pass line. Work the lessons and challenges in your weak domains, then retest.',
    tone: 'fail',
  }
}
