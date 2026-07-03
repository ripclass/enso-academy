import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import { PRODUCTS, ccasCoursePrice } from './client'

/**
 * The current, display-ready course price. For CCAS this is the launch tier
 * resolved from PAID seats sold + the cutoff date; for every other course it is
 * the static price from PRODUCTS. Used by BOTH the checkout (amountCents is what
 * Stripe charges) and the sales UI (labels), so the two can never disagree.
 */
export type ResolvedCoursePrice = {
  /** What Stripe charges (the source of truth the checkout reads). */
  amountCents: number
  priceLabel: string
  /** Short badge next to the price, e.g. "Founding · 12 of 15 left". */
  badge: string | null
}

function usd(cents: number): string {
  return cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`
}

async function countPaidSeats(courseSlug: string): Promise<number> {
  const admin = createAdminClient()
  const { data: course } = await admin.from('courses').select('id').eq('slug', courseSlug).maybeSingle()
  if (!course) return 0
  const { count } = await admin
    .from('course_purchases')
    .select('id', { count: 'exact', head: true })
    .eq('course_id', course.id)
    .eq('status', 'completed')
  return count ?? 0
}

export async function resolveCoursePrice(courseSlug: string): Promise<ResolvedCoursePrice> {
  if (courseSlug === 'ccas') {
    const seats = await countPaidSeats('ccas')
    const p = ccasCoursePrice(seats, new Date().toISOString())
    const badge =
      p.tierLabel === 'Founding'
        ? `Founding price · ${p.seatsLeftInTier} of 15 left`
        : p.tierLabel === 'Early'
          ? `Early price · ${p.seatsLeftInTier} left`
          : p.tierLabel === 'Launch'
            ? 'Launch price'
            : null // List: no badge
    return { amountCents: p.amountCents, priceLabel: usd(p.amountCents), badge }
  }

  // CAMS / default: static price with a plain "Launch price" badge.
  const amount = PRODUCTS[courseSlug]?.course.amountCents ?? PRODUCTS.cams.course.amountCents
  return { amountCents: amount, priceLabel: usd(amount), badge: 'Launch price' }
}
