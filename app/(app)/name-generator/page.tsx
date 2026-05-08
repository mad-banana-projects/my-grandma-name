import { GeneratorForm } from '@/components/name-generator/generator-form'
import { createClient } from '@/lib/supabase/server'

export default async function NameGeneratorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isPaidGrandma = false
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role, subscription_status')
      .eq('id', user.id)
      .single()

    isPaidGrandma =
      profile?.role === 'grandma' && profile?.subscription_status === 'active'
  }

  return (
    <main className="bg-background px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Find your grandma name</h1>
          <p className="text-muted-foreground">
            Answer a few quick questions and we'll find the perfect name for your grandchildren to call you.
          </p>
        </div>
        <GeneratorForm isSignedIn={Boolean(user)} isPaidGrandma={isPaidGrandma} />
      </div>
    </main>
  )
}
