'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe, getProduct, type ProductKind } from './client'
import { resolveCoursePrice } from './pricing'

/**
 * Stripe Checkout creators (server actions).
 *
 * SECURITY INVARIANT #4: only an authenticated user can create a session. The
 * authenticated student_id (from the Supabase session, never the client), the
 * course_id, and the kind are written into the session metadata so the webhook
 * fulfills the right account.
 *
 * SECURITY INVARIANT #3: the amount/currency/name come ONLY from
 * PRODUCTS[kind] on the server — no price is read from the client.
 */

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
}

/**
 * Resolve (or lazily create) the Stripe customer for this student, persisting
 * the mapping in `stripe_customers`.
 */
async function getOrCreateStripeCustomer(
  studentId: string,
  email: string | undefined,
): Promise<string> {
  const admin = createAdminClient()
  const { data: existing } = await admin
    .from('stripe_customers')
    .select('stripe_customer_id')
    .eq('student_id', studentId)
    .maybeSingle()

  if (existing?.stripe_customer_id) return existing.stripe_customer_id

  const customer = await getStripe().customers.create({
    email,
    metadata: { student_id: studentId },
  })

  await admin.from('stripe_customers').upsert(
    {
      student_id: studentId,
      stripe_customer_id: customer.id,
      email: email ?? null,
    },
    { onConflict: 'student_id' },
  )

  return customer.id
}

async function createCheckout(kind: ProductKind, courseSlug: string): Promise<{ url: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const admin = createAdminClient()
  const { data: course } = await admin
    .from('courses')
    .select('id, slug, status')
    .eq('slug', courseSlug)
    .single()
  if (!course) throw new Error('Course not found')

  // Name/currency come from the static product config; the course AMOUNT is
  // resolved dynamically (CCAS launch tiers by seats sold + cutoff date), so the
  // charge always matches what the sales page shows. Mock amount stays static.
  const product = getProduct(courseSlug, kind)
  const amountCents =
    kind === 'course' ? (await resolveCoursePrice(courseSlug)).amountCents : product.amountCents
  const customerId = await getOrCreateStripeCustomer(user.id, user.email)

  const base = appUrl()
  // Course buyers return to the course (now unlocked); mock buyers to the mock page.
  const returnUrl =
    kind === 'course' ? `${base}/courses/${course.slug}` : `${base}/courses/${course.slug}/mock`

  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    customer: customerId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: product.currency,
          unit_amount: amountCents,
          product_data: { name: product.name },
        },
      },
    ],
    // Fulfillment reads these in the webhook. student_id is server-derived.
    metadata: {
      kind,
      student_id: user.id,
      course_id: course.id,
    },
    success_url: `${returnUrl}?checkout=success`,
    cancel_url: `${returnUrl}?checkout=cancel`,
  })

  if (!session.url) throw new Error('Stripe did not return a checkout URL')
  return { url: session.url }
}

/** One-time $299 course purchase → course access + bundled mock allowance. */
export async function createCourseCheckout(courseSlug: string): Promise<{ url: string }> {
  return createCheckout('course', courseSlug)
}

/** Pay-per-mock $14.99 purchase → one mock credit (no course ownership needed). */
export async function createMockCheckout(courseSlug: string): Promise<{ url: string }> {
  return createCheckout('mock', courseSlug)
}
