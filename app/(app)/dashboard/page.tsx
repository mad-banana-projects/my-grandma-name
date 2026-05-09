import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { ProfileCard, type UnifiedProfile } from '@/components/profile/profile-card'
import { InviteForm } from '@/components/dashboard/grandma/invite-form'
import { EmailRemindersCard } from '@/components/dashboard/email-reminders-card'
import { LockedFeatureCard } from '@/components/dashboard/locked-feature-card'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const service = createServiceClient()

  const { data: userData } = await service
    .from('users')
    .select('role, subscription_status')
    .eq('id', user.id)
    .single()

  const role = (userData?.role ?? 'free') as 'free' | 'grandma' | 'family'
  const isPaid = role === 'grandma'
  const subscriptionStatus = userData?.subscription_status

  let profile: UnifiedProfile
  let grandmaProfileId: string | null = null
  let reminderSettings: {
    reminder_grandparents_day: boolean
    reminder_mothers_day: boolean
    reminder_birthday: boolean
    reminder_christmas: boolean
    reminder_custom_dates: { label: string; date: string }[]
    reminder_frequency: number[]
  } | null = null
  let members: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string
    relationship: string | null
    invite_status: string | null
  }[] = []

  if (isPaid) {
    const { data: grandmaProfile } = await service
      .from('grandma_profiles')
      .select(`
        id, first_name, last_name, grandma_name, bio, birthday, phone_number, email, text_updates_opt_in,
        reminder_grandparents_day, reminder_mothers_day, reminder_birthday, reminder_christmas,
        reminder_custom_dates, reminder_frequency
      `)
      .eq('user_id', user.id)
      .single()

    if (!grandmaProfile) redirect('/signup/grandma')

    grandmaProfileId = grandmaProfile.id

    const { data: familyMembers } = await service
      .from('family_members')
      .select('id, first_name, last_name, email, relationship, invite_status')
      .eq('grandma_id', grandmaProfile.id)
      .order('created_at', { ascending: true })

    members = familyMembers ?? []

    profile = {
      id: grandmaProfile.id,
      first_name: grandmaProfile.first_name,
      last_name: grandmaProfile.last_name,
      email: grandmaProfile.email,
      bio: grandmaProfile.bio,
      grandma_name: grandmaProfile.grandma_name,
      birthday: grandmaProfile.birthday,
      phone_number: grandmaProfile.phone_number,
      text_updates_opt_in: grandmaProfile.text_updates_opt_in,
    }

    reminderSettings = {
      reminder_grandparents_day: grandmaProfile.reminder_grandparents_day ?? false,
      reminder_mothers_day: grandmaProfile.reminder_mothers_day ?? false,
      reminder_birthday: grandmaProfile.reminder_birthday ?? false,
      reminder_christmas: grandmaProfile.reminder_christmas ?? false,
      reminder_custom_dates: (grandmaProfile.reminder_custom_dates as { label: string; date: string }[] | null) ?? [],
      reminder_frequency: (grandmaProfile.reminder_frequency as number[] | null) ?? [30, 14, 7],
    }
  } else {
    const { data: freeProfile } = await service
      .from('free_profiles')
      .select('id, email, first_name, last_name, bio')
      .eq('user_id', user.id)
      .single()

    profile = {
      id: freeProfile?.id ?? null,
      first_name: freeProfile?.first_name ?? '',
      last_name: freeProfile?.last_name ?? '',
      email: freeProfile?.email ?? user.email ?? '',
      bio: freeProfile?.bio ?? '',
      grandma_name: null,
      birthday: null,
      phone_number: null,
      text_updates_opt_in: null,
    }
  }

  return (
    <main className="bg-background px-4 py-12">
      <div className="mx-auto max-w-5xl space-y-10">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back</p>
            <h1 className="text-3xl font-semibold tracking-tight">
              {isPaid && profile.grandma_name
                ? profile.grandma_name
                : profile.first_name || user.email}
            </h1>
            {isPaid && (
              <p className="mt-1 text-sm text-muted-foreground">
                {profile.first_name} {profile.last_name}
              </p>
            )}
          </div>
          <Badge
            variant={subscriptionStatus === 'active' ? 'default' : 'secondary'}
            className="mt-1 shrink-0"
          >
            {subscriptionStatus === 'active'
              ? 'Active'
              : subscriptionStatus === 'trialing'
              ? 'Trial'
              : 'Free'}
          </Badge>
        </div>

        {/* Row 1: About You + Email Reminders */}
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">

          {/* About You */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">About you</h2>
            <ProfileCard profile={profile} role={isPaid ? 'grandma' : 'free'} />
          </div>

          {/* Email Reminders */}
          {isPaid && reminderSettings ? (
            <EmailRemindersCard initial={reminderSettings} />
          ) : (
            <LockedFeatureCard
              title="Email Reminders"
              description="Get reminders before birthdays, holidays, and custom dates — so family never misses a gift opportunity."
            />
          )}

        </div>

        {/* Row 2: Family Members — full width */}
        {isPaid ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your family</h2>
              <span className="text-sm text-muted-foreground">{members.length} / 10 members</span>
            </div>

            {members.length > 0 && (
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {member.first_name && member.last_name
                          ? `${member.first_name} ${member.last_name}`
                          : member.email}
                      </p>
                      {member.first_name && (
                        <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                      )}
                      {member.relationship && (
                        <p className="text-xs capitalize text-muted-foreground">
                          {member.relationship}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={member.invite_status === 'accepted' ? 'default' : 'secondary'}
                      className="ml-4 shrink-0"
                    >
                      {member.invite_status === 'accepted' ? 'Joined' : 'Invited'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            <InviteForm memberCount={members.length} />
          </div>
        ) : (
          <LockedFeatureCard
            title="Family Members"
            description="Invite family members to view your registry. They'll get a link directly to your wishlist."
          />
        )}

      </div>
    </main>
  )
}
