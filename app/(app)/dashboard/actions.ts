'use server'

import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const paidProfileSchema = z.object({
  first_name: z.string().min(1, 'Required').max(100),
  last_name: z.string().min(1, 'Required').max(100),
  grandma_name: z.string().min(1, 'Required').max(100),
  bio: z.string().min(1, 'Required').max(1000),
  birthday: z.string().min(1, 'Required'),
  phone_number: z.string().min(1, 'Required').max(30),
  email: z.email('Enter a valid email address'),
  text_updates_opt_in: z.boolean(),
})

const freeProfileSchema = z.object({
  first_name: z.string().min(1, 'Required').max(100),
  last_name: z.string().min(1, 'Required').max(100),
  email: z.email('Enter a valid email address'),
  bio: z.string().min(1, 'Required').max(1000),
})

const passwordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

const customDateSchema = z.object({
  label: z.string().min(1).max(100),
  date: z.string().min(1),
})

const remindersSchema = z.object({
  reminder_grandparents_day: z.boolean(),
  reminder_mothers_day: z.boolean(),
  reminder_birthday: z.boolean(),
  reminder_christmas: z.boolean(),
  reminder_custom_dates: z.array(customDateSchema),
  reminder_frequency: z.array(z.number().int().min(1).max(365)),
})

export type PaidProfileFormValues = z.infer<typeof paidProfileSchema>
export type FreeProfileFormValues = z.infer<typeof freeProfileSchema>
export type ReminderFormValues = z.infer<typeof remindersSchema>

export type UpdateProfileResult =
  | { success: true }
  | { success: false; error: string }

export async function updateProfile(
  data: PaidProfileFormValues
): Promise<UpdateProfileResult> {
  const parsed = paidProfileSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const service = createServiceClient()

  const { data: userData } = await service
    .from('users')
    .select('role, subscription_status')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'grandma' || userData?.subscription_status !== 'active') {
    return { success: false, error: 'Not authorized' }
  }

  const { error } = await service
    .from('grandma_profiles')
    .update(parsed.data)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateFreeProfile(
  data: FreeProfileFormValues
): Promise<UpdateProfileResult> {
  const parsed = freeProfileSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const service = createServiceClient()
  const { error } = await service
    .from('free_profiles')
    .upsert(
      {
        user_id: user.id,
        email: parsed.data.email,
        first_name: parsed.data.first_name,
        last_name: parsed.data.last_name,
        bio: parsed.data.bio,
      },
      { onConflict: 'user_id' }
    )

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updatePassword(
  data: { password: string; confirmPassword: string }
): Promise<UpdateProfileResult> {
  const parsed = passwordSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (error) return { success: false, error: error.message }

  return { success: true }
}

export async function saveGrandmaName(name: string): Promise<UpdateProfileResult> {
  const trimmed = name.trim().slice(0, 100)
  if (!trimmed) return { success: false, error: 'Name is required' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const service = createServiceClient()
  const { data: userData } = await service
    .from('users')
    .select('role, subscription_status')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'grandma' || userData?.subscription_status !== 'active') {
    return { success: false, error: 'Not authorized' }
  }

  const { error } = await service
    .from('grandma_profiles')
    .update({ grandma_name: trimmed })
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateReminders(
  data: ReminderFormValues
): Promise<UpdateProfileResult> {
  const parsed = remindersSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const service = createServiceClient()
  const { error } = await service
    .from('grandma_profiles')
    .update({
      reminder_grandparents_day: parsed.data.reminder_grandparents_day,
      reminder_mothers_day: parsed.data.reminder_mothers_day,
      reminder_birthday: parsed.data.reminder_birthday,
      reminder_christmas: parsed.data.reminder_christmas,
      reminder_custom_dates: parsed.data.reminder_custom_dates,
      reminder_frequency: parsed.data.reminder_frequency,
    })
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}
