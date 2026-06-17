import { cookies } from 'next/headers'
import Link from 'next/link'
import Image from 'next/image'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { HeroGenerator } from '@/components/name-generator/hero-generator'
import { DinnerPartySection } from '@/components/sections/dinner-party-section'
import { createClient, createServiceClient } from '@/lib/supabase/server'

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

const GRANDMA_NAMES = [
  'Mimi', 'Gigi', 'Lolla', 'ChaCha', 'Granny', 'Grammy', 'Nana', 'Glamma',
  'Gramma', 'Crya', 'Lola', 'Yaya', 'Memaw', 'Lolli', 'KiKi', 'Gemma',
  'Chica', 'Lovey', 'Coo-Coo', 'Candy Gram',
]

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Find Your Grandma Name',
    description: 'Start by discovering a grandma name that feels personal, meaningful, and true to you. Whether you already have ideas in mind or need a little inspiration, our grandma name generator helps you explore thoughtful options based on your personality, style, and preferences.',
  },
  {
    step: '2',
    title: 'Tell Us About You & Your Loved Ones',
    description: 'Create your profile and share a little about yourself, your family, and the moments that matter most. From birthdays to favorite traditions, this helps personalize your experience and shape recommendations around the people you love most.',
  },
  {
    step: '3',
    title: 'Create Your Registry',
    description: 'Save meaningful gifts, keepsakes, and thoughtful finds all in one place. Build a personalized registry centered around your grandma name, with curated items designed to feel intentional, useful, and easy for family members to shop from.',
  },
  {
    step: '4',
    title: 'Let Us Handle the Reminders',
    description: "From birthdays and holidays to special family moments, we'll help keep everything organized with gentle reminders sent to your loved ones. Less stress, less last-minute scrambling, and more time focused on making memories together.",
  },
]

const FEATURES = [
  {
    title: 'AI Name Generator',
    description: 'Answer a few questions and get a custom grandma name that fits your personality.',
  },
  {
    title: 'Curated Registry',
    description: 'A hand-picked marketplace of gifts organized by category and style.',
  },
  {
    title: 'Family Sharing',
    description: 'Invite up to 10 family members to view your gift registry — no more duplicate gifts.',
  },
  {
    title: 'Smart Reminders',
    description: 'Email reminders before birthdays, holidays, and custom dates so family is always prepared.',
  },
]

export default async function LandingPage() {
  const supabase = await createClient()
  const [cookieStore, { data: { user } }] = await Promise.all([
    cookies(),
    supabase.auth.getUser(),
  ])

  const anonCount = parseAnonCookieCount(cookieStore.get(ANON_COOKIE)?.value)
  const anonUsesRemaining = Math.max(0, ANON_LIMIT - anonCount)

  let isSignedIn = false
  let isPaidGrandma = false
  let freeUsesRemaining: number | null = null

  if (user) {
    isSignedIn = true
    const service = createServiceClient()
    const { data: userData } = await service
      .from('users')
      .select('role, subscription_status, generator_uses_remaining')
      .eq('id', user.id)
      .single()

    isPaidGrandma = userData?.role === 'grandma' && userData?.subscription_status === 'active'
    if (!isPaidGrandma) {
      freeUsesRemaining = userData?.generator_uses_remaining ?? 0
    }
  }

  return (
    <main className="min-h-screen bg-background">

      {/* Hero — gradient wrapper, offset by nav height (68px) */}
      <div className="bg-[linear-gradient(to_bottom,#dcb6c9_0%,#ffffff_85%)] pt-[68px]">

        {/* Hero content */}
        <section className="pb-20 pt-8 text-center">
          <h1 className="font-heading mx-auto px-4 text-5xl font-light tracking-tight lg:whitespace-nowrap sm:text-6xl">
            Find Your Unique Grandma Name
          </h1>
          <p className="font-heading mx-auto mt-4 px-4 text-lg font-light italic text-foreground/80 lg:whitespace-nowrap sm:text-xl">
            A name that feels like you: thoughtful, personal, and just right for the role you&apos;re stepping into
          </p>

          {/* Embedded generator */}
          <div className="mt-8">
            <HeroGenerator
              anonUsesRemaining={anonUsesRemaining}
              isSignedIn={isSignedIn}
              isPaidGrandma={isPaidGrandma}
              freeUsesRemaining={freeUsesRemaining}
            />
          </div>

          {/* Secondary CTAs — anon only */}
          {!isSignedIn && (
            <div className="mt-10 flex flex-col items-center justify-center gap-3 px-4 sm:flex-row">
              <Link
                href="/signup"
                className={cn(buttonVariants({ size: 'lg' }), 'w-full sm:w-auto bg-[#8f6593] hover:bg-[#7a5680]')}
              >
                Create Free Account
              </Link>
              <Link
                href="/browse-products"
                className={cn(
                  buttonVariants({ size: 'lg', variant: 'outline' }),
                  'w-full sm:w-auto border-foreground/30 text-foreground/80 hover:bg-foreground/10 hover:text-foreground'
                )}
              >
                Browse Gifts
              </Link>
            </div>
          )}
        </section>
      </div>

      {/* Scrolling grandma names */}
      <div className="overflow-hidden py-10">
        <div
          className="flex whitespace-nowrap"
          style={{ animation: 'marquee 40s linear infinite' }}
        >
          {[...GRANDMA_NAMES, ...GRANDMA_NAMES].map((name, i) => (
            <span
              key={i}
              className="font-heading px-10 text-3xl italic text-foreground"
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-screen-2xl px-12">
          <h2 className="font-heading mb-12 text-center text-3xl font-light tracking-tight">
            How it works
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map(({ step, title, description }) => {
              const split = description.indexOf('. ')
              const first = split !== -1 ? description.slice(0, split + 1) : description
              const rest = split !== -1 ? description.slice(split + 2) : null
              return (
                <div key={step} className="space-y-3 rounded-xl bg-muted p-6">
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Step {step}
                  </p>
                  <h3 className="font-heading text-xl font-light">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {first}
                    {rest && <><br /><br />{rest}</>}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-background py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="font-heading mb-12 text-center text-3xl font-light tracking-tight">
            Everything you need
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {FEATURES.map(({ title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-border bg-white p-6 space-y-2 shadow-[0_2px_12px_rgba(53,51,48,0.06)]"
              >
                <h3 className="font-heading text-xl font-light">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is a Grandma Name */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-4">

          {/* Logo + heading */}
          <div className="mb-12 flex flex-col items-center gap-4 text-center">
            <Image
              src="/images/wording/purple-logo-with-words.png"
              alt="My Grandma Name"
              width={80}
              height={80}
              className="h-20 w-auto"
            />
            <h2 className="font-heading text-4xl font-light tracking-tight">
              What <em>is</em> a Grandma Name?
            </h2>
            <p className="text-sm tracking-widest text-muted-foreground">
              - It&apos;s more than what they call you -
            </p>
          </div>

          {/* Two-column body */}
          <div className="grid gap-10 text-sm leading-relaxed text-foreground/80 sm:grid-cols-2 sm:gap-16">
            <div className="space-y-4">
              <p>
                A grandma name is the name your family comes to know you by, the one that shows up in memories, traditions, and the everyday moments that matter most.
              </p>
              <p>
                For some, it&apos;s something they&apos;ve always known.<br />
                For others, it&apos;s something that evolves naturally over time.
              </p>
              <p>But when it feels right, it sticks.</p>
              <p>
                It becomes part of how you&apos;re remembered – in the little voices calling for you, in handwritten cards, and in the way your role takes shape within your family.
              </p>
            </div>
            <div className="space-y-4">
              <p>
                Whether you choose something timeless, playful, or entirely your own, your <em>grandma</em> name becomes a small but meaningful part of your identity, and a thread that carries through every gift, every visit, and every celebration.
              </p>
              <p>
                This platform is built to support that. To help you find it, define it, and carry it forward in thoughtful ways.
              </p>
              <p>
                <Link
                  href="/about"
                  className="italic text-[#618985] underline underline-offset-4 hover:text-[#618985]/80 transition-colors"
                >
                  Learn more about My Grandma Name &gt;&gt;
                </Link>
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Founder quote */}
      <section className="bg-[#618985] py-16">
        <div className="mx-auto max-w-3xl px-8 text-center">
          <blockquote className="font-heading text-3xl font-light leading-snug text-white sm:text-4xl">
            &ldquo;Your <em>grandma</em>{' '}name is more than a title. It&apos;s a connection to your loved ones.&rdquo;
          </blockquote>
          <div className="mt-6 flex items-center justify-end gap-3">
            <span className="h-px w-10 bg-white/60" />
            <cite className="not-italic text-sm text-white/80">Crya, founder</cite>
          </div>
        </div>
      </section>

      {/* Background image section */}
      <section className="relative overflow-hidden py-64 text-center">
        <Image
          src="/images/home-page/home-page-section-pic.jpg"
          alt=""
          fill
          className="object-cover object-top"
          aria-hidden
        />
        <div className="absolute inset-0 bg-white/55" />
        <div className="relative z-10 mx-auto max-w-3xl px-6">
          <h2 className="font-heading text-4xl font-light tracking-tight sm:text-5xl">
            Where a name becomes part of something bigger
          </h2>
          <p className="font-heading mt-4 text-lg font-light italic text-foreground/80">
            Thoughtful gifting, reminders, and meaningful moments, all built around you.
          </p>
        </div>
      </section>

      {/* About section */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-2xl px-8">
          <Image
            src="/images/wording/white-black-logo-with-wording.png"
            alt="My Grandma Name"
            width={320}
            height={80}
            className="h-16 w-auto"
          />
          <div className="mt-8 space-y-4 text-sm leading-relaxed text-foreground/80">
            <p>
              My Grandma Name is being built to make gifting feel thoughtful again — with curated ideas, gentle reminders, and personalized touches that reflect who you are and how your family knows you.
            </p>
            <p>
              Everything is centered around your grandma name, so every gift, every moment, and every memory feels a little more intentional.
            </p>
          </div>
          <div className="mt-8">
            <Link
              href="/about"
              className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'border-[#8f6593] text-[#8f6593] hover:bg-[#8f6593]/10 hover:text-[#8f6593]')}
            >
              About My Grandma Name
            </Link>
          </div>
        </div>
      </section>

      <DinnerPartySection />

    </main>
  )
}
