// scripts/_sync-bank-from-files.mjs
//
// Push question-bank edits from the source-of-truth assessment JSONs
// (generated/<slug>/assessment/*.json) into the live question_bank table.
// Matches rows by EXACT question_text (verified unique + in sync beforehand).
//
// Safety rules:
//   - NEVER updates correct_answer on an existing row. If the file's key
//     disagrees with the DB key, the question is SKIPPED and reported.
//   - Only updates options / explanation / wrong_answer_rationales when they
//     actually differ.
//   - Questions present in a file but absent from the DB are INSERTED, taking
//     course_id/module_id from a sibling question in the same file.
//   - Dry-run by default; pass --write to apply.
//
//   node scripts/_sync-bank-from-files.mjs [--write] [cams ccas]

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const WRITE = process.argv.includes('--write')
const slugs = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const SLUGS = slugs.length ? slugs : ['cams', 'ccas']

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').split(/\s/)[0]
if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
const admin = createClient(url, key, { auth: { persistSession: false } })

const keyOf = (v) => JSON.stringify(Array.isArray(v) ? [...v].map(String).sort() : String(v))

async function syncCourse(slug) {
  const { data: course, error: ce } = await admin
    .from('courses')
    .select('id')
    .eq('slug', slug)
    .single()
  if (ce || !course) throw new Error(`course ${slug} not found: ${ce?.message}`)

  const { data: rows, error: re } = await admin
    .from('question_bank')
    .select('id, module_id, question_text, options, correct_answer, explanation, wrong_answer_rationales')
    .eq('course_id', course.id)
    .limit(2000)
  if (re) throw new Error(re.message)
  const byStem = new Map(rows.map((r) => [r.question_text, r]))

  const dir = join(process.cwd(), 'generated', slug, 'assessment')
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'))

  let updated = 0
  let unchanged = 0
  let inserted = 0
  const keyMismatches = []
  const seenStems = new Set()

  for (const f of files) {
    const doc = JSON.parse(readFileSync(join(dir, f), 'utf8'))
    const qs = doc.questions ?? []
    // module_id inferred from any question of this file already in the DB.
    let moduleId = null
    for (const q of qs) {
      const db = byStem.get(q.questionText)
      if (db?.module_id) {
        moduleId = db.module_id
        break
      }
    }
    const pendingInserts = []

    for (const q of qs) {
      seenStems.add(q.questionText)
      const db = byStem.get(q.questionText)
      const fileKey = q.correctOptionIds ?? q.correctOptionId

      if (!db) {
        pendingInserts.push(q)
        continue
      }
      if (keyOf(fileKey) !== keyOf(db.correct_answer)) {
        keyMismatches.push(`${f} :: ${q.questionText.slice(0, 70)}`)
        continue
      }
      const desired = {
        options: q.options,
        explanation: q.explanation ?? null,
        wrong_answer_rationales: q.wrongAnswerRationales ?? null,
      }
      const current = {
        options: db.options,
        explanation: db.explanation,
        wrong_answer_rationales: db.wrong_answer_rationales,
      }
      if (JSON.stringify(desired) === JSON.stringify(current)) {
        unchanged++
        continue
      }
      updated++
      if (WRITE) {
        const { error } = await admin.from('question_bank').update(desired).eq('id', db.id)
        if (error) throw new Error(`update failed (${q.questionText.slice(0, 50)}): ${error.message}`)
      }
    }

    for (const q of pendingInserts) {
      if (!moduleId) {
        console.log(`  !! cannot insert (no sibling module_id): ${f} :: ${q.questionText.slice(0, 60)}`)
        continue
      }
      const isMulti = Array.isArray(q.correctOptionIds)
      inserted++
      console.log(`  + insert [${f}] ${q.questionText.slice(0, 70)}`)
      if (WRITE) {
        const { error } = await admin.from('question_bank').insert({
          course_id: course.id,
          module_id: moduleId,
          question_type: isMulti ? 'multiple_choice' : 'scenario_mcq',
          question_text: q.questionText,
          options: q.options,
          correct_answer: isMulti ? q.correctOptionIds : q.correctOptionId,
          explanation: q.explanation ?? null,
          wrong_answer_rationales: q.wrongAnswerRationales ?? null,
          concept_tags: q.conceptTags ?? [],
          difficulty: q.difficulty ?? 'standard',
          domain: q.domain,
          eligible_for_mock: true,
          eligible_for_quiz: true,
          metadata: isMulti ? { select_count: q.selectCount ?? q.correctOptionIds.length } : {},
        })
        if (error) throw new Error(`insert failed (${q.questionText.slice(0, 50)}): ${error.message}`)
      }
    }
  }

  const dbOnly = rows.filter((r) => !seenStems.has(r.question_text))
  console.log(
    `\n[${slug}] ${WRITE ? 'APPLIED' : 'DRY RUN'}: updated ${updated}, unchanged ${unchanged}, inserted ${inserted}, key-mismatch skips ${keyMismatches.length}, db-only rows ${dbOnly.length}`,
  )
  for (const m of keyMismatches) console.log('  !! KEY MISMATCH SKIPPED: ' + m)
  for (const r of dbOnly) console.log('  ?? in DB but not in files: ' + r.question_text.slice(0, 70))
}

for (const slug of SLUGS) await syncCourse(slug)
console.log(WRITE ? '\nDone (writes applied).' : '\nDone (dry run only; pass --write to apply).')
