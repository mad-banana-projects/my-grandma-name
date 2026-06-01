'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'

export type LoginState = {
  status: 'idle' | 'error'
  message?: string
  fieldErrors?: {
    email?: string[]
    password?: string[]
  }
}

const loginSchema = z.object({
  email: z.email('Enter a valid email address.').trim().toLowerCase(),
  password: z.string().min(1, 'Enter your password.').max(50, 'Password must be 50 characters or fewer.').transform((s) => s.trim()),
})

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Check the highlighted fields and try again.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const { email, password } = parsed.data
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { status: 'error', message: 'Incorrect email or password.' }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .single()

  if (profile?.role === 'grandma') {
    redirect('/dashboard')
  } else if (profile?.role === 'family') {
    const { data: membership } = await supabase
      .from('family_members')
      .select('grandma_id')
      .eq('user_id', data.user.id)
      .eq('invite_status', 'accepted')
      .single()
    redirect(membership ? `/registry/${membership.grandma_id}` : '/browse-products')
  } else {
    redirect('/dashboard')
  }
}
