import 'server-only'
import Stripe from 'stripe'

/**
 * Server-only Stripe client + the SERVER-SIDE product config.
 *
 * SECURITY INVARIANT #3: amounts/prices live ONLY here, on the server, keyed by
 * a `kind`. The checkout creators read the amount from PRODUCTS[kind] — never
 * from any client input. Never accept a price/amount from the browser.
 */

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Pinned API version — bump deliberately, not implicitly. Pinned to the
  // version this SDK (stripe 22.x) is built against.
  apiVersion: '2026-05-27.dahlia',
})

export type ProductKind = 'course' | 'mock'

export const PRODUCTS: Record<
  ProductKind,
  { amountCents: number; currency: string; name: string }
> = {
  course: { amountCents: 29900, currency: 'usd', name: 'CAMS Full Course Access' },
  mock: { amountCents: 1499, currency: 'usd', name: 'CAMS Mock Exam (single attempt)' },
}

/** Mock attempts bundled with a course purchase. */
export const COURSE_INCLUDED_MOCKS = 5
/** The free "taste" allowance every authenticated user gets per course. */
export const FREE_TASTE_MOCKS = 1
/** Mock credits granted per pay-per-mock purchase. */
export const MOCK_CREDITS_PER_PURCHASE = 1
