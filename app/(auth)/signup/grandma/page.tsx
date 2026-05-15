import { GrandmaSignupForm } from '@/components/auth/grandma-signup-form'

export default function GrandmaSignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-normal">Create your free account</h1>
          <p className="text-sm text-muted-foreground">
            Find your grandma name, browse gifts, and build a wishlist your family will love.
          </p>
        </div>
        <GrandmaSignupForm />
      </div>
    </main>
  )
}
