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
    grandmaName?: string[]
    birthday?: string[]
  }
}

const grandmaSignupSchema = z.object({
  email: z.email('Enter a valid email address.').trim().toLowerCase(),
  password: z
    .string()
    .min(8, 'Use at least 8 characters.'),
  grandmaName: z
    .string()
    .trim()
    .min(2, 'Enter at least 2 characters.')
    .max(40, 'Keep the name under 40 characters.'),
  birthday: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || null)
    .refine((value) => value === null || !Number.isNaN(Date.parse(value)), {
      message: 'Enter a valid birthday.',
    }),
})

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
}

export async function signUpGrandma(
  _prevState: GrandmaSignupState,
  formData: FormData
): Promise<GrandmaSignupState> {
  const parsed = grandmaSignupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    grandmaName: formData.get('grandmaName'),
    birthday: formData.get('birthday'),
  })

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Check the highlighted fields and try again.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const { email, password, grandmaName, birthday } = parsed.data
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'grandma',
      },
      emailRedirectTo: `${getAppUrl()}/api/auth/callback?next=/subscribe`,
    },
  })

  if (error) {
    return {
      status: 'error',
      message: error.message,
    }
  }

  if (!data.user) {
    return {
      status: 'error',
      message: 'Supabase did not return a user for this signup.',
    }
  }

  const serviceClient = await createServiceClient()
  const { error: profileError } = await serviceClient
    .from('grandma_profiles')
    .upsert(
      {
        user_id: data.user.id,
        grandma_name: grandmaName,
        birthday,
      },
      { onConflict: 'user_id' }
    )

  if (profileError) {
    return {
      status: 'error',
      message: profileError.message,
    }
  }

  if (data.session) {
    redirect('/subscribe')
  }

  return {
    status: 'success',
    message: 'Account created. Check your email to confirm your signup, then continue to your subscription.',
  }
}
