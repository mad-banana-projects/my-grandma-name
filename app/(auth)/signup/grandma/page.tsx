import { GrandmaSignupForm } from '@/components/auth/grandma-signup-form'

export default function GrandmaSignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 space-y-2 text-center">
          <p className="text-sm font-medium text-muted-foreground">GrandmaGifts</p>
          <h1 className="text-3xl font-semibold tracking-normal">Start your wish list</h1>
          <p className="text-sm text-muted-foreground">
            Create your profile, choose your grandma name, and get ready to share gifts your family can shop from.
          </p>
        </div>
        <GrandmaSignupForm />
      </div>
    </main>
  )
}
