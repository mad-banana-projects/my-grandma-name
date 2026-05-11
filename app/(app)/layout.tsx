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

  const isFreeUser = userProfile?.role === 'free'

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
