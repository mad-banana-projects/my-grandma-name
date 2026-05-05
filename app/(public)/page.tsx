import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold">
            GrandmaGifts
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/login" className={buttonVariants({ variant: 'ghost' })}>
              Log in
            </Link>
            <Link href="/signup/grandma" className={buttonVariants()}>
              Start registry
            </Link>
          </nav>
        </header>

        <section className="grid flex-1 items-center gap-10 py-12 md:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-2xl space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                Gift registries for grandmas and the families who love them
              </p>
              <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">
                Make it easy for family to find gifts she actually wants.
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground">
                GrandmaGifts lets grandmas keep a personal wish list, share it with family, and add a grandma name that makes every gift feel personal.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/signup/grandma" className={cn(buttonVariants({ size: 'lg' }), 'w-full sm:w-auto')}>
                Create grandma account
              </Link>
              <Link href="/name-generator" className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'w-full sm:w-auto')}>
                Try name generator
              </Link>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-5">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Testing path</p>
                <h2 className="mt-1 text-xl font-semibold">Signup and onboarding</h2>
              </div>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="rounded-lg bg-background p-3">1. Create a grandma account.</li>
                <li className="rounded-lg bg-background p-3">2. Set a grandma name and optional birthday.</li>
                <li className="rounded-lg bg-background p-3">3. Confirm the profile row appears in Supabase.</li>
              </ol>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
