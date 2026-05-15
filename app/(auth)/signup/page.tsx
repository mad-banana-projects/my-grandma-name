import { GrandmaSignupForm } from '@/components/auth/grandma-signup-form'

export default async function GrandmaSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ grandmaName?: string; intent?: string }>
}) {
  const params = await searchParams
  const grandmaName = params.grandmaName ?? null
  const isSubscribeIntent = params.intent === 'subscribe'

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 space-y-2 text-center">
          {isSubscribeIntent && grandmaName ? (
            <>
              <h1 className="text-3xl font-semibold tracking-normal">Save your grandma name</h1>
              <p className="text-sm text-muted-foreground">
                Create an account and subscribe to save{' '}
                <span className="font-medium text-foreground">{grandmaName}</span> to your profile.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-semibold tracking-normal">Create your free account</h1>
              <p className="text-sm text-muted-foreground">
                Find your grandma name, browse gifts, and build a wishlist your family will love.
              </p>
            </>
          )}
        </div>
        <GrandmaSignupForm grandmaName={grandmaName} intent={isSubscribeIntent ? 'subscribe' : undefined} />
      </div>
    </main>
  )
}
