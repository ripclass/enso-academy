// scripts/_gate-case.mjs
// The Codex gate for case-bank entries: builds a fidelity + decision-quality
// brief (the case JSON plus the SOURCE lesson excerpts its facts must match),
// pipes it to the codex CLI (gpt-5.5), parses the verdict, and records it in
// the entry. AGREE flips status to "gated"; SPLIT/DISAGREE stay "draft" with
// the verdict recorded for the orchestrator to resolve.
//
//   node scripts/_gate-case.mjs <case-file> [...more]
//   node scripts/_gate-case.mjs --drafts     (gate every status:"draft" entry)

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const BANK = join(process.cwd(), 'generated', 'case-bank', 'cases')

function lessonExcerpt(lessonPath) {
  let doc
  try {
    doc = JSON.parse(readFileSync(join(process.cwd(), lessonPath), 'utf8'))
  } catch {
    return `(could not read ${lessonPath})`
  }
  const scenes = doc.scenes ?? doc.lesson?.scenes ?? []
  const parts = []
  for (const s of scenes) {
    const d = s.sceneData ?? s.data ?? s
    const title = s.title ?? d.title ?? ''
    // Serialize the WHOLE scene payload: bodies, slide items, quiz explanations,
    // citations (their labels carry dates and dockets), and interactive case-file
    // specs are all verified content a bank case may legitimately draw on.
    // A narrower body-only extract caused false "unsupported" verdicts.
    parts.push(`### ${title}\n${JSON.stringify(d, null, 1)}`)
  }
  const text = parts.join('\n\n')
  return text.length > 60000 ? text.slice(0, 60000) + '\n\n[truncated]' : text
}

function buildBrief(entry) {
  // factBasis names one or more generated/**.json lesson paths.
  const paths = [...(entry.factBasis ?? '').matchAll(/generated\/[\w\-/.]+\.json/g)].map((m) => m[0])
  const excerpts = paths.length
    ? paths.map((p) => `SOURCE LESSON: ${p}\n\n${lessonExcerpt(p)}`).join('\n\n====\n\n')
    : '(no machine-readable factBasis paths; the factBasis text is: ' + entry.factBasis + ')'

  return `You are a strict independent reviewer for a professional certification-prep product. Below is ONE interactive "case file" (JSON) derived from already-verified lesson content, followed by the SOURCE LESSON text its facts must match.

REVIEW IT ON EXACTLY TWO LANES:

LANE 1, FACTUAL FIDELITY (decisive): every specific claim in the case's STUDENT-FACING content (the "case" object: intro, steps, decisions, reveals, debrief, and the sources list) regarding entity names, amounts, dates, counts, charges, dispositions, and allegation-vs-admitted framing must be supported by the SOURCE LESSON text below (including its citation labels, slide items, and interactive scene content, which are all verified). Flag any specific the source does not support, any distortion, and any place an allegation is stated as an admitted fact or vice versa. The case may compress or paraphrase; it may NOT add or alter specifics. Do NOT flag the wrapper metadata fields (id, matter, jurisdictions, caseType, courses, conceptTags, factBasis): they are internal routing labels, never shown to students.

LANE 2, DECISION QUALITY: each of the 3 decisions must have exactly one clearly-best option; no distractor may be a defensible second correct answer; distractors must be plausible competing practitioner actions, not strawmen; explanations must not reference options by letter; register must be adult-professional; no em-dashes.

CALIBRATION (apply to both lanes): decision prompts may place the student in a CONSTRUCTED hypothetical seat ("You own the respondent files...", "An onboarding file shows...") and distractor options assert wrong ideas BY DESIGN; do not flag scenario framing or distractor content as unsupported facts. Flag them only when they misstate the actual RECORD (a real amount, date, disposition, or entity fact) or make a distractor defensibly correct. Evidence cards ("observed"/"source") and reveals, by contrast, claim the record and are held to strict support.

OUTPUT CONTRACT (exactly this shape, nothing else after it):
VERDICT: AGREE | SPLIT | DISAGREE
ISSUES:
- (one bullet per concrete issue with the exact quoted text; write "none" if there are none)

AGREE = publication-safe on both lanes. SPLIT = only soft, non-blocking issues. DISAGREE = at least one publication-blocking defect.

==== CASE FILE JSON ====
${JSON.stringify(entry, null, 2)}

==== SOURCE LESSON TEXT ====
${excerpts}
`
}

function gateOne(path) {
  const entry = JSON.parse(readFileSync(path, 'utf8'))
  const name = path.replaceAll('\\', '/').split('/').pop()
  const brief = buildBrief(entry)
  const briefPath = join(process.cwd(), 'generated', 'case-bank', name.replace('.json', '.gatebrief.txt'))
  writeFileSync(briefPath, brief, 'utf8')

  console.log(`[gate] ${name} (brief ${Math.round(brief.length / 1000)}k chars) ...`)
  const res = spawnSync('codex.cmd', ['exec', '--skip-git-repo-check'], {
    input: brief,
    encoding: 'utf8',
    timeout: 15 * 60 * 1000,
    maxBuffer: 32 * 1024 * 1024,
    shell: true,
  })
  const out = `${res.stdout ?? ''}\n${res.stderr ?? ''}`
  writeFileSync(briefPath.replace('.gatebrief.txt', '.gateout.txt'), out, 'utf8')

  const m = out.match(/VERDICT:\s*(AGREE|SPLIT|DISAGREE)/i)
  const verdict = m ? m[1].toUpperCase() : 'NO_OUTPUT'
  const issues = out.includes('ISSUES:') ? out.slice(out.indexOf('ISSUES:')).slice(0, 2000) : ''

  entry.gate = { verdict, model: 'gpt-5.5', date: new Date().toISOString().slice(0, 10) }
  if (verdict === 'AGREE') entry.status = 'gated'
  writeFileSync(path, JSON.stringify(entry, null, 2) + '\n', 'utf8')

  console.log(`[gate] ${name} -> ${verdict}`)
  if (verdict !== 'AGREE' && issues) console.log(issues.split('\n').slice(0, 12).join('\n'))
  return verdict
}

let files = process.argv.slice(2)
if (files[0] === '--drafts') {
  files = readdirSync(BANK)
    .filter((f) => f.endsWith('.json'))
    .map((f) => join(BANK, f))
    .filter((f) => {
      try {
        return JSON.parse(readFileSync(f, 'utf8')).status === 'draft'
      } catch {
        return false
      }
    })
}
if (files.length === 0) {
  console.log('nothing to gate')
  process.exit(0)
}

const tally = {}
for (const f of files) {
  const v = gateOne(f)
  tally[v] = (tally[v] ?? 0) + 1
}
console.log('\nGate tally: ' + JSON.stringify(tally))
