// lib/ai/generator/validate_gates.ts
//
// Path-2 seed — the deterministic gate runner for generated LessonArtifacts.
// Mirrors the shape of M13's validate_gates.py (ICC Rule Engine, the rule
// manufacturing pipeline). Hard gates fail-to-reject; soft gates flag for
// human review. Output matches the <lesson-slug>.validation.json shape
// specified in cams-session-brief.md so the Path-1 self-check artifacts
// migrate forward without rework.
//
// Gates (the 5 from the Path-1 brief + 6 surfaced by the CAMS 1.3 LQB
// iteration + 7 added in Path-2 cycle 2 to bind structured factual
// references — methodology audit needs to run alongside factual-fidelity,
// not in series after):
//   1. schema           (hard) — scene shape against lib/lesson/scenes.ts
//   2. citation         (hard for absence; soft for outline resolution)
//   3. ip               (hard) — banned commercial-guide names; ICC rule text
//   4. pedagogy         (soft) — no concept dupes; deep-case scene present
//   5. quiz_alignment   (soft) — question conceptTags ⊆ lesson; correctOptionId valid
//   6. methodology      (soft) — news-as-pointer not substance; item↔narration
//                                consistency; numeric claims sourced
//   7. citation_bind    (soft) — every structured factual reference (statute,
//                                case, EO, named publication) anchored by
//                                substring in same-scene-or-adjacent-reading
//                                citation
//
// All gates are pure functions over the artifact (+ optional outline for
// citation resolution). No DB, no LLM, no I/O. Server-only by convention
// (lib/ai/* — see CLAUDE.md gotchas). Expected caller is a CLI runner
// (future scripts/validate-lesson.ts) or an inline session before save.

import type { LessonArtifact, GeneratedScene, OutlineArtifact } from './types'
import { gateCitationBind } from './citation_bind'

// ── Public types — match the .validation.json schema in cams-session-brief.md ──

export type GateOutcome = 'pass' | 'flag' | 'fail' | 'skip'

export type GateResult = {
  outcome: GateOutcome
  detail: string
  data?: Record<string, unknown>
}

export type ValidationReport = {
  lessonSlug: string
  methodologyVersion: string
  validatedAt: string // ISO-8601
  gates: {
    schema: GateResult
    citation: GateResult
    ip: GateResult
    pedagogy: GateResult
    quiz_alignment: GateResult
    methodology: GateResult
    citation_bind: GateResult
  }
  /** any 'fail' → fail; else any 'flag' → flag; else pass. */
  overall: GateOutcome
}

// ── Internal unknown-typed shapes for the validator to inspect ─────────────
// The validator's job is precisely to check that scene_data matches its
// expected shape, so we deliberately work against unknown / Record<string, unknown>
// rather than the runtime Scene union. This keeps us honest about what we know.

type ReadingData = { body?: unknown; citations?: unknown }
type SlideData = {
  template?: unknown
  heading?: unknown
  subheading?: unknown
  items?: unknown
  narration?: unknown
}
type QuizData = { intro?: unknown; questions?: unknown }
type Citation = { label?: unknown; url?: unknown }
type SlideItem = { icon?: unknown; label?: unknown; text?: unknown }
type QuizQ = {
  prompt?: unknown
  options?: unknown
  correctOptionId?: unknown
  explanation?: unknown
  conceptTags?: unknown
}

const SCENE_TYPES = ['reading', 'slide', 'quiz', 'interactive', 'pbl'] as const
const SLIDE_TEMPLATES = ['key-points', 'definition', 'comparison', 'callout'] as const

// ── Methodology-derived constants ─────────────────────────────────────────

/** Commercial study-guide brand patterns — banned as substantive sources by ADR 0015. */
const BANNED_COMMERCIAL_GUIDES: RegExp[] = [
  // ACAMS *study materials* are banned. ACAMS standards / ACAMS-published public
  // guidance are NOT banned, so we anchor on the prep-context lexicon.
  /\bACAMS\s+(?:study\s+guide|exam\s+prep|prep\s+book|courseware|practice\s+(?:exam|question))/i,
  /\b(?:Wiley|Kaplan|Schweser|Becker|BPP)\s+(?:CAMS|AML|prep|study)/i,
  /\bICA\s+(?:Diploma|Certificate)\s+(?:study|prep|materials?|courseware)/i,
]

/** Long-quote heuristic for ICC rule text — substring "Article N[:.] " followed by ≥120 chars
 *  of prose is suspicious. We can reference these instruments by name; we can't reproduce. */
const ICC_RULE_TEXT_BANS: RegExp[] = [
  /\b(?:UCP\s*600|ISBP\s*82\d|URDG\s*758|ISP\s*98|URC\s*522)[^\n]{0,40}\bArticle\s+\d+[a-z]?[:.]\s*[A-Z][^.]{120,}/i,
]

/** Reference-form alias table for gate 6b (Path-2 follow-up).
 *
 *  Maps equivalent abbreviated / expanded forms of the same distinctive
 *  reference to a single canonical lowercase token so that item↔narration
 *  comparison no longer false-flags equivalent rewrites. The propagation-
 *  failure pattern (item edited, narration left stale) still trips this
 *  gate; only the equivalent-form false positive is closed.
 *
 *  Order matters: more-specific patterns first (e.g. INR before bare
 *  "Recommendation N", and the plural list form "Recommendations N, M, K"
 *  before the singular), so chained `replace()` doesn't partially rewrite
 *  a multi-word reference and then mis-canonicalise the residue.
 */
type AliasRule =
  | { pattern: RegExp; canonical: string }
  | { pattern: RegExp; expand: (match: string, ...groups: string[]) => string }

const REFERENCE_ALIASES: ReadonlyArray<AliasRule> = [
  // UN Security Council Resolution — UN-prefix optional for the expanded form.
  { pattern: /\b(?:UN\s+)?Security\s+Council\s+Resolution\s+(\d+)\b/gi, canonical: 'unscr $1' },
  { pattern: /\bUNSCR\s+(\d+)\b/gi, canonical: 'unscr $1' },
  // FATF Interpretive Note — handled before "Recommendation N" so the longer
  // multi-word phrase canonicalises first.
  { pattern: /\bInterpretive\s+Note\s+to\s+Recommendation\s+(\d+)\b/gi, canonical: 'inr.$1' },
  { pattern: /\bINR\.?\s*(\d+)\b/gi, canonical: 'inr.$1' },
  // FATF Recommendations PLURAL form: "Recommendations 10, 11, 20, and 21"
  // and "Recommendations 26-29" expand to individual canonical tokens.
  // Runs before the singular pattern so the singular pattern doesn't eat
  // the leading "Recommendations" of the plural form.
  {
    pattern: /\b(?:FATF\s+)?Recommendations\s+([\d,\s\-–]+(?:and\s+\d+)?)/gi,
    expand: (_match: string, list: string) => expandRecList(list),
  },
  // FATF Recommendations SINGULAR: FATF-prefixed, then bare Recommendation N,
  // then the dotted abbreviation R.N. Bare "R N" without a dot is NOT aliased —
  // too ambiguous in the wider corpus.
  { pattern: /\bFATF\s+R(?:ecommendation)?\.?\s*(\d+)\b/gi, canonical: 'fatf r.$1' },
  { pattern: /\bRecommendation\s+(\d+)\b/gi, canonical: 'fatf r.$1' },
  { pattern: /\bR\.\s*(\d+)\b/gi, canonical: 'fatf r.$1' },
  // Section / §
  { pattern: /\bSection\s+(\d+)/gi, canonical: '§ $1' },
  { pattern: /§\s*(\d+)/g, canonical: '§ $1' },
]

/** Expand a Recommendation-list capture ("10, 11, 20, and 21" or "26-29") into
 *  a whitespace-joined run of canonical fatf-r tokens. Range expansion is
 *  bounded to 40 numbers (matches the citation_bind range window) so a
 *  malformed range doesn't blow up. */
function expandRecList(list: string): string {
  const out: string[] = []
  const tokens = list.split(/[,\s]+(?:and\s+)?/i).map((t) => t.trim()).filter(Boolean)
  for (const token of tokens) {
    const range = token.match(/^(\d+)\s*[\-–]\s*(\d+)$/)
    if (range) {
      const start = parseInt(range[1], 10)
      const end = parseInt(range[2], 10)
      if (Number.isFinite(start) && Number.isFinite(end) && end >= start && end - start <= 40) {
        for (let i = start; i <= end; i++) out.push(`fatf r.${i}`)
        continue
      }
      out.push(`fatf r.${range[1]}`, `fatf r.${range[2]}`)
      continue
    }
    if (/^\d+$/.test(token)) out.push(`fatf r.${token}`)
  }
  return out.join(' ')
}

/** Lower-case a string and fold equivalent reference forms through REFERENCE_ALIASES. */
function normalizeRefs(text: string): string {
  let out = text
  for (const rule of REFERENCE_ALIASES) {
    if ('canonical' in rule) {
      out = out.replace(rule.pattern, rule.canonical)
    } else {
      out = out.replace(rule.pattern, rule.expand)
    }
  }
  return out.toLowerCase()
}

/** Journalism / investigative-reporting sources — allowed as pointers, flagged
 *  when a reading scene cites only journalism with no primary-source counter-balance. */
const JOURNALISM_PATTERNS: RegExp[] = [
  /\bICIJ\b/i,
  /\bBuzzFeed\b/i,
  /\bReuters\b/i,
  /\bBloomberg\b/i,
  /\bFinancial\s+Times\b/i,
  /\bThe\s+Guardian\b/i,
  /\bNew\s+York\s+Times\b/i,
  /\bWashington\s+Post\b/i,
]

// ── Helpers ───────────────────────────────────────────────────────────────

const pass = (detail: string, data?: Record<string, unknown>): GateResult =>
  data ? { outcome: 'pass', detail, data } : { outcome: 'pass', detail }
const flag = (detail: string, data?: Record<string, unknown>): GateResult =>
  data ? { outcome: 'flag', detail, data } : { outcome: 'flag', detail }
const fail = (detail: string, data?: Record<string, unknown>): GateResult =>
  data ? { outcome: 'fail', detail, data } : { outcome: 'fail', detail }
const skip = (detail: string): GateResult => ({ outcome: 'skip', detail })

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)
const isStr = (v: unknown): v is string => typeof v === 'string'
const isArr = (v: unknown): v is unknown[] => Array.isArray(v)

/** All text from a scene — body, slide items, narration, quiz prompts/options. */
function sceneText(scene: GeneratedScene): string {
  const parts: string[] = [scene.title ?? '']
  const data = scene.sceneData
  if (!isObj(data)) return parts.join('\n')
  switch (scene.sceneType) {
    case 'reading': {
      const d = data as ReadingData
      if (isStr(d.body)) parts.push(d.body)
      break
    }
    case 'slide': {
      const d = data as SlideData
      if (isStr(d.heading)) parts.push(d.heading)
      if (isStr(d.subheading)) parts.push(d.subheading)
      if (isStr(d.narration)) parts.push(d.narration)
      if (isArr(d.items)) {
        for (const item of d.items) {
          if (!isObj(item)) continue
          const it = item as SlideItem
          if (isStr(it.label)) parts.push(it.label)
          if (isStr(it.text)) parts.push(it.text)
        }
      }
      break
    }
    case 'quiz': {
      const d = data as QuizData
      if (isStr(d.intro)) parts.push(d.intro)
      if (isArr(d.questions)) {
        for (const q of d.questions) {
          if (!isObj(q)) continue
          const qq = q as QuizQ
          if (isStr(qq.prompt)) parts.push(qq.prompt)
          if (isStr(qq.explanation)) parts.push(qq.explanation)
          if (isArr(qq.options)) {
            for (const opt of qq.options) {
              if (isObj(opt) && isStr((opt as { text?: unknown }).text)) {
                parts.push((opt as { text: string }).text)
              }
            }
          }
        }
      }
      break
    }
  }
  return parts.join('\n')
}

// ── Gate 1: schema (hard) ─────────────────────────────────────────────────

export function gateSchema(artifact: LessonArtifact): GateResult {
  if (!isObj(artifact as unknown)) return fail('artifact is not an object')
  if (!isStr(artifact.lessonSlug) || !artifact.lessonSlug) {
    return fail('lessonSlug missing or not a string')
  }
  if (!isArr(artifact.scenes) || artifact.scenes.length === 0) {
    return fail('scenes missing or empty')
  }

  const errors: string[] = []
  artifact.scenes.forEach((scene, i) => {
    const ctx = `scene[${i}]`
    if (!SCENE_TYPES.includes(scene.sceneType as (typeof SCENE_TYPES)[number])) {
      errors.push(`${ctx}.sceneType invalid: ${String(scene.sceneType)}`)
    }
    if (!isStr(scene.title)) errors.push(`${ctx}.title not a string`)
    if (!isArr(scene.conceptTags)) errors.push(`${ctx}.conceptTags not an array`)
    if (!isArr(scene.teachesConcepts)) errors.push(`${ctx}.teachesConcepts not an array`)
    if (!isObj(scene.sceneData)) {
      errors.push(`${ctx}.sceneData not an object`)
      return
    }

    switch (scene.sceneType) {
      case 'reading': {
        const d = scene.sceneData as ReadingData
        if (!isStr(d.body)) errors.push(`${ctx}.sceneData.body not a string`)
        if (d.citations !== undefined && !isArr(d.citations)) {
          errors.push(`${ctx}.sceneData.citations not an array`)
        }
        break
      }
      case 'slide': {
        const d = scene.sceneData as SlideData
        if (!SLIDE_TEMPLATES.includes(d.template as (typeof SLIDE_TEMPLATES)[number])) {
          errors.push(`${ctx}.sceneData.template invalid: ${String(d.template)}`)
        }
        if (!isStr(d.heading)) errors.push(`${ctx}.sceneData.heading not a string`)
        if (!isStr(d.narration)) errors.push(`${ctx}.sceneData.narration not a string`)
        if (d.items !== undefined && !isArr(d.items)) {
          errors.push(`${ctx}.sceneData.items not an array`)
        }
        break
      }
      case 'quiz': {
        const d = scene.sceneData as QuizData
        if (!isArr(d.questions) || d.questions.length === 0) {
          errors.push(`${ctx}.sceneData.questions empty or not an array`)
          break
        }
        d.questions.forEach((q, qi) => {
          const qctx = `${ctx}.sceneData.questions[${qi}]`
          if (!isObj(q)) {
            errors.push(`${qctx} not an object`)
            return
          }
          const qq = q as QuizQ
          if (!isStr(qq.prompt)) errors.push(`${qctx}.prompt not a string`)
          if (!isArr(qq.options) || qq.options.length < 2) {
            errors.push(`${qctx}.options needs ≥ 2 entries`)
          }
          if (!isStr(qq.correctOptionId)) errors.push(`${qctx}.correctOptionId not a string`)
          if (!isStr(qq.explanation)) errors.push(`${qctx}.explanation not a string`)
          if (!isArr(qq.conceptTags)) errors.push(`${qctx}.conceptTags not an array`)
        })
        break
      }
      case 'interactive': {
        const d = scene.sceneData as { title?: unknown; spec?: unknown }
        if (!isStr(d.title)) errors.push(`${ctx}.sceneData.title not a string`)
        const spec = d.spec as Record<string, unknown> | undefined
        const kind = spec?.kind
        const KINDS = ['risk-classify', 'red-flags', 'flow-trace', 'screening-match', 'case-file']
        if (!isObj(spec) || typeof kind !== 'string' || !KINDS.includes(kind)) {
          errors.push(`${ctx}.sceneData.spec.kind must be one of ${KINDS.join(', ')}`)
        } else if (kind === 'flow-trace') {
          if (!isArr(spec.nodes) || spec.nodes.length < 3) {
            errors.push(`${ctx}.sceneData.spec.nodes needs ≥ 3 nodes`)
          }
          if (!isArr(spec.edges) || spec.edges.length < 2) {
            errors.push(`${ctx}.sceneData.spec.edges needs ≥ 2 edges`)
          }
          if (!isArr(spec.path) || spec.path.length < 2) {
            errors.push(`${ctx}.sceneData.spec.path needs ≥ 2 node ids`)
          } else if (isArr(spec.nodes)) {
            const ids = new Set((spec.nodes as { id?: unknown }[]).map((n) => n.id))
            if (!(spec.path as unknown[]).every((id) => ids.has(id))) {
              errors.push(`${ctx}.sceneData.spec.path references an unknown node id`)
            }
          }
        } else if (kind === 'screening-match') {
          if (!isArr(spec.alerts) || spec.alerts.length < 2) {
            errors.push(`${ctx}.sceneData.spec.alerts needs ≥ 2 alerts`)
          } else if (
            !(spec.alerts as Record<string, unknown>[]).every(
              (a) => (a.verdict === 'clear' || a.verdict === 'escalate') && isStr(a.why),
            )
          ) {
            errors.push(`${ctx}.sceneData.spec.alerts each need verdict 'clear'|'escalate' and a why`)
          }
        } else if (kind === 'case-file') {
          // Validate the primary case plus every alternate with the same rules.
          const checkCase = (c: Record<string, unknown>, cctx: string) => {
            if (!isStr(c.caseTitle)) errors.push(`${cctx}.caseTitle not a string`)
            if (!isStr(c.debrief)) errors.push(`${cctx}.debrief not a string`)
            if (!isArr(c.steps) || (c.steps as unknown[]).length < 2) {
              errors.push(`${cctx}.steps needs ≥ 2 steps`)
              return
            }
            for (const [i, raw] of (c.steps as Record<string, unknown>[]).entries()) {
              const sctx = `${cctx}.steps[${i}]`
              const ev = raw.evidence as Record<string, unknown> | undefined
              if (!isObj(ev) || !isStr(ev.observed) || !isStr(ev.source) || !isStr(ev.inference) || !isStr(ev.confidence)) {
                errors.push(`${sctx}.evidence needs observed/source/inference/confidence strings`)
              }
              const dec = raw.decision as Record<string, unknown> | undefined
              if (!isObj(dec) || !isStr(dec.prompt) || !isStr(dec.explanation) || !isArr(dec.options) || (dec.options as unknown[]).length < 3) {
                errors.push(`${sctx}.decision needs prompt/explanation and ≥ 3 options`)
              } else if (
                !(dec.options as Record<string, unknown>[]).some((o) => o.id === dec.correctOptionId)
              ) {
                errors.push(`${sctx}.decision.correctOptionId not among options`)
              }
              if (!isStr(raw.reveal)) errors.push(`${sctx}.reveal not a string`)
            }
          }
          checkCase(spec as Record<string, unknown>, `${ctx}.sceneData.spec`)
          if (spec.alternates !== undefined) {
            if (!isArr(spec.alternates)) {
              errors.push(`${ctx}.sceneData.spec.alternates must be an array when present`)
            } else {
              for (const [ai, alt] of (spec.alternates as Record<string, unknown>[]).entries()) {
                checkCase(alt, `${ctx}.sceneData.spec.alternates[${ai}]`)
              }
            }
          }
        } else if (!isArr(spec.items) || spec.items.length < 3) {
          errors.push(`${ctx}.sceneData.spec.items needs ≥ 3 items`)
        }
        break
      }
      case 'pbl': {
        const d = scene.sceneData as { title?: unknown; spec?: unknown }
        if (!isStr(d.title)) errors.push(`${ctx}.sceneData.title not a string`)
        const spec = d.spec
        if (!isObj(spec) || spec.kind !== 'project') {
          errors.push(`${ctx}.sceneData.spec.kind must be 'project'`)
        } else {
          if (!isStr(spec.brief)) errors.push(`${ctx}.sceneData.spec.brief not a string`)
          if (!isArr(spec.rubric) || spec.rubric.length < 2) {
            errors.push(`${ctx}.sceneData.spec.rubric needs ≥ 2 criteria`)
          }
        }
        break
      }
    }
  })

  if (errors.length === 0) {
    return pass(`all ${artifact.scenes.length} scenes match the scene contract`, {
      sceneCount: artifact.scenes.length,
    })
  }
  return fail(errors[0], { errors })
}

// ── Gate 2: citation (hard for absence; soft for outline resolution) ──────

export function gateCitation(
  artifact: LessonArtifact,
  outline?: OutlineArtifact,
): GateResult {
  const readingScenes = artifact.scenes.filter((s) => s.sceneType === 'reading')
  if (readingScenes.length === 0) return skip('no reading scenes to cite from')

  // 2a (hard): every reading scene carries citations
  const missing: string[] = []
  for (const scene of readingScenes) {
    const d = scene.sceneData as ReadingData
    if (!isArr(d.citations) || d.citations.length === 0) {
      missing.push(scene.title || '(untitled)')
    }
  }
  if (missing.length > 0) {
    return fail(`${missing.length} reading scene(s) missing citations`, { missing })
  }

  // 2b (informational): citation labels' resolution rate against outline.sources[].
  //
  // SOURCE REGISTRY SEMANTICS (Path-2 cycle 5, ADR 0019): outline.sources[] is
  // ADVISORY, not authoritative. The bind step (gateCitationBind) accepts any
  // verifiable primary source — the methodology gate (gateIp) bans commercial
  // study-guide sources and the methodology gate (6a) bans news-as-substance.
  // Anti-fabrication is enforced by those gates plus the structural-reference
  // bind, not by outline-substring matching. The resolution rate here is a
  // diagnostic for whether the outline is keeping up with the lessons; a low
  // rate means the outline is underspecified relative to what lessons need,
  // which is acceptable per the advisory-registry decision. Default: pass.
  if (!outline?.sources?.length) {
    return pass('every reading scene carries citations (outline resolution skipped — no outline supplied)', {
      readingSceneCount: readingScenes.length,
    })
  }

  const sourceTokens: string[] = []
  for (const s of outline.sources) {
    if (s.sourceName) sourceTokens.push(s.sourceName.toLowerCase())
    if (s.sourceOrganization) sourceTokens.push(s.sourceOrganization.toLowerCase())
  }

  const unresolved: string[] = []
  let total = 0
  for (const scene of readingScenes) {
    const d = scene.sceneData as ReadingData
    if (!isArr(d.citations)) continue
    for (const c of d.citations) {
      if (!isObj(c)) continue
      const label = isStr((c as Citation).label) ? ((c as Citation).label as string).toLowerCase() : ''
      total++
      if (!label) {
        unresolved.push('(no label)')
        continue
      }
      const hit = sourceTokens.some((t) => {
        const snip = t.slice(0, Math.min(30, t.length))
        return label.includes(snip) || t.includes(label.slice(0, Math.min(30, label.length)))
      })
      if (!hit) unresolved.push(label)
    }
  }

  const resolutionRate = total > 0 ? (total - unresolved.length) / total : 1
  // Per the advisory-registry decision: outline mismatch is informational. We
  // flag only when ALL citations fail to resolve, which would suggest the
  // outline is completely disjoint from the lesson (likely a wrong-course
  // outline supplied to the validator) rather than the usual underspecified-
  // outline case.
  if (total > 0 && resolutionRate === 0) {
    return flag(
      `none of ${total} citations resolve to outline.sources — likely the wrong outline supplied for this lesson`,
      { unresolvedSample: unresolved.slice(0, 10), totalCitations: total, resolutionRate },
    )
  }
  return pass(
    `every reading scene carries citations; outline-source resolution ${Math.round(resolutionRate * 100)}% (advisory)`,
    {
      readingSceneCount: readingScenes.length,
      totalCitations: total,
      resolutionRate,
      unresolvedCount: unresolved.length,
    },
  )
}

// ── Gate 3: IP (hard) ─────────────────────────────────────────────────────

export function gateIp(artifact: LessonArtifact): GateResult {
  const findings: { scene: string; rule: string; sample: string }[] = []
  for (const scene of artifact.scenes) {
    const text = sceneText(scene)
    for (const re of BANNED_COMMERCIAL_GUIDES) {
      const m = text.match(re)
      if (m) {
        findings.push({
          scene: scene.title || '(untitled)',
          rule: 'banned-commercial-guide',
          sample: m[0],
        })
      }
    }
    for (const re of ICC_RULE_TEXT_BANS) {
      const m = text.match(re)
      if (m) {
        findings.push({
          scene: scene.title || '(untitled)',
          rule: 'icc-rule-text-quote',
          sample: m[0].slice(0, 100) + '…',
        })
      }
    }
  }
  if (findings.length === 0) {
    return pass('no banned-source or ICC-rule-text patterns detected')
  }
  return fail(`${findings.length} IP-rule violation(s)`, { findings })
}

// ── Gate 4: pedagogy (soft) ───────────────────────────────────────────────

export function gatePedagogy(artifact: LessonArtifact): GateResult {
  const issues: string[] = []

  // 4a: no two scenes teach the identical set of concepts
  const seen = new Map<string, string>()
  for (const scene of artifact.scenes) {
    const key = [...(scene.teachesConcepts ?? [])].sort().join('|')
    if (!key) continue
    const prior = seen.get(key)
    if (prior) {
      issues.push(`scene "${scene.title}" duplicates teachesConcepts of "${prior}" (${key})`)
    } else {
      seen.set(key, scene.title || '(untitled)')
    }
  }

  // 4b: at least one scene matches the deep-case heuristic — a reading scene
  //     with a year + a named institutional entity + a body ≥ 1500 chars.
  //     This is a proxy for the methodology's "develop one public matter
  //     deep" requirement and the lever the CAMS 1.1 ↔ 1.2 self-judgment
  //     identified.
  let deepCaseCount = 0
  for (const scene of artifact.scenes) {
    if (scene.sceneType !== 'reading') continue
    const d = scene.sceneData as ReadingData
    const body = isStr(d.body) ? d.body : ''
    if (body.length < 1500) continue
    const hasYear = /\b(19|20)\d{2}\b/.test(body)
    const hasNamedEntity =
      /(?:[A-Z][a-z]+\s+){0,3}(?:Bank|Group|Corporation|Holdings|Branch|plc|AG|N\.A\.|PLC|S\.A\.|GmbH|Ltd)\b/.test(
        body,
      )
    if (hasYear && hasNamedEntity) deepCaseCount++
  }
  if (deepCaseCount === 0) {
    issues.push('no reading scene matches deep-case heuristic (year + named entity + body ≥ 1500 chars)')
  }

  if (issues.length === 0) {
    return pass('no concept duplication; at least one deep-case scene present', {
      deepCaseCount,
      conceptKeys: seen.size,
    })
  }
  return flag(issues[0], { issues, deepCaseCount })
}

// ── Gate 5: quiz_alignment (soft) ─────────────────────────────────────────

export function gateQuizAlignment(artifact: LessonArtifact): GateResult {
  const quizScenes = artifact.scenes.filter((s) => s.sceneType === 'quiz')
  if (quizScenes.length === 0) return skip('no quiz scenes')

  const lessonConcepts = new Set<string>(
    artifact.scenes.flatMap((s) => [...(s.conceptTags ?? []), ...(s.teachesConcepts ?? [])]),
  )

  const issues: string[] = []
  for (const scene of quizScenes) {
    const d = scene.sceneData as QuizData
    if (!isArr(d.questions)) continue
    d.questions.forEach((q, i) => {
      if (!isObj(q)) return
      const qq = q as QuizQ
      const qctx = `quiz "${scene.title}" Q${i + 1}`

      // correctOptionId must exist in options[].id
      if (isArr(qq.options) && isStr(qq.correctOptionId)) {
        const ids = qq.options
          .map((o) => (isObj(o) ? (o as { id?: unknown }).id : undefined))
          .filter(isStr)
        if (!ids.includes(qq.correctOptionId)) {
          issues.push(`${qctx}: correctOptionId "${qq.correctOptionId}" not in options[].id (${ids.join(', ')})`)
        }
      }

      // conceptTags ⊆ lesson concept set
      if (isArr(qq.conceptTags)) {
        const tags = (qq.conceptTags as unknown[]).filter(isStr)
        const outOfScope = tags.filter((t) => !lessonConcepts.has(t))
        if (outOfScope.length > 0) {
          issues.push(`${qctx}: conceptTags out of lesson scope: ${outOfScope.join(', ')}`)
        }
      }
    })
  }

  if (issues.length === 0) {
    return pass('every quiz question aligned; correctOptionId valid', { quizCount: quizScenes.length })
  }
  return flag(issues[0], { issues })
}

// ── Gate 6: methodology (soft) — surfaced by the CAMS 1.3 LQB iteration ──

export function gateMethodology(artifact: LessonArtifact): GateResult {
  const issues: string[] = []

  // 6a: news-as-substance — flag any reading scene whose citations are
  //     ENTIRELY journalism with no primary regulatory counter-balance.
  //     The methodology allows news as pointer; flagging only the
  //     all-journalism case.
  for (const scene of artifact.scenes) {
    if (scene.sceneType !== 'reading') continue
    const d = scene.sceneData as ReadingData
    if (!isArr(d.citations) || d.citations.length === 0) continue
    const labels: string[] = []
    for (const c of d.citations) {
      if (isObj(c) && isStr((c as Citation).label)) labels.push((c as Citation).label as string)
    }
    if (labels.length === 0) continue
    const allJournalism = labels.every((l) => JOURNALISM_PATTERNS.some((p) => p.test(l)))
    if (allJournalism) {
      issues.push(`scene "${scene.title}" cites only journalism — should be pointer, not substantive base`)
    }
  }

  // 6b: item ↔ narration consistency for slide scenes — distinctive
  //     reference tokens (statute citations, FATF Rec refs, section refs)
  //     present in slide items[] must also appear in the narration.
  //     Catches the propagation-failure pattern seen twice in CAMS 1.3:
  //     fix the bullet, leave the spoken script. Both sides are folded
  //     through REFERENCE_ALIASES so that equivalent forms compare equal
  //     (e.g. "UNSCR 1373" in item ↔ "UN Security Council Resolution 1373"
  //     in narration, per the brief's alias table).
  const REF_PATTERN =
    /\b(?:18\s+U\.?\s*S\.?\s*C\.?|FATF\s+R(?:ecommendation)?\.?\s*\d+|UN(?:SCR|\s+Security\s+Council\s+Resolution)\s+\d+|Recommendation\s+\d+|Interpretive\s+Note\s+to\s+Recommendation\s+\d+|s\.?\s*\d+(?:\([a-z0-9]+\))?|§\s*\d+|Section\s+\d+|Article\s+\d+[a-z]?(?:\(\d+\))?|INR\.?\s*\d+)\b/gi
  for (const scene of artifact.scenes) {
    if (scene.sceneType !== 'slide') continue
    const d = scene.sceneData as SlideData
    const rawNarration = isStr(d.narration) ? d.narration : ''
    if (!rawNarration) continue
    const narrationNormalized = normalizeRefs(rawNarration)
    if (!isArr(d.items)) continue
    for (const item of d.items) {
      if (!isObj(item)) continue
      const it = item as SlideItem
      const itemText = `${isStr(it.label) ? it.label : ''} ${isStr(it.text) ? it.text : ''}`.trim()
      if (itemText.length < 40) continue
      const refs = itemText.match(REF_PATTERN) ?? []
      const missing = refs
        .map((r) => r.trim())
        .filter((r) => r.length > 4)
        .filter((r) => !narrationNormalized.includes(normalizeRefs(r)))
      if (missing.length > 0) {
        issues.push(
          `slide "${scene.title}": narration missing distinctive item refs (${missing.slice(0, 3).join('; ')}${missing.length > 3 ? '…' : ''})`,
        )
      }
    }
  }

  // 6c: numeric claims sourced — slide narration / items containing currency
  //     amounts, percentages, or magnitude phrases must co-occur with a
  //     citation in the same or adjacent reading scene. Catches the
  //     unsourced-quantitative pattern that blocked CAMS 1.3 round 4
  //     ("tens of billions", "hundreds of dollars per customer").
  const NUMERIC_PATTERN =
    /\b(?:tens of (?:billions|millions)|hundreds of (?:millions|thousands|dollars)|\$\d[\d,]*(?:\s+(?:million|billion|trillion))?|\d{1,3}(?:,\d{3})+(?:\s+(?:USD|EUR|GBP|BDT|Tk))?|\b\d{1,3}\.\d+%|\b\d+%)\b/gi
  const readingCitationsByIndex: Citation[][] = artifact.scenes.map((scene) => {
    if (scene.sceneType !== 'reading') return []
    const d = scene.sceneData as ReadingData
    return isArr(d.citations) ? (d.citations.filter(isObj) as Citation[]) : []
  })
  artifact.scenes.forEach((scene, i) => {
    if (scene.sceneType !== 'slide') return
    const d = scene.sceneData as SlideData
    const blob = `${isStr(d.narration) ? d.narration : ''}\n${
      isArr(d.items)
        ? d.items
            .filter(isObj)
            .map((it) => (isStr((it as SlideItem).text) ? ((it as SlideItem).text as string) : ''))
            .join('\n')
        : ''
    }`
    const numerics = blob.match(NUMERIC_PATTERN) ?? []
    if (numerics.length === 0) return
    const adjacentCites = [
      ...(readingCitationsByIndex[i - 1] ?? []),
      ...(readingCitationsByIndex[i] ?? []),
      ...(readingCitationsByIndex[i + 1] ?? []),
    ]
    if (adjacentCites.length === 0) {
      issues.push(
        `slide "${scene.title}": ${numerics.length} numeric claim(s) with no citations in adjacent reading scenes`,
      )
    }
  })

  if (issues.length === 0) {
    return pass('methodology checks pass — news-as-pointer; item↔narration consistent; numerics sourced')
  }
  return flag(issues[0], { issues })
}

// ── Pipeline ───────────────────────────────────────────────────────────────

/** Run every gate and synthesise the overall outcome.
 *
 * The synthesis rule mirrors M13: any hard fail → fail; else any soft flag →
 * flag; else pass. Callers decide what to do with the result (block save on
 * fail; surface to reviewer on flag; record-and-proceed on pass).
 */
export function runGates(
  artifact: LessonArtifact,
  options: { outline?: OutlineArtifact; methodologyVersion?: string } = {},
): ValidationReport {
  const gates = {
    schema: gateSchema(artifact),
    citation: gateCitation(artifact, options.outline),
    ip: gateIp(artifact),
    pedagogy: gatePedagogy(artifact),
    quiz_alignment: gateQuizAlignment(artifact),
    methodology: gateMethodology(artifact),
    citation_bind: gateCitationBind(artifact),
  } as const

  const outcomes = Object.values(gates).map((g) => g.outcome)
  const overall: GateOutcome = outcomes.includes('fail')
    ? 'fail'
    : outcomes.includes('flag')
      ? 'flag'
      : 'pass'

  return {
    lessonSlug: artifact.lessonSlug,
    // Default matches METHODOLOGY_VERSION (ADR 0020 — methodology v1.1).
    methodologyVersion: options.methodologyVersion ?? 'v1.1',
    validatedAt: new Date().toISOString(),
    gates,
    overall,
  }
}
