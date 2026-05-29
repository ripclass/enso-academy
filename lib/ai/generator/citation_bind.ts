// lib/ai/generator/citation_bind.ts
//
// Path-2 cycle 2 — the substring-verified citation bind step.
//
// Catches the failure mode that surfaced repeatedly in the CAMS 1.3 Path-1
// iteration: a factual claim appears in a scene (often a slide item or
// narration), but no citation in scope contains the distinguishing substring
// that would anchor it. The methodology gate 6c already catches the
// blanket-no-citation case for numeric claims. citation_bind goes further:
// for structured factual references (statute citations, case names, named
// institutions, named publications), it verifies that at least one citation
// label in scope contains the claim's bind key.
//
// Scope of candidate citations for a claim:
//   LESSON-WIDE — any reading scene's citations[] in the artifact.
//
// Lesson-wide scope is the pragmatic calibration for structured-reference
// binding: a statute introduced in a slide (e.g. UNSCR 1373 in a definition
// slide) is structurally fine when the full primary-source citation lives in
// a later reading scene where the statute is operationally most relevant.
// Strict same-or-adjacent scope produces false positives on that pattern.
// The strict scope rule remains in effect for numeric claims via gate 6c
// (validate_gates.ts), where vagueness is the failure mode rather than
// distance-to-citation.
//
// Output is a GateResult that wires cleanly into runGates() — the bind
// becomes a 7th gate in the validation report. Soft outcome: a small number
// of unbound claims FLAGs; pass when fully bound. The bind never produces
// FAIL on its own — it produces signal for the reviewer / orchestrator.
//
// Pure function. Server-only by convention (lib/ai/*).

import type { LessonArtifact, GeneratedScene } from './types'
import type { GateResult } from './validate_gates'

// ── Internal shapes ───────────────────────────────────────────────────────

type ReadingData = { body?: unknown; citations?: unknown }
type SlideData = { narration?: unknown; items?: unknown; heading?: unknown; subheading?: unknown }
type QuizData = { intro?: unknown; questions?: unknown }
type Citation = { label?: unknown; url?: unknown }
type SlideItem = { icon?: unknown; label?: unknown; text?: unknown }
type QuizQ = { prompt?: unknown; options?: unknown; correctOptionId?: unknown; explanation?: unknown }

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)
const isStr = (v: unknown): v is string => typeof v === 'string'
const isArr = (v: unknown): v is unknown[] => Array.isArray(v)

// ── Claim extraction ──────────────────────────────────────────────────────
//
// A claim is a distinctive factual reference that should be locatable in at
// least one in-scope citation by substring match. We extract structured-
// reference kinds (statute, case, EO, named publication, named institution)
// rather than free-text claims — false positives on free text would make the
// bind unusable. Numeric / quantitative claims are deliberately left to
// gate 6c (validate_gates.ts) which uses a different anchoring rule.

export type ClaimKind =
  | 'statute_us'
  | 'statute_cfr'
  | 'statute_fatf'
  | 'statute_un'
  | 'statute_uk'
  | 'statute_bd'
  | 'statute_eu'
  | 'case'
  | 'executive_order'
  | 'named_publication'

export type ExtractedClaim = {
  sceneIndex: number
  sceneTitle: string
  sceneType: string
  location: string // 'body' | 'narration' | 'item[N].text' | 'item[N].label' | 'quiz-q[N].prompt' | 'quiz-q[N].explanation'
  kind: ClaimKind
  raw: string // exact matched substring
  bindKeys: string[] // normalised keys — claim is bound if ANY key substring-matches ANY candidate label
}

type ClaimPattern = {
  kind: ClaimKind
  re: RegExp
  /** Build the bind keys from the regex match — defaults to the whole match, lowercased + whitespace-normalised. Return multiple aliases (e.g. "TA 2000" + "Terrorism Act 2000") to cover abbreviation pairs. */
  toBindKeys?: (m: RegExpMatchArray) => string[]
}

const normalise = (s: string): string => s.toLowerCase().replace(/\s+/g, ' ').trim()

/** Strip honorifics, the trailing case-citation noise, and lowercase for substring match. */
function caseBindKey(m: RegExpMatchArray): string {
  // Take only the "X v. Y" head; drop trailing dates / cite numbers.
  const head = m[0].split(/,|\(/)[0]
  return normalise(head)
}

/** UK statute abbreviation → full-name aliases. */
const UK_STATUTE_EXPANSIONS: Record<string, string> = {
  POCA: 'proceeds of crime act',
  MLR: 'money laundering, terrorist financing and transfer of funds',
  TA: 'terrorism act',
  ATCSA: 'anti-terrorism, crime and security act',
  CTA: 'counter-terrorism act',
}

/** Bangladesh statute abbreviation → full-name aliases. */
const BD_STATUTE_EXPANSIONS: Record<string, string> = {
  ATA: 'anti-terrorism act',
  MLPA: 'money laundering prevention act',
}

const CLAIM_PATTERNS: ClaimPattern[] = [
  // U.S. Code: 18 U.S.C. § 2339B, 31 U.S.C. §§ 5311–5336
  {
    kind: 'statute_us',
    re: /\b(\d{1,3})\s+U\.?\s*S\.?\s*C\.?\s*§+\s*(\d+[A-Za-z]?(?:\(\w+\))*)\b/gi,
    toBindKeys: (m) => {
      const title = m[1]
      const section = m[2].toLowerCase()
      return [
        `${title} u.s.c. § ${section}`,
        `${title} u.s.c. §§ ${section}`,
        `${title} usc § ${section}`,
        `§ ${section}`,
      ]
    },
  },
  // 31 CFR Chapter X, 31 CFR 1020.320, 31 CFR 1010.230
  {
    kind: 'statute_cfr',
    re: /\b(\d{1,3})\s+C\.?\s*F\.?\s*R\.?\s*(?:Chapter\s+[IVX]+|§?\s*(\d+(?:\.\d+)?))/gi,
    toBindKeys: (m) => {
      const t = normalise(m[0])
      return [t, t.replace(/\bcfr\b/i, 'c.f.r.'), t.replace(/\bc\.f\.r\.\b/i, 'cfr')]
    },
  },
  // FATF Recommendation 5, FATF R.10, FATF Rs. 22-23, FATF Recommendations 9–23, INR.15
  {
    kind: 'statute_fatf',
    re: /\bFATF\s+R(?:ecommendation)?s?\.?\s*\d+(?:[–-]\d+)?\b|\bINR\.?\s*\d+\b/gi,
    toBindKeys: (m) => {
      const t = normalise(m[0])
      if (t.startsWith('inr')) {
        const n = t.match(/\d+/)?.[0]
        return n ? [`inr.${n}`, `inr${n}`, `interpretive note to r.${n}`, `interpretive note ${n}`] : [t]
      }
      const n = t.match(/\d+(?:[–-]\d+)?/)?.[0]
      if (!n) return [t]
      return [
        `recommendation ${n}`,
        `recommendations ${n}`,
        `r.${n}`,
        `r. ${n}`,
        `fatf r.${n}`,
        `fatf recommendation ${n}`,
        `fatf recommendations ${n}`,
      ]
    },
  },
  // UNSCR 1373, UN Security Council Resolution 1373
  {
    kind: 'statute_un',
    re: /\b(?:UNSCR|UN\s+Security\s+Council\s+Resolution)\s+(\d+)\b/gi,
    toBindKeys: (m) => {
      const n = m[1]
      return [
        `unscr ${n}`,
        `resolution ${n}`,
        `un security council resolution ${n}`,
        `security council resolution ${n}`,
      ]
    },
  },
  // UK: POCA 2002, MLR 2017, TA 2000, ATCSA 2001, MLR 2019, CTA 2008
  {
    kind: 'statute_uk',
    re: /\b(POCA|MLR|TA|ATCSA|CTA)\s+(\d{4})\b/g,
    toBindKeys: (m) => {
      const abbr = m[1]
      const year = m[2]
      const expansion = UK_STATUTE_EXPANSIONS[abbr]
      const keys = [`${abbr.toLowerCase()} ${year}`]
      if (expansion) keys.push(`${expansion} ${year}`, expansion)
      return keys
    },
  },
  // Bangladesh: ATA 2009, MLPA 2012, BFIU Master Circular No. 26
  {
    kind: 'statute_bd',
    re: /\b(ATA|MLPA)\s+(\d{4})\b|\bBFIU\s+Master\s+Circular\s+(?:No\.?\s*)?(\d+)\b/gi,
    toBindKeys: (m) => {
      // m[1] = abbr or undef, m[2] = year or undef, m[3] = MC number or undef
      if (m[1] && m[2]) {
        const abbr = m[1].toUpperCase()
        const year = m[2]
        const expansion = BD_STATUTE_EXPANSIONS[abbr]
        const keys = [`${abbr.toLowerCase()} ${year}`]
        if (expansion) keys.push(`${expansion} ${year}`, expansion)
        return keys
      }
      if (m[3]) {
        const n = m[3]
        return [`master circular no. ${n}`, `master circular ${n}`, `master circular no ${n}`, `bfiu master circular no. ${n}`]
      }
      return [normalise(m[0])]
    },
  },
  // EU acts: Regulation (EU) 2024/1624, Directive (EU) 2018/1673
  {
    kind: 'statute_eu',
    re: /\b(Regulation|Directive)\s+\(EU\)\s+(\d{4}\/\d+)\b/g,
    toBindKeys: (m) => [`${m[1].toLowerCase()} (eu) ${m[2]}`, `(eu) ${m[2]}`, m[2]],
  },
  // Case names: "United States v. X", "Holder v. Humanitarian Law Project"
  // Conservative — requires at least two capitalised words on each side of "v.".
  {
    kind: 'case',
    re: /\b(?:United\s+States|[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+v\.\s+[A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)*(?:\s+[A-Z]\.[A-Z]\.)?/g,
    toBindKeys: (m) => {
      const head = caseBindKey(m)
      const keys = [head]
      // For United States v. X, also try "X" alone (organisation name) and the
      // common shortened "U.S. v. X" form.
      const usMatch = head.match(/^united states v\. (.+)$/)
      if (usMatch) {
        keys.push(`u.s. v. ${usMatch[1]}`, usMatch[1])
      }
      return keys
    },
  },
  // Executive Orders: Executive Order 13224, EO 13224
  {
    kind: 'executive_order',
    re: /\b(?:Executive\s+Order|EO)\s+(\d{4,5})\b/g,
    toBindKeys: (m) => [`executive order ${m[1]}`, `eo ${m[1]}`, `e.o. ${m[1]}`],
  },
  // Named publications introduced with italic / bold / quoted titles —
  // catch a small set of high-signal patterns. Each entry is a known
  // publication phrase that's heavy in CAMS-domain lessons.
  {
    kind: 'named_publication',
    re: /\b(?:SAR Stats|Sound Management of Risks Related to Money Laundering[^.]*?Terrorism|Emerging Terrorist Financing Risks|Combating[^.]*?Financing of Proliferation|FinCEN Files|Bruun & Hjejle|Monograph on Terrorist Financing|Updated Guidance for a Risk-Based Approach to Virtual Assets[^.]*?VASPs?)\b/gi,
    toBindKeys: (m) => [normalise(m[0]).split(/[^a-z0-9 &]/)[0].slice(0, 40)],
  },
]

function extractFromText(
  text: string,
  sceneIndex: number,
  sceneTitle: string,
  sceneType: string,
  location: string,
  out: ExtractedClaim[],
): void {
  if (!text) return
  for (const pat of CLAIM_PATTERNS) {
    const re = new RegExp(pat.re.source, pat.re.flags.includes('g') ? pat.re.flags : pat.re.flags + 'g')
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      const rawKeys = pat.toBindKeys ? pat.toBindKeys(m) : [normalise(m[0])]
      const bindKeys = Array.from(new Set(rawKeys.map(normalise).filter((k) => k.length >= 4)))
      if (bindKeys.length === 0) continue
      out.push({
        sceneIndex,
        sceneTitle,
        sceneType,
        location,
        kind: pat.kind,
        raw: m[0],
        bindKeys,
      })
    }
  }
}

export function extractClaims(artifact: LessonArtifact): ExtractedClaim[] {
  const claims: ExtractedClaim[] = []
  artifact.scenes.forEach((scene, i) => {
    const title = scene.title || '(untitled)'
    const stype = scene.sceneType
    const data = scene.sceneData
    if (!isObj(data)) return
    switch (scene.sceneType) {
      case 'reading': {
        const d = data as ReadingData
        if (isStr(d.body)) extractFromText(d.body, i, title, stype, 'body', claims)
        break
      }
      case 'slide': {
        const d = data as SlideData
        if (isStr(d.heading)) extractFromText(d.heading, i, title, stype, 'heading', claims)
        if (isStr(d.subheading)) extractFromText(d.subheading, i, title, stype, 'subheading', claims)
        if (isStr(d.narration)) extractFromText(d.narration, i, title, stype, 'narration', claims)
        if (isArr(d.items)) {
          d.items.forEach((item, j) => {
            if (!isObj(item)) return
            const it = item as SlideItem
            if (isStr(it.label)) extractFromText(it.label, i, title, stype, `item[${j}].label`, claims)
            if (isStr(it.text)) extractFromText(it.text, i, title, stype, `item[${j}].text`, claims)
          })
        }
        break
      }
      case 'quiz': {
        const d = data as QuizData
        if (isStr(d.intro)) extractFromText(d.intro, i, title, stype, 'intro', claims)
        if (isArr(d.questions)) {
          d.questions.forEach((q, j) => {
            if (!isObj(q)) return
            const qq = q as QuizQ
            if (isStr(qq.prompt)) extractFromText(qq.prompt, i, title, stype, `q[${j}].prompt`, claims)
            if (isStr(qq.explanation)) extractFromText(qq.explanation, i, title, stype, `q[${j}].explanation`, claims)
          })
        }
        break
      }
    }
  })
  return claims
}

// ── Candidate-citation pool per scene ─────────────────────────────────────

/** Expand range / et-seq citation labels to their constituent reference forms.
 *
 * A citation "FATF Recommendations 9–23 and their Interpretive Notes" should
 * cover individual claims like "FATF Recommendation 10" or "FATF R.18". A
 * citation "31 U.S.C. §§ 5311 et seq." should cover individual claims about
 * sections within the range. We expand the candidate label set so the bind
 * doesn't over-flag claims whose anchor IS substantively present but in
 * range form rather than as a discrete entry.
 *
 * Path-2 follow-up: the FATF expander handles a generalised number list
 * (singletons + ranges + "and" connectors) so that "Recommendations 20, 26–29"
 * covers R.20, R.26, R.27, R.28, R.29 — not only the trailing range. Caught
 * by the CAMS 1.3 unbound FATF R.26 case where the leading "20" was being
 * lost. Same tokeniser as gate 6b's plural-list normaliser.
 */
function expandCandidateLabel(label: string): string[] {
  const out = [label]
  // FATF Recommendations — generalised list of singletons and ranges.
  // e.g. "Recommendations 9–23", "Recommendations 20, 26–29",
  // "Recommendations 10, 11, and 21", "FATF Recommendations 26-28 and 31".
  const recList = label.match(/Recommendations?\s+([\d,\s\-–]+(?:and\s+\d+(?:\s*[\-–]\s*\d+)?)?)/i)
  if (recList) {
    for (const n of parseRecNumberList(recList[1])) {
      out.push(`recommendation ${n}`)
      out.push(`r.${n}`)
    }
  }
  // U.S.C. § N et seq. (open-ended; cap the expansion window)
  const etSeq = label.match(/(\d{1,3})\s+U\.?\s*S\.?\s*C\.?\s+§+\s*(\d+)\s+et\s+seq/i)
  if (etSeq) {
    const title = etSeq[1]
    const start = parseInt(etSeq[2], 10)
    for (let n = start; n <= start + 40; n++) {
      out.push(`${title} u.s.c. § ${n}`)
    }
  }
  return out
}

/** Parse a FATF Recommendation number list (commas + ranges + "and") to a
 *  flat array of Recommendation numbers. Range expansion is capped at 25
 *  numbers per range; non-numeric tokens are ignored. */
function parseRecNumberList(list: string): number[] {
  const out: number[] = []
  const tokens = list
    .split(/[,\s]+(?:and\s+)?/i)
    .map((t) => t.trim())
    .filter(Boolean)
  for (const token of tokens) {
    const range = token.match(/^(\d+)\s*[\-–]\s*(\d+)$/)
    if (range) {
      const start = parseInt(range[1], 10)
      const end = parseInt(range[2], 10)
      if (Number.isFinite(start) && Number.isFinite(end) && end >= start && end - start <= 25) {
        for (let n = start; n <= end; n++) out.push(n)
        continue
      }
      if (Number.isFinite(start)) out.push(start)
      if (Number.isFinite(end)) out.push(end)
      continue
    }
    if (/^\d+$/.test(token)) out.push(parseInt(token, 10))
  }
  return out
}

/** All citation labels in a scene (only reading scenes carry citations[]), with
 *  range / et-seq expansions appended so range citations cover their constituents. */
function sceneCitationLabels(scene: GeneratedScene): string[] {
  if (scene.sceneType !== 'reading') return []
  const d = scene.sceneData as ReadingData
  if (!isArr(d.citations)) return []
  const labels = d.citations
    .filter(isObj)
    .map((c) => (isStr((c as Citation).label) ? ((c as Citation).label as string) : ''))
    .filter((l): l is string => l.length > 0)
  const expanded: string[] = []
  for (const l of labels) expanded.push(...expandCandidateLabel(l))
  return expanded
}

/** Lesson-wide candidate citations — every reading-scene citation label. */
function candidateLabels(artifact: LessonArtifact, _sceneIndex: number): string[] {
  const labels = new Set<string>()
  for (const scene of artifact.scenes) {
    for (const l of sceneCitationLabels(scene)) labels.add(l)
  }
  return [...labels]
}

// ── Binding ───────────────────────────────────────────────────────────────

export type BindHit = ExtractedClaim & { matchedLabel?: string }

export function bindClaim(claim: ExtractedClaim, candidates: string[]): BindHit {
  const candidatesLower = candidates.map((c) => normalise(c))
  for (const key of claim.bindKeys) {
    for (let i = 0; i < candidatesLower.length; i++) {
      if (candidatesLower[i].includes(key)) {
        return { ...claim, matchedLabel: candidates[i] }
      }
    }
  }
  return { ...claim }
}

export type CitationBindReport = {
  totalClaims: number
  boundCount: number
  unboundCount: number
  unbound: BindHit[]
}

export function runCitationBind(artifact: LessonArtifact): CitationBindReport {
  const claims = extractClaims(artifact)
  const unbound: BindHit[] = []
  let boundCount = 0
  for (const c of claims) {
    const candidates = candidateLabels(artifact, c.sceneIndex)
    const hit = bindClaim(c, candidates)
    if (hit.matchedLabel) boundCount++
    else unbound.push(hit)
  }
  return {
    totalClaims: claims.length,
    boundCount,
    unboundCount: unbound.length,
    unbound,
  }
}

// ── Gate wrapper for integration into runGates ────────────────────────────

export function gateCitationBind(artifact: LessonArtifact): GateResult {
  const report = runCitationBind(artifact)
  if (report.totalClaims === 0) {
    return { outcome: 'skip', detail: 'no structured factual references detected to bind' }
  }
  if (report.unboundCount === 0) {
    return {
      outcome: 'pass',
      detail: `all ${report.totalClaims} structured factual references bound to a citation in scope (same scene + adjacent readings)`,
      data: { totalClaims: report.totalClaims, boundCount: report.boundCount },
    }
  }
  const samples = report.unbound.slice(0, 8).map((c) => ({
    scene: c.sceneTitle,
    location: c.location,
    kind: c.kind,
    claim: c.raw,
    bindKeys: c.bindKeys,
  }))
  return {
    outcome: 'flag',
    detail: `${report.unboundCount} of ${report.totalClaims} structured factual references unbound (no citation anywhere in the lesson contains the distinguishing substring)`,
    data: { totalClaims: report.totalClaims, boundCount: report.boundCount, unboundSamples: samples },
  }
}
