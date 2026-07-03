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

// ---------------------------------------------------------------------------
// CCAS launch pricing — tiered by the number of PAID seats sold (completed
// `course_purchases` rows), then capped by a hard cutoff date after which the
// list price applies. The pure function below is the single source of truth for
// the amount; the seat count + "now" are supplied by the server resolver in
// `lib/stripe/pricing.ts`.
//
//   Founding (seats 1-15):                 $149
//   Early (seats 16-40, the next 25):      $199
//   Launch window (seats 41+, until cutoff): $299
//   List (on/after the cutoff date):       $349
//
// Launch window closes end of 30 Sep 2026; the $349 list price begins 1 Oct.
// ---------------------------------------------------------------------------
export const CCAS_LAUNCH_CUTOFF_ISO = '2026-09-30T23:59:59.000Z'
export const CCAS_COURSE_LIST_CENTS = 34900

type CcasTier = { label: string; capSeats: number; amountCents: number }
const CCAS_COURSE_TIERS: CcasTier[] = [
  { label: 'Founding', capSeats: 15, amountCents: 14900 },
  { label: 'Early', capSeats: 40, amountCents: 19900 },
  { label: 'Launch', capSeats: Number.POSITIVE_INFINITY, amountCents: 29900 },
]

export type CcasCoursePrice = {
  amountCents: number
  tierLabel: 'Founding' | 'Early' | 'Launch' | 'List'
  /** Seats remaining in the current seat-capped tier, or null for uncapped/list. */
  seatsLeftInTier: number | null
}

/** Resolve the CCAS course price from paid seats sold and the current time. */
export function ccasCoursePrice(seatsSold: number, nowIso: string): CcasCoursePrice {
  // ISO-8601 UTC strings sort lexicographically, so a string compare is a valid
  // date compare here (both are `...Z`).
  if (nowIso >= CCAS_LAUNCH_CUTOFF_ISO) {
    return { amountCents: CCAS_COURSE_LIST_CENTS, tierLabel: 'List', seatsLeftInTier: null }
  }
  for (const t of CCAS_COURSE_TIERS) {
    if (seatsSold < t.capSeats) {
      return {
        amountCents: t.amountCents,
        tierLabel: t.label as CcasCoursePrice['tierLabel'],
        seatsLeftInTier: Number.isFinite(t.capSeats) ? t.capSeats - seatsSold : null,
      }
    }
  }
  return { amountCents: 29900, tierLabel: 'Launch', seatsLeftInTier: null }
}

/** Mock attempts bundled with a course purchase. */
export const COURSE_INCLUDED_MOCKS = 5
/** The free "taste" allowance every authenticated user gets per course. */
export const FREE_TASTE_MOCKS = 1
/** Mock credits granted per pay-per-mock purchase. */
export const MOCK_CREDITS_PER_PURCHASE = 1
