import { GrandmaSignupForm } from '@/components/auth/grandma-signup-form'

export default async function GrandmaSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ grandmaName?: string }>
}) {
  const params = await searchParams
  const grandmaName = params.grandmaName ?? null

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-10">
      <div className="mb-12 w-full max-w-[80%] space-y-4 text-center">
        {grandmaName ? (
          <>
            <h1 className="text-3xl font-semibold tracking-normal">Save your grandma name</h1>
            <p className="text-sm text-muted-foreground">
              Create a free account to save{' '}
              <span className="font-medium text-foreground">{grandmaName}</span> to your profile.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-heading text-[clamp(38px,4.06vw,52px)] font-light tracking-tight">Create Your Free Account</h1>
            <p className="text-[clamp(20px,1.95vw,25px)] text-foreground/80 [font-family:var(--font-arno-italic)]">
              Find your grandma name, save the things you love, and make it easier for family to celebrate you thoughtfully.
            </p>
          </>
        )}
      </div>
      <div className="w-full max-w-md">
        <GrandmaSignupForm grandmaName={grandmaName} />
      </div>
    </main>
  )
}
