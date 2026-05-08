import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'

export default async function RegistryPage({
  params,
}: {
  params: Promise<{ grandmaId: string }>
}) {
  const { grandmaId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const service = createServiceClient()

  const { data: profile } = await service
    .from('grandma_profiles')
    .select('grandma_name, first_name, last_name')
    .eq('id', grandmaId)
    .single()

  if (!profile) redirect('/grandma-profile')

  return (
    <main className="bg-background px-4 py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">{profile.grandma_name}'s Registry</h1>
          <p className="text-sm text-muted-foreground">
            {profile.first_name} {profile.last_name}
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No gifts saved yet.
            </p>
            <a
              href="/browse-products"
              className="text-sm font-medium underline underline-offset-4"
            >
              Browse gift ideas →
            </a>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
