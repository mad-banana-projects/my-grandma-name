'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function AuthConfirm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/dashboard'

  useEffect(() => {
    const supabase = createClient()

    // For implicit flow: the browser Supabase client detects #access_token in
    // the URL hash and calls setSession automatically. We wait for the SIGNED_IN
    // event, then forward the user to their intended destination.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        router.replace(next)
      }
    })

    // In case session is already established (e.g. page reload)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace(next)
    })

    return () => subscription.unsubscribe()
  }, [next, router])

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
