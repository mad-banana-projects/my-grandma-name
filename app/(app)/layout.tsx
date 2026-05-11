import { createClient, createServiceClient } from '@/lib/supabase/server'
import { SideNav } from '@/components/nav/side-nav'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen">
        <SideNav isAnon />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    )
  }

  const service = createServiceClient()

  const [{ data: userProfile }, { data: grandmaProfile }] = await Promise.all([
    service.from('users').select('role').eq('id', user.id).single(),
    service.from('grandma_profiles').select('id').eq('user_id', user.id).single(),
  ])

  const role = userProfile?.role

  if (role === 'family') {
    const { data: membership } = await service
      .from('family_members')
      .select('grandma_id')
      .eq('user_id', user.id)
      .eq('invite_status', 'accepted')
      .single()

    return (
      <div className="flex flex-col md:flex-row min-h-screen">
        <SideNav
          email={user.email ?? ''}
          familyRegistryId={membership?.grandma_id ?? null}
        />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    )
  }

  const isFreeUser = role === 'free'

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <SideNav
        email={user.email ?? ''}
        grandmaProfileId={grandmaProfile?.id ?? null}
        isFreeUser={isFreeUser}
      />
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  )
}
