import { LandingNav } from '@/components/nav/landing-nav'

export default function GrandmaTipsPage() {
  return (
    <>
      <LandingNav alwaysSolid />
      <main className="min-h-screen bg-background px-4 pt-[88px] pb-20">
        <div className="mx-auto max-w-3xl space-y-6">
          <h1 className="font-heading text-5xl font-light tracking-tight">Grandma Tips</h1>
          <p className="text-muted-foreground">Coming soon.</p>
        </div>
      </main>
    </>
  )
}
