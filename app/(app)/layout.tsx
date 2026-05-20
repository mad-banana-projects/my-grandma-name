import { createClient, createServiceClient } from '@/lib/supabase/server'
import { TopNav } from '@/components/nav/top-nav'
import { FooterBar } from '@/components/footer/footer-bar'

const APP_NAV = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Browse Products', href: '/browse-products' },
]

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <TopNav user={null} />
        <div className="flex-1 pt-[68px]">{children}</div>
        <FooterBar />
      </div>
    )
  }

  const service = createServiceClient()
  const { data: userProfile } = await service
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = userProfile?.role

  if (role === 'family') {
    const { data: membership } = await service
      .from('family_members')
      .select('grandma_id')
      .eq('user_id', user.id)
      .eq('invite_status', 'accepted')
      .single()

    const familyNavItems = membership?.grandma_id
      ? [{ label: 'My Registry', href: `/registry/${membership.grandma_id}` }]
      : []

    return (
      <div className="flex min-h-screen flex-col">
        <TopNav user={{ email: user.email ?? '' }} appNavItems={familyNavItems} />
        <div className="flex-1 pt-[68px]">{children}</div>
        <FooterBar />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav user={{ email: user.email ?? '' }} appNavItems={APP_NAV} />
      <div className="flex-1 pt-[68px]">{children}</div>
      <FooterBar />
    </div>
  )
}
