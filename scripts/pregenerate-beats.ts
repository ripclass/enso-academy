// scripts/pregenerate-beats.ts
// Pre-generate the per-beat narration clips for a course's reading scenes, so
// beat-mode (?beats=1) playback never waits on synthesis — including across
// scene changes. Idempotent (skips clips already in storage); safe to re-run.
//
//   pnpm tsx scripts/pregenerate-beats.ts [courseId]
//
// Defaults to the CAMS course. Uploads to the prod lesson-audio bucket via the
// service-role key in .env.local; synthesizes via Google TTS (GCP creds from
// GOOGLE_APPLICATION_CREDENTIALS).
import { config } from 'dotenv'
config({ path: '.env.local' })

const COURSE_ID = process.argv[2] ?? '364842c7-393b-46dc-8924-7b9164639a22' // CAMS

async function main() {
  const { pregenerateBeatAudio } = await import('@/lib/audio/pregenerate')
  console.log(`Pre-generating per-beat clips for course ${COURSE_ID} …`)
  const res = await pregenerateBeatAudio({
    courseId: COURSE_ID,
    onProgress: (cur, total, label) => {
      if (cur === 1 || cur % 20 === 0 || cur === total) {
        console.log(`  [${cur}/${total}] ${label}`)
      }
    },
  })
  console.log(
    'Done:',
    JSON.stringify(
      { ...res, errors: res.errors.slice(0, 12) },
      null,
      2,
    ),
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
