import Link from 'next/link'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { SideNav } from '@/components/nav/side-nav'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="flex items-center justify-between px-4 py-3 border-b bg-background sticky top-0 z-10">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            My Grandma Name
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
            >
              Sign in
            </Link>
            <Link
              href="/signup/grandma"
              className={cn(buttonVariants({ size: 'sm' }))}
            >
              Create account
            </Link>
          </nav>
        </header>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    )
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
