// scripts/check-assessment.js
//
// Structural + test-integrity checker for an INLINE-generated assessment
// artifact (one module's question set + glossary). The assessment analogue of
// the lesson deterministic gates: it verifies the schema, the answer-key
// validity, tag scope, and the two test-integrity tells (answer position and
// option length), and reports the metrics a reviewer needs.
//
// Usage:  node scripts/check-assessment.js <course-slug> <module-slug>
// Exit:   0 = clean (no structural errors), 1 = structural errors present.
//
// Note: correct-is-longest and position balance are reported as WARNINGS, not
// hard errors, but the target is correct-is-longest <= half of single-answer
// questions and a roughly even a/b/c/d position spread.

const fs = require('fs')
const path = require('path')

const [course, moduleSlug] = process.argv.slice(2)
if (!course || !moduleSlug) {
  console.error('Usage: node scripts/check-assessment.js <course-slug> <module-slug>')
  process.exit(1)
}

const outline = JSON.parse(fs.readFileSync(path.join('generated', course, 'outline.json'), 'utf8'))
const mod = outline.modules.find((m) => m.slug === moduleSlug)
if (!mod) {
  console.error(`Module "${moduleSlug}" not in ${course} outline`)
  process.exit(1)
}
const modTags = new Set()
for (const l of mod.lessons) for (const t of l.conceptTags || []) modTags.add(t)
const expectedDomain = mod.domain

const file = path.join('generated', course, 'assessment', `${moduleSlug}.json`)
const data = JSON.parse(fs.readFileSync(file, 'utf8'))
const qs = data.questions || []
const gloss = data.glossary || []

const errors = []
const pos = { a: 0, b: 0, c: 0, d: 0 }
let correctLongest = 0
const correctLens = []
const distractorLens = []
let single = 0
let multi = 0

qs.forEach((q, i) => {
  const ctx = `Q${i + 1}`
  const ids = (q.options || []).map((o) => o.id)
  if (new Set(ids).size !== ids.length) errors.push(`${ctx}: duplicate option ids`)
  if (!['scenario_mcq', 'single_choice', 'multiple_choice'].includes(q.questionType))
    errors.push(`${ctx}: bad questionType ${q.questionType}`)
  if (!['foundational', 'standard', 'advanced', 'expert'].includes(q.difficulty))
    errors.push(`${ctx}: bad difficulty ${q.difficulty}`)
  if (expectedDomain && q.domain !== expectedDomain)
    errors.push(`${ctx}: domain "${q.domain}" != module domain "${expectedDomain}"`)
  for (const t of q.conceptTags || []) if (!modTags.has(t)) errors.push(`${ctx}: conceptTag out of scope: ${t}`)
  if (!Array.isArray(q.conceptTags) || q.conceptTags.length === 0) errors.push(`${ctx}: no conceptTags`)

  if (q.questionType === 'multiple_choice') {
    multi++
    const cids = q.correctOptionIds || []
    if (cids.length < 2) errors.push(`${ctx}: multi-select needs >=2 correctOptionIds`)
    if (cids.some((c) => !ids.includes(c))) errors.push(`${ctx}: correctOptionIds not in options`)
    if (q.selectCount !== cids.length) errors.push(`${ctx}: selectCount ${q.selectCount} != correctOptionIds ${cids.length}`)
    if (ids.length < 4) errors.push(`${ctx}: multi-select needs >=4 options`)
  } else {
    single++
    if (ids.length !== 4) errors.push(`${ctx}: single-answer needs exactly 4 options`)
    if (!ids.includes(q.correctOptionId)) errors.push(`${ctx}: correctOptionId "${q.correctOptionId}" not in options`)
    else pos[q.correctOptionId] = (pos[q.correctOptionId] || 0) + 1
    const wrong = ids.filter((x) => x !== q.correctOptionId).sort()
    const rk = Object.keys(q.wrongAnswerRationales || {}).sort()
    if (JSON.stringify(wrong) !== JSON.stringify(rk))
      errors.push(`${ctx}: wrongAnswerRationales keys [${rk}] != wrong ids [${wrong}]`)
    const lens = {}
    for (const o of q.options) lens[o.id] = o.text.length
    const cl = lens[q.correctOptionId]
    if (cl === Math.max(...Object.values(lens))) correctLongest++
    correctLens.push(cl)
    for (const id of ids) if (id !== q.correctOptionId) distractorLens.push(lens[id])
    if (!q.explanation || q.explanation.length < 20) errors.push(`${ctx}: explanation missing/too short`)
  }
})

const blob = JSON.stringify(data)
const emDash = blob.includes('—')
const enDash = blob.includes('–')
const avg = (a) => (a.length ? Math.round(a.reduce((s, x) => s + x, 0) / a.length) : 0)

console.log(`${course}/${moduleSlug}`)
console.log(`  questions: ${qs.length} (single ${single}, multi ${multi}) | glossary: ${gloss.length}`)
console.log(`  position spread (single-answer): a=${pos.a} b=${pos.b} c=${pos.c} d=${pos.d}`)
console.log(`  correct-is-longest: ${correctLongest}/${single}  (target <= ${Math.floor(single / 2)})`)
console.log(`  avg len: correct ${avg(correctLens)} | distractor ${avg(distractorLens)}  (target within ~20)`)
console.log(`  em-dash: ${emDash} | en-dash: ${enDash}`)
if (emDash || enDash) errors.push('em-dash or en-dash present')
if (errors.length) {
  console.log(`  STRUCTURAL ERRORS (${errors.length}):`)
  for (const e of errors.slice(0, 40)) console.log(`    - ${e}`)
  process.exit(1)
}
console.log('  STRUCTURAL: clean')
const warns = []
if (correctLongest > Math.floor(single / 2)) warns.push(`correct-is-longest ${correctLongest} exceeds half (${Math.floor(single / 2)})`)
const spreadVals = [pos.a, pos.b, pos.c, pos.d]
if (Math.max(...spreadVals) - Math.min(...spreadVals) > 3) warns.push('position spread uneven (>3 gap)')
if (Math.abs(avg(correctLens) - avg(distractorLens)) > 25) warns.push('correct/distractor length gap > 25')
if (warns.length) {
  console.log(`  WARNINGS: ${warns.join('; ')}`)
} else {
  console.log('  TEST-INTEGRITY: clean')
}
process.exit(0)
