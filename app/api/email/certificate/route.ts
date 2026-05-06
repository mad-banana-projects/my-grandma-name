import { NextRequest, NextResponse } from 'next/server'
import { resend } from '@/lib/resend'

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

  return NextResponse.json({ sent: true })
}
