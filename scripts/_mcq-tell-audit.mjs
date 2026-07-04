// scripts/_mcq-tell-audit.mjs
// Test-integrity audit for assessment JSON files (question bank source).
// Reports, per file:
//   - single-answer questions where the CORRECT option is strictly the longest
//     (the "length tell": a pick-the-longest strategy must not beat chance)
//   - multi-response questions where "pick the N longest options" exactly
//     reproduces the correct set (the multi-response version of the same tell)
//   - explanations / rationales that reference options by LETTER (options are
//     shuffled per attempt at runtime, so letter references are meaningless)
//   - em-dash occurrences (banned in user-facing copy)
//
// Usage:
//   node scripts/_mcq-tell-audit.mjs generated/cams/assessment/foo.json [...more]
//   node scripts/_mcq-tell-audit.mjs --all   (audits every cams + ccas file)

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const LETTER_REF = /\b(option|answer|choice|options)\s+\(?[a-d]\)?\b/i
const ROOT = process.cwd()

function auditFile(path) {
  const doc = JSON.parse(readFileSync(path, 'utf8'))
  const qs = doc.questions ?? []
  const singles = []
  const multis = []
  const letterRefs = []
  const emDashes = []

  qs.forEach((q, i) => {
    const opts = q.options ?? []
    const text = JSON.stringify(q)
    if (text.includes('—')) emDashes.push(i)
    const expl = `${q.explanation ?? ''} ${JSON.stringify(q.wrongAnswerRationales ?? {})}`
    if (LETTER_REF.test(expl)) letterRefs.push(i)

    const multiIds = Array.isArray(q.correctOptionIds) ? q.correctOptionIds.map(String) : null
    if (multiIds) {
      const n = multiIds.length
      const byLen = [...opts].sort((a, b) => b.text.length - a.text.length || String(a.id).localeCompare(String(b.id)))
      const topN = new Set(byLen.slice(0, n).map((o) => String(o.id)))
      const correct = new Set(multiIds)
      const exploit = topN.size === correct.size && [...correct].every((id) => topN.has(id))
      const avgC = avg(opts.filter((o) => correct.has(String(o.id))).map((o) => o.text.length))
      const avgW = avg(opts.filter((o) => !correct.has(String(o.id))).map((o) => o.text.length))
      multis.push({ i, exploit, avgCorrect: Math.round(avgC), avgWrong: Math.round(avgW) })
      return
    }

    const ans = q.correctOptionId != null ? String(q.correctOptionId) : null
    if (!ans) return
    const correctOpt = opts.find((o) => String(o.id) === ans)
    if (!correctOpt) {
      singles.push({ i, INVALID_KEY: true })
      return
    }
    const cLen = correctOpt.text.length
    const dLens = opts.filter((o) => String(o.id) !== ans).map((o) => o.text.length)
    const maxD = Math.max(...dLens)
    singles.push({ i, correctLen: cLen, maxDistractorLen: maxD, correctIsLongest: cLen > maxD })
  })

  const offenders = singles.filter((s) => s.correctIsLongest)
  const multiOffenders = multis.filter((m) => m.exploit)
  return { path, total: qs.length, singles, multis, offenders, multiOffenders, letterRefs, emDashes }
}

function avg(a) {
  return a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0
}

let files = process.argv.slice(2)
if (files[0] === '--all') {
  files = []
  for (const slug of ['cams', 'ccas']) {
    const dir = join(ROOT, 'generated', slug, 'assessment')
    for (const f of readdirSync(dir).filter((f) => f.endsWith('.json'))) files.push(join(dir, f))
  }
}

let grandSingles = 0
let grandOffenders = 0
for (const f of files) {
  const r = auditFile(f)
  const pct = r.singles.length ? Math.round((100 * r.offenders.length) / r.singles.length) : 0
  grandSingles += r.singles.length
  grandOffenders += r.offenders.length
  console.log(`\n== ${r.path.replaceAll('\\', '/').split('/').slice(-2).join('/')}`)
  console.log(
    `   ${r.total} questions | single: ${r.singles.length}, correct-is-longest: ${r.offenders.length} (${pct}%) | multi: ${r.multis.length}, pick-N-longest-wins: ${r.multiOffenders.length} | letter-refs: ${r.letterRefs.length} | em-dashes: ${r.emDashes.length}`,
  )
  if (r.offenders.length)
    console.log(
      '   single offenders (index: correctLen>maxDistractor): ' +
        r.offenders.map((o) => `${o.i}:${o.correctLen}>${o.maxDistractorLen}`).join(' '),
    )
  if (r.multiOffenders.length)
    console.log('   multi offenders (index): ' + r.multiOffenders.map((m) => m.i).join(' '))
  if (r.letterRefs.length) console.log('   letter-ref questions (index): ' + r.letterRefs.join(' '))
  const invalid = r.singles.filter((s) => s.INVALID_KEY)
  if (invalid.length) console.log('   !! INVALID KEYS at: ' + invalid.map((s) => s.i).join(' '))
}
if (files.length > 1) {
  console.log(
    `\nTOTAL single-answer: ${grandSingles}, correct-is-longest: ${grandOffenders} (${Math.round((100 * grandOffenders) / grandSingles)}%)`,
  )
}
