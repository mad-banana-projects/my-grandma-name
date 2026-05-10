import Stripe from 'stripe'

let _client: Stripe | null = null

function getClient(): Stripe {
  if (!_client) _client = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-04-22.dahlia',
  })
  return _client
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop: string | symbol) {
    const client = getClient()
    const val = (client as any)[prop]
    return typeof val === 'function' ? val.bind(client) : val
  },
})
