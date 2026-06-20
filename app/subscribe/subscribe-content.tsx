'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const PLANS = [
  {
    id: 'monthly' as const,
    label: 'Monthly',
    price: '$20',
    period: 'per month',
    description: 'Full access, billed monthly. Cancel any time.',
  },
  {
    id: 'annual' as const,
    label: 'Annual',
    price: '$192',
    period: 'per year',
    description: 'Full access, billed annually. Save $48 vs monthly.',
    badge: 'Best value',
  },
]

interface SubscribeContentProps {
  grandmaName?: string | null
}

export function SubscribeContent({ grandmaName }: SubscribeContentProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<'monthly' | 'annual' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubscribe(plan: 'monthly' | 'annual') {
    setLoading(plan)
    setError(null)

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, grandmaName: grandmaName ?? null }),
      })

      if (res.status === 401) {
        router.push('/login')
        return
      }

      const data = await res.json()

      if (!res.ok || !data.url) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      window.location.href = data.url
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-16">

      <div className="mb-10 text-center">
        <h1 className="font-heading text-4xl font-light tracking-tight sm:text-5xl">
          Upgrade Your Account
        </h1>
        {grandmaName ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Subscribe to save{' '}
            <span className="font-medium text-foreground">{grandmaName}</span>{' '}
            to your profile and unlock your full registry.
          </p>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Unlock your registry, family sharing, and email reminders.
          </p>
        )}
      </div>

      <div className="grid w-full max-w-2xl gap-6 sm:grid-cols-2">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className="relative flex flex-col rounded-2xl border border-border bg-white p-8 shadow-[0_2px_12px_rgba(53,51,48,0.08)]"
          >
            {plan.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-secondary px-4 py-1 text-xs font-medium text-white">
                {plan.badge}
              </span>
            )}

            <div className="mb-6 space-y-1">
              <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                {plan.label}
              </p>
              <p className="font-heading text-4xl font-light">
                {plan.price}
              </p>
              <p className="text-xs text-muted-foreground">{plan.period}</p>
            </div>

            <p className="mb-8 text-sm leading-relaxed text-foreground/70">
              {plan.description}
            </p>

            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading !== null}
              className={cn(
                buttonVariants({ size: 'lg' }),
                'mt-auto w-full',
                loading === plan.id && 'opacity-70 cursor-not-allowed'
              )}
            >
              {loading === plan.id ? 'Redirecting…' : 'Subscribe'}
            </button>
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-6 text-sm text-destructive">{error}</p>
      )}

      <p className="mt-8 text-xs text-muted-foreground">
        Includes a 7-day free trial. No charge until the trial ends.
      </p>

    </main>
  )
}
