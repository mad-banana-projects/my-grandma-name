import { NextRequest, NextResponse } from 'next/server'
import { resend } from '@/lib/resend'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { email, winnerName, runnerUpName, explanation } = await request.json() as {
    email: string
    winnerName: string
    runnerUpName: string
    explanation: string
  }

  // TODO: replace with NameCertificate React Email template
  const { error } = await resend.emails.send({
    from: 'My Grandma Name <noreply@mygrandmaname.com>',
    to: email,
    subject: `Your grandma name is ${winnerName}!`,
    html: `<p>Congratulations! Your grandma name is <strong>${winnerName}</strong>.</p>
           <p>Runner-up: ${runnerUpName}</p>
           <p>${explanation}</p>`,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  void captureLead(email, winnerName, runnerUpName)

  return NextResponse.json({ sent: true })
}

async function captureLead(email: string, winner: string, runnerUp: string) {
  try {
    const service = createServiceClient()
    await service
      .from('leads')
      .upsert(
        { email, source: 'name_generator', names: { winner, runnerUp } },
        { onConflict: 'email' }
      )

    await resend.contacts.create({ email, unsubscribed: false })
  } catch {
    // lead capture is non-critical — never block the user response
  }
}
