import { cookies } from 'next/headers'
import Link from 'next/link'
import Image from 'next/image'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { HeroGenerator } from '@/components/name-generator/hero-generator'

const ANON_COOKIE = 'anon_gen_count'
const ANON_LIMIT = 2

const GRANDMA_NAMES = [
  'Berry', 'Crya', 'Lola', 'Yaya', 'Memaw', 'Lolli', 'KiKi', 'Gemma',
  'Mimi', 'Gigi', 'Lolla', 'Candy Gram', 'ChaCha', 'Granny', 'Nana', 'Glamma',
]

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Pick your grandma name',
    description: 'Use our AI name generator to find the perfect grandma name — Classic, Playful, or Modern.',
  },
  {
    step: '2',
    title: 'Build your registry',
    description: 'Browse our curated gift collection and save the things you actually want to your wishlist.',
  },
  {
    step: '3',
    title: 'Share with family',
    description: 'Invite family members to view your registry so every occasion is stress-free for everyone.',
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
    description: 'Invite up to 10 family members to view your registry — no more duplicate gifts.',
  },
  {
    title: 'Smart Reminders',
    description: 'Email reminders before birthdays, holidays, and custom dates so family is always prepared.',
  },
]

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.26 8.26 0 0 0 4.84 1.56V6.79a4.85 4.85 0 0 1-1.07-.1z" />
    </svg>
  )
}

export default async function LandingPage() {
  const cookieStore = await cookies()
  const anonCount = parseInt(cookieStore.get(ANON_COOKIE)?.value ?? '0', 10)
  const anonUsesRemaining = Math.max(0, ANON_LIMIT - anonCount)

  return (
    <main className="min-h-screen bg-background">

      {/* Hero — gradient wrapper contains nav + hero content */}
      <div className="bg-[linear-gradient(to_bottom,#dcb6c9_0%,#ffffff_85%)]">

        {/* Top nav bar — transparent, scrolls with page */}
        <nav className="flex w-full items-center justify-between px-6 py-4">
          <Link href="/">
            <Image
              src="/images/wording/white-logo-with-wording.png"
              alt="My Grandma Name"
              width={168}
              height={36}
              className="h-9 w-auto"
              priority
            />
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm text-white/90 transition-colors hover:text-white">
              Log in
            </Link>
            <Link href="#" className="text-sm text-white/90 transition-colors hover:text-white">
              About
            </Link>
            <Link href="#" className="text-sm text-white/90 transition-colors hover:text-white">
              Grandma Tips
            </Link>
            <a
              href="https://www.youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="flex size-8 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
            >
              <YouTubeIcon />
            </a>
            <a
              href="https://www.tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="flex size-8 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
            >
              <TikTokIcon />
            </a>
          </div>
        </nav>

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
            <HeroGenerator anonUsesRemaining={anonUsesRemaining} />
          </div>

          {/* Secondary CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 px-4 sm:flex-row">
            <Link
              href="/signup"
              className={cn(buttonVariants({ size: 'lg' }), 'w-full sm:w-auto')}
            >
              Create free account
            </Link>
            <Link
              href="/browse-products"
              className={cn(
                buttonVariants({ size: 'lg', variant: 'outline' }),
                'w-full sm:w-auto border-foreground/30 text-foreground/80 hover:bg-foreground/10 hover:text-foreground'
              )}
            >
              Browse gifts
            </Link>
          </div>
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
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="font-heading mb-12 text-center text-3xl font-light tracking-tight">
            How it works
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {HOW_IT_WORKS.map(({ step, title, description }) => (
              <div key={step} className="space-y-3 rounded-xl bg-muted p-6">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Step {step}
                </p>
                <h3 className="font-heading text-xl font-light">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            ))}
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

      {/* CTA footer */}
      <section className="py-20 bg-[linear-gradient(to_bottom,#dcb6c9_0%,#f2eaec_100%)]">
        <div className="mx-auto max-w-5xl px-4 text-center space-y-6">
          <h2 className="font-heading text-3xl font-light tracking-tight">
            Ready to get started?
          </h2>
          <p className="text-base text-foreground/70">
            Create a free account and pick your grandma name in minutes.
          </p>
          <div>
            <Link href="/signup" className={cn(buttonVariants({ size: 'lg' }))}>
              Create free account
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
