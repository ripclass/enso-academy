// scripts/create-demo-account.ts
// Provision a FREE, ready-to-use account with full CAMS access (no payment):
// an email-confirmed login, an active CAMS enrolment, and 5 full exam
// simulations (the same bundle a $299 purchase grants), plus the unlimited
// free practice mocks every enrolled owner gets. CAMS only, so the dashboard
// shows exactly one course.
//
// Reusable for reviewer / bank-demo accounts:
//   pnpm tsx scripts/create-demo-account.ts <email> [password] ["Full Name"]
// If the email already exists, it reuses that user and resets the password.
import { config } from 'dotenv'
config({ path: '.env.local' })

// COURSE_INCLUDED_MOCKS in lib/stripe/client.ts (the per-course bundle).
const INCLUDED_MOCKS = 5

function genPassword(): string {
  const words = ['Falcon', 'Harbor', 'Ledger', 'Compass', 'Summit', 'Anchor', 'Cobalt', 'Beacon']
  const w = words[Math.floor(Math.random() * words.length)]
  const n = Math.floor(1000 + Math.random() * 9000)
  return `${w}-Audit-${n}`
}

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error('usage: pnpm tsx scripts/create-demo-account.ts <email> [password] ["Full Name"]')
    process.exit(1)
  }
  const password = process.argv[3] || genPassword()
  const fullName = process.argv[4] || ''

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const admin = createAdminClient()

  const { data: course, error: cErr } = await admin
    .from('courses')
    .select('id, name')
    .eq('slug', 'cams')
    .single()
  if (cErr || !course) throw new Error('CAMS course not found: ' + (cErr?.message ?? 'missing'))

  // 1) Create (or reuse) the auth user, email pre-confirmed so they can log in now.
  let userId = ''
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: fullName ? { full_name: fullName } : {},
  })
  if (created?.user) {
    userId = created.user.id
    console.log('• created auth user', userId)
  } else {
    console.log('• createUser said:', createErr?.message, '— looking it up')
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    const found = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
    if (!found) throw new Error('could not create or find a user for ' + email)
    userId = found.id
    await admin.auth.admin.updateUserById(userId, { password, email_confirm: true })
    console.log('• reusing existing user', userId, '(password reset)')
  }

  // 2) Enrol in CAMS only (active). Select-then-insert (no constraint assumed).
  const { data: existing } = await admin
    .from('enrollments')
    .select('id, status')
    .eq('student_id', userId)
    .eq('course_id', course.id)
    .maybeSingle()
  if (existing) {
    if (existing.status !== 'active') {
      await admin.from('enrollments').update({ status: 'active' }).eq('id', existing.id)
    }
    console.log('• CAMS enrolment already present')
  } else {
    const { error: enErr } = await admin
      .from('enrollments')
      .insert({ student_id: userId, course_id: course.id, status: 'active' })
    if (enErr) throw new Error('enrol failed: ' + enErr.message)
    console.log('• enrolled in CAMS')
  }

  // 3) Grant the course bundle of full exam simulations.
  const { error: entErr } = await admin
    .from('mock_entitlements')
    .upsert(
      { student_id: userId, course_id: course.id, included_total: INCLUDED_MOCKS },
      { onConflict: 'student_id,course_id' },
    )
  if (entErr) throw new Error('grant mocks failed: ' + entErr.message)
  console.log(`• granted ${INCLUDED_MOCKS} full exam simulations`)

  console.log('\n=== DEMO ACCOUNT READY ===')
  console.log('  Sign in: https://www.ensoacademy.ai/login')
  console.log('  Email:    ' + email)
  console.log('  Password: ' + password)
  console.log('  Access:   CAMS only (full course + ' + INCLUDED_MOCKS + ' exam simulations + unlimited practice mocks)')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
