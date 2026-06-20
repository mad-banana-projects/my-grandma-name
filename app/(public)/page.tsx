import { cookies } from 'next/headers'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Heart, Gift, Mail } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
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

const HOW_IT_WORKS: { step: string; titleLines: string[]; description: string; Icon: LucideIcon }[] = [
  {
    step: '1',
    titleLines: ['Find Your', 'Grandma Name'],
    description: 'Discover a grandma name that feels personal, meaningful, and uniquely you.',
    Icon: Search,
  },
  {
    step: '2',
    titleLines: ['Tell Us About You', '& Your Loved Ones'],
    description: 'Share a little about yourself, your family, and the moments that matter most.',
    Icon: Heart,
  },
  {
    step: '3',
    titleLines: ['Create Your', 'Registry'],
    description: 'Build a personalized registry with meaningful items and keepsakes your loved ones can shop.',
    Icon: Gift,
  },
  {
    step: '4',
    titleLines: ['Let Us Handle', 'the Reminders'],
    description: "We'll send gentle reminders for all of life's special moments so you can focus on family.",
    Icon: Mail,
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
      <div className="bg-[linear-gradient(to_bottom,#dcb6c9_0%,#ffffff_85%)] pt-[clamp(58px,6.48vw,83px)]">

        {/* Hero content */}
        <section className="pb-20 pt-14 text-center">
          <h1 className="font-heading mx-auto px-4 text-[clamp(38px,4.06vw,52px)] font-light tracking-tight leading-[1.15] md:leading-normal">
            Find Your Unique Grandma Name
          </h1>
          <p className="mx-auto mt-7 px-4 text-[clamp(20px,1.95vw,25px)] text-foreground/80 [font-family:var(--font-arno-italic)] leading-tight md:leading-normal">
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
            <div className="mt-10 flex flex-row items-center justify-center gap-3 px-4">
              <Link
                href="/signup"
                className={cn(buttonVariants({ size: 'lg' }), 'w-auto bg-[#8f6593] hover:bg-[#7a5680]')}
              >
                Create Free Account
              </Link>
              <Link
                href="/browse-products"
                className={cn(
                  buttonVariants({ size: 'lg', variant: 'outline' }),
                  'w-auto border-[#8f6593] bg-white text-[#8f6593] shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.8)] hover:bg-[#8f6593]/10'
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
          className="marquee-scroll flex whitespace-nowrap"
        >
          {[...GRANDMA_NAMES, ...GRANDMA_NAMES].map((name, i) => (
            <span
              key={i}
              className="px-7 md:px-10 text-[clamp(24px,2.66vw,34px)] text-foreground [font-family:var(--font-arno-italic)]"
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section className="bg-white py-20">
        <div className="w-full px-4 sm:px-10">
          <h2 className="font-heading mb-8 text-center text-[clamp(38px,4.06vw,52px)] font-light tracking-tight sm:mb-16">
            How it Works
          </h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-5 lg:grid-cols-4">
            {HOW_IT_WORKS.map(({ step, titleLines, description, Icon }, index) => (
              <div key={step} className="relative flex flex-col items-center text-center">
                {/* Curved dotted connector — mobile/tablet 2-col (steps 1→2 and 3→4) */}
                {index % 2 === 0 && (
                  <>
                    <svg
                      className="absolute left-1/2 w-full block sm:hidden overflow-visible"
                      style={{ top: '60px' }}
                      height="30"
                      viewBox="0 0 100 30"
                      preserveAspectRatio="none"
                      fill="none"
                      aria-hidden
                    >
                      <path d="M 0 15 Q 50 -10 100 15" stroke="#618985" strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round" strokeOpacity="0.6" vectorEffect="non-scaling-stroke" />
                    </svg>
                    <svg
                      className="absolute left-1/2 w-full hidden sm:block lg:hidden overflow-visible"
                      style={{ top: '89px' }}
                      height="30"
                      viewBox="0 0 100 30"
                      preserveAspectRatio="none"
                      fill="none"
                      aria-hidden
                    >
                      <path d="M 0 15 Q 50 -10 100 15" stroke="#618985" strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round" strokeOpacity="0.6" vectorEffect="non-scaling-stroke" />
                    </svg>
                  </>
                )}
                {/* Curved dotted connector — desktop 4-col (steps 1→2, 2→3, 3→4) */}
                {index < 3 && (
                  <svg
                    className="absolute left-1/2 w-full hidden lg:block overflow-visible"
                    style={{ top: '89px' }}
                    height="30"
                    viewBox="0 0 100 30"
                    preserveAspectRatio="none"
                    fill="none"
                    aria-hidden
                  >
                    <path d="M 0 15 Q 50 -10 100 15" stroke="#618985" strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round" strokeOpacity="0.6" vectorEffect="non-scaling-stroke" />
                  </svg>
                )}
                {/* Step number badge */}
                <div className="relative z-10 mb-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#618985] text-xs font-semibold text-white sm:h-9 sm:w-9 sm:text-sm">
                  {step}
                </div>
                {/* Icon circle */}
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full sm:h-28 sm:w-28">
                  <div className="absolute inset-0 rounded-full bg-white" />
                  <div className="absolute inset-0 rounded-full bg-[#618985]/15" />
                  <Icon className="relative h-7 w-7 text-[#618985] sm:h-12 sm:w-12" />
                </div>
                {/* Text */}
                <div className="mt-3 sm:mt-6">
                  <h3 className="text-[clamp(14px,1.95vw,25px)] [font-family:var(--font-arno-italic)]">
                    {titleLines.map((line, i) => (
                      <span key={i}>{line}{i < titleLines.length - 1 && <br />}</span>
                    ))}
                  </h3>
                  <p className="mx-auto mt-2 max-w-none text-[clamp(11px,1.33vw,17px)] leading-relaxed text-muted-foreground sm:mt-4 sm:max-w-[220px]">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-background py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="font-heading mb-12 text-center text-[clamp(38px,4.06vw,52px)] font-light tracking-tight">
            Everything you Need
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {FEATURES.map(({ title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-border bg-white p-6 space-y-2 shadow-[0_2px_12px_rgba(53,51,48,0.06)]"
              >
                <h3 className="text-[clamp(20px,1.95vw,25px)] [font-family:var(--font-arno-italic)]">{title}</h3>
                <p className="text-[clamp(13px,1.33vw,17px)] leading-relaxed text-muted-foreground mt-4">{description}</p>
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
              width={110}
              height={110}
              className="h-[110px] w-auto"
            />
            <h2 className="font-heading text-[clamp(38px,4.06vw,52px)] font-light tracking-tight">
              What <em>is</em> a Grandma Name?
            </h2>
            <p className="text-[clamp(13px,1.33vw,17px)] tracking-widest text-gray-300">
              - It&apos;s more than what they call you -
            </p>
          </div>

          {/* Two-column body */}
          <div className="grid gap-10 text-[clamp(13px,1.33vw,17px)] leading-relaxed text-foreground/80 sm:grid-cols-2 sm:gap-16">
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
        <div className="mx-auto max-w-5xl px-8 text-center">
          <blockquote className="font-heading text-4xl font-light leading-snug text-white sm:text-5xl">
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
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <h2 className="font-heading text-[clamp(38px,4.06vw,52px)] font-light tracking-tight">
            Where a name becomes part of something bigger
          </h2>
          <p className="mt-4 text-[clamp(20px,1.95vw,25px)] text-foreground/80 [font-family:var(--font-arno-italic)]">
            Thoughtful gifting, reminders, and meaningful moments, all built around you.
          </p>
        </div>
      </section>

      {/* About section */}
      <section className="bg-[linear-gradient(135deg,#f5eef2_0%,#faf7f8_50%,#f0edf5_100%)] py-24">
        <div className="mx-auto max-w-3xl px-8">
          <Image
            src="/images/wording/white-black-logo-with-wording.png"
            alt="My Grandma Name"
            width={384}
            height={96}
            className="h-[77px] w-auto"
          />
          <div className="mt-8 space-y-4 text-[clamp(13px,1.33vw,17px)] leading-relaxed text-foreground/80">
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
              className={cn(buttonVariants({ size: 'lg' }), 'bg-[#8f6593] text-white hover:bg-[#7a5680]')}
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
