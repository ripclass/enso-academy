import 'server-only'
import Stripe from 'stripe'

/**
 * Server-only Stripe client + the SERVER-SIDE product config.
 *
 * SECURITY INVARIANT #3: amounts/prices live ONLY here, on the server, keyed by
 * a `kind`. The checkout creators read the amount from PRODUCTS[kind] — never
 * from any client input. Never accept a price/amount from the browser.
 */

// Lazy singleton. Constructing Stripe at module load would throw during the
// production build's "collect page data" step if STRIPE_SECRET_KEY were absent,
// taking down the whole build. Instead we build it on first use (runtime), so a
// missing key fails only the Stripe call path, not the entire build.
let _stripe: Stripe | null = null
export function getStripe(): Stripe {
  if (_stripe) return _stripe
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
  _stripe = new Stripe(key, {
    // Pinned API version — bump deliberately, not implicitly. Pinned to the
    // version this SDK (stripe 22.x) is built against.
    apiVersion: '2026-05-27.dahlia',
  })
  return _stripe
}

export type ProductKind = 'course' | 'mock'
type Price = { amountCents: number; currency: string; name: string }

/**
 * PER-COURSE pricing, keyed by course slug then product kind. A course that is
 * not listed here has no purchase path (getProduct throws), so an unpriced
 * course fails safe rather than silently charging another course's price.
 */
export const PRODUCTS: Record<string, Record<ProductKind, Price>> = {
  cams: {
    course: { amountCents: 29900, currency: 'usd', name: 'CAMS Full Course Access' },
    mock: { amountCents: 1499, currency: 'usd', name: 'CAMS Mock Exam (single attempt)' },
  },
  // CCAS mirrors CAMS pricing (sibling ACAMS certificate, comparable scope).
  // Adjust here if CCAS should be priced differently.
  ccas: {
    course: { amountCents: 29900, currency: 'usd', name: 'CCAS Full Course Access' },
    mock: { amountCents: 1499, currency: 'usd', name: 'CCAS Mock Exam (single attempt)' },
  },
}

/** Resolve the server-side price for a course+kind, or throw if unpriced. */
export function getProduct(courseSlug: string, kind: ProductKind): Price {
  const course = PRODUCTS[courseSlug]
  if (!course) throw new Error(`No pricing configured for course "${courseSlug}"`)
  return course[kind]
}

/** Mock attempts bundled with a course purchase. */
export const COURSE_INCLUDED_MOCKS = 5
/** The free "taste" allowance every authenticated user gets per course. */
export const FREE_TASTE_MOCKS = 1
/** Mock credits granted per pay-per-mock purchase. */
export const MOCK_CREDITS_PER_PURCHASE = 1
