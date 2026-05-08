import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { ProfileCard, type UnifiedProfile } from '@/components/profile/profile-card'
import { ChangePasswordCard } from '@/components/profile/change-password-card'
import { InviteForm } from '@/components/dashboard/grandma/invite-form'

export default async function GrandmaProfilePage() {
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
      .select('id, first_name, last_name, grandma_name, bio, birthday, phone_number, email, text_updates_opt_in')
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
      <div className="mx-auto max-w-3xl space-y-10">

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

        <ProfileCard profile={profile} role={isPaid ? 'grandma' : 'free'} />

        {isPaid && <ChangePasswordCard />}

        {/* Family — paid users only */}
        {isPaid && (
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
        )}

      </div>
    </main>
  )
}
