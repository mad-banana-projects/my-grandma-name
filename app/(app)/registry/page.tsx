import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Lock } from 'lucide-react'

export default async function RegistryLockedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = createServiceClient()
  const { data: userProfile } = await service
    .from('users')
    .select('role, subscription_status')
    .eq('id', user.id)
    .single()

  // Paid users should never land here — send them to their registry
  if (userProfile?.role === 'grandma' && userProfile?.subscription_status === 'active') {
    const { data: grandmaProfile } = await service
      .from('grandma_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (grandmaProfile) redirect(`/registry/${grandmaProfile.id}`)
  }

  return (
    <main className="bg-background px-4 py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <h1 className="text-3xl font-semibold tracking-tight">My Registry</h1>
        <div className="rounded-lg border bg-muted/30 p-8 flex flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold">Upgrade to unlock your registry</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Save gift ideas, share your wishlist with family, and make every occasion stress-free.
            </p>
          </div>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ size: 'sm' }))}
          >
            Upgrade now
          </Link>
        </div>
      </div>
    </main>
  )
}
