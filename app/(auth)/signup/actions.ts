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
    firstName?: string[]
    lastName?: string[]
    bio?: string[]
  }
}

const signupSchema = z.object({
  email: z.email('Enter a valid email address.').trim().toLowerCase(),
  password: z.string().min(8, 'Use at least 8 characters.'),
  firstName: z.string().trim().min(1, 'Enter your first name.').max(80),
  lastName: z.string().trim().min(1, 'Enter your last name.').max(80),
  bio: z.string().trim().max(500, 'Keep your bio under 500 characters.').optional(),
})

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
}

export async function signUpGrandma(
  _prevState: GrandmaSignupState,
  formData: FormData
): Promise<GrandmaSignupState> {
  const intent = formData.get('intent') as string | null
  const grandmaName = formData.get('grandmaName') as string | null
  const isSubscribeIntent = intent === 'subscribe'

  const parsed = signupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    bio: formData.get('bio') || undefined,
  })

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Check the highlighted fields and try again.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const { email, password, firstName, lastName, bio } = parsed.data

  // Build the post-confirmation redirect destination
  const nextUrl =
    isSubscribeIntent && grandmaName
      ? `/subscribe?grandmaName=${encodeURIComponent(grandmaName)}`
      : '/dashboard'

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role: 'free' },
      emailRedirectTo: `${getAppUrl()}/api/auth/callback?next=${encodeURIComponent(nextUrl)}`,
    },
  })

  if (error) {
    return { status: 'error', message: error.message }
  }

  if (!data.user) {
    return { status: 'error', message: 'Supabase did not return a user for this signup.' }
  }

  const serviceClient = createServiceClient()
  const { error: profileError } = await serviceClient
    .from('free_profiles')
    .upsert(
      {
        user_id: data.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        bio: bio ?? '',
      },
      { onConflict: 'user_id' }
    )

  if (profileError) {
    return { status: 'error', message: profileError.message }
  }

  // Email confirmation disabled — user is immediately logged in
  if (data.session) {
    redirect(nextUrl)
  }

  return {
    status: 'success',
    message: 'Account created. Check your email to confirm your signup, then log in to continue.',
  }
}
