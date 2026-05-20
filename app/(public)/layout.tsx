import { createClient, createServiceClient } from '@/lib/supabase/server'
import { TopNav } from '@/components/nav/top-nav'
import { FooterBar } from '@/components/footer/footer-bar'

const APP_NAV = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Browse Products', href: '/browse-products' },
]

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let appNavItems: { label: string; href: string }[] = []

  if (user) {
    const service = createServiceClient()
    const { data: userProfile } = await service
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userProfile?.role !== 'family') {
      appNavItems = APP_NAV
    }
  }

  return (
    <>
      <TopNav user={user ? { email: user.email ?? '' } : null} appNavItems={appNavItems} />
      {children}
      <FooterBar />
    </>
  )
}
