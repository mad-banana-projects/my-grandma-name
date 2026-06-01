import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { anthropic, GRANDMA_NAME_MODEL } from '@/lib/claude'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const VALID_STYLES = ['traditional', 'unique', 'playful', 'sweet', 'trendy', 'elegant'] as const
const VALID_FORMATS = ['single-word', 'multi-word'] as const
const ANON_COOKIE = 'anon_gen_count'
const ANON_DAILY_LIMIT = 2
const FREE_DAILY_LIMIT = 4

function sanitize(value: string, maxLen: number): string {
  return value.replace(/[<>"'`\\]/g, '').trim().slice(0, maxLen)
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10) // "YYYY-MM-DD"
}

// ─── Anonymous cookie helpers ────────────────────────────────────────────────

type AnonCookie = { date: string; count: number }

function parseAnonCookie(raw: string | undefined): AnonCookie {
  try {
    const parsed = JSON.parse(raw ?? '')
    if (parsed && typeof parsed.date === 'string' && typeof parsed.count === 'number') {
      return parsed
    }
  } catch { /* fall through */ }
  return { date: '', count: 0 }
}

function anonUsesToday(cookie: AnonCookie): number {
  return cookie.date === todayUtc() ? cookie.count : 0
}

// ─── Route handler ───────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const body = await request.json() as {
    firstName?: string
    nameToAvoid?: string
    style?: string
    format?: string
  }

  const firstName = sanitize(body.firstName ?? '', 30)
  const nameToAvoid = sanitize(body.nameToAvoid ?? '', 30)
  const style = body.style ?? ''
  const format = body.format ?? ''

  if (!firstName) {
    return NextResponse.json({ error: 'First name is required' }, { status: 400 })
  }
  if (!nameToAvoid) {
    return NextResponse.json({ error: 'Name to avoid is required' }, { status: 400 })
  }
  if (!VALID_STYLES.includes(style as typeof VALID_STYLES[number])) {
    return NextResponse.json({ error: 'Invalid style' }, { status: 400 })
  }
  if (!VALID_FORMATS.includes(format as typeof VALID_FORMATS[number])) {
    return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // ── Anonymous rate limit (cookie) ─────────────────────────────────────────
  let anonCookie: AnonCookie = { date: '', count: 0 }
  if (!user) {
    const cookieStore = await cookies()
    anonCookie = parseAnonCookie(cookieStore.get(ANON_COOKIE)?.value)
    const usesToday = anonUsesToday(anonCookie)
    if (usesToday >= ANON_DAILY_LIMIT) {
      return NextResponse.json(
        { error: `You've used your ${ANON_DAILY_LIMIT} free generations for today. Come back tomorrow or create a free account for more.` },
        { status: 429 }
      )
    }
  }

  // ── Free-tier rate limit (DB) ─────────────────────────────────────────────
  if (user) {
    const serviceClient = createServiceClient()
    const { data: profile } = await serviceClient
      .from('users')
      .select('role, generator_uses_remaining, generator_uses_reset_date')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'free') {
      const today = todayUtc()
      const resetDate = profile.generator_uses_reset_date as string | null

      // Reset counter if this is a new day
      if (resetDate !== today) {
        await serviceClient
          .from('users')
          .update({ generator_uses_remaining: FREE_DAILY_LIMIT, generator_uses_reset_date: today })
          .eq('id', user.id)

        // After reset they have the full limit, so proceed — fall through to generation
      } else if ((profile.generator_uses_remaining ?? 0) <= 0) {
        return NextResponse.json(
          { error: 'Daily generation limit reached. Come back tomorrow or upgrade for unlimited generations.' },
          { status: 429 }
        )
      }
    }
  }

  // ── Call Claude ───────────────────────────────────────────────────────────

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
- Preferred style: ${style} (traditional = classic, time-honored grandma names; unique = uncommon, one-of-a-kind names; playful = fun, rhyming, or doubled names a child loves saying; sweet = soft, warm, and loving names; trendy = current and fashionable names; elegant = sophisticated and refined names)
- Desired name format: ${format} (single-word = one single word, e.g. "Mimi", "Nana", "Grammy"; multi-word = two words or a hyphenated name, e.g. "Nana Jo", "Mimi-Jean", "Grammy Sue")
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
- Both names must match the desired name format exactly: single-word means exactly one word with no spaces or hyphens; multi-word means two words or a hyphenated name.
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

  // ── Post-generation: decrement free-tier counter ──────────────────────────
  if (user) {
    const serviceClient = createServiceClient()
    const { data: profile } = await serviceClient
      .from('users')
      .select('role, generator_uses_remaining, generator_uses_reset_date')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'free') {
      const today = todayUtc()
      const currentRemaining =
        profile.generator_uses_reset_date === today
          ? (profile.generator_uses_remaining ?? FREE_DAILY_LIMIT)
          : FREE_DAILY_LIMIT

      const newRemaining = Math.max(0, currentRemaining - 1)
      await serviceClient
        .from('users')
        .update({ generator_uses_remaining: newRemaining, generator_uses_reset_date: today })
        .eq('id', user.id)

      return NextResponse.json({ ...result, usesRemaining: newRemaining })
    }
    return NextResponse.json(result)
  }

  // ── Post-generation: increment anon cookie counter ────────────────────────
  const usesToday = anonUsesToday(anonCookie)
  const newCount = usesToday + 1
  const updatedCookie: AnonCookie = { date: todayUtc(), count: newCount }

  const response = NextResponse.json({
    ...result,
    usesRemaining: Math.max(0, ANON_DAILY_LIMIT - newCount),
  })
  response.cookies.set(ANON_COOKIE, JSON.stringify(updatedCookie), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 2, // 2 days — old cookies auto-expire quickly since date is checked
  })
  return response
}
