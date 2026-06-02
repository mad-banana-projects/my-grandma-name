import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { ProfileCard, type UnifiedProfile } from '@/components/profile/profile-card'
import { InviteForm } from '@/components/dashboard/grandma/invite-form'
import { EmailRemindersCard } from '@/components/dashboard/email-reminders-card'
import { LockedFeatureCard } from '@/components/dashboard/locked-feature-card'
import { RegistryPreviewCard } from '@/components/dashboard/registry-preview-card'
import type { RegistryPreviewItem } from '@/components/dashboard/registry-preview-card'
import { BirthdayPrompt } from '@/components/dashboard/birthday-prompt'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>
}) {
  const params = await searchParams
  const isPostCheckout = params.checkout === 'success'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const service = createServiceClient()

  const [{ data: userData }, { data: profileData }] = await Promise.all([
    service.from('users').select('role, subscription_status').eq('id', user.id).single(),
    service.from('profiles').select(`
      id, first_name, last_name, grandma_name, bio, birthday, phone_number,
      email, text_updates_opt_in, address,
      reminder_grandparents_day, reminder_mothers_day, reminder_birthday, reminder_christmas,
      reminder_custom_dates, reminder_frequency
    `).eq('user_id', user.id).single(),
  ])

  const role = (userData?.role ?? 'free') as 'free' | 'grandma' | 'family'
  const subscriptionStatus = userData?.subscription_status
  const isPaid = role === 'grandma' && subscriptionStatus === 'active'

  const needsBirthday = isPaid && !profileData?.birthday
  const showBirthdayModal = isPostCheckout && needsBirthday

  if (!profileData) redirect('/login')

  const profile: UnifiedProfile = {
    id: profileData.id,
    first_name: profileData.first_name,
    last_name: profileData.last_name,
    email: profileData.email,
    phone_number: profileData.phone_number,
    text_updates_opt_in: profileData.text_updates_opt_in,
    grandma_name: profileData.grandma_name,
    bio: profileData.bio,
    birthday: profileData.birthday,
    address: profileData.address,
  }

  const reminderSettings = isPaid ? {
    reminder_grandparents_day: profileData.reminder_grandparents_day ?? true,
    reminder_mothers_day: profileData.reminder_mothers_day ?? true,
    reminder_birthday: profileData.reminder_birthday ?? true,
    reminder_christmas: profileData.reminder_christmas ?? true,
    reminder_custom_dates: (profileData.reminder_custom_dates as { label: string; date: string }[] | null) ?? [],
    reminder_frequency: (profileData.reminder_frequency as number[] | null) ?? [30, 14, 7],
  } : null

  let members: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string
    relationship: string | null
    invite_status: string | null
  }[] = []
  let registryItems: RegistryPreviewItem[] = []

  if (isPaid) {
    const [{ data: familyMembers }, { data: regItems }] = await Promise.all([
      service
        .from('family_members')
        .select('id, first_name, last_name, email, relationship, invite_status')
        .eq('grandma_id', profileData.id)
        .order('created_at', { ascending: true }),
      service
        .from('registry_items')
        .select('id, product:products(name, image_urls, price, brand, affiliate_url, product_url), variant:product_variants(id, label)')
        .eq('grandma_id', profileData.id)
        .order('added_at', { ascending: false })
        .limit(3),
    ])

    members = familyMembers ?? []
    registryItems = (regItems ?? []) as unknown as RegistryPreviewItem[]
  }

  return (
    <main className="bg-background px-4 py-12">
      <div className="mx-auto max-w-5xl space-y-10">

        <BirthdayPrompt initialOpen={showBirthdayModal} needsBirthday={needsBirthday} />

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back</p>
            <h1 className="text-3xl font-semibold tracking-tight">
              {profile.grandma_name || profile.first_name || user.email}
            </h1>
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

        {/* 2×2 grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          {/* Col 1, Row 1: About Me */}
          <div id="about-me" className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">About Me</h2>
            <ProfileCard
              profile={profile}
              subscriptionStatus={subscriptionStatus ?? null}
            />
          </div>

          {/* Col 2, Row 1: My Registry */}
          <div className="flex flex-col gap-4 h-full">
            <h2 className="text-lg font-semibold">My Registry</h2>
            {isPaid ? (
              <RegistryPreviewCard
                grandmaProfileId={profileData.id}
                items={registryItems}
              />
            ) : (
              <LockedFeatureCard
                className="flex-1"
                description="Save gift ideas to your personal registry and share it with family."
              />
            )}
          </div>

          {/* Col 1, Row 2: Email Reminders */}
          {isPaid && reminderSettings ? (
            <EmailRemindersCard id="email-reminders" initial={reminderSettings} />
          ) : (
            <div id="email-reminders" className="flex flex-col gap-4 h-full">
              <h2 className="text-lg font-semibold">Email Reminders</h2>
              <LockedFeatureCard
                className="flex-1"
                description="Get reminders before birthdays, holidays, and custom dates — so family never misses a gift opportunity."
              />
            </div>
          )}

          {/* Col 2, Row 2: My Family */}
          {isPaid ? (
            <div id="my-family" className="flex flex-col gap-4 h-full">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">My Family</h2>
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

              <InviteForm memberCount={members.length} className="flex-1" />
            </div>
          ) : (
            <div className="flex flex-col gap-4 h-full">
              <h2 className="text-lg font-semibold">My Family</h2>
              <LockedFeatureCard
                className="flex-1"
                description="Invite family members to view your registry. They'll get a link directly to your wishlist."
              />
            </div>
          )}

        </div>
      </div>
    </main>
  )
}
