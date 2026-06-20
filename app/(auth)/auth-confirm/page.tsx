'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function AuthConfirm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/dashboard'
  const [error, setError] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function handleAuth() {
      // Explicitly parse hash params — more reliable than relying on
      // createBrowserClient's auto-detection, which can miss the event in production.
      const hashParams = new URLSearchParams(window.location.hash.slice(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')

      if (accessToken && refreshToken) {
        const { data: { session }, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        if (session) {
          router.replace(next)
          return
        }
        if (sessionError) {
          setError(true)
          return
        }
      }

      // Fallback: session already established (e.g. page reload after sign-in)
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace(next)
        return
      }

      setError(true)
    }

    handleAuth()
  }, [next, router])

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="space-y-2 text-center">
          <p className="text-sm text-destructive">This link has expired or is invalid.</p>
          <p className="text-sm text-muted-foreground">Please ask to be re-invited.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30">
      <p className="text-sm text-muted-foreground">Signing you in…</p>
    </main>
  )
}

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center bg-muted/30">
        <p className="text-sm text-muted-foreground">Signing you in…</p>
      </main>
    }>
      <AuthConfirm />
    </Suspense>
  )
}
