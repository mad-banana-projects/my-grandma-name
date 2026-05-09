import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { anthropic, GRANDMA_NAME_MODEL } from '@/lib/claude'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const VALID_STYLES = ['classic', 'playful', 'modern'] as const
const VALID_VIBES = ['timeless', 'sweet', 'stylish', 'playful', 'cozy'] as const
const ANON_COOKIE = 'anon_gen_count'
const ANON_LIMIT = 2

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

  // Anonymous rate limit — enforced via cookie
  let anonCount = 0
  if (!user) {
    const cookieStore = await cookies()
    anonCount = parseInt(cookieStore.get(ANON_COOKIE)?.value ?? '0', 10)
    if (anonCount >= ANON_LIMIT) {
      return NextResponse.json(
        { error: "You've used your 2 free generations. Create a free account for more." },
        { status: 429 }
      )
    }
  }

  if (user) {
    const serviceClient = createServiceClient()
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
        content: `You are helping someone choose a grandma name — the special name their grandchildren will call them (not their given name).

A grandma name is a term of endearment like: Nana, Mimi, Grammy, Gigi, Nona, Lola, Oma, Baba, Mémé, Mamie, Grams, Granny, Grandma, Bubbe — or a creative personalized variation derived from the person's first name (e.g. "JenJen", "Mimi-J", "Nana Jen"). It must sound like something a small child would naturally say and love.

Generate two grandma name suggestions based on these preferences:
- First name: ${firstName}
- Preferred style: ${style} (classic = timeless traditional names; playful = fun, rhyming, or doubled names a child loves saying; modern = fresh, short, stylish names)
- Preferred vibe: ${vibe} (timeless = enduring classics; sweet = soft and loving; stylish = elegant and current; playful = whimsical and fun; cozy = warm and homey)
${avoidClause}

Return a JSON object with exactly this shape:
{
  "winner": { "name": "string" },
  "runnerUp": { "name": "string" },
  "explanation": "2-3 sentences explaining why the winner name fits this person perfectly"
}

Rules:
- Return only the JSON object, no other text, no markdown.
- Both names must be genuine grandma names — terms a grandchild would call their grandmother.
- Both names must be derived from or phonetically connected to the person's first name. Do not suggest generic grandma names (Gigi, Mimi, Nana, etc.) unless they have a clear phonetic link to the given first name.
- The winner and runner-up must sound completely different when spoken aloud — a hyphenated and unhyphenated version of the same name (e.g. "JenJen" and "Jen-Jen") are NOT acceptable. Each must use a genuinely different approach: for example, one could use syllable doubling, another a traditional grandma suffix (-ma, -na, -nie), another a phonetic nickname, another a term of endearment combined with a name fragment.
- Neither name may match or closely resemble the name they want to avoid.
- Do not suggest generic adjectives, nouns, or words that are not grandma names.`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  let result: { winner: { name: string }; runnerUp: { name: string }; explanation: string }
  try {
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    result = JSON.parse(cleaned)
  } catch {
    return NextResponse.json({ error: 'Failed to generate name. Please try again.' }, { status: 500 })
  }

  // Decrement counter for free signed-in users
  if (user) {
    const serviceClient = createServiceClient()
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
    return NextResponse.json(result)
  }

  // Increment anonymous cookie counter and return remaining count
  const newCount = anonCount + 1
  const response = NextResponse.json({
    ...result,
    usesRemaining: Math.max(0, ANON_LIMIT - newCount),
  })
  response.cookies.set(ANON_COOKIE, String(newCount), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return response
}
