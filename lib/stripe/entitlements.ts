import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { COURSE_INCLUDED_MOCKS, FREE_TASTE_MOCKS } from './client'

/**
 * Mock-attempt entitlement ledger helpers (server-only).
 *
 * All writes go through the service-role admin client — RLS allows only
 * service-role writes to `mock_entitlements` / `mock_purchases`.
 *
 * NOTE: `mock_entitlements` / `mock_purchases` and the `consume_mock_attempt`
 * RPC are not yet in `lib/supabase/database.types.ts` (the migration is applied
 * to the remote DB as an operator step). Until the types regenerate after the
 * migration apply, those specific calls use a narrowly-scoped `any` cast — the
 * client is NOT weakened globally.
 */

export type MockEntitlement = {
  includedTotal: number
  purchasedTotal: number
  used: number
  remaining: number
}

/**
 * Grant the baseline free "taste" allowance. Idempotent: inserts a row with
 * included_total = FREE_TASTE_MOCKS only if none exists; never resets/lowers an
 * existing row.
 */
export async function ensureBaselineEntitlement(
  studentId: string,
  courseId: string,
): Promise<void> {
  const admin = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- types regenerate after migration apply
  await (admin as any)
    .from('mock_entitlements')
    .upsert(
      {
        student_id: studentId,
        course_id: courseId,
        included_total: FREE_TASTE_MOCKS,
      },
      { onConflict: 'student_id,course_id', ignoreDuplicates: true },
    )
}

/**
 * Read the student's mock entitlement. If no row exists, returns the implicit
 * baseline (remaining = FREE_TASTE_MOCKS) WITHOUT writing.
 */
export async function getMockEntitlement(
  studentId: string,
  courseId: string,
): Promise<MockEntitlement> {
  const admin = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- types regenerate after migration apply
  const { data } = await (admin as any)
    .from('mock_entitlements')
    .select('included_total, purchased_total, used')
    .eq('student_id', studentId)
    .eq('course_id', courseId)
    .maybeSingle()

  if (!data) {
    return {
      includedTotal: FREE_TASTE_MOCKS,
      purchasedTotal: 0,
      used: 0,
      remaining: FREE_TASTE_MOCKS,
    }
  }

  const includedTotal = Number(data.included_total ?? 0)
  const purchasedTotal = Number(data.purchased_total ?? 0)
  const used = Number(data.used ?? 0)
  return {
    includedTotal,
    purchasedTotal,
    used,
    remaining: Math.max(0, includedTotal + purchasedTotal - used),
  }
}

/**
 * Atomically consume one mock attempt. Ensures the baseline row exists, then
 * calls the race-safe `consume_mock_attempt` RPC. Returns TRUE iff an attempt
 * was available and has been consumed.
 */
export async function consumeMockAttempt(
  studentId: string,
  courseId: string,
): Promise<boolean> {
  await ensureBaselineEntitlement(studentId, courseId)
  const admin = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- types regenerate after migration apply
  const { data, error } = await (admin.rpc as any)('consume_mock_attempt', {
    p_student: studentId,
    p_course: courseId,
  })
  if (error) throw new Error('Failed to consume mock attempt: ' + error.message)
  return data === true
}

/**
 * Grant the course-bundle mock allowance. Raises included_total to at least
 * COURSE_INCLUDED_MOCKS, never lowering an existing higher value. Read-modify-
 * write (the row may already carry the baseline taste).
 */
export async function grantCourseMockAllowance(
  studentId: string,
  courseId: string,
): Promise<void> {
  const admin = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- types regenerate after migration apply
  const { data: existing } = await (admin as any)
    .from('mock_entitlements')
    .select('included_total')
    .eq('student_id', studentId)
    .eq('course_id', courseId)
    .maybeSingle()

  const currentIncluded = Number(existing?.included_total ?? 0)
  const nextIncluded = Math.max(currentIncluded, COURSE_INCLUDED_MOCKS)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- types regenerate after migration apply
  await (admin as any)
    .from('mock_entitlements')
    .upsert(
      {
        student_id: studentId,
        course_id: courseId,
        included_total: nextIncluded,
      },
      { onConflict: 'student_id,course_id' },
    )
}

/**
 * Add pay-per-mock purchased credits. Increments purchased_total by `credits`,
 * creating the row (with the baseline taste preserved) if it does not exist.
 */
export async function grantPurchasedCredits(
  studentId: string,
  courseId: string,
  credits: number,
): Promise<void> {
  const admin = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- types regenerate after migration apply
  const { data: existing } = await (admin as any)
    .from('mock_entitlements')
    .select('included_total, purchased_total')
    .eq('student_id', studentId)
    .eq('course_id', courseId)
    .maybeSingle()

  const currentIncluded = Number(existing?.included_total ?? FREE_TASTE_MOCKS)
  const currentPurchased = Number(existing?.purchased_total ?? 0)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- types regenerate after migration apply
  await (admin as any)
    .from('mock_entitlements')
    .upsert(
      {
        student_id: studentId,
        course_id: courseId,
        included_total: currentIncluded,
        purchased_total: currentPurchased + credits,
      },
      { onConflict: 'student_id,course_id' },
    )
}
