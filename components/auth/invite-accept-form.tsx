'use client'

import { useState, useTransition } from 'react'
import { sendInviteOtp } from '@/app/(auth)/invite/[token]/actions'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface InviteAcceptFormProps {
  token: string
  email: string
  firstName: string | null
  grandmaName: string
}

export function InviteAcceptForm({ token, email, firstName, grandmaName }: InviteAcceptFormProps) {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleAccept() {
    setError(null)
    startTransition(async () => {
      const result = await sendInviteOtp(email, token)
      if (result.success) {
        setSent(true)
      } else {
        setError(result.error)
      }
    })
  }

  if (sent) {
    return (
      <div className="w-full max-w-md space-y-4 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            We sent a sign-in link to{' '}
            <span className="font-medium text-foreground">{email}</span>.
            Click it to view {grandmaName}&apos;s registry.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Didn&apos;t receive it?{' '}
          <button
            onClick={() => setSent(false)}
            className="underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Try again
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md space-y-6 text-center">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">You&apos;re invited</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {firstName ? `Hi ${firstName}!` : 'Hi there!'}
        </h1>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{grandmaName}</span> has invited you to
          view her gift registry. We&apos;ll send a sign-in link to{' '}
          <span className="font-medium text-foreground">{email}</span>.
        </p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        onClick={handleAccept}
        disabled={isPending}
        className={cn(buttonVariants({ size: 'lg' }), 'w-full disabled:opacity-50')}
      >
        {isPending ? 'Sending…' : 'Accept invitation'}
      </button>
    </div>
  )
}
