import { GrandmaSignupForm } from '@/components/auth/grandma-signup-form'

export default async function GrandmaSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ grandmaName?: string }>
}) {
  const params = await searchParams
  const grandmaName = params.grandmaName ?? null

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 space-y-2 text-center">
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
              <h1 className="text-3xl font-semibold tracking-normal">Create your free account</h1>
              <p className="text-sm text-muted-foreground">
                Find your grandma name, save the things you love, and make it easier for family to celebrate you thoughtfully.
              </p>
            </>
          )}
        </div>
        <GrandmaSignupForm grandmaName={grandmaName} />
      </div>
    </main>
  )
}
