import { NextRequest, NextResponse } from 'next/server'
import { anthropic, GRANDMA_NAME_MODEL } from '@/lib/claude'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const VALID_STYLES = ['classic', 'playful', 'modern'] as const
const VALID_VIBES = ['timeless', 'sweet', 'stylish', 'playful', 'cozy'] as const

function sanitize(value: string, maxLen: number): string {
  return value.replace(/[<>"'`\\]/g, '').trim().slice(0, maxLen)
}

export async function POST(request: NextRequest) {
  const body = await request.json() as {
    firstName?: string
    nameToAvoid?: string
    style?: string
    vibe?: string
  }

  const firstName = sanitize(body.firstName ?? '', 50)
  const nameToAvoid = sanitize(body.nameToAvoid ?? '', 50)
  const style = body.style ?? ''
  const vibe = body.vibe ?? ''

  if (!firstName) {
    return NextResponse.json({ error: 'First name is required' }, { status: 400 })
  }
  if (!VALID_STYLES.includes(style as typeof VALID_STYLES[number])) {
    return NextResponse.json({ error: 'Invalid style' }, { status: 400 })
  }
  if (!VALID_VIBES.includes(vibe as typeof VALID_VIBES[number])) {
    return NextResponse.json({ error: 'Invalid vibe' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const serviceClient = await createServiceClient()
    const { data: profile } = await serviceClient
      .from('users')
      .select('role, generator_uses_remaining')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'free') {
      if ((profile.generator_uses_remaining ?? 0) <= 0) {
        return NextResponse.json(
          { error: 'Generation limit reached. Upgrade to continue.' },
          { status: 429 }
        )
      }
    }
  }

  const avoidClause = nameToAvoid
    ? `They do NOT want to be called "${nameToAvoid}" or anything similar.`
    : ''

  const message = await anthropic.messages.create({
    model: GRANDMA_NAME_MODEL,
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `You are helping someone choose a grandma name — a warm, personal name their grandchildren will call them.

Generate the ideal grandma name based on these preferences:
- First name: ${firstName}
- Preferred style: ${style}
- Preferred vibe: ${vibe}
${avoidClause}

Return a JSON object with exactly this shape:
{
  "winner": { "name": "string" },
  "runnerUp": { "name": "string" },
  "explanation": "2-3 sentences explaining why these names fit perfectly"
}

Rules:
- Return only the JSON object, no other text.
- The winner and runner-up names must be different from each other.
- Neither name may match or closely resemble the name they want to avoid.
- Names should feel personal, elegant, and fitting for a grandparent.`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  let result: { winner: { name: string }; runnerUp: { name: string }; explanation: string }
  try {
    result = JSON.parse(text)
  } catch {
    return NextResponse.json({ error: 'Failed to generate name. Please try again.' }, { status: 500 })
  }

  // Decrement counter for free signed-in users after a successful generation
  if (user) {
    const serviceClient = await createServiceClient()
    const { data: profile } = await serviceClient
      .from('users')
      .select('role, generator_uses_remaining')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'free') {
      await serviceClient
        .from('users')
        .update({ generator_uses_remaining: Math.max(0, (profile.generator_uses_remaining ?? 0) - 1) })
        .eq('id', user.id)
    }
  }

  return NextResponse.json(result)
}
