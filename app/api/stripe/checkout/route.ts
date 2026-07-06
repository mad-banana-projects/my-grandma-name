import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { plan, grandmaName } = await request.json() as { plan: 'monthly' | 'annual'; grandmaName?: string | null }

  if (plan !== 'monthly' && plan !== 'annual') {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const priceId =
    plan === 'annual'
      ? process.env.STRIPE_YEARLY_PRICE_ID!
      : process.env.STRIPE_MONTHLY_PRICE_ID!

  const { data: profile } = await supabase
    .from('users')
    .select('stripe_customer_id, email')
    .eq('id', user.id)
    .single()

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: profile?.stripe_customer_id ?? undefined,
    customer_email: profile?.stripe_customer_id ? undefined : (profile?.email ?? user.email),
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 7,
      metadata: {
        user_id: user.id,
        ...(grandmaName ? { grandma_name: grandmaName } : {}),
      },
    },
    allow_promotion_codes: true,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe`,
    metadata: {
      user_id: user.id,
      ...(grandmaName ? { grandma_name: grandmaName } : {}),
    },
  })

  return NextResponse.json({ url: session.url })
}
