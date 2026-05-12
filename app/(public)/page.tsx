import Link from 'next/link'
import Image from 'next/image'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">

      {/* Hero — gradient wrapper contains header + hero content */}
      <div className="bg-[linear-gradient(to_bottom,#f2eaec_15%,#dcb6c9_100%)]">

        {/* Header */}
        <header className="mx-auto flex max-w-5xl items-center justify-between px-4 pt-6 pb-2">
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
          <nav className="flex items-center gap-2">
            <Link href="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              Log in
            </Link>
            <Link href="/signup" className={buttonVariants({ size: 'sm' })}>
              Get started
            </Link>
          </nav>
        </header>

        {/* Hero content */}
        <section className="mx-auto max-w-5xl px-4 pt-12 pb-20 text-center">
          <div className="mx-auto mb-10 flex justify-center">
            <Image
              src="/images/logo/white-pink-logo.png"
              alt=""
              aria-hidden
              width={120}
              height={144}
              className="h-28 w-auto opacity-90"
            />
          </div>
          <h1 className="font-heading mx-auto max-w-2xl text-5xl font-light tracking-tight sm:text-6xl">
            Find Your Unique Grandma Name
          </h1>
          <p className="font-heading mx-auto mt-4 max-w-2xl text-xl font-light italic text-foreground/80 sm:text-2xl">
            A name that feels like you: thoughtful, personal, and just right for the role you&apos;re stepping into
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className={cn(buttonVariants({ size: 'lg' }), 'w-full sm:w-auto')}
            >
              Create free account
            </Link>
            <Link
              href="/name-generator"
              className={cn(
                buttonVariants({ size: 'lg', variant: 'outline' }),
                'w-full sm:w-auto border-foreground/30 text-foreground/80 hover:bg-foreground/10 hover:text-foreground'
              )}
            >
              Try name generator
            </Link>
          </div>
        </section>
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
      <section className="py-20 bg-[linear-gradient(to_bottom,#f2eaec_0%,#dcb6c9_100%)]">
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
