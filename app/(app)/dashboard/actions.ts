'use server'

import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { resend } from '@/lib/resend'

const profileSchema = z.object({
  first_name: z.string().min(1, 'Required').max(30).regex(/^[\p{L}]+$/u, 'Letters only'),
  last_name: z.string().min(1, 'Required').max(30).regex(/^[\p{L}]+$/u, 'Letters only'),
  email: z.email('Enter a valid email address'),
  phone_number: z.string().regex(/^\d{10}$/, 'Enter a 10-digit phone number'),
  text_updates_opt_in: z.boolean(),
  grandma_name: z.string().max(30).optional().default(''),
  bio: z.string().max(160).optional().default(''),
  birthday: z.string().optional(),
  address: z.string().max(500).optional().default(''),
})

const passwordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters').max(50, 'Password must be 50 characters or fewer').transform((s) => s.trim()),
    confirmPassword: z.string().transform((s) => s.trim()),
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

export async function sendTestReminder(): Promise<UpdateProfileResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const service = createServiceClient()
  const { data: profile } = await service
    .from('profiles')
    .select(`
      id, first_name, grandma_name,
      family_members ( id, first_name, email, invite_status )
    `)
    .eq('user_id', user.id)
    .single()

  if (!profile) return { success: false, error: 'Profile not found' }

  const acceptedMembers = (
    profile.family_members as { id: string; first_name: string | null; email: string; invite_status: string }[] | null
  )?.filter((m) => m.invite_status === 'accepted' && m.email) ?? []

  if (!acceptedMembers.length) {
    return { success: false, error: 'No accepted family members to send to' }
  }

  const displayName = (profile.grandma_name as string | null) || (profile.first_name as string | null) || 'Grandma'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://mygrandmaname.com'
  const registryUrl = `${appUrl}/registry/${profile.id}`

  let sent = 0
  for (const member of acceptedMembers) {
    const greeting = member.first_name ? `Hi ${member.first_name},` : 'Hi there,'
    const { error } = await resend.emails.send({
      from: 'My Grandma Name <reminders@mygrandmaname.com>',
      to: member.email,
      subject: `[Test] ${displayName}'s Birthday is in 7 days — check out her wishlist`,
      html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;color:#111;">
  <p style="margin:0 0 8px;font-size:11px;color:#bbb;text-transform:uppercase;letter-spacing:0.05em;">Test reminder</p>
  <p style="margin:0 0 16px;font-size:15px;">${greeting}</p>
  <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">
    Just a heads-up: <strong>${displayName}'s Birthday</strong> is coming up in 7 days.
    Don't miss the chance to get her something she'll love.
  </p>
  <a href="${registryUrl}"
     style="display:inline-block;background:#111;color:#fff;text-decoration:none;
            padding:12px 24px;border-radius:6px;font-size:14px;font-weight:500;">
    View ${displayName}'s Wishlist →
  </a>
  <hr style="margin:32px 0;border:none;border-top:1px solid #eee;" />
  <p style="margin:0;color:#999;font-size:12px;line-height:1.6;">
    You're receiving this reminder because you were added to ${displayName}'s
    family list on <a href="${appUrl}" style="color:#999;">My Grandma Name</a>.
  </p>
</div>`,
    })
    if (!error) sent++
  }

  if (sent === 0) return { success: false, error: 'Failed to send — check Resend configuration' }
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
