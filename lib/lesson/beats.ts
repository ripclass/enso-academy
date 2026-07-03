// Shared beat segmentation.
//
// A "beat" is one viewport-sized chunk of a scene. The beat RENDERER
// (components/lesson/classroom/beat-pager.tsx) and the player's per-beat AUDIO
// queue both segment a scene the same way here — so the on-screen beat and the
// narration clip that plays for it are always the exact same unit, and sync is
// exact by construction (no estimating audio position from progress).
//
// - Reading scenes: the body splits into paragraph beats (each IS its narration).
// - Slide scenes: items page in groups, and the single authored narration is
//   split into one contiguous sentence-chunk per page (so each page gets its
//   own clip). Falls back to a single clip when the narration is too short.

import { splitSentences } from './scenes'

/** Character budget per reading beat — ~3-5 sentences, fits the stage. */
export const READING_BUDGET = 620

/** Items shown per slide beat (page). */
export const SLIDE_ITEMS_PER_BEAT = 4

export type SlideBeat = { from: number; to: number; narration: string }

/**
 * Page a slide's items into beats and assign each page a contiguous chunk of
 * the narration (split by sentences, proportional to the pages). Returns one
 * beat per page; `narration` is '' for a page when the script can't be split
 * that finely (the caller then falls back to a single clip).
 */
export function slideBeats(narration: string, itemCount: number): SlideBeat[] {
  const pages = Math.max(1, Math.ceil(itemCount / SLIDE_ITEMS_PER_BEAT))
  const sents = splitSentences(narration ?? '')
  const beats: SlideBeat[] = []
  for (let p = 0; p < pages; p++) {
    const from = p * SLIDE_ITEMS_PER_BEAT
    const to = Math.min(itemCount, from + SLIDE_ITEMS_PER_BEAT)
    // One narration clip for the whole slide when there's a single page.
    if (pages === 1) {
      beats.push({ from, to, narration: (narration ?? '').trim() })
      continue
    }
    const s0 = Math.floor((p * sents.length) / pages)
    const s1 = Math.floor(((p + 1) * sents.length) / pages)
    beats.push({ from, to, narration: sents.slice(s0, s1).join(' ').trim() })
  }
  return beats
}

// Abbreviations after which a period does NOT end a sentence — legal prose is
// full of them ("18 U.S.C.", "United States v. Smith", "No. 23-178",
// "et seq."). Any single capital letter + period (initialisms) is guarded too.
const ABBREV_TAIL =
  /(?:\b(?:v|vs|No|Nos|Inc|Ltd|Co|Corp|Mr|Ms|Mrs|Dr|St|Art|Arts|Sec|Secs|Rec|Recs|para|paras|approx|etc|cf|Jr|Sr|al|seq|ibid|id|ch|Ch|pt|Pt)|\be\.g|\bi\.e|\b[A-Z])\.["')\]]*$/

/**
 * Split one prose paragraph into sentences, preserving the original text
 * verbatim (unlike splitSentences, which strips markdown for subtitles).
 * Splits on captured delimiters so no characters can be dropped; fragments
 * that end in an abbreviation are merged into the following sentence.
 */
function splitProseSentences(text: string): string[] {
  // Capturing split: parts alternate [content, delimiter, content, ...] and
  // concatenating all parts reproduces the input exactly.
  const parts = text.split(/([.!?]+["')\]]*(?:\s+|$))/)
  const fragments: string[] = []
  for (let i = 0; i < parts.length; i += 2) {
    const frag = (parts[i] ?? '') + (parts[i + 1] ?? '')
    if (frag) fragments.push(frag)
  }
  if (fragments.length <= 1) return [text]
  const out: string[] = []
  let cur = ''
  for (const frag of fragments) {
    cur = cur ? cur + frag : frag
    if (!ABBREV_TAIL.test(cur.trimEnd())) {
      out.push(cur.trim())
      cur = ''
    }
  }
  if (cur.trim()) out.push(cur.trim())
  return out.length > 0 ? out : [text]
}

/** Pack a list of units into beats no longer than the budget. */
function groupToBudget(units: string[], sep: string): string[] {
  const out: string[] = []
  let cur = ''
  for (const u of units) {
    const candidate = cur ? `${cur}${sep}${u}` : u
    if (cur && candidate.length > READING_BUDGET) {
      out.push(cur)
      cur = u
    } else {
      cur = candidate
    }
  }
  if (cur) out.push(cur)
  return out
}

/**
 * Break an oversized block into budget-sized chunks. Generated lessons often
 * author a whole reading as one long paragraph (sometimes with an embedded
 * list); without this, that reading is a single scrolling beat. List items
 * stay atomic; long prose lines are chunked at sentence boundaries.
 */
function chunkOversizedBlock(block: string): string[] {
  const lines = block
    .split('\n')
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0)
  const units: string[] = []
  for (const line of lines) {
    const isListItem = /^\s*(?:[-*+]|\d+[.)])\s/.test(line)
    if (!isListItem && line.length > READING_BUDGET) {
      units.push(...splitProseSentences(line))
    } else {
      units.push(line)
    }
  }
  if (units.length <= 1) return [block]
  return groupToBudget(units, '\n')
}

/** Group markdown blocks (split on blank lines) into beats under a char budget. */
export function readingBeats(body: string): string[] {
  const rawBlocks = body
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)
  if (rawBlocks.length === 0) return body.trim() ? [body.trim()] : []
  // Oversized blocks are chunked to the budget first so a one-paragraph
  // reading still pages as blocks instead of one scrolling wall.
  const blocks = rawBlocks.flatMap((block) =>
    block.length > READING_BUDGET ? chunkOversizedBlock(block) : [block],
  )
  const beats: string[] = []
  let cur = ''
  for (const block of blocks) {
    const candidate = cur ? `${cur}\n\n${block}` : block
    // A single block longer than the budget gets its own beat.
    if (cur && candidate.length > READING_BUDGET) {
      beats.push(cur)
      cur = block
    } else {
      cur = candidate
    }
  }
  if (cur) beats.push(cur)
  return beats
}
