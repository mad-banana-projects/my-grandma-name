'use server'

import { createClient } from '@/lib/supabase/server'

export type SendOtpResult = { success: true } | { success: false; error: string }

export async function sendInviteOtp(email: string, token: string): Promise<SendOtpResult> {
  const supabase = await createClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${appUrl}/api/auth/callback?next=/invite/${token}`,
    },
  })

  if (error) return { success: false, error: error.message }
  return { success: true }
}
