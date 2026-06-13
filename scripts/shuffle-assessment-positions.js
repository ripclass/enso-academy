// scripts/shuffle-assessment-positions.js
//
// Deterministically rebalances the correct-answer POSITION across the CAMS
// assessment artifacts so the answer key is not guessable from position.
//
// Why this is safe to do mechanically: verified that 0/180 question
// explanations reference option letters like "(a)/(c)" — the wrong-answer
// reasoning lives in the per-option `wrongAnswerRationales` object, keyed by
// letter. So re-lettering options breaks no prose; we just relabel and re-key.
//
// Per question (by index): the correct option's TEXT is moved to a target
// letter drawn from a fixed balanced-but-shuffled sequence (5 each of a/b/c/d
// per 20), the other option texts fill the remaining letters in order, and
// each wrong option's rationale follows its text to the new letter.
//
// Usage:  node scripts/shuffle-assessment-positions.js
//         node scripts/shuffle-assessment-positions.js <file.json>

const fs = require('fs')
const path = require('path')

const LETTERS = ['a', 'b', 'c', 'd']
// Fixed, balanced (5 each), non-round-robin so the pattern itself is not a tell.
const SEQ = ['c','a','d','b','a','d','b','c','d','a','c','b','a','c','d','b','c','a','b','d']

function shuffleQuestion(q, idx) {
  const opts = [...q.options].sort((x, y) => x.id.localeCompare(y.id))
  const correct = opts.find((o) => o.id === q.correctOptionId)
  if (!correct) throw new Error(`q${idx}: correctOptionId ${q.correctOptionId} not among options`)
  const wrongs = opts.filter((o) => o.id !== q.correctOptionId)

  const target = SEQ[idx % SEQ.length]
  const remaining = LETTERS.filter((l) => l !== target)

  const newOptions = []
  const newRationales = {}

  newOptions.push({ id: target, text: correct.text })
  wrongs.forEach((w, i) => {
    const newId = remaining[i]
    newOptions.push({ id: newId, text: w.text })
    const r = q.wrongAnswerRationales ? q.wrongAnswerRationales[w.id] : undefined
    if (r !== undefined) newRationales[newId] = r
  })

  newOptions.sort((x, y) => x.id.localeCompare(y.id))

  q.options = newOptions
  q.correctOptionId = target
  q.wrongAnswerRationales = newRationales
  return q
}

function processFile(file) {
  const raw = fs.readFileSync(file, 'utf8')
  const data = JSON.parse(raw)
  if (!Array.isArray(data.questions)) throw new Error(`${file}: no questions array`)
  data.questions.forEach((q, i) => shuffleQuestion(q, i))
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8')
  const pos = { a: 0, b: 0, c: 0, d: 0 }
  data.questions.forEach((q) => pos[q.correctOptionId]++)
  console.log(`${path.basename(file)}: ${data.questions.length} q  →  a=${pos.a} b=${pos.b} c=${pos.c} d=${pos.d}`)
}

const arg = process.argv[2]
const dir = path.join('generated', 'cams', 'assessment')
const files = arg ? [arg] : fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => path.join(dir, f))
files.forEach(processFile)
console.log(`\nDone: ${files.length} file(s) re-balanced.`)
