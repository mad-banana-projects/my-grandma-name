import Link from 'next/link'
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
      {/* Header */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6">
        <span className="text-sm font-semibold tracking-tight">My Grandma Name</span>
        <nav className="flex items-center gap-2">
          <Link href="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            Log in
          </Link>
          <Link href="/signup" className={buttonVariants({ size: 'sm' })}>
            Get started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 py-16 text-center">
        <p className="mb-3 text-sm font-medium text-muted-foreground">
          Gift registries for grandmas and the families who love them
        </p>
        <h1 className="mx-auto max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Choose your grandma name. Build a wishlist family will actually use.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground">
          My Grandma Name helps grandmas keep a personal gift registry, share it with family, and pick a grandma name that makes every gift feel personal.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className={cn(buttonVariants({ size: 'lg' }), 'w-full sm:w-auto')}
          >
            Create free account
          </Link>
          <Link
            href="/name-generator"
            className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'w-full sm:w-auto')}
          >
            Try name generator
          </Link>
          <Link
            href="/browse-products"
            className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'w-full sm:w-auto')}
          >
            Browse products
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight">How it works</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {HOW_IT_WORKS.map(({ step, title, description }) => (
              <div key={step} className="space-y-2 rounded-lg bg-background p-5 border">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Step {step}
                </p>
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight">Everything you need</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {FEATURES.map(({ title, description }) => (
            <div key={title} className="rounded-lg border p-5 space-y-1.5">
              <h3 className="text-sm font-semibold">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA footer */}
      <section className="border-t bg-muted/30 py-16">
        <div className="mx-auto max-w-5xl px-4 text-center space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Ready to get started?</h2>
          <p className="text-sm text-muted-foreground">
            Create a free account and pick your grandma name in minutes.
          </p>
          <Link href="/signup" className={cn(buttonVariants({ size: 'lg' }))}>
            Create free account
          </Link>
        </div>
      </section>
    </main>
  )
}
