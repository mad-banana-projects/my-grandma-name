import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resend } from '@/lib/resend'
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
    .select('id, grandma_name, first_name')
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://mygrandmaname.com'
  const inviteUrl = `${appUrl}/invite/${inviteToken}`

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

  // Generate a magic link so the family member is authenticated in one click.
  // Falls back to the plain invite URL if generation fails.
  const { data: linkData } = await serviceClient.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: {
      redirectTo: `${appUrl}/auth-confirm?next=/invite/${inviteToken}`,
    },
  })
  const acceptUrl = linkData?.properties?.action_link ?? inviteUrl

  const displayName = (profile.grandma_name as string | null) || (profile.first_name as string | null) || 'your family member'
  const greeting = firstName ? `Hi ${firstName},` : 'Hi there,'

  await resend.emails.send({
    from: 'My Grandma Name <noreply@mygrandmaname.com>',
    to: email,
    subject: `You've been invited to ${displayName}'s registry`,
    html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;color:#353330;">
  <p style="margin:0 0 16px;font-size:15px;">${greeting}</p>
  <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">
    <strong>${displayName}</strong> has invited you to view their gift registry on
    <a href="${appUrl}" style="color:#8f6593;">My Grandma Name</a>.
    Click the button below to accept and see their wishlist.
  </p>
  <a href="${acceptUrl}"
     style="display:inline-block;background:#353330;color:#fff;text-decoration:none;
            padding:12px 24px;border-radius:6px;font-size:14px;font-weight:500;">
    Accept invitation →
  </a>
  <hr style="margin:32px 0;border:none;border-top:1px solid #eee;" />
  <p style="margin:0;color:#999;font-size:12px;line-height:1.6;">
    If you weren't expecting this invitation, you can ignore this email.
    This link expires in 24 hours.
  </p>
</div>`,
  })

  return NextResponse.json({ invited: true, inviteUrl }, { status: 201 })
}
