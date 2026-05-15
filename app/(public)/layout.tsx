import { createClient } from '@/lib/supabase/server'
import { TopNav } from '@/components/nav/top-nav'
import { FooterBar } from '@/components/footer/footer-bar'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <>
      <TopNav user={user ? { email: user.email ?? '' } : null} />
      {children}
      <FooterBar />
    </>
  )
}
