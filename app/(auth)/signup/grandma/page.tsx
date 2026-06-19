import { GrandmaSignupForm } from '@/components/auth/grandma-signup-form'

export default function GrandmaSignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-10">
      <div className="mb-12 w-full max-w-[80%] space-y-4 text-center">
        <h1 className="font-heading text-[clamp(38px,4.06vw,52px)] font-light tracking-tight">Create your Free Account</h1>
        <p className="text-[clamp(20px,1.95vw,25px)] text-foreground/80 [font-family:var(--font-arno-italic)]">
          Find your grandma name, browse gifts, and build a wishlist your family will love.
        </p>
      </div>
      <div className="w-full max-w-md">
        <GrandmaSignupForm />
      </div>
    </main>
  )
}
