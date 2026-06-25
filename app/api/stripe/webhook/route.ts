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

  const supabase = createServiceClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id
      const customerId = session.customer as string | null

      if (!userId) break

      // Persist the Stripe customer ID so future checkouts reuse it
      if (customerId) {
        await supabase
          .from('users')
          .update({ stripe_customer_id: customerId })
          .eq('id', userId)
      }
      break
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      let userId = sub.metadata?.user_id

      // Fallback: look up user by stripe_customer_id if metadata is missing
      if (!userId && sub.customer) {
        const { data: userRow } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', sub.customer as string)
          .single()
        userId = userRow?.id
      }

      if (!userId) break

      const plan = sub.items.data[0].price.recurring?.interval === 'year' ? 'annual' : 'monthly'
      // Treat trialing as active for feature access
      const isActive = sub.status === 'active' || sub.status === 'trialing'
      const isCanceling = isActive && sub.cancel_at_period_end
      const subscriptionStatus = isCanceling ? 'canceling' : isActive ? 'active' : sub.status

      const periodEnd = sub.items.data[0]?.current_period_end ?? (sub as any).current_period_end

      await supabase.from('subscriptions').upsert(
        {
          user_id: userId,
          stripe_subscription_id: sub.id,
          plan,
          status: sub.status,
          trial_end: sub.trial_end
            ? new Date(sub.trial_end * 1000).toISOString()
            : null,
          current_period_end: periodEnd
            ? new Date(periodEnd * 1000).toISOString()
            : null,
        },
        { onConflict: 'stripe_subscription_id' }
      )

      await supabase
        .from('users')
        .update({
          subscription_status: subscriptionStatus,
          ...(isActive ? { role: 'grandma' } : {}),
        })
        .eq('id', userId)

      // If grandmaName was captured during subscriber signup, save it to the profile
      const savedGrandmaName = sub.metadata?.grandma_name
      if (isActive && savedGrandmaName) {
        await supabase
          .from('profiles')
          .update({ grandma_name: savedGrandmaName })
          .eq('user_id', userId)
          .eq('grandma_name', '') // only overwrite if not already set
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      let userId = sub.metadata?.user_id

      if (!userId && sub.customer) {
        const { data: userRow } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', sub.customer as string)
          .single()
        userId = userRow?.id
      }

      if (!userId) break

      // Resolve registry list IDs so we can delete registry_items first
      const { data: registryLists } = await supabase
        .from('registry_lists')
        .select('id')
        .eq('user_id', userId)

      if (registryLists?.length) {
        const listIds = registryLists.map((r) => r.id)
        await supabase.from('registry_items').delete().in('registry_list_id', listIds)
      }

      await supabase.from('registry_lists').delete().eq('user_id', userId)
      await supabase.from('family_members').delete().eq('grandma_id', userId)
      await supabase.from('family_members').delete().eq('user_id', userId)
      await supabase.from('subscriptions').delete().eq('user_id', userId)
      await supabase.from('profiles').delete().eq('user_id', userId)
      await supabase.from('users').delete().eq('id', userId)

      // Delete the Supabase auth user last
      await supabase.auth.admin.deleteUser(userId)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const subId = (invoice as any).subscription as string | null

      if (!subId) break

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
