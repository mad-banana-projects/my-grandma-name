import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { InviteAcceptForm } from '@/components/auth/invite-accept-form'

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const service = createServiceClient()

  const { data: invite } = await service
    .from('family_members')
    .select(`
      id, email, first_name, invite_status, grandma_id,
      grandma:profiles ( grandma_name, first_name )
    `)
    .eq('invite_token', token)
    .single()

  // Invalid token
  if (!invite) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold">Invalid invite link</h1>
          <p className="text-sm text-muted-foreground">This invite link is not valid.</p>
        </div>
      </main>
    )
  }

  // Expired
  if (invite.invite_status === 'expired') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold">Invite expired</h1>
          <p className="text-sm text-muted-foreground">
            This invite link has expired. Ask the registry owner to send a new one.
          </p>
        </div>
      </main>
    )
  }

  const grandma = invite.grandma as unknown as { grandma_name: string | null; first_name: string | null } | null
  const grandmaName = grandma?.grandma_name || grandma?.first_name || 'your family member'

  // Check if user is already authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    if (user.email?.toLowerCase() === invite.email.toLowerCase()) {
      if (invite.invite_status === 'pending') {
        // Process acceptance
        await service
          .from('family_members')
          .update({
            user_id: user.id,
            invite_status: 'accepted',
            accepted_at: new Date().toISOString(),
          })
          .eq('invite_token', token)

        await service
          .from('users')
          .update({ role: 'family' })
          .eq('id', user.id)
      }
      // Redirect to registry whether just accepted or already accepted
      redirect(`/registry/${invite.grandma_id}`)
    }
    // Authenticated with a different account — fall through to show form
  }

  // Already accepted but not currently signed in
  if (invite.invite_status === 'accepted') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="text-center space-y-3">
          <h1 className="text-xl font-semibold">Invite already accepted</h1>
          <p className="text-sm text-muted-foreground">
            <Link href="/login" className="underline underline-offset-4 hover:text-foreground">
              Sign in
            </Link>{' '}
            to view {grandmaName}&apos;s registry.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <InviteAcceptForm
        token={token}
        email={invite.email}
        firstName={invite.first_name}
        grandmaName={grandmaName}
      />
    </main>
  )
}
