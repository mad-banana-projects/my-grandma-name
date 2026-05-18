import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { email, firstName, lastName, relationship } = await request.json() as {
    email: string
    firstName?: string
    lastName?: string
    relationship?: string
  }

  const serviceClient = createServiceClient()

  // Verify the inviting user is a paid grandma
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('id, grandma_name')
    .eq('user_id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Grandma profile not found' }, { status: 404 })
  }

  // Enforce 10-family-member limit
  const { count } = await serviceClient
    .from('family_members')
    .select('id', { count: 'exact', head: true })
    .eq('grandma_id', profile.id)
    .neq('invite_status', 'expired')

  if ((count ?? 0) >= 10) {
    return NextResponse.json({ error: 'Family member limit reached (10)' }, { status: 422 })
  }

  const inviteToken = randomUUID()
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${inviteToken}`

  const { error: insertError } = await serviceClient
    .from('family_members')
    .insert({
      grandma_id: profile.id,
      email,
      first_name: firstName,
      last_name: lastName,
      relationship,
      invite_token: inviteToken,
    })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // TODO: send invite email once domain is verified in Resend
  // For now, return the invite URL so the dashboard can display a copyable link

  return NextResponse.json({ invited: true, inviteUrl }, { status: 201 })
}
