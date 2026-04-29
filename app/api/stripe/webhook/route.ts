import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const userId = sub.metadata.user_id

      await supabase.from('subscriptions').upsert({
        user_id: userId,
        stripe_subscription_id: sub.id,
        plan: (sub.items.data[0].price.recurring?.interval === 'year') ? 'yearly' : 'monthly',
        status: sub.status,
        current_period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
      }, { onConflict: 'stripe_subscription_id' })

      await supabase
        .from('users')
        .update({ subscription_status: sub.status === 'active' ? 'active' : 'inactive' })
        .eq('id', userId)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await supabase
        .from('users')
        .update({ subscription_status: 'inactive' })
        .eq('id', sub.metadata.user_id)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const subId = (invoice as any).subscription as string
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', subId)
        .single()

      if (sub) {
        await supabase
          .from('users')
          .update({ subscription_status: 'past_due' })
          .eq('id', sub.user_id)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
