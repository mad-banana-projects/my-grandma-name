'use server'

import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const profileSchema = z.object({
  first_name: z.string().min(1, 'Required').max(100),
  last_name: z.string().min(1, 'Required').max(100),
  email: z.email('Enter a valid email address'),
  phone_number: z.string().min(1, 'Required').max(30),
  text_updates_opt_in: z.boolean(),
  grandma_name: z.string().max(100).optional().default(''),
  bio: z.string().max(1000).optional().default(''),
  birthday: z.string().optional(),
  address: z.string().max(500).optional().default(''),
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

export type ProfileFormValues = z.infer<typeof profileSchema>
export type ReminderFormValues = z.infer<typeof remindersSchema>

export type UpdateProfileResult =
  | { success: true }
  | { success: false; error: string }

export async function updateProfile(
  data: ProfileFormValues
): Promise<UpdateProfileResult> {
  const parsed = profileSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const service = createServiceClient()
  const { error } = await service
    .from('profiles')
    .update({
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      email: parsed.data.email,
      phone_number: parsed.data.phone_number,
      text_updates_opt_in: parsed.data.text_updates_opt_in,
      grandma_name: parsed.data.grandma_name ?? '',
      bio: parsed.data.bio ?? '',
      birthday: parsed.data.birthday || null,
      address: parsed.data.address ?? '',
    })
    .eq('user_id', user.id)

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

export async function cancelSubscription(): Promise<UpdateProfileResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const service = createServiceClient()
  const { error } = await service
    .from('users')
    .update({ role: 'free', subscription_status: 'inactive' })
    .eq('id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function saveBirthday(birthday: string): Promise<UpdateProfileResult> {
  const trimmed = birthday.trim()
  if (!trimmed || !/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return { success: false, error: 'Enter a valid date.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const service = createServiceClient()
  const { error } = await service
    .from('profiles')
    .update({ birthday: trimmed })
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function saveGrandmaName(name: string): Promise<UpdateProfileResult> {
  const trimmed = name.trim().slice(0, 100)
  if (!trimmed) return { success: false, error: 'Name is required' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const service = createServiceClient()
  const { error } = await service
    .from('profiles')
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
    .from('profiles')
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
