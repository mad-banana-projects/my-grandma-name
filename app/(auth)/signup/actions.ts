'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'

import { createClient, createServiceClient } from '@/lib/supabase/server'

export type GrandmaSignupState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  fieldErrors?: {
    email?: string[]
    password?: string[]
    confirmPassword?: string[]
    firstName?: string[]
    lastName?: string[]
    phone?: string[]
  }
}

const signupSchema = z
  .object({
    email: z.email('Enter a valid email address.').trim().toLowerCase(),
    password: z
      .string()
      .min(8, 'Use at least 8 characters.')
      .max(50, 'Password must be 50 characters or fewer.')
      .transform((s) => s.trim()),
    confirmPassword: z.string().transform((s) => s.trim()),
    firstName: z
      .string()
      .min(1, 'Enter your first name.')
      .max(30)
      .regex(/^[\p{L}]+$/u, 'Letters only.'),
    lastName: z
      .string()
      .min(1, 'Enter your last name.')
      .max(30)
      .regex(/^[\p{L}]+$/u, 'Letters only.'),
    phone: z.string().regex(/^\d{10}$/, 'Enter a 10-digit phone number.'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
}

export async function signUpGrandma(
  _prevState: GrandmaSignupState,
  formData: FormData
): Promise<GrandmaSignupState> {
  const grandmaName = (formData.get('grandmaName') as string | null)?.trim() || null
  const textUpdatesOptIn = formData.get('textUpdatesOptIn') === 'on'

  const parsed = signupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    phone: formData.get('phone'),
  })

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Check the highlighted fields and try again.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const { email, password, firstName, lastName, phone } = parsed.data

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role: 'free' },
      emailRedirectTo: `${getAppUrl()}/api/auth/callback?next=${encodeURIComponent('/dashboard')}`,
    },
  })

  if (error) {
    return { status: 'error', message: error.message }
  }

  if (!data.user) {
    return { status: 'error', message: 'Supabase did not return a user for this signup.' }
  }

  // The auth trigger creates a bare profiles row on signup; upsert the full details here
  const serviceClient = createServiceClient()
  const profilePayload: Record<string, unknown> = {
    user_id: data.user.id,
    email,
    first_name: firstName,
    last_name: lastName,
    phone_number: phone,
    text_updates_opt_in: textUpdatesOptIn,
  }
  if (grandmaName) profilePayload.grandma_name = grandmaName

  const { error: profileError } = await serviceClient
    .from('profiles')
    .upsert(profilePayload, { onConflict: 'user_id' })

  if (profileError) {
    return { status: 'error', message: profileError.message }
  }

  // Email confirmation disabled — user is immediately logged in
  if (data.session) {
    redirect('/dashboard')
  }

  return {
    status: 'success',
    message: 'Account created. Check your email to confirm your signup, then log in to continue.',
  }
}
