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
    return <>{children}</>
  }

  const service = createServiceClient()
  const { data: profile } = await service
    .from('grandma_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <SideNav
        email={user.email ?? ''}
        grandmaProfileId={profile?.id ?? null}
      />
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  )
}
