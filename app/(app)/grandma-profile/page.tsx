import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InviteForm } from '@/components/dashboard/grandma/invite-form'

function formatBirthday(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
}

export default async function GrandmaProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const service = createServiceClient()

  const [{ data: profile }, { data: userData }] = await Promise.all([
    service
      .from('grandma_profiles')
      .select('id, first_name, last_name, grandma_name, bio, birthday')
      .eq('user_id', user.id)
      .single(),
    service
      .from('users')
      .select('subscription_status')
      .eq('id', user.id)
      .single(),
  ])

  if (!profile) redirect('/signup/grandma')

  const { data: familyMembers } = await service
    .from('family_members')
    .select('id, first_name, last_name, email, relationship, invite_status')
    .eq('grandma_id', profile.id)
    .order('created_at', { ascending: true })

  const members = familyMembers ?? []
  const subscriptionStatus = userData?.subscription_status

  return (
    <main className="bg-background px-4 py-12">
      <div className="mx-auto max-w-3xl space-y-10">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back</p>
            <h1 className="text-3xl font-semibold tracking-tight">{profile.grandma_name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {profile.first_name} {profile.last_name}
            </p>
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

        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">About you</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {profile.bio && (
              <p className="leading-relaxed text-muted-foreground">{profile.bio}</p>
            )}
            {profile.birthday && (
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Birthday: </span>
                {formatBirthday(profile.birthday)}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Family */}
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

      </div>
    </main>
  )
}
