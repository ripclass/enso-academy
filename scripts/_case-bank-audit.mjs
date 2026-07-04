// scripts/_case-bank-audit.mjs
// Deterministic gate for case-bank entries (generated/case-bank/cases/*.json).
// Checks schema, step shape, option integrity, the decision length-tell, the
// correct-id spread, em-dashes, and source hygiene. Run BEFORE spending Codex.
//
//   node scripts/_case-bank-audit.mjs [--all | <file> ...]

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const BANK = join(process.cwd(), 'generated', 'case-bank', 'cases')

function fail(list, msg) {
  list.push(msg)
}

function auditEntry(path) {
  const problems = []
  const warns = []
  let e
  try {
    e = JSON.parse(readFileSync(path, 'utf8'))
  } catch (err) {
    return { path, problems: ['JSON parse failure: ' + err.message], warns: [] }
  }

  // Wrapper schema
  for (const k of ['id', 'status', 'matter', 'jurisdictions', 'caseType', 'courses', 'conceptTags', 'sources', 'factBasis', 'verifiedAt', 'case']) {
    if (e[k] === undefined) fail(problems, `missing wrapper field: ${k}`)
  }
  if (e.status && !['draft', 'gated'].includes(e.status)) fail(problems, `bad status: ${e.status}`)
  if (Array.isArray(e.sources)) {
    if (e.sources.length === 0) fail(problems, 'sources is empty')
    for (const s of e.sources) {
      if (!s.title) fail(problems, 'a source has no title')
      if (s.url && !/^https:\/\//.test(s.url)) fail(problems, `source url not https: ${s.url}`)
    }
    if (!e.sources.some((s) => s.url)) warns.push('no source carries a URL')
  }

  const c = e.case ?? {}
  if (typeof c.caseTitle !== 'string' || !c.caseTitle) fail(problems, 'case.caseTitle missing')
  if (typeof c.debrief !== 'string' || c.debrief.length < 80) fail(problems, 'case.debrief missing or too thin')
  if (typeof c.intro !== 'string' || c.intro.length < 60) warns.push('case.intro missing or thin')
  const steps = Array.isArray(c.steps) ? c.steps : []
  if (steps.length < 3 || steps.length > 4) fail(problems, `steps count ${steps.length} (want 3-4)`)

  const stepIds = new Set()
  const correctIds = []
  let correctLongestCount = 0

  steps.forEach((s, i) => {
    const tag = `step ${i} (${s.id ?? '?'})`
    if (!s.id) fail(problems, `${tag}: missing id`)
    if (stepIds.has(s.id)) fail(problems, `${tag}: duplicate step id`)
    stepIds.add(s.id)
    if (!s.heading) fail(problems, `${tag}: missing heading`)
    for (const k of ['observed', 'source', 'inference', 'confidence']) {
      if (!s.evidence?.[k]) fail(problems, `${tag}: evidence.${k} missing`)
    }
    if (!s.reveal || s.reveal.length < 60) fail(problems, `${tag}: reveal missing or too thin`)

    const d = s.decision ?? {}
    if (!d.prompt) fail(problems, `${tag}: decision.prompt missing`)
    if (!d.explanation || d.explanation.length < 80) fail(problems, `${tag}: decision.explanation missing/thin`)
    const opts = Array.isArray(d.options) ? d.options : []
    if (opts.length !== 4) fail(problems, `${tag}: ${opts.length} options (want 4)`)
    const ids = new Set(opts.map((o) => o.id))
    if (ids.size !== opts.length) fail(problems, `${tag}: duplicate option ids`)
    const correct = opts.find((o) => o.id === d.correctOptionId)
    if (!correct) fail(problems, `${tag}: correctOptionId not among options`)
    else {
      correctIds.push(d.correctOptionId)
      const maxDistractor = Math.max(...opts.filter((o) => o.id !== d.correctOptionId).map((o) => (o.text ?? '').length))
      if ((correct.text ?? '').length > maxDistractor) correctLongestCount++
      for (const o of opts) {
        if (!o.text || o.text.length < 40) warns.push(`${tag}: option ${o.id} is very short (${(o.text ?? '').length} chars)`)
      }
    }
    // Explanations must not reference options by letter (options carry no letters on screen).
    if (/\b(option|answer|choice)\s+\(?[a-d]\)?\b/i.test(`${d.explanation ?? ''} ${s.reveal ?? ''}`)) {
      fail(problems, `${tag}: explanation/reveal references an option by letter`)
    }
  })

  // Length tell: correct strictly longest in at most one decision per case.
  if (correctLongestCount > 1) fail(problems, `length tell: correct option strictly longest in ${correctLongestCount} decisions (max 1)`)
  // Correct-id spread: not all the same slot.
  if (correctIds.length >= 3 && new Set(correctIds).size === 1) {
    fail(problems, `correct-id spread: all decisions keyed to "${correctIds[0]}"`)
  }

  // Em-dashes anywhere in the entry.
  const raw = readFileSync(path, 'utf8')
  const emCount = (raw.match(/—/g) ?? []).length
  if (emCount > 0) fail(problems, `${emCount} em-dash(es) present`)

  return { path, problems, warns }
}

let files = process.argv.slice(2)
if (files.length === 0 || files[0] === '--all') {
  files = readdirSync(BANK).filter((f) => f.endsWith('.json')).map((f) => join(BANK, f))
}

let bad = 0
for (const f of files) {
  const r = auditEntry(f)
  const name = f.replaceAll('\\', '/').split('/').pop()
  if (r.problems.length === 0) {
    console.log(`PASS  ${name}${r.warns.length ? '  (warns: ' + r.warns.join(' | ') + ')' : ''}`)
  } else {
    bad++
    console.log(`FAIL  ${name}`)
    for (const p of r.problems) console.log(`      - ${p}`)
    for (const w of r.warns) console.log(`      ~ ${w}`)
  }
}
console.log(`\n${files.length - bad}/${files.length} PASS`)
process.exit(bad ? 1 : 0)
