import { cookies } from 'next/headers'
import { GeneratorForm } from '@/components/name-generator/generator-form'
import { createClient } from '@/lib/supabase/server'

const ANON_COOKIE = 'anon_gen_count'
const ANON_LIMIT = 2

function parseAnonCookieCount(raw: string | undefined): number {
  try {
    const parsed = JSON.parse(raw ?? '')
    if (parsed && typeof parsed.date === 'string' && typeof parsed.count === 'number') {
      const today = new Date().toISOString().slice(0, 10)
      return parsed.date === today ? parsed.count : 0
    }
  } catch { /* fall through */ }
  return 0
}

export default async function NameGeneratorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isPaidGrandma = false
  let freeUsesRemaining: number | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role, subscription_status, generator_uses_remaining')
      .eq('id', user.id)
      .single()

    isPaidGrandma =
      profile?.role === 'grandma' && profile?.subscription_status === 'active'

    if (profile?.role === 'free') {
      freeUsesRemaining = profile?.generator_uses_remaining ?? 0
    }
  }

  let anonUsesRemaining: number | null = null
  if (!user) {
    const cookieStore = await cookies()
    const anonCount = parseAnonCookieCount(cookieStore.get(ANON_COOKIE)?.value)
    anonUsesRemaining = Math.max(0, ANON_LIMIT - anonCount)
  }

  return (
    <main className="bg-background px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-3">
          <h1 className="font-heading text-4xl font-light tracking-tight sm:text-5xl">
            Find Your Unique Grandma Name
          </h1>
          <p className="font-heading text-lg font-light italic text-foreground/70 sm:text-xl">
            A name that feels like you: thoughtful, personal, and just right for the role you&apos;re stepping into
          </p>
        </div>
        <GeneratorForm
          isSignedIn={Boolean(user)}
          isPaidGrandma={isPaidGrandma}
          anonUsesRemaining={anonUsesRemaining}
          freeUsesRemaining={freeUsesRemaining}
        />
      </div>
    </main>
  )
}
