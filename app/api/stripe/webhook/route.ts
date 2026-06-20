import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe, MOCK_CREDITS_PER_PURCHASE } from '@/lib/stripe/client'
import { createAdminClient } from '@/lib/supabase/admin'
import { grantCourseMockAllowance, grantPurchasedCredits } from '@/lib/stripe/entitlements'

// Needs the raw request body for signature verification — Node runtime only.
export const runtime = 'nodejs'

/**
 * Stripe webhook.
 *
 * SECURITY INVARIANT #1: the signature is verified against the RAW body via
 * `stripe.webhooks.constructEvent` before anything in the payload is trusted;
 * a verification failure returns 400 and nothing is parsed/acted on.
 *
 * SECURITY INVARIANT #2: fulfillment is idempotent. We insert the purchase row
 * first, anchored on the UNIQUE stripe_checkout_session_id; a duplicate delivery
 * hits the unique violation (or an existing completed row) and STOPS without
 * granting again. Entitlements/enrollment are never double-granted.
 *
 * SECURITY INVARIANT #5: all fulfillment writes use the service-role admin
 * client. This route is unauthenticated (Stripe calls it) and is protected by
 * signature verification only.
 */

// Postgres unique-violation SQLSTATE.
const UNIQUE_VIOLATION = '23505'

export async function POST(req: Request): Promise<Response> {
  const rawBody = await req.text()
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown'
    console.error('[stripe-webhook] signature verification failed:', message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      await fulfillCheckout(session)
    } else {
      console.log(`[stripe-webhook] unhandled event type: ${event.type}`)
    }
  } catch (err) {
    // Log and 200 — returning non-200 makes Stripe retry, which for our
    // idempotent fulfillment just replays harmlessly; but a transient app error
    // here should not loop forever, so we ack and rely on the audit trail.
    console.error('[stripe-webhook] handler error:', err)
    return NextResponse.json({ received: true }, { status: 200 })
  }

  return NextResponse.json({ received: true }, { status: 200 })
}

async function fulfillCheckout(session: Stripe.Checkout.Session): Promise<void> {
  const kind = session.metadata?.kind
  const studentId = session.metadata?.student_id
  const courseId = session.metadata?.course_id
  const sessionId = session.id
  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : (session.payment_intent?.id ?? null)
  const amountCents = session.amount_total ?? 0
  const currency = (session.currency ?? 'usd').toUpperCase()

  if (!kind || !studentId || !courseId) {
    console.error('[stripe-webhook] missing metadata on session', sessionId, {
      kind,
      studentId,
      courseId,
    })
    return
  }

  const admin = createAdminClient()

  if (kind === 'course') {
    // Idempotency anchor: insert the purchase keyed on the unique session id.
    const { data: purchase, error } = await admin
      .from('course_purchases')
      .insert({
        student_id: studentId,
        course_id: courseId,
        stripe_checkout_session_id: sessionId,
        stripe_payment_intent_id: paymentIntentId,
        amount_cents: amountCents,
        currency,
        status: 'completed',
      })
      .select('id')
      .single()

    if (error) {
      if (error.code === UNIQUE_VIOLATION) {
        // Duplicate delivery — already fulfilled. Do not re-grant.
        console.log('[stripe-webhook] course session already fulfilled:', sessionId)
        return
      }
      throw new Error('course_purchases insert failed: ' + error.message)
    }

    // Grant course access: an active enrollment linked to this purchase.
    const { data: enrollment, error: enrollErr } = await admin
      .from('enrollments')
      .upsert(
        {
          student_id: studentId,
          course_id: courseId,
          status: 'active',
          purchase_id: purchase.id,
        },
        { onConflict: 'student_id,course_id' },
      )
      .select('id')
      .single()
    if (enrollErr) throw new Error('enrollment upsert failed: ' + enrollErr.message)

    // Back-link the enrollment onto the purchase row.
    await admin
      .from('course_purchases')
      .update({ enrollment_id: enrollment.id })
      .eq('id', purchase.id)

    // Bundle the included mock allowance (>= 5, never lowering).
    await grantCourseMockAllowance(studentId, courseId)
    console.log('[stripe-webhook] course fulfilled:', sessionId)
    return
  }

  if (kind === 'mock') {
    // Idempotency anchor: insert the mock_purchases row keyed on the session id.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- types regenerate after migration apply
    const { error } = await (admin as any)
      .from('mock_purchases')
      .insert({
        student_id: studentId,
        course_id: courseId,
        stripe_checkout_session_id: sessionId,
        stripe_payment_intent_id: paymentIntentId,
        amount_cents: amountCents,
        currency,
        status: 'completed',
        credits_granted: MOCK_CREDITS_PER_PURCHASE,
      })

    if (error) {
      if (error.code === UNIQUE_VIOLATION) {
        console.log('[stripe-webhook] mock session already fulfilled:', sessionId)
        return
      }
      throw new Error('mock_purchases insert failed: ' + error.message)
    }

    await grantPurchasedCredits(studentId, courseId, MOCK_CREDITS_PER_PURCHASE)
    console.log('[stripe-webhook] mock fulfilled:', sessionId)
    return
  }

  console.error('[stripe-webhook] unknown kind in metadata:', kind)
}
